-- ============================================
-- CREAR USUARIO SUPERADMIN EN LA BASE DE DATOS
-- Base de datos: maestro_cenate (PostgreSQL)
-- Fecha: 08/10/2025
-- ============================================

-- PASO 1: Verificar si el usuario superadmin ya existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM "DIM_USUARIOS" WHERE name_user = 'superadmin') THEN
        RAISE NOTICE '⚠️  El usuario superadmin ya existe';
        
        -- Mostrar información del usuario existente
        RAISE NOTICE 'Información del usuario superadmin:';
    ELSE
        RAISE NOTICE '✅ Procediendo a crear el usuario superadmin';
    END IF;
END $$;

-- PASO 2: Crear el usuario SUPERADMIN si no existe
INSERT INTO "DIM_USUARIOS" (
    name_user,
    pass_user,
    stat_user,
    create_at,
    update_at,
    password_changed_at,
    failed_attempts,
    locked_until,
    last_login_at
) 
SELECT 
    'superadmin',
    -- Password: SuperAdmin2024! (encriptado con BCrypt)
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy',
    'ACTIVO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0,
    NULL,
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM "DIM_USUARIOS" WHERE name_user = 'superadmin'
);

-- PASO 3: Asignar rol SUPERADMIN al usuario
INSERT INTO "USUARIOS_ROLES" (id_user, id_rol, asig_en)
SELECT 
    u.id_user,
    r.id_rol,
    CURRENT_TIMESTAMP
FROM 
    "DIM_USUARIOS" u,
    "DIM_ROLES" r
WHERE 
    u.name_user = 'superadmin' 
    AND r.desc_Rol = 'SUPERADMIN'
    AND NOT EXISTS (
        SELECT 1 
        FROM "USUARIOS_ROLES" ur
        WHERE ur.id_user = u.id_user 
        AND ur.id_rol = r.id_rol
    );

-- PASO 4: Verificación del usuario creado
DO $$
DECLARE
    v_user_count INTEGER;
    v_role_count INTEGER;
BEGIN
    -- Contar usuarios con nombre 'superadmin'
    SELECT COUNT(*) INTO v_user_count 
    FROM "DIM_USUARIOS" 
    WHERE name_user = 'superadmin';
    
    -- Contar roles asignados al usuario
    SELECT COUNT(*) INTO v_role_count
    FROM "USUARIOS_ROLES" ur
    JOIN "DIM_USUARIOS" u ON ur.id_user = u.id_user
    WHERE u.name_user = 'superadmin';
    
    IF v_user_count > 0 THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE '✅ USUARIO SUPERADMIN CREADO EXITOSAMENTE';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Username: superadmin';
        RAISE NOTICE 'Password: SuperAdmin2024!';
        RAISE NOTICE 'Estado: ACTIVO';
        RAISE NOTICE 'Roles asignados: %', v_role_count;
        RAISE NOTICE '========================================';
        RAISE NOTICE '⚠️  IMPORTANTE: Cambia esta contraseña después del primer login';
        RAISE NOTICE '========================================';
    ELSE
        RAISE NOTICE '❌ ERROR: No se pudo crear el usuario superadmin';
    END IF;
END $$;

-- PASO 5: Mostrar información del usuario creado
SELECT 
    '👤 INFORMACIÓN DEL USUARIO SUPERADMIN' as info,
    u.id_user,
    u.name_user,
    u.stat_user as estado,
    u.create_at as fecha_creacion,
    u.last_login_at as ultimo_login,
    STRING_AGG(r.desc_Rol, ', ') as roles_asignados
FROM "DIM_USUARIOS" u
LEFT JOIN "USUARIOS_ROLES" ur ON u.id_user = ur.id_user
LEFT JOIN "DIM_ROLES" r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'superadmin'
GROUP BY u.id_user, u.name_user, u.stat_user, u.create_at, u.last_login_at;

-- PASO 6: Verificar permisos del rol SUPERADMIN
SELECT 
    '🔐 PERMISOS DEL ROL SUPERADMIN' as info,
    r.desc_Rol as rol,
    COUNT(rp.id_permiso) as total_permisos
FROM "DIM_ROLES" r
LEFT JOIN "ROLES_PERMISOS" rp ON r.id_rol = rp.id_rol
WHERE r.desc_Rol = 'SUPERADMIN'
GROUP BY r.desc_Rol;

-- PASO 7: (OPCIONAL) Corregir estado de usuarios existentes
-- Descomenta estas líneas si quieres corregir los usuarios existentes
/*
UPDATE "DIM_USUARIOS" 
SET stat_user = 'ACTIVO' 
WHERE stat_user = 'A';

SELECT 
    '✅ USUARIOS ACTUALIZADOS' as info,
    name_user, 
    stat_user 
FROM "DIM_USUARIOS";
*/

-- ============================================
-- CREDENCIALES PARA LOGIN
-- ============================================
/*
╔════════════════════════════════════════════╗
║     CREDENCIALES DEL SUPERADMIN            ║
╚════════════════════════════════════════════╝

Username: superadmin
Password: SuperAdmin2024!

⚠️  IMPORTANTE:
1. Estas credenciales son para la configuración inicial
2. Cambia la contraseña inmediatamente después del primer login
3. No compartas estas credenciales con nadie
4. Usa este usuario solo para tareas administrativas

📝 NOTAS:
- El usuario está activo por defecto
- Tiene todos los permisos del sistema
- Puede crear y gestionar otros administradores
*/
