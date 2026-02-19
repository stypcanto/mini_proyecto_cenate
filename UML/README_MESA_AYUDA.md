# 📊 Diagrama UML - Mesa de Ayuda (v1.64.0)

## Introducción

Este documento contiene los diagramas UML del módulo **Mesa de Ayuda** (Help Desk) del sistema CENATE. El módulo permite a los médicos crear tickets de soporte con motivos predefinidos y numeración automática.

---

## 📁 Archivos de Diagramas

### 1. **mesa_ayuda_er_diagram.puml**
**Tipo:** Diagrama Entidad-Relación (ER)
**Descripción:** Muestra las tablas de la base de datos y sus relaciones

**Tablas incluidas:**
- `dim_motivos_mesadeayuda` - Catálogo de 7 motivos predefinidos
- `dim_ticket_mesa_ayuda` - Transacciones de tickets creados
- `dim_secuencia_tickets` - Sistema de numeración por año

### 2. **mesa_ayuda_class_diagram.puml**
**Tipo:** Diagrama de Clases UML
**Descripción:** Muestra las clases Java, DTOs y repositorios del backend

**Paquetes incluidos:**
- `model.mesaayuda` - Entidades JPA
- `dto.mesaayuda` - Data Transfer Objects
- `repository.mesaayuda` - Interfaces de datos
- `service.mesaayuda` - Lógica de negocio
- `api` - Controladores REST

### 3. **mesa_ayuda_sequence_diagram.puml**
**Tipo:** Diagrama de Secuencia
**Descripción:** Muestra el flujo completo de creación de un ticket

**Fases:**
1. Abrir modal y cargar motivos
2. Seleccionar motivo y llenar datos
3. Crear ticket (generar número)
4. Responder al usuario
5. Cerrar modal

---

## 🗄️ Estructura de Base de Datos

### **dim_motivos_mesadeayuda** (TABLA CATÁLOGO)

```sql
CREATE TABLE dim_motivos_mesadeayuda (
    id              BIGSERIAL PRIMARY KEY,
    codigo          VARCHAR(100) NOT NULL UNIQUE,
    descripcion     VARCHAR(500) NOT NULL,
    activo          BOOLEAN DEFAULT TRUE,
    orden           INTEGER DEFAULT 0,
    fecha_creacion  TIMESTAMP DEFAULT NOW()
);
```

**Índices:**
```sql
CREATE INDEX idx_motivos_activo ON dim_motivos_mesadeayuda(activo);
CREATE INDEX idx_motivos_orden ON dim_motivos_mesadeayuda(orden);
```

**Datos (7 motivos predefinidos):**
```
ID | Código                    | Descripción
---|---------------------------|------------------------------------------------------------
1  | PS_CITAR_ADICIONAL        | PROFESIONAL DE SALUD / LICENCIADO SOLICITA CITAR...
2  | PS_ACTUALIZAR_LISTADO     | PROFESIONAL DE SALUD SOLICITA ACTUALIZAR LISTADO...
3  | PS_CONTACTAR_PACIENTE     | PROFESIONAL DE SALUD SOLICITA CONTACTAR CON EL PA...
4  | PS_ELIMINAR_EXCEDENTE     | PROFESIONAL DE SALUD SOLICITA ELIMINAR PACIENTE...
5  | PS_ENVIAR_ACTO_MEDICO     | PROFESIONAL DE SALUD SOLICITA ENVIAR POR MENSAJE...
6  | PS_ENVIO_IMAGENES         | PROFESIONAL DE SALUD SOLICITA ENVIO DE IMÁGENES...
7  | PS_CITA_ADICIONAL         | PROFESIONAL DE SALUD SOLICITA PROGRAMACION DE...
```

---

### **dim_ticket_mesa_ayuda** (TABLA TRANSACCIONAL)

