-- ========================================================================
-- 🌐 Script SQL: Agregar "Gestión de Redes" al menú de IPRESS
-- ========================================================================
-- Este script agrega la página "Gestión de Redes" al módulo IPRESS
-- y configura los permisos para diferentes roles
-- ========================================================================

-- PASO 1: Obtener el ID del módulo IPRESS
-- Ejecuta esto primero para ver el ID:
SELECT id_modulo, nombre_modulo, icono, orden 
FROM dim_modulos_sistema 
WHERE nombre_modulo LIKE '%IPRESS%';

-- Si el módulo no existe, créalo:
-- INSERT INTO dim_modulos_sistema (nombre_modulo, icono, orden, activa)
-- VALUES ('IPRESS', 'Building2', 10, 1);

-- ========================================================================
-- PASO 2: Agregar la página "Gestión de Redes"
-- ========================================================================
-- IMPORTANTE: Reemplaza @id_modulo_ipress con el ID obtenido en el PASO 1

-- Verificar si la página ya existe
SELECT id_pagina, nombre, ruta 
FROM dim_paginas_sistema 
WHERE ruta = '/ipress/redes';

-- Si NO existe, agrégala:
INSERT INTO dim_paginas_sistema (
    nombre,
    ruta,
    id_modulo,
    icono,
    orden,
    activa,
    descripcion
) 
SELECT 
    'Gestión de Redes',
    '/ipress/redes',
    id_modulo,
    'Network',
    2,  -- Orden 2 (después de Listado de IPRESS)
    1,  -- Activa
    'Administración de redes asistenciales y macrorregiones'
FROM dim_modulos_sistema 
WHERE nombre_modulo LIKE '%IPRESS%'
LIMIT 1;

-- Obtener el ID de la página recién creada
SELECT id_pagina, nombre, ruta, id_modulo 
FROM dim_paginas_sistema 
WHERE ruta = '/ipress/redes';

-- ========================================================================
-- PASO 3: Configurar permisos por rol
-- ========================================================================

-- 3.1 SUPERADMIN: Todos los permisos (ver, crear, editar, eliminar)
INSERT INTO permisos (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT 
    r.id_rol,
    p.id_pagina,
    1, 1, 1, 1  -- Todos los permisos
FROM roles r
CROSS JOIN dim_paginas_sistema p
WHERE r.nombre = 'SUPERADMIN'
  AND p.ruta = '/ipress/redes'
  AND NOT EXISTS (
    SELECT 1 FROM permisos pe 
    WHERE pe.id_rol = r.id_rol AND pe.id_pagina = p.id_pagina
  );

-- 3.2 ADMIN: Ver, crear, editar (NO eliminar)
INSERT INTO permisos (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT 
    r.id_rol,
    p.id_pagina,
    1, 1, 1, 0  -- No puede eliminar
FROM roles r
CROSS JOIN dim_paginas_sistema p
WHERE r.nombre = 'ADMIN'
  AND p.ruta = '/ipress/redes'
  AND NOT EXISTS (
    SELECT 1 FROM permisos pe 
    WHERE pe.id_rol = r.id_rol AND pe.id_pagina = p.id_pagina
  );

-- 3.3 OTROS ROLES: Solo ver (lectura)
-- Ajusta los nombres de roles según tu sistema
INSERT INTO permisos (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar)
SELECT 
    r.id_rol,
    p.id_pagina,
    1, 0, 0, 0  -- Solo lectura
FROM roles r
CROSS JOIN dim_paginas_sistema p
WHERE r.nombre IN ('USER', 'MEDICO', 'COORDINADOR', 'ENFERMERIA')
  AND p.ruta = '/ipress/redes'
  AND NOT EXISTS (
    SELECT 1 FROM permisos pe 
    WHERE pe.id_rol = r.id_rol AND pe.id_pagina = p.id_pagina
  );

-- ========================================================================
-- VERIFICACIÓN FINAL
-- ========================================================================
-- Ver la página creada con su módulo
SELECT 
    p.id_pagina,
    p.nombre AS nombre_pagina,
    p.ruta,
    m.nombre_modulo,
    p.orden,
    p.activa
FROM dim_paginas_sistema p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.ruta = '/ipress/redes';

-- Ver los permisos asignados
SELECT 
    r.nombre AS rol,
    p.nombre AS pagina,
    pe.puede_ver,
    pe.puede_crear,
    pe.puede_editar,
    pe.puede_eliminar
FROM permisos pe
JOIN roles r ON pe.id_rol = r.id_rol
JOIN dim_paginas_sistema p ON pe.id_pagina = p.id_pagina
WHERE p.ruta = '/ipress/redes'
ORDER BY r.nombre;

-- ========================================================================
-- INSTRUCCIONES DE USO:
-- ========================================================================
-- 1. Conectarte a tu base de datos
-- 2. Ejecutar PASO 1 para verificar que existe el módulo IPRESS
-- 3. Ejecutar PASO 2 para crear la página
-- 4. Ejecutar PASO 3 para configurar permisos
-- 5. Ejecutar VERIFICACIÓN FINAL para confirmar
-- 6. Cerrar sesión y volver a iniciar sesión en la aplicación
-- 7. El menú IPRESS ahora mostrará "Gestión de Redes"
-- ========================================================================
