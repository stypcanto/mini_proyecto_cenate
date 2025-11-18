-- ============================================
-- SCRIPT DE CORRECCIÓN Y CREACIÓN SISTEMA AUTENTICACIÓN
-- Base de datos: maestro_cenate (PostgreSQL)
-- Fecha: 08/10/2025
-- ============================================

-- PASO 1: Backup de datos existentes (si existen)
-- ============================================
CREATE TABLE IF NOT EXISTS dim_usuarios_backup AS 
SELECT * FROM dim_usuarios WHERE EXISTS (SELECT 1 FROM dim_usuarios LIMIT 1);

CREATE TABLE IF NOT EXISTS usuarios_roles_backup AS 
SELECT * FROM usuarios_roles WHERE EXISTS (SELECT 1 FROM usuarios_roles LIMIT 1);

CREATE TABLE IF NOT EXISTS dim_roles_backup AS 
SELECT * FROM dim_roles WHERE EXISTS (SELECT 1 FROM dim_roles LIMIT 1);

-- PASO 2: Eliminar tablas antiguas si existen (CUIDADO - Solo en desarrollo)
-- ============================================
DROP TABLE IF EXISTS usuarios_roles CASCADE;
DROP TABLE IF EXISTS roles_permisos CASCADE;
DROP TABLE IF EXISTS dim_usuarios CASCADE;
DROP TABLE IF EXISTS dim_roles CASCADE;
DROP TABLE IF EXISTS dim_permisos CASCADE;

-- PASO 3: Crear tabla DIM_ROLES
-- ============================================
CREATE TABLE dim_roles (
    id_rol SERIAL PRIMARY KEY,
    desc_rol VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 4: Crear tabla DIM_PERMISOS
-- ============================================
CREATE TABLE dim_permisos (
    id_permiso SERIAL PRIMARY KEY,
    desc_permiso VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 5: Crear tabla DIM_USUARIOS
-- ============================================
CREATE TABLE dim_usuarios (
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

-- PASO 6: Crear tabla intermedia USUARIOS_ROLES (muchos a muchos)
-- ============================================
CREATE TABLE usuarios_roles (
    id_user INTEGER NOT NULL REFERENCES dim_usuarios(id_user) ON DELETE CASCADE,
    id_rol INTEGER NOT NULL REFERENCES dim_roles(id_rol) ON DELETE CASCADE,
    asig_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_user, id_rol)
);

-- PASO 7: Crear tabla intermedia ROLES_PERMISOS (muchos a muchos)
-- ============================================
CREATE TABLE roles_permisos (
    id_rol INTEGER NOT NULL REFERENCES dim_roles(id_rol) ON DELETE CASCADE,
    id_permiso INTEGER NOT NULL REFERENCES dim_permisos(id_permiso) ON DELETE CASCADE,
    asig_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_rol, id_permiso)
);

-- PASO 8: Insertar roles del sistema
-- ============================================
INSERT INTO dim_roles (desc_rol) VALUES
('SUPERADMIN'),
('ADMIN'),
('ESPECIALISTA'),
('RADIOLOGO'),
('USUARIO');

-- PASO 9: Insertar permisos del sistema
-- ============================================
INSERT INTO dim_permisos (desc_permiso) VALUES
-- Permisos de Usuarios
('GESTIONAR_SUPERADMINS'),
('GESTIONAR_ADMINS'),
('GESTIONAR_USUARIOS'),
('VER_USUARIOS'),

-- Permisos de Roles y Permisos
('GESTIONAR_ROLES'),
('ASIGNAR_ROLES'),
('GESTIONAR_PERMISOS'),

-- Permisos de Aplicaciones
('ACCESO_APP_ESPECIALIDADES'),
('ACCESO_APP_RADIOLOGIA'),
('ACCESO_APP_TELEURGENCIAS'),
('ACCESO_APP_GESTION_CITAS'),
('ACCESO_APP_CALIDAD'),
('ACCESO_GESTION_TI'),

-- Permisos de Auditoría
('VER_AUDITORIA'),
('GESTIONAR_AUDITORIA'),

-- Permisos de Reportes
('VER_REPORTES'),
('GENERAR_REPORTES'),
('EXPORTAR_DATOS');

-- PASO 10: Asignar permisos a roles
-- ============================================

-- SUPERADMIN: Solo gestiona quién es ADMIN
INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
(1, 2),  -- GESTIONAR_ADMINS
(1, 4);  -- VER_USUARIOS

-- ADMIN: Control total del sistema (todos los permisos excepto gestionar superadmins)
INSERT INTO roles_permisos (id_rol, id_permiso) 
SELECT 2, id_permiso FROM dim_permisos 
WHERE id_permiso NOT IN (1, 2); -- Todos menos gestionar superadmins y admins

-- ESPECIALISTA: Acceso a apps clínicas
INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
(3, 4),   -- VER_USUARIOS
(3, 8),   -- ACCESO_APP_ESPECIALIDADES
(3, 11),  -- ACCESO_APP_GESTION_CITAS
(3, 16);  -- VER_REPORTES

-- RADIOLOGO: Acceso a radiología
INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
(4, 4),   -- VER_USUARIOS
(4, 9),   -- ACCESO_APP_RADIOLOGIA
(4, 16);  -- VER_REPORTES

-- USUARIO: Acceso básico
INSERT INTO roles_permisos (id_rol, id_permiso) VALUES
(5, 8),   -- ACCESO_APP_ESPECIALIDADES
(5, 16);  -- VER_REPORTES

-- PASO 11: Crear usuario SUPERADMIN inicial
-- ============================================
-- Password: SuperAdmin2024! (encriptado con BCrypt)
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
    '$2a$10$xqYvZ8rN5KGnLZGH.BnPYOXGH9YyY9LGYqKJKqLZGH9YyY9LGYqKJ', -- SuperAdmin2024!
    'ACTIVO',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    0
);

