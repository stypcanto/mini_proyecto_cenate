# Arquitectura del Sistema CENATE

> Documentacion tecnica de arquitectura y diagramas

---

## Diagrama General del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│              Puerto: 3000 (dev) / 80 (prod)                  │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Context API: AuthContext, PermisosContext              │ │
│  │  Components: ProtectedRoute, DynamicSidebar             │ │
│  │  Services: apiClient.js, mbacApi.js                     │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/REST + JWT Bearer Token
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND (Spring Boot)                      │
│                     Puerto: 8080                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Security Filter Chain                       │ │
│  │     JwtAuthenticationFilter → MBACPermissionAspect       │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  API Layer    → Service Layer → Repository → Database   │ │
│  │  (Controllers)  (Business)      (JPA)        (PostgreSQL)│ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC / HikariCP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PostgreSQL Database                       │
│            Servidor: 10.0.89.13:5432                         │
│            Base de datos: maestro_cenate                     │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Request (Backend)

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  JwtAuthenticationFilter                                │
│  - Extrae Bearer token del header Authorization         │
│  - Valida firma JWT y expiracion                        │
│  - Establece SecurityContext con usuario autenticado    │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  @CheckMBACPermission (AOP Aspect)                      │
│  - Valida permisos granulares por pagina/accion         │
│  - Consulta vw_permisos_activos                         │
│  - Lanza AccessDeniedException si no autorizado         │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  Controller (@RestController)                           │
│  - Recibe request, valida @Valid                        │
│  - Delega a Service                                     │
│  - Retorna ResponseEntity con ApiResponse<T>            │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  Service (@Service, @Transactional)                     │
│  - Logica de negocio                                    │
│  - Validaciones de dominio                              │
│  - Mapeo DTO <-> Entity                                 │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  Repository (JpaRepository)                             │
│  - Acceso a datos                                       │
│  - Queries JPQL y nativas                               │
│  - FETCH JOIN para evitar N+1                           │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Patron de Capas

| Capa | Paquete | Responsabilidad |
|------|---------|-----------------|
| API | `com.styp.cenate.api.*` | Controllers REST, validacion de entrada |
| Service | `com.styp.cenate.service.*` | Logica de negocio, transacciones |
| Domain | `com.styp.cenate.model.*` | Entidades JPA, reglas de dominio |
| Repository | `com.styp.cenate.repository.*` | Acceso a datos, queries |
| DTO | `com.styp.cenate.dto.*` | Objetos de transferencia |
| Security | `com.styp.cenate.security.*` | Autenticacion, autorizacion |

---

## Flujo de Autenticacion

```
1. POST /api/auth/login
   └── { username, password }

2. AuthenticationService.authenticate()
   ├── UserDetailsServiceImpl.loadUserByUsername()
   ├── BCrypt password validation (strength 12)
   └── JwtUtil.generateToken() con claims: roles, permisos

3. Response
   └── { token, userId, username, roles, permisos }

4. Frontend almacena en localStorage
   ├── auth.token
   └── auth.user

5. Requests subsecuentes
   └── Authorization: Bearer <token>

6. JwtAuthenticationFilter valida en cada request
```

---

## MBAC - Control de Acceso Modular

```
┌─────────────────────────────────────────────────────────────┐
│                    MODELO RBAC/MBAC                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  dim_usuarios ──┬──► rel_user_roles ◄── dim_roles           │
│                 │                            │               │
│                 │    segu_permisos_rol_modulo ◄──┘          │
│                 │            │                               │
│                 │            ▼                               │
│                 │    dim_modulos_sistema                     │
│                 │            │                               │
│                 │            ▼                               │
│                 │    dim_paginas_modulo                      │
│                 │            │                               │
│                 │            ▼                               │
│                 └──► segu_permisos_rol_pagina               │
│                      (puede_ver, puede_crear, puede_editar, │
│                       puede_eliminar, puede_exportar,        │
│                       puede_aprobar)                         │
└─────────────────────────────────────────────────────────────┘
```

**Tablas MBAC:**

| Tabla | Proposito |
|-------|-----------|
| `dim_modulos_sistema` | Modulos del menu (nombre, icono, ruta_base) |
| `dim_paginas_modulo` | Paginas dentro de cada modulo |
| `segu_permisos_rol_modulo` | Que roles ven que modulos |
| `segu_permisos_rol_pagina` | Permisos granulares por pagina |
| `rel_user_roles` | Asignacion de roles a usuarios |

---

## Relaciones de Entidades

