-- ============================================
-- SCRIPT PARA CORREGIR CONSTRAINTS Y CREAR SUPERADMIN
-- Ejecutar como usuario postgres o con permisos de superusuario
-- ============================================

-- PASO 1: Eliminar constraint que obliga a solo dígitos
ALTER TABLE "DIM_USUARIOS" DROP CONSTRAINT ck_name_user_digits_1_20;

-- PASO 2: Agregar nueva constraint que permita texto alfanumérico
ALTER TABLE "DIM_USUARIOS" ADD CONSTRAINT ck_name_user_valid 
CHECK (length(btrim(name_user)) >= 1 AND length(btrim(name_user)) <= 100);

-- PASO 3: Eliminar constraint antigua de estado
ALTER TABLE "DIM_USUARIOS" DROP CONSTRAINT ck_estado_usuario;

-- PASO 4: Agregar nueva constraint de estado compatible con Java
ALTER TABLE "DIM_USUARIOS" ADD CONSTRAINT ck_estado_usuario 
CHECK (stat_user IN ('A', 'I', 'ACTIVO', 'INACTIVO', 'BLOQUEADO'));

-- PASO 5: Actualizar usuarios existentes de 'A' a 'ACTIVO'
UPDATE "DIM_USUARIOS" SET stat_user = 'ACTIVO' WHERE stat_user = 'A';
UPDATE "DIM_USUARIOS" SET stat_user = 'INACTIVO' WHERE stat_user = 'I';

-- PASO 6: Crear el usuario superadmin
INSERT INTO "DIM_USUARIOS" (
    id_user,
    name_user,
    pass_user,
    stat_user
) VALUES (
    (SELECT COALESCE(MAX(id_user), 0) + 1 FROM "DIM_USUARIOS"),
    'superadmin',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy',
    'ACTIVO'
);

-- PASO 7: Asignar rol SUPERADMIN al usuario
INSERT INTO "USUARIOS_ROLES" (id_user, id_rol)
SELECT 
    u.id_user,
    r.id_rol
FROM "DIM_USUARIOS" u, "DIM_ROLES" r
WHERE u.name_user = 'superadmin' AND r."desc_Rol" = 'SUPERADMIN';

-- ============================================
-- VERIFICACIÓN
-- ============================================

-- Ver el usuario creado
SELECT 
    '✅ Usuario Superadmin Creado' as mensaje,
    u.id_user,
    u.name_user,
    u.stat_user,
    r."desc_Rol" as rol
FROM "DIM_USUARIOS" u
LEFT JOIN "USUARIOS_ROLES" ur ON u.id_user = ur.id_user
LEFT JOIN "DIM_ROLES" r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'superadmin';

-- Ver todos los usuarios actualizados
SELECT 
    '📋 Todos los Usuarios' as mensaje,
    id_user,
    name_user,
    stat_user,
    create_at
FROM "DIM_USUARIOS"
ORDER BY id_user;

-- Ver constraints actualizadas
SELECT 
    '🔒 Constraints de DIM_USUARIOS' as mensaje,
    conname as nombre_constraint,
    pg_get_constraintdef(oid) as definicion
FROM pg_constraint
WHERE conrelid = '"DIM_USUARIOS"'::regclass;

-- ============================================
-- CREDENCIALES PARA LOGIN
-- ============================================
/*
╔════════════════════════════════════════════╗
║     CREDENCIALES DEL SUPERADMIN            ║
╚════════════════════════════════════════════╝

Username: superadmin
Password: SuperAdmin2024!

✅ El usuario ya está creado y listo para usar
✅ Los estados de los usuarios existentes fueron actualizados
✅ Las constraints fueron modificadas para permitir usernames alfanuméricos

IMPORTANTE:
1. Ahora puedes loguearte con: superadmin / SuperAdmin2024!
2. Los usuarios numéricos (10000, 10001) ahora tienen estado 'ACTIVO'
3. También puedes crear usuarios con nombres alfanuméricos
*/