```sql
CREATE TABLE dim_ticket_mesa_ayuda (
    id                      BIGSERIAL PRIMARY KEY,
    titulo                  VARCHAR(255) NOT NULL,
    descripcion             TEXT NOT NULL,
    estado                  VARCHAR(50) DEFAULT 'ABIERTO'
        CHECK (estado IN ('ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
    prioridad               VARCHAR(20) DEFAULT 'MEDIA'
        CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA')),
    -- Datos del médico (denormalizados)
    id_medico               BIGINT,
    nombre_medico           VARCHAR(255),
    -- Datos del paciente (denormalizados)
    id_solicitud_bolsa      BIGINT,
    dni_paciente            VARCHAR(15),
    nombre_paciente         VARCHAR(255),
    especialidad            VARCHAR(255),
    ipress                  VARCHAR(255),
    -- Datos de respuesta
    respuesta               TEXT,
    id_personal_mesa        BIGINT,
    nombre_personal_mesa    VARCHAR(255),
    -- Nuevos campos v1.64.0
    id_motivo               BIGINT REFERENCES dim_motivos_mesadeayuda(id) ON DELETE SET NULL,
    observaciones           TEXT,
    numero_ticket           VARCHAR(20) UNIQUE NOT NULL,
    -- Control de auditoría
    fecha_creacion          TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion     TIMESTAMP DEFAULT NOW(),
    fecha_respuesta         TIMESTAMP,
    deleted_at              TIMESTAMP NULL
);
```

**Índices:**
```sql
CREATE INDEX idx_ticket_mesa_estado ON dim_ticket_mesa_ayuda(estado);
CREATE INDEX idx_ticket_mesa_medico ON dim_ticket_mesa_ayuda(id_medico);
CREATE INDEX idx_ticket_mesa_numero ON dim_ticket_mesa_ayuda(numero_ticket);
CREATE INDEX idx_ticket_mesa_prioridad ON dim_ticket_mesa_ayuda(prioridad);
CREATE INDEX idx_ticket_mesa_fecha_creacion ON dim_ticket_mesa_ayuda(fecha_creacion DESC);
```

**Relaciones:**
- FK a `dim_motivos_mesadeayuda` (id_motivo) - Relación 1:N
- FK a `dim_personal_cnt` (id_medico) - Médico que crea ticket
- FK a `dim_personal_cnt` (id_personal_mesa) - Personal que responde

---

### **dim_secuencia_tickets** (TABLA DE NUMERACIÓN)

```sql
CREATE TABLE dim_secuencia_tickets (
    id                  BIGSERIAL PRIMARY KEY,
    anio                INTEGER NOT NULL UNIQUE,
    contador            INTEGER NOT NULL DEFAULT 0,
    fecha_creacion      TIMESTAMP DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP DEFAULT NOW()
);
```

**Índice:**
```sql
CREATE INDEX idx_secuencia_tickets_anio ON dim_secuencia_tickets(anio);
```

**Propósito:** Mantener un contador por año para generar números únicos:
- Formato: `XXX-YYYY` (ej: 001-2026, 002-2026, 003-2026)
- Un registro por año
- Auto-incrementa de forma atómica (thread-safe)

---

## 🔗 Relaciones y Cardinalidad

### **1. dim_motivos_mesadeayuda ⟷ dim_ticket_mesa_ayuda**

```
┌─────────────────────────────────┐
│   dim_motivos_mesadeayuda       │
│ (Catálogo - 7 registros fijos)  │
└─────────────┬───────────────────┘
              │
              │ 1:N (Un motivo → Muchos tickets)
              │ FK: id_motivo
              │
┌─────────────▼───────────────────┐
│   dim_ticket_mesa_ayuda         │
│ (Transaccional - N registros)   │
└─────────────────────────────────┘
```

**Características de la relación:**
- Tipo: **Uno-a-Muchos (1:N)**
- FK Column: `id_motivo` en dim_ticket_mesa_ayuda
- Referencia: `dim_motivos_mesadeayuda.id`
- Acción en Delete: `ON DELETE SET NULL`
- Índices: idx_motivos_orden, idx_motivos_activo

**Ejemplo:**

