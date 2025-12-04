# CENATE - Sistema de Telemedicina

<div align="center">

![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)

**Sistema completo de gestión para el Centro Nacional de Telemedicina - EsSalud**

[Instalación](#-instalación-rápida) •
[API REST](#-api-rest-completa) •
[Documentación](#-documentación)

</div>

---

## Tabla de Contenidos

- [Características](#-características)
- [Componentes Frontend - Sistema MBAC](#componentes-frontend---sistema-mbac)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación Rápida](#-instalación-rápida)
- [Credenciales Iniciales](#-credenciales-iniciales)
- [API REST Completa](#-api-rest-completa)
- [Sistema MBAC](#9-sistema-mbac---control-de-acceso-modular-apimbac)
- [Testing](#-testing)
- [Despliegue](#-despliegue)

---

## Características

### Autenticación y Seguridad
- Login con JWT (JSON Web Tokens)
- Sistema MBAC (Control de Acceso Basado en Módulos)
- Bloqueo automático por intentos fallidos
- Auditoría completa de acciones

### Gestión de Usuarios
- CRUD completo de usuarios
- 5 Roles pre-configurados (SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO)
- Permisos granulares por módulo y página
- Gestión de personal interno y externo
- **Sistema MBAC integrado:** Gestión de roles y permisos directamente desde el modal de edición de usuario
- **Visualización de permisos:** Vista detallada de módulos, páginas y acciones permitidas por usuario

### Gestión de Catálogos (Panel Admin)
- **Áreas:** CRUD completo de áreas organizacionales
- **Regímenes:** Gestión de regímenes laborales (CAS, 728, etc.)
- **Profesiones:** Administración de profesiones del personal
- **Especialidades:** Catálogo de servicios médicos (ESSI) con indicadores CENATE

### Gestión de Pacientes
- Integración con tabla de asegurados (5M+ registros)
- Gestión de pacientes para telemedicina
- Búsqueda por DNI, condición, gestora, IPRESS

### Frontend
- Dashboard adaptativo según permisos
- Diseño responsive
- Menú lateral dinámico
- **Gestión de Permisos integrada en Usuarios:** Edición y visualización de permisos por usuario

---

## Componentes Frontend - Sistema MBAC

### Estructura de Componentes

```
frontend/src/pages/user/
├── UsersManagement.jsx              # Página principal de gestión de usuarios
├── components/
│   ├── PermisosUsuarioPanel.jsx     # Panel para editar permisos de usuario
│   ├── VerPermisosUsuarioModal.jsx  # Modal para visualizar permisos (standalone)
│   └── common/
│       ├── ActualizarModel.jsx      # Modal de edición (incluye tab Permisos)
│       └── VerDetalleModal.jsx      # Modal de visualización (incluye tab Permisos)
```

### PermisosUsuarioPanel

Panel integrado en el modal de edición de usuario para gestionar roles y permisos granulares.

**Props:**
| Prop | Tipo | Descripción |
|------|------|-------------|
| `userId` | number | ID del usuario a editar |
| `userRoles` | array | Roles actuales del usuario |
| `onRolesChange` | function | Callback cuando cambian los roles |
| `token` | string | Token JWT (opcional, usa localStorage como fallback) |
| `readOnly` | boolean | Modo solo lectura (default: false) |

**Características:**
- Muestra todos los roles disponibles como botones seleccionables
- Agrupa módulos con sus páginas en secciones expandibles
- Checkboxes para cada permiso: Ver, Crear, Editar, Eliminar, Exportar, Aprobar
- Botones de "Seleccionar todo" / "Quitar todo" por módulo y página
- Guarda automáticamente al confirmar el modal

### VerDetalleModal - Pestaña Permisos

Nueva pestaña en el modal de visualización de usuario que muestra:

1. **Estadísticas rápidas:**
   - Total de módulos con acceso
   - Total de páginas accesibles
   - Total de permisos activos

2. **Roles asignados:** Lista visual con badges

3. **Acceso a Módulos y Páginas:**
   - Vista expandible por módulo
   - Permisos activos con iconos coloridos
   - Ruta de cada página

### Flujo de Edición de Usuario

```
1. Usuario hace clic en "Editar" → Se abre ActualizarModel
2. Navega por pestañas: Personal → Profesional → Laboral → Roles → Permisos
3. En pestaña "Permisos":
   - Selecciona/deselecciona roles
   - Configura permisos granulares por página
4. Clic en "Guardar Cambios" → Se guardan todos los datos

```

### Flujo de Visualización de Usuario

```
1. Usuario hace clic en "Ver" → Se abre VerDetalleModal
2. Navega a pestaña "Permisos"
3. Ve estadísticas, roles y permisos detallados (solo lectura)
```

---

## Tecnologías

### Backend
- **Framework:** Spring Boot 3.5.6
- **Lenguaje:** Java 17
- **Seguridad:** Spring Security + JWT
- **Base de Datos:** PostgreSQL 14+
- **ORM:** JPA/Hibernate

### Frontend
- **Framework:** React 19
- **Routing:** React Router 7
- **HTTP Client:** Axios
- **Styling:** TailwindCSS
- **Iconos:** Lucide React

---

## Arquitectura

```
┌─────────────────────────────────────┐
│         FRONTEND (React)            │
│  Puerto: 3000 / 3001                │
└──────────────┬──────────────────────┘
               │ HTTP/REST + JWT
               ▼
┌──────────────────────────────────────┐
│      BACKEND (Spring Boot)           │
│  Puerto: 8080                        │
│  ┌────────────────────────────────┐  │
│  │    Security Filter Chain       │  │
│  │  (JWT Auth + MBAC Validation)  │  │
│  └────────────────────────────────┘  │
└──────────────┬───────────────────────┘
               │ JDBC
               ▼
┌──────────────────────────────────────┐
│       PostgreSQL Database            │
│  Servidor: 10.0.89.13:5432           │
│  Base de datos: Datos_Cenate         │
└──────────────────────────────────────┘
```

---

## Instalación Rápida

### Requisitos Previos
- Java 17+
- Node.js 20+
- PostgreSQL 14+

### 1. Clonar el Repositorio
```bash
git clone https://github.com/stypcanto/mini_proyecto_cenate.git
cd mini_proyecto_cenate
```

### 2. Ejecutar Backend
```bash
cd backend
./gradlew bootRun
```
Backend disponible en: **http://localhost:8080**

### 3. Ejecutar Frontend
```bash
cd frontend
npm install
npm start
```
Frontend disponible en: **http://localhost:3000**

---

## Credenciales Iniciales

```
Username: 44914706
Password: @Cenate2025
```

---

## API REST Completa

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer {token}  // Para endpoints protegidos
```

---

## 1. AUTENTICACIÓN (`/api/auth`)

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "44914706",
  "password": "@Cenate2025"
}
```

**Respuesta:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "userId": 1,
  "username": "44914706",
  "roles": ["SUPERADMIN"],
  "permisos": [],
  "message": "Login exitoso"
}
```

### Cambiar Contraseña
```bash
PUT /api/auth/change-password
Authorization: Bearer {token}

{
  "currentPassword": "contraseña_actual",
  "newPassword": "nueva_contraseña",
  "confirmPassword": "nueva_contraseña"
}
```

### Obtener Usuario Actual
```bash
GET /api/auth/me
Authorization: Bearer {token}
```

### Completar Primer Acceso
```bash
POST /api/auth/completar-primer-acceso
Authorization: Bearer {token}

{
  "email": "usuario@cenate.gob.pe",
  "telefono": "999888777"
}
```

---

## 2. USUARIOS (`/api/usuarios`)

### Listar Todos los Usuarios
```bash
GET /api/usuarios
Authorization: Bearer {token}
```

### Obtener Usuario por ID
```bash
GET /api/usuarios/id/{id}
Authorization: Bearer {token}
```

### Crear Usuario
```bash
POST /api/usuarios/crear
Authorization: Bearer {token}

{
  "username": "nuevo_usuario",
  "password": "password123",
  "email": "usuario@cenate.gob.pe"
}
```

### Crear Usuario con Roles (SUPERADMIN)
```bash
POST /api/usuarios/crear-con-roles
Authorization: Bearer {token}

{
  "username": "nuevo_usuario",
  "password": "password123",
  "roles": ["ADMIN", "ESPECIALISTA"]
}
```

### Actualizar Usuario
```bash
PUT /api/usuarios/id/{id}
Authorization: Bearer {token}

{
  "email": "nuevo_email@cenate.gob.pe",
  "telefono": "999888777"
}
```

### Eliminar Usuario
```bash
DELETE /api/usuarios/id/{id}
Authorization: Bearer {token}
```

### Activar/Desactivar Usuario
```bash
PUT /api/usuarios/id/{id}/activate
PUT /api/usuarios/id/{id}/deactivate
Authorization: Bearer {token}
```

### Desbloquear Usuario
```bash
PUT /api/usuarios/id/{id}/unlock
Authorization: Bearer {token}
```

### Reset de Contraseña
```bash
PUT /api/usuarios/id/{id}/reset-password
Authorization: Bearer {token}

{
  "newPassword": "nueva_contraseña"
}
```

---

## 3. GESTIÓN DE PACIENTES (`/api/gestion-pacientes`)

> **NUEVO:** Sistema de gestión de pacientes vinculado a la tabla `asegurados` (5M+ registros)

### Listar Gestiones
```bash
GET /api/gestion-pacientes
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idGestion": 1,
    "pkAsegurado": "40133680-202304",
    "numDoc": "40133680",
    "apellidosNombres": "CAMARGO CHIPANA EDUARDO MIGUEL",
    "sexo": "M",
    "edad": 46,
    "telefono": "991074841",
    "tipoPaciente": "ASEGURADO ADSCRITO AL C.A.",
    "tipoSeguro": "TITULAR",
    "ipress": "CAP III SAN JUAN DE MIRAFLORES",
    "condicion": "Pendiente",
    "gestora": "ELLEN ZAMUDIO",
    "observaciones": null,
    "origen": "IPRESS",
    "seleccionadoTelemedicina": false,
    "fechaCreacion": "2025-12-04T12:19:38",
    "fechaActualizacion": "2025-12-04T12:19:38"
  }
]
```

### Buscar Asegurado por DNI (para agregar a gestión)
```bash
GET /api/gestion-pacientes/asegurado/{dni}
Authorization: Bearer {token}
```

**Ejemplo:**
```bash
GET /api/gestion-pacientes/asegurado/40133680
```

**Respuesta:** Devuelve datos del asegurado desde la tabla `asegurados` sin crear gestión.

### Crear Gestión de Paciente
```bash
POST /api/gestion-pacientes
Authorization: Bearer {token}

{
  "pkAsegurado": "40133680-202304",
  "condicion": "Pendiente",
  "gestora": "ELLEN ZAMUDIO",
  "origen": "IPRESS",
  "observaciones": "Paciente referido para telemedicina"
}
```

### Actualizar Gestión
```bash
PUT /api/gestion-pacientes/{id}
Authorization: Bearer {token}

{
  "condicion": "Citado",
  "gestora": "MARIA LOPEZ",
  "observaciones": "Cita programada para 15/12/2025"
}
```

### Eliminar Gestión
```bash
DELETE /api/gestion-pacientes/{id}
Authorization: Bearer {token}
```

### Buscar por Documento
```bash
GET /api/gestion-pacientes/documento/{numDoc}
Authorization: Bearer {token}
```

### Buscar por Condición
```bash
GET /api/gestion-pacientes/condicion/{condicion}
Authorization: Bearer {token}
```

**Condiciones válidas:** `Pendiente`, `Citado`, `Reprogramación Fallida`, `Atendido`, `No Contactado`

### Buscar por Gestora
```bash
GET /api/gestion-pacientes/gestora/{gestora}
Authorization: Bearer {token}
```

### Buscar por IPRESS
```bash
GET /api/gestion-pacientes/ipress/{codIpress}
Authorization: Bearer {token}
```

### Listar Seleccionados para Telemedicina
```bash
GET /api/gestion-pacientes/telemedicina
Authorization: Bearer {token}
```

### Seleccionar para Telemedicina
```bash
PUT /api/gestion-pacientes/{id}/telemedicina
Authorization: Bearer {token}

{
  "seleccionado": true
}
```

### Seleccionar Múltiples para Telemedicina
```bash
PUT /api/gestion-pacientes/telemedicina/multiple
Authorization: Bearer {token}

{
  "ids": [1, 2, 3, 4, 5],
  "seleccionado": true
}
```

### Actualizar Condición
```bash
PUT /api/gestion-pacientes/{id}/condicion
Authorization: Bearer {token}

{
  "condicion": "Citado",
  "observaciones": "Cita confirmada por teléfono"
}
```

---

## 4. ASEGURADOS (`/api/asegurados`)

### Listar Asegurados (Paginado)
```bash
GET /api/asegurados?page=0&size=20
Authorization: Bearer {token}
```

### Buscar por DNI
```bash
GET /api/asegurados/doc/{docPaciente}
Authorization: Bearer {token}
```

### Búsqueda Avanzada
```bash
GET /api/asegurados/buscar?nombre=GARCIA&page=0&size=20
Authorization: Bearer {token}
```

### Detalles Completos
```bash
GET /api/asegurados/detalle/{pkAsegurado}
Authorization: Bearer {token}
```

### Estadísticas Dashboard
```bash
GET /api/asegurados/dashboard/estadisticas
Authorization: Bearer {token}
```

---

## 5. PERSONAL (`/api/personal`)

### Listar Todo el Personal
```bash
GET /api/personal
Authorization: Bearer {token}
```

### Personal CENATE (CNT)
```bash
GET /api/personal/cnt
Authorization: Bearer {token}
```

### Personal Externo
```bash
GET /api/personal/externo
Authorization: Bearer {token}
```

### Buscar por Documento
```bash
GET /api/personal/buscar/{numeroDocumento}
Authorization: Bearer {token}
```

### Crear Personal
```bash
POST /api/personal/crear
Authorization: Bearer {token}

{
  "numDoc": "12345678",
  "nombre": "Juan",
  "apellidoPaterno": "Pérez",
  "apellidoMaterno": "García",
  "idTipoPersonal": 1,
  "idIpress": 2
}
```

---

## 6. PERSONAL EXTERNO (`/api/personal-externo`)

### Listar Personal Externo
```bash
GET /api/personal-externo
Authorization: Bearer {token}
```

### Obtener por ID
```bash
GET /api/personal-externo/{id}
Authorization: Bearer {token}
```

### Búsqueda por Término
```bash
GET /api/personal-externo/search?query=MARIA
Authorization: Bearer {token}
```

### Por IPRESS
```bash
GET /api/personal-externo/ipress/{idIpress}
Authorization: Bearer {token}
```

### Por Usuario
```bash
GET /api/personal-externo/usuario/{idUsuario}
Authorization: Bearer {token}
```

---

## 7. PERMISOS MBAC (`/api/permisos`)

### Obtener Permisos de Usuario
```bash
GET /api/permisos/usuario/{userId}
Authorization: Bearer {token}
```

### Módulos Accesibles
```bash
GET /api/permisos/usuario/{userId}/modulos
Authorization: Bearer {token}
```

### Páginas por Módulo
```bash
GET /api/permisos/usuario/{userId}/modulo/{idModulo}/paginas
Authorization: Bearer {token}
```

### Verificar Permiso Específico
```bash
POST /api/permisos/check
Authorization: Bearer {token}

{
  "userId": 1,
  "moduloId": 2,
  "paginaId": 3,
  "accion": "CREAR"
}
```

### Crear Permiso (ADMIN)
```bash
POST /api/permisos
Authorization: Bearer {token}

{
  "idUser": 5,
  "idModulo": 2,
  "idPagina": 3,
  "canCreate": true,
  "canRead": true,
  "canUpdate": false,
  "canDelete": false
}
```

---

## 8. ROLES (`/api/admin/roles`)

### Listar Roles
```bash
GET /api/admin/roles
Authorization: Bearer {token}
```

### Crear Rol
```bash
POST /api/admin/roles
Authorization: Bearer {token}

{
  "nombre": "COORDINADOR",
  "descripcion": "Coordinador de área"
}
```

### Actualizar Rol
```bash
PUT /api/admin/roles/{id}
Authorization: Bearer {token}
```

### Eliminar Rol
```bash
DELETE /api/admin/roles/{id}
Authorization: Bearer {token}
```

---

## 9. SISTEMA MBAC - Control de Acceso Modular (`/api/mbac`)

> **Sistema MBAC (Modular-Based Access Control):** Permite gestionar el acceso granular a módulos, páginas y acciones específicas del sistema.

### Arquitectura MBAC

```
┌─────────────────────────────────────────────────────────────┐
│                    SISTEMA MBAC                              │
├─────────────────────────────────────────────────────────────┤
│  MÓDULOS (ej: Gestión de Usuarios, Citas, Reportes)         │
│    └── PÁGINAS (ej: /admin/users, /citas/nueva)             │
│          └── PERMISOS (ver, crear, editar, eliminar,        │
│                        exportar, aprobar)                    │
├─────────────────────────────────────────────────────────────┤
│  ROLES → asignan permisos predefinidos a usuarios           │
│  PERMISOS INDIVIDUALES → permisos específicos por usuario   │
└─────────────────────────────────────────────────────────────┘
```

### Módulos del Sistema

#### Listar Módulos
```bash
GET /api/mbac/modulos
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idModulo": 1,
    "nombreModulo": "Gestión de Usuarios",
    "descripcion": "Administración de usuarios del sistema",
    "rutaBase": "/admin/users",
    "activo": true,
    "orden": 1
  }
]
```

#### Obtener Módulo por ID
```bash
GET /api/mbac/modulos/{id}
Authorization: Bearer {token}
```

#### Crear Módulo
```bash
POST /api/mbac/modulos
Authorization: Bearer {token}

{
  "nombreModulo": "Nuevo Módulo",
  "descripcion": "Descripción del módulo",
  "rutaBase": "/nuevo-modulo",
  "activo": true,
  "orden": 5
}
```

#### Actualizar Módulo
```bash
PUT /api/mbac/modulos/{id}
Authorization: Bearer {token}

{
  "nombreModulo": "Módulo Actualizado",
  "descripcion": "Nueva descripción",
  "activo": true
}
```

#### Eliminar Módulo
```bash
DELETE /api/mbac/modulos/{id}
Authorization: Bearer {token}
```

### Páginas del Sistema

#### Listar Todas las Páginas
```bash
GET /api/mbac/paginas
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idPagina": 1,
    "idModulo": 1,
    "nombrePagina": "Lista de Usuarios",
    "rutaPagina": "/admin/users",
    "descripcion": "Página principal de gestión de usuarios",
    "orden": 1,
    "activo": true
  }
]
```

### Roles del Sistema

#### Listar Roles
```bash
GET /api/mbac/roles
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idRol": 1,
    "descRol": "SUPERADMIN",
    "descripcion": "Administrador con acceso total",
    "idArea": null,
    "nivelJerarquia": 1,
    "activo": true
  },
  {
    "idRol": 2,
    "descRol": "ADMIN",
    "descripcion": "Administrador del sistema",
    "idArea": 1,
    "nivelJerarquia": 2,
    "activo": true
  }
]
```

### Permisos Rol-Módulo

#### Listar Permisos por Rol y Módulo
```bash
GET /api/mbac/permisos-rol-modulo
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idPermisoRolModulo": 1,
    "idRol": 2,
    "descRol": "ADMIN",
    "idModulo": 1,
    "nombreModulo": "Gestión de Usuarios",
    "puedeVer": true,
    "puedeCrear": true,
    "puedeEditar": true,
    "puedeEliminar": false
  }
]
```

#### Crear Permiso Rol-Módulo
```bash
POST /api/mbac/permisos-rol-modulo
Authorization: Bearer {token}

