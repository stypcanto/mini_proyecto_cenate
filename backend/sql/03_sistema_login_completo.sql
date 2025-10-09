-- ============================================
-- SISTEMA DE LOGIN CON ROLES Y PERMISOS
-- Base de datos: maestro_cenate (PostgreSQL)
-- Fecha: 08/10/2025
-- ============================================

-- PASO 1: Verificar tablas existentes
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅ Verificando estructura de base de datos...';
END $$;

SELECT 
    table_name,
    table_type
FROM 
    information_schema.tables
WHERE 
    table_schema = 'public'
    AND table_name IN ('dim_usuarios', 'dim_roles', 'usuarios_roles', 'dim_permisos', 'roles_permisos')
ORDER BY 
    table_name;

-- PASO 2: Crear/Verificar tabla DIM_ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS dim_roles (
    id_rol SERIAL PRIMARY KEY,
    desc_rol VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 3: Crear/Verificar tabla DIM_PERMISOS
-- ============================================
CREATE TABLE IF NOT EXISTS dim_permisos (
    id_permiso SERIAL PRIMARY KEY,
    desc_permiso VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 4: Crear/Verificar tabla DIM_USUARIOS
-- ============================================
CREATE TABLE IF NOT EXISTS dim_usuarios (
    id_user SERIAL PRIMARY KEY,
    name_user VARCHAR(100) UNIQUE NOT NULL,
    pass_user VARCHAR(255) NOT NULL,
    stat_user VARCHAR(20) DEFAULT 'ACTIVO' CHECK (stat_user IN ('ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    create_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    update_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    failed_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP NULL,
    last_login_at TIMESTAMP NULL,
    reset_token_hash VARCHAR(255) NULL,
    reset_token_expires_at TIMESTAMP NULL
);

-- PASO 5: Crear/Verificar tabla USUARIOS_ROLES
-- ============================================
CREATE TABLE IF NOT EXISTS usuarios_roles (
    id_user INTEGER NOT NULL REFERENCES dim_usuarios(id_user) ON DELETE CASCADE,
    id_rol INTEGER NOT NULL REFERENCES dim_roles(id_rol) ON DELETE CASCADE,
    asig_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_user, id_rol)
);

-- PASO 6: Crear/Verificar tabla ROLES_PERMISOS
-- ============================================
CREATE TABLE IF NOT EXISTS roles_permisos (
    id_rol INTEGER NOT NULL REFERENCES dim_roles(id_rol) ON DELETE CASCADE,
    id_permiso INTEGER NOT NULL REFERENCES dim_permisos(id_permiso) ON DELETE CASCADE,
    asig_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso)
);

-- PASO 7: Insertar roles del sistema
-- ============================================
INSERT INTO dim_roles (desc_rol) 
SELECT 'SUPERADMIN' WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE desc_rol = 'SUPERADMIN');

INSERT INTO dim_roles (desc_rol) 
SELECT 'ADMIN' WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE desc_rol = 'ADMIN');

INSERT INTO dim_roles (desc_rol) 
SELECT 'ESPECIALISTA' WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE desc_rol = 'ESPECIALISTA');

INSERT INTO dim_roles (desc_rol) 
SELECT 'RADIOLOGO' WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE desc_rol = 'RADIOLOGO');

INSERT INTO dim_roles (desc_rol) 
SELECT 'USUARIO' WHERE NOT EXISTS (SELECT 1 FROM dim_roles WHERE desc_rol = 'USUARIO');

-- PASO 8: Insertar permisos del sistema
-- ============================================
INSERT INTO dim_permisos (desc_permiso) VALUES
('GESTIONAR_SUPERADMINS'),
('GESTIONAR_ADMINS'),
('GESTIONAR_USUARIOS'),
('VER_USUARIOS'),
('GESTIONAR_ROLES'),
('ASIGNAR_ROLES'),
('GESTIONAR_PERMISOS'),
('ACCESO_APP_ESPECIALIDADES'),
('ACCESO_APP_RADIOLOGIA'),
('ACCESO_APP_TELEURGENCIAS'),
('ACCESO_APP_GESTION_CITAS'),
('ACCESO_APP_CALIDAD'),
('ACCESO_GESTION_TI'),
('VER_AUDITORIA'),
('GESTIONAR_AUDITORIA'),
('VER_REPORTES'),
('GENERAR_REPORTES'),
('EXPORTAR_DATOS')
ON CONFLICT (desc_permiso) DO NOTHING;

-- PASO 9: Asignar permisos a roles
-- ============================================

-- SUPERADMIN: Todos los permisos
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'SUPERADMIN'),
    id_permiso
FROM dim_permisos
ON CONFLICT DO NOTHING;

-- ADMIN: Todos excepto gestionar superadmins
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'ADMIN'),
    id_permiso
FROM dim_permisos
WHERE desc_permiso != 'GESTIONAR_SUPERADMINS'
ON CONFLICT DO NOTHING;

