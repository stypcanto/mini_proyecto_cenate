-- ============================================================================
-- Script: Optimización de índices para sincronización automática
-- Módulo: Sincronización de Estados ATENDIDO (v1.43.0)
-- Fecha: 2026-02-05
-- Descripción:
--   Crear índice optimizado para búsqueda rápida de pacientes en dim_solicitud_bolsa
--   por DNI. Este índice se utiliza en la sincronización automática de estados
--   cuando el médico marca una cita como ATENDIDO en solicitud_cita.
-- ============================================================================

-- 1. Crear índice optimizado para búsqueda por DNI + estado activo
-- Este es el índice más crítico para la sincronización
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_paciente_dni_activo
ON dim_solicitud_bolsa (paciente_dni, activo)
WHERE activo = true;

-- 2. Analizar tabla para actualizar estadísticas del query planner
ANALYZE dim_solicitud_bolsa;

-- 3. Verificar que el índice fue creado correctamente
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
  AND indexname = 'idx_solicitud_bolsa_paciente_dni_activo';

-- 4. Verificar que existe el estado ATENDIDO_IPRESS en dim_estados_gestion_citas
-- Este es el estado objetivo de la sincronización
SELECT id_estado_cita, cod_estado_cita, desc_estado_cita, stat_estado_cita
FROM dim_estados_gestion_citas
WHERE id_estado_cita = 2 OR cod_estado_cita = 'ATENDIDO_IPRESS';

-- Resultado esperado:
-- id_estado_cita | cod_estado_cita | desc_estado_cita                | stat_estado_cita
-- 2              | ATENDIDO_IPRESS | Atendido por IPRESS             | A

-- ============================================================================
-- Verificación POST-IMPLEMENTACIÓN
-- Ejecutar esta query después de implementar para verificar sincronizaciones
-- ============================================================================

-- Ver últimas 10 sincronizaciones exitosas
SELECT
    sc.id_solicitud AS cita_id,
    sc.doc_paciente AS dni,
    sc.id_estado_cita AS estado_cita,
    sc.fecha_cita,
    sc.hora_cita,
    sb.id_solicitud AS bolsa_id,
    sb.estado_gestion_citas_id AS estado_bolsa,
    sb.fecha_atencion,
    sb.hora_atencion,
    sb.fecha_cambio_estado,
    CASE
        WHEN sc.id_estado_cita = 4 AND sb.estado_gestion_citas_id = 2
        THEN '✅ SINCRONIZADO'
        WHEN sc.id_estado_cita = 4 AND sb.estado_gestion_citas_id != 2
        THEN '⚠️  NO SINCRONIZADO'
        ELSE 'N/A'
    END AS estado_sincronizacion
FROM solicitud_cita sc
LEFT JOIN dim_solicitud_bolsa sb
    ON sc.doc_paciente = sb.paciente_dni AND sb.activo = true
WHERE sc.id_estado_cita = 4
  AND sc.fecha_actualiza >= NOW() - INTERVAL '7 days'
ORDER BY sc.fecha_actualiza DESC
LIMIT 10;
