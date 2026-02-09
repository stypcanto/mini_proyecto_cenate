-- Migración v4.2.1: Agregar Páginas para Dashboard Coordinador Médico
-- Descripción: Registrar las páginas necesarias bajo el módulo Dashboard Coordinador Médico
-- Fecha: 2026-02-08
-- Autor: Claude Code

-- ============================================================================
-- 1. Insertar páginas bajo el módulo Dashboard Coordinador Médico (id_modulo = 49)
-- ============================================================================

-- Página 1: Dashboard Principal
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at)
VALUES (
    49,
    'Dashboard Supervisión',
    '/roles/coordinador/dashboard-medico',
    'Panel principal de supervisión médica en Teleurgencias y Teletriaje',
    1,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Página 2: Estadísticas por Médico
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at)
VALUES (
    49,
    'Estadísticas Médicos',
    '/roles/coordinador/dashboard-medico/estadisticas',
    'Tabla detallada de estadísticas por médico (asignados, atendidos, porcentaje)',
    2,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Página 3: Reasignación de Pacientes
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at)
VALUES (
    49,
    'Reasignación Pacientes',
    '/roles/coordinador/dashboard-medico/reasignar',
    'Funcionalidad para reasignar pacientes entre médicos del área',
    3,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Página 4: Exportación de Reportes
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at)
VALUES (
    49,
    'Exportación Excel',
    '/roles/coordinador/dashboard-medico/exportar',
    'Exportación de reportes y estadísticas a formato Excel',
    4,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- ============================================================================
-- 2. Registrar permisos MBAC para el rol COORDINADOR_MEDICO_TELEURGENCIAS
-- ============================================================================

-- Obtener el ID del rol
WITH rol_data AS (
    SELECT id_rol FROM dim_roles WHERE desc_rol = 'COORDINADOR_MEDICO_TELEURGENCIAS'
),
-- Obtener IDs de las páginas creadas
paginas_data AS (
    SELECT id_pagina, ruta_pagina FROM dim_paginas_modulo
    WHERE ruta_pagina LIKE '/roles/coordinador/dashboard-medico%'
)

-- Insertar permisos para cada página
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    rd.id_rol,
    pd.id_pagina,
    true,  -- puede_ver: siempre
    false, -- puede_crear: no
    (CASE WHEN pd.ruta_pagina IN ('/roles/coordinador/dashboard-medico/reasignar', '/roles/coordinador/dashboard-medico') THEN true ELSE false END), -- puede_editar: solo reasignación y dashboard
    false, -- puede_eliminar: no
    (CASE WHEN pd.ruta_pagina IN ('/roles/coordinador/dashboard-medico/exportar', '/roles/coordinador/dashboard-medico') THEN true ELSE false END), -- puede_exportar: solo exportación y dashboard
    true,  -- activo
    NOW()
FROM rol_data rd, paginas_data pd
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- ============================================================================
-- 3. Auditoría: Registrar la migración
-- ============================================================================
INSERT INTO audit_logs (usuario, action, modulo, detalle, fecha_hora, nivel, estado)
VALUES (
    'SISTEMA',
    'MIGRATION',
    'dim_paginas_modulo',
    'v4.2.1: Agregar 4 páginas para Dashboard Coordinador Médico + permisos MBAC',
    NOW(),
    'CRITICA',
    'EXITO'
);

-- ============================================================================
-- NOTAS:
-- - Las 4 páginas se registran bajo el módulo ID 49 (Dashboard Coordinador Médico)
-- - Permisos MBAC se asignan automáticamente al rol COORDINADOR_MEDICO_TELEURGENCIAS
-- - Ver: Activado para todas las páginas
-- - Editar: Activado para dashboard-medico y reasignar
-- - Exportar: Activado para dashboard-medico y exportar
-- ============================================================================
