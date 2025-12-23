# CLAUDE.md - Memoria del Proyecto CENATE

> Sistema de Telemedicina para el Centro Nacional de Telemedicina - EsSalud

**Versión actual:** `v1.7.7` (2025-12-23) - Documentación de Usuarios

---

## Resumen Ejecutivo

**CENATE** es un sistema completo de gestión de telemedicina que incluye:
- Gestión de usuarios con sistema MBAC (Control de Acceso Basado en Módulos)
- Gestión de pacientes y asegurados (5M+ registros)
- Chatbot para consultas de citas
- Formulario de diagnóstico situacional de telesalud
- Dashboard médico y administrativo

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| Build Tool | Gradle | - |
| CSS | TailwindCSS | 3.4.18 |
| Iconos | Lucide React | - |
| HTTP Client | Axios + Fetch | - |

---

## Arquitectura del Sistema

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

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                             # Especificaciones técnicas
│   └── 001_espec_users_bd.md         # Modelo de datos de usuarios
│
├── backend/                          # Spring Boot API
│   ├── src/main/java/com/styp/cenate/
│   │   ├── api/                      # Controllers REST (20+)
│   │   │   ├── usuario/              # UsuarioController
│   │   │   ├── seguridad/            # AuthController, PasswordResetController
│   │   │   ├── chatbot/              # Chatbot endpoints (6 controllers)
│   │   │   ├── admin/                # AdminDashboard, AdminRecuperacion
│   │   │   ├── mbac/                 # MBAC control endpoints
│   │   │   └── formdiag/             # Formulario diagnóstico
│   │   ├── service/                  # Business Logic (Interface + Impl)
│   │   │   ├── usuario/              # UsuarioService, UsuarioServiceImpl
│   │   │   ├── auth/                 # AuthenticationService
│   │   │   ├── mbac/                 # PermisosService
│   │   │   ├── email/                # EmailService
│   │   │   └── chatbot/              # Chatbot services
│   │   ├── model/                    # JPA Entities (49 entidades)
│   │   │   ├── Usuario.java          # Implementa UserDetails
│   │   │   ├── Rol.java              # Roles del sistema
│   │   │   ├── Permiso.java          # Permisos granulares
│   │   │   ├── PersonalCnt.java      # Personal CENATE
│   │   │   ├── PersonalExterno.java  # Personal externo (IPRESS)
│   │   │   ├── chatbot/              # Entidades chatbot
│   │   │   ├── formdiag/             # Entidades formulario diagnóstico
│   │   │   └── view/                 # Vistas de BD
│   │   ├── repository/               # JPA Repositories (46)
│   │   ├── dto/                      # Data Transfer Objects (50+)
│   │   │   ├── auth/                 # AuthRequest, AuthResponse
│   │   │   ├── segu/                 # RolDTO, PermisoDTO
│   │   │   ├── chatbot/              # DTOs chatbot
│   │   │   └── formdiag/             # DTOs formulario
│   │   ├── mapper/                   # Entity ↔ DTO mappers
│   │   ├── security/                 # Spring Security
│   │   │   ├── config/               # SecurityConfig
│   │   │   ├── filter/               # JwtAuthenticationFilter
│   │   │   ├── service/              # JwtUtil, UserDetailsServiceImpl
│   │   │   └── mbac/                 # MBACPermissionAspect, @CheckMBACPermission
│   │   ├── config/                   # Configuración general
│   │   │   ├── SecurityConfig.java
│   │   │   ├── SwaggerConfig.java
│   │   │   └── AsyncConfig.java
│   │   └── exception/                # Manejo de errores
│   │       ├── GlobalExceptionHandler.java
│   │       └── *Exception.java
│   └── src/main/resources/
│       └── application.properties    # Configuración
│
├── frontend/                         # React Application
│   ├── src/
│   │   ├── components/               # Componentes reutilizables
│   │   │   ├── ui/                   # Button, Card, Modal, StatCard
│   │   │   ├── security/             # ProtectedRoute, PermissionGate
│   │   │   ├── layout/               # ResponsiveSidebar, Header
│   │   │   ├── modals/               # ForgotPasswordModal, etc.
│   │   │   ├── DynamicSidebar.jsx    # Sidebar dinámico MBAC
│   │   │   └── AppLayout.jsx         # Layout principal
│   │   ├── context/                  # Estado global
│   │   │   ├── AuthContext.js        # Autenticación y sesión
│   │   │   └── PermisosContext.jsx   # Permisos MBAC
│   │   ├── pages/                    # Páginas (31+)
│   │   │   ├── admin/                # Dashboard, Users, MBAC
│   │   │   ├── user/                 # Profile, Dashboard
│   │   │   └── roles/                # Medico, Coordinador, Externo
│   │   ├── services/                 # API services (16+)
│   │   │   ├── aseguradosService.js
│   │   │   ├── rolService.js
│   │   │   ├── permisosService.js
│   │   │   └── mbacApi.js            # Axios instance
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useAuth.js
│   │   │   └── usePermissions.js
│   │   ├── lib/
│   │   │   └── apiClient.js          # Fetch-based HTTP client
│   │   ├── utils/                    # Helpers
│   │   ├── Styles/                   # CSS global
│   │   ├── App.js                    # Router principal (487 líneas)
│   │   └── index.js                  # Entry point
│   ├── package.json
│   └── tailwind.config.js
│
└── README.md                         # Documentación completa API
```

---

## Clean Architecture - Backend

### Flujo de Request

```
HTTP Request
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  JwtAuthenticationFilter                                │
│  - Extrae Bearer token del header Authorization         │
│  - Valida firma JWT y expiración                        │
│  - Establece SecurityContext con usuario autenticado    │
└─────────────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  @CheckMBACPermission (AOP Aspect)                      │
│  - Valida permisos granulares por página/acción         │
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
│  - Lógica de negocio                                    │
│  - Validaciones de dominio                              │
│  - Mapeo DTO ↔ Entity                                   │
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

