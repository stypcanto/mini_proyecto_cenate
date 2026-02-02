-- ========================================================================
-- SCRIPT DE MIGRACIÓN: Reemplazar N/A por "Voluntaria" en TIPO DE CITA
-- ========================================================================
-- Versión: 1.42.1
-- Fecha: 2026-02-01
-- Tabla: dim_solicitud_bolsa
-- Registros afectados: 6,404
--
-- Problema: Columna tipo_cita tenía valores "N/A" que debían ser "Voluntaria"
-- Solución: UPDATE masivo para estandarizar los datos
-- ========================================================================

BEGIN;

-- 1. Verificar estado antes de la migración
SELECT COUNT(*) as registros_na_antes
FROM dim_solicitud_bolsa
WHERE tipo_cita = 'N/A' OR tipo_cita IS NULL;

-- 2. Actualizar todos los N/A a Voluntaria
UPDATE dim_solicitud_bolsa
SET tipo_cita = 'Voluntaria',
    fecha_actualizacion = NOW()
WHERE tipo_cita = 'N/A' OR tipo_cita IS NULL;

-- 3. Verificar estado después de la migración
SELECT COUNT(*) as registros_voluntaria_despues
FROM dim_solicitud_bolsa
WHERE tipo_cita = 'Voluntaria';

-- 4. Mostrar distribución de tipos de cita
SELECT tipo_cita, COUNT(*) as cantidad
FROM dim_solicitud_bolsa
GROUP BY tipo_cita
ORDER BY cantidad DESC;

COMMIT;

-- ========================================================================
-- Resultado esperado:
-- - registros_na_antes: 6404
-- - registros_voluntaria_despues: 7141+
-- ========================================================================
