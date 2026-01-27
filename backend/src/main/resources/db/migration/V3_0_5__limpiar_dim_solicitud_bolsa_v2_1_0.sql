-- ============================================================================
-- Script SQL: Limpiar tabla dim_solicitud_bolsa v2.1.0 (ACTUALIZADO)
-- ============================================================================
-- Descripción: Elimina 19 columnas denormalizadas y no utilizadas
-- Versión: v2.1.0 (Limpieza agresiva - ejecutada manualmente + migración Flyway)
-- Fecha: 2026-01-27
-- Cambios: 44 columnas → 25 columnas (43% reducción)
-- ============================================================================

-- ============================================================================
-- 1. RENOMBRAR COLUMNAS PARA CONSISTENCIA
-- ============================================================================

-- Renombrar id_bolsa a id_tipo_bolsa para ser consistente con FK
ALTER TABLE public.dim_solicitud_bolsa
RENAME COLUMN id_bolsa TO id_tipo_bolsa;

-- Renombrar codigo_ipress a codigo_ipress_adscripcion para claridad
ALTER TABLE public.dim_solicitud_bolsa
RENAME COLUMN codigo_ipress TO codigo_ipress_adscripcion;

-- ============================================================================
-- 2. ELIMINACIÓN DE COLUMNAS DENORMALIZADAS (8 columnas)
-- ============================================================================
-- Razón: Estos datos se recuperan con JOINs simples desde sus tablas de origen
-- - cod_tipo_bolsa, desc_tipo_bolsa → dim_tipos_bolsas
-- - cod_servicio → dim_servicio_essi
-- - nombre_ipress, red_asistencial → dim_ipress
-- - cod_estado_cita, desc_estado_cita → dim_estados_gestion_citas

ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS cod_tipo_bolsa CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS desc_tipo_bolsa CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS cod_servicio CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS nombre_ipress CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS red_asistencial CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS cod_estado_cita CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS desc_estado_cita CASCADE;

-- ============================================================================
-- 3. ELIMINACIÓN DE COLUMNAS DE FLUJOS NO IMPLEMENTADOS (6 columnas)
-- ============================================================================
-- Razón: El flujo de aprobación/rechazo nunca fue implementado en UI
-- Pueden readmitirse cuando se implemente la funcionalidad real

ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS razon_rechazo CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS notas_aprobacion CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS responsable_aprobacion_id CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS responsable_aprobacion_nombre CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS responsable_gestora_id CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS fecha_aprobacion CASCADE;

-- ============================================================================
-- 4. ELIMINACIÓN DE COLUMNAS DE AUDITORÍA SIN USO (4 columnas)
-- ============================================================================
-- Razón: recordatorio_enviado, fecha_asignacion, solicitante_id, solicitante_nombre no se utilizan

ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS recordatorio_enviado CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS fecha_asignacion CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS solicitante_id CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS solicitante_nombre CASCADE;

-- ============================================================================
-- 5. ELIMINACIÓN DE COLUMNAS v1.9.0 NO UTILIZADAS (2 columnas)
-- ============================================================================
-- Razón: fecha_cita y fecha_atencion fueron agregadas pero no se usan
-- Pueden readmitirse cuando se implemente módulo de citas programadas

ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS fecha_cita CASCADE;
ALTER TABLE public.dim_solicitud_bolsa DROP COLUMN IF EXISTS fecha_atencion CASCADE;

-- ============================================================================
-- 6. ACTUALIZACIÓN DE CONSTRAINTS
-- ============================================================================

-- Eliminar constraint anterior (basado en id_bolsa)
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS solicitud_paciente_unique;

-- Crear nuevo constraint con id_tipo_bolsa
ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT solicitud_paciente_unique
UNIQUE (id_tipo_bolsa, paciente_id);

-- ============================================================================
-- 7. ACTUALIZACIÓN DE FOREIGN KEYS
-- ============================================================================

-- FK: id_tipo_bolsa → dim_tipos_bolsas (ya existe, solo verificar)
-- Renombrar constraint si es necesario
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS fk_solicitud_bolsa_tipo_bolsa;

ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_bolsa_tipo_bolsa
FOREIGN KEY (id_tipo_bolsa)
REFERENCES public.dim_tipos_bolsas(id_tipo_bolsa)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Eliminar FK a responsable_aprobacion_id (que fue eliminado)
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS fk_solicitud_bolsa_responsable_aprobacion;

-- Eliminar FK a responsable_gestora_id (que fue eliminado)
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS fk_solicitud_bolsa_gestora;

-- ============================================================================
-- 8. ELIMINAR ÍNDICES RELACIONADOS A COLUMNAS ELIMINADAS
-- ============================================================================

DROP INDEX IF EXISTS public.idx_solicitud_bolsa_gestora CASCADE;
DROP INDEX IF EXISTS public.idx_solicitud_bolsa_fecha_asignacion CASCADE;

-- ============================================================================
-- 9. VERIFICACIÓN POST-ALTERACIÓN
-- ============================================================================

-- Listar nuevas columnas de la tabla
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Listar foreign keys actuales
SELECT constraint_name, column_name
FROM information_schema.key_column_usage
WHERE table_name = 'dim_solicitud_bolsa'
AND table_schema = 'public'
AND foreign_table_name IS NOT NULL
ORDER BY constraint_name;

-- Listar índices actuales
SELECT indexname
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
AND schemaname = 'public'
ORDER BY indexname;

-- ============================================================================
-- RESUMEN DE CAMBIOS
-- ============================================================================
-- Eliminadas: 19 columnas (45% reducción de 44 a 25 columnas)
--   - Denormalizadas (8): cod_tipo_bolsa, desc_tipo_bolsa, cod_servicio,
--                         nombre_ipress, red_asistencial, cod_estado_cita,
--                         desc_estado_cita
--   - Flujo no implementado (6): razon_rechazo, notas_aprobacion,
--                                 responsable_aprobacion_id, responsable_aprobacion_nombre,
--                                 responsable_gestora_id, fecha_aprobacion
--   - Auditoría sin uso (4): recordatorio_enviado, fecha_asignacion,
--                            solicitante_id, solicitante_nombre
--   - v1.9.0 sin usar (2): fecha_cita, fecha_atencion
--
-- Mantenidas: 25 columnas
--   - Core operativo (6): id_solicitud, numero_solicitud, paciente_id, paciente_nombre, paciente_dni, especialidad
--   - Estado (3): estado, estado_gestion_citas_id, activo
--   - Fechas (2): fecha_solicitud, fecha_actualizacion
--   - Referencias FK (4): id_tipo_bolsa, id_servicio, codigo_adscripcion, id_ipress
--   - Excel v1.8.0 (10): fecha_preferida_no_atendida, tipo_documento, fecha_nacimiento,
--                        paciente_sexo, paciente_telefono, paciente_email,
--                        codigo_ipress, tipo_cita, paciente_edad*
--
-- Renombradas: 1 (codigo_ipress → codigo_ipress_adscripcion para claridad en FK)
-- ============================================================================