### Patrón de Capas

| Capa | Paquete | Responsabilidad |
|------|---------|-----------------|
| API | `com.styp.cenate.api.*` | Controllers REST, validación de entrada |
| Service | `com.styp.cenate.service.*` | Lógica de negocio, transacciones |
| Domain | `com.styp.cenate.model.*` | Entidades JPA, reglas de dominio |
| Repository | `com.styp.cenate.repository.*` | Acceso a datos, queries |
| DTO | `com.styp.cenate.dto.*` | Objetos de transferencia |
| Security | `com.styp.cenate.security.*` | Autenticación, autorización |

---

## Sistema de Seguridad

### JWT Configuration

```properties
# application.properties
jwt.secret=${JWT_SECRET:dev-secret-key-change-in-production-min-32-chars}
jwt.expiration=86400000  # 24 horas en ms
```

### Flujo de Autenticación

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

### Roles del Sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| SUPERADMIN | Administrador total | Todo el sistema |
| ADMIN | Administrador | Panel admin, usuarios |
| MEDICO | Personal médico | Dashboard médico, pacientes |
| COORDINADOR | Coordinador de área | Agenda, asignaciones |
| EXTERNO | Personal IPRESS | Formulario diagnóstico |

### MBAC - Control de Acceso Modular

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

| Tabla | Propósito |
|-------|-----------|
| `dim_modulos_sistema` | Módulos del menú (nombre, icono, ruta_base) |
| `dim_paginas_modulo` | Páginas dentro de cada módulo |
| `segu_permisos_rol_modulo` | Qué roles ven qué módulos |
| `segu_permisos_rol_pagina` | Permisos granulares por página |
| `rel_user_roles` | Asignación de roles a usuarios |

**Uso en Backend:**

```java
@CheckMBACPermission(
    pagina = "/admin/users",
    accion = "crear",
    mensajeDenegado = "No tiene permiso para crear usuarios"
)
@PostMapping
public ResponseEntity<?> crearUsuario(...) { ... }
```

**Uso en Frontend:**

```jsx
// Proteger ruta completa
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

// Ocultar botón según permisos
<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

---

## Entidades Principales

### Usuario

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

### Relaciones Clave

```
Usuario (1) ←→ (M) Rol
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

## API REST - Endpoints Principales

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer {token}  // Para endpoints protegidos
```

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con username/password |
| PUT | `/api/auth/change-password` | Cambiar contraseña |
| GET | `/api/auth/me` | Obtener usuario actual |
| POST | `/api/auth/completar-primer-acceso` | Completar primer login |
| POST | `/api/auth/solicitar-reset-contrasena` | Solicitar reset password |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar todos |
| GET | `/api/usuarios/id/{id}` | Obtener por ID |
| POST | `/api/usuarios/crear` | Crear usuario |
| POST | `/api/usuarios/crear-con-roles` | Crear con roles (SUPERADMIN) |
| PUT | `/api/usuarios/id/{id}` | Actualizar |
| DELETE | `/api/usuarios/id/{id}` | Eliminar |
| PUT | `/api/usuarios/id/{id}/activate` | Activar |
| PUT | `/api/usuarios/id/{id}/deactivate` | Desactivar |
| PUT | `/api/usuarios/id/{id}/unlock` | Desbloquear |

### MBAC

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mbac/modulos` | Listar módulos |
| POST | `/api/mbac/modulos` | Crear módulo |
| GET | `/api/mbac/paginas` | Listar páginas |
| POST | `/api/mbac/paginas` | Crear página |
| GET | `/api/mbac/roles` | Listar roles |
| GET/POST/PUT/DELETE | `/api/mbac/permisos-rol-modulo` | CRUD permisos módulo |
| GET/POST/PUT/DELETE | `/api/mbac/permisos-rol-pagina` | CRUD permisos página |
| GET | `/api/menu-usuario/usuario/{userId}` | Menú dinámico del usuario |

