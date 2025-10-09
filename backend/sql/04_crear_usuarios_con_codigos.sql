-- ============================================
-- CREAR USUARIOS CON CÓDIGOS DE USUARIO
-- Base de datos: maestro_cenate (PostgreSQL)
-- Fecha: 08/10/2025
-- ============================================

-- PASO 1: Verificar que el usuario SUPERADMIN existe
-- ============================================
SELECT 
    u.id_user,
    u.name_user,
    u.stat_user,
    STRING_AGG(r.desc_rol, ', ') as roles
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'superadmin'
GROUP BY u.id_user, u.name_user, u.stat_user;

-- Si NO existe el usuario SUPERADMIN, ejecutar esto:
-- (Si ya existe, saltar al PASO 2)

DO $$
DECLARE
    v_id_rol INTEGER;
    v_user_exists BOOLEAN;
BEGIN
    -- Obtener el ID del rol SUPERADMIN
    SELECT id_rol INTO v_id_rol 
    FROM dim_roles 
    WHERE desc_rol = 'SUPERADMIN';
    
    -- Verificar si ya existe el usuario
    SELECT EXISTS(SELECT 1 FROM dim_usuarios WHERE name_user = 'superadmin') INTO v_user_exists;
    
    IF NOT v_user_exists THEN
        -- Crear el usuario SUPERADMIN
        INSERT INTO dim_usuarios (
            name_user,
            pass_user,
            stat_user,
            create_at,
            update_at,
            password_changed_at,
            failed_attempts
        ) VALUES (
            'superadmin',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
            'ACTIVO',
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP,
            0
        );
        
        -- Asignar rol SUPERADMIN al usuario
        INSERT INTO usuarios_roles (id_user, id_rol)
        SELECT 
            (SELECT id_user FROM dim_usuarios WHERE name_user = 'superadmin'),
            v_id_rol;
        
        RAISE NOTICE '✅ Usuario SUPERADMIN creado exitosamente';
    ELSE
        RAISE NOTICE '⚠️  El usuario superadmin ya existe';
    END IF;
END $$;

-- PASO 2: Crear usuarios de ejemplo con diferentes códigos
-- ============================================

-- Usuario ADMIN001
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    SELECT id_rol INTO v_id_rol FROM dim_roles WHERE desc_rol = 'ADMIN';
    
    IF NOT EXISTS (SELECT 1 FROM dim_usuarios WHERE name_user = 'ADMIN001') THEN
        INSERT INTO dim_usuarios (
            name_user, pass_user, stat_user, 
            create_at, update_at, password_changed_at, failed_attempts
        ) VALUES (
            'ADMIN001',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
            'ACTIVO',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
        );
        
        INSERT INTO usuarios_roles (id_user, id_rol)
        SELECT id_user, v_id_rol FROM dim_usuarios WHERE name_user = 'ADMIN001';
        
        RAISE NOTICE '✅ Usuario ADMIN001 creado';
    END IF;
END $$;

-- Usuario MED001 (ESPECIALISTA)
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    SELECT id_rol INTO v_id_rol FROM dim_roles WHERE desc_rol = 'ESPECIALISTA';
    
    IF NOT EXISTS (SELECT 1 FROM dim_usuarios WHERE name_user = 'MED001') THEN
        INSERT INTO dim_usuarios (
            name_user, pass_user, stat_user, 
            create_at, update_at, password_changed_at, failed_attempts
        ) VALUES (
            'MED001',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
            'ACTIVO',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
        );
        
        INSERT INTO usuarios_roles (id_user, id_rol)
        SELECT id_user, v_id_rol FROM dim_usuarios WHERE name_user = 'MED001';
        
        RAISE NOTICE '✅ Usuario MED001 creado';
    END IF;
END $$;

-- Usuario RAD001 (RADIOLOGO)
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    SELECT id_rol INTO v_id_rol FROM dim_roles WHERE desc_rol = 'RADIOLOGO';
    
    IF NOT EXISTS (SELECT 1 FROM dim_usuarios WHERE name_user = 'RAD001') THEN
        INSERT INTO dim_usuarios (
            name_user, pass_user, stat_user, 
            create_at, update_at, password_changed_at, failed_attempts
        ) VALUES (
            'RAD001',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
            'ACTIVO',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
        );
        
        INSERT INTO usuarios_roles (id_user, id_rol)
        SELECT id_user, v_id_rol FROM dim_usuarios WHERE name_user = 'RAD001';
        
        RAISE NOTICE '✅ Usuario RAD001 creado';
    END IF;