```
Motivo (id=1):
"PROFESIONAL DE SALUD / LICENCIADO SOLICITA CITAR PACIENTE ADICIONAL"
        ↓
        ├─ Ticket 001-2026 (id_medico=10, id_motivo=1)
        ├─ Ticket 003-2026 (id_medico=15, id_motivo=1)
        └─ Ticket 005-2026 (id_medico=20, id_motivo=1)

Motivo (id=3):
"PROFESIONAL DE SALUD SOLICITA CONTACTAR CON EL PACIENTE..."
        ↓
        ├─ Ticket 002-2026 (id_medico=12, id_motivo=3)
        └─ Ticket 004-2026 (id_medico=18, id_motivo=3)
```

---

### **2. dim_secuencia_tickets ⟷ dim_ticket_mesa_ayuda**

```
┌──────────────────────────────────┐
│   dim_secuencia_tickets          │
│ (Generador de números)           │
│ id=1, anio=2026, contador=5      │
└──────────────┬───────────────────┘
               │
               │ Genera
               │ numeroTicket = "003-2026"
               │
┌──────────────▼───────────────────┐
│   dim_ticket_mesa_ayuda          │
│ numero_ticket: "003-2026"        │
└──────────────────────────────────┘
```

**Algoritmo:**
```
CUANDO: Se crea un nuevo ticket
HACER:
  1. Obtener año actual: 2026
  2. Buscar registro en dim_secuencia_tickets WHERE anio = 2026
  3. SI EXISTS:
       a) Incrementar contador: UPDATE ... SET contador = contador + 1
       b) contador ahora = 6
       c) numeroTicket = "006-2026"
     SINO:
       a) Crear nuevo registro: anio=2026, contador=1
       b) numeroTicket = "001-2026"
  4. Guardar ticket con numeroTicket
```

---

## 🏗️ Arquitectura de Capas

```
┌──────────────────────────────────────────────────────────────┐
│                    FRONTEND (React 19.2)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ CrearTicketModal.jsx                                   │  │
│  │ - Dropdown motivos (GET /api/mesa-ayuda/motivos)      │  │
│  │ - Auto-generar título desde motivo                     │  │
│  │ - Campo observaciones (opcional)                       │  │
│  │ - Mostrar número ticket (001-2026)                     │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────┬───────────────────────────────────────────┘
                   │ API REST
                   │
┌──────────────────▼───────────────────────────────────────────┐
│               BACKEND (Spring Boot 3.5.6)                    │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ TicketMesaAyudaController                              │  │
│  │ + GET  /api/mesa-ayuda/motivos                         │  │
│  │ + POST /api/mesa-ayuda/tickets                         │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │ inyecta                                   │
│  ┌──────────────▼───────────────────────────────────────┐  │
│  │ TicketMesaAyudaService                                 │  │
│  │ + obtenerMotivos()                                     │  │
│  │ + crearTicket(RequestDTO)                              │  │
│  │ + generarNumeroTicket() [ATOMIC]                       │  │
│  │ - toResponseDTO(Entity)                                │  │
│  └──────────────┬───────────────────────────────────────┘  │
│                 │ usa                                       │
│  ┌──────────────┴──────────────┬─────────────────────────┐ │
│  │                             │                         │  │
│  ▼                             ▼                         ▼  │
│ MotivoRepository    SecuenciaRepository    TicketRepository│
│                                                              │
│  └──────────────────────────────────────────────────────────┘
└──────────────────┬───────────────────────────────────────────┘
                   │ JDBC
                   │
┌──────────────────▼───────────────────────────────────────────┐
│                  PostgreSQL Database                          │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ dim_motivos_mesadeayuda (7 registros ESTÁTICOS)       │  │
│  │ dim_ticket_mesa_ayuda (N registros DINÁMICOS)         │  │
│  │ dim_secuencia_tickets (1 registro por año)             │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Clases y Métodos

### **Entidades JPA**

#### **DimMotivosMesaAyuda**
```java
@Entity
@Table(name = "dim_motivos_mesadeayuda", schema = "public")
public class DimMotivosMesaAyuda {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String codigo;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private Boolean activo = true;

