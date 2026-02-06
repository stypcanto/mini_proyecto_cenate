-- ========================================
-- CENATE DATABASE DIAGNOSTIC QUERIES
-- Purpose: Identify root cause of "98GB inefficiency"
-- Date: 2026-02-06
-- Version: 1.0
-- ========================================

-- ========================================
-- SECTION 1: DATABASE SIZE BREAKDOWN
-- ========================================

-- Query 1.1: Total database size
SELECT
    pg_database.datname AS database_name,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE pg_database.datname = 'maestro_cenate';

-- Query 1.2: Size by table (TOP 20)
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size,
    pg_total_relation_size(schemaname||'.'||tablename) AS size_bytes
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY size_bytes DESC
LIMIT 20;

-- Query 1.3: Row counts for major tables
SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    CASE
        WHEN n_live_tup > 0 THEN
            pg_size_pretty((pg_total_relation_size(schemaname||'.'||tablename) / n_live_tup)::bigint)
        ELSE '0 bytes'
    END AS avg_row_size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- ========================================
-- SECTION 2: AUDIT LOG ANALYSIS
-- ========================================

-- Query 2.1: Audit tables size and row counts
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size,
    (SELECT COUNT(*) FROM audit_logs) AS row_count_audit_logs,
    (SELECT COUNT(*) FROM email_audit_log) AS row_count_email_audit_log
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'audit%'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- Query 2.2: Audit logs date range (oldest/newest)
SELECT
    'audit_logs' AS table_name,
    MIN(created_at) AS oldest_record,
    MAX(created_at) AS newest_record,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 year') AS records_older_than_1_year,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '6 months') AS records_older_than_6_months
FROM audit_logs
UNION ALL
SELECT
    'email_audit_log' AS table_name,
    MIN(enviado_at) AS oldest_record,
    MAX(enviado_at) AS newest_record,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE enviado_at < NOW() - INTERVAL '1 year') AS records_older_than_1_year,
    COUNT(*) FILTER (WHERE enviado_at < NOW() - INTERVAL '6 months') AS records_older_than_6_months
FROM email_audit_log;

-- Query 2.3: Audit logs size by time period
SELECT
    DATE_TRUNC('month', created_at) AS month,
    COUNT(*) AS records_per_month,
    pg_size_pretty(SUM(LENGTH(detalles::TEXT))::bigint) AS estimated_size
FROM audit_logs
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC
LIMIT 12;

-- ========================================
-- SECTION 3: INDEX ANALYSIS
-- ========================================

-- Query 3.1: Total index size vs table size
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size,
    ROUND(
        (pg_indexes_size(schemaname||'.'||tablename)::numeric /
         NULLIF(pg_relation_size(schemaname||'.'||tablename), 0) * 100)::numeric, 2
    ) AS index_ratio_percent
FROM pg_tables
WHERE schemaname = 'public'
  AND pg_relation_size(schemaname||'.'||tablename) > 0
ORDER BY pg_indexes_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Query 3.2: Unused or rarely used indexes
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
  AND idx_scan < 100  -- Rarely used
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- Query 3.3: Bloated indexes (need REINDEX)
SELECT
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size,
    CASE
        WHEN pg_relation_size(indexrelid) > 1073741824 THEN 'CRITICAL: > 1GB'
        WHEN pg_relation_size(indexrelid) > 104857600 THEN 'WARNING: > 100MB'
        ELSE 'OK'
    END AS bloat_status
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;

-- ========================================
-- SECTION 4: HISTORICAL DATA ANALYSIS
-- ========================================

-- Query 4.1: dim_solicitud_bolsa historical data
SELECT
    estado,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 year') AS older_than_1_year,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '6 months') AS older_than_6_months,
    COUNT(*) FILTER (WHERE estado IN ('ATENDIDO', 'CANCELADO', 'NO_ASISTIO')) AS archivable_records
FROM dim_solicitud_bolsa
GROUP BY estado
ORDER BY total_records DESC;

-- Query 4.2: solicitud_cita historical data
SELECT
    estado,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE fecha_cita < NOW() - INTERVAL '1 year') AS older_than_1_year,
    COUNT(*) FILTER (WHERE fecha_cita < NOW() - INTERVAL '6 months') AS older_than_6_months
FROM solicitud_cita
GROUP BY estado
ORDER BY total_records DESC;

