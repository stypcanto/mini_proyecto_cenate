-- Script: Normalizar DNIs en tabla asegurados
-- Descripción: Convierte DNIs sin ceros a la izquierda a formato 8 dígitos
-- Ejecutado: 2026-01-29
-- Resultados:
--   - 477,069 registros duplicados consolidados y eliminados
--   - 922,551 DNIs normalizados (7 dígitos → 8 dígitos)
--   - Total final: 4,688,030 asegurados

BEGIN TRANSACTION;

-- PASO 1: Encontrar duplicados (DNI que existe en múltiples registros)
CREATE TEMP TABLE consolidacion AS
WITH duplicated_dnis AS (
  SELECT LPAD(doc_paciente, 8, '0') as dni_norm
  FROM asegurados
  WHERE doc_paciente ~ '^[0-9]+$'
  GROUP BY LPAD(doc_paciente, 8, '0')
  HAVING COUNT(*) > 1
),
dni_with_keep_id AS (
  SELECT
    LPAD(a.doc_paciente, 8, '0') as dni_norm,
    a.pk_asegurado,
    ROW_NUMBER() OVER (PARTITION BY LPAD(a.doc_paciente, 8, '0') ORDER BY LENGTH(a.doc_paciente) DESC, a.pk_asegurado) as rn
  FROM asegurados a
  INNER JOIN duplicated_dnis dd ON LPAD(a.doc_paciente, 8, '0') = dd.dni_norm
)
SELECT
  dni_norm,
  MAX(CASE WHEN rn = 1 THEN pk_asegurado END) as keep_id,
  pk_asegurado as remove_id
FROM dni_with_keep_id
WHERE rn > 1
GROUP BY dni_norm, pk_asegurado;

-- PASO 2: Actualizar referencias antes de eliminar duplicados
-- Tabla: atencion_clinica (FK: pk_asegurado → asegurados.pk_asegurado)
UPDATE atencion_clinica ac
SET pk_asegurado = c.keep_id
FROM consolidacion c
WHERE ac.pk_asegurado = c.remove_id;

-- Tabla: audit_correccion_dni (FK: pk_asegurado → asegurados.pk_asegurado)
UPDATE audit_correccion_dni acd
SET pk_asegurado = c.keep_id
FROM consolidacion c
WHERE acd.pk_asegurado = c.remove_id;

-- Tabla: dim_solicitud_bolsa (FK: paciente_id → asegurados.pk_asegurado, UPDATE CASCADE)
UPDATE dim_solicitud_bolsa dsb
SET paciente_id = c.keep_id
FROM consolidacion c
WHERE dsb.paciente_id = c.remove_id;

-- Tabla: gestion_paciente (FK: pk_asegurado → asegurados.pk_asegurado)
UPDATE gestion_paciente gp
SET pk_asegurado = c.keep_id
FROM consolidacion c
WHERE gp.pk_asegurado = c.remove_id;

-- Tabla: paciente_estrategia (FK: pk_asegurado → asegurados.pk_asegurado)
UPDATE paciente_estrategia pe
SET pk_asegurado = c.keep_id
FROM consolidacion c
WHERE pe.pk_asegurado = c.remove_id;

-- PASO 3: Eliminar registros duplicados de asegurados
DELETE FROM asegurados
WHERE pk_asegurado IN (SELECT DISTINCT remove_id FROM consolidacion);

-- PASO 4: Normalizar todos los DNIs de 7 dígitos con LPAD
UPDATE asegurados
SET doc_paciente = LPAD(doc_paciente, 8, '0'),
    pk_asegurado = LPAD(pk_asegurado, 8, '0')
WHERE LENGTH(doc_paciente) = 7
  AND doc_paciente ~ '^[0-9]+$';

COMMIT;

-- Verificación
SELECT 'Verificación post-normalización:' as titulo;
SELECT
  'Registros con 7 dígitos (debe ser 0):' as metric,
  COUNT(*) as valor
FROM asegurados
WHERE LENGTH(doc_paciente) = 7 AND doc_paciente ~ '^[0-9]+$';

SELECT
  'Registros con 8 dígitos normalizados:' as metric,
  COUNT(*) as valor
FROM asegurados
WHERE LENGTH(doc_paciente) = 8 AND pk_asegurado LIKE '0%';