### Chatbot (Públicos)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/chatbot/documento/{dni}` | Consultar paciente |
| GET | `/api/chatbot/atencioncenate` | Atenciones CENATE |
| GET | `/api/chatbot/atencionglobal/{dni}` | Atenciones globales |
| GET | `/api/disponibilidad/por-servicio` | Disponibilidad citas |
| POST | `/api/solicitud` | Crear solicitud cita |

### Gestión de Pacientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/gestion-pacientes` | Listar gestiones |
| POST | `/api/gestion-pacientes` | Crear gestión |
| PUT | `/api/gestion-pacientes/{id}` | Actualizar |
| DELETE | `/api/gestion-pacientes/{id}` | Eliminar |
| GET | `/api/gestion-pacientes/asegurado/{dni}` | Buscar asegurado |
| PUT | `/api/gestion-pacientes/{id}/telemedicina` | Seleccionar telemedicina |

### Catálogos

| Endpoint Base | Descripción |
|---------------|-------------|
| `/api/ipress` | Instituciones IPRESS |
| `/api/profesiones` | Profesiones |
| `/api/especialidades` | Especialidades médicas |
| `/api/regimenes` | Regímenes laborales |
| `/api/admin/areas` | Áreas organizacionales |
| `/api/tipos-documento` | Tipos de documento |
| `/api/redes` | Redes asistenciales |

---

## Frontend - Estado Global

### AuthContext

```javascript
// Valores disponibles
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
// Valores disponibles
const {
  modulos,              // Array de módulos
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

### Rutas Principales

| Ruta | Componente | Roles |
|------|------------|-------|
| `/admin/dashboard` | AdminDashboard | SUPERADMIN, ADMIN |
| `/admin/users` | UsersManagement | SUPERADMIN, ADMIN |
| `/admin/mbac` | MBACControl | SUPERADMIN |
| `/roles/medico/dashboard` | MedicoDashboard | MEDICO |
| `/roles/coordinador/dashboard` | CoordinadorDashboard | COORDINADOR |
| `/roles/externo/dashboard` | ExternoDashboard | EXTERNO |
| `/user/dashboard` | UserDashboard | Todos |

---

## Configuración de Desarrollo

### Variables de Entorno - Backend

```properties
# Base de datos (Servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT
JWT_SECRET=your-secure-key-at-least-32-characters

# Email (Gmail SMTP)
MAIL_USERNAME=cenateinformatica@gmail.com
MAIL_PASSWORD=nolq uisr fwdw zdly

# Frontend URL (para emails)
FRONTEND_URL=http://localhost:3000
```

### Variables de Entorno - Frontend

```bash
REACT_APP_API_URL=http://localhost:8080/api
```

### Comandos de Desarrollo

```bash
# Backend
cd backend
./gradlew bootRun

# Frontend
cd frontend
npm install
npm start           # localhost:3000
npm run start:local # Apunta a localhost:8080
npm run start:network # Apunta a 10.0.89.239:8080
```

### Credenciales de Prueba

```
Username: 44914706
Password: @Cenate2025
```

---

## Patrones de Diseño Utilizados

| Patrón | Uso en el Proyecto |
|--------|-------------------|
| **Repository** | JpaRepository para acceso a datos |
| **Service Layer** | Interface + Impl para lógica de negocio |
| **DTO** | Separación de API contracts y entidades |
| **Mapper** | Conversión Entity ↔ DTO |
| **AOP** | Verificación MBAC con @CheckMBACPermission |
| **Factory** | ModelMapper para mapeo automático |
| **Observer** | React Context para estado global |
| **Protected Route** | HOC para rutas protegidas |
| **Singleton** | Spring beans (@Component, @Service) |

---

## Manejo de Errores

### GlobalExceptionHandler

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    // 400 - Bad Request
    @ExceptionHandler(MethodArgumentNotValidException.class)

    // 401 - Unauthorized (manejado por Security)

    // 403 - Forbidden
    @ExceptionHandler(AccessDeniedException.class)

    // 404 - Not Found
    @ExceptionHandler({EntityNotFoundException.class, ResourceNotFoundException.class})

    // 409 - Conflict
    @ExceptionHandler({BusinessException.class, DataIntegrityViolationException.class})

    // 422 - Unprocessable Entity
    @ExceptionHandler(ValidationException.class)

    // 500 - Internal Server Error
    @ExceptionHandler(Exception.class)
}
```