-- Query 4.3: receta and interconsulta historical data
SELECT
    'receta' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 year') AS older_than_1_year,
    pg_size_pretty(pg_total_relation_size('public.receta')) AS table_size
FROM receta
UNION ALL
SELECT
    'interconsulta' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 year') AS older_than_1_year,
    pg_size_pretty(pg_total_relation_size('public.interconsulta')) AS table_size
FROM interconsulta;

-- ========================================
-- SECTION 5: BLOB/DOCUMENT STORAGE
-- ========================================

-- Query 5.1: Check for BLOB columns (bytea, text with large data)
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
      data_type IN ('bytea', 'text', 'json', 'jsonb')
      OR character_maximum_length > 10000
  )
ORDER BY table_name, column_name;

-- Query 5.2: Estimate size of large text/json columns
-- (Run manually for specific tables if Query 5.1 finds candidates)
-- Example:
-- SELECT
--     COUNT(*) AS total_records,
--     pg_size_pretty(SUM(LENGTH(large_column))::bigint) AS estimated_column_size
-- FROM table_name
-- WHERE large_column IS NOT NULL;

-- ========================================
-- SECTION 6: FRAGMENTATION ANALYSIS
-- ========================================

-- Query 6.1: Table bloat estimation
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    n_live_tup AS live_tuples,
    n_dead_tup AS dead_tuples,
    ROUND((n_dead_tup::numeric / NULLIF(n_live_tup, 0) * 100)::numeric, 2) AS dead_tuple_ratio_percent,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_live_tup > 0
ORDER BY n_dead_tup DESC
LIMIT 20;

-- Query 6.2: Recommend VACUUM FULL candidates
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_dead_tup AS dead_tuples,
    CASE
        WHEN n_dead_tup > 100000 THEN 'CRITICAL: Run VACUUM FULL'
        WHEN n_dead_tup > 10000 THEN 'WARNING: Consider VACUUM'
        ELSE 'OK'
    END AS recommendation
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND n_dead_tup > 1000
ORDER BY n_dead_tup DESC;

-- ========================================
-- SECTION 7: BACKUP STRATEGY ANALYSIS
-- ========================================

-- Query 7.1: Current backup stats (if pg_dump metadata available)
-- Note: This queries the backup files size, not DB metadata
-- Must be run on server where backups are stored

-- Query 7.2: Incremental backup candidates (tables that change frequently)
SELECT
    schemaname,
    tablename,
    n_tup_ins AS inserts_since_last_stats,
    n_tup_upd AS updates_since_last_stats,
    n_tup_del AS deletes_since_last_stats,
    (n_tup_ins + n_tup_upd + n_tup_del) AS total_changes,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
ORDER BY (n_tup_ins + n_tup_upd + n_tup_del) DESC
LIMIT 20;

-- ========================================
-- SECTION 8: PERFORMANCE BOTTLENECK QUERIES
-- ========================================

-- Query 8.1: Slowest queries (if pg_stat_statements enabled)
-- Requires: CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
SELECT
    query,
    calls,
    total_exec_time / 1000 AS total_exec_time_seconds,
    mean_exec_time / 1000 AS mean_exec_time_seconds,
    stddev_exec_time / 1000 AS stddev_exec_time_seconds,
    rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;

-- Query 8.2: Missing indexes (tables with many sequential scans)
SELECT
    schemaname,
    tablename,
    seq_scan AS sequential_scans,
    seq_tup_read AS tuples_read_sequentially,
    idx_scan AS index_scans,
    ROUND((seq_scan::numeric / NULLIF(idx_scan, 0))::numeric, 2) AS seq_to_index_ratio,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_stat_user_tables
WHERE schemaname = 'public'
  AND seq_scan > 1000
  AND pg_total_relation_size(schemaname||'.'||tablename) > 10485760  -- > 10MB
ORDER BY seq_scan DESC
LIMIT 20;

-- Query 8.3: Lock contention (active locks)
SELECT
    pg_stat_activity.pid,
    pg_stat_activity.usename,
    pg_stat_activity.state,
    pg_stat_activity.query,
    pg_locks.locktype,
    pg_locks.mode,
    pg_locks.granted
FROM pg_stat_activity
JOIN pg_locks ON pg_stat_activity.pid = pg_locks.pid
WHERE pg_stat_activity.state = 'active'
  AND pg_locks.granted = false
ORDER BY pg_stat_activity.query_start;