-- PASO 12: Asignar rol SUPERADMIN al usuario
-- ============================================
INSERT INTO usuarios_roles (id_user, id_rol) VALUES
(1, 1);

-- PASO 13: Crear índices para optimizar consultas
-- ============================================
CREATE INDEX idx_usuarios_name ON dim_usuarios(name_user);
CREATE INDEX idx_usuarios_stat ON dim_usuarios(stat_user);
CREATE INDEX idx_usuarios_roles_user ON usuarios_roles(id_user);
CREATE INDEX idx_usuarios_roles_rol ON usuarios_roles(id_rol);
CREATE INDEX idx_roles_permisos_rol ON roles_permisos(id_rol);
CREATE INDEX idx_roles_permisos_permiso ON roles_permisos(id_permiso);

-- PASO 14: Crear función para actualizar update_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a dim_usuarios
CREATE TRIGGER update_dim_usuarios_updated_at BEFORE UPDATE ON dim_usuarios
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- PASO 15: Verificar la configuración
-- ============================================
SELECT '✅ ROLES CREADOS:' as info;
SELECT * FROM dim_roles;

SELECT '✅ PERMISOS CREADOS:' as info;
SELECT COUNT(*) as total_permisos FROM dim_permisos;

SELECT '✅ PERMISOS POR ROL:' as info;
SELECT 
    r.desc_rol,
    COUNT(p.id_permiso) as cantidad_permisos
FROM dim_roles r
LEFT JOIN roles_permisos rp ON r.id_rol = rp.id_rol
LEFT JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
GROUP BY r.id_rol, r.desc_rol
ORDER BY r.id_rol;

SELECT '✅ USUARIO SUPERADMIN CREADO:' as info;
SELECT 
    u.id_user,
    u.name_user,
    u.stat_user,
    r.desc_rol
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
WHERE u.id_user = 1;

-- ============================================
-- CREDENCIALES DEL SUPERADMIN
-- ============================================
/*
Username: superadmin
Password: SuperAdmin2024!

IMPORTANTE: Cambiar esta contraseña después del primer login
*/

-- ============================================
-- QUERIES ÚTILES PARA ADMINISTRACIÓN
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
    p.desc_permiso
FROM roles_permisos rp
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE rp.id_rol = (SELECT id_rol FROM dim_roles WHERE desc_rol = 'ADMIN');
*/

-- Resetear contraseña de un usuario
/*
UPDATE dim_usuarios
SET 
    pass_user = '$2a$10$xqYvZ8rN5KGnLZGH.BnPYOXGH9YyY9LGYqKJKqLZGH9YyY9LGYqKJ', -- SuperAdmin2024!
    password_changed_at = CURRENT_TIMESTAMP,
    failed_attempts = 0,
    locked_until = NULL
WHERE name_user = 'superadmin';
*/