```
Usuario (1) <-> (M) Rol
    │
    ├── (1:1) PersonalCnt (staff interno)
    │         ├── TipoDocumento
    │         ├── Ipress
    │         ├── Area
    │         └── RegimenLaboral
    │
    └── (1:1) PersonalExterno (staff IPRESS)
              └── Ipress

Ipress
    ├── TipoIpress
    └── Red → Macroregion

SolicitudCita
    ├── PersonalCnt
    ├── AreaHospitalaria
    ├── Servicio → Actividad → Subactividad
    └── EstadoCita

FirmaDigitalPersonal (v1.14.0)
    ├── (M:1) PersonalCnt
    │         ├── nombreCompleto (derivado)
    │         ├── dni (derivado)
    │         ├── regimenLaboral (derivado)
    │         ├── especialidad (derivado)
    │         └── ipress (derivado)
    │
    ├── entregoToken (boolean)
    ├── numeroSerieToken (si entregoToken=true)
    ├── fechaEntregaToken
    ├── fechaInicioCertificado
    ├── fechaVencimientoCertificado
    ├── motivoSinToken (si entregoToken=false)
    │   └── YA_TIENE | NO_REQUIERE | PENDIENTE
    │
    └── Campos calculados (en Response DTO):
        ├── estadoCertificado (VIGENTE | VENCIDO | SIN_CERTIFICADO)
        ├── diasRestantesVencimiento
        ├── venceProximamente (boolean)
        └── esPendiente (boolean)
```

---

## Módulos del Sistema (v1.14.0)

### Backend

| Módulo | Paquete Base | Descripción | Estado |
|--------|--------------|-------------|--------|
| **Autenticación** | `com.styp.cenate.security` | JWT + MBAC | ✅ Implementado v1.12.0 |
| **Usuarios** | `com.styp.cenate.api.usuario` | CRUD usuarios | ✅ Implementado |
| **Auditoría** | `com.styp.cenate.service.auditoria` | Sistema de auditoría completo | ✅ Implementado v1.13.0 |
| **Disponibilidad Médica** | `com.styp.cenate.api.disponibilidad` | Turnos médicos mensuales | ✅ Implementado v1.9.0 |
| **ChatBot Citas** | `com.styp.cenate.api.chatbot` | Solicitudes de citas | ✅ Implementado |
| **Firma Digital** | `com.styp.cenate.api.firmadigital` | Gestión de firmas digitales | ✅ Implementado v1.14.0 |
| **Solicitud Turnos** | `com.styp.cenate.api.solicitudturnos` | Solicitudes IPRESS → CENATE | 📋 Planificado |

### Frontend

| Módulo | Componentes Principales | Estado |
|--------|------------------------|--------|
| **Dashboard Admin** | `AdminDashboard.js`, `NotificationBell.jsx` | ✅ Implementado v1.13.0 |
| **Gestión Usuarios** | `UsersManagement.jsx`, `CrearUsuarioModal.jsx`, `ActualizarModel.jsx` | ✅ Implementado |
| **Auditoría** | `LogsDelSistema.jsx`, `auditoriaDiccionario.js` | ✅ Implementado v1.14.0 |
| **Disponibilidad Médica** | `CalendarioDisponibilidad.jsx`, `RevisionDisponibilidad.jsx` | ✅ Implementado v1.9.0 |
| **ChatBot Citas** | `ChatBotDashboard.jsx`, Componentes consulta | ✅ Implementado |
| **Firma Digital** | `FirmaDigitalTab.jsx`, `ActualizarEntregaTokenModal.jsx`, `ControlFirmaDigital.jsx` | ✅ Implementado v1.14.0 |

---

## Diccionario de Auditoría (v1.14.0)

Sistema centralizado de traducción de códigos técnicos a nombres legibles.

**Archivo:** `frontend/src/constants/auditoriaDiccionario.js`

### Estructura

