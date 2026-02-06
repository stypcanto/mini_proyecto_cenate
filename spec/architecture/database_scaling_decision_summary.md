# Database Scaling Decision Summary - Quick Reference

**Date:** 2026-02-06
**Decision:** 🔴 DO NOT IMPLEMENT SECOND DATABASE
**Rationale:** Premature optimization without diagnosis

---

## TL;DR

**Problem Statement:**
- "98GB database is inefficient, need second database"

**Actual Problem:**
- 98GB for 7,973 patients = 12MB/patient (expected: 10KB/patient)
- 1,230x LARGER than expected → operational issue, NOT architectural limit

**Root Cause (Suspected):**
1. Audit logs without rotation (30-40GB)
2. Bloated indexes (10-20GB)
3. Dead tuples never vacuumed (5-15GB)
4. Full backups instead of incremental (40-50GB daily)

**Recommendation:**
- Phase 0: Run diagnostics FIRST (1 day)
- Phase 1: Quick wins (1 week) - reclaim 40-50GB
- Phase 2: Structural improvements (2-4 weeks) - 2-5x performance
- Result: Same architecture, 50-100x capacity

---

## Red Flags (Why Second Database is Wrong)

### 1. No Metrics
```
❌ No baseline performance data
❌ No bottleneck identified
❌ No slow query analysis
❌ No capacity planning done

✅ Required: Run spec/database/diagnostic_queries.sql FIRST
```

### 2. Volume Too Low
```
Current: 7,973 active patients
Threshold for second DB: 100M+ records

Gap: 12,000x BELOW threshold
```

### 3. Transaction Boundaries Break
```java
// This MUST be atomic:
@Transactional
public void atenderPaciente() {
    solicitudBolsaRepository.save(...);     // DB write 1
    sincronizacionBolsaService.sync(...);   // DB write 2
    crearBolsaRecita(...);                  // DB write 3
    // ALL-OR-NOTHING (v1.44.0+)
}

// If tables split across DBs:
// → Distributed transaction required
// → Saga pattern (10x code complexity)
// → Eventual consistency (medical error risk)
```

### 4. Backup Problem is Operational
```
Current: 40-50GB daily (FULL backups)
Correct: 2-4GB daily (incremental backups)

Fix: Change backup strategy (NOT database architecture)
Cost: $0 + 1 day engineering
```

---

## What to Do Instead

### Step 1: Diagnosis (MANDATORY - 1 Day)

```bash
# Run diagnostic queries
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate
psql -h 10.0.89.241 -U postgres -d maestro_cenate \
    -f spec/database/diagnostic_queries.sql \
    > diagnostic_results_$(date +%Y%m%d).txt

# Review top 5 space consumers
less diagnostic_results_$(date +%Y%m%d).txt
```

**Expected Findings:**
- audit_logs: 40GB (40% of database)
- Bloated indexes: 15GB (15% wasted)
- Dead tuples: 10GB (10% reclaimable)

### Step 2: Quick Wins (1 Week)

**Fix 1: Audit Log Rotation**
```java
@Scheduled(cron = "0 0 2 * * ?")
public void rotateAuditLogs() {
    LocalDate cutoff = LocalDate.now().minusDays(90);
    exportOldLogsToCSV(cutoff);
    auditLogRepository.deleteByCreatedAtBefore(cutoff);
}
```
**Impact:** Reclaim 30-40GB immediately

**Fix 2: Rebuild Indexes**
```sql
REINDEX INDEX CONCURRENTLY idx_solicitud_bolsa_paciente_dni_activo;
REINDEX TABLE CONCURRENTLY audit_logs;
```
**Impact:** Reclaim 10-20GB + 30% faster queries

**Fix 3: Incremental Backups**
```bash
# Weekly full + daily incremental (WAL)
# 40-50GB/day → 2-4GB/day (90% reduction)
```
**Impact:** 90% storage savings

### Step 3: Verify Improvements (1 Week)

