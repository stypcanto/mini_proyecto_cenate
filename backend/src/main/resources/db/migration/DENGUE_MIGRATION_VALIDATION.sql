-- ============================================================================
-- VALIDACIÓN DE MIGRACIÓN DENGUE
-- Script para verificar que la migración se ejecutó correctamente
-- Ejecutar DESPUÉS de V2026_01_29_000001__add_dengue_fields.sql
-- ============================================================================

-- ============================================================================
-- 1️⃣ VERIFICAR EXISTENCIA DE COLUMNAS
-- ============================================================================

SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
  AND column_name IN ('cenasicod', 'dx_main', 'fecha_sintomas', 'semana_epidem')
ORDER BY ordinal_position;

-- Resultado esperado: 4 filas
-- ├── cenasicod | integer | YES | null
-- ├── dx_main | character varying | YES | null
-- ├── fecha_sintomas | date | YES | null
-- └── semana_epidem | character varying | YES | null

-- ============================================================================
-- 2️⃣ VERIFICAR EXISTENCIA DE ÍNDICES
-- ============================================================================

SELECT
  indexname,
  tablename,
  indexdef
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
  AND indexname LIKE 'idx_dengue%'
ORDER BY indexname;

-- Resultado esperado: 3 índices
-- ├── idx_dengue_cenasicod
-- ├── idx_dengue_dedup
-- └── idx_dengue_search

-- ============================================================================
-- 3️⃣ CONTAR REGISTROS EN dim_solicitud_bolsa
-- ============================================================================

SELECT COUNT(*) as total_registros FROM dim_solicitud_bolsa;

-- Resultado esperado: X registros (no debe cambiar con la migración)

-- ============================================================================
-- 4️⃣ VERIFICAR VALORES NULL (columnas nuevas)
-- ============================================================================

SELECT
  COUNT(CASE WHEN cenasicod IS NOT NULL THEN 1 END) as con_cenasicod,
  COUNT(CASE WHEN dx_main IS NOT NULL THEN 1 END) as con_dx_main,
  COUNT(CASE WHEN fecha_sintomas IS NOT NULL THEN 1 END) as con_sintomas,
  COUNT(CASE WHEN semana_epidem IS NOT NULL THEN 1 END) as con_semana
FROM dim_solicitud_bolsa;

-- Resultado esperado: todos en 0 (columnas nuevas están vacías)

-- ============================================================================
-- 5️⃣ VERIFICAR ÚNICA CONSTRAINT (deduplicación)
-- ============================================================================

SELECT
  constraint_name,
  constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'dim_solicitud_bolsa'
  AND constraint_name LIKE 'idx_dengue_dedup%';

-- Resultado esperado: idx_dengue_dedup (UNIQUE)

-- ============================================================================
-- 6️⃣ TEST: Insertar registro de prueba
-- ============================================================================

-- Este INSERT de prueba verificará que todo funciona:
-- (Comentado por defecto - descomentar para test)

/*
BEGIN;

INSERT INTO dim_solicitud_bolsa (
  numero_solicitud,
  paciente_dni,
  paciente_nombre,
  paciente_sexo,
  id_bolsa,
  cod_tipo_bolsa,
  estado,
  activo,
  cenasicod,
  dx_main,
  fecha_sintomas,
  semana_epidem,
  fecha_atencion
) VALUES (
  'TEST-DENGUE-001',
  '00123456',
  'PACIENTE PRUEBA',
  'M',
  2,
  'BOLSA_DENGUE',
  'PENDIENTE',
  true,
  292,
  'A97.0',
  '2026-01-27',
  '2026SE04',
  '2026-01-29'
);

-- Verificar inserción
SELECT * FROM dim_solicitud_bolsa WHERE numero_solicitud = 'TEST-DENGUE-001';

-- Limpiar
DELETE FROM dim_solicitud_bolsa WHERE numero_solicitud = 'TEST-DENGUE-001';

COMMIT;
*/

-- ============================================================================
-- ✅ FIN DE VALIDACIÓN
-- ============================================================================
--
-- Si todos los checks pasan, la migración fue exitosa.
-- Si alguno falla, verifique los errores en los logs de Flyway/Liquibase.
--
-- ============================================================================
