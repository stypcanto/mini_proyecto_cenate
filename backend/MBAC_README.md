# MBAC (Modular-Based Access Control) - Backend CENATE

## 📋 Descripción General

Este módulo implementa el sistema MBAC (Modular-Based Access Control) para el backend de CENATE. Es una evolución del modelo RBAC tradicional que permite:

- ✅ **Permisos granulares por página y acción** (ver, crear, editar, eliminar, exportar, aprobar)
- ✅ **Gestión centralizada desde la base de datos** (sin permisos hardcodeados)
- ✅ **Auditoría automática** de todos los cambios en permisos
- ✅ **Control contextual** por entidades clínicas (IPRESS, asegurados, personal, etc.)
- ✅ **Verificación en tiempo real** mediante interceptores y aspectos

---

## 🏗️ Arquitectura

### Estructura de Base de Datos

```
dim_modulos_sistema
├── dim_paginas_modulo
│   └── dim_permisos_modulares (roles + páginas + permisos CRUD)
└── dim_contexto_modulo (entidades principales por módulo)

dim_usuarios
└── rel_user_roles
    └── dim_roles

audit_logs (auditoría general)
├── vw_permisos_activos (vista optimizada de permisos)
└── vw_auditoria_modular_detallada (vista de auditoría de permisos)
```

### Componentes del Backend

```
📁 model/
├── ModuloSistema.java           # Módulos del sistema
├── PaginaModulo.java            # Páginas de cada módulo
├── PermisoModular.java          # Permisos CRUD por rol y página
├── ContextoModulo.java          # Contextos clínicos
└── view/
    ├── PermisoActivoView.java   # Vista de permisos activos
    └── AuditoriaModularView.java # Vista de auditoría

📁 repository/mbac/
├── ModuloSistemaRepository.java
├── PaginaModuloRepository.java
├── PermisoModularRepository.java
├── PermisoActivoViewRepository.java
└── AuditoriaModularViewRepository.java

📁 service/mbac/
├── PermisosService.java         # Interfaz de servicios de permisos
├── AuditoriaService.java        # Interfaz de servicios de auditoría
└── impl/
    ├── PermisosServiceImpl.java
    └── AuditoriaServiceImpl.java

📁 api/mbac/
├── PermisosController.java      # API REST de permisos
└── AuditoriaController.java     # API REST de auditoría

📁 security/mbac/
├── MBACPermissionEvaluator.java # Evaluador de permisos para Spring Security
├── CheckMBACPermission.java     # Anotación personalizada
└── MBACPermissionAspect.java    # Aspecto AOP para interceptar permisos
```

---

## 🚀 Endpoints Principales

### 🔐 Permisos

#### 1. Obtener permisos de un usuario
```http
GET /api/permisos/usuario/{id}
Authorization: Bearer {token}
Roles: SUPERADMIN, ADMIN

Response:
[
  {
    "rol": "SUPERADMIN",
    "modulo": "Gestión de Citas",
    "pagina": "Dashboard de Citas",
    "rutaPagina": "/roles/medico/dashboard",
    "permisos": {
      "ver": true,
      "crear": true,
      "editar": true,
      "eliminar": true,
      "exportar": false,
      "aprobar": false
    }
  }
]
```

#### 2. Verificar permiso específico
```http
POST /api/permisos/check
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": 1,
  "rutaPagina": "/roles/medico/pacientes",
  "accion": "crear"
}

Response:
{
  "permitido": true,
  "mensaje": "Permiso concedido",
  "pagina": "/roles/medico/pacientes",
  "accion": "crear"
}
```

#### 3. Obtener módulos accesibles
```http
GET /api/permisos/usuario/{userId}/modulos
Authorization: Bearer {token}

Response:
{
  "userId": 1,
  "modulos": [
    "Gestión de Citas",
    "Gestión de Personal",
    "Reportes"
  ],
  "total": 3
}
```

### 📊 Auditoría

#### 1. Obtener auditoría modular
```http
GET /api/auditoria/modulos?page=0&size=20
Authorization: Bearer {token}
Roles: SUPERADMIN, ADMIN

Response:
{
  "content": [
    {
      "id": 150,
      "fechaHora": "2025-10-15T14:30:00",
      "fechaFormateada": "2025-10-15 14:30:00",
      "usuario": "admin_cenate",
      "dni": "12345678",
      "nombreCompleto": "Juan Pérez García",
      "roles": "SUPERADMIN",
      "modulo": "dim_permisos_modulares",
      "accion": "UPDATE",
      "tipoEvento": "🟡 Modificación de permiso",
      "estado": "SUCCESS",
      "detalle": "Columna \"puede_crear\": \"false\" → \"true\";",
      "ip": "192.168.1.100",
      "dispositivo": "Mozilla/5.0..."
    }
  ],
  "totalElements": 50,
  "totalPages": 3,
  "number": 0,
  "size": 20
}
```

#### 2. Filtrar auditoría por usuario
```http
GET /api/auditoria/usuario/{userId}?page=0&size=10
Authorization: Bearer {token}
```

#### 3. Obtener resumen de auditoría
```http
GET /api/auditoria/resumen
Authorization: Bearer {token}

Response:
{
  "resumenPorTipoEvento": {
    "🟢 Creación de permiso": 45,
    "🟡 Modificación de permiso": 120,
    "🔴 Eliminación de permiso": 8
  },
  "totalEventos": 173,
  "timestamp": "2025-10-15T15:00:00"
}
```

