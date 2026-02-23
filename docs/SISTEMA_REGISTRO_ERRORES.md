# 📝 Sistema de Registro Centralizado de Errores

## � Propósito

La tabla `application_error_log` almacena errores relevantes ocurridos en el backend (Spring Boot), permitiendo:

- **Trazabilidad por request** - Seguimiento de errores a través de todo el flujo
- **Auditoría técnica** - Registro histórico de incidentes
- **Seguimiento de incidentes** - Control de resolución de problemas
- **Análisis posterior** - Datos para investigación y mejora
- **Métricas de estabilidad del sistema** - KPIs de calidad

**Nota:** No reemplaza sistemas externos de monitoreo (como Sentry, Datadog), pero permite control interno y persistencia estructurada de errores críticos.

---

## �📋 Descripción General

Sistema de auditoría de errores que registra todas las excepciones y errores de la aplicación en la tabla `application_error_log`. Permite rastrear, clasificar y resolver errores de forma centralizada.

---

## 🗄️ Estructura de Base de Datos

### 🧱 Definición DDL - Tabla: `application_error_log`

```sql
CREATE TABLE application_error_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Clasificación
    error_category VARCHAR(50) NOT NULL,
    error_code VARCHAR(100),

    -- Información de excepción
    exception_class VARCHAR(255),
    message TEXT NOT NULL,
    root_cause_message TEXT,
    stack_trace TEXT,

    -- Información específica de base de datos
    sql_state VARCHAR(10),
    constraint_name VARCHAR(255),
    table_name VARCHAR(255),

    -- Información HTTP
    http_method VARCHAR(10),
    endpoint VARCHAR(500),
    http_status INT,

    -- Información del usuario
    user_id INT8,
    user_name VARCHAR(255),
    ip_address VARCHAR(50),

    -- Trazabilidad
    request_id VARCHAR(100),

    -- Datos adicionales
    additional_data TEXT,

    -- Control de incidente
    resolved BOOLEAN DEFAULT FALSE,
    resolved_at TIMESTAMP
);
```

---

### 📊 Descripción Detallada de Campos

#### 🔹 Identificación

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | BIGSERIAL | Identificador único del registro |
| `created_at` | TIMESTAMP | Fecha y hora en que ocurrió el error |

---

#### 🔹 Clasificación del Error

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `error_category` | VARCHAR(50) | Categoría general del error |
| `error_code` | VARCHAR(100) | Código interno del error |

**Valores recomendados para `error_category`:**

- `DATABASE` - Errores de base de datos
- `BUSINESS` - Errores de lógica de negocio
- `SECURITY` - Errores de seguridad y autenticación
- `VALIDATION` - Errores de validación de datos
- `EXTERNAL_SERVICE` - Errores de servicios externos
- `UNKNOWN` - Errores no clasificados

---

#### 🔹 Información de la Excepción

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `exception_class` | VARCHAR(255) | Clase Java de la excepción (ej: `org.postgresql.util.PSQLException`) |
| `message` | TEXT | Mensaje principal del error |
| `root_cause_message` | TEXT | Mensaje de la causa raíz de la excepción |
| `stack_trace` | TEXT | Stack trace completo (opcional, limitado a 10,000 caracteres) |

---

#### 🔹 Información de Base de Datos (Opcional)

Se utiliza cuando el error proviene de PostgreSQL.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `sql_state` | VARCHAR(10) | Código SQLState (ej: `23503` = FK violation) |
| `constraint_name` | VARCHAR(255) | Nombre del constraint afectado |
| `table_name` | VARCHAR(255) | Tabla involucrada en el error |

**Ejemplo:**
```
sql_state = "23503"
constraint_name = "fk_solicitud_asegurado"
table_name = "dim_solicitud_bolsa"
```

---

#### 🔹 Información HTTP

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `http_method` | VARCHAR(10) | Método HTTP (GET, POST, PUT, DELETE, etc.) |
| `endpoint` | VARCHAR(500) | Endpoint invocado (ej: `/api/bolsas/solicitudes/importar`) |
| `http_status` | INT | Código HTTP devuelto (ej: 500, 400, 403) |

---