    @Column(nullable = false)
    private Integer orden = 0;

    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
```

#### **DimTicketMesaAyuda**
```java
@Entity
@Table(name = "dim_ticket_mesa_ayuda", schema = "public",
       indexes = {
           @Index(name = "idx_ticket_mesa_numero", columnList = "numero_ticket"),
           @Index(name = "idx_ticket_mesa_estado", columnList = "estado"),
           @Index(name = "idx_ticket_mesa_medico", columnList = "id_medico")
       })
public class DimTicketMesaAyuda {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String titulo;

    @Column(nullable = false, unique = true)
    private String numeroTicket; // ← Formato: 001-2026

    @Column(name = "id_motivo")
    private Long idMotivo; // ← FK a dim_motivos_mesadeayuda

    private String observaciones;

    private String estado = "ABIERTO";

    private String prioridad = "MEDIA";

    // ... más campos
}
```

#### **DimSecuenciaTickets**
```java
@Entity
@Table(name = "dim_secuencia_tickets", schema = "public",
       indexes = @Index(name = "idx_secuencia_tickets_anio", columnList = "anio"))
public class DimSecuenciaTickets {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer anio;

    @Column(nullable = false)
    private Integer contador = 0;

    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
}
```

### **DTOs**

#### **MotivoMesaAyudaDTO**
```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MotivoMesaAyudaDTO {
    private Long id;
    private String codigo;
    private String descripcion;
}
```

#### **TicketMesaAyudaResponseDTO**
```java
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TicketMesaAyudaResponseDTO {
    private Long id;
    private String numeroTicket;      // ← 001-2026
    private String titulo;
    private Long idMotivo;
    private String nombreMotivo;      // ← Descripción del motivo
    private String observaciones;
    private String estado;
    private String prioridad;
    private LocalDateTime fechaCreacion;
    // ... más campos
}
```

### **Repositorios**

#### **MotivoMesaAyudaRepository**
```java
public interface MotivoMesaAyudaRepository
    extends JpaRepository<DimMotivosMesaAyuda, Long> {

    List<DimMotivosMesaAyuda> findByActivoTrueOrderByOrdenAsc();
    Optional<DimMotivosMesaAyuda> findByCodigo(String codigo);
}
```

#### **SecuenciaTicketsRepository**
```java
public interface SecuenciaTicketsRepository
    extends JpaRepository<DimSecuenciaTickets, Long> {

    Optional<DimSecuenciaTickets> findByAnio(Integer anio);

    @Modifying
    @Transactional
    @Query(value = "UPDATE dim_secuencia_tickets " +
                   "SET contador = contador + 1, " +
                   "    fecha_actualizacion = NOW() " +
                   "WHERE anio = ?1", nativeQuery = true)
    int incrementarContador(Integer anio);
}
```

### **Service**

#### **TicketMesaAyudaService**
```java
@Service
@Slf4j
public class TicketMesaAyudaService {
    @Autowired private MotivoMesaAyudaRepository motivoRepository;
    @Autowired private SecuenciaTicketsRepository secuenciaRepository;
    @Autowired private TicketMesaAyudaRepository ticketRepository;

    /**
     * Obtiene motivos activos para el dropdown
     */
    public List<MotivoMesaAyudaDTO> obtenerMotivos() {
        return motivoRepository.findByActivoTrueOrderByOrdenAsc()
            .stream()
            .map(m -> MotivoMesaAyudaDTO.builder()
                .id(m.getId())
                .codigo(m.getCodigo())
                .descripcion(m.getDescripcion())
                .build())
            .collect(Collectors.toList());
    }

