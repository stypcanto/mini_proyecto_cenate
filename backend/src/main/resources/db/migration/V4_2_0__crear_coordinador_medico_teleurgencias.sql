-- Migración v4.2.0: Coordinador Médico Teleurgencias
-- Descripción: Agregar campo area_trabajo a PersonalCnt y crear nuevo rol COORDINADOR_MEDICO_TELEURGENCIAS
-- Fecha: 2026-02-08
-- Autor: Claude Code

-- ============================================================================
-- 1. Agregar campo area_trabajo a dim_personal_cnt
-- ============================================================================
ALTER TABLE dim_personal_cnt
ADD COLUMN IF NOT EXISTS area_trabajo VARCHAR(255);

-- Crear índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_personal_area_trabajo
ON dim_personal_cnt(area_trabajo);

-- ============================================================================
-- 2. Crear nuevo rol COORDINADOR_MEDICO_TELEURGENCIAS
-- ============================================================================
INSERT INTO dim_roles (nombre_rol, descripcion_rol, fecha_creacion, stat_rol)
VALUES (
    'COORDINADOR_MEDICO_TELEURGENCIAS',
    'Coordinador Médico de Teleurgencias y Teletriaje - Módulo de Supervisión v1.63.0',
    NOW(),
    'A'
)
ON CONFLICT (nombre_rol) DO NOTHING;

-- ============================================================================
-- 3. Registrar permisos MBAC para el nuevo rol
-- ============================================================================
INSERT INTO mbac_permisos (pagina, accion, roles_permitidos, descripcion, fecha_creacion)
VALUES
    ('/roles/coordinador/dashboard-medico', 'ver', ARRAY['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN']::text[], 'Ver dashboard de supervisión médica', NOW()),
    ('/roles/coordinador/dashboard-medico', 'editar', ARRAY['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN']::text[], 'Reasignar pacientes entre médicos', NOW()),
    ('/roles/coordinador/dashboard-medico', 'exportar', ARRAY['COORDINADOR_MEDICO_TELEURGENCIAS', 'ADMIN', 'SUPERADMIN']::text[], 'Exportar reportes a Excel', NOW())
ON CONFLICT (pagina, accion) DO NOTHING;

-- ============================================================================
-- 4. Registrar nuevo módulo en dim_modulo_sistema
-- ============================================================================
INSERT INTO dim_modulo_sistema (nombre_modulo, descripcion_modulo, ruta_modulo, estado, fecha_creacion)
VALUES (
    'Dashboard Coordinador Médico',
    'Módulo de supervisión para coordinadores médicos de Teleurgencias y Teletriaje',
    '/roles/coordinador/dashboard-medico',
    'A',
    NOW()
)
ON CONFLICT (ruta_modulo) DO NOTHING;

-- ============================================================================
-- 5. Auditoría: Registrar la migración
-- ============================================================================
INSERT INTO audit_log (usuario, tabla, operacion, descripcion, fecha_operacion)
VALUES (
    'SISTEMA',
    'dim_personal_cnt + dim_roles + mbac_permisos + dim_modulo_sistema',
    'MIGRATION',
    'v4.2.0: Agregar soporte para Coordinador Médico Teleurgencias',
    NOW()
);

-- ============================================================================
-- NOTAS:
-- - El campo area_trabajo puede ser NULL para personal sin área específica
-- - Valores sugeridos: 'TELEURGENCIAS_TELETRIAJE', 'TELEMEDICINA_GENERAL', etc.
-- - Será poblado mediante updateAPI al asignar coordinadores a áreas
-- ============================================================================