#### 🔹 Información del Usuario

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user_id` | INT8 | Identificador único del usuario (FK a dim_usuarios.id_user); se obtiene consultando por `user_name` |
| `user_name` | VARCHAR(255) | Nombre de usuario (nombre_usuario o DNI) usado en la aplicación |
| `ip_address` | VARCHAR(50) | Dirección IP del cliente (soporta X-Forwarded-For) |

---

#### 🔹 Trazabilidad

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `request_id` | VARCHAR(100) | Identificador único del request HTTP |

**Permite correlacionar:**
- Logs de aplicación
- Errores relacionados
- Eventos del sistema
- Llamadas internas entre servicios

---

#### 🔹 Datos Flexibles (JSON)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `additional_data` | TEXT | Información adicional en formato JSON serializado como texto |

**Ejemplos de uso:**
```json
{
  "archivo": "bolsa_otorrino.xlsx",
  "fila": 48,
  "dni": "16572775",
  "bolsa_id": 123,
  "operacion": "IMPORTAR_BOLSA"
}
```

**Casos comunes:**
- Payload resumido del request
- Parámetros de la operación
- Headers filtrados (sin datos sensibles)
- Identificadores relacionados (IDs de entidades)

---

#### 🔹 Control de Incidente

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `resolved` | BOOLEAN | Indica si el error fue resuelto (default: `FALSE`) |
| `resolved_at` | TIMESTAMP | Fecha y hora de resolución |

**Ciclo de vida de un error:**

1. **Se registra el error** → `resolved = FALSE`
2. **Se investiga y corrige el problema**
3. **Se marca como resuelto:**
   ```sql
   UPDATE application_error_log
   SET resolved = TRUE,
       resolved_at = CURRENT_TIMESTAMP
   WHERE id = :errorId;
   ```

---

### 🚀 Índices Recomendados

```sql
-- Índice por fecha de creación (consultas temporales)
CREATE INDEX idx_error_created_at 
ON application_error_log(created_at DESC);

-- Índice por categoría (filtrado por tipo)
CREATE INDEX idx_error_category 
ON application_error_log(error_category);

-- Índice por código de error (búsqueda específica)
CREATE INDEX idx_error_code 
ON application_error_log(error_code);

-- Índice por request_id (trazabilidad)
CREATE INDEX idx_error_request_id 
ON application_error_log(request_id);

-- Índice por estado de resolución (errores pendientes)
CREATE INDEX idx_error_resolved 
ON application_error_log(resolved);

-- Índice por usuario (auditoría por usuario)
CREATE INDEX idx_error_user_id
ON application_error_log(user_id);

-- Índice por endpoint (análisis de endpoints problemáticos)
CREATE INDEX idx_error_endpoint
ON application_error_log(endpoint);
```

---

### 🧠 Buenas Prácticas

#### ✅ Qué registrar

- ✅ Errores HTTP 500 (errores internos del servidor)
- ✅ Violaciones de integridad referencial (FK violations)
- ✅ Fallos inesperados en lógica de negocio
- ✅ Errores críticos de negocio
- ✅ Errores de servicios externos
- ✅ Excepciones no controladas

#### ❌ Qué NO registrar

- ❌ Errores HTTP 400 normales de validación
- ❌ Contraseñas o tokens de autenticación
- ❌ Datos sensibles (tarjetas de crédito, datos médicos sensibles)
- ❌ Errores de negocio esperados (ej: "Stock insuficiente")

#### 💡 Recomendaciones

1. **Truncar stack traces grandes:**
   - Limitar a 10,000 caracteres para evitar registros excesivos
   - El servicio Java ya implementa esto automáticamente

2. **No eliminar registros históricos:**
   - Sirven para análisis de tendencias
   - Permiten métricas de calidad a largo plazo
   - Implementar archivado si es necesario (no eliminación)

3. **Sanitizar datos sensibles:**
   - Filtrar headers de autenticación
   - Enmascarar datos personales en `additional_data`

4. **Usar transacciones independientes:**
   - `@Transactional(propagation = Propagation.REQUIRES_NEW)`
   - Garantiza persistencia aunque falle la transacción principal

5. **Correlacionar con request_id:**
   - Usar UUID único por request HTTP
   - Facilita debugging en producción

---

## 📁 Archivos Creados

### 1. Entidad JPA

**Ubicación:** `backend/src/main/java/com/styp/cenate/model/ApplicationErrorLog.java`

**Características:**
- Mapea tabla `application_error_log`
- Entidad de solo inserción (no actualización masiva)
- Incluye métodos auxiliares:
  - `markAsResolved()` - Marca error como resuelto
  - `isPending()` - Verifica si está pendiente

**Campos principales:**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | Long | ID autoincremental |
| `createdAt` | OffsetDateTime | Fecha de creación |
| `errorCategory` | String | Categoría del error |
| `errorCode` | String | Código interno |
| `exceptionClass` | String | Clase de la excepción |
| `message` | String | Mensaje del error |
| `stackTrace` | String | Stack trace completo |
| `sqlState` | String | Código SQL (para errores DB) |
| `constraintName` | String | Nombre del constraint violado |
| `tableName` | String | Tabla afectada |
| `httpMethod` | String | Método HTTP |
| `endpoint` | String | Endpoint llamado |
| `userId` | Long | ID del usuario (consultado desde dim_usuarios por name_user) |
| `userName` | String | Nombre de usuario (nombre_usuario o DNI) |
| `ipAddress` | String | IP del cliente |
| `additionalData` | String (TEXT) | Datos adicionales serializados como JSON en texto |
| `resolved` | Boolean | Si el error fue resuelto |

---

### 2. Repositorio

**Ubicación:** `backend/src/main/java/com/styp/cenate/repository/ApplicationErrorLogRepository.java`

**Métodos disponibles:**

```java
// Buscar por categoría
List<ApplicationErrorLog> findByErrorCategoryOrderByCreatedAtDesc(String errorCategory);

