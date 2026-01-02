-- ============================================================================
-- Script: 018_limpiar_datos_bolsa_107.sql
-- Descripción: Eliminar todos los datos de Bolsa 107 para poder recargar
-- Autor: Ing. Styp Canto Rondón
-- Fecha: 2026-01-02
-- Versión: v1.15.2
-- ============================================================================

-- IMPORTANTE: Este script elimina TODOS los datos de las tablas de Bolsa 107
-- Úsalo solo cuando necesites hacer una carga desde cero.

\echo '============================================'
\echo 'LIMPIEZA DE DATOS - BOLSA 107'
\echo '============================================'

-- 1. Mostrar estado actual
\echo ''
\echo '📊 Estado actual de las tablas:'
SELECT 'bolsa_107_carga' AS tabla, COUNT(*) AS registros FROM bolsa_107_carga
UNION ALL
SELECT 'bolsa_107_item', COUNT(*) FROM bolsa_107_item
UNION ALL
SELECT 'bolsa_107_error', COUNT(*) FROM bolsa_107_error
UNION ALL
SELECT 'staging.bolsa_107_raw', COUNT(*) FROM staging.bolsa_107_raw;

\echo ''
\echo '⚠️  Iniciando limpieza...'
\echo ''

-- 2. Eliminar en orden (respetando foreign keys)
-- Primero los detalles (items y errores)
DELETE FROM bolsa_107_error;
DELETE FROM bolsa_107_item;

-- Luego la tabla staging
DELETE FROM staging.bolsa_107_raw;

-- Finalmente las cabeceras
DELETE FROM bolsa_107_carga;

-- 3. Reiniciar secuencias (opcional - para que IDs comiencen en 1)
ALTER SEQUENCE bolsa_107_carga_id_carga_seq RESTART WITH 1;
ALTER SEQUENCE bolsa_107_item_id_item_seq RESTART WITH 1;
ALTER SEQUENCE bolsa_107_error_id_error_seq RESTART WITH 1;

\echo ''
\echo '✅ Limpieza completada'
\echo ''

-- 4. Verificar que todo esté vacío
\echo '📊 Estado después de la limpieza:'
SELECT 'bolsa_107_carga' AS tabla, COUNT(*) AS registros FROM bolsa_107_carga
UNION ALL
SELECT 'bolsa_107_item', COUNT(*) FROM bolsa_107_item
UNION ALL
SELECT 'bolsa_107_error', COUNT(*) FROM bolsa_107_error
UNION ALL
SELECT 'staging.bolsa_107_raw', COUNT(*) FROM staging.bolsa_107_raw;

\echo ''
\echo '============================================'
\echo 'TABLAS LISTAS PARA NUEVA CARGA'
\echo '============================================'
\echo ''
\echo '📁 Ahora puedes cargar un nuevo archivo Excel desde:'
\echo '   /roles/coordcitas/107 (Carga de Pacientes 107)'
\echo ''