### Formato de Respuesta de Error

```json
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "timestamp": "2025-12-23T10:30:00",
  "validationErrors": {
    "campo": "error específico"
  }
}
```

---

## Troubleshooting Común

### Backend no inicia

```bash
# Verificar conexión a PostgreSQL remoto
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -c "SELECT 1"

# Verificar puerto 8080
lsof -i :8080
```

### Error "Could not open JPA EntityManager"

Verificar que `application.properties` apunte al servidor correcto:
```properties
spring.datasource.url=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
spring.datasource.password=Essalud2025
```

### JWT WeakKeyException

El secret debe tener mínimo 32 caracteres (256 bits).

```properties
jwt.secret=dev-secret-key-change-in-production-min-32-chars
```

### Usuario bloqueado

```sql
UPDATE dim_usuarios
SET failed_attempts = 0, locked_until = NULL
WHERE name_user = 'usuario';
```

### Módulo no aparece en sidebar

1. Verificar `activo = true` en `dim_modulos_sistema`
2. Verificar permiso en `segu_permisos_rol_modulo`
3. Verificar página con permiso en `segu_permisos_rol_pagina`

### CORS Error

Agregar origen en `application.properties`:

```properties
cors.allowed-origins=http://nuevo-origen:3000
```

### Correos no se envían (recuperación de contraseña)

1. Verificar credenciales Gmail en `application.properties`:
```properties
spring.mail.username=cenateinformatica@gmail.com
spring.mail.password=nolq uisr fwdw zdly
```

2. La contraseña debe ser una **Contraseña de Aplicación** de Google (no la contraseña normal)
3. Generar en: myaccount.google.com → Seguridad → Contraseñas de aplicaciones
4. Los métodos de email son `@Async`, los errores solo aparecen en logs

---

## Instrucciones para Claude

### Al implementar nuevos features:

1. **Análisis previo**: Evaluar impacto en backend, frontend y base de datos
2. **Seguir patrones existentes**: Controller → Service → Repository
3. **Usar DTOs**: Nunca exponer entidades directamente
4. **Agregar permisos MBAC** si es necesario
5. **Documentar endpoints** en README.md

### Al modificar código existente:

1. **Leer archivos** antes de modificar
2. **Mantener consistencia** con el estilo existente
3. **No sobreingeniería**: Solo cambios necesarios
4. **Respetar capas**: No mezclar lógica de negocio en controllers

### Rutas de archivos clave:

```
# Backend
backend/src/main/java/com/styp/cenate/config/SecurityConfig.java
backend/src/main/java/com/styp/cenate/security/filter/JwtAuthenticationFilter.java
backend/src/main/java/com/styp/cenate/security/service/JwtUtil.java
backend/src/main/java/com/styp/cenate/exception/GlobalExceptionHandler.java
backend/src/main/resources/application.properties

# Frontend
frontend/src/App.js
frontend/src/context/AuthContext.js
frontend/src/context/PermisosContext.jsx
frontend/src/lib/apiClient.js
frontend/src/components/security/ProtectedRoute.jsx
frontend/src/components/DynamicSidebar.jsx
```

---

## Historial de Cambios

### v1.7.7 (2025-12-23) - Documentación de Usuarios

#### Especificación técnica del sistema de usuarios

Se creó documentación completa del modelo de datos de usuarios en:
`spec/001_espec_users_bd.md`

**Contenido del documento:**

| Sección | Descripción |
|---------|-------------|
| Diagrama ERD | Relaciones entre tablas de usuarios |
| Tablas principales | dim_usuarios, dim_personal_cnt, account_requests |
| Clasificación INTERNO/EXTERNO | Lógica por id_origen y código Java |
| Flujo de registro | Diagrama de secuencia completo |
| Estados de usuario | Ciclo de vida de solicitudes y usuarios |
| Cascada de eliminación | Orden correcto para evitar FK errors |
| Roles del sistema | 20 roles con tipos asignados |
| Endpoints API | Todos los endpoints de usuarios |
| Queries diagnóstico | SQL útiles para debugging |

**Tablas documentadas:**

