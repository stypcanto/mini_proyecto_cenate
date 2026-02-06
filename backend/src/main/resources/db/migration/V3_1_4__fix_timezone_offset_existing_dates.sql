-- ============================================================================
-- V3.1.4: Corregir zona horaria en fechas existentes
-- ============================================================================
-- Propósito: Restar 5 horas a fechas existentes que fueron guardadas sin offset
--            Convertir de UTC a hora local Peru (UTC-5)
--
-- Tabla: dim_solicitud_bolsa
-- Versión: v1.47.0
-- Fecha: 2026-02-06
-- ============================================================================

-- ✅ Actualizar fechas de asignación existentes (restar 5 horas)
UPDATE dim_solicitud_bolsa
SET fecha_asignacion = fecha_asignacion - INTERVAL '5 hours'
WHERE fecha_asignacion IS NOT NULL;

-- ✅ Actualizar fechas de atención médica existentes (restar 5 horas)
UPDATE dim_solicitud_bolsa
SET fecha_atencion_medica = fecha_atencion_medica - INTERVAL '5 hours'
WHERE fecha_atencion_medica IS NOT NULL;

-- Log de confirmación
-- Nota: Las fechas ahora están en la zona horaria correcta de Peru (UTC-5)
-- Ejemplo: 2026-02-06T10:58:54+0000 → 2026-02-06T05:58:54-05:00