    /**
     * Crea un ticket con número automático
     */
    public TicketMesaAyudaResponseDTO crearTicket(
            TicketMesaAyudaRequestDTO request) {

        // 1. Validar motivo
        DimMotivosMesaAyuda motivo = null;
        if (request.getIdMotivo() != null) {
            motivo = motivoRepository.findById(request.getIdMotivo())
                .orElseThrow(() -> new RuntimeException("Motivo no encontrado"));
        }

        // 2. Generar número ticket (ATOMIC)
        String numeroTicket = generarNumeroTicket();

        // 3. Crear ticket
        DimTicketMesaAyuda ticket = DimTicketMesaAyuda.builder()
            .numeroTicket(numeroTicket)
            .idMotivo(request.getIdMotivo())
            .titulo(motivo != null ? motivo.getDescripcion() : request.getTitulo())
            .observaciones(request.getObservaciones())
            .estado("ABIERTO")
            .prioridad(request.getPrioridad())
            // ... más campos
            .build();

        // 4. Guardar
        ticket = ticketRepository.save(ticket);

        // 5. Retornar DTO
        return toResponseDTO(ticket);
    }

    /**
     * Genera número de ticket: XXX-YYYY
     * Thread-safe usando SQL nativo
     */
    private String generarNumeroTicket() {
        int year = LocalDateTime.now().getYear();

        // Obtener o crear secuencia para el año
        Optional<DimSecuenciaTickets> seq = secuenciaRepository.findByAnio(year);

        if (seq.isEmpty()) {
            DimSecuenciaTickets newSeq = DimSecuenciaTickets.builder()
                .anio(year)
                .contador(0)
                .build();
            secuenciaRepository.save(newSeq);
        }

        // Incrementar contador de forma ATÓMICA
        secuenciaRepository.incrementarContador(year);

        // Obtener contador actualizado
        DimSecuenciaTickets secActualizada =
            secuenciaRepository.findByAnio(year).get();

        int contador = secActualizada.getContador();

        // Retornar formato: 001-2026
        return String.format("%03d-%04d", contador, year);
    }

    /**
     * Mapea entidad a DTO
     */
    private TicketMesaAyudaResponseDTO toResponseDTO(DimTicketMesaAyuda ticket) {
        String nombreMotivo = null;
        if (ticket.getIdMotivo() != null) {
            nombreMotivo = motivoRepository.findById(ticket.getIdMotivo())
                .map(DimMotivosMesaAyuda::getDescripcion)
                .orElse(null);
        }

        return TicketMesaAyudaResponseDTO.builder()
            .id(ticket.getId())
            .numeroTicket(ticket.getNumeroTicket())
            .titulo(ticket.getTitulo())
            .idMotivo(ticket.getIdMotivo())
            .nombreMotivo(nombreMotivo)
            .observaciones(ticket.getObservaciones())
            // ... más campos
            .build();
    }
}
```

### **Controller**

#### **TicketMesaAyudaController**
```java
@RestController
@RequestMapping("/api/mesa-ayuda")
@Slf4j
public class TicketMesaAyudaController {
    @Autowired
    private TicketMesaAyudaService ticketService;

    @GetMapping("/motivos")
    public ResponseEntity<List<MotivoMesaAyudaDTO>> obtenerMotivos() {
        log.info("GET /api/mesa-ayuda/motivos");
        return ResponseEntity.ok(ticketService.obtenerMotivos());
    }

