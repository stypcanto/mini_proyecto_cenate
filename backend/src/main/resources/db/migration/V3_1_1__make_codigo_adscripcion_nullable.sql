-- ============================================================================
-- v1.46.4: Permitir NULL en codigo_adscripcion para importación de pacientes sin IPRESS
-- ============================================================================
-- Problema: Al importar pacientes sin IPRESS asignada, fallaba por FK constraint
-- Solución: Hacer nullable la columna codigo_adscripcion en dim_solicitud_bolsa

ALTER TABLE dim_solicitud_bolsa
  ALTER COLUMN codigo_adscripcion DROP NOT NULL;

-- Registrar cambio en log
INSERT INTO audit_log (accion, tabla, descripcion, fecha_cambio)
VALUES ('ALTER', 'dim_solicitud_bolsa', 'Cambiar codigo_adscripcion a nullable (v1.46.4)', NOW());