// Errores no resueltos
List<ApplicationErrorLog> findByResolvedFalseOrderByCreatedAtDesc();

// Por usuario
List<ApplicationErrorLog> findByUserIdOrderByCreatedAtDesc(String userId);

// Por rango de fechas
List<ApplicationErrorLog> findByCreatedAtBetweenOrderByCreatedAtDesc(
    OffsetDateTime startDate, OffsetDateTime endDate
);

// Por endpoint
List<ApplicationErrorLog> findByEndpointContainingIgnoreCaseOrderByCreatedAtDesc(String endpoint);

// Por código de error
List<ApplicationErrorLog> findByErrorCodeOrderByCreatedAtDesc(String errorCode);

// Por tabla
List<ApplicationErrorLog> findByTableNameOrderByCreatedAtDesc(String tableName);

// Contar errores no resueltos
long countByErrorCategoryAndResolvedFalse(String errorCategory);

// Últimos 50 errores
List<ApplicationErrorLog> findTop50ByOrderByCreatedAtDesc();
```

---

### 3. Servicio

**Ubicación:** `backend/src/main/java/com/styp/cenate/service/ApplicationErrorLogService.java`

**Métodos principales:**

#### 3.1 Registrar error de base de datos

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logDatabaseError(
    SQLException exception,
    HttpServletRequest request,
    String userId,
    Map<String, Object> additionalContext
)
```

**Ejemplo de uso:**
```java
errorLogService.logDatabaseError(
    sqlException,
    request,
    "usuario123",
    Map.of("tabla", "dim_solicitud_bolsa", "operacion", "INSERT")
);
```

---

#### 3.2 Registrar violación de Foreign Key

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logForeignKeyViolation(
    String constraintName,
    String tableName,
    String message,
    Exception exception,
    HttpServletRequest request,
    String userId,
    Map<String, Object> additionalContext
)
```

**Ejemplo de uso:**
```java
errorLogService.logForeignKeyViolation(
    "fk_solicitud_asegurado",
    "dim_solicitud_bolsa",
    "El paciente con DNI 16572775 no existe en asegurados",
    exception,
    request,
    usuarioActual,
    Map.of(
        "dni", "16572775",
        "bolsa_id", 123,
        "fila_excel", 48
    )
);
```

---

#### 3.3 Registrar error genérico

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
public void logError(
    String category,
    String errorCode,
    Exception exception,
    HttpServletRequest request,
    String userId,
    Map<String, Object> additionalContext
)
```

**Ejemplo de uso:**
```java
errorLogService.logError(
    "BUSINESS",
    "INVALID_BOLSA_STATUS",
    new BusinessException("Bolsa no está en estado válido"),
    request,
    "admin",
    Map.of("bolsa_id", 456, "estado_actual", "CERRADA")
);
```

---

#### 3.4 Marcar error como resuelto

```java
@Transactional
public void markAsResolved(Long errorId)
```

**Ejemplo de uso:**
```java
errorLogService.markAsResolved(789L);
```

---

## 🎯 Categorías de Errores

| Categoría | Descripción | Ejemplo |
|-----------|-------------|---------|
| `DATABASE` | Errores de base de datos | FK violations, constraint violations |
| `BUSINESS` | Errores de lógica de negocio | Validaciones de negocio fallidas |
| `SECURITY` | Errores de seguridad | Acceso no autorizado, JWT inválido |
| `VALIDATION` | Errores de validación | Datos inválidos en request |
| `EXTERNAL` | Errores de servicios externos | API externa no disponible |
| `SYSTEM` | Errores internos del sistema | NullPointerException, etc. |

---

## 🔧 Implementación en Controladores

### Ejemplo: Capturar FK Violation en importación de Excel

