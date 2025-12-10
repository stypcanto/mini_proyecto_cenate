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
- [Sistema RBAC - Control de Acceso](#-sistema-rbac---control-de-acceso-basado-en-roles)
- [Componentes Frontend - Sistema MBAC](#componentes-frontend---sistema-mbac)
- [Tecnologías](#-tecnologías)
- [Arquitectura](#-arquitectura)
- [Instalación Rápida](#-instalación-rápida)
- [Credenciales Iniciales](#-credenciales-iniciales)
- [API REST Completa](#-api-rest-completa)
- [Sistema MBAC](#9-sistema-mbac---control-de-acceso-modular-apimbac)
- [Formulario Diagnóstico Telesalud](#23-formulario-de-diagnóstico-situacional-de-telesalud-apiformulario-diagnostico)
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

## Sistema RBAC - Control de Acceso Basado en Roles

El sistema implementa un control de acceso granular basado en roles (RBAC) que permite gestionar qué usuarios pueden ver qué módulos y páginas, y qué acciones pueden realizar en cada una.

### Arquitectura de Tablas RBAC

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        MODELO DE DATOS RBAC                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐         ┌──────────────────┐                          │
│  │   dim_usuarios   │         │    dim_roles     │                          │
│  │  (id_user, ...)  │         │ (id_rol, desc_rol)│                         │
│  └────────┬─────────┘         └────────┬─────────┘                          │
│           │                            │                                     │
│           │         ┌──────────────────┴──────────────────┐                 │
│           │         │                                      │                 │
│           ▼         ▼                                      ▼                 │
│  ┌──────────────────────┐                    ┌─────────────────────────┐    │
│  │   rel_user_roles     │                    │ segu_permisos_rol_modulo│    │
│  │ (id_user, id_rol)    │                    │ (id_rol, id_modulo,     │    │
│  │                      │                    │  puede_ver, activo)     │    │
│  └──────────────────────┘                    └───────────┬─────────────┘    │
│                                                          │                   │
│                                                          ▼                   │
│                                              ┌─────────────────────────┐    │
│                                              │  dim_modulos_sistema    │    │
│                                              │ (id_modulo, nombre,     │    │
│                                              │  icono, ruta_base)      │    │
│                                              └───────────┬─────────────┘    │
│                                                          │                   │
│                                                          ▼                   │
│                                              ┌─────────────────────────┐    │
│                                              │   dim_paginas_modulo    │    │
│                                              │ (id_pagina, id_modulo,  │    │
│                                              │  nombre, ruta_pagina)   │    │
│                                              └───────────┬─────────────┘    │
│                                                          │                   │
│                                                          ▼                   │
│                                              ┌─────────────────────────┐    │
│                                              │ segu_permisos_rol_pagina│    │
│                                              │ (id_rol, id_pagina,     │    │
│                                              │  puede_ver, puede_crear,│    │
│                                              │  puede_editar,          │    │
│                                              │  puede_eliminar,        │    │
│                                              │  puede_exportar)        │    │
│                                              └─────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Gestión de Módulos - Master del Sistema RBAC

**Gestión de Módulos** es el controlador central del sistema RBAC. Desde ahí se administra todo el control de acceso:

```
┌─────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE MÓDULOS (Master)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. MÓDULOS (/admin/modulos)                                     │
│     └── Crear, editar, eliminar módulos del sistema              │
│         (dim_modulos_sistema)                                    │
│                                                                  │
│  2. PÁGINAS (/admin/paginas)                                     │
│     └── Crear, editar, eliminar páginas dentro de cada módulo    │
│         (dim_paginas_modulo)                                     │
│                                                                  │
│  3. CONTROL MBAC (/admin/mbac)                                   │
│     └── Asignar permisos de módulos a roles                      │
│         (segu_permisos_rol_modulo)                               │
│     └── Asignar permisos de páginas a roles                      │
│         (segu_permisos_rol_pagina)                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    GESTIÓN DE USUARIOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  4. Crear usuario → Asignar ROL(es)                              │
│     └── El usuario hereda los permisos del rol                   │
│     └── Ve solo los módulos/páginas que su rol permite           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Ejemplo Práctico de Uso

1. **Creas un módulo** "Reportes Médicos" con icono `BarChart3`
2. **Creas páginas** dentro del módulo: "Dashboard", "Exportar", "Histórico"
3. **Asignas permisos** al rol "MEDICO": puede ver y exportar, pero no eliminar
4. **Creas un usuario** y le asignas el rol "MEDICO"
5. **El usuario** inicia sesión y ve solo "Reportes Médicos" en su sidebar con las 3 páginas

### Resumen de Acciones y Tablas

| Acción | Tabla Afectada |
|--------|----------------|
| Crear módulo | `dim_modulos_sistema` |
| Crear página | `dim_paginas_modulo` |
| Asignar módulo a rol | `segu_permisos_rol_modulo` |
| Asignar permisos página a rol | `segu_permisos_rol_pagina` |
| Asignar rol a usuario | `rel_user_roles` |

### Descripción de Tablas

| Tabla | Descripción | Campos Clave |
|-------|-------------|--------------|
| `dim_modulos_sistema` | Módulos del sistema (menú principal) | `id_modulo`, `nombre_modulo`, `icono`, `ruta_base`, `activo`, `orden` |
| `dim_paginas_modulo` | Páginas/submenús de cada módulo | `id_pagina`, `id_modulo`, `nombre_pagina`, `ruta_pagina`, `activo` |
| `dim_roles` | Roles del sistema | `id_rol`, `desc_rol`, `descripcion`, `activo` |
| `segu_permisos_rol_modulo` | Permisos de rol sobre módulos | `id_rol`, `id_modulo`, `puede_ver`, `activo` |
| `segu_permisos_rol_pagina` | Permisos granulares de rol sobre páginas | `id_rol`, `id_pagina`, `puede_ver`, `puede_crear`, `puede_editar`, `puede_eliminar`, `puede_exportar` |
| `rel_user_roles` | Relación usuarios-roles | `id_user`, `id_rol` |

### Flujo del Sidebar Dinámico

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    FLUJO: CARGA DEL SIDEBAR DINÁMICO                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. Usuario inicia sesión                                                    │
│     │                                                                        │
│     ▼                                                                        │
│  2. Frontend llama: GET /api/menu-usuario/usuario/{userId}                   │
│     │                                                                        │
│     ▼                                                                        │
│  3. Backend ejecuta función SQL: fn_seguridad_obtener_menu_usuario_vf        │
│     │                                                                        │
│     │   a) Obtiene roles del usuario (rel_user_roles)                        │
│     │   b) Filtra módulos accesibles (segu_permisos_rol_modulo)              │
│     │   c) Filtra páginas con permisos (segu_permisos_rol_pagina)            │
│     │   d) Agrupa páginas por módulo en JSON                                 │
│     │                                                                        │
│     ▼                                                                        │
│  4. Respuesta JSON con módulos y páginas permitidas                          │
│     │                                                                        │
│     ▼                                                                        │
│  5. Hook usePermissions procesa la respuesta                                 │
│     │                                                                        │
│     ▼                                                                        │
│  6. DynamicSidebar renderiza el menú con iconos de Lucide                    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Iconos Disponibles para Módulos

El campo `icono` en `dim_modulos_sistema` acepta los siguientes nombres de iconos de Lucide:

| Icono | Nombre | Uso Recomendado |
|-------|--------|-----------------|
| ⚙️ | `Settings` | Configuración, Administración |
| 👥 | `Users` | Gestión de Usuarios |
| 🏢 | `Building2` | Áreas, Instituciones |
| 📅 | `CalendarCheck` | Citas, Agenda |
| 👤 | `UserCog` | Configuración de Usuario |
| 🏥 | `Hospital` | IPRESS, Salud |
| 📋 | `ClipboardList` | Listas, Reportes |
| 🩺 | `Stethoscope` | Médico, Salud |
| 📊 | `BarChart3` | Estadísticas, Analítica |
| 🔍 | `Search` | Búsqueda |
| ❤️ | `HeartPulse` | Salud, Pacientes |
| 👥 | `UsersRound` | Grupos, Equipos |
| ✓ | `UserCheck` | Verificación |
| 📝 | `ClipboardCheck` | Validación |
| 📄 | `FileSearch` | Documentos |
| 📈 | `FileBarChart` | Reportes |
| 📁 | `Folder` | General (por defecto) |
| 🔒 | `Shield` | Seguridad |
| 🔐 | `Lock` | Acceso |
| 💾 | `Database` | Base de datos |
| 🖥️ | `Server` | Sistema |
| 📂 | `Layers` | Módulos |

### Páginas de Gestión RBAC

| Ruta Frontend | Componente | Función |
|---------------|------------|---------|
| `/admin/modulos` | `ModulosManagement.jsx` | CRUD de módulos (`dim_modulos_sistema`) |
| `/admin/paginas` | `PaginasManagement.jsx` | CRUD de páginas (`dim_paginas_modulo`) |
| `/admin/mbac` | `MBACControl.jsx` | Panel integrado de control MBAC |

### Endpoints API RBAC

#### Módulos del Sistema
```bash
GET    /api/mbac/modulos          # Listar todos los módulos
GET    /api/mbac/modulos/{id}     # Obtener módulo por ID
POST   /api/mbac/modulos          # Crear módulo
PUT    /api/mbac/modulos/{id}     # Actualizar módulo
DELETE /api/mbac/modulos/{id}     # Eliminar módulo
```

#### Páginas de Módulos
```bash
GET    /api/mbac/paginas                      # Listar todas las páginas
GET    /api/mbac/paginas/{id}                 # Obtener página por ID
POST   /api/mbac/paginas                      # Crear página
PUT    /api/mbac/paginas/{id}                 # Actualizar página
DELETE /api/mbac/paginas/{id}                 # Eliminar página
GET    /api/mbac/modulos/{idModulo}/paginas   # Páginas por módulo
```

#### Roles
```bash
GET    /api/mbac/roles            # Listar todos los roles
```

#### Permisos Rol-Módulo
```bash
GET    /api/mbac/permisos-rol-modulo          # Listar permisos rol-módulo
POST   /api/mbac/permisos-rol-modulo          # Crear permiso
PUT    /api/mbac/permisos-rol-modulo/{id}     # Actualizar permiso
DELETE /api/mbac/permisos-rol-modulo/{id}     # Eliminar permiso
```

#### Permisos Rol-Página (Granulares)
```bash
GET    /api/mbac/permisos-rol-pagina          # Listar permisos rol-página
POST   /api/mbac/permisos-rol-pagina          # Crear permiso
PUT    /api/mbac/permisos-rol-pagina/{id}     # Actualizar permiso
DELETE /api/mbac/permisos-rol-pagina/{id}     # Eliminar permiso
```

#### Menú de Usuario
```bash
GET    /api/menu-usuario/usuario/{userId}     # Obtener menú dinámico del usuario
```

### Servicios Frontend

| Servicio | Archivo | Descripción |
|----------|---------|-------------|
| `moduloService` | `services/moduloService.js` | CRUD de módulos |
| `paginaModuloService` | `services/paginaModuloService.js` | CRUD de páginas |
| `usePermissions` | `hooks/usePermissions.js` | Hook para obtener permisos del usuario |

### Ejemplo: Agregar un Nuevo Módulo

1. **Insertar el módulo en la base de datos:**
```sql
INSERT INTO dim_modulos_sistema (nombre_modulo, ruta_base, descripcion, icono, activo, orden)
VALUES ('Mi Nuevo Módulo', '/mi-modulo', 'Descripción del módulo', 'Folder', true, 15);
```

2. **Crear páginas para el módulo:**
```sql
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden)
VALUES
((SELECT id_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Mi Nuevo Módulo'),
 'Dashboard', '/mi-modulo/dashboard', 'Página principal', true, 1);
```

3. **Asignar permisos al rol SUPERADMIN:**
```sql
-- Permiso de módulo
INSERT INTO segu_permisos_rol_modulo (id_rol, id_modulo, puede_ver, activo)
SELECT 1, id_modulo, true, true FROM dim_modulos_sistema WHERE nombre_modulo = 'Mi Nuevo Módulo';

-- Permiso de página
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo)
SELECT 1, id_pagina, true, true, true, true, true, true
FROM dim_paginas_modulo WHERE id_modulo = (SELECT id_modulo FROM dim_modulos_sistema WHERE nombre_modulo = 'Mi Nuevo Módulo');
```

4. **Agregar ruta en `App.js`:**
```javascript
<Route
  path="/mi-modulo/dashboard"
  element={
    <ProtectedRoute requiredPath="/mi-modulo/dashboard" requiredAction="ver">
      <MiNuevoModuloDashboard />
    </ProtectedRoute>
  }
/>
```

5. **Cerrar sesión y volver a entrar** para ver el nuevo módulo en el sidebar.

### Función SQL: fn_seguridad_obtener_menu_usuario_vf

Esta función PostgreSQL obtiene el menú dinámico del usuario basándose en sus roles y permisos:

```sql
-- La función realiza:
-- 1. Obtiene los roles del usuario desde rel_user_roles
-- 2. Filtra módulos con puede_ver = true en segu_permisos_rol_modulo
-- 3. Filtra páginas con puede_ver = true en segu_permisos_rol_pagina
-- 4. Agrupa las páginas por módulo en formato JSON
-- 5. Retorna: id_modulo, nombre_modulo, descripcion, icono, ruta_base, orden, paginas (JSON)
```

### Troubleshooting RBAC

**Módulo no aparece en el sidebar:**
1. Verificar que el módulo tenga `activo = true` en `dim_modulos_sistema`
2. Verificar permiso en `segu_permisos_rol_modulo` para el rol del usuario
3. Verificar que tenga al menos una página con permiso en `segu_permisos_rol_pagina`

**Icono muestra Folder por defecto:**
1. Verificar que el nombre del icono sea exacto (case-sensitive)
2. Verificar que el icono esté en el `iconMap` de `DynamicSidebar.jsx`

**Página da error 404:**
1. Verificar que la ruta en `dim_paginas_modulo.ruta_pagina` coincida con la ruta en `App.js`
2. Verificar que el componente esté importado en `App.js`

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

## 23. FORMULARIO DE DIAGNÓSTICO SITUACIONAL DE TELESALUD (`/api/formulario-diagnostico`)

> **Módulo para la recolección de datos de diagnóstico situacional de Telesalud en las IPRESS**

### Descripción General

Este módulo permite a los usuarios externos (personal de IPRESS) completar un formulario de diagnóstico situacional que evalúa:
- Datos generales de la IPRESS
- Recursos humanos disponibles
- Infraestructura física y tecnológica
- Equipamiento informático y biomédico
- Conectividad y sistemas de información
- Servicios de telesalud implementados
- Necesidades identificadas

### Arquitectura de Tablas

```
┌─────────────────────────────────────────────────────────────────────────────┐
│               MODELO DE DATOS - FORMULARIO DIAGNÓSTICO                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────┐                                                  │
│  │  form_diag_formulario  │ ◄── Tabla principal (PK: id_formulario)         │
│  │  - id_ipress (FK)      │                                                  │
│  │  - anio                │                                                  │
│  │  - estado              │                                                  │
│  │  - fecha_creacion      │                                                  │
│  │  - fecha_envio         │                                                  │
│  └───────────┬────────────┘                                                  │
│              │                                                               │
│   ┌──────────┴──────────────────────────────────────────────────────┐       │
│   │                    TABLAS HIJAS (1:1)                            │       │
│   ├──────────────────────────────────────────────────────────────────┤       │
│   │  form_diag_datos_generales   │ Director, Responsable, Población │       │
│   │  form_diag_recursos_humanos  │ Coordinador, Capacitación        │       │
│   │  form_diag_infra_fis         │ 9 criterios físicos              │       │
│   │  form_diag_infra_tec         │ 5 criterios tecnológicos         │       │
│   │  form_diag_conectividad_sist │ Internet, Sistemas, Seguridad    │       │
│   └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐       │
│   │                    TABLAS HIJAS (1:N)                            │       │
│   ├──────────────────────────────────────────────────────────────────┤       │
│   │  form_diag_equipamiento      │ FK → cat_equipamiento            │       │
│   │  form_diag_servicio          │ FK → cat_servicio_telesalud      │       │
│   │  form_diag_necesidad         │ FK → cat_necesidad               │       │
│   │  form_diag_nec_capacitacion  │ Temas de capacitación            │       │
│   │  form_diag_rh_apoyo          │ FK → cat_categoria_profesional   │       │
│   └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
│   ┌──────────────────────────────────────────────────────────────────┐       │
│   │                    TABLAS DE CATÁLOGOS                           │       │
│   ├──────────────────────────────────────────────────────────────────┤       │
│   │  form_diag_cat_equipamiento         │ 24 items (INF/BIO)        │       │
│   │  form_diag_cat_categoria_profesional│ 10 categorías             │       │
│   │  form_diag_cat_servicio_telesalud   │ 7 servicios               │       │
│   │  form_diag_cat_necesidad            │ INF_FIS / INF_TEC         │       │
│   │  form_diag_cat_prioridad            │ ALTA / MEDIA / BAJA       │       │
│   │  form_diag_cat_estado_equipo        │ BUENO / REGULAR / MALO    │       │
│   └──────────────────────────────────────────────────────────────────┘       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Flujo de Vinculación Usuario → IPRESS → Formulario

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    CADENA DE VINCULACIÓN                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   dim_usuarios (Usuario)                                                     │
│        │                                                                     │
│        │ id_user (FK 1:1)                                                    │
│        ▼                                                                     │
│   dim_personal_externo (PersonalExterno)                                     │
│        │                                                                     │
│        │ id_ipress (FK N:1)                                                  │
│        ▼                                                                     │
│   dim_ipress (Ipress) ◄────────────────── form_diag_formulario              │
│        │                                         │                           │
│        │ id_red (FK N:1)                         │ id_ipress (FK)           │
│        ▼                                         │                           │
│   dim_red (Red)                                  │                           │
│        │                                         │                           │
│        │ id_macroregion (FK N:1)                 │                           │
│        ▼                                         │                           │
│   dim_macroregion (Macroregion)                  │                           │
│                                                  ▼                           │
│                                    form_diag_* (tablas hijas)               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Ejemplo concreto:**
1. Usuario `jperez` se autentica (personal externo de H.I ALTO MAYO)
2. Frontend obtiene datos: `GET /api/usuarios/detalle/jperez` → `{ id_ipress: 123, nombre_ipress: "H.I ALTO MAYO" }`
3. Al guardar formulario, se envía `idIpress: 123`
4. El formulario queda vinculado SOLO a esa IPRESS

### Estados del Formulario

| Estado | Descripción | Acciones Permitidas |
|--------|-------------|---------------------|
| `EN_PROCESO` | Borrador, en edición | Ver, Editar, Eliminar |
| `ENVIADO` | Enviado para revisión | Ver (solo lectura) |
| `APROBADO` | Aprobado por gestión territorial | Ver |
| `RECHAZADO` | Rechazado, requiere corrección | Ver, Editar |

### API Endpoints

#### Gestión de Formularios

```bash
# Crear nuevo formulario
POST /api/formulario-diagnostico
Authorization: Bearer {token}
{
  "idIpress": 123,
  "anio": 2025,
  "datosGenerales": { ... },
  "recursosHumanos": { ... },
  "infraestructura": { ... },
  "equipamiento": [ ... ],
  "conectividad": { ... },
  "servicios": [ ... ],
  "necesidades": { ... }
}

# Actualizar formulario existente
PUT /api/formulario-diagnostico/{id}
Authorization: Bearer {token}

# Guardar borrador (crear o actualizar)
POST /api/formulario-diagnostico/borrador
Authorization: Bearer {token}

# Enviar formulario (cambiar estado a ENVIADO)
POST /api/formulario-diagnostico/{id}/enviar
Authorization: Bearer {token}

# Obtener formulario por ID
GET /api/formulario-diagnostico/{id}
Authorization: Bearer {token}

# Obtener borrador activo por IPRESS
GET /api/formulario-diagnostico/borrador/ipress/{idIpress}
Authorization: Bearer {token}

# Listar todos los formularios
GET /api/formulario-diagnostico
Authorization: Bearer {token}

# Listar por IPRESS
GET /api/formulario-diagnostico/ipress/{idIpress}
Authorization: Bearer {token}

# Listar por Red Asistencial
GET /api/formulario-diagnostico/red/{idRed}
Authorization: Bearer {token}

# Listar por estado
GET /api/formulario-diagnostico/estado/{estado}
Authorization: Bearer {token}

# Listar por año
GET /api/formulario-diagnostico/anio/{anio}
Authorization: Bearer {token}

# Eliminar formulario (solo EN_PROCESO)
DELETE /api/formulario-diagnostico/{id}
Authorization: Bearer {token}

# Verificar si existe formulario en proceso
GET /api/formulario-diagnostico/existe-en-proceso/ipress/{idIpress}
Authorization: Bearer {token}
```

### Estructura del Request

```json
{
  "idFormulario": null,
  "idIpress": 123,
  "anio": 2025,
  "observaciones": "",

  "datosGenerales": {
    "directorNombre": "Dr. Juan Pérez García",
    "directorCorreo": "director@ipress.gob.pe",
    "directorTelefono": "999888777",
    "responsableNombre": "Lic. María López",
    "responsableCorreo": "telesalud@ipress.gob.pe",
    "responsableTelefono": "999777666",
    "poblacionAdscrita": 50000,
    "atencionesMenuales": 1200
  },

  "recursosHumanos": {
    "coordTelesalud": true,
    "coordNombreCompleto": "Lic. Ana Torres",
    "coordCorreo": "ana.torres@ipress.gob.pe",
    "coordCelular": "999666555",
    "personalApoyo": true,
    "capacitacionTic": true,
    "normativa": true,
    "alfabetizacion": true,
    "planCapacitacion": false,
    "capacitacionesAnio": 3,
    "necesidadesCapacitacion": "Capacitación en teleconsulta"
  },

  "infraestructura": {
    "espacioFisico": true,
    "privacidad": true,
    "escritorio": true,
    "sillas": true,
    "estantes": false,
    "archivero": false,
    "iluminacion": true,
    "ventilacion": true,
    "aireAcondicionado": false,
    "numAmbientes": 2,
    "hardware": true,
    "software": true,
    "redes": true,
    "almacenamiento": false,
    "serviciosTec": true
  },

  "equipamiento": [
    {
      "idEquipamiento": 1,
      "disponible": true,
      "cantidad": 5,
      "idEstadoEquipo": 1,
      "observaciones": "Equipos nuevos"
    }
  ],

  "conectividad": {
    "internet": true,
    "estable": true,
    "energiaAlt": false,
    "puntosRed": true,
    "wifi": true,
    "tipoConexion": "Fibra óptica",
    "proveedor": "Movistar",
    "velocidadContratada": 100,
    "velocidadReal": 80,
    "numPuntosRed": 10,
    "essi": true,
    "pacs": false,
    "anatpat": false,
    "videoconferencia": true,
    "citasLinea": true,
    "otroSistema": "",
    "confidencialidad": true,
    "integridad": true,
    "disponibilidad": true,
    "contingencia": false,
    "backup": true,
    "consentimiento": true,
    "ley29733": true
  },

  "servicios": [
    {
      "idServicio": 2,
      "disponible": true,
      "observaciones": "Teleconsulta activa"
    }
  ],

  "necesidades": {
    "necesidades": [
      {
        "idNecesidad": 1,
        "cantidadRequerida": 2,
        "idPrioridad": 1
      }
    ],
    "capacitacion": [
      {
        "temaCapacitacion": "Teleconsulta avanzada",
        "poblacionObjetivo": "Personal de salud",
        "numParticipantes": 20,
        "idPrioridad": 1
      }
    ]
  }
}
```

### Catálogos Disponibles

#### Equipamiento (form_diag_cat_equipamiento)

| ID | Código | Descripción | Tipo |
|----|--------|-------------|------|
| 1 | 4.1.1 | Computadora de escritorio | INF |
| 2 | 4.1.2 | Computadora portátil (laptop) | INF |
| 3 | 4.1.3 | Monitor | INF |
| 4 | 4.1.4 | Cable HDMI | INF |
| 5 | 4.1.5 | Cámara web HD 1080p | INF |
| 6 | 4.1.6 | Micrófono | INF |
| 7 | 4.1.7 | Parlantes/audífonos | INF |
| 8 | 4.1.8 | Impresora | INF |
| 9 | 4.1.9 | Escáner | INF |
| 10 | 4.1.10 | Router/Switch de red | INF |
| 11+ | 4.2.x | Equipamiento biomédico | BIO |

#### Categorías Profesionales (form_diag_cat_categoria_profesional)

| ID | Nombre |
|----|--------|
| 1 | Médicos especialistas |
| 2 | Médicos generales |
| 3 | Enfermeras(os) |
| 4 | Obstetras |
| 5 | Tecnólogos médicos |
| 6 | Psicólogos |
| 7 | Nutricionistas |
| 8 | Trabajadores sociales |
| 9 | Otros profesionales de salud |
| 10 | Personal técnico de salud |

#### Servicios de Telesalud (form_diag_cat_servicio_telesalud)

| ID | Código | Descripción |
|----|--------|-------------|
| 1 | 6.1.1 | Servicios de Telesalud incorporados oficialmente |
| 2 | 6.1.2 | Teleconsulta |
| 3 | 6.1.3 | Teleorientación |
| 4 | 6.1.4 | Telemonitoreo |
| 5 | 6.1.5 | Teleinterconsulta |
| 6 | 6.1.6 | Televigilancia |
| 7 | 6.1.7 | Teletriage |

#### Prioridades (form_diag_cat_prioridad)

| ID | Código | Nombre |
|----|--------|--------|
| 1 | ALTA | Alta |
| 2 | MEDIA | Media |
| 3 | BAJA | Baja |

#### Estados de Equipo (form_diag_cat_estado_equipo)

| ID | Código | Nombre |
|----|--------|--------|
| 1 | BUENO | Bueno |
| 2 | REGULAR | Regular |
| 3 | MALO | Malo |

### Frontend - Estructura del Formulario

El formulario está organizado en 7 pestañas editables + vista previa:

```javascript
const TABS_CONFIG = [
  { id: "datos-generales",  label: "Datos Generales",  icon: FileText },
  { id: "recursos-humanos", label: "Recursos Humanos", icon: Users },
  { id: "infraestructura",  label: "Infraestructura",  icon: Building2 },
  { id: "equipamiento",     label: "Equipamiento",     icon: Monitor },
  { id: "conectividad",     label: "Conectividad",     icon: Wifi },
  { id: "servicios",        label: "Servicios",        icon: Stethoscope },
  { id: "necesidades",      label: "Necesidades",      icon: FileQuestion },
  { id: "vista-previa",     label: "Vista Previa",     icon: Eye, isPreview: true },
];
```

### Frontend - Servicio

Archivo: `frontend/src/services/formularioDiagnosticoService.js`

```javascript
import formularioDiagnosticoService from './services/formularioDiagnosticoService';

// Guardar borrador
await formularioDiagnosticoService.guardarBorrador(formData, idIpress);

// Obtener borrador existente
const borrador = await formularioDiagnosticoService.obtenerBorradorPorIpress(idIpress);

// Enviar formulario
await formularioDiagnosticoService.enviar(idFormulario);

// Listar por red (para gestión territorial)
const formularios = await formularioDiagnosticoService.listarPorRed(idRed);
```

### Backend - Estructura de Archivos

```
backend/src/main/java/com/styp/cenate/
├── model/formdiag/
│   ├── FormDiagFormulario.java          # Entidad principal
│   ├── FormDiagDatosGenerales.java      # Datos generales (1:1)
│   ├── FormDiagRecursosHumanos.java     # Recursos humanos (1:1)
│   ├── FormDiagInfraFis.java            # Infraestructura física (1:1)
│   ├── FormDiagInfraTec.java            # Infraestructura tecnológica (1:1)
│   ├── FormDiagConectividadSist.java    # Conectividad y sistemas (1:1)
│   ├── FormDiagEquipamiento.java        # Equipamiento (1:N)
│   ├── FormDiagServicio.java            # Servicios (1:N)
│   ├── FormDiagNecesidad.java           # Necesidades (1:N)
│   ├── FormDiagNecCapacitacion.java     # Necesidades capacitación (1:N)
│   ├── FormDiagRhApoyo.java             # Personal de apoyo (1:N)
│   ├── FormDiagCatEquipamiento.java     # Catálogo equipamiento
│   ├── FormDiagCatCategoriaProfesional.java
│   ├── FormDiagCatServicioTelesalud.java
│   ├── FormDiagCatNecesidad.java
│   ├── FormDiagCatPrioridad.java
│   └── FormDiagCatEstadoEquipo.java
├── repository/formdiag/
│   ├── FormDiagFormularioRepository.java
│   ├── FormDiagDatosGeneralesRepository.java
│   ├── FormDiagRecursosHumanosRepository.java
│   ├── FormDiagInfraFisRepository.java
│   ├── FormDiagInfraTecRepository.java
│   ├── FormDiagConectividadSistRepository.java
│   ├── FormDiagEquipamientoRepository.java
│   ├── FormDiagServicioRepository.java
│   ├── FormDiagNecesidadRepository.java
│   ├── FormDiagNecCapacitacionRepository.java
│   └── FormDiagRhApoyoRepository.java
├── dto/formdiag/
│   ├── FormDiagRequest.java             # DTO de entrada
│   ├── FormDiagResponse.java            # DTO de salida completo
│   └── FormDiagListResponse.java        # DTO de lista resumido
├── service/formdiag/
│   ├── FormDiagService.java             # Interface del servicio
│   └── impl/FormDiagServiceImpl.java    # Implementación
└── api/formdiag/
    └── FormDiagController.java          # Controlador REST
```

### Ejemplo de Uso - Flujo Completo

```bash
# 1. Usuario externo inicia sesión
POST /api/auth/login
{ "username": "jperez", "password": "***" }
# Respuesta incluye token JWT

# 2. Frontend obtiene datos del usuario (incluye idIpress)
GET /api/usuarios/detalle/jperez
Authorization: Bearer {token}
# Respuesta: { id_ipress: 123, nombre_ipress: "H.I ALTO MAYO", ... }

# 3. Verificar si existe borrador
GET /api/formulario-diagnostico/borrador/ipress/123
Authorization: Bearer {token}
# Si existe: retorna formulario. Si no: 204 No Content

# 4. Guardar progreso (crear o actualizar borrador)
POST /api/formulario-diagnostico/borrador
Authorization: Bearer {token}
{
  "idIpress": 123,
  "datosGenerales": { "directorNombre": "Dr. Juan Pérez", ... }
}
# Respuesta: formulario con idFormulario asignado

# 5. Enviar formulario final
POST /api/formulario-diagnostico/5/enviar
Authorization: Bearer {token}
# Respuesta: formulario con estado = "ENVIADO"

# 6. Gestión territorial lista formularios de su red
GET /api/formulario-diagnostico/red/10
Authorization: Bearer {token}
# Respuesta: lista de formularios de todas las IPRESS de la red
```

### Seguridad y Aislamiento de Datos

| Aspecto | Implementación |
|---------|----------------|
| **Autenticación** | JWT obligatorio en todos los endpoints |
| **Vinculación IPRESS** | `id_ipress` viene del `PersonalExterno` del usuario autenticado |
| **Aislamiento** | Cada formulario tiene `id_ipress` específico, no modificable |
| **Unicidad** | Solo UN formulario `EN_PROCESO` por IPRESS por año |
| **Permisos de edición** | Solo se pueden editar formularios en estado `EN_PROCESO` |
| **Permisos de eliminación** | Solo se pueden eliminar formularios en estado `EN_PROCESO` |

---

## Licencia

Este proyecto es propiedad de EsSalud Perú - CENATE.
Todos los derechos reservados © 2025

---

Desarrollado por el Ing. Styp Canto Rondón