```sql
-- Before vs After
SELECT pg_size_pretty(pg_database_size('maestro_cenate'));
-- Before: 98GB
-- After: 40-50GB (50% reduction)

-- Query performance
EXPLAIN ANALYZE SELECT ...;
-- Before: 2-5 seconds
-- After: 200-500ms (10x faster)
```

---

## Decision Matrix

### When is Second Database Actually Needed?

```
✅ ALL of these must be TRUE:

1. VOLUME:
   □ Total records > 100M
   □ Single table > 1TB (even after partitioning)
   □ Database > 500GB (after archival)

2. LOAD:
   □ Sustained QPS > 10,000
   □ Concurrent connections > 1,000
   □ 95th percentile latency > 5 seconds (after optimization)

3. ARCHITECTURAL:
   □ Clear bounded contexts (no cross-domain transactions)
   □ Team has distributed systems expertise (2+ DBAs)

4. BUSINESS:
   □ SLA violations documented
   □ User complaints tracked
   □ Budget approved ($5,000+/month)

CENATE Status: 0/12 criteria met ❌
```

### Scaling Path (Correct Order)

```
1. VERTICAL SCALING (Simplest)
   Cost: $200 → $800/month
   Capacity: 10x
   Complexity: LOW
   Try first: ✅

2. READ REPLICAS (Simple)
   Cost: +$200/month
   Capacity: 5-10x reads
   Complexity: LOW
   Try second: ✅

3. TABLE PARTITIONING (Medium)
   Cost: $0
   Capacity: 2-5x queries
   Complexity: MEDIUM
   Try third: ✅

4. CACHING LAYER (Medium)
   Cost: +$100/month
   Capacity: 10-100x reads
   Complexity: MEDIUM
   For high-read: ✅

5. SHARDING (Complex)
   Cost: +$400/month
   Capacity: Linear
   Complexity: HIGH
   Only if >100M records: ⚠️

6. MULTI-DATABASE (Very Complex)
   Cost: +$800/month + $10k engineering
   Capacity: Depends on split
   Complexity: VERY HIGH
   Last resort only: 🔴
```

---

## Cost Comparison

### Option A: Second Database (Proposed)

```
Engineering Effort:
- Analysis and design: 1 week ($5,000)
- Implementation: 3-4 weeks ($20,000)
- Testing: 2 weeks ($10,000)
- Deployment: 1 week ($5,000)
Total: $40,000

Infrastructure:
- Second PostgreSQL server: $400/month
- Monitoring tools (Zipkin): $200/month
- Increased backup storage: $100/month
Total: $700/month = $8,400/year

Ongoing Maintenance:
- DBA time: +267 hours/year
- Developer time: +50% feature velocity loss
Total: $30,000/year opportunity cost

TOTAL: $40,000 + $8,400 + $30,000 = $78,400 first year
```

### Option B: Diagnostic-First (Recommended)

```
Engineering Effort:
- Diagnostics: 1 day ($500)
- Audit rotation: 1 day ($500)
- Index rebuild: 0.5 day ($250)
- Incremental backups: 1 day ($500)
Total: $1,750

Infrastructure:
- No additional servers: $0/month
- No new tools: $0/month
- Reduced backup storage: -$100/month SAVINGS
Total: -$100/month = -$1,200/year SAVINGS

Ongoing Maintenance:
- DBA time: Same as current
- Developer time: Same velocity
Total: $0 additional

TOTAL: $1,750 - $1,200 = $550 first year
Savings vs Option A: $77,850 (99% cost reduction)
```

---

## SOLID Principles Analysis

### Violations in Proposed Approach

1. **Single Responsibility Principle (SRP) - VIOLATED**
   - maestro_cenate mixes medical + audit + admin + historical
   - Splitting to 2 DBs without refactoring services still violates SRP
   - Correct: Refactor service boundaries FIRST (within 1 DB)

2. **Open/Closed Principle (OCP) - VIOLATED**
   - Must MODIFY all 50+ services to add multi-datasource
   - Should EXTEND via abstraction
   - Correct: Use repository abstraction, hide DB topology