-- ESPECIALISTA: Acceso a apps clínicas
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'ESPECIALISTA'),
    id_permiso
FROM dim_permisos
WHERE desc_permiso IN ('VER_USUARIOS', 'ACCESO_APP_ESPECIALIDADES', 'ACCESO_APP_GESTION_CITAS', 'VER_REPORTES')
ON CONFLICT DO NOTHING;

-- RADIOLOGO: Acceso a radiología
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'RADIOLOGO'),
    id_permiso
FROM dim_permisos
WHERE desc_permiso IN ('VER_USUARIOS', 'ACCESO_APP_RADIOLOGIA', 'VER_REPORTES')
ON CONFLICT DO NOTHING;

-- USUARIO: Acceso básico
INSERT INTO roles_permisos (id_rol, id_permiso)
SELECT 
    (SELECT id_rol FROM dim_roles WHERE desc_rol = 'USUARIO'),
    id_permiso
FROM dim_permisos
WHERE desc_permiso IN ('ACCESO_APP_ESPECIALIDADES', 'VER_REPORTES')
ON CONFLICT DO NOTHING;

-- PASO 10: Crear usuario SUPERADMIN
-- ============================================
-- Password encriptado con BCrypt: SuperAdmin2024!
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
        RAISE NOTICE 'Username: superadmin';
        RAISE NOTICE 'Password: SuperAdmin2024!';
    ELSE
        RAISE NOTICE '⚠️  El usuario superadmin ya existe';
    END IF;
END $$;

-- PASO 11: Crear índices para optimización
-- ============================================
CREATE INDEX IF NOT EXISTS idx_usuarios_name ON dim_usuarios(name_user);
CREATE INDEX IF NOT EXISTS idx_usuarios_stat ON dim_usuarios(stat_user);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_user ON usuarios_roles(id_user);
CREATE INDEX IF NOT EXISTS idx_usuarios_roles_rol ON usuarios_roles(id_rol);
CREATE INDEX IF NOT EXISTS idx_roles_permisos_rol ON roles_permisos(id_rol);
CREATE INDEX IF NOT EXISTS idx_roles_permisos_permiso ON roles_permisos(id_permiso);

-- PASO 12: Crear función para actualizar update_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_dim_usuarios_updated_at'
    ) THEN
        CREATE TRIGGER update_dim_usuarios_updated_at 
        BEFORE UPDATE ON dim_usuarios
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- PASO 13: Verificación final
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SISTEMA DE AUTENTICACIÓN INSTALADO';
    RAISE NOTICE '========================================';
END $$;

-- Ver resumen de roles
SELECT 
    '📊 ROLES CREADOS' as info,
    id_rol,
    desc_rol,
    (SELECT COUNT(*) FROM usuarios_roles WHERE usuarios_roles.id_rol = dim_roles.id_rol) as usuarios,
    (SELECT COUNT(*) FROM roles_permisos WHERE roles_permisos.id_rol = dim_roles.id_rol) as permisos
FROM dim_roles
ORDER BY id_rol;

-- Ver usuario SUPERADMIN creado
SELECT 
    '👤 USUARIO SUPERADMIN' as info,
    u.id_user,
    u.name_user,
    u.stat_user,
    STRING_AGG(r.desc_rol, ', ') as roles,
    u.create_at
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'superadmin'
GROUP BY u.id_user, u.name_user, u.stat_user, u.create_at;

-- PASO 14: Queries útiles para administración
-- ============================================

-- Ver todos los usuarios con sus roles
/*
SELECT 
    u.id_user,
    u.name_user,
    u.stat_user,
    STRING_AGG(r.desc_rol, ', ') as roles,
    u.last_login_at,
    u.create_at
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
GROUP BY u.id_user, u.name_user, u.stat_user, u.last_login_at, u.create_at
ORDER BY u.id_user;
*/

-- Ver permisos de un rol específico
/*
SELECT 
    r.desc_rol,
    p.desc_permiso
FROM roles_permisos rp
JOIN dim_roles r ON rp.id_rol = r.id_rol
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE r.desc_rol = 'ADMIN'
ORDER BY p.desc_permiso;
*/

-- Ver permisos de un usuario
/*
SELECT DISTINCT
    u.name_user,
    p.desc_permiso
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN roles_permisos rp ON r.id_rol = rp.id_rol
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE u.name_user = 'superadmin'
ORDER BY p.desc_permiso;
*/

-- ============================================
-- 🔐 CREDENCIALES DEL SUPERADMIN
-- ============================================
/*
Username: superadmin
Password: SuperAdmin2024!
Email: N/A (puedes agregarlo si necesitas)

IMPORTANTE: 
1. Cambiar esta contraseña después del primer login
2. Este usuario tiene acceso total al sistema
3. Usa este usuario solo para configuración inicial
*/
