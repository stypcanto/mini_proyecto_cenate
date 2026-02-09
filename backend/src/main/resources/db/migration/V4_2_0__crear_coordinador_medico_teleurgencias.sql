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
INSERT INTO dim_roles (desc_rol, stat_rol, activo, nivel_jerarquia, created_at, updated_at)
VALUES (
    'COORDINADOR_MEDICO_TELEURGENCIAS',
    'A',
    true,
    4,
    NOW(),
    NOW()
)
ON CONFLICT (desc_rol) DO NOTHING;

-- ============================================================================
-- 3. Registrar nuevo módulo en dim_modulos_sistema
-- ============================================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, ruta_base, activo, created_at, updated_at)
VALUES (
    'Dashboard Coordinador Médico',
    'Módulo de supervisión para coordinadores médicos de Teleurgencias y Teletriaje',
    '/roles/coordinador/dashboard-medico',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO NOTHING;

-- ============================================================================
-- 4. Auditoría: Registrar la migración
-- ============================================================================
INSERT INTO audit_logs (usuario, action, modulo, detalle, fecha_hora, nivel, estado)
VALUES (
    'SISTEMA',
    'MIGRATION',
    'dim_personal_cnt',
    'v4.2.0: Agregar soporte para Coordinador Médico Teleurgencias - Campo area_trabajo + Rol COORDINADOR_MEDICO_TELEURGENCIAS + Módulo Dashboard',
    NOW(),
    'CRITICA',
    'EXITO'
);

-- ============================================================================
-- NOTAS:
-- - El campo area_trabajo puede ser NULL para personal sin área específica
-- - Valores sugeridos: 'TELEURGENCIAS_TELETRIAJE', 'TELEMEDICINA_GENERAL', etc.
-- - Será poblado mediante updateAPI al asignar coordinadores a áreas
-- ============================================================================