{
  "idRol": 2,
  "idModulo": 1,
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": false
}
```

#### Actualizar Permiso Rol-Módulo
```bash
PUT /api/mbac/permisos-rol-modulo/{id}
Authorization: Bearer {token}

{
  "puedeVer": true,
  "puedeCrear": true,
  "puedeEditar": true,
  "puedeEliminar": true
}
```

#### Eliminar Permiso Rol-Módulo
```bash
DELETE /api/mbac/permisos-rol-modulo/{id}
Authorization: Bearer {token}
```

### Permisos Rol-Página (Granular)

#### Listar Permisos por Rol y Página
```bash
GET /api/mbac/permisos-rol-pagina
Authorization: Bearer {token}
```

**Respuesta:**
```json
[
  {
    "idPermisoRolPagina": 1,
    "idRol": 2,
    "descRol": "ADMIN",
    "idPagina": 1,
    "nombrePagina": "Lista de Usuarios",
    "rutaPagina": "/admin/users",
    "ver": true,
    "crear": true,
    "editar": true,
    "eliminar": false,
    "exportar": true,
    "aprobar": false
  }
]
```

#### Crear Permiso Rol-Página
```bash
POST /api/mbac/permisos-rol-pagina
Authorization: Bearer {token}

{
  "idRol": 2,
  "idPagina": 1,
  "ver": true,
  "crear": true,
  "editar": true,
  "eliminar": false,
  "exportar": true,
  "aprobar": false
}
```

#### Actualizar Permiso Rol-Página
```bash
PUT /api/mbac/permisos-rol-pagina/{id}
Authorization: Bearer {token}

