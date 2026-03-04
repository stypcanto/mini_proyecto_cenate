-- ============================================================
-- V6_26_0 - Normalizar PKs inconsistentes en tabla asegurados
-- ============================================================
-- Problema: 179 registros tienen pk_asegurado con UUID, sufijos
--   especiales (°, .) u otros valores que no coinciden con el
--   documento del paciente.
-- Formato correcto: doc_paciente || '-' || periodo
-- Impacto: dim_solicitud_bolsa (49), gestion_paciente (31),
--           atencion_clinica (29)
-- ============================================================

BEGIN;

-- Deshabilitar FK checks para poder actualizar PK + FKs en cualquier orden
SET session_replication_role = 'replica';

-- Tabla temporal con el mapeo old_pk → new_pk
CREATE TEMP TABLE pk_normalizacion AS
SELECT
    pk_asegurado AS old_pk,
    doc_paciente || '-' || COALESCE(periodo, '2026') AS new_pk,
    doc_paciente,
    periodo
FROM asegurados
WHERE vigencia = true
  AND pk_asegurado <> doc_paciente
  AND pk_asegurado <> doc_paciente || '-' || COALESCE(periodo, '')
  AND NOT EXISTS (
      SELECT 1 FROM asegurados a2
      WHERE a2.pk_asegurado = asegurados.doc_paciente || '-' || COALESCE(asegurados.periodo, '2026')
  );

-- 1. Actualizar el PK en asegurados primero
UPDATE asegurados a
SET pk_asegurado = m.new_pk
FROM pk_normalizacion m
WHERE a.pk_asegurado = m.old_pk;

-- 2. Actualizar referencias en dim_solicitud_bolsa
UPDATE dim_solicitud_bolsa dsb
SET paciente_id = m.new_pk
FROM pk_normalizacion m
WHERE dsb.paciente_id = m.old_pk;

-- 3. Actualizar referencias en gestion_paciente
UPDATE gestion_paciente gp
SET pk_asegurado = m.new_pk
FROM pk_normalizacion m
WHERE gp.pk_asegurado = m.old_pk;

-- 4. Actualizar referencias en atencion_clinica
UPDATE atencion_clinica ac
SET pk_asegurado = m.new_pk
FROM pk_normalizacion m
WHERE ac.pk_asegurado = m.old_pk;

-- 5. Actualizar referencias en paciente_estrategia
UPDATE paciente_estrategia pe
SET pk_asegurado = m.new_pk
FROM pk_normalizacion m
WHERE pe.pk_asegurado = m.old_pk;

-- 6. Actualizar referencias en asegurado_enfermedad_cronica
UPDATE asegurado_enfermedad_cronica aec
SET pk_asegurado = m.new_pk
FROM pk_normalizacion m
WHERE aec.pk_asegurado = m.old_pk;

-- Re-habilitar FK checks
SET session_replication_role = 'origin';

-- Log de resultados
DO $$
DECLARE v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM pk_normalizacion;
    RAISE NOTICE '✅ V6_26_0: % PKs de asegurados normalizados al formato doc-periodo', v_count;
END $$;

DROP TABLE pk_normalizacion;

COMMIT;
