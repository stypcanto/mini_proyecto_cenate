# 🏥 CENATE - Sistema de Autenticación y Autorización

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![React](https://img.shields.io/badge/React-18-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![License](https://img.shields.io/badge/License-Proprietary-red)

**Sistema completo de login con roles y permisos para el Centro Nacional de Telemedicina**

[Instalación](#-instalación-rápida) •
[Documentación](#-documentación) •
[API](#-api-rest) •
[Demo](#-demo)

</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación Rápida](#-instalación-rápida)
- [Credenciales](#-credenciales-iniciales)
- [Documentación](#-documentación)
- [API REST](#-api-rest)
- [Frontend](#-frontend)
- [Testing](#-testing)
- [Despliegue](#-despliegue)
- [Roadmap](#-roadmap)
- [Soporte](#-soporte)

---

## ✨ Características

### Autenticación
- ✅ Login con JWT (JSON Web Tokens)
- ✅ Registro de usuarios
- ✅ Cambio de contraseña
- ✅ Bloqueo automático por intentos fallidos
- ✅ Sesiones con expiración configurable

### Autorización
- ✅ 5 Roles pre-configurados (SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO)
- ✅ 18 Permisos granulares
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Permisos por endpoint
- ✅ Protección de rutas en frontend

### Gestión de Usuarios
- ✅ CRUD completo de usuarios
- ✅ Activar/Desactivar usuarios
- ✅ Desbloquear usuarios
- ✅ Asignación de roles
- ✅ Panel de administración

### Seguridad
- ✅ Contraseñas encriptadas con BCrypt
- ✅ Validación de fortaleza de contraseña
- ✅ CORS configurado
- ✅ Rate limiting en login
- ✅ Auditoría de acciones

### Frontend
- ✅ Dashboard adaptativo según permisos
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Menú lateral dinámico
- ✅ Animaciones y transiciones
- ✅ Feedback visual inmediato

---

## 🛠️ Tecnologías

### Backend
- **Framework:** Spring Boot 3.5.6
- **Lenguaje:** Java 17
- **Seguridad:** Spring Security + JWT
- **Base de Datos:** PostgreSQL 14+
- **ORM:** JPA/Hibernate
- **Build:** Maven / Gradle

### Frontend
- **Framework:** React 18
- **Routing:** React Router v6
- **State Management:** Context API
- **Styling:** CSS3 (sin frameworks adicionales)
- **Build Tool:** Vite / Create React App

### Base de Datos
- **Motor:** PostgreSQL 14+
- **Schema:** maestro_cenate
- **Tablas:** 5 principales
- **Relaciones:** N:M optimizadas

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│         FRONTEND (React)             │
│  ┌─────────┐  ┌─────────────────┐  │
│  │  Login  │  │    Dashboard     │  │
│  └─────────┘  └─────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │   Protected Routes + Auth    │  │
│  └──────────────────────────────┘  │
└──────────────┬──────────────────────┘
               │ HTTP/REST + JWT
               ▼
┌──────────────────────────────────────┐
│      BACKEND (Spring Boot)           │
│  ┌────────────────────────────────┐ │
│  │    Security Filter Chain       │ │
│  │  (JWT Auth + Role Validation)  │ │
│  └────────────────────────────────┘ │
│  ┌────────────┐  ┌──────────────┐  │
│  │Controllers │  │   Services   │  │
│  └────────────┘  └──────────────┘  │
│  ┌─────────────────────────────────┐
│  │         Repositories             │
│  └─────────────────────────────────┘
└──────────────┬──────────────────────┘
               │ JDBC
               ▼
┌──────────────────────────────────────┐
│       PostgreSQL Database             │
│  ┌─────────┐  ┌─────────┐           │
│  │ Usuarios│  │  Roles  │           │
│  └─────────┘  └─────────┘           │
│  ┌─────────────────────┐             │
│  │      Permisos       │             │
│  └─────────────────────┘             │
└──────────────────────────────────────┘
```

---

## 🚀 Instalación Rápida

### Requisitos Previos
- Java 17+
- Node.js 16+
- PostgreSQL 14+
- Maven o Gradle

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-org/cenate.git
cd cenate
```

### 2. Configurar Base de Datos
```bash
# Crear base de datos
createdb maestro_cenate

# Ejecutar script SQL
psql -U postgres -d maestro_cenate -f backend/sql/03_sistema_login_completo.sql
```

### 3. Configurar Backend
```bash
cd backend

# Copiar archivo de configuración
cp .env.example .env
# Editar .env con tus credenciales

# Compilar y ejecutar
./mvnw spring-boot:run
```

### 4. Configurar Frontend
```bash
cd frontend

# Instalar dependencias
npm install

# Copiar componentes de ejemplo
cp -r ejemplos/* src/

# Ejecutar
npm run dev
```

### 5. Acceder al Sistema
- **Frontend:** http://localhost:3000 o http://localhost:5173
- **Backend:** http://localhost:8080
- **API Docs:** http://localhost:8080/api/auth/health

---

## 🔑 Credenciales Iniciales

```
Username: superadmin
Password: SuperAdmin2024!
```

**⚠️ IMPORTANTE:** Cambiar esta contraseña después del primer login.

---

## 📚 Documentación

Toda la documentación está en el directorio raíz del proyecto:

- **[INSTALACION_COMPLETA.md](INSTALACION_COMPLETA.md)** - Guía de instalación paso a paso
- **[RESUMEN_EJECUTIVO.md](RESUMEN_EJECUTIVO.md)** - Resumen del proyecto
- **[backend/SISTEMA_LOGIN_GUIA_COMPLETA.md](backend/SISTEMA_LOGIN_GUIA_COMPLETA.md)** - Documentación técnica backend
- **[frontend/ejemplos/README_FRONTEND.md](frontend/ejemplos/README_FRONTEND.md)** - Documentación técnica frontend

---

## 📡 API REST

### Endpoints Públicos

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "superadmin",
    "password": "SuperAdmin2024!"
  }'
```

#### Health Check
```bash
curl http://localhost:8080/api/auth/health
```

### Endpoints Protegidos (requieren JWT)

#### Obtener Usuario Actual
```bash
curl http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer {tu_token}"
```

#### Listar Usuarios (Admin)
```bash
curl http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer {tu_token}"
```

#### Cambiar Contraseña
```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Authorization: Bearer {tu_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "SuperAdmin2024!",
    "newPassword": "NewPassword2024!",
    "confirmPassword": "NewPassword2024!"
  }'
```

### Colección de Postman

Importar `backend/CENATE_API_Collection.postman_collection.json` en Postman para probar todos los endpoints.

---

## 🎨 Frontend

### Componentes Principales

- **LoginPanel** - Página de inicio de sesión
- **Dashboard** - Panel principal con menú dinámico
- **UsersAdmin** - Gestión de usuarios
- **ChangePassword** - Cambio de contraseña
- **ProtectedRoute** - HOC para proteger rutas

### Uso de AuthContext

```jsx
import { useAuth } from './AuthContext';

function MyComponent() {
  const { user, hasPermission, logout } = useAuth();

  if (hasPermission('GESTIONAR_USUARIOS')) {
    return <AdminPanel />;
  }

  return <UserPanel />;
}
```

### Proteger Rutas

```jsx
<Route 
  path="/admin/usuarios" 
  element={
    <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
      <UsersAdmin />
    </ProtectedRoute>
  } 
/>
```

---

## 🧪 Testing

### Tests Automatizados (Backend)

```bash
cd backend
chmod +x test_api.sh
./test_api.sh
```

Resultado esperado:
```
🧪 Iniciando Tests del Sistema de Login
✅ PASS - Backend está disponible
✅ PASS - Login exitoso con SUPERADMIN
...
📊 RESUMEN: ✅ 15/15 tests exitosos (100%)
```

### Tests Manuales

1. **Login Flow**
   - Login exitoso
   - Login con credenciales incorrectas
   - Bloqueo después de 5 intentos

2. **Gestión de Usuarios**
   - Crear usuario
   - Activar/Desactivar
   - Eliminar (solo SUPERADMIN)

3. **Permisos**
   - Acceso según rol
   - Protección de rutas
   - Menú dinámico

---

## 🌐 Despliegue

### Desarrollo

```bash
# Backend
cd backend && ./mvnw spring-boot:run

# Frontend
cd frontend && npm run dev
```

### Producción

#### Backend
```bash
cd backend
./mvnw clean package
java -jar target/cenate-0.0.1-SNAPSHOT.jar
```

#### Frontend
```bash
cd frontend
npm run build
# Servir dist/ con nginx o servidor web
```

### Docker (Próximamente)
```bash
docker-compose up -d
```

---

## 🗺️ Roadmap

### Versión 1.1 (Próxima)
- [ ] Recuperación de contraseña por email
- [ ] Perfil de usuario editable
- [ ] Refresh tokens
- [ ] Paginación en lista de usuarios

### Versión 1.2
- [ ] Auditoría completa de acciones
- [ ] 2FA (Two-Factor Authentication)
- [ ] Dashboard con estadísticas
- [ ] Notificaciones en tiempo real

### Versión 2.0
- [ ] Integración con Active Directory
- [ ] Single Sign-On (SSO)
- [ ] App móvil (React Native)
- [ ] Analytics avanzado

---

## 👥 Roles del Sistema

| Rol | Usuarios | Permisos | Descripción |
|-----|----------|----------|-------------|
| **SUPERADMIN** | 1 | 18/18 | Control total del sistema |
| **ADMIN** | Variable | 17/18 | Administrador general |
| **ESPECIALISTA** | Variable | 4/18 | Médico especialista |
| **RADIOLOGO** | Variable | 3/18 | Médico radiólogo |
| **USUARIO** | Variable | 2/18 | Usuario básico |

---

## 🛡️ Seguridad

- ✅ JWT con expiración (24h por defecto)
- ✅ Contraseñas BCrypt (cost factor 10)
- ✅ Bloqueo automático (5 intentos / 30 min)
- ✅ CORS configurado
- ✅ HTTPS recomendado en producción
- ✅ Validación de entrada
- ✅ SQL Injection protegido (JPA)
- ✅ XSS protegido (React)

---

## 📊 Estadísticas del Proyecto

- **Total de Archivos:** 40+
- **Líneas de Código:** ~5,500
- **Endpoints API:** 13
- **Componentes React:** 8
- **Páginas de Documentación:** 50+
- **Tests Automatizados:** 15

---

## 🐛 Soporte

### Problemas Comunes

**Backend no inicia:**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Ver logs
./mvnw spring-boot:run
```

**Frontend no conecta:**
1. Verificar que backend está en http://localhost:8080
2. Revisar CORS en SecurityConfig.java
3. Ver consola del navegador (F12)

**Usuario bloqueado:**
```sql
UPDATE dim_usuarios 
SET failed_attempts = 0, locked_until = NULL 
WHERE name_user = 'superadmin';
```

### Contacto

- **Email:**  cenate.analista@cenate.essalud.gob.pe
- **Issues:** [GitHub Issues](https://github.com/tu-org/cenate/issues)
- **Wiki:** [Documentación Completa](https://github.com/tu-org/cenate/wiki)


### ️1️⃣ Login de usuario

Este endpoint genera un token JWT válido para autenticación.

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "scantor", "password": "admin123"}'

```

Respuesta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzY2FudG9yIiwiaWF0IjoxNzU5OTg1Mjg1LCJleHAiOjE3NjAwNzE2ODV9.cHFuqyKtLd3ygYYeTmmXgdD1GyORbeAI6E5uJ170_sA",
  "type": "Bearer",
  "userId": 1,
  "username": "scantor",
  "roles": ["SUPERADMIN"],
  "permisos": [],
  "message": "Login exitoso"
}
```
Guarda el valor del campo token, ya que será necesario para acceder a los endpoints protegidos.

### ️2️⃣ Consultar lista de usuarios (endpoint protegido)

Para acceder a los recursos protegidos, se debe incluir el token JWT en el encabezado Authorization.

```bash
curl -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJzY2FudG9yIiwiaWF0IjoxNzU5OTg1MjAwLCJleHAiOjE3NjAwNzE2MDB9.uwfA1R0upa6EMiyqlBs9eFI6DxLgdecjWRS_3ISZvFk"

```

Respuesta esperada:

```json
[
  {
    "idUser": 1,
    "username": "scantor",
    "estado": "ACTIVO",
    "roles": ["SUPERADMIN"],
    "permisos": [],
    "lastLoginAt": null,
    "createAt": "2025-10-09T02:06:13.670604",
    "updateAt": "2025-10-09T04:12:37.512542",
    "failedAttempts": 0,
    "locked": false
  }
]

```

## Testing
```sql
 SELECT * FROM dim_personal_externo LIMIT 10;
```

```sql
SELECT 
    pe.id_pers_ext,
    pe.num_doc_ext,
    pe.nom_ext || ' ' || pe.ape_pater_ext || ' ' || pe.ape_mater_ext AS nombre_completo,
    pe.id_user,
    u.name_user,
    i.desc_ipress
FROM dim_personal_externo pe
LEFT JOIN dim_usuarios u ON pe.id_user = u.id_user
LEFT JOIN dim_ipress i ON pe.id_ipress = i.id_ipress;


```
Esto ya sería perfecto para alimentar una tabla en tu interfaz React, por ejemplo en un módulo de gestión de personal externo.
```sql
SELECT 
    pe.id_pers_ext,
    pe.num_doc_ext,
    pe.nom_ext || ' ' || pe.ape_pater_ext || ' ' || pe.ape_mater_ext AS nombre_completo,
    pe.id_user,
    u.name_user,
    i.desc_ipress
FROM dim_personal_externo pe
LEFT JOIN dim_usuarios u ON pe.id_user = u.id_user
LEFT JOIN dim_ipress i ON pe.id_ipress = i.id_ipress
ORDER BY nombre_completo ASC;

```

1️⃣ Obtener todo el personal externo:

```bash
curl -X GET http://localhost:8080/api/personal-externo \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZ29uemFsZXNfaHNqIiwiaWF0IjoxNzYwMTI4MzM1LCJleHAiOjE3NjAyMTQ3MzV9.TS3-hmSYv8ffrcw6DImO4Mr7VpS_tVRi-azHViIcDSA"

```

2️⃣ Obtener personal externo por ID:

```bash
curl -X GET http://localhost:8080/api/personal-externo/2 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZ29uemFsZXNfaHNqIiwiaWF0IjoxNzYwMTI4MzM1LCJleHAiOjE3NjAyMTQ3MzV9.TS3-hmSYv8ffrcw6DImO4Mr7VpS_tVRi-azHViIcDSA"

```

3️⃣ Buscar personal externo:

```bash
curl -X GET "http://localhost:8080/api/personal-externo/search?query=MARIA" \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZ29uemFsZXNfaHNqIiwiaWF0IjoxNzYwMTI4MzM1LCJleHAiOjE3NjAyMTQ3MzV9.TS3-hmSYv8ffrcw6DImO4Mr7VpS_tVRi-azHViIcDSA"

```

4️⃣ Obtener personal externo por usuario:

```bash
curl -X GET http://localhost:8080/api/personal-externo/usuario/4 \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZ29uemFsZXNfaHNqIiwiaWF0IjoxNzYwMTI4MzM1LCJleHAiOjE3NjAyMTQ3MzV9.TS3-hmSYv8ffrcw6DImO4Mr7VpS_tVRi-azHViIcDSA"

```

## 📄 Licencia

Este proyecto es propiedad de EsSalud Perú - CENATE.  
Todos los derechos reservados © 2025

---

## 🙏 Agradecimientos

Desarrollado por el Ing. Styp Canto Rondón 🧑🏻‍💻