---

## 💻 Uso en Controladores

### Opción 1: Anotación @CheckMBACPermission

```java
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    @GetMapping
    @CheckMBACPermission(
        pagina = "/roles/medico/pacientes",
        accion = "ver",
        mensajeDenegado = "No tiene permisos para ver pacientes"
    )
    public ResponseEntity<List<PacienteDTO>> listarPacientes() {
        // Lógica del método
        return ResponseEntity.ok(pacientes);
    }

    @PostMapping
    @CheckMBACPermission(
        pagina = "/roles/medico/pacientes",
        accion = "crear"
    )
    public ResponseEntity<PacienteDTO> crearPaciente(@RequestBody PacienteDTO dto) {
        // Lógica del método
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoPaciente);
    }
}
```

### Opción 2: Verificación Programática

```java
@RestController
@RequiredArgsConstructor
public class CitaController {

    private final PermisosService permisosService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/citas")
    public ResponseEntity<?> obtenerCitas(Authentication authentication) {
        String username = authentication.getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        
        // Verificar permiso programáticamente
        boolean puedeVer = permisosService.tienePermiso(
            usuario.getIdUser(),
            "/roles/medico/citas",
            "ver"
        );
        
        if (!puedeVer) {
            throw new AccessDeniedException("No tiene permisos para ver citas");
        }
        
        // Continuar con la lógica
        List<Cita> citas = citaService.listarCitas();
        return ResponseEntity.ok(citas);
    }
}
```

### Opción 3: @PreAuthorize con PermissionEvaluator

```java
@GetMapping("/reportes/exportar")
@PreAuthorize("hasPermission('/roles/admin/reportes', 'exportar')")
public ResponseEntity<byte[]> exportarReporte() {
    // Lógica del método
    return ResponseEntity.ok(reporteBytes);
}
```

---

## 🔧 Configuración

### 1. Habilitar AOP en Application
Ya está configurado en `MBACSecurityConfig.java` con `@EnableAspectJAutoProxy`

### 2. Registrar PermissionEvaluator
Se registra automáticamente en `MBACSecurityConfig.java`

### 3. Crear Módulos y Páginas en BD

```sql
-- Insertar módulo
INSERT INTO dim_modulos_sistema (nombre_modulo, ruta_base, descripcion, activo)
VALUES ('Gestión de Citas', '/citas', 'Módulo para gestionar citas médicas', true);

-- Insertar página
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, activo)
VALUES (1, 'Dashboard de Citas', '/roles/medico/citas/dashboard', true);

-- Asignar permisos a un rol
INSERT INTO dim_permisos_modulares 
(id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo)
VALUES 
(2, 1, true, true, true, false, true, false, true); -- Rol MEDICO
```

---

## 📝 Tipos de Permisos

| Permiso | Descripción | Uso Común |
|---------|-------------|-----------|
| **ver** | Visualizar información | GET endpoints |
| **crear** | Crear nuevos registros | POST endpoints |
| **editar** | Modificar registros existentes | PUT/PATCH endpoints |
| **eliminar** | Eliminar registros | DELETE endpoints |
| **exportar** | Exportar datos a archivos | Generación de reportes |
| **aprobar** | Aprobar/validar procesos | Flujos de aprobación |

---

## 🧪 Testing

### Ejemplo de prueba unitaria

```java
@Test
void deberiaPermitirAccesoConPermisoValido() {
    // Arrange
    Long userId = 1L;
    String rutaPagina = "/roles/medico/pacientes";
    String accion = "ver";
    
    when(permisoActivoViewRepository.checkPermiso(userId, rutaPagina, accion))
        .thenReturn(1);
    
    // Act
    boolean resultado = permisosService.tienePermiso(userId, rutaPagina, accion);
    
    // Assert
    assertTrue(resultado);
}
```

### Ejemplo de prueba de integración

```java
@Test
@WithMockUser(username = "medico1", roles = {"MEDICO"})
void deberiaRetornarPermisosDelUsuario() throws Exception {
    mockMvc.perform(get("/api/permisos/usuario/1")
            .header("Authorization", "Bearer " + jwtToken))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$[0].rol").value("MEDICO"))
        .andExpect(jsonPath("$[0].permisos.ver").value(true));
}
```

---

## 🔒 Seguridad

### Auditoría Automática
Todos los cambios en `dim_permisos_modulares` se registran automáticamente mediante el trigger `log_permisos_modulares()` en PostgreSQL.

### Contexto de Sesión
El sistema establece variables de sesión para la auditoría:
```java
// Establecer contexto antes de operaciones con permisos
SET app.current_username = 'admin_cenate';
SET app.current_ip = '192.168.1.100';
SET app.current_agent = 'Mozilla/5.0...';
```

---

## 📚 Referencias

- [Diagramas UML](./diagramas/)
- [SQL Scripts](./sql/)
- [Documentación API (Swagger)](http://localhost:8080/swagger-ui.html)

---

## ✅ Checklist de Implementación

- [x] Entidades JPA creadas
- [x] Repositorios implementados
- [x] Servicios de negocio implementados
- [x] Controladores REST creados
- [x] PermissionEvaluator configurado
- [x] Anotación @CheckMBACPermission creada
- [x] Aspecto AOP implementado
- [x] Dependencia de AOP agregada
- [x] Documentación completa

---

**Autor**: CENATE Development Team  
**Versión**: 1.0  
**Fecha**: Octubre 2025
