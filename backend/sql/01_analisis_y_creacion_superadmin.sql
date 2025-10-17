-- =====================================================
-- SCRIPT DE ANÁLISIS Y CREACIÓN DE USUARIO SUPERADMIN
-- Base de datos: maestro_cenate
-- Fecha: 08/10/2025
-- =====================================================

-- 1. ANALIZAR ESTRUCTURA DE TABLAS EXISTENTES
-- =====================================================

-- Verificar si existen las tablas DIM_USUARIOS y DIM_ROLES
SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_name IN ('dim_usuarios', 'dim_roles')
ORDER BY 
    table_name;

-- Verificar columnas de DIM_USUARIOS
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'dim_usuarios'
ORDER BY 
    ordinal_position;

-- Verificar columnas de DIM_ROLES
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_schema = 'public'
    AND table_name = 'dim_roles'
ORDER BY 
    ordinal_position;

-- 2. VERIFICAR ROLES EXISTENTES
-- =====================================================

-- Ver todos los roles en la tabla
SELECT * FROM dim_roles ORDER BY id;

-- 3. VERIFICAR USUARIOS EXISTENTES
-- =====================================================

-- Ver todos los usuarios con sus roles
SELECT 
    u.*,
    r.nombre as nombre_rol
FROM 
    dim_usuarios u
    LEFT JOIN dim_roles r ON u.id_rol = r.id
ORDER BY 
    u.id;

-- 4. BUSCAR SI EXISTE UN USUARIO SUPERADMIN
-- =====================================================

-- Buscar por rol SUPERADMIN
SELECT 
    u.*,
    r.nombre as nombre_rol
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    UPPER(r.nombre) LIKE '%SUPERADMIN%'
    OR UPPER(r.nombre) LIKE '%SUPER%ADMIN%'
    OR UPPER(r.nombre) = 'SUPERADMIN';

-- 5. CONTAR USUARIOS POR ROL
-- =====================================================

SELECT 
    r.id,
    r.nombre as rol,
    COUNT(u.id) as cantidad_usuarios
FROM 
    dim_roles r
    LEFT JOIN dim_usuarios u ON r.id = u.id_rol
GROUP BY 
    r.id, r.nombre
ORDER BY 
    r.id;

-- =====================================================
-- SCRIPT DE CREACIÓN (Solo ejecutar si no existe)
-- =====================================================

-- PASO 1: Verificar/Crear el rol SUPERADMIN
-- =====================================================

-- Verificar si existe el rol
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM dim_roles WHERE UPPER(nombre) = 'SUPERADMIN'
    ) THEN
        INSERT INTO dim_roles (nombre, descripcion, activo, created_at, updated_at)
        VALUES (
            'SUPERADMIN',
            'Administrador con acceso total al sistema',
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Rol SUPERADMIN creado exitosamente';
    ELSE
        RAISE NOTICE 'El rol SUPERADMIN ya existe';
    END IF;
END $$;

-- PASO 2: Crear usuario SUPERADMIN (si no existe)
-- =====================================================

-- NOTA: La contraseña 'Admin2025!' con BCrypt es:
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy

DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    -- Obtener el ID del rol SUPERADMIN
    SELECT id INTO v_id_rol 
    FROM dim_roles 
    WHERE UPPER(nombre) = 'SUPERADMIN';

    -- Verificar si ya existe un usuario con DNI 12345678
    IF NOT EXISTS (
        SELECT 1 FROM dim_usuarios WHERE dni = '12345678'
    ) THEN
        INSERT INTO dim_usuarios (
            dni,
            nombre,
            apellido_paterno,
            apellido_materno,
            email,
            password,
            telefono,
            id_rol,
            activo,
            created_at,
            updated_at
        )
        VALUES (
            '12345678',                                                          -- DNI
            'Super',                                                             -- Nombre
            'Admin',                                                             -- Apellido Paterno
            'Sistema',                                                           -- Apellido Materno
            'superadmin@cenate.gob.pe',                                         -- Email
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- Password: Admin2025!
            '999999999',                                                         -- Teléfono
            v_id_rol,                                                           -- ID Rol SUPERADMIN
            true,                                                               -- Activo
            CURRENT_TIMESTAMP,                                                  -- Created at
            CURRENT_TIMESTAMP                                                   -- Updated at
        );
        RAISE NOTICE 'Usuario SUPERADMIN creado exitosamente';
        RAISE NOTICE 'DNI: 12345678';
        RAISE NOTICE 'Contraseña: Admin2025!';
    ELSE
        RAISE NOTICE 'Ya existe un usuario con DNI 12345678';
    END IF;
END $$;

-- PASO 3: Verificar la creación
-- =====================================================

SELECT 
    u.id,
    u.dni,
    u.nombre,
    u.apellido_paterno,
    u.apellido_materno,
    u.email,
    u.telefono,
    r.nombre as rol,
    u.activo,
    u.created_at
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    u.dni = '12345678';

-- =====================================================
-- ROLES ADICIONALES (Opcional - Si no existen)
-- =====================================================

-- Insertar roles adicionales si no existen
INSERT INTO dim_roles (nombre, descripcion, activo, created_at, updated_at)
SELECT 'Administrador', 'Administrador del sistema con permisos elevados', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE UPPER(nombre) = 'ADMINISTRADOR');

INSERT INTO dim_roles (nombre, descripcion, activo, created_at, updated_at)
SELECT 'Usuario', 'Usuario estándar del sistema', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE UPPER(nombre) = 'USUARIO');

-- Verificar todos los roles
SELECT * FROM dim_roles ORDER BY id;

-- =====================================================
-- SCRIPT DE RESETEO DE CONTRASEÑA (Útil para pruebas)
-- =====================================================

-- Para resetear la contraseña del SUPERADMIN a 'Admin2025!'
/*
UPDATE dim_usuarios
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy',
    updated_at = CURRENT_TIMESTAMP
WHERE 
    dni = '12345678';
*/

-- =====================================================
-- CREDENCIALES DEL SUPERADMIN
-- =====================================================

/*
DNI: 12345678
Contraseña: Admin2025!
Email: superadmin@cenate.gob.pe

IMPORTANTE: Cambiar esta contraseña después del primer login
*/

-- =====================================================
-- QUERIES ÚTILES PARA ADMINISTRACIÓN
-- =====================================================

-- Ver todos los usuarios activos
SELECT 
    u.dni,
    u.nombre,
    u.apellido_paterno,
    u.email,
    r.nombre as rol,
    u.activo
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    u.activo = true
ORDER BY 
    r.id, u.nombre;

-- Ver usuarios por rol
SELECT 
    r.nombre as rol,
    COUNT(u.id) as total_usuarios,
    COUNT(CASE WHEN u.activo = true THEN 1 END) as usuarios_activos
FROM 
    dim_roles r
    LEFT JOIN dim_usuarios u ON r.id = u.id_rol
GROUP BY 
    r.id, r.nombre
ORDER BY 
    r.id;

-- Desactivar un usuario (en lugar de eliminarlo)
/*
UPDATE dim_usuarios
SET 
    activo = false,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    dni = 'DNI_DEL_USUARIO';
*/

-- Activar un usuario
/*
UPDATE dim_usuarios
SET 
    activo = true,
    updated_at = CURRENT_TIMESTAMP
WHERE 
    dni = 'DNI_DEL_USUARIO';
*/