    @PostMapping("/tickets")
    public ResponseEntity<TicketMesaAyudaResponseDTO> crearTicket(
            @RequestBody TicketMesaAyudaRequestDTO request) {
        log.info("POST /api/mesa-ayuda/tickets");
        return ResponseEntity.ok(ticketService.crearTicket(request));
    }
}
```

---

## 🔄 Flujo Completo

### **Paso a paso: Crear un ticket**

1. **Frontend - Abrir Modal**
   ```
   Usuario → Click en botón Ticket
   → useEffect detecta isOpen=true
   → Llama obtenerMotivos()
   ```

2. **Backend - Obtener motivos**
   ```
   GET /api/mesa-ayuda/motivos
   → TicketMesaAyudaService.obtenerMotivos()
   → MotivoRepository.findByActivoTrueOrderByOrdenAsc()
   → SELECT * FROM dim_motivos_mesadeayuda WHERE activo = TRUE
   → Retorna lista JSON
   ```

3. **Frontend - Llenar formulario**
   ```
   Usuario selecciona motivo
   → setIdMotivo(1)
   → Muestra: "PROFESIONAL DE SALUD SOLICITA CITAR PACIENTE ADICIONAL"
   → Usuario escribe observaciones
   → Usuario selecciona prioridad
   ```

4. **Frontend - Enviar**
   ```
   Click "Crear Ticket"
   → handleSubmit() valida idMotivo
   → POST /api/mesa-ayuda/tickets
   → Body incluye: idMotivo, observaciones, prioridad, médico, paciente
   ```

5. **Backend - Generar número**
   ```
   POST /api/mesa-ayuda/tickets
   → generarNumeroTicket()
   → SELECT * FROM dim_secuencia_tickets WHERE anio = 2026
   → UPDATE dim_secuencia_tickets SET contador = contador + 1 WHERE anio = 2026
   → contador: 5 → 6
   → numeroTicket = "006-2026"
   ```

6. **Backend - Guardar ticket**
   ```
   INSERT INTO dim_ticket_mesa_ayuda
   (titulo, numero_ticket, id_motivo, observaciones, estado, prioridad, ...)
   VALUES
   ('PROFESIONAL DE SALUD SOLICITA...', '006-2026', 1, '...', 'ABIERTO', 'MEDIA', ...)
   ```

7. **Backend - Retornar respuesta**
   ```
   TicketMesaAyudaResponseDTO {
     numeroTicket: "006-2026",
     titulo: "PROFESIONAL DE SALUD SOLICITA...",
     estado: "ABIERTO",
     prioridad: "MEDIA",
     nombreMotivo: "PROFESIONAL DE SALUD...",
     observaciones: "..."
   }
   ```

8. **Frontend - Mostrar éxito**
   ```
   setSuccess(true)
   setTicketCreado(response.data)
   Mostrar: "✅ Ticket creado exitosamente
             Número de Ticket: 006-2026"
   setTimeout 2s → onSuccess() → onClose()
   ```

---

## 🛡️ Consideraciones de Seguridad

### **Integridad Referencial**
- FK `id_motivo` → ON DELETE SET NULL (si se elimina motivo, ticket permanece)
- No permite crear ticket con motivo que no existe
- Índices para búsqueda rápida

### **Thread-Safety**
- UPDATE nativo (no read-modify-write) para incrementar contador
- Una sola transacción por ticket
- No permite números duplicados (UNIQUE constraint)

### **Auditoría**
- `fecha_creacion`, `fecha_actualizacion`, `deleted_at`
- Campo `numero_ticket` para trazabilidad
- Búsqueda rápida por número usando índice

---

## 📊 Estadísticas

### **Datos Estáticos**
- **dim_motivos_mesadeayuda:** 7 registros (FIJOS)
- **dim_secuencia_tickets:** 1 registro por año

### **Datos Dinámicos**
- **dim_ticket_mesa_ayuda:** Crece con cada ticket
- Promedio: ~100-500 tickets/mes (estimado)
- Año 2026: 001-999 posibles

---

## 🔗 Cómo Usar Este Documento

### **Para Desarrolladores Frontend**
→ Lee: **Diagrama de Secuencia** + **Flujo Completo**

### **Para Desarrolladores Backend**
→ Lee: **Diagrama de Clases** + **DTOs** + **Service**

### **Para Arquitectos**
→ Lee: **Diagrama ER** + **Estructura de BD** + **Relaciones**

### **Para DBAs**
→ Lee: **Estructura de Base de Datos** + **Índices**

---

## 📞 Contacto

- **Versión:** v1.64.0 (2026-02-18)
- **Última Actualización:** 2026-02-19
- **Autor:** Styp Canto Rondón
- **Módulo:** Mesa de Ayuda (Help Desk)

---

**¡Documentación Completa! 📚**