```javascript
┌─────────────────────────────────────────────────────────────┐
│            DICCIONARIO DE AUDITORÍA                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  MODULOS_AUDITORIA                                          │
│  ├── AUTH: { nombre: "Autenticación", icono: "🔐", ... }   │
│  ├── USUARIOS: { nombre: "Usuarios", icono: "👥", ... }     │
│  ├── FIRMA_DIGITAL: { nombre: "Firma Digital", ... }        │
│  └── ... (10+ módulos)                                      │
│                                                              │
│  ACCIONES_AUDITORIA                                         │
│  ├── LOGIN: { nombre: "Inicio de Sesión", ... }            │
│  ├── CREATE_USER: { nombre: "Crear Usuario", ... }         │
│  ├── CREATE_FIRMA_DIGITAL: { nombre: "Crear Firma", ... }  │
│  └── ... (40+ acciones)                                     │
│                                                              │
│  NIVELES_AUDITORIA                                          │
│  ├── INFO: { color: "blue", badge: "badge-info", ... }     │
│  ├── WARNING: { color: "yellow", ... }                      │
│  ├── ERROR: { color: "red", ... }                           │
│  └── CRITICAL: { color: "purple", ... }                     │
│                                                              │
│  FUNCIONES HELPER (8 funciones)                             │
│  ├── obtenerNombreModulo(codigo)                            │
│  ├── obtenerIconoModulo(codigo)                             │
│  ├── obtenerNombreAccion(codigo)                            │
│  ├── obtenerDescripcionAccion(codigo)                       │
│  ├── obtenerColorModulo(codigo)                             │
│  ├── obtenerEmojiAccion(codigo)                             │
│  ├── formatearFecha(fecha)                                  │
│  └── obtenerBadgeClase(nivel)                               │
└─────────────────────────────────────────────────────────────┘
```

### Beneficios

| Beneficio | Descripción |
|-----------|-------------|
| **Centralización** | Un solo archivo para todas las traducciones |
| **Consistencia** | Mismos nombres en toda la UI |
| **Mantenibilidad** | Agregar nuevos módulos/acciones es trivial |
| **UX Mejorada** | Usuarios no técnicos entienden los logs |
| **Tooltips** | Descripciones detalladas en hover |

### Uso en Componentes

```javascript
// En LogsDelSistema.jsx
import { obtenerNombreModulo, obtenerIconoModulo } from '../constants/auditoriaDiccionario';

// Renderizar módulo con ícono
const moduloDisplay = `${obtenerIconoModulo(log.modulo)} ${obtenerNombreModulo(log.modulo)}`;
// Resultado: "🔐 Autenticación"

// En AdminDashboard.js
const accionDisplay = obtenerNombreAccion(log.accion);
// "LOGIN" → "Inicio de Sesión"
```

---

## Entidad Usuario

```java
@Entity
@Table(name = "dim_usuarios")
public class Usuario implements UserDetails {
    @Id
    private Long idUser;
    private String nameUser;        // Username (DNI)
    private String password;        // BCrypt
    private String emailUser;
    private Boolean activo;
    private Integer failedAttempts;
    private LocalDateTime lockedUntil;
    private Boolean requiereCambioPassword;

    @ManyToMany
    @JoinTable(name = "rel_user_roles")
    private Set<Rol> roles;

    @OneToOne(mappedBy = "usuario")
    private PersonalCnt personalCnt;

    @OneToOne(mappedBy = "usuario")
    private PersonalExterno personalExterno;
}
```

---

## Frontend - Estado Global

### AuthContext

```javascript
const {
  user,           // { id, username, roles, nombreCompleto, token }
  token,          // JWT string
  loading,        // boolean
  isInitialized,  // boolean
  login,          // (username, password) => Promise
  logout,         // () => void
  hasRole,        // (roles: string[]) => boolean
  refreshUser,    // () => Promise
  updateUser,     // (newData) => void
} = useAuth();
```

### PermisosContext

```javascript
const {
  modulos,              // Array de modulos
  permisosPorRuta,      // Map<ruta, permisos>
  loading,              // boolean
  tienePermiso,         // (ruta, accion) => boolean
  obtenerPermisos,      // (ruta) => object
  puedeAcceder,         // (ruta) => boolean
  refrescarPermisos,    // () => Promise
  getModulosAgrupados,  // () => Array
} = usePermisos();

// Acciones disponibles
const acciones = ['ver', 'crear', 'editar', 'eliminar', 'exportar', 'aprobar'];
```

---

## Uso de MBAC

### Backend

```java
@CheckMBACPermission(
    pagina = "/admin/users",
    accion = "crear",
    mensajeDenegado = "No tiene permiso para crear usuarios"
)
@PostMapping
public ResponseEntity<?> crearUsuario(...) { ... }
```

### Frontend

```jsx
// Proteger ruta completa
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

// Ocultar boton segun permisos
<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

---

## Patrones de Diseno Utilizados

| Patron | Uso en el Proyecto |
|--------|-------------------|
| **Repository** | JpaRepository para acceso a datos |
| **Service Layer** | Interface + Impl para logica de negocio |
| **DTO** | Separacion de API contracts y entidades |
| **Mapper** | Conversion Entity <-> DTO |
| **AOP** | Verificacion MBAC con @CheckMBACPermission |
| **Factory** | ModelMapper para mapeo automatico |
| **Observer** | React Context para estado global |
| **Protected Route** | HOC para rutas protegidas |
| **Singleton** | Spring beans (@Component, @Service) |
