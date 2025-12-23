-- ========================================================================
-- SQL para agregar modulo ChatBot al menu dinamico CENATE
-- ========================================================================
-- Ejecutar en PostgreSQL: maestro_cenate
-- IMPORTANTE: Ajustar IDs segun la secuencia actual de tu BD
-- ========================================================================

-- 1. Crear el modulo ChatBot
INSERT INTO dim_modulos_sistema (nombre, descripcion, icono, orden, activo)
VALUES (
    'ChatBot Citas',
    'Sistema de solicitud de citas medicas via ChatBot',
    'Bot',  -- Icono de Lucide (ya registrado en DynamicSidebar.jsx)
    15,     -- Orden en el menu (ajustar segun necesidad)
    true
)
ON CONFLICT (nombre) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

-- 2. Obtener el ID del modulo recien creado
-- (Usar este ID en los siguientes INSERTs)
-- SELECT id_modulo FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

-- 3. Crear las paginas del modulo
-- NOTA: Reemplazar {ID_MODULO} con el ID real del modulo

-- Pagina 1: Solicitar Cita
INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, descripcion, orden, activo)
SELECT
    id_modulo,
    'Solicitar Cita',
    '/chatbot/cita',
    'Wizard para solicitar citas medicas',
    1,
    true
FROM dim_modulos_sistema
WHERE nombre = 'ChatBot Citas'
ON CONFLICT (ruta) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

-- Pagina 2: Buscar Citas
INSERT INTO dim_pagina_modulo (id_modulo, nombre, ruta, descripcion, orden, activo)
SELECT
    id_modulo,
    'Dashboard Citas',
    '/chatbot/busqueda',
    'Dashboard de busqueda y reportes de citas',
    2,
    true
FROM dim_modulos_sistema
WHERE nombre = 'ChatBot Citas'
ON CONFLICT (ruta) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

-- ========================================================================
-- 4. ASIGNAR PERMISOS A ROLES
-- ========================================================================
-- Ajustar segun los roles que deban tener acceso

-- Obtener IDs de paginas creadas
-- SELECT id_pagina, nombre, ruta FROM dim_pagina_modulo WHERE ruta LIKE '/chatbot/%';

-- Ejemplo: Asignar permisos al rol SUPERADMIN (id_rol = 1)
-- Asignar permisos al rol ADMIN (id_rol = 2)
-- Asignar permisos al rol COORDINADOR (id_rol = 4)

-- Permisos para /chatbot/cita
INSERT INTO permisos_pagina (id_rol, id_pagina, ver, crear, editar, eliminar)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- ver
    true,  -- crear
    true,  -- editar
    false  -- eliminar
FROM dim_rol r
CROSS JOIN dim_pagina_modulo p
WHERE r.nombre IN ('SUPERADMIN', 'ADMIN', 'COORDINADOR')
AND p.ruta = '/chatbot/cita'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    ver = EXCLUDED.ver,
    crear = EXCLUDED.crear,
    editar = EXCLUDED.editar,
    eliminar = EXCLUDED.eliminar;

-- Permisos para /chatbot/busqueda
INSERT INTO permisos_pagina (id_rol, id_pagina, ver, crear, editar, eliminar)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- ver
    false, -- crear
    false, -- editar
    false  -- eliminar
FROM dim_rol r
CROSS JOIN dim_pagina_modulo p
WHERE r.nombre IN ('SUPERADMIN', 'ADMIN', 'COORDINADOR')
AND p.ruta = '/chatbot/busqueda'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    ver = EXCLUDED.ver,
    crear = EXCLUDED.crear,
    editar = EXCLUDED.editar,
    eliminar = EXCLUDED.eliminar;

-- ========================================================================
-- 5. VERIFICACION
-- ========================================================================

-- Verificar modulo creado
SELECT * FROM dim_modulos_sistema WHERE nombre = 'ChatBot Citas';

-- Verificar paginas creadas
SELECT m.nombre as modulo, p.nombre as pagina, p.ruta, p.activo
FROM dim_pagina_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.ruta LIKE '/chatbot/%';

-- Verificar permisos asignados
SELECT r.nombre as rol, p.ruta, pp.ver, pp.crear, pp.editar, pp.eliminar
FROM permisos_pagina pp
JOIN dim_rol r ON pp.id_rol = r.id_rol
JOIN dim_pagina_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta LIKE '/chatbot/%'
ORDER BY r.nombre, p.ruta;
