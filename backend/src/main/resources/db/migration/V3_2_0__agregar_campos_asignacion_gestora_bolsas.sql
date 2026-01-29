-- ============================================================================
-- Migration V3.2.0: Agregar Campos de Asignación de Gestora a Bolsas
-- ============================================================================
-- Descripción:
--   Agrega campos responsable_gestora_id y fecha_asignacion a tabla dim_solicitud_bolsa
--   para permitir que un COORDINADOR_DE_CITAS asigne solicitudes a GESTORES_DE_CITAS
--
-- Módulo: Bolsas de Pacientes v2.4.0
-- Fecha: 2026-01-29
-- Autor: Arquitectura CENATE
-- ============================================================================

-- ============================================================================
-- 1. Agregar columnas a dim_solicitud_bolsa
-- ============================================================================

ALTER TABLE dim_solicitud_bolsa
ADD COLUMN responsable_gestora_id BIGINT NULL,
ADD COLUMN fecha_asignacion TIMESTAMP WITH TIME ZONE NULL;

-- Comentarios descriptivos
COMMENT ON COLUMN dim_solicitud_bolsa.responsable_gestora_id IS
'FK - Usuario con rol GESTOR_DE_CITAS asignado para gestionar esta solicitud de bolsa.
Permite rastrear quién es responsable de captar y atender al paciente.
NULL indica que la solicitud aún no ha sido asignada.';

COMMENT ON COLUMN dim_solicitud_bolsa.fecha_asignacion IS
'Timestamp con zona horaria de cuándo se asignó la gestora a esta solicitud.
Se actualiza cada vez que se reasigna a una gestora diferente.
NULL si nunca ha sido asignada.';

-- ============================================================================
-- 2. Crear Foreign Key
-- ============================================================================

ALTER TABLE dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_gestora
FOREIGN KEY (responsable_gestora_id)
REFERENCES dim_usuarios(id_user)
ON DELETE SET NULL
ON UPDATE CASCADE;

COMMENT ON CONSTRAINT fk_solicitud_bolsa_gestora ON dim_solicitud_bolsa IS
'Referencia a dim_usuarios.id_user. Permite rastrear la gestora asignada.
ON DELETE SET NULL: Si se elimina el usuario, la solicitud queda sin asignar (permite operaciones administrativas).
ON UPDATE CASCADE: Si cambia el ID del usuario, se actualiza automáticamente.';

-- ============================================================================
-- 3. Crear Índices
-- ============================================================================

-- Índice para búsquedas por gestora asignada
CREATE INDEX idx_solicitud_bolsa_gestora
ON dim_solicitud_bolsa(responsable_gestora_id)
WHERE activo = true;

COMMENT ON INDEX idx_solicitud_bolsa_gestora IS
'Índice para acelerar búsquedas de solicitudes asignadas a una gestora específica.
Filtrado por activo=true para mejorar selectividad.
Usado en queries: SELECT * FROM dim_solicitud_bolsa WHERE responsable_gestora_id = ? AND activo = true';

-- Índice por fecha de asignación (para análisis de tiempos)
CREATE INDEX idx_solicitud_bolsa_fecha_asignacion
ON dim_solicitud_bolsa(fecha_asignacion DESC NULLS LAST)
WHERE activo = true;

COMMENT ON INDEX idx_solicitud_bolsa_fecha_asignacion IS
'Índice para búsquedas por rango de fecha de asignación (análisis de tiempos de gestión).
Orden DESC NULLS LAST para obtener asignaciones recientes primero.
Usado en reportes de carga de trabajo histórica.';

-- ============================================================================
-- 4. Actualizar estadísticas
-- ============================================================================

-- Ejecutar ANALYZE para actualizar statistics del planner
ANALYZE dim_solicitud_bolsa;

-- ============================================================================
-- 5. Logs de Auditoría (información de la migración)
-- ============================================================================

-- Registrar la ejecución de la migración
INSERT INTO dim_auditoria_migraciones (
    numero_migracion,
    descripcion,
    fecha_ejecucion,
    estado,
    detalles
)
VALUES (
    'V3_2_0',
    'Agregar campos de asignación de gestora a dim_solicitud_bolsa',
    NOW(),
    'COMPLETADO',
    'Agregadas columnas: responsable_gestora_id, fecha_asignacion. FK a dim_usuarios. 2 índices creados.'
)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
-- Cambios realizados:
-- ✅ +2 columnas (responsable_gestora_id, fecha_asignacion)
-- ✅ +1 Foreign Key (fk_solicitud_bolsa_gestora)
-- ✅ +2 Índices (por gestora, por fecha)
-- ✅ Comentarios descriptivos agregados
--
-- Impacto:
-- - Tamaño tabla: +16 bytes por fila (2 BIGINT/TIMESTAMP)
-- - Nuevas queries habilitadas: Filtrar por gestora asignada
-- - Auditoría de asignaciones: Timestamp registra cuándo se asignó
--
-- Rollback (si es necesario):
-- DROP INDEX idx_solicitud_bolsa_fecha_asignacion;
-- DROP INDEX idx_solicitud_bolsa_gestora;
-- ALTER TABLE dim_solicitud_bolsa DROP CONSTRAINT fk_solicitud_bolsa_gestora;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN fecha_asignacion;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN responsable_gestora_id;
-- ============================================================================