```java
@Autowired
private ApplicationErrorLogService errorLogService;

@PostMapping("/importar")
public ResponseEntity<?> importarDesdeExcel(
    @RequestParam("file") MultipartFile file,
    HttpServletRequest request) {
    
    try {
        // Lógica de importación...
        
    } catch (DataIntegrityViolationException e) {
        
        // Detectar FK violation
        if (e.getMessage().contains("fk_solicitud_asegurado")) {
            
            errorLogService.logForeignKeyViolation(
                "fk_solicitud_asegurado",
                "dim_solicitud_bolsa",
                "El paciente no existe en la tabla asegurados",
                e,
                request,
                getCurrentUserId(),
                Map.of(
                    "archivo", file.getOriginalFilename(),
                    "operacion", "IMPORTAR_BOLSA"
                )
            );
        }
        
        return ResponseEntity.badRequest()
            .body(Map.of("error", "Error en importación"));
    }
}
```

---

## 📊 Consultas Útiles

### Ver últimos 50 errores no resueltos

```java
List<ApplicationErrorLog> erroresPendientes = 
    errorLogRepository.findByResolvedFalseOrderByCreatedAtDesc();
```

### Ver errores de base de datos del último mes

```java
OffsetDateTime hace30Dias = OffsetDateTime.now().minusDays(30);
OffsetDateTime ahora = OffsetDateTime.now();

List<ApplicationErrorLog> erroresDB = errorLogRepository
    .findByCreatedAtBetweenOrderByCreatedAtDesc(hace30Dias, ahora)
    .stream()
    .filter(e -> e.getErrorCategory().equals("DATABASE"))
    .collect(Collectors.toList());
```

### Contar errores por categoría

```java
long erroresDB = errorLogRepository
    .countByErrorCategoryAndResolvedFalse("DATABASE");

long erroresBusiness = errorLogRepository
    .countByErrorCategoryAndResolvedFalse("BUSINESS");
```

---

## ⚙️ Características Técnicas

### Transacciones Independientes

Todos los métodos de registro usan `@Transactional(propagation = Propagation.REQUIRES_NEW)`:

- ✅ Se persisten **incluso si la transacción principal falla**
- ✅ No afectan el flujo principal de la aplicación
- ✅ Garantizan auditoría completa de errores

### Limitaciones de Tamaño

- **Stack trace:** Limitado a 10,000 caracteres
- **Additional data:** Formato JSON flexible

### Captura Automática de Contexto

- IP del cliente (con soporte para proxies)
- Método HTTP y endpoint
- Root cause de excepciones anidadas
- Stack trace completo

---

## 🚀 Próximos Pasos Recomendados

1. **Crear endpoint REST** para consultar errores desde frontend:
   ```java
   @GetMapping("/api/admin/errors")
   public ResponseEntity<?> getErrors(@RequestParam(required = false) String category)
   ```

2. **Dashboard de errores** en frontend para:
   - Ver errores en tiempo real
   - Filtrar por categoría, usuario, endpoint
   - Marcar como resueltos
   - Exportar reportes

3. **Alertas automáticas:**
   - Email cuando hay FK violations
   - Slack/Teams para errores críticos
   - Threshold de errores por minuto

4. **Integración con sistema actual:**
   - Modificar `SolicitudBolsaServiceImpl.java` para usar el servicio
   - Capturar errores en `importarDesdeExcel()`
   - Registrar todos los fallos de creación de asegurados

---

## 📝 Ejemplo Completo: Integración en Importación Excel

```java
@Service
@RequiredArgsConstructor
public class SolicitudBolsaServiceImpl {
    
    private final ApplicationErrorLogService errorLogService;
    
    @Transactional
    public Map<String, Object> importarDesdeExcel(
        MultipartFile file,
        Long idBolsa,
        Long idServicio,
        String usuarioCarga,
        Long idHistorial) {
        
        try {
            // Procesar filas...
            SolicitudBolsa solicitud = procesarFilaExcel(...);
            solicitudRepository.save(solicitud);
            
        } catch (DataIntegrityViolationException e) {
            
            // Registrar error en log
            errorLogService.logForeignKeyViolation(
                extraerConstraintName(e),
                "dim_solicitud_bolsa",
                e.getMessage(),
                e,
                getCurrentRequest(),
                usuarioCarga,
                Map.of(
                    "fila", filaNumero,
                    "dni", rowDTO.dni(),
                    "bolsa_id", idBolsa,
                    "archivo", file.getOriginalFilename()
                )
            );
            
            // Continuar con siguiente registro...
        }
    }
}
```

---

**Fecha de creación:** 2026-02-21  
**Versión:** 1.0.0  
**Estado:** Implementado