{
  "ver": true,
  "crear": true,
  "editar": true,
  "eliminar": true,
  "exportar": true,
  "aprobar": true
}
```

#### Eliminar Permiso Rol-Página
```bash
DELETE /api/mbac/permisos-rol-pagina/{id}
Authorization: Bearer {token}
```

---

## 10. MENÚ USUARIO (`/api/menu-usuario`)

### Obtener Menú del Usuario
```bash
GET /api/menu-usuario/usuario/{idUser}
Authorization: Bearer {token}
```

---

## 11. IPRESS (`/api/ipress`)

### IPRESS Públicas (Sin autenticación)
```bash
GET /api/ipress/publicas
```

### Listar Todas
```bash
GET /api/ipress
Authorization: Bearer {token}
```

### Solo Activas
```bash
GET /api/ipress/activas
Authorization: Bearer {token}
```

### Buscar por Nombre
```bash
GET /api/ipress/buscar?nombre=HOSPITAL
Authorization: Bearer {token}
```

---

## 12. CATÁLOGOS (CRUD Completo)

> **Panel de Administración:** Todos los catálogos pueden gestionarse desde `/admin/users` en las pestañas correspondientes.

### Tipos de Documento
```bash
GET /api/tipos-documento
GET /api/tipos-documento/activos
Authorization: Bearer {token}
```

### Profesiones (CRUD)
```bash
# Listar todas
GET /api/profesiones
Authorization: Bearer {token}

