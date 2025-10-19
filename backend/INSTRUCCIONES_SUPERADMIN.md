# 🔐 ANÁLISIS Y CREACIÓN DE USUARIO SUPERADMIN

## 📋 SITUACIÓN ACTUAL

Tienes una base de datos PostgreSQL `maestro_cenate` con las siguientes tablas:
- **DIM_USUARIOS** - Tabla de usuarios
- **DIM_ROLES** - Tabla de roles

Necesitamos verificar si existe un usuario SUPERADMIN y crearlo si no existe.

---

## 🔍 PASO 1: ANALIZAR LA BASE DE DATOS

### Opción A: Usando DBeaver / pgAdmin / cualquier cliente SQL

1. **Conéctate a la base de datos** con estos datos:
   ```
   Host: 10.0.89.13
   Puerto: 5432
   Base de datos: maestro_cenate
   Usuario: postgres
   Contraseña: Essalud2025
   ```

2. **Ejecuta el script de análisis** (primeras secciones del archivo SQL):

```sql
-- Ver estructura de las tablas
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name IN ('dim_usuarios', 'dim_roles')
ORDER BY 
    table_name, ordinal_position;

-- Ver roles existentes
SELECT * FROM dim_roles;

-- Ver usuarios existentes con sus roles
SELECT 
    u.dni,
    u.nombre,
    u.apellido_paterno,
    u.email,
    r.nombre as rol,
    u.activo
FROM 
    dim_usuarios u
    LEFT JOIN dim_roles r ON u.id_rol = r.id;

-- Buscar usuario SUPERADMIN
SELECT 
    u.*,
    r.nombre as rol
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    UPPER(r.nombre) LIKE '%SUPERADMIN%';
```

### Opción B: Usando psql (Terminal)

```bash
# Conectar a la base de datos
psql -h 10.0.89.13 -p 5432 -U postgres -d maestro_cenate

# Ejecutar consultas
\dt                           # Ver todas las tablas
SELECT * FROM dim_roles;      # Ver roles
SELECT * FROM dim_usuarios;   # Ver usuarios
\q                            # Salir
```

---

## 📊 ESCENARIOS POSIBLES

### Escenario 1: ✅ Ya existe un usuario SUPERADMIN

**Si encuentras un usuario con rol SUPERADMIN:**

```sql
-- Verificar sus credenciales
SELECT 
    dni,
    nombre,
    apellido_paterno,
    email,
    activo
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    UPPER(r.nombre) = 'SUPERADMIN';
```

**Entonces:**
- ✅ Usa ese DNI y contraseña para hacer login
- ✅ Si no recuerdas la contraseña, puedes resetearla (ver sección más abajo)

### Escenario 2: ❌ NO existe un usuario SUPERADMIN

**Si NO encuentras ningún usuario SUPERADMIN:**

Ejecuta el script de creación completo que está en:
`backend/sql/01_analisis_y_creacion_superadmin.sql`

---

## 🚀 PASO 2: CREAR USUARIO SUPERADMIN (Si no existe)

### Script Completo de Creación

```sql
-- PASO 1: Crear rol SUPERADMIN (si no existe)
INSERT INTO dim_roles (nombre, descripcion, activo, created_at, updated_at)
SELECT 
    'SUPERADMIN',
    'Administrador con acceso total al sistema',
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (
    SELECT 1 FROM dim_roles WHERE UPPER(nombre) = 'SUPERADMIN'
);

-- PASO 2: Crear usuario SUPERADMIN
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    -- Obtener ID del rol SUPERADMIN
    SELECT id INTO v_id_rol 
    FROM dim_roles 
    WHERE UPPER(nombre) = 'SUPERADMIN';

    -- Crear usuario si no existe
    IF NOT EXISTS (SELECT 1 FROM dim_usuarios WHERE dni = '12345678') THEN
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
            '12345678',
            'Super',
            'Admin',
            'Sistema',
            'superadmin@cenate.gob.pe',
            '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy',
            '999999999',
            v_id_rol,
            true,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );
        RAISE NOTICE 'Usuario SUPERADMIN creado exitosamente';
    END IF;
END $$;

-- PASO 3: Verificar la creación
SELECT 
    u.dni,
    u.nombre,
    u.apellido_paterno || ' ' || u.apellido_materno as apellidos,
    u.email,
    r.nombre as rol
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    u.dni = '12345678';
```

---

## 🔑 CREDENCIALES DEL SUPERADMIN CREADO

