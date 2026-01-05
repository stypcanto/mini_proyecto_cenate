# Plan de Implementación: Módulo de Disponibilidad de Turnos Médicos + Integración con Horarios Chatbot

> **Sistema de Telemedicina - EsSalud | Módulo de Gestión de Disponibilidad de Turnos**
> **Versión:** 2.0.0 (OPTIMIZADO)
> **Fecha:** 2026-01-03
> **Autor:** Ing. Styp Canto Rondón

---

## 🎯 RESUMEN EJECUTIVO

### Objetivo General
Implementar un módulo completo que permita a los médicos declarar su disponibilidad mensual mediante turnos (Mañana, Tarde, Turno Completo) con validación automática de 150 horas mínimas, revisión por coordinadores, **e integración opcional con el sistema existente de horarios del chatbot (`ctr_horario`)** para sincronizar disponibilidades aprobadas con la generación automática de slots de citas.

### Alcance Ampliado (v2.0)
- **Usuarios afectados:** Rol MEDICO, Rol COORDINADOR, Sistema CHATBOT
- **Módulos:** Backend (Spring Boot), Frontend (React), Integración BD
- **Base de datos:**
  - 2 nuevas tablas principales (`disponibilidad_medica`, `detalle_disponibilidad`)
  - 1 tabla de sincronización (`sincronizacion_horario_log`)
  - 1 vista comparativa (`vw_disponibilidad_vs_horario`)
- **Impacto:** Alta - Nueva funcionalidad crítica para planificación de turnos + integración con chatbot productivo

### ⚠️ IMPORTANTE: Dos Sistemas Diferentes

Este plan integra **dos sistemas complementarios pero independientes**:

| Sistema | Propósito | Usuarios | Estado |
|---------|-----------|----------|--------|
| **`disponibilidad_medica`** (NUEVO) | Declaración voluntaria de médicos con validación 150h | Médicos + Coordinadores | 📋 Por implementar |
| **`ctr_horario`** (EXISTENTE) | Carga operativa de slots para chatbot | Coordinadores | ✅ Producción |

**Estrategia de integración:** Sistemas independientes con sincronización manual opcional controlada por coordinador.

---

## 📚 ÍNDICE

