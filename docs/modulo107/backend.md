# 🚀 MÓDULO 107 - DOCUMENTACIÓN BACKEND

**Versión:** 3.0.0  
**Fecha:** 2026-01-30  
**Framework:** Spring Boot 3.x  
**Lenguaje:** Java 17+

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Backend](#arquitectura-backend)
3. [Controladores (Controllers)](#controladores-controllers)
4. [Servicios (Services)](#servicios-services)
5. [Repositorios (Repositories)](#repositorios-repositories)
6. [Modelos y DTOs](#modelos-y-dtos)
7. [Endpoints API](#endpoints-api)
8. [Seguridad y MBAC](#seguridad-y-mbac)
9. [Flujos de Datos](#flujos-de-datos)

---

## 🎯 RESUMEN EJECUTIVO

El backend del **Módulo 107** proporciona APIs RESTful para la gestión de pacientes diagnosticados bajo el protocolo 107. Implementa arquitectura en capas con Spring Boot, siguiendo principios SOLID y patrones de diseño empresariales.

### Características Principales
- ✅ **API REST** con Spring Boot 3.x
- ✅ **Arquitectura en Capas** (Controller → Service → Repository)
- ✅ **Seguridad MBAC** (Model-Based Access Control)
- ✅ **DTOs** para encapsulación de datos
- ✅ **Paginación y Ordenamiento** con Spring Data
- ✅ **Logging Estructurado** con SLF4J
- ✅ **Transacciones** con @Transactional
- ✅ **Queries Nativas SQL** para estadísticas

---

## 🏗️ ARQUITECTURA BACKEND

### **Stack Tecnológico**
```
Spring Boot 3.2.x
├── Spring Data JPA (Hibernate)
├── Spring Security
├── PostgreSQL 14+
├── Lombok
├── SLF4J (Logging)
└── Jackson (JSON)
```

### **Estructura de Paquetes**
```
src/main/java/com/styp/cenate/
├── api/form107/
│   ├── Bolsa107Controller.java        (910 líneas) ⭐
│   └── ImportExcelController.java     (Importación Excel)
├── service/form107/
│   ├── Modulo107Service.java          (Interface)
│   └── Modulo107ServiceImpl.java      (Implementación)
├── repository/
│   ├── form107/
│   │   ├── Bolsa107ItemRepository.java
│   │   ├── Bolsa107CargaRepository.java
│   │   └── Bolsa107ErrorRepository.java
│   └── bolsas/
│       └── SolicitudBolsaRepository.java ⭐ (v3.0)
├── model/
│   ├── form107/
│   │   ├── Bolsa107Item.java          (Entidad legacy)
│   │   ├── Bolsa107Carga.java
│   │   └── Bolsa107Error.java
│   └── bolsas/
│       └── SolicitudBolsa.java         ⭐ (Entidad principal v3.0)
└── dto/form107/
    └── Modulo107PacienteDTO.java       (DTO de respuesta)
```

---

## 🎮 CONTROLADORES (CONTROLLERS)

### **Bolsa107Controller.java** ⭐

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/api/form107/Bolsa107Controller.java`  
📏 **Tamaño:** 910 líneas  
🔗 **Base Path:** `/api/bolsas/modulo107`

#### **Descripción**
Controlador principal del Módulo 107 que expone endpoints RESTful para la gestión de pacientes. Implementa arquitectura v3.0 que utiliza `dim_solicitud_bolsa` en lugar de `bolsa_107_item`.

#### **Anotaciones**
```java
@RestController
@RequestMapping("/api/bolsas/modulo107")
@RequiredArgsConstructor  // Lombok - inyección por constructor
@Slf4j                    // Lombok - logging
```

#### **Dependencias Inyectadas**
```java
private final Bolsa107ItemRepository itemRepository;      // (Legacy)
private final UsuarioRepository usuarioRepository;
private final Modulo107Service modulo107Service;          // ⭐ Servicio principal v3.0
```

---

### **📋 ENDPOINTS PRINCIPALES**

#### **1️⃣ Listar Pacientes (v3.0)** ⭐

```java
@CheckMBACPermission(pagina = "/bolsas/modulo107/listado", accion = "ver")
@GetMapping("/pacientes")
public ResponseEntity<?> listarPacientes(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "30") int size,
    @RequestParam(defaultValue = "fechaSolicitud") String sortBy,
    @RequestParam(defaultValue = "DESC") String sortDirection
)
```

**Descripción:**  
Lista todos los pacientes del Módulo 107 con paginación y ordenamiento.

**Parámetros:**
- `page` (int): Número de página (0-indexed, default: 0)
- `size` (int): Registros por página (default: 30)
- `sortBy` (String): Campo para ordenar (default: fechaSolicitud)
- `sortDirection` (String): ASC o DESC (default: DESC)

**Lógica:**
```java
// 1. Crear configuración de paginación
Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") 
    ? Sort.Direction.ASC 
    : Sort.Direction.DESC;
    
Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

// 2. Obtener datos desde el servicio
Page<Modulo107PacienteDTO> pacientes = modulo107Service.listarPacientes(pageable);

// 3. Preparar respuesta
Map<String, Object> response = new HashMap<>();
response.put("total", pacientes.getTotalElements());
response.put("page", pacientes.getNumber());
response.put("size", pacientes.getSize());
response.put("totalPages", pacientes.getTotalPages());
response.put("pacientes", pacientes.getContent());

return ResponseEntity.ok(response);
```

**Response (200 OK):**
```json
{
  "total": 1500,
  "page": 0,
  "size": 30,
  "totalPages": 50,
  "pacientes": [
    {
      "idSolicitud": 1,
      "numeroSolicitud": "BOL107-1-1",
      "pacienteDni": "12345678",
      "pacienteNombre": "Juan Pérez García",
      "pacienteSexo": "M",
      "pacienteTelefono": "987654321",
      "fechaNacimiento": "1985-06-15",
      "especialidad": "PSICOLOGIA CENATE",
      "codigoAdscripcion": "IPRESS001",
      "tipoCita": "PRESENCIAL",
      "estadoGestionCitasId": 1,
      "fechaSolicitud": "2026-01-15T10:30:00Z",
      "fechaAsignacion": "2026-01-16T14:20:00Z",
      "responsableGestoraId": 25
    }
  ]
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:8080/api/bolsas/modulo107/pacientes?page=0&size=30" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

#### **2️⃣ Buscar Pacientes con Filtros (v3.0)** ⭐

```java
@CheckMBACPermission(pagina = "/bolsas/modulo107/buscar", accion = "ver")
@GetMapping("/pacientes/buscar")
public ResponseEntity<?> buscarPacientes(
    @RequestParam(required = false) String dni,
    @RequestParam(required = false) String nombre,
    @RequestParam(required = false) String codigoIpress,
    @RequestParam(required = false) Long estadoId,
    @RequestParam(required = false) String fechaDesde,
    @RequestParam(required = false) String fechaHasta,
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "30") int size
)
```

**Descripción:**  
Búsqueda avanzada con múltiples filtros opcionales.

**Parámetros:**
- `dni` (String): Búsqueda parcial (LIKE)
- `nombre` (String): Búsqueda case-insensitive
- `codigoIpress` (String): Búsqueda exacta
- `estadoId` (Long): ID del estado de gestión
- `fechaDesde` (String): Fecha inicio (ISO 8601)
- `fechaHasta` (String): Fecha fin (ISO 8601)
- `page` (int): Número de página
- `size` (int): Registros por página

**Lógica:**
```java
// 1. Parsear fechas
OffsetDateTime fechaDesdeObj = null;
OffsetDateTime fechaHastaObj = null;

if (fechaDesde != null && !fechaDesde.isEmpty()) {
    fechaDesdeObj = OffsetDateTime.parse(fechaDesde);
}

if (fechaHasta != null && !fechaHasta.isEmpty()) {
    fechaHastaObj = OffsetDateTime.parse(fechaHasta);
}

// 2. Crear Pageable
Pageable pageable = PageRequest.of(page, size, 
    Sort.by(Sort.Direction.DESC, "fechaSolicitud"));

// 3. Ejecutar búsqueda
Page<Modulo107PacienteDTO> resultados = modulo107Service.buscarPacientes(
    dni, nombre, codigoIpress, estadoId, fechaDesdeObj, fechaHastaObj, pageable
);

// 4. Preparar respuesta
Map<String, Object> response = new HashMap<>();
response.put("total", resultados.getTotalElements());
response.put("page", resultados.getNumber());
response.put("size", resultados.getSize());
response.put("totalPages", resultados.getTotalPages());
response.put("pacientes", resultados.getContent());

return ResponseEntity.ok(response);
```

**Curl Example:**
```bash
curl -X GET "http://localhost:8080/api/bolsas/modulo107/pacientes/buscar?dni=12345&nombre=Juan&estadoId=1" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

#### **3️⃣ Obtener Estadísticas (v3.0)** ⭐

```java
@CheckMBACPermission(pagina = "/bolsas/modulo107/estadisticas", accion = "ver")
@GetMapping("/estadisticas")
public ResponseEntity<?> obtenerEstadisticas()
```

**Descripción:**  
Retorna dashboard completo con KPIs, distribuciones y evolución temporal.

**Lógica:**
```java
log.info("📊 Obteniendo estadísticas del Módulo 107...");

// Obtener estadísticas desde el servicio
Map<String, Object> estadisticas = modulo107Service.obtenerEstadisticas();

return ResponseEntity.ok(estadisticas);
```

**Response (200 OK):**
```json
{
  "kpis": {
    "total_pacientes": 1500,
    "atendidos": 800,
    "pendientes": 500,
    "cancelados": 200,
    "horas_promedio_atencion": 48.5
  },
  "distribucion_estado": [
    {
      "estado": "ATENDIDO",
      "cantidad": 800,
      "porcentaje": 53.33
    },
    {
      "estado": "PENDIENTE",
      "cantidad": 500,
      "porcentaje": 33.33
    },
    {
      "estado": "CANCELADO",
      "cantidad": 200,
      "porcentaje": 13.33
    }
  ],
  "distribucion_especialidad": [
    {
      "especialidad": "PSICOLOGIA CENATE",
      "cantidad": 600,
      "porcentaje": 40.0
    },
    {
      "especialidad": "MEDICINA CENATE",
      "cantidad": 500,
      "porcentaje": 33.33
    },
    {
      "especialidad": "NUTRICION",
      "cantidad": 400,
      "porcentaje": 26.67
    }
  ],
  "top_10_ipress": [
    {
      "codigo_ipress": "IPRESS001",
      "nombre": "Hospital Nacional Rebagliati",
      "cantidad": 350
    },
    {
      "codigo_ipress": "IPRESS002",
      "nombre": "Hospital Almenara",
      "cantidad": 280
    }
  ],
  "evolucion_temporal": [
    {
      "fecha": "2026-01-01",
      "cantidad": 50
    },
    {
      "fecha": "2026-01-02",
      "cantidad": 65
    }
  ]
}
```

**Curl Example:**
```bash
curl -X GET "http://localhost:8080/api/bolsas/modulo107/estadisticas" \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json"
```

---

### **📝 ENDPOINTS LEGACY (Deprecados)**

#### **Listar por Derivación (DEPRECATED)**

```java
@Deprecated(since = "v3.0.0", forRemoval = true)
@GetMapping("/pacientes/por-derivacion")
public ResponseEntity<?> listarPorDerivacion(
    @RequestParam(value = "derivacion", required = false) String derivacion
)
```

⚠️ **Usar en su lugar:** `GET /api/bolsas/modulo107/pacientes`

---

#### **Asignar Admisionista (DEPRECATED)**

```java
@Deprecated(since = "v3.0.0", forRemoval = true)
@PostMapping("/asignar-admisionista")
public ResponseEntity<?> asignarAdmisionista(@RequestBody Map<String, Object> request)
```

⚠️ **Usar en su lugar:** Endpoints v3.0 con `dim_solicitud_bolsa`

---

#### **Eliminar Pacientes Múltiples (DEPRECATED)**

```java
@DeleteMapping("/pacientes")
@Transactional
public ResponseEntity<?> eliminarPacientes(@RequestBody Map<String, Object> request)
```

**Descripción:**  
Elimina múltiples pacientes de la tabla `bolsa_107_item` (legacy).

**Request Body:**
```json
{
  "ids": [1, 2, 3, 4, 5]
}
```

**Lógica:**
```java
// 1. Extraer y validar IDs
List<?> idsList = (List<?>) request.get("ids");
if (idsList == null || idsList.isEmpty()) {
    return ResponseEntity.badRequest()
        .body(Map.of("error", "Debes seleccionar al menos un paciente"));
}

// 2. Convertir a Long
List<Long> ids = idsList.stream()
    .map(id -> Long.parseLong(id.toString()))
    .collect(Collectors.toList());

// 3. Validar existencia
List<Bolsa107Item> itemsAEliminar = itemRepository.findAllById(ids);
if (itemsAEliminar.size() != ids.size()) {
    return ResponseEntity.badRequest()
        .body(Map.of("error", "Algunos pacientes no fueron encontrados"));
}

// 4. Eliminar en batch
itemRepository.deleteAllInBatch(itemsAEliminar);

// 5. Respuesta
return ResponseEntity.ok(Map.of(
    "success", true,
    "message", "Se eliminaron " + ids.size() + " paciente(s)",
    "deletedCount", ids.size()
));
```

---

## 🔧 SERVICIOS (SERVICES)

### **Modulo107Service.java** (Interface)

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/service/form107/Modulo107Service.java`

#### **Definición**
```java
public interface Modulo107Service {
    
    /**
     * Listar todos los pacientes del Módulo 107 con paginación
     */
    Page<Modulo107PacienteDTO> listarPacientes(Pageable pageable);
    
    /**
     * Buscar pacientes con filtros avanzados
     */
    Page<Modulo107PacienteDTO> buscarPacientes(
        String dni,
        String nombre,
        String codigoIpress,
        Long estadoId,
        OffsetDateTime fechaDesde,
        OffsetDateTime fechaHasta,
        Pageable pageable
    );
    
    /**
     * Obtener estadísticas completas del Módulo 107
     */
    Map<String, Object> obtenerEstadisticas();
}
```

---

### **Modulo107ServiceImpl.java** (Implementación)

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/service/form107/Modulo107ServiceImpl.java`

#### **Anotaciones**
```java
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)  // Por defecto solo lectura
```

#### **Dependencias**
```java
private final SolicitudBolsaRepository solicitudBolsaRepository;
```

---

#### **📋 Método: listarPacientes()**

```java
@Override
public Page<Modulo107PacienteDTO> listarPacientes(Pageable pageable) {
    log.info("📋 [Modulo107Service] Listando pacientes - page={}, size={}",
             pageable.getPageNumber(), pageable.getPageSize());

    try {
        // 1. Obtener entidades desde el repositorio
        Page<SolicitudBolsa> pacientes = 
            solicitudBolsaRepository.findAllModulo107Casos(pageable);

        log.info("✅ Se recuperaron {} pacientes (página {}/{})",
                 pacientes.getNumberOfElements(),
                 pacientes.getNumber(),
                 pacientes.getTotalPages());

        // 2. Transformar entidades a DTOs
        return pacientes.map(Modulo107PacienteDTO::fromEntity);

    } catch (Exception e) {
        log.error("❌ Error al listar pacientes del Módulo 107", e);
        throw new RuntimeException("Error al obtener lista de pacientes: " + e.getMessage(), e);
    }
}
```

**Características:**
- ✅ Logging estructurado
- ✅ Manejo de excepciones
- ✅ Transformación automática a DTOs
- ✅ Paginación nativa de Spring Data

---

#### **🔍 Método: buscarPacientes()**

```java
@Override
public Page<Modulo107PacienteDTO> buscarPacientes(
        String dni,
        String nombre,
        String codigoIpress,
        Long estadoId,
        OffsetDateTime fechaDesde,
        OffsetDateTime fechaHasta,
        Pageable pageable) {

    log.info("🔍 [Modulo107Service] Buscando - dni={}, nombre={}, ipress={}, estado={}",
             dni, nombre, codigoIpress, estadoId);

    try {
        // 1. Auditoría de búsquedas críticas
        if (dni != null && !dni.isEmpty()) {
            registrarAuditoriaBusqueda("DNI", dni);
        }
        if (nombre != null && !nombre.isEmpty()) {
            registrarAuditoriaBusqueda("NOMBRE", nombre);
        }

        // 2. Ejecutar búsqueda
        Page<SolicitudBolsa> resultados = 
            solicitudBolsaRepository.buscarModulo107Casos(
                dni, nombre, codigoIpress, estadoId, 
                fechaDesde, fechaHasta, pageable
            );

        log.info("✅ Búsqueda completada: {} resultados encontrados",
                 resultados.getTotalElements());

        // 3. Transformar a DTOs
        return resultados.map(Modulo107PacienteDTO::fromEntity);

    } catch (Exception e) {
        log.error("❌ Error al buscar pacientes del Módulo 107", e);
        throw new RuntimeException("Error en la búsqueda: " + e.getMessage(), e);
    }
}
```

**Características:**
- ✅ Auditoría de búsquedas críticas (DNI, Nombre)
- ✅ Filtros opcionales (null-safe)
- ✅ Logging detallado
- ✅ Query dinámico en repositorio

---

#### **📊 Método: obtenerEstadisticas()**

```java
@Override
public Map<String, Object> obtenerEstadisticas() {
    log.info("📊 [Modulo107Service] Obteniendo estadísticas del Módulo 107");

    try {
        Map<String, Object> estadisticas = new HashMap<>();

        // 1. KPIs Generales
        Map<String, Object> kpis = solicitudBolsaRepository.kpisModulo107();
        estadisticas.put("kpis", kpis);
        log.debug("✅ KPIs obtenidos: {}", kpis);

        // 2. Distribución por Estado
        List<Map<String, Object>> porEstado = 
            solicitudBolsaRepository.estadisticasModulo107PorEstado();
        estadisticas.put("distribucion_estado", porEstado);
        log.debug("✅ Distribución por estado: {} estados", porEstado.size());

        // 3. Distribución por Especialidad
        List<Map<String, Object>> porEspecialidad = 
            solicitudBolsaRepository.estadisticasModulo107PorEspecialidad();
        estadisticas.put("distribucion_especialidad", porEspecialidad);
        log.debug("✅ Distribución por especialidad: {} especialidades", porEspecialidad.size());

        // 4. Top 10 IPRESS
        List<Map<String, Object>> porIpress = 
            solicitudBolsaRepository.estadisticasModulo107PorIpress();
        estadisticas.put("top_10_ipress", porIpress);
        log.debug("✅ Top 10 IPRESS: {} IPRESS", porIpress.size());

        // 5. Evolución Temporal (últimos 30 días)
        List<Map<String, Object>> evolucion = 
            solicitudBolsaRepository.evolucionTemporalModulo107();
        estadisticas.put("evolucion_temporal", evolucion);
        log.debug("✅ Evolución temporal: {} días", evolucion.size());

        log.info("✅ Estadísticas obtenidas exitosamente");
        return estadisticas;

    } catch (Exception e) {
        log.error("❌ Error al calcular estadísticas del Módulo 107", e);
        throw new RuntimeException("Error al calcular estadísticas: " + e.getMessage(), e);
    }
}
```

**Características:**
- ✅ 5 conjuntos de estadísticas
- ✅ Queries SQL nativas optimizadas
- ✅ Logging granular (DEBUG level)
- ✅ Manejo robusto de errores

---

#### **🔒 Método: registrarAuditoriaBusqueda() (Privado)**

```java
private void registrarAuditoriaBusqueda(String tipoBusqueda, String valor) {
    try {
        String usuario = obtenerUsernameActual();
        log.info("🔍 [AUDITORIA] Búsqueda crítica - Usuario: {}, Tipo: {}, Valor: {}",
                 usuario, tipoBusqueda, valor);
    } catch (Exception e) {
        log.warn("⚠️ No se pudo registrar auditoría de búsqueda", e);
    }
}
```

**Nota:** La auditoría completa se implementará en v3.1 usando AOP.

---

#### **👤 Método: obtenerUsernameActual() (Privado)**

```java
private String obtenerUsernameActual() {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated()) {
        Object principal = auth.getPrincipal();
        if (principal instanceof org.springframework.security.core.userdetails.User) {
            return ((org.springframework.security.core.userdetails.User) principal).getUsername();
        }
        return auth.getName();
    }
    return "ANONIMO";
}
```

---

## 📦 MODELOS Y DTOs

### **SolicitudBolsa.java** (Entidad Principal v3.0)

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java`  
📋 **Tabla:** `dim_solicitud_bolsa`

#### **Campos Relevantes para Módulo 107**
```java
@Entity
@Table(name = "dim_solicitud_bolsa")
public class SolicitudBolsa {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_solicitud")
    private Long idSolicitud;
    
    @Column(name = "numero_solicitud", unique = true)
    private String numeroSolicitud;  // BOL107-{id_carga}-{id_raw}
    
    @Column(name = "paciente_dni")
    private String pacienteDni;
    
    @Column(name = "paciente_nombre")
    private String pacienteNombre;
    
    @Column(name = "paciente_sexo")
    private String pacienteSexo;
    
    @Column(name = "paciente_telefono")
    private String pacienteTelefono;
    
    @Column(name = "fecha_nacimiento")
    private LocalDate fechaNacimiento;
    
    @Column(name = "especialidad")
    private String especialidad;  // PSICOLOGIA CENATE, MEDICINA CENATE, etc.
    
    @Column(name = "codigo_adscripcion")
    private String codigoAdscripcion;  // Código IPRESS
    
    @Column(name = "id_bolsa")
    private Integer idBolsa;  // 107 para Módulo 107
    
    @Column(name = "estado_gestion_citas_id")
    private Long estadoGestionCitasId;
    
    @Column(name = "fecha_solicitud")
    private OffsetDateTime fechaSolicitud;
    
    @Column(name = "fecha_asignacion")
    private OffsetDateTime fechaAsignacion;
    
    @Column(name = "responsable_gestora_id")
    private Long responsableGestoraId;
    
    @Column(name = "activo")
    private Boolean activo = true;
}
```

---

### **Modulo107PacienteDTO.java** (DTO de Respuesta)

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/dto/form107/Modulo107PacienteDTO.java`

#### **Estructura**
```java
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Modulo107PacienteDTO {

    // 🔑 Identificación
    private Long idSolicitud;
    private String numeroSolicitud;

    // 👤 Datos del Paciente
    private String pacienteDni;
    private String pacienteNombre;
    private String pacienteSexo;
    private String pacienteTelefono;
    private LocalDate fechaNacimiento;

    // 📋 Datos Operativos
    private String especialidad;
    private String codigoAdscripcion;
    private String tipoCita;

    // 📊 Gestión de Citas
    private Long estadoGestionCitasId;
    private OffsetDateTime fechaSolicitud;
    private OffsetDateTime fechaAsignacion;

    // 👤 Asignación
    private Long responsableGestoraId;

    /**
     * Convertir entidad JPA a DTO
     */
    public static Modulo107PacienteDTO fromEntity(SolicitudBolsa entity) {
        if (entity == null) return null;

        return Modulo107PacienteDTO.builder()
                .idSolicitud(entity.getIdSolicitud())
                .numeroSolicitud(entity.getNumeroSolicitud())
                .pacienteDni(entity.getPacienteDni())
                .pacienteNombre(entity.getPacienteNombre())
                .pacienteSexo(entity.getPacienteSexo())
                .pacienteTelefono(entity.getPacienteTelefono())
                .fechaNacimiento(entity.getFechaNacimiento())
                .especialidad(entity.getEspecialidad())
                .codigoAdscripcion(entity.getCodigoAdscripcion())
                .tipoCita(entity.getTipoCita())
                .estadoGestionCitasId(entity.getEstadoGestionCitasId())
                .fechaSolicitud(entity.getFechaSolicitud())
                .fechaAsignacion(entity.getFechaAsignacion())
                .responsableGestoraId(entity.getResponsableGestoraId())
                .build();
    }
}
```

**Ventajas del DTO:**
- ✅ Encapsula solo datos necesarios
- ✅ Evita exponer estructura interna de entidades JPA
- ✅ Previene lazy loading issues
- ✅ Facilita serialización JSON
- ✅ Permite transformaciones sin afectar entidades

---

### **Bolsa107Item.java** (Entidad Legacy)

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/model/form107/Bolsa107Item.java`  
📋 **Tabla:** `bolsa_107_item`  
⚠️ **Estado:** LEGACY - Migrado a `dim_solicitud_bolsa`

**Nota:** Esta entidad se mantiene por compatibilidad pero los nuevos endpoints v3.0 usan `SolicitudBolsa`.

---

## 🗄️ REPOSITORIOS (REPOSITORIES)

### **SolicitudBolsaRepository.java** ⭐

📍 **Ubicación:** `backend/src/main/java/com/styp/cenate/repository/bolsas/SolicitudBolsaRepository.java`

#### **Métodos Principales**

##### **findAllModulo107Casos()**
```java
@Query("""
    SELECT s FROM SolicitudBolsa s
    WHERE s.idBolsa = 107 AND s.activo = true
    ORDER BY s.fechaSolicitud DESC
""")
Page<SolicitudBolsa> findAllModulo107Casos(Pageable pageable);
```

**Uso:** Listar todos los pacientes del Módulo 107 paginados.

---

##### **buscarModulo107Casos()**
```java
@Query("""
    SELECT s FROM SolicitudBolsa s
    WHERE s.idBolsa = 107 AND s.activo = true
        AND (:dni IS NULL OR s.pacienteDni LIKE %:dni%)
        AND (:nombre IS NULL OR LOWER(s.pacienteNombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND (:codigoIpress IS NULL OR s.codigoAdscripcion = :codigoIpress)
        AND (:estadoId IS NULL OR s.estadoGestionCitasId = :estadoId)
        AND (:fechaDesde IS NULL OR s.fechaSolicitud >= :fechaDesde)
        AND (:fechaHasta IS NULL OR s.fechaSolicitud <= :fechaHasta)
    ORDER BY s.fechaSolicitud DESC
""")
Page<SolicitudBolsa> buscarModulo107Casos(
    @Param("dni") String dni,
    @Param("nombre") String nombre,
    @Param("codigoIpress") String codigoIpress,
    @Param("estadoId") Long estadoId,
    @Param("fechaDesde") OffsetDateTime fechaDesde,
    @Param("fechaHasta") OffsetDateTime fechaHasta,
    Pageable pageable
);
```

**Uso:** Búsqueda avanzada con filtros opcionales.

---

##### **kpisModulo107()**
```java
@Query(value = """
    SELECT 
        COUNT(*) as total_pacientes,
        COUNT(*) FILTER (WHERE estado_gestion_citas_id = 3) as atendidos,
        COUNT(*) FILTER (WHERE estado_gestion_citas_id = 1) as pendientes,
        COUNT(*) FILTER (WHERE estado_gestion_citas_id = 4) as cancelados,
        AVG(EXTRACT(EPOCH FROM (fecha_asignacion - fecha_solicitud)) / 3600.0) as horas_promedio_atencion
    FROM dim_solicitud_bolsa
    WHERE id_bolsa = 107 AND activo = true
""", nativeQuery = true)
Map<String, Object> kpisModulo107();
```

**Uso:** Calcular KPIs generales del dashboard.

---

##### **estadisticasModulo107PorEstado()**
```java
@Query(value = """
    SELECT 
        egc.nombre_estado as estado,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
    FROM dim_solicitud_bolsa dsb
    INNER JOIN estado_gestion_citas egc ON dsb.estado_gestion_citas_id = egc.id_estado
    WHERE dsb.id_bolsa = 107 AND dsb.activo = true
    GROUP BY egc.nombre_estado
    ORDER BY cantidad DESC
""", nativeQuery = true)
List<Map<String, Object>> estadisticasModulo107PorEstado();
```

**Uso:** Distribución de pacientes por estado de gestión.

---

##### **estadisticasModulo107PorEspecialidad()**
```java
@Query(value = """
    SELECT 
        especialidad,
        COUNT(*) as cantidad,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
    FROM dim_solicitud_bolsa
    WHERE id_bolsa = 107 AND activo = true AND especialidad IS NOT NULL
    GROUP BY especialidad
    ORDER BY cantidad DESC
""", nativeQuery = true)
List<Map<String, Object>> estadisticasModulo107PorEspecialidad();
```

**Uso:** Distribución por especialidad (Psicología, Medicina, etc.).

---

##### **estadisticasModulo107PorIpress()**
```java
@Query(value = """
    SELECT 
        dsb.codigo_adscripcion as codigo_ipress,
        d.nombre as nombre,
        COUNT(*) as cantidad
    FROM dim_solicitud_bolsa dsb
    LEFT JOIN dim_ipress d ON dsb.codigo_adscripcion = d.codigo
    WHERE dsb.id_bolsa = 107 AND dsb.activo = true
    GROUP BY dsb.codigo_adscripcion, d.nombre
    ORDER BY cantidad DESC
    LIMIT 10
""", nativeQuery = true)
List<Map<String, Object>> estadisticasModulo107PorIpress();
```

**Uso:** Top 10 IPRESS con más pacientes del Módulo 107.

---

##### **evolucionTemporalModulo107()**
```java
@Query(value = """
    SELECT 
        DATE(fecha_solicitud) as fecha,
        COUNT(*) as cantidad
    FROM dim_solicitud_bolsa
    WHERE id_bolsa = 107 
        AND activo = true
        AND fecha_solicitud >= NOW() - INTERVAL '30 days'
    GROUP BY DATE(fecha_solicitud)
    ORDER BY fecha ASC
""", nativeQuery = true)
List<Map<String, Object>> evolucionTemporalModulo107();
```

**Uso:** Evolución temporal de pacientes en los últimos 30 días.

---

## 🔐 SEGURIDAD Y MBAC

### **MBAC (Model-Based Access Control)**

#### **Anotación @CheckMBACPermission**
```java
@CheckMBACPermission(pagina = "/bolsas/modulo107/listado", accion = "ver")
```

**Funcionamiento:**
1. Intercepta la petición HTTP
2. Extrae el usuario autenticado del contexto de seguridad
3. Verifica en la tabla `mbac_permisos` si el usuario tiene el permiso
4. Permite o deniega el acceso según el resultado

#### **Permisos Configurados**

| Endpoint | Página MBAC | Acción |
|----------|-------------|--------|
| GET /pacientes | `/bolsas/modulo107/listado` | `ver` |
| GET /pacientes/buscar | `/bolsas/modulo107/buscar` | `ver` |
| GET /estadisticas | `/bolsas/modulo107/estadisticas` | `ver` |
| POST /asignar-admisionista | `/bolsas/modulo107/listado` | `asignar` |

#### **Roles con Acceso**
```sql
-- Coordinador de Citas → Acceso completo
INSERT INTO mbac_permisos (rol_id, pagina, accion)
VALUES (5, '/bolsas/modulo107/listado', 'ver');

-- Admisionista → Solo lectura
INSERT INTO mbac_permisos (rol_id, pagina, accion)
VALUES (6, '/bolsas/modulo107/listado', 'ver');

-- Gestor de Citas → Lectura y búsqueda
INSERT INTO mbac_permisos (rol_id, pagina, accion)
VALUES (7, '/bolsas/modulo107/buscar', 'ver');
```

---

## 🔄 FLUJOS DE DATOS

### **Flujo 1: Listar Pacientes**

```
┌─────────────┐
│   FRONTEND  │
│  (React.js) │
└──────┬──────┘
       │ GET /api/bolsas/modulo107/pacientes?page=0&size=30
       ↓
┌──────────────────────────────────┐
│   Bolsa107Controller             │
│   @GetMapping("/pacientes")      │
└──────┬───────────────────────────┘
       │ listarPacientes(pageable)
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   - Logging                      │
│   - Validaciones                 │
└──────┬───────────────────────────┘
       │ findAllModulo107Casos(pageable)
       ↓
┌──────────────────────────────────┐
│   SolicitudBolsaRepository       │
│   - Query JPA/JPQL               │
└──────┬───────────────────────────┘
       │ SQL Query
       ↓
┌──────────────────────────────────┐
│   PostgreSQL                     │
│   dim_solicitud_bolsa            │
│   WHERE id_bolsa = 107           │
└──────┬───────────────────────────┘
       │ Page<SolicitudBolsa>
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   - Map to DTOs                  │
└──────┬───────────────────────────┘
       │ Page<Modulo107PacienteDTO>
       ↓
┌──────────────────────────────────┐
│   Bolsa107Controller             │
│   - Build Response Map           │
│   - HTTP 200 OK                  │
└──────┬───────────────────────────┘
       │ JSON Response
       ↓
┌─────────────┐
│   FRONTEND  │
│  (Render)   │
└─────────────┘
```

---

### **Flujo 2: Buscar con Filtros**

```
┌─────────────┐
│   FRONTEND  │
└──────┬──────┘
       │ GET /api/bolsas/modulo107/pacientes/buscar
       │ ?dni=12345&nombre=Juan&estadoId=1
       ↓
┌──────────────────────────────────┐
│   Bolsa107Controller             │
│   - Parse parameters             │
│   - Parse date strings           │
└──────┬───────────────────────────┘
       │ buscarPacientes(...)
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   - Auditoría (DNI, Nombre)      │
│   - Logging                      │
└──────┬───────────────────────────┘
       │ buscarModulo107Casos(...)
       ↓
┌──────────────────────────────────┐
│   SolicitudBolsaRepository       │
│   - Dynamic Query                │
│   - NULL-safe filters            │
└──────┬───────────────────────────┘
       │ SQL with WHERE clauses
       ↓
┌──────────────────────────────────┐
│   PostgreSQL                     │
│   WHERE id_bolsa = 107           │
│   AND (dni LIKE %:dni%)          │
│   AND (nombre ILIKE %:nombre%)   │
│   AND (codigo_ipress = :ipress)  │
└──────┬───────────────────────────┘
       │ Page<SolicitudBolsa>
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   - Map to DTOs                  │
└──────┬───────────────────────────┘
       │ Page<Modulo107PacienteDTO>
       ↓
┌─────────────┐
│   FRONTEND  │
└─────────────┘
```

---

### **Flujo 3: Obtener Estadísticas**

```
┌─────────────┐
│   FRONTEND  │
└──────┬──────┘
       │ GET /api/bolsas/modulo107/estadisticas
       ↓
┌──────────────────────────────────┐
│   Bolsa107Controller             │
└──────┬───────────────────────────┘
       │ obtenerEstadisticas()
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   ┌────────────────────────┐     │
│   │ 1. kpisModulo107()     │     │
│   ├────────────────────────┤     │
│   │ 2. porEstado()         │     │
│   ├────────────────────────┤     │
│   │ 3. porEspecialidad()   │     │
│   ├────────────────────────┤     │
│   │ 4. porIpress()         │     │
│   ├────────────────────────┤     │
│   │ 5. evolucionTemporal() │     │
│   └────────────────────────┘     │
└──────┬───────────────────────────┘
       │ 5 queries paralelas
       ↓
┌──────────────────────────────────┐
│   PostgreSQL                     │
│   - Aggregations (COUNT, AVG)    │
│   - GROUP BY                     │
│   - Window Functions             │
│   - JOINs (dim_ipress, estado)   │
└──────┬───────────────────────────┘
       │ Maps<String, Object>
       ↓
┌──────────────────────────────────┐
│   Modulo107ServiceImpl           │
│   - Merge results                │
│   - Build estadisticas Map       │
└──────┬───────────────────────────┘
       │ Map<String, Object>
       ↓
┌──────────────────────────────────┐
│   Bolsa107Controller             │
│   - HTTP 200 OK                  │
└──────┬───────────────────────────┘
       │ JSON Response
       ↓
┌─────────────┐
│   FRONTEND  │
│  (Dashboard)│
└─────────────┘
```

---

## 📚 REFERENCIAS

- [Spring Boot Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Lombok](https://projectlombok.org/)
- [PostgreSQL](https://www.postgresql.org/)

---

**Última actualización:** 2026-01-30  
**Versión del documento:** 1.0.0  
**Mantenedor:** Equipo Backend CENATE