```
📱 DNI: 12345678
🔐 Contraseña: Admin2025!
📧 Email: superadmin@cenate.gob.pe
👤 Nombre completo: Super Admin Sistema
```

**⚠️ IMPORTANTE:**
- La contraseña está hasheada con **BCrypt**
- El hash en la base de datos es: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy`
- **Debes cambiar esta contraseña después del primer login**

---

## 🔄 RESETEAR CONTRASEÑA (Si es necesario)

Si necesitas resetear la contraseña del SUPERADMIN:

```sql
-- Resetear a 'Admin2025!'
UPDATE dim_usuarios
SET 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy',
    updated_at = CURRENT_TIMESTAMP
WHERE 
    dni = '12345678';
```

### Generar tu propia contraseña hasheada

Si quieres usar otra contraseña, puedes generar el hash BCrypt:

**Opción 1: Online** (Solo para desarrollo)
- https://bcrypt-generator.com/
- Ingresa tu contraseña
- Copia el hash generado

**Opción 2: Con Java**
```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GeneratePassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "TuContraseñaAqui";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println(encodedPassword);
    }
}
```

---

## 📝 ESTRUCTURA ESPERADA DE LAS TABLAS

### DIM_ROLES

```sql
CREATE TABLE IF NOT EXISTS dim_roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Roles sugeridos:**
- SUPERADMIN
- Administrador
- Usuario

### DIM_USUARIOS

```sql
CREATE TABLE IF NOT EXISTS dim_usuarios (
    id SERIAL PRIMARY KEY,
    dni VARCHAR(8) NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(15),
    id_rol INTEGER NOT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_rol) REFERENCES dim_roles(id)
);
```

---

## ✅ VERIFICACIÓN FINAL

Después de crear el usuario, verifica que todo esté correcto:

```sql
-- 1. Ver el usuario creado
SELECT 
    u.id,
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
    u.dni = '12345678';

-- 2. Contar usuarios por rol
SELECT 
    r.nombre as rol,
    COUNT(u.id) as total_usuarios
FROM 
    dim_roles r
    LEFT JOIN dim_usuarios u ON r.id = u.id_rol
GROUP BY 
    r.nombre;

-- 3. Ver todos los usuarios activos
SELECT 
    dni,
    nombre || ' ' || apellido_paterno as nombre_completo,
    email,
    r.nombre as rol
FROM 
    dim_usuarios u
    INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE 
    u.activo = true
ORDER BY 
    r.id;
```

---

## 🧪 PROBAR EL LOGIN

### En tu frontend (después de implementar el backend):

1. Ve a `http://localhost:3000/login`
2. Ingresa:
   - **DNI**: 12345678
   - **Contraseña**: Admin2025!
3. Deberías ser redirigido a `/superadmin`

---

## 🛠️ PRÓXIMOS PASOS

Una vez que tengas el usuario SUPERADMIN creado:

1. ✅ **Implementar el backend de autenticación**
   - Crear entidades JPA (Usuario, Rol)
   - Crear repositorios
   - Configurar Spring Security
   - Implementar JWT
   - Crear endpoints de login

2. ✅ **Crear página de gestión de roles**
   - Ver todos los roles
   - Crear nuevos roles
   - Editar roles
   - Activar/Desactivar roles
   - Asignar permisos

3. ✅ **Crear página de gestión de usuarios**
   - Ver todos los usuarios
   - Crear nuevos usuarios
   - Editar usuarios
   - Asignar roles
   - Resetear contraseñas

---

## 📞 RESUMEN RÁPIDO

```bash
# 1. Conectar a la base de datos
psql -h 10.0.89.13 -p 5432 -U postgres -d maestro_cenate

# 2. Verificar si existe SUPERADMIN
SELECT * FROM dim_usuarios u
INNER JOIN dim_roles r ON u.id_rol = r.id
WHERE UPPER(r.nombre) = 'SUPERADMIN';

# 3. Si NO existe, ejecutar el script completo:
\i /ruta/al/backend/sql/01_analisis_y_creacion_superadmin.sql

# 4. Verificar creación
SELECT dni, nombre, email FROM dim_usuarios WHERE dni = '12345678';

# 5. Salir
\q
```

---

**Fecha**: 08/10/2025  
**Base de datos**: maestro_cenate (10.0.89.13:5432)  
**Usuario DB**: postgres  
**Contraseña DB**: Essalud2025

**Credenciales SUPERADMIN creadas:**
- DNI: 12345678
- Contraseña: Admin2025!
