-- ============================================================================
-- V6_35_0: Registrar página Pacientes Anulados y otorgar acceso a MESA_DE_AYUDA
-- Módulo: Mesa de Ayuda (id_modulo = 50)
-- Roles: SUPERADMIN (id=1), MESA_DE_AYUDA (id=34)
-- Fecha: 2026-03-07
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
VALUES (
    50,
    'Pacientes Anulados',
    '/mesa-ayuda/pacientes-anulados',
    'Historial de pacientes con citas anuladas — trazabilidad y auditoría',
    'UserX',
    5,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, id_pagina, true, false, false, false, true, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/mesa-ayuda/pacientes-anulados'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 3. Permisos para MESA_DE_AYUDA (id_rol = 34)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 34, id_pagina, true, false, false, false, true, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/mesa-ayuda/pacientes-anulados'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;