```
dim_usuarios          - Credenciales de acceso
dim_personal_cnt      - Datos personales (INTERNO y EXTERNO)
account_requests      - Solicitudes de registro
dim_origen_personal   - Clasificación (1=INTERNO, 2=EXTERNO)
rel_user_roles        - Relación usuario-rol (M:N)
dim_personal_prof     - Profesiones del personal
dim_personal_tipo     - Tipo de profesional
```

**Lógica de clasificación INTERNO/EXTERNO:**

```java
// Por id_origen en dim_personal_cnt:
// id_origen = 1 → INTERNO
// id_origen = 2 → EXTERNO

// Por existencia en tablas:
if (personalCnt != null) tipoPersonal = "INTERNO";
else if (personalExterno != null) tipoPersonal = "EXTERNO";
else tipoPersonal = "SIN_CLASIFICAR";
```

#### Limpieza de base de datos

Se ejecutó limpieza de 11 solicitudes APROBADAS sin usuario creado:

**DNIs liberados:**
- 99999999, 66666666, 12345679, 56321456, 98575642
- 14851616, 45151515, 54544545, 45415156, 99921626, 87654321

**Correo liberado:** cenate.analista@essalud.gob.pe (estaba bloqueado)

**Estado final de la BD:**

| Métrica | Valor |
|---------|-------|
| Usuarios totales | 100 |
| Pendientes activación | 90 |
| Solicitudes APROBADAS | 4 (válidas) |
| Solicitudes RECHAZADAS | 21 |
| Datos huérfanos | 0 |
| DNIs duplicados | 0 |

---

### v1.7.6 (2025-12-23) - Limpieza de Datos Huérfanos

#### Sistema de limpieza de datos residuales

Se mejoró el proceso de eliminación de usuarios y se agregaron nuevos endpoints para diagnosticar y limpiar datos huérfanos que impiden el re-registro de usuarios.

**Problema resuelto:**

Cuando un usuario era eliminado (ej: desde "Pendientes de Activación"), podían quedar datos huérfanos en las siguientes tablas:
- `dim_usuarios` - Usuario sin eliminar
- `dim_personal_cnt` - Personal sin usuario asociado
- `dim_personal_prof` - Profesiones del personal
- `dim_personal_tipo` - Tipos de profesional
- `account_requests` - Solicitudes en estado APROBADO

Esto impedía que el usuario volviera a registrarse con el mismo DNI.

**Mejoras al proceso de eliminación:**

El método `eliminarUsuarioPendienteActivacion()` ahora también elimina:
- `dim_personal_prof` - Profesiones asociadas al personal
- `dim_personal_tipo` - Tipos de profesional asociados

**Nuevos endpoints:**

```java
// Verificar datos existentes para un DNI (GET)
GET /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEncontrados, personalesEncontrados, solicitudesActivas, puedeRegistrarse, razonBloqueo }

// Limpiar todos los datos huérfanos de un DNI (DELETE)
DELETE /api/admin/datos-huerfanos/{numDocumento}
// Respuesta: { usuariosEliminados, personalesEliminados, solicitudesActualizadas, totalRegistrosEliminados }
```

**Nuevos métodos en AccountRequestService:**

```java
// Limpia datos huérfanos de un documento
public Map<String, Object> limpiarDatosHuerfanos(String numDocumento)

// Verifica qué datos existen para un documento
public Map<String, Object> verificarDatosExistentes(String numDocumento)
```

**Tablas afectadas en la limpieza (orden correcto):**
```sql
-- 1. Permisos del usuario
DELETE FROM permisos_modulares WHERE id_user = ?;
-- 2. Roles del usuario
DELETE FROM rel_user_roles WHERE id_user = ?;
-- 3. Desvincular personal
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_usuario = ?;
-- 4. Profesiones del personal
DELETE FROM dim_personal_prof WHERE id_pers = ?;
-- 5. Tipos del personal
DELETE FROM dim_personal_tipo WHERE id_pers = ?;
-- 6. Usuario
DELETE FROM dim_usuarios WHERE id_user = ?;
-- 7. Personal
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
-- 8. Actualizar solicitudes a RECHAZADO
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

**Archivos modificados:**

```
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
  - Mejorado eliminarUsuarioPendienteActivacion()
  - Nuevo limpiarDatosHuerfanos()
  - Nuevo verificarDatosExistentes()

backend/src/main/java/com/styp/cenate/api/seguridad/SolicitudRegistroController.java
  - GET /admin/datos-huerfanos/{numDocumento}
  - DELETE /admin/datos-huerfanos/{numDocumento}
```

**Uso desde el frontend o curl:**

```bash
# Verificar qué bloquea el registro
curl -X GET "http://localhost:8080/api/admin/datos-huerfanos/12121212" \
  -H "Authorization: Bearer TOKEN"