1. [Requisitos Funcionales](#1-requisitos-funcionales)
2. [Arquitectura de Solución](#2-arquitectura-de-solución)
3. [Componentes Backend - Disponibilidad Médica](#3-componentes-backend---disponibilidad-médica)
4. [Componentes Backend - Integración con Horarios](#4-componentes-backend---integración-con-horarios)
5. [Componentes Frontend](#5-componentes-frontend)
6. [Integración con Sistema de Horarios Chatbot](#6-integración-con-sistema-de-horarios-chatbot)
7. [Plan de Implementación](#7-plan-de-implementación)
8. [Validaciones Críticas](#8-validaciones-críticas)
9. [Riesgos y Mitigación](#9-riesgos-y-mitigación)
10. [Criterios de Aceptación](#10-criterios-de-aceptación)

---

## 1. REQUISITOS FUNCIONALES

### 1.1 Requisitos de Negocio

#### RN-01: Horas por Turno según Régimen Laboral

**Horas Asistenciales Directas:**
- **Régimen 728/CAS:** Mañana=4h, Tarde=4h, Completo=8h
- **Régimen Locador:** Mañana=6h, Tarde=6h, Completo=12h
- Se obtiene consultando: `PersonalCnt.regimenLaboral.descRegLab`

**Horas Sanitarias Adicionales (solo 728/CAS):**
- El profesional de salud con **Régimen 728/CAS** tiene **2 horas sanitarias por día trabajado**:
  - **1 hora de trabajo asistencial:** Telemonitoreo
  - **1 hora:** Trabajo administrativo
- Estas horas **se suman automáticamente** a la producción para llegar a las 150 horas/mes
- **No aplica para Régimen Locador**

**Ejemplo de cálculo (Régimen 728/CAS):**
```
Médico trabaja 22 días:
- 10 días Turno Completo (8h) = 80h asistenciales
- 12 días Turno Mañana (4h) = 48h asistenciales
- Subtotal asistencial: 128h
- Horas sanitarias: 22 días × 2h = 44h
- TOTAL: 128h + 44h = 172h ✅ (cumple 150h)
```

#### RN-02: Validación Mínima de Horas
- Todo médico debe completar mínimo **150 horas/mes**
- El total incluye: **horas asistenciales + horas sanitarias** (para 728/CAS)
- El sistema debe calcular automáticamente:
  - Horas asistenciales según turnos marcados
  - Horas sanitarias (2h × días trabajados, solo para 728/CAS)
- No se permite enviar si no cumple el mínimo
- Fórmula:
  ```
  total_horas = horas_asistenciales + (dias_trabajados × 2h, si régimen es 728/CAS)
  ```

#### RN-03: Estados de la Disponibilidad
```
BORRADOR → ENVIADO → REVISADO → [SINCRONIZADO]
```
- **BORRADOR:** Médico puede editar libremente
- **ENVIADO:** Médico puede editar hasta que coordinador marque REVISADO (requiere >= 150 horas)
- **REVISADO:** Solo coordinador puede ajustar turnos
- **SINCRONIZADO:** (Nuevo) Indica que se sincronizó con `ctr_horario` para el chatbot

#### RN-04: Unicidad de Solicitudes
- Un médico solo puede tener **una solicitud por periodo y especialidad**
- Constraint: `UNIQUE(id_pers, periodo, id_servicio)`

#### RN-05: Especialidad por Periodo
- El médico selecciona una especialidad al crear su disponibilidad
- Solo una especialidad por periodo

#### RN-06: Integración Opcional con Chatbot (NUEVO)
- La sincronización con `ctr_horario` es **opcional y manual**
- Solo disponibilidades en estado REVISADO pueden sincronizarse
- Coordinador controla cuándo sincronizar
- Sistema registra auditoría completa de la sincronización

---

## 2. ARQUITECTURA DE SOLUCIÓN

### 2.1 Diagrama de Arquitectura Ampliado

```
┌─────────────────────────────────────────────────────────────────────────┐
│                   FLUJO COMPLETO DEL SISTEMA                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  MÉDICO                        COORDINADOR                   CHATBOT    │
│  ──────                        ────────────                  ────────   │
│  1. Declara disponibilidad     1. Revisa disponibilidad                 │
│  2. Marca turnos M/T/MT        2. Ajusta turnos si necesario            │
│  3. Sistema valida 150h        3. Marca como REVISADO                   │
│  4. Envía solicitud            4. Decide SINCRONIZAR       ┌──────────┐ │
│         ↓                              ↓                   │ctr_horario│ │
│  ┌──────────────────┐         ┌──────────────────┐       │+ det      │ │
│  │disponibilidad_   │ REVISADO│ Sincronización   │═══════>│          │ │
│  │medica + detalle  │════════>│   Horarios       │        │Genera    │ │
│  └──────────────────┘         └──────────────────┘        │SLOTS     │ │
│                                         ↓                  └──────────┘ │
│                          ┌──────────────────────────┐          ↓        │
│                          │sincronizacion_horario_log│     Pacientes    │
│                          │(auditoría completa)      │     agendan      │
│                          └──────────────────────────┘     citas        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Modelo de Datos Completo

#### Tabla: `disponibilidad_medica`
```sql
CREATE TABLE disponibilidad_medica (
    id_disponibilidad BIGSERIAL PRIMARY KEY,
    id_pers BIGINT NOT NULL REFERENCES dim_personal_cnt(id_pers),
    id_servicio BIGINT NOT NULL REFERENCES dim_servicio_essi(id_servicio),
    periodo VARCHAR(6) NOT NULL, -- YYYYMM
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',

    -- Cálculo de horas
    horas_asistenciales DECIMAL(5,2) DEFAULT 0,      -- Horas de turnos M/T/MT
    horas_sanitarias DECIMAL(5,2) DEFAULT 0,         -- 2h × días trabajados (solo 728/CAS)
    total_horas DECIMAL(5,2) DEFAULT 0,              -- asistenciales + sanitarias
    horas_requeridas DECIMAL(5,2) DEFAULT 150.00,

    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_revision TIMESTAMP WITH TIME ZONE,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE,  -- NUEVO
    id_ctr_horario_generado BIGINT,                 -- NUEVO: FK a ctr_horario
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_disponibilidad UNIQUE(id_pers, periodo, id_servicio),
    CONSTRAINT ck_estado CHECK (estado IN ('BORRADOR', 'ENVIADO', 'REVISADO', 'SINCRONIZADO'))
);

CREATE INDEX idx_disponibilidad_periodo ON disponibilidad_medica(periodo);
CREATE INDEX idx_disponibilidad_estado ON disponibilidad_medica(estado);
CREATE INDEX idx_disponibilidad_pers ON disponibilidad_medica(id_pers);
CREATE INDEX idx_disponibilidad_sincronizacion ON disponibilidad_medica(id_ctr_horario_generado);
```

#### Tabla: `detalle_disponibilidad`
```sql
CREATE TABLE detalle_disponibilidad (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    turno VARCHAR(2) NOT NULL, -- M (Mañana), T (Tarde), MT (Completo)
    horas DECIMAL(4,2) NOT NULL,
    ajustado_por BIGINT REFERENCES dim_personal_cnt(id_pers),
    observacion_ajuste TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT ck_turno CHECK (turno IN ('M', 'T', 'MT')),
    CONSTRAINT uq_detalle_fecha UNIQUE(id_disponibilidad, fecha)
);

CREATE INDEX idx_detalle_disponibilidad ON detalle_disponibilidad(id_disponibilidad);
```

#### Tabla: `sincronizacion_horario_log` (NUEVA)
```sql
CREATE TABLE sincronizacion_horario_log (
    id_sincronizacion BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad),
    id_ctr_horario BIGINT REFERENCES ctr_horario(id_ctr_horario),
    tipo_operacion VARCHAR(20) NOT NULL,  -- CREACION, ACTUALIZACION
    resultado VARCHAR(20) NOT NULL,        -- EXITOSO, FALLIDO, PARCIAL
    detalles_operacion JSONB,              -- {dias_sincronizados, turnos_mapeados, etc}
    usuario_sincronizacion VARCHAR(50) NOT NULL,
    fecha_sincronizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    errores TEXT,

    CONSTRAINT ck_tipo_operacion CHECK (tipo_operacion IN ('CREACION', 'ACTUALIZACION')),
    CONSTRAINT ck_resultado CHECK (resultado IN ('EXITOSO', 'FALLIDO', 'PARCIAL'))
);

CREATE INDEX idx_sincronizacion_disponibilidad ON sincronizacion_horario_log(id_disponibilidad);
CREATE INDEX idx_sincronizacion_fecha ON sincronizacion_horario_log(fecha_sincronizacion);
```

#### Vista: `vw_disponibilidad_vs_horario` (NUEVA)
Vista comparativa para validar consistencia entre sistemas.

```sql
CREATE OR REPLACE VIEW vw_disponibilidad_vs_horario AS
SELECT
    dm.id_disponibilidad,
    dm.periodo,
    dm.estado,
    p.nom_pers || ' ' || p.ape_pater_pers || ' ' || p.ape_mater_pers AS nombre_medico,
    s.desc_servicio AS especialidad,
    dm.total_horas AS horas_declaradas,
    COALESCE(
        (SELECT SUM(
            CASE
                WHEN dh.cod_horario = '158' THEN 6
                WHEN dh.cod_horario = '131' THEN 6
                WHEN dh.cod_horario = '200A' THEN 12
                ELSE 0
            END
        )
        FROM ctr_horario ch
        JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario
        JOIN dim_horario dh ON dh.id_horario = chd.id_horario
        WHERE ch.periodo = dm.periodo
          AND ch.id_pers = dm.id_pers
          AND ch.id_servicio = dm.id_servicio),
        0
    ) AS horas_cargadas_chatbot,
    dm.id_ctr_horario_generado,
    dm.fecha_sincronizacion,
    CASE
        WHEN dm.id_ctr_horario_generado IS NULL THEN 'SIN_HORARIO_CARGADO'
        WHEN ABS(dm.total_horas - (SELECT SUM(CASE WHEN dh.cod_horario = '158' THEN 6 WHEN dh.cod_horario = '131' THEN 6 WHEN dh.cod_horario = '200A' THEN 12 ELSE 0 END) FROM ctr_horario ch JOIN ctr_horario_det chd ON chd.id_ctr_horario = ch.id_ctr_horario JOIN dim_horario dh ON dh.id_horario = chd.id_horario WHERE ch.periodo = dm.periodo AND ch.id_pers = dm.id_pers AND ch.id_servicio = dm.id_servicio)) > 10 THEN 'DIFERENCIA_SIGNIFICATIVA'
        ELSE 'CONSISTENTE'
    END AS estado_validacion
FROM disponibilidad_medica dm
INNER JOIN dim_personal_cnt p ON p.id_pers = dm.id_pers
INNER JOIN dim_servicio_essi s ON s.id_servicio = dm.id_servicio
WHERE dm.estado IN ('REVISADO', 'SINCRONIZADO');
```

---

## 3. COMPONENTES BACKEND - DISPONIBILIDAD MÉDICA

### 3.1 Entidades JPA

#### DisponibilidadMedica.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/DisponibilidadMedica.java`

**Atributos adicionales (v2.0):**
```java
@Column(name = "fecha_sincronizacion")
private LocalDateTime fechaSincronizacion;

@Column(name = "id_ctr_horario_generado")
private Long idCtrHorarioGenerado;

// Métodos nuevos
public boolean isSincronizado() {
    return "SINCRONIZADO".equals(estado);
}

public void marcarSincronizado(Long idCtrHorario) {
    this.estado = "SINCRONIZADO";
    this.idCtrHorarioGenerado = idCtrHorario;
    this.fechaSincronizacion = LocalDateTime.now();
}
```

#### DetalleDisponibilidad.java
Sin cambios respecto a v1.0.

### 3.2 DTOs (Data Transfer Objects)

#### DisponibilidadCreateRequest.java
```java
@Data @Builder
public class DisponibilidadCreateRequest {
    @NotNull @Pattern(regexp = "^\\d{6}$")
    private String periodo; // YYYYMM

    @NotNull
    private Long idEspecialidad;

    private String observaciones;

    @Valid
    private List<DetalleDisponibilidadRequest> detalles;
}
```

#### DisponibilidadResponse.java
```java
@Data @Builder
public class DisponibilidadResponse {
    private Long idDisponibilidad;
    private String periodo;
    private String estado;
    private BigDecimal totalHoras;
    private BigDecimal horasRequeridas;

    // Médico
    private Long idPers;
    private String nombreCompleto;
    private String numDocumento;

    // Especialidad
    private Long idEspecialidad;
    private String nombreEspecialidad;

    // Régimen laboral
    private String regimenLaboral;
    private BigDecimal horasPorTurnoManana;
    private BigDecimal horasPorTurnoTarde;
    private BigDecimal horasPorTurnoCompleto;

    // Detalles
    private List<DetalleDisponibilidadResponse> detalles;

    // Indicadores
    private Integer totalDiasDisponibles;
    private Boolean cumpleMinimo;
    private BigDecimal porcentajeCumplimiento;

    // NUEVO v2.0: Sincronización
    private LocalDateTime fechaSincronizacion;
    private Long idCtrHorarioGenerado;
    private Boolean estaSincronizado;
}
```

### 3.3 Repositories

#### DisponibilidadMedicaRepository.java
**Métodos principales:**
```java
// Búsqueda por médico
List<DisponibilidadMedica> findByPersonalIdPersOrderByPeriodoDesc(Long idPers);

// Búsqueda específica
Optional<DisponibilidadMedica> findByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
    Long idPers, String periodo, Long idServicio);

// Existencia
boolean existsByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
    Long idPers, String periodo, Long idServicio);

// Query optimizada con JOIN FETCH
@Query("SELECT d FROM DisponibilidadMedica d " +
       "JOIN FETCH d.personal p " +
       "JOIN FETCH d.especialidad e " +
       "LEFT JOIN FETCH p.regimenLaboral " +
       "WHERE d.idDisponibilidad = :id")
Optional<DisponibilidadMedica> findByIdWithDetails(@Param("id") Long id);

// Solicitudes revisadas por periodo (listas para sincronizar) - NUEVO
@Query("SELECT d FROM DisponibilidadMedica d " +
       "JOIN FETCH d.personal p " +
       "JOIN FETCH d.especialidad e " +
       "WHERE d.periodo = :periodo AND d.estado = 'REVISADO' " +
       "ORDER BY d.fechaRevision ASC")
List<DisponibilidadMedica> findRevisadasByPeriodo(@Param("periodo") String periodo);

// Sincronizadas por periodo - NUEVO
@Query("SELECT d FROM DisponibilidadMedica d " +
       "WHERE d.periodo = :periodo AND d.estado = 'SINCRONIZADO'")
List<DisponibilidadMedica> findSincronizadasByPeriodo(@Param("periodo") String periodo);
```

### 3.4 Services

#### IDisponibilidadService.java
**Métodos para MÉDICO:**
- `crear(DisponibilidadCreateRequest)` - Crear nueva disponibilidad
- `actualizar(Long id, DisponibilidadUpdateRequest)` - Actualizar borrador
- `guardarBorrador(DisponibilidadCreateRequest)` - Guardar/actualizar borrador
- `enviar(Long id)` - Enviar disponibilidad (valida >= 150 horas)
- `listarMisDisponibilidades()` - Listar todas del médico autenticado
- `obtenerMiDisponibilidad(String periodo, Long idEspecialidad)` - Obtener específica
- `validarHoras(Long id)` - Validar cumplimiento de horas
- `eliminar(Long id)` - Eliminar borrador

**Métodos para COORDINADOR:**
- `listarPorPeriodo(String periodo)` - Todas del periodo
- `listarRevisadasPorPeriodo(String periodo)` - Solo REVISADAS (listas para sincronizar) - NUEVO
- `marcarRevisado(Long id)` - Cambiar estado a REVISADO
- `ajustarTurno(Long idDisponibilidad, AjusteTurnoRequest)` - Ajustar turno individual

#### DisponibilidadServiceImpl.java
**Método CRÍTICO - Cálculo de horas:**
```java
private BigDecimal calcularHorasPorTurno(PersonalCnt personal, String turno) {
    RegimenLaboral regimen = personal.getRegimenLaboral();
    if (regimen == null) {
        throw new RuntimeException("El médico no tiene régimen laboral asignado");
    }

    String descRegimen = regimen.getDescRegLab().toUpperCase();

    // Régimen 728 o CAS: M=4h, T=4h, MT=8h
    if (descRegimen.contains("728") || descRegimen.contains("CAS")) {
        return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
    }

    // Régimen Locador: M=6h, T=6h, MT=12h
    if (descRegimen.contains("LOCADOR")) {
        return "MT".equals(turno) ? new BigDecimal("12.00") : new BigDecimal("6.00");
    }

    // Default: 728
    log.warn("Régimen desconocido: {}, usando valores por defecto", descRegimen);
    return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
}
```

**Auditoría:**
Todas las acciones críticas se registran:
- `CREATE_DISPONIBILIDAD` - Médico crea nueva disponibilidad
- `UPDATE_DISPONIBILIDAD` - Médico actualiza borrador
- `SUBMIT_DISPONIBILIDAD` - Médico envía disponibilidad
- `DELETE_DISPONIBILIDAD` - Médico elimina borrador
- `REVIEW_DISPONIBILIDAD` - Coordinador marca como revisado
- `ADJUST_DISPONIBILIDAD` - Coordinador ajusta turno

### 3.5 Controller

#### DisponibilidadController.java
**Ruta:** `/api/disponibilidad`

**Endpoints MÉDICO:**
```java
GET    /api/disponibilidad/mis-disponibilidades
GET    /api/disponibilidad/mi-disponibilidad?periodo={periodo}&idEspecialidad={id}
POST   /api/disponibilidad
POST   /api/disponibilidad/borrador
PUT    /api/disponibilidad/{id}
PUT    /api/disponibilidad/{id}/enviar
GET    /api/disponibilidad/{id}/validar-horas
DELETE /api/disponibilidad/{id}
```
**Protección:** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")`

**Endpoints COORDINADOR:**
```java
GET    /api/disponibilidad/periodo/{periodo}
GET    /api/disponibilidad/periodo/{periodo}/revisadas        // NUEVO v2.0
GET    /api/disponibilidad/{id}
PUT    /api/disponibilidad/{id}/revisar
PUT    /api/disponibilidad/{id}/ajustar-turno
```
**Protección:** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")`

---

## 4. COMPONENTES BACKEND - INTEGRACIÓN CON HORARIOS

### 4.1 Nuevas Entidades JPA

#### SincronizacionHorarioLog.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/SincronizacionHorarioLog.java`

```java
@Entity
@Table(name = "sincronizacion_horario_log")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SincronizacionHorarioLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_sincronizacion")
    private Long idSincronizacion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_disponibilidad", nullable = false)
    private DisponibilidadMedica disponibilidad;

    @Column(name = "id_ctr_horario")
    private Long idCtrHorario;

    @Column(name = "tipo_operacion", nullable = false)
    private String tipoOperacion; // CREACION, ACTUALIZACION

    @Column(name = "resultado", nullable = false)
    private String resultado; // EXITOSO, FALLIDO, PARCIAL

    @Column(name = "detalles_operacion", columnDefinition = "jsonb")
    private String detallesOperacion;

    @Column(name = "usuario_sincronizacion", nullable = false)
    private String usuarioSincronizacion;

    @Column(name = "fecha_sincronizacion")
    private LocalDateTime fechaSincronizacion;

    @Column(name = "errores", columnDefinition = "text")
    private String errores;

    // Métodos de conveniencia
    public boolean isExitoso() {
        return "EXITOSO".equals(resultado);
    }

    public boolean isFallido() {
        return "FALLIDO".equals(resultado);
    }
}
```

#### CtrHorario.java (si no existe)
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/CtrHorario.java`

```java
@Entity
@Table(name = "ctr_horario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CtrHorario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ctr_horario")
    private Long idCtrHorario;

    @Column(name = "periodo")
    private String periodo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pers")
    private PersonalCnt personal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_servicio")
    private DimServicioEssi servicio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area")
    private DimArea area;

    @Column(name = "total_horas")
    private BigDecimal totalHoras;

    @Column(name = "total_dias")
    private Integer totalDias;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "ctrHorario", cascade = CascadeType.ALL)
    private List<CtrHorarioDet> detalles;
}
```

#### CtrHorarioDet.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/CtrHorarioDet.java`

```java
@Entity
@Table(name = "ctr_horario_det")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CtrHorarioDet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ctr_horario_det")
    private Long idCtrHorarioDet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_ctr_horario")
    private CtrHorario ctrHorario;

    @Column(name = "fecha_dia")
    private LocalDate fechaDia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_horario")
    private DimHorario horario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_tip_turno")
    private DimTipoTurno tipoTurno;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### 4.2 Nuevos DTOs

#### SincronizacionRequest.java
```java
@Data
@Builder
public class SincronizacionRequest {
    @NotNull
    private Long idDisponibilidad;

    @NotNull
    private Long idArea;  // Área donde se prestará el servicio

    private String observaciones;
}
```

#### SincronizacionResponse.java
```java
@Data
@Builder
public class SincronizacionResponse {
    private Long idSincronizacion;
    private Long idDisponibilidad;
    private Long idCtrHorario;
    private String tipoOperacion;
    private String resultado;
    private String mensaje;

    // Detalles
    private Integer diasSincronizados;
    private Integer turnosMapeados;
    private BigDecimal horasTotales;

    // Errores
    private List<String> errores;
    private List<String> advertencias;
}
```

#### ComparativoDisponibilidadHorarioResponse.java
```java
@Data
@Builder
public class ComparativoDisponibilidadHorarioResponse {
    private Long idDisponibilidad;
    private String periodo;
    private String nombreMedico;
    private String especialidad;

    // Disponibilidad declarada
    private BigDecimal horasDeclaradas;
    private Integer diasDeclarados;

    // Horario cargado en chatbot
    private BigDecimal horasCargadas;
    private Integer diasCargados;
    private Integer slotsGenerados;

    // Validación
    private String estadoValidacion; // CONSISTENTE, DIFERENCIA_SIGNIFICATIVA, SIN_HORARIO_CARGADO
    private BigDecimal diferencia;

    // Sincronización
    private LocalDateTime fechaSincronizacion;
    private Boolean estaSincronizado;
}
```

### 4.3 Repositories Adicionales

#### SincronizacionHorarioLogRepository.java
```java
public interface SincronizacionHorarioLogRepository extends JpaRepository<SincronizacionHorarioLog, Long> {

    List<SincronizacionHorarioLog> findByDisponibilidadIdDisponibilidadOrderByFechaSincronizacionDesc(Long idDisponibilidad);

    @Query("SELECT s FROM SincronizacionHorarioLog s " +
           "WHERE s.disponibilidad.periodo = :periodo " +
           "ORDER BY s.fechaSincronizacion DESC")
    List<SincronizacionHorarioLog> findByPeriodo(@Param("periodo") String periodo);

    @Query("SELECT s FROM SincronizacionHorarioLog s " +
           "WHERE s.resultado = 'EXITOSO' " +
           "AND s.disponibilidad.periodo = :periodo")
    List<SincronizacionHorarioLog> findSincronizacionesExitosasByPeriodo(@Param("periodo") String periodo);
}
```

#### CtrHorarioRepository.java
```java
public interface CtrHorarioRepository extends JpaRepository<CtrHorario, Long> {

    Optional<CtrHorario> findByPeriodoAndPersonalIdPersAndServicioIdServicio(
        String periodo, Long idPers, Long idServicio);

    List<CtrHorario> findByPeriodo(String periodo);

    boolean existsByPeriodoAndPersonalIdPersAndServicioIdServicio(
        String periodo, Long idPers, Long idServicio);
}
```

#### DimHorarioRepository.java
```java
public interface DimHorarioRepository extends JpaRepository<DimHorario, Long> {
    Optional<DimHorario> findByCodHorario(String codHorario);
}
```

#### DimTipoTurnoRepository.java
```java
public interface DimTipoTurnoRepository extends JpaRepository<DimTipoTurno, Long> {
    Optional<DimTipoTurno> findByCodTipTurno(String codTipTurno);
}
```

### 4.4 Service de Integración

#### IIntegracionHorarioService.java
```java
public interface IIntegracionHorarioService {

    /**
     * Sincroniza una disponibilidad REVISADA con ctr_horario
     */
    SincronizacionResponse sincronizarDisponibilidadAHorario(Long idDisponibilidad, Long idArea);

    /**
     * Obtiene el comparativo entre disponibilidad y horario cargado
     */
    ComparativoDisponibilidadHorarioResponse obtenerComparativo(Long idDisponibilidad);

    /**
     * Obtiene todos los comparativos de un periodo
     */
    List<ComparativoDisponibilidadHorarioResponse> obtenerComparativosPorPeriodo(String periodo);

    /**
     * Obtiene el historial de sincronizaciones de una disponibilidad
     */
    List<SincronizacionHorarioLog> obtenerHistorialSincronizacion(Long idDisponibilidad);
}
```

#### IntegracionHorarioServiceImpl.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/service/integracion/impl/IntegracionHorarioServiceImpl.java`

```java
@Service
@Slf4j
@Transactional
public class IntegracionHorarioServiceImpl implements IIntegracionHorarioService {

    @Autowired private DisponibilidadMedicaRepository disponibilidadRepository;
    @Autowired private DetalleDisponibilidadRepository detalleRepository;
    @Autowired private CtrHorarioRepository ctrHorarioRepository;
    @Autowired private CtrHorarioDetRepository ctrHorarioDetRepository;
    @Autowired private DimHorarioRepository dimHorarioRepository;
    @Autowired private DimTipoTurnoRepository dimTipoTurnoRepository;
    @Autowired private SincronizacionHorarioLogRepository sincronizacionLogRepository;
    @Autowired private AuditLogService auditLogService;

    /**
     * MÉTODO CRÍTICO: Sincroniza disponibilidad REVISADA a ctr_horario
     */
    @Override
    public SincronizacionResponse sincronizarDisponibilidadAHorario(Long idDisponibilidad, Long idArea) {
        log.info("Iniciando sincronización de disponibilidad {} a ctr_horario", idDisponibilidad);

        // 1. Validar estado REVISADO
        DisponibilidadMedica disponibilidad = disponibilidadRepository
            .findByIdWithDetails(idDisponibilidad)
            .orElseThrow(() -> new RuntimeException("Disponibilidad no encontrada"));

        if (!"REVISADO".equals(disponibilidad.getEstado())) {
            throw new IllegalStateException("Solo disponibilidades en estado REVISADO pueden sincronizarse");
        }

        // 2. Obtener detalles
        List<DetalleDisponibilidad> detalles = detalleRepository
            .findByDisponibilidadIdDisponibilidadOrderByFechaAsc(idDisponibilidad);

        if (detalles.isEmpty()) {
            throw new IllegalStateException("No hay turnos para sincronizar");
        }

        // 3. Verificar si ya existe ctr_horario
        Optional<CtrHorario> horarioExistente = ctrHorarioRepository
            .findByPeriodoAndPersonalIdPersAndServicioIdServicio(
                disponibilidad.getPeriodo(),
                disponibilidad.getPersonal().getIdPers(),
                disponibilidad.getEspecialidad().getIdServicio()
            );

        String tipoOperacion = horarioExistente.isPresent() ? "ACTUALIZACION" : "CREACION";

        // 4. Obtener tipo de turno TRN_CHATBOT
        DimTipoTurno tipoTurnoChatbot = dimTipoTurnoRepository
            .findByCodTipTurno("TRN_CHATBOT")
            .orElseThrow(() -> new RuntimeException("Tipo de turno TRN_CHATBOT no encontrado"));

        // 5. Crear o actualizar ctr_horario
        CtrHorario ctrHorario;
        if (horarioExistente.isPresent()) {
            ctrHorario = horarioExistente.get();
            // Eliminar detalles anteriores
            ctrHorarioDetRepository.deleteByIdCtrHorario(ctrHorario.getIdCtrHorario());
        } else {
            ctrHorario = new CtrHorario();
            ctrHorario.setPeriodo(disponibilidad.getPeriodo());
            ctrHorario.setPersonal(disponibilidad.getPersonal());
            ctrHorario.setServicio(disponibilidad.getEspecialidad());
            ctrHorario.setArea(areaRepository.findById(idArea)
                .orElseThrow(() -> new RuntimeException("Área no encontrada")));
            ctrHorario.setCreatedAt(LocalDateTime.now());
        }

        ctrHorario.setTotalHoras(disponibilidad.getTotalHoras());
        ctrHorario.setTotalDias(detalles.size());
        ctrHorario.setUpdatedAt(LocalDateTime.now());
        ctrHorario = ctrHorarioRepository.save(ctrHorario);

        // 6. Mapear turnos y crear ctr_horario_det
        int diasSincronizados = 0;
        int turnosMapeados = 0;
        List<String> errores = new ArrayList<>();

        for (DetalleDisponibilidad detalle : detalles) {
            try {
                Long idHorario = mapearTurnoAHorario(detalle.getTurno());
                DimHorario dimHorario = dimHorarioRepository.findById(idHorario)
                    .orElseThrow(() -> new RuntimeException("Horario no encontrado: " + idHorario));

                CtrHorarioDet ctrHorarioDet = new CtrHorarioDet();
                ctrHorarioDet.setCtrHorario(ctrHorario);
                ctrHorarioDet.setFechaDia(detalle.getFecha());
                ctrHorarioDet.setHorario(dimHorario);
                ctrHorarioDet.setTipoTurno(tipoTurnoChatbot);
                ctrHorarioDet.setCreatedAt(LocalDateTime.now());

                ctrHorarioDetRepository.save(ctrHorarioDet);

                diasSincronizados++;
                turnosMapeados++;

            } catch (Exception e) {
                log.error("Error mapeando turno {} en fecha {}: {}",
                    detalle.getTurno(), detalle.getFecha(), e.getMessage());
                errores.add("Fecha " + detalle.getFecha() + ": " + e.getMessage());
            }
        }

        // 7. Actualizar disponibilidad con estado SINCRONIZADO
        disponibilidad.marcarSincronizado(ctrHorario.getIdCtrHorario());
        disponibilidadRepository.save(disponibilidad);

        // 8. Registrar log de sincronización
        String resultado = errores.isEmpty() ? "EXITOSO" : (diasSincronizados > 0 ? "PARCIAL" : "FALLIDO");

        Map<String, Object> detallesOperacion = Map.of(
            "dias_sincronizados", diasSincronizados,
            "turnos_mapeados", turnosMapeados,
            "total_dias", detalles.size(),
            "horas_totales", disponibilidad.getTotalHoras().toString()
        );

        SincronizacionHorarioLog log = SincronizacionHorarioLog.builder()
            .disponibilidad(disponibilidad)
            .idCtrHorario(ctrHorario.getIdCtrHorario())
            .tipoOperacion(tipoOperacion)
            .resultado(resultado)
            .detallesOperacion(new ObjectMapper().writeValueAsString(detallesOperacion))
            .usuarioSincronizacion(SecurityContextHolder.getContext().getAuthentication().getName())
            .fechaSincronizacion(LocalDateTime.now())
            .errores(errores.isEmpty() ? null : String.join("\n", errores))
            .build();

        sincronizacionLogRepository.save(log);

        // 9. Auditoría
        auditar("SYNC_DISPONIBILIDAD_HORARIO",
            String.format("Disponibilidad %d sincronizada a ctr_horario %d (%s)",
                idDisponibilidad, ctrHorario.getIdCtrHorario(), resultado),
            "INFO", resultado);

        // 10. Construir respuesta
        return SincronizacionResponse.builder()
            .idSincronizacion(log.getIdSincronizacion())
            .idDisponibilidad(idDisponibilidad)
            .idCtrHorario(ctrHorario.getIdCtrHorario())
            .tipoOperacion(tipoOperacion)
            .resultado(resultado)
            .mensaje(resultado.equals("EXITOSO")
                ? "Sincronización exitosa"
                : "Sincronización con errores")
            .diasSincronizados(diasSincronizados)
            .turnosMapeados(turnosMapeados)
            .horasTotales(disponibilidad.getTotalHoras())
            .errores(errores)
            .build();
    }

    /**
     * MÉTODO CRÍTICO: Mapea turnos M/T/MT a cod_horario
     */
    private Long mapearTurnoAHorario(String turno) {
        String codHorario = switch(turno) {
            case "M" -> "158";   // 6h mañana (07:00-13:00)
            case "T" -> "131";   // 6h tarde (13:00-19:00)
            case "MT" -> "200A"; // 12h completo (07:00-19:00)
            default -> throw new IllegalArgumentException("Turno inválido: " + turno);
        };

        return dimHorarioRepository.findByCodHorario(codHorario)
            .orElseThrow(() -> new RuntimeException("Código de horario no encontrado: " + codHorario))
            .getIdHorario();
    }

    @Override
    public ComparativoDisponibilidadHorarioResponse obtenerComparativo(Long idDisponibilidad) {
        // Implementación usando vw_disponibilidad_vs_horario
        // ... código completo en implementación real
    }

    @Override
    public List<ComparativoDisponibilidadHorarioResponse> obtenerComparativosPorPeriodo(String periodo) {
        // Implementación usando vw_disponibilidad_vs_horario
        // ... código completo en implementación real
    }

    @Override
    public List<SincronizacionHorarioLog> obtenerHistorialSincronizacion(Long idDisponibilidad) {
        return sincronizacionLogRepository
            .findByDisponibilidadIdDisponibilidadOrderByFechaSincronizacionDesc(idDisponibilidad);
    }

    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.registrarEvento(usuario, action, "INTEGRACION_HORARIOS", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("No se pudo registrar auditoría: {}", e.getMessage());
        }
    }
}
```

### 4.5 Controller de Integración

#### IntegracionHorarioController.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/api/integracion/IntegracionHorarioController.java`

```java
@RestController
@RequestMapping("/api/integracion-horarios")
@CrossOrigin(origins = "*")
@Slf4j
public class IntegracionHorarioController {

    @Autowired
    private IIntegracionHorarioService integracionService;

    /**
     * Sincronizar disponibilidad REVISADA a ctr_horario
     */
    @PostMapping("/sincronizar")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> sincronizarDisponibilidad(@Valid @RequestBody SincronizacionRequest request) {
        try {
            SincronizacionResponse response = integracionService
                .sincronizarDisponibilidadAHorario(request.getIdDisponibilidad(), request.getIdArea());

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", response,
                "message", response.getMensaje()
            ));

        } catch (IllegalStateException e) {
            log.warn("Error de validación en sincronización: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "status", 400,
                "error", "VALIDACION_ERROR",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error sincronizando disponibilidad", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "error", "SINCRONIZACION_ERROR",
                "message", "Error en la sincronización: " + e.getMessage()
            ));
        }
    }

    /**
     * Obtener comparativo entre disponibilidad y horario cargado
     */
    @GetMapping("/comparativo/{idDisponibilidad}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerComparativo(@PathVariable Long idDisponibilidad) {
        try {
            ComparativoDisponibilidadHorarioResponse comparativo = integracionService
                .obtenerComparativo(idDisponibilidad);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", comparativo
            ));
        } catch (Exception e) {
            log.error("Error obteniendo comparativo", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "error", "ERROR",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtener todos los comparativos de un periodo
     */
    @GetMapping("/comparativo/periodo/{periodo}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerComparativosPorPeriodo(@PathVariable String periodo) {
        try {
            List<ComparativoDisponibilidadHorarioResponse> comparativos = integracionService
                .obtenerComparativosPorPeriodo(periodo);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", comparativos
            ));
        } catch (Exception e) {
            log.error("Error obteniendo comparativos del periodo", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "error", "ERROR",
                "message", e.getMessage()
            ));
        }
    }

    /**
     * Obtener historial de sincronizaciones
     */
    @GetMapping("/historial/{idDisponibilidad}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")
    public ResponseEntity<?> obtenerHistorial(@PathVariable Long idDisponibilidad) {
        try {
            List<SincronizacionHorarioLog> historial = integracionService
                .obtenerHistorialSincronizacion(idDisponibilidad);

            return ResponseEntity.ok(Map.of(
                "status", 200,
                "data", historial
            ));
        } catch (Exception e) {
            log.error("Error obteniendo historial", e);
            return ResponseEntity.status(500).body(Map.of(
                "status", 500,
                "error", "ERROR",
                "message", e.getMessage()
            ));
        }
    }
}
```

---

## 5. COMPONENTES FRONTEND

### 5.1 Panel Médico

#### CalendarioDisponibilidad.jsx
**Ruta:** `/frontend/src/pages/roles/medico/CalendarioDisponibilidad.jsx`

**Funcionalidades:**
1. Selector de periodo (mes/año)
2. Selector de especialidad
3. Calendario mensual interactivo con turnos M/T/MT
4. Contador de horas en tiempo real
5. Barra de progreso visual (150 horas)
6. Estados visuales (BORRADOR/ENVIADO/REVISADO/SINCRONIZADO) - **NUEVO**
7. Botones: Guardar Borrador, Enviar

**Estados React adicionales (v2.0):**
```javascript
const [estaSincronizado, setEstaSincronizado] = useState(false);
const [fechaSincronizacion, setFechaSincronizacion] = useState(null);
```

**Indicador visual de sincronización:**
```jsx
{estaSincronizado && (
  <div className="bg-green-50 border-l-4 border-green-400 p-4">
    <div className="flex items-center">
      <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
      <div>
        <p className="text-sm font-medium text-green-800">
          Sincronizado con el chatbot
        </p>
        <p className="text-xs text-green-600">
          {new Date(fechaSincronizacion).toLocaleString('es-PE')}
        </p>
      </div>
    </div>
  </div>
)}
```

### 5.2 Panel Coordinador

#### RevisionDisponibilidad.jsx
**Ruta:** `/frontend/src/pages/roles/coordinador/RevisionDisponibilidad.jsx`

**Funcionalidades:**
1. Selector de periodo
2. Filtros (especialidad, búsqueda por médico, estado)
3. Tabla de solicitudes con columnas adicionales:
   - **Estado Sincronización** (badge verde si sincronizado) - NUEVO
   - **Fecha Sincronización** - NUEVO
4. Modal de revisión con:
   - Calendario del médico
   - Opciones de ajuste de turnos
   - **Botón "Sincronizar con Chatbot"** (solo si estado = REVISADO) - NUEVO
   - **Comparativo de horas** (disponibilidad vs chatbot) - NUEVO
5. Botón "Marcar como Revisado"

**Nuevo componente hijo: ModalSincronizacion.jsx**

```jsx
const ModalSincronizacion = ({ disponibilidad, onSincronizar, onClose }) => {
  const [idArea, setIdArea] = useState('');
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSincronizar = async () => {
    setLoading(true);
    try {
      const response = await integracionHorarioService.sincronizar({
        idDisponibilidad: disponibilidad.idDisponibilidad,
        idArea: idArea
      });

      toast.success(`Sincronización ${response.data.resultado}: ${response.data.diasSincronizados} días, ${response.data.turnosMapeados} turnos`);
      onSincronizar();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error en la sincronización');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Sincronizar con Chatbot</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Área de atención
          </label>
          <select
            value={idArea}
            onChange={(e) => setIdArea(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="">Seleccione área...</option>
            {areas.map(area => (
              <option key={area.idArea} value={area.idArea}>
                {area.descArea}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-blue-50 p-3 rounded-md mb-4">
          <p className="text-sm text-blue-800">
            <strong>Médico:</strong> {disponibilidad.nombreCompleto}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Periodo:</strong> {disponibilidad.periodo}
          </p>
          <p className="text-sm text-blue-800">
            <strong>Total horas:</strong> {disponibilidad.totalHoras}h
          </p>
          <p className="text-sm text-blue-800">
            <strong>Días disponibles:</strong> {disponibilidad.totalDiasDisponibles}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSincronizar}
            disabled={!idArea || loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar'}
          </button>
        </div>
      </div>
    </div>
  );
};
```

#### ComparativoDisponibilidadHorario.jsx (NUEVO)
**Ruta:** `/frontend/src/pages/roles/coordinador/ComparativoDisponibilidadHorario.jsx`

```jsx
const ComparativoDisponibilidadHorario = ({ periodo }) => {
  const [comparativos, setComparativos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarComparativos = async () => {
      try {
        const response = await integracionHorarioService.obtenerComparativosPorPeriodo(periodo);
        setComparativos(response.data);
      } catch (error) {
        console.error('Error cargando comparativos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (periodo) {
      cargarComparativos();
    }
  }, [periodo]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Comparativo: Disponibilidad vs Horarios Chatbot
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Médico
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Especialidad
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Horas Declaradas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Horas Chatbot
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Slots
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {comparativos.map((comp) => (
              <tr key={comp.idDisponibilidad}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {comp.nombreMedico}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {comp.especialidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {comp.horasDeclaradas}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {comp.horasCargadas}h
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  {comp.slotsGenerados}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    comp.estadoValidacion === 'CONSISTENTE'
                      ? 'bg-green-100 text-green-800'
                      : comp.estadoValidacion === 'DIFERENCIA_SIGNIFICATIVA'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {comp.estadoValidacion}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

### 5.3 Servicios API (Actualizados)

#### disponibilidadService.js
```javascript
import api from './apiClient';

export const disponibilidadService = {
  // MÉDICO
  listarMisDisponibilidades: () =>
    api.get('/disponibilidad/mis-disponibilidades'),

  obtenerMiDisponibilidad: (periodo, idEspecialidad) =>
    api.get(`/disponibilidad/mi-disponibilidad?periodo=${periodo}&idEspecialidad=${idEspecialidad}`),

  crear: (request) => api.post('/disponibilidad', request),

  guardarBorrador: (request) => api.post('/disponibilidad/borrador', request),

  actualizar: (id, request) => api.put(`/disponibilidad/${id}`, request),

  enviar: (id) => api.put(`/disponibilidad/${id}/enviar`),

  validarHoras: (id) => api.get(`/disponibilidad/${id}/validar-horas`),

  eliminar: (id) => api.delete(`/disponibilidad/${id}`),

  // COORDINADOR
  listarPorPeriodo: (periodo) => api.get(`/disponibilidad/periodo/${periodo}`),

  listarRevisadas: (periodo) => api.get(`/disponibilidad/periodo/${periodo}/revisadas`), // NUEVO

  obtenerPorId: (id) => api.get(`/disponibilidad/${id}`),

  marcarRevisado: (id) => api.put(`/disponibilidad/${id}/revisar`),

  ajustarTurno: (id, request) => api.put(`/disponibilidad/${id}/ajustar-turno`, request),
};
```

#### integracionHorarioService.js (NUEVO)
```javascript
import api from './apiClient';

export const integracionHorarioService = {
  // Sincronizar disponibilidad REVISADA a ctr_horario
  sincronizar: (request) => api.post('/integracion-horarios/sincronizar', request),

  // Obtener comparativo
  obtenerComparativo: (idDisponibilidad) =>
    api.get(`/integracion-horarios/comparativo/${idDisponibilidad}`),

  // Obtener todos los comparativos de un periodo
  obtenerComparativosPorPeriodo: (periodo) =>
    api.get(`/integracion-horarios/comparativo/periodo/${periodo}`),

  // Obtener historial de sincronizaciones
  obtenerHistorial: (idDisponibilidad) =>
    api.get(`/integracion-horarios/historial/${idDisponibilidad}`),
};
```

---

## 6. INTEGRACIÓN CON SISTEMA DE HORARIOS CHATBOT

### 6.1 Estrategia de Integración

**Opción seleccionada:** Sistemas Independientes con Sincronización Manual Opcional

**Justificación:**
- Minimiza riesgo en sistema productivo del chatbot
- Permite validación y control por coordinador
- Sincronización es **explícita y auditada**
- Sistemas pueden evolucionar independientemente

### 6.2 Flujo de Sincronización

```
1. MÉDICO declara disponibilidad → BORRADOR
2. MÉDICO envía disponibilidad (validación 150h) → ENVIADO
3. COORDINADOR revisa y ajusta → REVISADO
4. COORDINADOR decide sincronizar (opcional)
   ↓
   4a. Sistema valida estado REVISADO
   4b. Obtiene TRN_CHATBOT de dim_tipo_turno
   4c. Mapea turnos: M→'158', T→'131', MT→'200A'
   4d. Crea/actualiza ctr_horario + ctr_horario_det
   4e. Marca disponibilidad como SINCRONIZADO
   4f. Registra log completo → SINCRONIZADO
5. CHATBOT genera slots automáticamente desde ctr_horario
6. PACIENTES agendan citas
```

### 6.3 Mapeo de Turnos

| Turno Disponibilidad | Código Horario | Horario Real | Horas |
|---------------------|----------------|--------------|-------|
| M (Mañana) | 158 | 07:00 - 13:00 | 6h |
| T (Tarde) | 131 | 13:00 - 19:00 | 6h |
| MT (Completo) | 200A | 07:00 - 19:00 | 12h |

**CRÍTICO:** Siempre usar `TRN_CHATBOT` como `id_tip_turno` para que los slots aparezcan en el chatbot.

### 6.4 Validaciones de Consistencia

La vista `vw_disponibilidad_vs_horario` permite detectar:

- ✅ **CONSISTENTE:** Horas coinciden (diferencia < 10h)
- ⚠️ **DIFERENCIA_SIGNIFICATIVA:** Diferencia >= 10 horas
- ❌ **SIN_HORARIO_CARGADO:** Disponibilidad REVISADA pero no sincronizada

### 6.5 Troubleshooting de Integración

**Problema:** Slots no aparecen en chatbot después de sincronizar

**Solución:**
1. Verificar que se usó `TRN_CHATBOT` en `ctr_horario_det`
2. Verificar que `dim_tipo_turno.stat_tipo_turno = 'A'`
3. Verificar fechas futuras (chatbot solo muestra >= HOY)
4. Verificar que existe `rendimiento_horario` para la especialidad

**Problema:** Error "Código de horario no encontrado"

**Solución:**
1. Verificar que existen en `dim_horario`: cod_horario IN ('158', '131', '200A')
2. Verificar que tienen `stat_horario = 'A'`

---

## 7. PLAN DE IMPLEMENTACIÓN

**📋 Checklist Detallado:** Para seguimiento diario con métricas de progreso, ver: `checklist/03_Checklists/01_checklist_disponibilidad_v2.md`

**Duración total:** 12 días (7 fases)
**Total de tareas:** 38

---

### Fase 1: Backend Base - Disponibilidad Médica (Días 1-2)
**Objetivo:** Crear estructura de base de datos y entidades JPA
**Progreso:** 0/7 tareas completadas

1. [ ] Crear script SQL `/spec/04_BaseDatos/06_scripts/005_disponibilidad_medica_v2.sql`
   - Tablas: `disponibilidad_medica` (con `horas_asistenciales`, `horas_sanitarias`, `total_horas`), `detalle_disponibilidad`
   - Tabla: `sincronizacion_horario_log` (NUEVA v2.0)
   - Vista: `vw_disponibilidad_vs_horario` (NUEVA v2.0)
2. [ ] Ejecutar script en PostgreSQL (10.0.89.13:5432)
3. [ ] Crear `DisponibilidadMedica.java` (con campos de sincronización)
4. [ ] Crear `DetalleDisponibilidad.java`
5. [ ] Crear 6 DTOs + 3 DTOs nuevos de integración
6. [ ] Crear `DisponibilidadMedicaRepository.java`
7. [ ] Crear `DetalleDisponibilidadRepository.java`

**Verificación:**
- [ ] Tablas creadas en BD
- [ ] Entidades compilan sin errores
- [ ] Repositories detectados por Spring

### Fase 2: Backend Lógica - Disponibilidad (Días 3-4)
**Objetivo:** Implementar lógica de negocio completa
**Progreso:** 0/4 tareas completadas

8. [ ] Crear `IDisponibilidadService.java`
9. [ ] Implementar `DisponibilidadServiceImpl.java`
   - **CRÍTICO:** Método `calcularHorasPorTurno()` según régimen (728/CAS: 4/4/8, Locador: 6/6/12)
   - **CRÍTICO:** Método `calcularHorasSanitarias()` (solo 728/CAS: días × 2h)
   - **CRÍTICO:** Método `calcularTotalHoras()` (asistenciales + sanitarias)
   - Validaciones de estado
   - Auditoría completa
10. [ ] Crear `DisponibilidadController.java`
11. [ ] Probar endpoints con Postman/cURL

**Verificación:**
- [ ] Todos los endpoints responden correctamente
- [ ] **Cálculo de horas sanitarias funciona (728/CAS)**
- [ ] Validación de 150 horas funciona
- [ ] Auditoría registra correctamente
- [ ] Estados cambian correctamente

### Fase 3: Backend Integración con Horarios (Días 5-6) - **NUEVO v2.0**
**Objetivo:** Implementar sincronización con `ctr_horario`
**Progreso:** 0/6 tareas completadas

12. [ ] Crear entidades JPA de horarios (7 entidades):
    - `CtrHorario.java`
    - `CtrHorarioDet.java`
    - `DimHorario.java`
    - `DimTipoTurno.java`
    - `SincronizacionHorarioLog.java`
    - `DimArea.java`
    - `CtrPeriodo.java`
13. [ ] Crear repositories de horarios (4 repositories)
14. [ ] Crear `IIntegracionHorarioService.java`
15. [ ] Implementar `IntegracionHorarioServiceImpl.java`
    - **CRÍTICO:** Método `sincronizarDisponibilidadAHorario()`
    - **CRÍTICO:** Método `mapearTurnoAHorario()` (M→158, T→131, MT→200A)
    - Validaciones de estado REVISADO
    - Auditoría completa
16. [ ] Crear `IntegracionHorarioController.java`
17. [ ] Probar sincronización end-to-end

**Verificación:**
- [ ] Sincronización crea/actualiza `ctr_horario` correctamente
- [ ] **Mapeo M→158, T→131, MT→200A funciona**
- [ ] Logs se registran en `sincronizacion_horario_log` con JSONB
- [ ] Estado cambia a SINCRONIZADO
- [ ] **Slots aparecen en `vw_slots_disponibles_chatbot`** ⭐

### Fase 4: Frontend Médico (Días 7-8)
**Objetivo:** Interfaz de calendario para médicos
**Progreso:** 0/5 tareas completadas

18. [ ] Crear `disponibilidadService.js`
19. [ ] Crear `CalendarioDisponibilidad.jsx`
    - Calendario interactivo
    - **Cálculo en tiempo real (asistenciales + sanitarias)**
    - **Desglose visible de horas**
    - Validación visual de 150 horas
    - Indicador de sincronización (NUEVO v2.0)
20. [ ] Integrar con backend
21. [ ] Agregar ruta en `App.js`
22. [ ] Agregar card en `DashboardMedico.jsx`

**Verificación:**
- [ ] Calendario se renderiza correctamente
- [ ] Turnos se marcan/desmarcan
- [ ] **Horas asistenciales + sanitarias calculan en tiempo real**
- [ ] **Desglose de horas es visible**
- [ ] Envío funciona correctamente
- [ ] Badge de sincronización muestra correctamente

### Fase 5: Frontend Coordinador (Días 9-10) - **AMPLIADO v2.0**
**Objetivo:** Panel de revisión con integración
**Progreso:** 0/6 tareas completadas

23. [ ] Crear `integracionHorarioService.js` (NUEVO)
24. [ ] Crear `RevisionDisponibilidad.jsx`
    - Lista de solicitudes
    - Modal de revisión
    - Ajuste de turnos
    - **Modal de sincronización** (NUEVO)
25. [ ] Crear `ComparativoDisponibilidadHorario.jsx` (NUEVO)
26. [ ] Integrar con backend
27. [ ] Agregar ruta en `App.js`
28. [ ] Agregar opción en `DashboardCoordinador.jsx`

**Verificación:**
- [ ] Lista carga correctamente
- [ ] Modal muestra disponibilidad
- [ ] Ajustes se guardan
- [ ] Marcar como REVISADO funciona
- [ ] **Sincronización manual funciona** (NUEVO)
- [ ] **Vista comparativa muestra datos correctos** (NUEVO)

### Fase 6: Pruebas Integrales (Día 11) - **AMPLIADO v2.0**
**Objetivo:** Validar funcionamiento completo
**Progreso:** 0/6 tareas completadas

29. [ ] Pruebas end-to-end completas
30. [ ] Validación de cálculo de horas según régimen
    - [ ] Médico 728/CAS: asistenciales + sanitarias (2h × días)
    - [ ] Médico Locador: solo asistenciales
31. [ ] Validación de permisos y estados
32. [ ] **Validación de sincronización con chatbot** (NUEVO)
33. [ ] **Validación de slots generados** (NUEVO)
    - [ ] Ejecutar query en `vw_slots_disponibles_chatbot`
    - [ ] Verificar que slots aparecen para médico sincronizado
34. [ ] Ajustes de UI/UX

**Escenarios de prueba adicionales (v2.0):**
- [ ] Sincronizar disponibilidad REVISADA
- [ ] Verificar slots en `vw_slots_disponibles_chatbot`
- [ ] Actualizar disponibilidad ya sincronizada
- [ ] Verificar log de sincronización
- [ ] Validar vista comparativa
- [ ] Intentar sincronizar disponibilidad NO REVISADA (debe fallar)

### Fase 7: Documentación (Día 12)
**Objetivo:** Actualizar documentación del sistema
**Progreso:** 0/3 tareas completadas

35. [ ] Actualizar `CLAUDE.md`
36. [ ] Actualizar `spec/01_Backend/01_api_endpoints.md`
37. [ ] Actualizar `checklist/01_Historial/01_changelog.md`
38. [ ] (Opcional) Crear manual de usuario coordinador

### 📊 PROGRESO TOTAL DEL PLAN

**Tareas completadas:** 0 / 38
**Progreso general:** [░░░░░░░░░░░░░░░░░░░░] 0%

**Seguimiento detallado:** Ver `checklist/03_Checklists/01_checklist_disponibilidad_v2.md`

---

## 8. VALIDACIONES CRÍTICAS

### 8.1 Backend - Disponibilidad
- ✅ `totalHoras >= 150` antes de permitir cambiar a ENVIADO
- ✅ **Calcular `horas_asistenciales` según turnos marcados**
- ✅ **Calcular `horas_sanitarias` = días_trabajados × 2h (solo si régimen es 728/CAS)**
- ✅ **`total_horas = horas_asistenciales + horas_sanitarias`**
- ✅ Médico solo puede editar estados BORRADOR o ENVIADO
- ✅ REVISADO no es editable por médico
- ✅ Coordinador puede ajustar cualquier estado
- ✅ Una solicitud por (médico, periodo, especialidad)
- ✅ Validar que `PersonalCnt` tenga `RegimenLaboral` asignado
- ✅ Auditar todas las operaciones críticas

### 8.2 Backend - Integración con Horarios (NUEVO v2.0)
- ✅ Solo disponibilidades en estado REVISADO pueden sincronizarse
- ✅ Validar que existe `TRN_CHATBOT` en `dim_tipo_turno`
- ✅ Validar que existen códigos de horario: 158, 131, 200A
- ✅ Mapeo correcto de turnos M/T/MT a cod_horario
- ✅ Registrar log completo de sincronización
- ✅ Actualizar estado a SINCRONIZADO después de sincronizar
- ✅ Permitir actualización de `ctr_horario` ya existente
- ✅ Auditar sincronización con resultado (EXITOSO/FALLIDO/PARCIAL)

### 8.3 Frontend
- ✅ **Calcular horas en tiempo real según régimen:**
  - Horas asistenciales según turnos marcados
  - Horas sanitarias (2h × días trabajados, solo 728/CAS)
  - Total = asistenciales + sanitarias
- ✅ **Mostrar desglose de horas visible:**
  - "Horas asistenciales: XXh"
  - "Horas sanitarias: XXh (solo 728/CAS)"
  - "Total: XXh / 150h"
- ✅ Deshabilitar "Enviar" si no cumple 150 horas
- ✅ Alertas visuales (barra de progreso, colores)
- ✅ Confirmación antes de marcar como REVISADO
- ✅ Mostrar indicador de estado (BORRADOR/ENVIADO/REVISADO/**SINCRONIZADO**)
- ✅ Bloquear edición en estado REVISADO
- ✅ **Mostrar badge de sincronización si aplica** (NUEVO)
- ✅ **Confirmar antes de sincronizar con chatbot** (NUEVO)
- ✅ **Mostrar comparativo horas declaradas vs cargadas** (NUEVO)

---

## 9. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Médicos no tienen `RegimenLaboral` asignado | Media | Alto | Validar en service y mostrar error claro |
| **Cálculo incorrecto de horas sanitarias (728/CAS)** | **Media** | **Crítico** | **Tests unitarios exhaustivos, validar régimen, mostrar desglose en UI** |
| Cálculo incorrecto de horas asistenciales | Baja | Crítico | Tests unitarios exhaustivos + validación manual |
| Conflictos de concurrencia (2 coordinadores ajustan a la vez) | Baja | Medio | Usar `@Version` en entidad para optimistic locking |
| Performance en queries con muchos detalles | Media | Medio | JOIN FETCH + paginación si es necesario |
| **Sincronización afecta chatbot productivo** | **Media** | **Crítico** | **Sincronización manual controlada + log completo + rollback si falla** |
| **Código de horario incorrecto** | **Baja** | **Crítico** | **Validar existencia de 158/131/200A al inicio, mapeo hardcodeado** |
| **Slots no aparecen en chatbot** | **Media** | **Alto** | **Validar TRN_CHATBOT, verificar rendimiento_horario, troubleshooting guide** |
| **Inconsistencia entre sistemas** | **Media** | **Medio** | **Vista comparativa, alertas en UI, auditoría completa** |

---

## 10. CRITERIOS DE ACEPTACIÓN

### CA-01: Médico puede crear disponibilidad
- ✅ Selecciona periodo y especialidad
- ✅ Marca turnos en calendario
- ✅ Horas se calculan automáticamente
- ✅ Puede guardar borrador en cualquier momento
- ✅ Solo puede enviar si totalHoras >= 150

### CA-02: Cálculo correcto de horas
- ✅ **Médico régimen 728/CAS:**
  - Horas asistenciales: M=4h, T=4h, MT=8h
  - Horas sanitarias: 2h × días trabajados (telemonitoreo 1h + administrativa 1h)
  - Total = horas asistenciales + horas sanitarias
- ✅ **Médico régimen Locador:**
  - Horas asistenciales: M=6h, T=6h, MT=12h
  - Sin horas sanitarias
  - Total = horas asistenciales
- ✅ Total se actualiza en tiempo real
- ✅ Frontend muestra desglose: asistenciales + sanitarias = total

### CA-03: Coordinador puede revisar
- ✅ Ve lista de solicitudes ENVIADAS
- ✅ Puede abrir modal de revisión
- ✅ Puede ajustar turnos individuales
- ✅ Ajustes quedan registrados con su usuario
- ✅ Puede marcar como REVISADO

### CA-04: Estados funcionan correctamente
- ✅ BORRADOR: Médico edita libremente
- ✅ ENVIADO: Médico puede editar, coordinador puede revisar
- ✅ REVISADO: Solo coordinador puede ajustar
- ✅ **SINCRONIZADO: Indica que se creó horario en chatbot** (NUEVO)

### CA-05: Validaciones funcionan
- ✅ No permite enviar sin 150 horas
- ✅ No permite duplicados (mismo médico, periodo, especialidad)
- ✅ Valida permisos en endpoints
- ✅ **Solo permite sincronizar si estado = REVISADO** (NUEVO)

### CA-06: Auditoría completa
- ✅ Todas las operaciones se registran en `audit_logs`
- ✅ Incluye: usuario, acción, módulo, detalle, nivel, estado
- ✅ **Sincronizaciones se registran en `sincronizacion_horario_log`** (NUEVO)

### CA-07: Integración con Chatbot funciona (NUEVO v2.0)
- ✅ Coordinador puede sincronizar disponibilidad REVISADA
- ✅ Se crea/actualiza `ctr_horario` + `ctr_horario_det` correctamente
- ✅ Turnos se mapean: M→158, T→131, MT→200A
- ✅ Se usa `TRN_CHATBOT` como tipo de turno
- ✅ Slots aparecen en `vw_slots_disponibles_chatbot`
- ✅ Estado cambia a SINCRONIZADO
- ✅ Log registra resultado (EXITOSO/FALLIDO/PARCIAL)
- ✅ Vista comparativa muestra datos correctos
- ✅ Pacientes pueden agendar citas desde chatbot

---

## 11. ARCHIVOS A CREAR/MODIFICAR

### Backend (27 archivos) - **ACTUALIZADO v2.0**

**Scripts SQL:**
```
✅ /spec/04_BaseDatos/06_scripts/005_disponibilidad_medica_v2.sql
```

**Entidades (10):**
```
✅ /backend/src/main/java/com/styp/cenate/model/DisponibilidadMedica.java
✅ /backend/src/main/java/com/styp/cenate/model/DetalleDisponibilidad.java
✅ /backend/src/main/java/com/styp/cenate/model/SincronizacionHorarioLog.java      (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/model/CtrHorario.java                    (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/model/CtrHorarioDet.java                 (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/model/DimHorario.java                    (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/model/DimTipoTurno.java                  (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/model/DimArea.java                       (si no existe)
✅ /backend/src/main/java/com/styp/cenate/model/DimCatalogoHorario.java           (si no existe)
✅ /backend/src/main/java/com/styp/cenate/model/RendimientoHorario.java           (si no existe)
```

**DTOs (9):**
```
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadCreateRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadUpdateRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadResponse.java
✅ /backend/src/main/java/com/styp/cenate/dto/DetalleDisponibilidadRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DetalleDisponibilidadResponse.java
✅ /backend/src/main/java/com/styp/cenate/dto/AjusteTurnoRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/SincronizacionRequest.java                       (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/dto/SincronizacionResponse.java                      (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/dto/ComparativoDisponibilidadHorarioResponse.java   (NUEVO v2.0)
```

**Repositories (8):**
```
✅ /backend/src/main/java/com/styp/cenate/repository/DisponibilidadMedicaRepository.java
✅ /backend/src/main/java/com/styp/cenate/repository/DetalleDisponibilidadRepository.java
✅ /backend/src/main/java/com/styp/cenate/repository/SincronizacionHorarioLogRepository.java  (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/repository/CtrHorarioRepository.java                (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/repository/CtrHorarioDetRepository.java             (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/repository/DimHorarioRepository.java                (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/repository/DimTipoTurnoRepository.java              (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/repository/DimAreaRepository.java                   (si no existe)
```

**Services (4):**
```
✅ /backend/src/main/java/com/styp/cenate/service/disponibilidad/IDisponibilidadService.java
✅ /backend/src/main/java/com/styp/cenate/service/disponibilidad/impl/DisponibilidadServiceImpl.java
✅ /backend/src/main/java/com/styp/cenate/service/integracion/IIntegracionHorarioService.java         (NUEVO v2.0)
✅ /backend/src/main/java/com/styp/cenate/service/integracion/impl/IntegracionHorarioServiceImpl.java (NUEVO v2.0)
```

**Controllers (2):**
```
✅ /backend/src/main/java/com/styp/cenate/api/disponibilidad/DisponibilidadController.java
✅ /backend/src/main/java/com/styp/cenate/api/integracion/IntegracionHorarioController.java    (NUEVO v2.0)
```

### Frontend (6 archivos) - **ACTUALIZADO v2.0**

```
✅ /frontend/src/services/disponibilidadService.js
✅ /frontend/src/services/integracionHorarioService.js                                          (NUEVO v2.0)
✅ /frontend/src/pages/roles/medico/CalendarioDisponibilidad.jsx
✅ /frontend/src/pages/roles/coordinador/RevisionDisponibilidad.jsx
✅ /frontend/src/pages/roles/coordinador/ComparativoDisponibilidadHorario.jsx                   (NUEVO v2.0)
✅ /frontend/src/components/ModalSincronizacion.jsx                                             (NUEVO v2.0)
```

### Modificaciones (2 archivos)
```
✅ /frontend/src/App.js
✅ /frontend/src/pages/roles/medico/DashboardMedico.jsx
```

---

## 12. CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-12-27 | Especificación inicial completa |
| 2.0.0 | 2026-01-03 | **OPTIMIZACIÓN:** Fusión con propuesta de integración con horarios chatbot. Agregadas secciones 4 (Backend Integración), 6 (Integración con Horarios), actualizado modelo de datos, plan de implementación ampliado, 7 entidades nuevas, 2 services nuevos, 1 controller nuevo, 3 DTOs nuevos, vista comparativa, sincronización manual opcional |

---

## 13. DOCUMENTACIÓN RELACIONADA

**IMPORTANTE:** Este plan fusiona la funcionalidad de disponibilidad médica con la integración al sistema de horarios del chatbot. Para información adicional sobre el sistema existente de horarios, consultar:

- **Modelo de Horarios Existente:** `spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`
- **Guía de Integración:** `spec/04_BaseDatos/07_horarios_sistema/02_guia_integracion_horarios.md`
- **README Sistema Horarios:** `spec/04_BaseDatos/07_horarios_sistema/README.md`

---

**Ing. Styp Canto Rondón**
EsSalud Perú - CENATE
2026-01-03