# Listar activas
GET /api/profesiones/activas
Authorization: Bearer {token}

# Obtener por ID
GET /api/profesiones/{id}
Authorization: Bearer {token}

# Crear
POST /api/profesiones
Authorization: Bearer {token}
{
  "descProf": "MÉDICO CIRUJANO",
  "statProf": "A"
}

# Actualizar
PUT /api/profesiones/{id}
Authorization: Bearer {token}
{
  "descProf": "MÉDICO CIRUJANO GENERAL",
  "statProf": "A"
}

# Eliminar
DELETE /api/profesiones/{id}
Authorization: Bearer {token}
```

### Especialidades (CRUD)
```bash
# Listar todas (incluyendo inactivas)
GET /api/especialidades
Authorization: Bearer {token}

# Listar activas
GET /api/especialidades/activas
Authorization: Bearer {token}

# Obtener por ID
GET /api/especialidades/{id}
Authorization: Bearer {token}

# Crear
POST /api/especialidades
Authorization: Bearer {token}
{
  "codServicio": "CARD",
  "descripcion": "CARDIOLOGÍA",
  "esCenate": true,
  "estado": "A",
  "esAperturaNuevos": false
}

# Actualizar
PUT /api/especialidades/{id}
Authorization: Bearer {token}
{
  "codServicio": "CARD",
  "descripcion": "CARDIOLOGÍA GENERAL",
  "esCenate": true,
  "estado": "A",
  "esAperturaNuevos": true
}

