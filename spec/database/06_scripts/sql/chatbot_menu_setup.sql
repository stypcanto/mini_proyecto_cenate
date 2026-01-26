-- ========================================================================
-- SQL para agregar modulo ChatBot al menu dinamico CENATE
-- ========================================================================
-- Ejecutar en PostgreSQL: maestro_cenate
-- Estructura basada en entidades JPA del proyecto
-- ========================================================================

-- 1. Crear el modulo ChatBot
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'ChatBot Citas',
    'Sistema de solicitud de citas medicas via ChatBot',
    'Bot',
    15,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- 2. Verificar el ID del modulo creado
SELECT id_modulo, nombre_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'ChatBot Citas';

-- 3. Crear las paginas del modulo
-- Pagina 1: Solicitar Cita
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Solicitar Cita',
    '/chatbot/cita',
    'Wizard para solicitar citas medicas',
    1,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'ChatBot Citas'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Pagina 2: Dashboard Citas
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Dashboard Citas',
    '/chatbot/busqueda',
    'Dashboard de busqueda y reportes de citas',
    2,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'ChatBot Citas'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- 4. Verificar paginas creadas
SELECT id_pagina, nombre_pagina, ruta_pagina FROM dim_paginas_modulo WHERE ruta_pagina LIKE '/chatbot/%';

-- ========================================================================
-- 5. ASIGNAR PERMISOS A ROLES (segu_permisos_rol_pagina)
-- ========================================================================

-- Permisos para /chatbot/cita (SUPERADMIN, ADMIN, COORDINADOR)
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, created_at, updated_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,   -- activo
    NOW(),
    NOW()
FROM dim_rol r
CROSS JOIN dim_paginas_modulo p
WHERE r.nombre IN ('SUPERADMIN', 'ADMIN', 'COORDINADOR')
AND p.ruta_pagina = '/chatbot/cita'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = EXCLUDED.puede_ver,
    puede_crear = EXCLUDED.puede_crear,
    puede_editar = EXCLUDED.puede_editar,
    puede_eliminar = EXCLUDED.puede_eliminar,
    puede_exportar = EXCLUDED.puede_exportar,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- Permisos para /chatbot/busqueda (SUPERADMIN, ADMIN, COORDINADOR)
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, created_at, updated_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,   -- activo
    NOW(),
    NOW()
FROM dim_rol r
CROSS JOIN dim_paginas_modulo p
WHERE r.nombre IN ('SUPERADMIN', 'ADMIN', 'COORDINADOR')
AND p.ruta_pagina = '/chatbot/busqueda'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = EXCLUDED.puede_ver,
    puede_crear = EXCLUDED.puede_crear,
    puede_editar = EXCLUDED.puede_editar,
    puede_eliminar = EXCLUDED.puede_eliminar,
    puede_exportar = EXCLUDED.puede_exportar,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ========================================================================
-- 6. VERIFICACION FINAL
-- ========================================================================

-- Verificar modulo creado
SELECT * FROM dim_modulos_sistema WHERE nombre_modulo = 'ChatBot Citas';

-- Verificar paginas creadas
SELECT m.nombre_modulo as modulo, p.nombre_pagina as pagina, p.ruta_pagina, p.activo
FROM dim_paginas_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.ruta_pagina LIKE '/chatbot/%';

-- Verificar permisos asignados
SELECT r.nombre as rol, p.ruta_pagina, pp.puede_ver, pp.puede_crear, pp.puede_editar, pp.puede_eliminar
FROM segu_permisos_rol_pagina pp
JOIN dim_rol r ON pp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina LIKE '/chatbot/%'
ORDER BY r.nombre, p.ruta_pagina;
