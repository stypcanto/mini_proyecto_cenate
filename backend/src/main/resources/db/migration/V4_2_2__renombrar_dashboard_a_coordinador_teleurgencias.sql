-- Migración v4.2.2: Renombrar Dashboard Coordinador Médico a Coordinador de Teleurgencias
-- Descripción: Cambiar el nombre del módulo y vincular rutas a coordinación de teleurgencias
-- Fecha: 2026-02-08
-- Autor: Claude Code

-- ============================================================================
-- 1. Actualizar el módulo: nombre y ruta base
-- ============================================================================
UPDATE dim_modulos_sistema
SET
    nombre_modulo = 'Coordinador de Teleurgencias',
    ruta_base = '/roles/coordinador/teleurgencias',
    descripcion = 'Módulo de coordinación y supervisión para coordinadores de Teleurgencias y Teletriaje',
    updated_at = NOW()
WHERE id_modulo = 49;

-- ============================================================================
-- 2. Actualizar las rutas de todas las páginas bajo este módulo
-- ============================================================================

-- Página 1: Dashboard Principal
UPDATE dim_paginas_modulo
SET
    ruta_pagina = '/roles/coordinador/teleurgencias',
    descripcion = 'Panel principal de coordinación de Teleurgencias y Teletriaje',
    updated_at = NOW()
WHERE id_modulo = 49 AND nombre_pagina = 'Dashboard Supervisión';

-- Página 2: Estadísticas
UPDATE dim_paginas_modulo
SET
    ruta_pagina = '/roles/coordinador/teleurgencias/estadisticas',
    descripcion = 'Tabla detallada de estadísticas por médico (asignados, atendidos, porcentaje)',
    updated_at = NOW()
WHERE id_modulo = 49 AND nombre_pagina = 'Estadísticas Médicos';

-- Página 3: Reasignación
UPDATE dim_paginas_modulo
SET
    ruta_pagina = '/roles/coordinador/teleurgencias/reasignar',
    descripcion = 'Funcionalidad para reasignar pacientes entre médicos del área de Teleurgencias',
    updated_at = NOW()
WHERE id_modulo = 49 AND nombre_pagina = 'Reasignación Pacientes';

-- Página 4: Exportación
UPDATE dim_paginas_modulo
SET
    ruta_pagina = '/roles/coordinador/teleurgencias/exportar',
    descripcion = 'Exportación de reportes y estadísticas de Teleurgencias a formato Excel',
    updated_at = NOW()
WHERE id_modulo = 49 AND nombre_pagina = 'Exportación Excel';

-- ============================================================================
-- 3. Auditoría: Registrar la migración
-- ============================================================================
INSERT INTO audit_logs (usuario, action, modulo, detalle, fecha_hora, nivel, estado)
VALUES (
    'SISTEMA',
    'MIGRATION',
    'dim_modulos_sistema',
    'v4.2.2: Renombrar Dashboard Coordinador Médico a "Coordinador de Teleurgencias" y actualizar rutas a /roles/coordinador/teleurgencias',
    NOW(),
    'CRITICA',
    'EXITO'
);

-- ============================================================================
-- RESUMEN DE CAMBIOS:
-- Módulo: "Dashboard Coordinador Médico" → "Coordinador de Teleurgencias"
-- Ruta Base: "/roles/coordinador/dashboard-medico" → "/roles/coordinador/teleurgencias"
--
-- Rutas de Páginas:
-- - /roles/coordinador/dashboard-medico → /roles/coordinador/teleurgencias
-- - /roles/coordinador/dashboard-medico/estadisticas → /roles/coordinador/teleurgencias/estadisticas
-- - /roles/coordinador/dashboard-medico/reasignar → /roles/coordinador/teleurgencias/reasignar
-- - /roles/coordinador/dashboard-medico/exportar → /roles/coordinador/teleurgencias/exportar
--
-- Rol: COORDINADOR_MEDICO_TELEURGENCIAS mantiene todos sus permisos
-- ============================================================================