END $$;

-- Usuario USR001 (USUARIO básico)
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    SELECT id_rol INTO v_id_rol FROM dim_roles WHERE desc_rol = 'USUARIO';
    
    IF NOT EXISTS (SELECT 1 FROM dim_usuarios WHERE name_user = 'USR001') THEN
        INSERT INTO dim_usuarios (
            name_user, pass_user, stat_user, 
            create_at, update_at, password_changed_at, failed_attempts
        ) VALUES (
            'USR001',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
            'ACTIVO',
            CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0
        );
        
        INSERT INTO usuarios_roles (id_user, id_rol)
        SELECT id_user, v_id_rol FROM dim_usuarios WHERE name_user = 'USR001';
        
        RAISE NOTICE '✅ Usuario USR001 creado';
    END IF;
END $$;

-- PASO 3: Verificar usuarios creados
-- ============================================
SELECT 
    '✅ USUARIOS CREADOS CON ÉXITO' as mensaje;

SELECT 
    u.id_user as "ID",
    u.name_user as "Código Usuario",
    u.stat_user as "Estado",
    STRING_AGG(r.desc_rol, ', ') as "Roles",
    u.create_at as "Fecha Creación"
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
GROUP BY u.id_user, u.name_user, u.stat_user, u.create_at
ORDER BY u.id_user;

-- PASO 4: Resumen de credenciales
-- ============================================
SELECT 
    '📋 CREDENCIALES DE ACCESO (Todos usan la misma contraseña temporal)' as info;

SELECT 
    name_user as "Código de Usuario",
    'SuperAdmin2024!' as "Contraseña",
    stat_user as "Estado"
FROM dim_usuarios
ORDER BY id_user;

-- ============================================
-- INFORMACIÓN IMPORTANTE
-- ============================================

/*
🔐 CREDENCIALES CREADAS:

Código Usuario    | Contraseña         | Rol
------------------|--------------------|-----------------
superadmin        | SuperAdmin2024!    | SUPERADMIN
ADMIN001          | SuperAdmin2024!    | ADMIN
MED001            | SuperAdmin2024!    | ESPECIALISTA
RAD001            | SuperAdmin2024!    | RADIOLOGO
USR001            | SuperAdmin2024!    | USUARIO

⚠️  IMPORTANTE:
1. Todos los usuarios tienen la MISMA contraseña temporal
2. Cambiar las contraseñas después del primer login
3. Los códigos de usuario son case-sensitive (distinguen mayúsculas/minúsculas)
4. Puedes crear tus propios códigos siguiendo el mismo patrón

📝 EJEMPLOS DE CÓDIGOS PERSONALIZADOS:
- Por área: IT001, MED001, ADM001
- Por nombre: jperez, mgarcia, jlopez
- Mixto: DR_PEREZ, ADM_GARCIA, TI_LOPEZ
*/

-- ============================================
-- QUERIES ÚTILES
-- ============================================

-- Ver todos los usuarios con sus roles
/*
SELECT 
    u.name_user as "Código",
    STRING_AGG(r.desc_rol, ', ') as "Roles",
    u.stat_user as "Estado",
    u.last_login_at as "Último Login"
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
GROUP BY u.id_user, u.name_user, u.stat_user, u.last_login_at
ORDER BY u.id_user;
*/

-- Crear un nuevo usuario con código personalizado
/*
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    -- Cambiar 'ADMIN' por el rol deseado: SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO
    SELECT id_rol INTO v_id_rol FROM dim_roles WHERE desc_rol = 'ADMIN';
    
    INSERT INTO dim_usuarios (
        name_user, 
        pass_user, 
        stat_user, 
        create_at, 
        update_at, 
        password_changed_at, 
        failed_attempts
    ) VALUES (
        'TU_CODIGO_AQUI',  -- Cambiar por el código deseado
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
        'ACTIVO',
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        0
    );
    
    INSERT INTO usuarios_roles (id_user, id_rol)
    SELECT id_user, v_id_rol FROM dim_usuarios WHERE name_user = 'TU_CODIGO_AQUI';
    
    RAISE NOTICE 'Usuario creado exitosamente';
END $$;
*/

-- Cambiar el código de un usuario existente
/*
UPDATE dim_usuarios 
SET name_user = 'NUEVO_CODIGO'
WHERE name_user = 'CODIGO_ANTIGUO';
*/