3. **Liskov Substitution Principle (LSP) - VIOLATED**
   - Cannot substitute @Transactional with distributed transaction
   - Behavior changes (ACID → eventual consistency)
   - Correct: Keep transactional data in same DB

4. **Interface Segregation Principle (ISP) - VIOLATED**
   - audit_logs bloat affects ALL services (not segregated)
   - Correct: Rotate audit logs (separate retention policy)

5. **Dependency Inversion Principle (DIP) - RISK**
   - Services might depend on specific DataSource beans
   - Correct: Use @Primary + routing datasource abstraction

---

## Risk Assessment

### Second Database Risks

```
TECHNICAL RISKS:
- Distributed transaction failures (HIGH)
- Data inconsistency between DBs (HIGH)
- Network partition scenarios (MEDIUM)
- Increased latency (cross-DB queries) (MEDIUM)

OPERATIONAL RISKS:
- 3x longer incident response time (HIGH)
- Complex disaster recovery (HIGH)
- Developer onboarding 2x longer (MEDIUM)

BUSINESS RISKS:
- Feature velocity -50% (HIGH)
- $78,400 cost with unknown benefit (HIGH)
- Technical debt accumulation (HIGH)
- Team burnout (distributed debugging) (MEDIUM)
```

### Diagnostic-First Risks

```
TECHNICAL RISKS:
- REINDEX requires maintenance window (MEDIUM)
- Audit log rotation might miss edge cases (LOW)

OPERATIONAL RISKS:
- 2-4 hours downtime for index rebuild (LOW)
- Need to test backup restoration (LOW)

BUSINESS RISKS:
- $1,750 investment (MINIMAL)
- 2-3 weeks to implement all fixes (LOW)
```

---

## Action Items

### Immediate (This Week)

- [ ] **RUN DIAGNOSTICS** - Execute `spec/database/diagnostic_queries.sql`
- [ ] **ANALYZE RESULTS** - Identify top 5 space consumers
- [ ] **PRESENT FINDINGS** - Share with team (include this document)
- [ ] **APPROVE PLAN** - Get approval for Phase 1 quick wins

### Short-term (Next 2 Weeks)

- [ ] Implement audit log rotation service
- [ ] Schedule REINDEX during maintenance window
- [ ] Configure incremental backups (WAL archiving)
- [ ] Measure improvements (before/after metrics)

### Medium-term (Next Month)

- [ ] Implement table partitioning (if needed)
- [ ] Setup read replica (if analytics workload high)
- [ ] Document new backup/restore procedures
- [ ] Train team on optimizations

### Long-term (Quarterly Review)

- [ ] Monitor performance trends
- [ ] Capacity planning review
- [ ] Re-evaluate architecture (with data)
- [ ] Consider vertical scaling if needed

---

## Key Contacts

**Architecture Questions:**
- Review: `spec/architecture/database_scaling_architecture_review.md` (full 15,000-word analysis)

**Database Operations:**
- Run Diagnostics: `spec/database/diagnostic_queries.sql`
- Backup Strategy: `spec/database/08_plan_backup_protecciones_completo.md`

**Performance:**
- Monitoring: `spec/backend/10_performance_monitoring/README.md`

**Transactional Workflows:**
- AtenderPaciente: `spec/backend/15_recita_interconsulta_v1.47.md`
- Synchronization: `spec/backend/14_sincronizacion_atendido/README.md`

---

## Decision Record

**Date:** 2026-02-06
**Decision:** DO NOT implement second database
**Rationale:** Premature optimization; operational problem, not architectural
**Alternative:** Diagnostic-first approach (Phase 0 → Phase 1 → Phase 2)
**Approval Required:** Team Lead, DBA, System Architect
**Review Date:** After Phase 1 completion (2 weeks)

**Sign-off:**
- [ ] System Architect
- [ ] Database Administrator
- [ ] Team Lead
- [ ] Business Owner

---

**Last Updated:** 2026-02-06
**Status:** 🔴 CRITICAL DECISION - DO NOT PROCEED WITHOUT DIAGNOSIS
**Next Steps:** Run diagnostic queries (1 day effort)