# Eliminar
DELETE /api/especialidades/{id}
Authorization: Bearer {token}
```

### Regímenes Laborales (CRUD)
```bash
# Públicos (sin autenticación)
GET /api/regimenes/publicos

# Listar todos
GET /api/regimenes
Authorization: Bearer {token}

# Listar activos
GET /api/regimenes/activos
Authorization: Bearer {token}

# Obtener por ID
GET /api/regimenes/{id}
Authorization: Bearer {token}

# Crear
POST /api/regimenes
Authorization: Bearer {token}
{
  "descRegimen": "CAS - CONTRATO ADMINISTRATIVO DE SERVICIOS",
  "statRegimen": "A"
}

# Actualizar
PUT /api/regimenes/{id}
Authorization: Bearer {token}
{
  "descRegimen": "CAS - DECRETO LEGISLATIVO 1057",
  "statRegimen": "A"
}

# Eliminar
DELETE /api/regimenes/{id}
Authorization: Bearer {token}
```

### Áreas (CRUD)
```bash
# Listar todas
GET /api/admin/areas
Authorization: Bearer {token}

# Listar activas
GET /api/admin/areas/activas
Authorization: Bearer {token}

# Obtener por ID
GET /api/admin/areas/{id}
Authorization: Bearer {token}

# Crear
POST /api/admin/areas
Authorization: Bearer {token}
{
  "descArea": "ÁREA DE TELEMEDICINA",
  "statArea": "A"
}

