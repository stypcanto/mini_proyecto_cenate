# 🔐 Sistema de Login con Roles y Permisos - CENATE

## 📋 Índice
1. [Instalación](#instalación)
2. [Base de Datos](#base-de-datos)
3. [Credenciales del SUPERADMIN](#credenciales)
4. [API Endpoints](#api-endpoints)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Testing](#testing)

---

## 🚀 Instalación

### Paso 1: Configurar Base de Datos

Ejecuta el script SQL en tu base de datos PostgreSQL:

```bash
psql -U postgres -d maestro_cenate -f backend/sql/03_sistema_login_completo.sql
```

Este script:
- ✅ Crea las tablas necesarias (si no existen)
- ✅ Crea roles: SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO
- ✅ Crea 18 permisos del sistema
- ✅ Asigna permisos a cada rol
- ✅ Crea el usuario SUPERADMIN con contraseña encriptada
- ✅ Crea índices para optimización

### Paso 2: Verificar application.properties

Asegúrate de que `backend/src/main/resources/application.properties` tenga la configuración correcta:

```properties
# Base de Datos
spring.datasource.url=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
spring.datasource.username=postgres
spring.datasource.password=Essalud2025

# JWT (Opcional - usa los valores por defecto)
jwt.secret.key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

### Paso 3: Compilar y Ejecutar

```bash
cd backend
./mvnw clean package
./mvnw spring-boot:run
```

O si usas Gradle:

```bash
./gradlew clean build
./gradlew bootRun
```

---

## 🗄️ Base de Datos

### Estructura de Tablas

```
DIM_USUARIOS
├── id_user (PK)
├── name_user (username - UNIQUE)
├── pass_user (password encriptada)
├── stat_user (ACTIVO/INACTIVO/BLOQUEADO)
├── create_at, update_at
├── password_changed_at
├── failed_attempts
├── locked_until
├── last_login_at
└── reset_token_hash, reset_token_expires_at

DIM_ROLES
├── id_rol (PK)
├── desc_rol (nombre del rol)
├── created_at, updated_at

USUARIOS_ROLES (Many-to-Many)
├── id_user (FK)
├── id_rol (FK)
└── asig_en (timestamp)

DIM_PERMISOS
├── id_permiso (PK)
├── desc_permiso (nombre del permiso)
├── created_at, updated_at

ROLES_PERMISOS (Many-to-Many)
├── id_rol (FK)
├── id_permiso (FK)
└── asig_en (timestamp)
```

### Roles y Permisos

#### SUPERADMIN
- ✅ **Todos los permisos** (18 permisos)
- Control total del sistema

#### ADMIN
- ✅ Gestionar usuarios, roles y permisos
- ✅ Acceso a todas las aplicaciones
- ✅ Generar reportes
- ❌ NO puede gestionar SUPERADMINs

#### ESPECIALISTA
- ✅ Acceso a apps de especialidades
- ✅ Gestión de citas
- ✅ Ver reportes

#### RADIOLOGO
- ✅ Acceso a app de radiología
- ✅ Ver reportes

#### USUARIO
- ✅ Acceso básico a especialidades
- ✅ Ver reportes

---

## 🔑 Credenciales del SUPERADMIN

```
Username: superadmin
Password: SuperAdmin2024!
```

**⚠️ IMPORTANTE:** Cambiar esta contraseña después del primer login.

---

## 📡 API Endpoints

### Autenticación (Públicos)

#### 1. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "superadmin",
  "password": "SuperAdmin2024!"
}
```

**Respuesta Exitosa (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "superadmin",
  "roles": ["SUPERADMIN"],
  "permisos": [
    "GESTIONAR_SUPERADMINS",
    "GESTIONAR_ADMINS",
    "GESTIONAR_USUARIOS",
    "VER_USUARIOS",
    ...
  ],
  "message": "Login exitoso"
}
```

**Respuesta Error (401 Unauthorized):**
```json
{
  "message": "Usuario o contraseña incorrectos"
}
```

#### 2. Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "nuevo_usuario",
  "password": "Password123!",
  "roleIds": [2],
  "estado": "ACTIVO"
}
```

#### 3. Health Check
```http
GET /api/auth/health
```

### Gestión de Usuarios (Protegidos - Requieren JWT)

Todos los endpoints requieren el header:
```
Authorization: Bearer {token}
```

#### 1. Obtener Todos los Usuarios
```http
GET /api/usuarios
Authorization: Bearer {token}
```
**Roles permitidos:** SUPERADMIN, ADMIN

#### 2. Obtener Usuario por ID
```http
GET /api/usuarios/{id}
Authorization: Bearer {token}
```
**Roles permitidos:** SUPERADMIN, ADMIN

#### 3. Obtener Usuario Actual
```http
GET /api/usuarios/me
Authorization: Bearer {token}
```
**Roles permitidos:** Cualquier usuario autenticado

#### 4. Activar Usuario
```http
PUT /api/usuarios/{id}/activate
Authorization: Bearer {token}
```
**Roles permitidos:** SUPERADMIN, ADMIN

#### 5. Desactivar Usuario
```http
PUT /api/usuarios/{id}/deactivate
Authorization: Bearer {token}
```
**Roles permitidos:** SUPERADMIN, ADMIN

#### 6. Desbloquear Usuario
```http
PUT /api/usuarios/{id}/unlock
Authorization: Bearer {token}
```
**Roles permitidos:** SUPERADMIN, ADMIN

#### 7. Eliminar Usuario
```http
DELETE /api/usuarios/{id}
Authorization: Bearer {token}
```
**Roles permitidos:** Solo SUPERADMIN

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Login con cURL

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SuperAdmin2024!"
  }'
```

### Ejemplo 2: Obtener Usuario Actual con cURL

```bash
TOKEN="tu_token_jwt_aqui"

curl -X GET http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer $TOKEN"
```

### Ejemplo 3: Crear Usuario con Postman

1. Method: POST
2. URL: `http://localhost:8080/api/auth/register`
3. Headers:
   - Content-Type: application/json
4. Body (raw JSON):
```json
{
  "username": "doctor_perez",
  "password": "Doctor2024!",
  "roleIds": [3],
  "estado": "ACTIVO"
}
```

### Ejemplo 4: Uso en Frontend (JavaScript/React)

```javascript
// Login
async function login(username, password) {
  const response = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify({
      userId: data.userId,
      username: data.username,
      roles: data.roles,
      permisos: data.permisos
    }));
    return data;
  } else {
    throw new Error('Login fallido');
  }
}

// Obtener usuario actual
async function getCurrentUser() {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:8080/api/usuarios/me', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (response.ok) {
    return await response.json();
  }
}

// Verificar si tiene permiso
function hasPermission(permission) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user?.permisos?.includes(permission) || false;
}

// Uso
if (hasPermission('GESTIONAR_USUARIOS')) {
  // Mostrar interfaz de gestión de usuarios
}
```

---

## 🧪 Testing

### Probar con Postman

1. **Importar colección:** Crea una nueva colección en Postman
2. **Crear ambiente:** 
   - Variable: `baseUrl` = `http://localhost:8080`
   - Variable: `token` = (se llenará automáticamente)

3. **Tests automatizados:**

**Login (guardar token):**
```javascript
// En la pestaña "Tests" del request de login
pm.test("Login successful", function () {
    pm.response.to.have.status(200);
    var jsonData = pm.response.json();
    pm.environment.set("token", jsonData.token);
});
```

### Probar Seguridad

#### Test 1: Login con credenciales incorrectas
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "contraseña_incorrecta"
  }'
```
**Esperado:** 401 Unauthorized

#### Test 2: Acceso sin token
```bash
curl -X GET http://localhost:8080/api/usuarios
```
**Esperado:** 401 Unauthorized o 403 Forbidden

#### Test 3: Bloqueo por intentos fallidos
Hacer 5 intentos con contraseña incorrecta:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:8080/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username": "superadmin", "password": "wrong"}'
  echo "\nIntento $i"
done
```
**Esperado:** En el 5to intento, el usuario debe ser bloqueado por 30 minutos

### Probar Roles

#### Test 1: SUPERADMIN puede eliminar usuarios
```bash
TOKEN="token_del_superadmin"
curl -X DELETE http://localhost:8080/api/usuarios/2 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 200 OK

#### Test 2: ADMIN NO puede eliminar usuarios
```bash
TOKEN="token_del_admin"
curl -X DELETE http://localhost:8080/api/usuarios/2 \
  -H "Authorization: Bearer $TOKEN"
```
**Esperado:** 403 Forbidden

---

## 🔧 Troubleshooting

### Problema 1: Error de conexión a la base de datos
```
Error: Unable to connect to database
```
**Solución:**
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `application.properties`
3. Verificar que la base de datos `maestro_cenate` exista

### Problema 2: Token expirado
```json
{
  "message": "Token expired"
}
```
**Solución:** Hacer login nuevamente para obtener un nuevo token

### Problema 3: Usuario bloqueado
```json
{
  "message": "Cuenta bloqueada por múltiples intentos fallidos"
}
```
**Solución:** 
- Esperar 30 minutos
- O desbloquear manualmente: `PUT /api/usuarios/{id}/unlock`

---

## 📚 Recursos Adicionales

### Generar Contraseñas BCrypt

Puedes usar este código Java para generar nuevas contraseñas:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class PasswordGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String rawPassword = "MiNuevaContraseña123!";
        String encodedPassword = encoder.encode(rawPassword);
        System.out.println("Password encriptada: " + encodedPassword);
    }
}
```

O usa una herramienta online (cuidado con contraseñas en producción):
- https://bcrypt-generator.com/

### Queries SQL Útiles

```sql
-- Ver todos los usuarios con sus roles
SELECT 
    u.id_user,
    u.name_user,
    u.stat_user,
    STRING_AGG(r.desc_rol, ', ') as roles
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
GROUP BY u.id_user, u.name_user, u.stat_user;

-- Ver permisos de un usuario
SELECT DISTINCT
    u.name_user,
    p.desc_permiso
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN roles_permisos rp ON r.id_rol = rp.id_rol
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE u.name_user = 'superadmin';

-- Resetear intentos fallidos manualmente
UPDATE dim_usuarios
SET failed_attempts = 0, locked_until = NULL
WHERE name_user = 'superadmin';
```

---

## 🎯 Próximos Pasos

1. ✅ Sistema de login funcionando
2. ✅ Gestión de roles y permisos
3. ✅ Bloqueo por intentos fallidos
4. 🔄 Implementar cambio de contraseña
5. 🔄 Implementar recuperación de contraseña
6. 🔄 Implementar auditoría de acciones
7. 🔄 Implementar sesiones múltiples
8. 🔄 Panel de administración en frontend

---

## 👨‍💻 Soporte

Para soporte o reportar issues:
1. Revisar logs del backend
2. Verificar la base de datos
3. Consultar esta documentación

**Logs útiles:**
- Backend logs: consola donde corre Spring Boot
- Base de datos: `SELECT * FROM dim_usuarios WHERE name_user = 'usuario';`

---

**Fecha:** 08/10/2025  
**Versión:** 1.0.0  
**Sistema:** CENATE - Centro Nacional de Telemedicina