# Limpiar datos huérfanos
curl -X DELETE "http://localhost:8080/api/admin/datos-huerfanos/12121212" \
  -H "Authorization: Bearer TOKEN"
```

---

### v1.7.5 (2025-12-23) - Panel de Activaciones Mejorado

#### Panel completo para gestión de usuarios pendientes de activación

**Nueva pestaña en Aprobación de Solicitudes:**

Se agregó una segunda pestaña "Pendientes de Activación" en `AprobacionSolicitudes.jsx` que muestra usuarios aprobados que aún no han configurado su contraseña.

**Características del panel:**

1. **Pestañas de navegación:**
   - "Solicitudes de Registro" - Flujo original de aprobación
   - "Pendientes de Activación" - Lista usuarios con `requiere_cambio_password = true`

2. **Buscador integrado:**
   - Filtra por nombre completo
   - Filtra por número de documento
   - Filtra por correo personal o institucional
   - Muestra contador de resultados filtrados (ej: "Mostrando 5 de 93 usuarios")

3. **Acciones por usuario:**
   - **Reenviar Email**: Genera nuevo token y envía correo de activación
   - **Eliminar**: Elimina usuario para permitir re-registro (v1.7.4)

**Endpoints del backend:**

```java
// Listar usuarios pendientes
GET /api/admin/usuarios/pendientes-activacion

// Reenviar email de activación
POST /api/admin/usuarios/{idUsuario}/reenviar-activacion
```

**Corrección de Lazy Loading en reenviarEmailActivacion:**

El método ahora usa SQL directo para obtener el email, evitando problemas de lazy loading con JPA:

```java
// SQL directo (evita lazy loading)
String sql = """
    SELECT p.email_pers, p.email_corp_pers, p.nom_pers, p.ape_pater_pers, p.ape_mater_pers
    FROM dim_personal_cnt p
    WHERE p.id_usuario = ?
""";
var result = jdbcTemplate.queryForMap(sql, idUsuario);
email = (emailPers != null && !emailPers.isBlank()) ? emailPers : emailCorp;
```

**Archivos modificados:**

```
frontend/src/pages/admin/AprobacionSolicitudes.jsx
  - Nueva pestaña "Pendientes de Activación"
  - Buscador con filtro por nombre/documento/email
  - Iconos: Search, RefreshCw, UserCheck, Send, Trash2

backend/src/main/java/com/styp/cenate/api/seguridad/SolicitudRegistroController.java
  - GET /admin/usuarios/pendientes-activacion
  - POST /admin/usuarios/{id}/reenviar-activacion

backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
  - listarUsuariosPendientesActivacion() - Query SQL directo
  - reenviarEmailActivacion() - Corregido lazy loading con SQL
```

---

### v1.7.4 (2025-12-23) - Gestión de Activaciones

#### Nueva funcionalidad: Eliminar usuarios pendientes de activación

Permite al administrador eliminar usuarios que fueron aprobados pero nunca activaron su cuenta, para que puedan volver a registrarse.

**Archivos modificados:**

**Frontend:** `frontend/src/pages/admin/AprobacionSolicitudes.jsx`
- Agregado botón "Eliminar" (icono Trash2) junto a "Reenviar Email"
- Confirmación con mensaje explicativo antes de eliminar
- Estado de carga mientras se procesa la eliminación

**Backend Controller:** `backend/src/main/java/com/styp/cenate/api/seguridad/SolicitudRegistroController.java`
```java
@DeleteMapping("/admin/usuarios/{idUsuario}/pendiente-activacion")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public ResponseEntity<?> eliminarUsuarioPendiente(@PathVariable Long idUsuario)
```

**Backend Service:** `backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java`
```java
@Transactional
public void eliminarUsuarioPendienteActivacion(Long idUsuario) {
    // 1. Verificar que requiere_cambio_password = true
    // 2. Eliminar permisos (permisos_modulares)
    // 3. Eliminar roles (rel_user_roles)
    // 4. Desvincular personal (SET id_usuario = NULL)
    // 5. Eliminar usuario (dim_usuarios)
    // 6. Eliminar personal (dim_personal_cnt)
    // 7. Actualizar solicitud original a RECHAZADO
}
```

**Tablas afectadas (orden correcto para evitar FK constraints):**
```sql
DELETE FROM permisos_modulares WHERE id_user = ?;
DELETE FROM rel_user_roles WHERE id_user = ?;
UPDATE dim_personal_cnt SET id_usuario = NULL WHERE id_pers = ?;
DELETE FROM dim_usuarios WHERE id_user = ?;
DELETE FROM dim_personal_cnt WHERE id_pers = ?;
UPDATE account_requests SET estado = 'RECHAZADO' WHERE num_documento = ?;
```

#### Validación mejorada: Permitir re-registro

Ahora los usuarios pueden volver a registrarse si su solicitud anterior fue RECHAZADA.

**Backend Repository:** `backend/src/main/java/com/styp/cenate/repository/AccountRequestRepository.java`
```java
// Solo bloquea si hay solicitud PENDIENTE o APROBADO (no RECHAZADO)
@Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.numDocumento = :numDoc AND a.estado IN ('PENDIENTE', 'APROBADO')")
boolean existsSolicitudActivaByNumDocumento(String numDocumento);