# Actualizar
PUT /api/admin/areas/{id}
Authorization: Bearer {token}
{
  "descArea": "ÁREA DE TELEMEDICINA Y TELECONSULTA",
  "statArea": "A"
}

# Eliminar
DELETE /api/admin/areas/{id}
Authorization: Bearer {token}
```

### Niveles de Atención
```bash
GET /api/niveles-atencion
Authorization: Bearer {token}
```

### Tipos de Procedimiento
```bash
GET /api/tipos-procedimiento
Authorization: Bearer {token}
```

### Áreas Hospitalarias
```bash
GET /api/areas-hospitalarias
Authorization: Bearer {token}
```

### Redes Asistenciales
```bash
GET /api/redes
Authorization: Bearer {token}
```

---

## 13. UBICACIÓN (`/api/ubicacion`)

### Departamentos
```bash
GET /api/ubicacion/departamentos
Authorization: Bearer {token}
```

### Provincias por Departamento
```bash
GET /api/ubicacion/provincias/{idDepartamento}
Authorization: Bearer {token}
```

### Distritos por Provincia
```bash
GET /api/ubicacion/distritos/{idProvincia}
Authorization: Bearer {token}
```

---

## 14. CHATBOT (`/api/chatbot`)

### Consultar Paciente
```bash
GET /api/chatbot/documento/{documento}
```

### Atenciones CENATE
```bash
GET /api/chatbot/atencioncenate
GET /api/chatbot/atencioncenate/buscar?documento=12345678&servicio=CARDIOLOGIA
```

### Atenciones Globales
```bash
GET /api/chatbot/atencionglobal/{documento}
GET /api/chatbot/atencionglobal/doc-nomservicio?documento=12345678&servicio=MEDICINA
```

---

## 15. SOLICITUDES (`/api/solicitud`)

### Crear Solicitud de Cita
```bash
POST /api/solicitud

