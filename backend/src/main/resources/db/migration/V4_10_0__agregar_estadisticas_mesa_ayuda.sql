-- ============================================================================
-- V4_10_0: Agregar página Estadísticas al módulo Mesa de Ayuda
-- Permisos para roles: SUPERADMIN (id=1) y MESA_DE_AYUDA (id=34)
-- Autor: Styp Canto Rondón
-- Fecha: 2026-02-20
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo (módulo 50 = Mesa de Ayuda)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
VALUES (
    50,
    'Estadísticas',
    '/mesa-ayuda/estadisticas',
    'Dashboard de estadísticas del módulo Mesa de Ayuda: tickets por estado, prioridad, motivo y personal',
    'BarChart3',
    4,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, id_pagina, true, false, false, false, true, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/mesa-ayuda/estadisticas'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 3. Permisos para MESA_DE_AYUDA (id_rol = 34)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 34, id_pagina, true, false, false, false, false, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/mesa-ayuda/estadisticas'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;
