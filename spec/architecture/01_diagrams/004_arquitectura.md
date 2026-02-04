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
│            Servidor: 10.0.89.241:5432                         │
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