{
  "docPaciente": "12345678",
  "servicio": "CARDIOLOGIA",
  "fechaSolicitada": "2025-12-15"
}
```

### Obtener Solicitud
```bash
GET /api/solicitud/{id}
```

### Solicitudes por Paciente
```bash
GET /api/solicitud/paciente/{docPaciente}
```

### Actualizar Estado
```bash
PUT /api/solicitud/estado/{id}

{
  "estado": "CONFIRMADA"
}
```

---

## 16. DISPONIBILIDAD (`/api/disponibilidad`)

### Por Servicio
```bash
GET /api/disponibilidad/por-servicio?servicio=CARDIOLOGIA
```

### Por ID de Servicio
```bash
GET /api/disponibilidad/por-id-servicio?idServicio=5
```

---

## 17. AUDITORÍA (`/api/auditoria`)

### Auditoría Modular (Paginada)
```bash
GET /api/auditoria/modulos?page=0&size=20
Authorization: Bearer {token}
```

### Por Usuario
```bash
GET /api/auditoria/usuario/{userId}
Authorization: Bearer {token}
```

### Por Rango de Fechas
```bash
GET /api/auditoria/rango?desde=2025-01-01&hasta=2025-12-31
Authorization: Bearer {token}
```

### Resumen
```bash
GET /api/auditoria/resumen
Authorization: Bearer {token}
```

### Últimos Eventos
```bash
GET /api/auditoria/ultimos?cantidad=10
Authorization: Bearer {token}
```

---

## 18. DASHBOARD (`/api/admin/dashboard`)

### Estadísticas Completas
```bash
GET /api/admin/dashboard/stats
Authorization: Bearer {token}
```

### Resumen Rápido
```bash
GET /api/admin/dashboard/resumen
Authorization: Bearer {token}
```

---

## 19. ÁREAS (`/api/admin/areas`)

### Listar Áreas
```bash
GET /api/admin/areas
Authorization: Bearer {token}
```

### CRUD de Áreas
```bash
POST /api/admin/areas
PUT /api/admin/areas/{id}
DELETE /api/admin/areas/{id}
Authorization: Bearer {token}
```

---

## 20. RECUPERACIÓN DE CONTRASEÑA (`/api/admin/recuperacion`)

### Solicitar Recuperación
```bash
POST /api/admin/recuperacion/solicitar