-- ========================================
-- SECTION 9: RECOMMENDATIONS SUMMARY
-- ========================================

-- Query 9.1: Quick summary for decision making
SELECT
    'Total Database Size' AS metric,
    pg_size_pretty(pg_database_size('maestro_cenate')) AS value
UNION ALL
SELECT
    'Total Tables',
    COUNT(*)::text
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Largest Table',
    (SELECT tablename FROM pg_tables
     WHERE schemaname = 'public'
     ORDER BY pg_total_relation_size('public.'||tablename) DESC LIMIT 1)
UNION ALL
SELECT
    'Largest Table Size',
    (SELECT pg_size_pretty(pg_total_relation_size('public.'||tablename))
     FROM pg_tables
     WHERE schemaname = 'public'
     ORDER BY pg_total_relation_size('public.'||tablename) DESC LIMIT 1)
UNION ALL
SELECT
    'Total Audit Logs',
    (SELECT COUNT(*)::text FROM audit_logs)
UNION ALL
SELECT
    'Audit Logs Size',
    (SELECT pg_size_pretty(pg_total_relation_size('public.audit_logs')))
UNION ALL
SELECT
    'Total Email Audit Logs',
    (SELECT COUNT(*)::text FROM email_audit_log)
UNION ALL
SELECT
    'Email Audit Logs Size',
    (SELECT pg_size_pretty(pg_total_relation_size('public.email_audit_log')))
UNION ALL
SELECT
    'Total Indexes Size',
    pg_size_pretty(SUM(pg_indexes_size('public.'||tablename))::bigint)
FROM pg_tables
WHERE schemaname = 'public'
UNION ALL
SELECT
    'Dead Tuples (Total)',
    SUM(n_dead_tup)::text
FROM pg_stat_user_tables
WHERE schemaname = 'public';

-- ========================================
-- EXECUTION INSTRUCTIONS
-- ========================================

-- To run this file:
-- 1. Connect to database:
--    psql -h 10.0.89.241 -U postgres -d maestro_cenate -f diagnostic_queries.sql
--
-- 2. Or run interactively:
--    psql -h 10.0.89.241 -U postgres -d maestro_cenate
--    \i /path/to/diagnostic_queries.sql
--
-- 3. Save output to file:
--    psql -h 10.0.89.241 -U postgres -d maestro_cenate -f diagnostic_queries.sql > diagnostic_results.txt
--
-- 4. For specific section only:
--    Copy/paste individual queries into psql session

-- ========================================
-- EXPECTED FINDINGS
-- ========================================

-- Common inefficiency causes:
-- 1. AUDIT LOGS: audit_logs/email_audit_log tables grow indefinitely
--    -> Solution: Implement log rotation/archiving (30-90 days retention)
--
-- 2. INDEXES: Bloated or unused indexes consuming space
--    -> Solution: REINDEX + drop unused indexes
--
-- 3. DEAD TUPLES: Tables not vacuumed regularly
--    -> Solution: VACUUM FULL + adjust autovacuum settings
--
-- 4. HISTORICAL DATA: Old solicitud_cita/dim_solicitud_bolsa records
--    -> Solution: Archive records older than 1 year to separate table
--
-- 5. BLOBS: Documents/PDFs stored in database
--    -> Solution: Move to S3/external storage, keep only references
--
-- 6. BACKUP STRATEGY: Full backups instead of incremental
--    -> Solution: Implement pg_basebackup + WAL archiving

-- ========================================
-- DECISION MATRIX
-- ========================================

-- IF audit_logs > 50GB:
--   ACTION: Implement log rotation (NOT second database)
--
-- IF indexes_size > table_size:
--   ACTION: Drop unused indexes + REINDEX (NOT second database)
--
-- IF dead_tuples > 10% of live_tuples:
--   ACTION: Run VACUUM FULL (NOT second database)
--
-- IF historical_data > 50% of total:
--   ACTION: Archive old data (NOT second database)
--
-- IF largest_table < 20GB AND total_db = 98GB:
--   ACTION: Investigate fragmentation/indexes (NOT second database)
--
-- ONLY IF:
--   - Single table > 50GB AND optimized
--   - Sustained high concurrent load (1000+ QPS)
--   - Clear read/write separation pattern
--   THEN: Consider read replicas or sharding

-- ========================================
-- END OF DIAGNOSTIC QUERIES
-- ========================================