@Query("SELECT COUNT(a) > 0 FROM AccountRequest a WHERE a.correoPersonal = :correo AND a.estado IN ('PENDIENTE', 'APROBADO')")
boolean existsSolicitudActivaByCorreoPersonal(String correoPersonal);
```

**Backend Service:** `AccountRequestService.crearSolicitud()`
```java
// Antes: bloqueaba cualquier solicitud existente
if (accountRequestRepository.existsByNumDocumento(...))

// Ahora: solo bloquea si está PENDIENTE o APROBADO
if (accountRequestRepository.existsSolicitudActivaByNumDocumento(...))
```

#### URL del Frontend configurable para emails

**Archivo:** `backend/src/main/resources/application.properties`
```properties
# Producción: http://10.0.89.239 (valor por defecto)
# Desarrollo: configurar variable FRONTEND_URL=http://localhost:3000
app.frontend.url=${FRONTEND_URL:http://10.0.89.239}
```

Los emails de activación ahora usan la IP de producción por defecto. Para desarrollo local:
```bash
export FRONTEND_URL=http://localhost:3000
```

---

### v1.7.3 (2025-12-23) - Búsqueda por Email

#### Búsqueda de usuarios por correo electrónico

**Archivo modificado:** `frontend/src/pages/user/UsersManagement.jsx`

El filtro de búsqueda general ahora incluye campos de email, permitiendo buscar usuarios por:
- Correo personal (`correo_personal`)
- Correo corporativo (`correo_corporativo`)
- Correo institucional (`correo_institucional`)

**Nota importante sobre serialización:**
El backend usa `@JsonProperty` en `UsuarioResponse.java` para serializar campos en **snake_case**:
```java
@JsonProperty("correo_personal")
private String correoPersonal;

@JsonProperty("correo_corporativo")
private String correoCorporativo;

@JsonProperty("correo_institucional")
private String correoInstitucional;
```

Por lo tanto, el frontend debe buscar con nombres en snake_case:

```javascript
// Búsqueda general ahora incluye email (backend envía en snake_case)
const emailPersonal = (user.correo_personal || user.correoPersonal || '').toLowerCase();
const emailCorporativo = (user.correo_corporativo || user.correo_institucional || user.correoCorporativo || user.correoInstitucional || '').toLowerCase();

return nombreCompleto.includes(searchLower) ||
       username.includes(searchLower) ||
       numeroDocumento.includes(searchLower) ||
       nombreIpress.includes(searchLower) ||
       emailPersonal.includes(searchLower) ||
       emailCorporativo.includes(searchLower);
```

---

### v1.7.2 (2025-12-23) - Seguridad y UX

#### Sistema de Versiones Centralizado

**Nuevo archivo de configuración:**
```javascript
// frontend/src/config/version.js
export const VERSION = {
  number: "1.7.0",
  name: "Documentación y Arquitectura",
  date: "2025-12-23"
};
```

**Versión visible en:**
- Footer público (`FooterCenate.jsx`)
- Sidebar dinámico (`DynamicSidebar.jsx`)
- Login, CrearCuenta, PasswordRecovery

#### Validación de Usuario en Login

**Archivo:** `frontend/src/pages/Login.js`

```javascript
// Solo permite números y letras (DNI, pasaporte, carnet extranjería)
onChange={(e) => {
  const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  setFormData({ ...formData, username: value });
}}
maxLength={12}
inputMode="numeric"
```

**Reglas:**
- DNI: Solo números (8 dígitos)
- Pasaporte: Alfanumérico (hasta 12 caracteres)
- Carnet Extranjería: Alfanumérico
- Automáticamente convierte a mayúsculas

#### Corrección de Aprobación de Solicitudes

**Problema:** El correo de bienvenida no se enviaba al aprobar solicitudes.

**Causa:** `usuario.getNombreCompleto()` intentaba acceder a `personalCnt` con lazy loading, fallando silenciosamente en el método `@Async`.

**Solución:**

1. **PasswordTokenService.java** - Nuevo método sobrecargado:
```java
// Acepta nombre completo explícito (evita lazy loading)
public boolean crearTokenYEnviarEmailDirecto(
    Usuario usuario,
    String email,
    String nombreCompleto,  // <-- Nuevo parámetro
    String tipoAccion
)
```

2. **AccountRequestService.java** - Usa datos de la solicitud:
```java
String nombreCompleto = solicitud.getNombreCompleto();
passwordTokenService.crearTokenYEnviarEmailDirecto(
    usuarioNuevo, emailDestino, nombreCompleto, "BIENVENIDO");
```

#### Mensaje de Aprobación Actualizado

**Antes (inseguro):**
```
"Se creará un usuario con las credenciales: Usuario = DNI, Contraseña = @Cenate2025"
```

**Ahora (seguro):**
```
"Se creará el usuario y se enviará un correo con un enlace para que configure su contraseña de forma segura."
```

#### Flujo Seguro de Activación

```
1. Admin aprueba solicitud
2. Sistema crea usuario con contraseña temporal ALEATORIA
3. Sistema genera token de activación (24h)
4. Sistema envía email con enlace: /cambiar-contrasena?token=xxx
5. Usuario configura su propia contraseña
6. Token se invalida después de usar
```

**La contraseña NUNCA se envía en texto plano.**

#### Archivos Modificados

```
frontend/src/config/version.js (NUEVO)
frontend/src/components/Footer/FooterCenate.jsx
frontend/src/components/DynamicSidebar.jsx
frontend/src/pages/Login.js
frontend/src/pages/CrearCuenta.jsx
frontend/src/pages/PasswordRecovery.js
frontend/src/pages/admin/AprobacionSolicitudes.jsx
backend/src/main/java/com/styp/cenate/service/security/PasswordTokenService.java
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
```

---

### v1.7.1 (2025-12-23) - Configuración y Correcciones

#### Configuración de Infraestructura

**Base de Datos Remota:**
- Configurado `application.properties` para conectar a PostgreSQL remoto
- Servidor: `10.0.89.13:5432`
- Base de datos: `maestro_cenate`
- Usuario: `postgres` / Contraseña: `Essalud2025`

**Email SMTP (Gmail):**
- Configurado envío de correos con Gmail SMTP
- Cuenta: `cenateinformatica@gmail.com`
- Contraseña de aplicación configurada
- Funcionalidades habilitadas:
  - Recuperación de contraseña (envía enlace)
  - Aprobación de solicitudes (envía credenciales)
  - Rechazo de solicitudes (envía motivo)

#### Correcciones de Bugs

**Frontend - `apiClient.js`:**
- Corregido manejo de errores para leer tanto `data.message` como `data.error`
- Ahora muestra mensajes de error específicos del backend

**Frontend - `CrearCuenta.jsx`:**
- Corregido para mostrar `err.message` en lugar de `err.response?.data?.message`
- Agregado mensaje de contacto: `cenate.analista@essalud.gob.pe`

**Backend - `AccountRequestService.java`:**
- Agregada validación de correo electrónico duplicado en solicitudes
- Mensaje: "Ya existe una solicitud con este correo electrónico"

**Backend - `AccountRequestRepository.java`:**
- Agregado método `existsByCorreoPersonal(String correoPersonal)`

#### Archivos Modificados

```
backend/src/main/resources/application.properties
backend/src/main/java/com/styp/cenate/service/solicitud/AccountRequestService.java
backend/src/main/java/com/styp/cenate/repository/AccountRequestRepository.java
frontend/src/lib/apiClient.js
frontend/src/pages/CrearCuenta.jsx
```

#### Flujos Verificados

1. **Recuperación de Contraseña:**
   - Usuario solicita recuperación con correo personal
   - Sistema genera token y envía email con enlace
   - Usuario cambia contraseña desde el enlace

2. **Solicitud de Registro:**
   - Usuario externo completa formulario
   - Sistema valida DNI y correo no duplicados
   - Admin aprueba → Sistema envía email con enlace de activación
   - Admin rechaza → Sistema envía email con motivo

---

## Contactos del Sistema

| Rol | Correo |
|-----|--------|
| Soporte técnico | cenate.analista@essalud.gob.pe |
| Sistema (envío) | cenateinformatica@gmail.com |

---

## Licencia

Este proyecto es propiedad de EsSalud Perú - CENATE.
Todos los derechos reservados © 2025

Desarrollado por el Ing. Styp Canto Rondón