{
  "username": "usuario",
  "email": "usuario@cenate.gob.pe"
}
```

### Listar Solicitudes (ADMIN)
```bash
GET /api/admin/recuperacion
Authorization: Bearer {token}
```

### Actualizar Estado
```bash
PUT /api/admin/recuperacion/{id}/estado

{
  "estado": "APROBADA"
}
```

---

## 21. REGISTRO DE USUARIOS (`/api/auth`)

### Solicitar Registro
```bash
POST /api/auth/solicitar-registro

{
  "numDoc": "12345678",
  "nombre": "Juan",
  "apellidos": "Pérez García",
  "email": "juan.perez@cenate.gob.pe",
  "telefono": "999888777"
}
```

### Listar Solicitudes Pendientes (ADMIN)
```bash
GET /api/admin/solicitudes-registro/pendientes
Authorization: Bearer {token}
```

### Aprobar Solicitud
```bash
PUT /api/admin/solicitudes-registro/{id}/aprobar
Authorization: Bearer {token}
```

### Rechazar Solicitud
```bash
PUT /api/admin/solicitudes-registro/{id}/rechazar
Authorization: Bearer {token}

{
  "motivo": "Documento no válido"
}
```

---

## 22. HEALTH CHECK

### Backend Status
```bash
GET /api/health
GET /api/test
GET /api/permisos/health
```

---

## Códigos de Respuesta HTTP

| Código | Descripción |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado |
| 204 | No Content - Sin contenido (DELETE exitoso) |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - Token inválido o expirado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto (ej: duplicado) |
| 500 | Internal Server Error |

---

## Testing

### Verificar Backend
```bash
curl http://localhost:8080/api/health
```

### Test de Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "44914706", "password": "@Cenate2025"}'
```

### Test de Endpoint Protegido
```bash
TOKEN="eyJhbGciOiJIUzI1NiJ9..."

curl http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN"
```

---

## Despliegue

### Desarrollo
```bash
# Terminal 1 - Backend
cd backend && ./gradlew bootRun

# Terminal 2 - Frontend
cd frontend && npm start
```

### Producción
```bash
# Backend
cd backend
./gradlew clean bootJar
java -Xms512m -Xmx1536m -jar build/libs/cenate-0.0.1-SNAPSHOT.jar

# Frontend
cd frontend
npm run build
# Servir build/ con nginx
```

### Docker
```bash
docker-compose up -d
```

---

## Soporte

### Problemas Comunes

**Backend no inicia:**
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
```

**Usuario bloqueado:**
```sql
UPDATE dim_usuarios
SET failed_attempts = 0, locked_until = NULL
WHERE name_user = 'usuario';
```

**Token expirado:**
- Los tokens expiran en 24 horas
- Realizar nuevo login para obtener token fresco

---

## Licencia

Este proyecto es propiedad de EsSalud Perú - CENATE.
Todos los derechos reservados © 2025

---

Desarrollado por el Ing. Styp Canto Rondón
