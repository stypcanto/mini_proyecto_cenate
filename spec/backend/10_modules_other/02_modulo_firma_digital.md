# Módulo de Firma Digital - Documentación Técnica

> Sistema completo de gestión de firmas digitales para personal interno CAS/728

**Versión:** v1.14.0
**Fecha:** 2025-12-30
**Autor:** Ing. Styp Canto Rondon

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Modelo de Datos](#modelo-de-datos)
4. [Capa de Transferencia (DTOs)](#capa-de-transferencia-dtos)
5. [Capa de Persistencia](#capa-de-persistencia)
6. [Capa de Negocio](#capa-de-negocio)
7. [Capa de Presentación (API REST)](#capa-de-presentación-api-rest)
8. [Reglas de Negocio](#reglas-de-negocio)
9. [Validaciones](#validaciones)
10. [Casos de Uso](#casos-de-uso)
11. [Seguridad y Auditoría](#seguridad-y-auditoría)
12. [Integración con Frontend](#integración-con-frontend)

---

## Resumen Ejecutivo

### ¿Qué es el Módulo de Firma Digital?

Sistema completo para gestionar la entrega y seguimiento de **tokens de firma digital** y **certificados digitales** del personal interno de CENATE con régimen laboral **CAS** y **728**.

### Alcance

**✅ Incluye:**
- Personal INTERNO con régimen CAS o 728
- Registro de entrega de tokens físicos
- Seguimiento de certificados digitales (vigencia)
- Gestión de entregas pendientes
- Alertas de certificados próximos a vencer

**❌ Excluye:**
- Personal EXTERNO (no tienen firma digital institucional)
- Personal LOCADOR (gestionan su propia firma)

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Patrón UPSERT** | Crea si no existe, actualiza si existe |
| **Validación en 3 Capas** | DTO → Service → Database |
| **Soft Delete** | No elimina registros, marca como inactivo |
| **Auditoría Completa** | Integración con `AuditLogService` |
| **Transacciones ACID** | @Transactional en todos los métodos |
| **Reportes Avanzados** | Certificados vencidos, próximos a vencer, pendientes |

---

## Arquitectura del Módulo

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  Components:                                                 │
│    • FirmaDigitalTab.jsx                                     │
│    • ActualizarEntregaTokenModal.jsx                         │
│    • ControlFirmaDigital.jsx                                 │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                API REST (Controller)                         │
│  FirmaDigitalController.java                                 │
│    • 11 endpoints REST                                       │
│    • Validación @PreAuthorize                                │
│    • Manejo de excepciones                                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   Service Layer                              │
│  FirmaDigitalService (Interface)                             │
│  PersonalFirmaDigitalServiceImpl                             │
│    • Lógica de negocio                                       │
│    • Validaciones de dominio                                 │
│    • Mapeo DTO ↔ Entity                                      │
│    • Integración con AuditLogService                         │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Repository Layer                             │
│  FirmaDigitalPersonalRepository                              │
│    • Extends JpaRepository                                   │
│    • 8 métodos (queries + helpers)                           │
│    • Queries nativas @Query                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  Tabla: firma_digital_personal                               │
│    • 12 columnas                                             │
│    • 5 índices                                               │
│    • 7 CHECK constraints                                     │
│    • 1 trigger (auto-update timestamps)                      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos Principal

```
Usuario crea/edita usuario con firma digital
       ↓
FirmaDigitalTab.jsx → Captura datos de firma
       ↓
POST /api/firma-digital
       ↓
FirmaDigitalController.guardarFirmaDigital()
       ↓
PersonalFirmaDigitalServiceImpl.guardarFirmaDigital()
       ↓
┌─────────────────────────────────────────┐
│ 1. Busca firma existente por idPersonal │
│ 2. Si existe → UPDATE, si no → CREATE   │
│ 3. Mapea FirmaDigitalRequest → Entity   │
│ 4. Guarda en BD (UPSERT)                │
│ 5. Audita (CREATE/UPDATE_FIRMA_DIGITAL) │
│ 6. Mapea Entity → FirmaDigitalResponse   │
└─────────────────────────────────────────┘
       ↓
Response: FirmaDigitalResponse
       ↓
Frontend: Actualiza UI
```

---

## Modelo de Datos

### Entidad: `FirmaDigitalPersonal.java`

**Tabla:** `firma_digital_personal`

```java
@Entity
@Table(name = "firma_digital_personal")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FirmaDigitalPersonal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_firma_personal")
    private Long idFirmaPersonal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personal", nullable = false)
    private PersonalCnt personal;

    @Column(name = "entrego_token")
    private Boolean entregoToken = false;

    @Column(name = "numero_serie_token", length = 100)
    private String numeroSerieToken;

    @Column(name = "fecha_entrega_token")
    private LocalDate fechaEntregaToken;

    @Column(name = "fecha_inicio_certificado")
    private LocalDate fechaInicioCertificado;

    @Column(name = "fecha_vencimiento_certificado")
    private LocalDate fechaVencimientoCertificado;

    @Column(name = "motivo_sin_token", length = 50)
    private String motivoSinToken;

    @Column(name = "observaciones", columnDefinition = "TEXT")
    private String observaciones;

    @Column(name = "stat_firma", length = 1)
    private String statFirma = "A";  // A = Activo, I = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
```

### Métodos Helper de la Entidad

| Método | Retorno | Descripción |
|--------|---------|-------------|
| `isActivo()` | `boolean` | Verifica si `statFirma = "A"` |
| `tieneTokenEntregado()` | `boolean` | Verifica si `entregoToken = true` |
| `tieneCertificadoVigente()` | `boolean` | Certificado NO vencido (fecha > hoy) |
| `esPendienteEntrega()` | `boolean` | `motivoSinToken = "PENDIENTE"` |
| `puedeActualizarEntrega()` | `boolean` | Es PENDIENTE y puede cambiar a ENTREGADO |
| `obtenerEstadoCertificado()` | `String` | SIN_CERTIFICADO, VIGENTE, VENCIDO |
| `diasRestantesVencimiento()` | `Long` | Días hasta vencimiento (null si no hay) |
| `venceProximamente(int dias)` | `boolean` | Vence en los próximos N días |

**Ejemplo de uso:**
```java
FirmaDigitalPersonal firma = ...;

if (firma.esPendienteEntrega()) {
    // Mostrar modal de "Registrar Entrega"
}

if (firma.tieneCertificadoVigente()) {
    String estado = firma.obtenerEstadoCertificado(); // "VIGENTE"
    Long dias = firma.diasRestantesVencimiento();      // 365

    if (firma.venceProximamente(30)) {
        // Mostrar alerta: "Certificado vence en 25 días"
    }
}
```

### Script SQL de Creación

**Archivo:** `spec/04_BaseDatos/06_scripts/015_crear_tabla_firma_digital_personal.sql`

**Características:**
- 5 índices para performance
- 7 CHECK constraints para validación
- 1 trigger para auto-update de `updated_at`

**Ejecutar:**
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/015_crear_tabla_firma_digital_personal.sql
```

---

## Capa de Transferencia (DTOs)

### 1. FirmaDigitalRequest.java (164 líneas)

**Propósito:** Recibir datos del formulario de creación/actualización.

**Campos:**
```java
@Data
@Builder
public class FirmaDigitalRequest {
    private Long idPersonal;
    private Boolean entregoToken;
    private String numeroSerieToken;
    private LocalDate fechaEntregaToken;
    private LocalDate fechaInicioCertificado;
    private LocalDate fechaVencimientoCertificado;
    private String motivoSinToken;  // YA_TIENE | NO_REQUIERE | PENDIENTE
    private String observaciones;
}
```

**Métodos de Validación:**

```java
public boolean esValido() {
    // Caso 1: Entregó token → debe tener número, fechas
    if (Boolean.TRUE.equals(entregoToken)) {
        if (numeroSerieToken == null || numeroSerieToken.isBlank())
            return false;
        if (fechaInicioCertificado == null || fechaVencimientoCertificado == null)
            return false;
        if (fechaVencimientoCertificado.isBefore(fechaInicioCertificado))
            return false;
    }

    // Caso 2: No entregó → debe tener motivo
    if (Boolean.FALSE.equals(entregoToken)) {
        if (motivoSinToken == null || motivoSinToken.isBlank())
            return false;
    }

    // Caso 3: Motivo YA_TIENE → debe tener fechas del certificado
    if ("YA_TIENE".equalsIgnoreCase(motivoSinToken)) {
        if (fechaInicioCertificado == null || fechaVencimientoCertificado == null)
            return false;
    }

    return true;
}

public String obtenerMensajeError() {
    if (Boolean.TRUE.equals(entregoToken)) {
        if (numeroSerieToken == null || numeroSerieToken.isBlank())
            return "Si entregó token, debe proporcionar el número de serie";
        if (fechaInicioCertificado == null || fechaVencimientoCertificado == null)
            return "Si entregó token, debe proporcionar fechas del certificado";
        if (fechaVencimientoCertificado.isBefore(fechaInicioCertificado))
            return "La fecha de vencimiento debe ser posterior a la fecha de inicio";
    }
    // ... más validaciones
    return "Datos inválidos";
}
```

### 2. FirmaDigitalResponse.java (168 líneas)

**Propósito:** Respuesta de API con datos enriquecidos.

**Campos (25+):**
```java
@Data
@Builder
public class FirmaDigitalResponse {
    // Identificación
    private Long idFirmaPersonal;
    private Long idPersonal;
    private String nombreCompleto;
    private String dni;

    // Información laboral
    private String regimenLaboral;
    private String especialidad;
    private Long idIpress;
    private String nombreIpress;

    // Datos de firma digital
    private Boolean entregoToken;
    private String numeroSerieToken;
    private LocalDate fechaEntregaToken;
    private LocalDate fechaInicioCertificado;
    private LocalDate fechaVencimientoCertificado;
    private String motivoSinToken;
    private String descripcionMotivo;  // Legible: "Pendiente de entrega"

    // Información derivada (calculada en backend)
    private String estadoCertificado;     // SIN_CERTIFICADO, VIGENTE, VENCIDO
    private Long diasRestantesVencimiento;
    private Boolean venceProximamente;     // Default: 30 días
    private Boolean esPendiente;

    // Estado del registro
    private Boolean activo;
    private String statFirma;
    private String observaciones;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
```

**Métodos Helper para UI:**

```java
public String getEstadoCssClass() {
    switch (estadoCertificado) {
        case "VIGENTE": return "badge-success";
        case "VENCIDO": return "badge-danger";
        default: return "badge-secondary";
    }
}

public String getEstadoIcon() {
    switch (estadoCertificado) {
        case "VIGENTE": return "✅";
        case "VENCIDO": return "❌";
        default: return "⚠️";
    }
}

public boolean debeAlertar() {
    return "VENCIDO".equals(estadoCertificado) || Boolean.TRUE.equals(venceProximamente);
}

public String getMensajeAlerta() {
    if ("VENCIDO".equals(estadoCertificado)) {
        return "Certificado VENCIDO";
    }
    if (Boolean.TRUE.equals(venceProximamente) && diasRestantesVencimiento != null) {
        return "Vence en " + diasRestantesVencimiento + " días";
    }
    return null;
}
```

### 3. ActualizarEntregaTokenRequest.java (136 líneas)

**Propósito:** Actualizar entregas PENDIENTE → ENTREGADO.

**Campos:**
```java
@Data
@Builder
public class ActualizarEntregaTokenRequest {
    private Long idFirmaPersonal;
    private String numeroSerieToken;
    private LocalDate fechaEntregaToken;
    private LocalDate fechaInicioCertificado;
    private LocalDate fechaVencimientoCertificado;
    private String observaciones;  // OPCIONAL
}
```

**Uso:**
```json
PUT /api/firma-digital/{id}/actualizar-entrega
{
  "numeroSerieToken": "ABC123456789",
  "fechaEntregaToken": "2025-12-30",
  "fechaInicioCertificado": "2025-12-30",
  "fechaVencimientoCertificado": "2027-12-30",
  "observaciones": "Token entregado en presencia de coordinador"
}
```

---

## Capa de Persistencia

### Repository: `FirmaDigitalPersonalRepository.java`

```java
@Repository
public interface FirmaDigitalPersonalRepository
    extends JpaRepository<FirmaDigitalPersonal, Long> {

    // Búsquedas básicas
    Optional<FirmaDigitalPersonal> findByPersonal_IdPers(Long idPersonal);
    boolean existsByPersonal_IdPers(Long idPersonal);
    List<FirmaDigitalPersonal> findByStatFirma(String statFirma);

    // Búsquedas por motivo
    List<FirmaDigitalPersonal> findByMotivoSinTokenAndStatFirma(
        String motivo, String stat);

    // Queries complejas con @Query
    @Query("SELECT f FROM FirmaDigitalPersonal f " +
           "WHERE f.fechaVencimientoCertificado BETWEEN :fechaActual AND :fechaLimite " +
           "AND f.statFirma = 'A' " +
           "ORDER BY f.fechaVencimientoCertificado ASC")
    List<FirmaDigitalPersonal> findCertificadosProximosVencer(
        @Param("fechaActual") LocalDate fechaActual,
        @Param("fechaLimite") LocalDate fechaLimite);

    @Query("SELECT f FROM FirmaDigitalPersonal f " +
           "WHERE f.fechaVencimientoCertificado < :fechaActual " +
           "AND f.statFirma = 'A' " +
           "ORDER BY f.fechaVencimientoCertificado ASC")
    List<FirmaDigitalPersonal> findCertificadosVencidos(
        @Param("fechaActual") LocalDate fechaActual);

    // Default methods (helpers)
    default List<FirmaDigitalPersonal> findAllActivas() {
        return findByStatFirma("A");
    }

    default List<FirmaDigitalPersonal> findEntregasPendientes() {
        return findByMotivoSinTokenAndStatFirma("PENDIENTE", "A");
    }
}
```

**Índices en BD:**
```sql
CREATE INDEX idx_firma_digital_id_pers ON firma_digital_personal(id_personal);
CREATE INDEX idx_firma_digital_stat ON firma_digital_personal(stat_firma);
CREATE INDEX idx_firma_digital_motivo ON firma_digital_personal(motivo_sin_token);
CREATE INDEX idx_firma_digital_vencimiento ON firma_digital_personal(fecha_vencimiento_certificado);
CREATE INDEX idx_firma_digital_entrego ON firma_digital_personal(entrego_token);
```

---

## Capa de Negocio

### Interface: `FirmaDigitalService.java`

```java
public interface FirmaDigitalService {

    // CRUD
    FirmaDigitalResponse guardarFirmaDigital(FirmaDigitalRequest request);
    FirmaDigitalResponse obtenerPorIdPersonal(Long idPersonal);
    FirmaDigitalResponse obtenerPorId(Long id);
    void eliminarFirmaDigital(Long id);

    // Listados
    List<FirmaDigitalResponse> listarActivas();
    List<FirmaDigitalResponse> listarEntregasPendientes();

    // Reportes
    List<FirmaDigitalResponse> listarCertificadosProximosVencer();
    List<FirmaDigitalResponse> listarCertificadosProximosVencer(int dias);
    List<FirmaDigitalResponse> listarCertificadosVencidos();

    // Operaciones especiales
    FirmaDigitalResponse actualizarEntregaToken(ActualizarEntregaTokenRequest request);
    boolean existeFirmaDigital(Long idPersonal);
    int importarPersonalCENATE();
}
```

### Implementación: `PersonalFirmaDigitalServiceImpl.java` (403 líneas)

#### Patrón UPSERT

```java
@Transactional
@Override
public FirmaDigitalResponse guardarFirmaDigital(FirmaDigitalRequest request) {
    // 1. Validación del request
    if (!request.esValido()) {
        throw new ValidationException(request.obtenerMensajeError());
    }

    // 2. Obtener personal
    PersonalCnt personal = personalRepository.findById(request.getIdPersonal())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Personal no encontrado: " + request.getIdPersonal()));

    // 3. Buscar firma existente (UPSERT)
    FirmaDigitalPersonal firma = firmaRepository
        .findByPersonal_IdPers(request.getIdPersonal())
        .orElse(null);

    boolean esNuevo = (firma == null);

    if (esNuevo) {
        firma = FirmaDigitalPersonal.builder()
            .personal(personal)
            .statFirma("A")
            .build();
    }

    // 4. Mapear datos del request a la entidad
    mapRequestToEntity(request, firma);

    // 5. Guardar en BD
    FirmaDigitalPersonal firmaSaved = firmaRepository.save(firma);

    // 6. Auditar
    String accion = esNuevo ? "CREATE_FIRMA_DIGITAL" : "UPDATE_FIRMA_DIGITAL";
    String detalle = String.format("Firma digital de %s - %s",
        personal.getNamePers(),
        Boolean.TRUE.equals(request.getEntregoToken()) ? "Entregado" : "No entregado");
    auditar(accion, detalle, "INFO", "SUCCESS");

    // 7. Retornar DTO
    return mapToResponse(firmaSaved);
}
```

#### Actualizar Entrega PENDIENTE

```java
@Transactional
@Override
public FirmaDigitalResponse actualizarEntregaToken(ActualizarEntregaTokenRequest request) {
    // 1. Validar request
    if (!request.esValido()) {
        throw new ValidationException(request.obtenerMensajeError());
    }

    // 2. Obtener firma
    FirmaDigitalPersonal firma = firmaRepository.findById(request.getIdFirmaPersonal())
        .orElseThrow(() -> new ResourceNotFoundException(
            "Firma digital no encontrada: " + request.getIdFirmaPersonal()));

    // 3. Validar que esté PENDIENTE
    if (!firma.puedeActualizarEntrega()) {
        throw new ConflictException(
            "Solo se puede actualizar firma digital con estado PENDIENTE. " +
            "Estado actual: " + firma.getMotivoSinToken());
    }

    // 4. Actualizar datos
    firma.setEntregoToken(true);
    firma.setNumeroSerieToken(request.getNumeroSerieToken());
    firma.setFechaEntregaToken(request.getFechaEntregaToken());
    firma.setFechaInicioCertificado(request.getFechaInicioCertificado());
    firma.setFechaVencimientoCertificado(request.getFechaVencimientoCertificado());
    firma.setMotivoSinToken(null);  // Limpiar motivo PENDIENTE

    if (request.getObservaciones() != null) {
        firma.setObservaciones(request.getObservaciones());
    }

    // 5. Guardar
    FirmaDigitalPersonal firmaSaved = firmaRepository.save(firma);

    // 6. Auditar
    String detalle = String.format("Token entregado: %s - Personal: %s",
        request.getNumeroSerieToken(),
        firma.getPersonal().getNamePers());
    auditar("UPDATE_ENTREGA_TOKEN", detalle, "INFO", "SUCCESS");

    // 7. Retornar DTO
    return mapToResponse(firmaSaved);
}
```

#### Mapeo Entity → Response DTO

```java
private FirmaDigitalResponse mapToResponse(FirmaDigitalPersonal firma) {
    PersonalCnt personal = firma.getPersonal();

    return FirmaDigitalResponse.builder()
        .idFirmaPersonal(firma.getIdFirmaPersonal())
        .idPersonal(personal.getIdPers())
        .nombreCompleto(personal.getNamePers())
        .dni(personal.getNumeroDocumento())
        .regimenLaboral(personal.getRegimenLaboral().getDescRegLab())
        .especialidad(personal.getEspecialidad() != null
            ? personal.getEspecialidad().getDescEsp() : null)
        .idIpress(personal.getIpress() != null
            ? personal.getIpress().getIdIpress() : null)
        .nombreIpress(personal.getIpress() != null
            ? personal.getIpress().getDescIpress() : null)

        // Datos de firma
        .entregoToken(firma.getEntregoToken())
        .numeroSerieToken(firma.getNumeroSerieToken())
        .fechaEntregaToken(firma.getFechaEntregaToken())
        .fechaInicioCertificado(firma.getFechaInicioCertificado())
        .fechaVencimientoCertificado(firma.getFechaVencimientoCertificado())
        .motivoSinToken(firma.getMotivoSinToken())
        .descripcionMotivo(obtenerDescripcionMotivo(firma.getMotivoSinToken()))

        // Información derivada
        .estadoCertificado(firma.obtenerEstadoCertificado())
        .diasRestantesVencimiento(firma.diasRestantesVencimiento())
        .venceProximamente(firma.venceProximamente(30))
        .esPendiente(firma.esPendienteEntrega())

        // Estado
        .activo(firma.isActivo())
        .statFirma(firma.getStatFirma())
        .observaciones(firma.getObservaciones())
        .createdAt(firma.getCreatedAt())
        .updatedAt(firma.getUpdatedAt())
        .build();
}

private String obtenerDescripcionMotivo(String motivo) {
    if (motivo == null) return null;

    switch (motivo.toUpperCase()) {
        case "YA_TIENE": return "Ya tiene firma digital propia";
        case "NO_REQUIERE": return "No requiere firma digital";
        case "PENDIENTE": return "Pendiente de entrega";
        default: return motivo;
    }
}
```

---

## Capa de Presentación (API REST)

### Controller: `FirmaDigitalController.java`

**Base URL:** `/api/firma-digital`

Ver documentación completa de endpoints en: [`spec/01_Backend/01_api_endpoints.md`](./01_api_endpoints.md#firma-digital)

---

## Reglas de Negocio

### 1. Motivos Sin Token

| Motivo | Código | Descripción | Requiere Fechas |
|--------|--------|-------------|-----------------|
| Ya tiene firma propia | `YA_TIENE` | Personal tiene certificado digital propio | ✅ Sí (del certificado existente) |
| No requiere firma | `NO_REQUIERE` | Su rol no requiere firma digital | ❌ No |
| Pendiente de entrega | `PENDIENTE` | Aún no entrega el token físicamente | ❌ No (se completan después) |

### 2. Flujo de Estados

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE ESTADOS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ESTADO INICIAL (nuevo registro)                            │
│       │                                                      │
│       ├──→ entregoToken = TRUE                              │
│       │    ├─ numeroSerieToken: "ABC123456789"              │
│       │    ├─ fechaInicioCertificado: 2025-01-01            │
│       │    └─ fechaVencimientoCertificado: 2027-01-01       │
│       │                                                      │
│       └──→ entregoToken = FALSE                             │
│            ├──→ motivoSinToken = "YA_TIENE"                 │
│            │    └─ fechas del certificado existente         │
│            ├──→ motivoSinToken = "NO_REQUIERE"              │
│            │    └─ sin fechas                               │
│            └──→ motivoSinToken = "PENDIENTE"                │
│                 └─ sin fechas (se completan después)        │
│                      │                                       │
│                      ▼                                       │
│             (DÍAS/SEMANAS DESPUÉS)                          │
│                      │                                       │
│                      ▼                                       │
│   PUT /api/firma-digital/{id}/actualizar-entrega            │
│                      │                                       │
│                      ▼                                       │
│   • entregoToken: FALSE → TRUE                              │
│   • motivoSinToken: "PENDIENTE" → null                      │
│   • numeroSerieToken: "XYZ987654321"                        │
│   • fechas del certificado                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 3. Cálculo de Vigencia

```java
// En FirmaDigitalPersonal.java
public String obtenerEstadoCertificado() {
    if (fechaVencimientoCertificado == null) {
        return "SIN_CERTIFICADO";
    }

    LocalDate hoy = LocalDate.now();

    if (fechaVencimientoCertificado.isBefore(hoy)) {
        return "VENCIDO";
    }

    return "VIGENTE";
}

public Long diasRestantesVencimiento() {
    if (fechaVencimientoCertificado == null) {
        return null;
    }

    LocalDate hoy = LocalDate.now();
    return ChronoUnit.DAYS.between(hoy, fechaVencimientoCertificado);
}

public boolean venceProximamente(int dias) {
    if (fechaVencimientoCertificado == null) {
        return false;
    }

    Long diasRestantes = diasRestantesVencimiento();
    return diasRestantes != null && diasRestantes > 0 && diasRestantes <= dias;
}
```

### 4. Soft Delete

```java
@Transactional
@Override
public void eliminarFirmaDigital(Long id) {
    FirmaDigitalPersonal firma = firmaRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException(
            "Firma digital no encontrada: " + id));

    // NO se elimina el registro, solo se marca como inactivo
    firma.setStatFirma("I");
    firmaRepository.save(firma);

    auditar("DELETE_FIRMA_DIGITAL",
        "Firma digital eliminada (soft delete): " + id,
        "WARNING", "SUCCESS");
}
```

---

## Validaciones

### Validación en 3 Capas

```
CAPA 1: DTO (FirmaDigitalRequest.esValido())
        ↓
   Validaciones lógicas de coherencia de datos
   - Si entregó → debe tener número de serie
   - Si no entregó → debe tener motivo
   - Fechas coherentes
        ↓
CAPA 2: Service (PersonalFirmaDigitalServiceImpl)
        ↓
   Validaciones de negocio
   - Personal existe
   - Firma puede actualizarse (si es PENDIENTE)
   - No duplicar registros activos
        ↓
CAPA 3: Database (CHECK Constraints)
        ↓
   Validaciones de integridad
   - CHECK constraints en tabla
   - Foreign keys
   - Not null constraints
```

### CHECK Constraints en BD

```sql
-- 1. Si entregó token → debe tener número y fechas
CONSTRAINT chk_entrego_token_fechas CHECK (
    (entrego_token = TRUE AND
     fecha_inicio_certificado IS NOT NULL AND
     fecha_vencimiento_certificado IS NOT NULL AND
     numero_serie_token IS NOT NULL) OR
    (entrego_token = FALSE)
)

-- 2. Si no entregó → debe tener motivo
CONSTRAINT chk_no_entrego_motivo CHECK (
    (entrego_token = FALSE AND motivo_sin_token IS NOT NULL) OR
    (entrego_token = TRUE AND motivo_sin_token IS NULL)
)

-- 3. Si motivo YA_TIENE → debe tener fechas de certificado
CONSTRAINT chk_motivo_ya_tiene CHECK (
    (motivo_sin_token = 'YA_TIENE' AND
     fecha_inicio_certificado IS NOT NULL AND
     fecha_vencimiento_certificado IS NOT NULL) OR
    (motivo_sin_token != 'YA_TIENE' OR motivo_sin_token IS NULL)
)

-- 4. Fechas coherentes
CONSTRAINT chk_fechas_coherentes CHECK (
    fecha_vencimiento_certificado IS NULL OR
    fecha_inicio_certificado IS NULL OR
    fecha_vencimiento_certificado > fecha_inicio_certificado
)

-- 5. Motivos válidos
CONSTRAINT chk_motivo_valido CHECK (
    motivo_sin_token IS NULL OR
    motivo_sin_token IN ('YA_TIENE', 'NO_REQUIERE', 'PENDIENTE')
)

-- 6. Estado válido
CONSTRAINT chk_stat_firma CHECK (stat_firma IN ('A', 'I'))

-- 7. Número de serie único (si existe)
CREATE UNIQUE INDEX idx_firma_digital_numero_serie_unique
ON firma_digital_personal(numero_serie_token)
WHERE numero_serie_token IS NOT NULL AND stat_firma = 'A';
```

---

## Casos de Uso

### Caso 1: Crear Firma Digital - Token Entregado

**Escenario:** Médico CAS entrega token al momento de creación de usuario.

**Request:**
```json
POST /api/firma-digital
{
  "idPersonal": 42,
  "entregoToken": true,
  "numeroSerieToken": "ABC123456789",
  "fechaEntregaToken": "2025-12-30",
  "fechaInicioCertificado": "2025-01-01",
  "fechaVencimientoCertificado": "2027-01-01",
  "observaciones": "Token entregado en ceremonia de bienvenida"
}
```

**Flujo Backend:**
1. Valida `FirmaDigitalRequest.esValido()` → ✅ TRUE
2. Busca personal con id=42 → ✅ Existe
3. Busca firma existente → ❌ No existe (es nuevo)
4. Crea nueva entidad con `entregoToken=true`
5. Guarda en BD
6. Audita: `CREATE_FIRMA_DIGITAL`
7. Calcula `estadoCertificado = "VIGENTE"`, `diasRestantes = 731`, `venceProximamente = false`

**Response:**
```json
{
  "status": 200,
  "message": "Firma digital guardada exitosamente",
  "data": {
    "idFirmaPersonal": 123,
    "idPersonal": 42,
    "nombreCompleto": "Dr. Juan Perez Lopez",
    "dni": "12345678",
    "regimenLaboral": "CAS",
    "especialidad": "Cardiología",
    "entregoToken": true,
    "numeroSerieToken": "ABC123456789",
    "fechaEntregaToken": "2025-12-30",
    "fechaInicioCertificado": "2025-01-01",
    "fechaVencimientoCertificado": "2027-01-01",
    "estadoCertificado": "VIGENTE",
    "diasRestantesVencimiento": 731,
    "venceProximamente": false,
    "esPendiente": false,
    "activo": true,
    "observaciones": "Token entregado en ceremonia de bienvenida"
  }
}
```

### Caso 2: Crear Firma Digital - PENDIENTE

**Escenario:** Enfermera 728 no trae token al registro, se marca como PENDIENTE.

**Request:**
```json
POST /api/firma-digital
{
  "idPersonal": 43,
  "entregoToken": false,
  "motivoSinToken": "PENDIENTE"
}
```

**Flujo Backend:**
1. Valida → ✅ OK (no entregó, tiene motivo)
2. Crea registro con `motivoSinToken="PENDIENTE"`
3. Audita: `CREATE_FIRMA_DIGITAL`

**Response:**
```json
{
  "status": 200,
  "message": "Firma digital guardada exitosamente",
  "data": {
    "idFirmaPersonal": 124,
    "idPersonal": 43,
    "nombreCompleto": "Enf. Maria Garcia",
    "dni": "87654321",
    "entregoToken": false,
    "motivoSinToken": "PENDIENTE",
    "descripcionMotivo": "Pendiente de entrega",
    "estadoCertificado": "SIN_CERTIFICADO",
    "esPendiente": true,
    "activo": true
  }
}
```

### Caso 3: Completar Entrega PENDIENTE

**Escenario:** Días después, enfermera trae el token.

**Request:**
```json
PUT /api/firma-digital/124/actualizar-entrega
{
  "numeroSerieToken": "XYZ987654321",
  "fechaEntregaToken": "2026-01-05",
  "fechaInicioCertificado": "2026-01-01",
  "fechaVencimientoCertificado": "2028-01-01",
  "observaciones": "Token entregado posterior al registro"
}
```

**Flujo Backend:**
1. Obtiene firma id=124
2. Valida `puedeActualizarEntrega()` → ✅ TRUE (es PENDIENTE)
3. Actualiza:
   - `entregoToken: false → true`
   - `motivoSinToken: "PENDIENTE" → null`
   - Agrega número de serie y fechas
4. Audita: `UPDATE_ENTREGA_TOKEN`

**Response:**
```json
{
  "status": 200,
  "message": "Entrega de token registrada exitosamente",
  "data": {
    "idFirmaPersonal": 124,
    "idPersonal": 43,
    "entregoToken": true,
    "numeroSerieToken": "XYZ987654321",
    "fechaEntregaToken": "2026-01-05",
    "estadoCertificado": "VIGENTE",
    "diasRestantesVencimiento": 731,
    "esPendiente": false
  }
}
```

### Caso 4: Alertas de Certificados Próximos a Vencer

**Request:**
```http
GET /api/firma-digital/proximos-vencer?dias=30
```

**Flujo Backend:**
```sql
SELECT * FROM firma_digital_personal
WHERE fecha_vencimiento_certificado BETWEEN '2025-12-30' AND '2026-01-29'
AND stat_firma = 'A'
ORDER BY fecha_vencimiento_certificado ASC
```

**Response:**
```json
{
  "status": 200,
  "message": "Lista de certificados próximos a vencer",
  "data": [
    {
      "idFirmaPersonal": 125,
      "nombreCompleto": "Dr. Carlos Sanchez",
      "fechaVencimientoCertificado": "2026-01-15",
      "diasRestantesVencimiento": 16,
      "venceProximamente": true,
      "estadoCertificado": "VIGENTE"
    },
    {
      "idFirmaPersonal": 126,
      "nombreCompleto": "Enf. Laura Torres",
      "fechaVencimientoCertificado": "2026-01-28",
      "diasRestantesVencimiento": 29,
      "venceProximamente": true,
      "estadoCertificado": "VIGENTE"
    }
  ]
}
```

---

## Seguridad y Auditoría

### Control de Acceso (RBAC)

```java
@RestController
@RequestMapping("/api/firma-digital")
@RequiredArgsConstructor
public class FirmaDigitalController {

    // Solo SUPERADMIN y ADMIN pueden crear/modificar
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    @PostMapping
    public ResponseEntity<?> guardarFirmaDigital(...) { ... }

    // MEDICO puede ver su propia firma
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO', 'COORDINADOR')")
    @GetMapping("/personal/{idPersonal}")
    public ResponseEntity<?> obtenerPorIdPersonal(...) { ... }

    // Solo SUPERADMIN puede eliminar
    @PreAuthorize("hasRole('SUPERADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarFirmaDigital(...) { ... }
}
```

### Auditoría Completa

Todas las operaciones son auditadas automáticamente:

| Acción | Módulo | Nivel | Cuándo |
|--------|--------|-------|--------|
| CREATE_FIRMA_DIGITAL | FIRMA_DIGITAL | INFO | Al crear registro |
| UPDATE_FIRMA_DIGITAL | FIRMA_DIGITAL | INFO | Al actualizar datos |
| UPDATE_ENTREGA_TOKEN | FIRMA_DIGITAL | INFO | Al completar entrega PENDIENTE |
| DELETE_FIRMA_DIGITAL | FIRMA_DIGITAL | WARNING | Al eliminar (soft delete) |
| IMPORT_PERSONAL_CENATE | FIRMA_DIGITAL | INFO | Al importar masivamente |

**Ejemplo de registro de auditoría:**
```json
{
  "usuario": "44914706",
  "nombreUsuario": "Admin Principal",
  "accion": "CREATE_FIRMA_DIGITAL",
  "modulo": "FIRMA_DIGITAL",
  "detalle": "Firma digital de Dr. Juan Perez - Entregado",
  "nivel": "INFO",
  "estado": "SUCCESS",
  "fecha": "2025-12-30T16:45:30-05:00"
}
```

**Consultar auditoría:**
```sql
SELECT * FROM vw_auditoria_modular_detallada
WHERE modulo = 'FIRMA_DIGITAL'
ORDER BY fecha DESC
LIMIT 50;
```

---

## Integración con Frontend

### Componentes React

#### 1. FirmaDigitalTab.jsx (650+ líneas)

**Ubicación en formularios:**
```
CrearUsuarioModal.jsx / ActualizarModel.jsx
  → Tabs:
      ├─ Datos Personales
      ├─ Datos Laborales
      ├─ Firma Digital ← ESTE COMPONENTE
      └─ Roles
```

**Flujos condicionales:**

```javascript
// Detectar régimen laboral
const esLocador = regimenLaboral.includes('LOCADOR');
const requiereFirmaDigital = !esLocador;

if (esLocador) {
  // Mostrar solo mensaje informativo
  return <MensajeLocador />;
}

// Formulario dinámico para CAS/728
return (
  <FormularioDinamico
    entregoToken={formData.entrego_token}
    onChangeEntrega={handleEntregoTokenChange}
  >
    {formData.entrego_token === 'SI' ? (
      <GrupoTokenEntregado />
    ) : (
      <SelectorMotivo
        motivo={formData.motivo_sin_token}
        onChange={handleMotivoChange}
      />
    )}
  </FormularioDinamico>
);
```

#### 2. ActualizarEntregaTokenModal.jsx (357+ líneas)

**Cuándo se muestra:**
```javascript
// En ActualizarModel.jsx
{firmaDigital && firmaDigital.esPendiente && (
  <button onClick={() => setShowActualizarEntregaModal(true)}>
    🖋️ Registrar Entrega
  </button>
)}

{showActualizarEntregaModal && (
  <ActualizarEntregaTokenModal
    firmaDigital={firmaDigital}
    onClose={() => setShowActualizarEntregaModal(false)}
    onSuccess={handleEntregaRegistrada}
  />
)}
```

**Validación en tiempo real:**
```javascript
const validarFormulario = () => {
  const errors = {};

  if (!formData.numero_serie_token?.trim()) {
    errors.numero_serie_token = 'Número de serie obligatorio';
  }

  if (!formData.fecha_inicio_certificado) {
    errors.fecha_inicio = 'Fecha de inicio obligatoria';
  }

  if (formData.fecha_vencimiento_certificado &&
      formData.fecha_inicio_certificado &&
      new Date(formData.fecha_vencimiento_certificado) <=
      new Date(formData.fecha_inicio_certificado)) {
    errors.fecha_vencimiento = 'Debe ser posterior a fecha de inicio';
  }

  return errors;
};
```

#### 3. ControlFirmaDigital.jsx

**Panel administrativo completo:**

```javascript
// Funcionalidades esperadas
- Listar firmas digitales activas
- Filtrar por:
  • Estado: Entregado / Pendiente / Vencido
  • IPRESS
  • Régimen laboral
  • Búsqueda por nombre/DNI
- Alertas visuales:
  • Badge rojo: Certificados vencidos
  • Badge amarillo: Próximos a vencer (30 días)
  • Badge verde: Vigentes
- Acciones masivas:
  • Exportar reporte Excel
  • Enviar recordatorios (futuro)
- Detalle individual:
  • Ver historial de cambios (auditoría)
  • Editar datos
  • Marcar como renovado
```

### API Client

**Servicio de consumo de API:**

```javascript
// firmaDigitalService.js
import apiClient from '../lib/apiClient';

const firmaDigitalService = {

  // Guardar (crear/actualizar)
  async guardar(firmaData) {
    const response = await apiClient.post('/firma-digital', firmaData);
    return response.data;
  },

  // Obtener por personal
  async obtenerPorPersonal(idPersonal) {
    const response = await apiClient.get(`/firma-digital/personal/${idPersonal}`);
    return response.data;
  },

  // Actualizar entrega PENDIENTE
  async actualizarEntrega(idFirma, datosEntrega) {
    const response = await apiClient.put(
      `/firma-digital/${idFirma}/actualizar-entrega`,
      datosEntrega
    );
    return response.data;
  },

  // Listar pendientes
  async listarPendientes() {
    const response = await apiClient.get('/firma-digital/pendientes');
    return response.data;
  },

  // Listar próximos a vencer
  async listarProximosVencer(dias = 30) {
    const response = await apiClient.get(
      `/firma-digital/proximos-vencer?dias=${dias}`
    );
    return response.data;
  }
};

export default firmaDigitalService;
```

---

## Próximas Mejoras (Roadmap)

### Fase 2 (v1.15.0)

- [ ] **Panel ControlFirmaDigital.jsx completo**
  - Listado con filtros avanzados
  - Exportación a Excel
  - Gráficos de dashboard (Chart.js)

- [ ] **Notificaciones automáticas**
  - Email 30 días antes de vencimiento
  - Email 7 días antes de vencimiento
  - Email al vencer certificado

- [ ] **Renovación de certificados**
  - Flujo de renovación con historial
  - Tracking de múltiples certificados por personal

### Fase 3 (v1.16.0)

- [ ] **Integración con RENIEC**
  - Validación automática de identidad
  - Verificación de datos personales

- [ ] **Firma electrónica de documentos**
  - API de firma de PDFs
  - Historial de documentos firmados

- [ ] **Reportes avanzados**
  - Dashboard ejecutivo
  - Métricas de adopción
  - Análisis por IPRESS/régimen

---

## Anexos

### A. Diccionario de Datos

Ver: `spec/04_BaseDatos/06_scripts/015_crear_tabla_firma_digital_personal.sql`

### B. Endpoints Completos

Ver: `spec/01_Backend/01_api_endpoints.md#firma-digital`

### C. Plan de Implementación

Ver: `plan/05_Firma_Digital/01_plan_implementacion.md`

### D. Checklist de Implementación

Ver: `checklist/03_Checklists/01_checklist_firma_digital.md`

---

**Fin de la documentación técnica del Módulo de Firma Digital v1.14.0**

*EsSalud Perú - CENATE | Sistema de Telemedicina*
*Última actualización: 2025-12-30*
