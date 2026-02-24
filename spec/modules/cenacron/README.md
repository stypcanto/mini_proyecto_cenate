# 📋 Módulo CENACRON — Plan de Implementación

> **Estado:** Planificado — Pendiente de implementación
> **Fecha planificación:** 2026-02-24
> **Versión objetivo:** Por definir (post v1.65.0)

---

## ¿Qué es CENACRON?

**CENACRON** = Estrategia Nacional de Gestión de Pacientes Crónicos de EsSalud/CENATE.

Gestiona el seguimiento continuo de pacientes con enfermedades crónicas no transmisibles (ECNT):
- Hipertensión Arterial (HTA)
- Diabetes Mellitus (DM)
- Enfermedad Pulmonar Obstructiva Crónica (EPOC)
- Asma
- Insuficiencia Cardíaca
- Enfermedad Renal Crónica (ERC)

---

## Actores del Programa

Los **3 actores principales** operan tanto el **ingreso** como el **retiro** del paciente:

| Actor | Responsabilidad |
|-------|----------------|
| **Gestor de Citas** | Admite al paciente, agenda citas en cada etapa, puerta de entrada/salida |
| **Médico General** | Valida si el paciente pertenece al programa (gatekeeper), atiende, deriva |
| **Enfermería** | Realiza seguimiento, registra atención, controla SLA, deriva a especialistas |

> Cualquiera de los 3 actores puede **retirar** a un paciente del programa con un motivo registrado.

---

## Flujo General del Paciente

```
GESTOR DE CITAS          MÉDICO GENERAL         ENFERMERÍA
──────────────           ──────────────         ──────────────
[Admite paciente]   →   [Valida CENACRON]  →   [Atiende]
[Puede retirar]         [Puede retirar]         [Puede retirar]
                        [Deriva especialista]   [Deriva especialista]
                        (opcional)              [Semáforo SLA]
                                                       ↓
                                            NUTRICIÓN + PSICOLOGÍA
                                                       ↓
                                            VISITA COMPLETA
                                                       ↓
                                         [+3 meses → GESTOR DE CITAS]
```

**Meta anual:** 4 visitas completas por paciente (una cada 3 meses).

---

## Fases de Implementación

### Fase 1 — Gestor de Citas: Ingreso y Retiro
**"La puerta de entrada y salida del programa"**

**Funcionalidades a construir:**
- Formulario de **admisión**: registra al paciente en CENACRON
  - DNI, diagnóstico crónico, teléfono, observaciones, licenciada a cargo
- Bandeja de pacientes CENACRON activos
- Indicador de en qué etapa está cada paciente (con médico, con enfermería, etc.)
- Botón **Retirar paciente** con motivo obligatorio:
  - Muerte
  - Cambio de IPRESS definitivo
  - Solicitud expresa del paciente
  - Incumplimiento > 3 meses
  - No cumple criterios clínicos

**Estados generados:**
- `ADMISION_PENDIENTE` → paciente registrado, esperando cita con médico
- `EGRESADO` → paciente retirado del programa

---

### Fase 2 — Médico General: Validación y Atención
**"El gatekeeper del programa"**

**Funcionalidades a construir:**
- Bandeja de pacientes CENACRON asignados al médico
- Checkbox de validación: **¿El paciente SÍ pertenece a CENACRON?**
  - **SÍ** → estado pasa a `PENDIENTE_ENFERMERIA`
  - **NO** → retiro automático con motivo "No cumple criterios CENACRON"
- Botón **Retirar paciente** (desde su vista) con motivo
- Solicitud de **interconsulta a especialista** (opcional, entra a bolsa de espera)

**Estados generados:**
- `PENDIENTE_MED_GENERAL` → asignado al médico
- `VALIDADO_CENACRON` → médico confirmó que es crónico
- `RECHAZADO_CENACRON` → médico descartó, sale del programa
- `PENDIENTE_INTERCONSULTA_MG` → derivado a especialista (en paralelo)

---

### Fase 3 — Enfermería: Seguimiento y Semáforos SLA
**"El control continuo del paciente crónico"**

**Funcionalidades a construir:**
- Bandeja de pacientes que ya pasaron por el médico general
- Registro de atención de enfermería
- Botón **Retirar paciente** (desde su vista) con motivo
- Derivación a especialista (opcional, entra a bolsa de espera)
- **Semáforo de tiempos (SLA)** visible en la tabla:

| Semáforo | Días desde última atención | Significado |
|----------|---------------------------|-------------|
| 🟢 Verde | < 15 días | En norma |
| 🟡 Amarillo | 15 - 30 días | Alerta |
| 🔴 Rojo | 30 - 60 días | Crítico |
| ⚫ Negro | > 60 días | Emergencia |

**Estados generados:**
- `PENDIENTE_ENFERMERIA` → listo para atención de enfermería
- `ATENDIDO_ENFERMERIA` → enfermería completó atención
- `PENDIENTE_INTERCONSULTA_ENF` → derivado a especialista (en paralelo)

---

### Fase 4 — Nutrición, Psicología y Ciclo Recurrente
**"El cierre de visita y el reingreso automático"**

**Funcionalidades a construir:**
- Bandeja de Nutrición: pacientes pendientes de atención nutricional
- Bandeja de Psicología: pacientes pendientes de atención psicológica
- Ambas atenciones son **obligatorias** para cerrar el ciclo (sin orden requerido)
- Cuando AMBAS están completadas → `VISITA_COMPLETADA`
- Sistema calcula: `fecha_proximo_ciclo = fecha_visita_completada + 3 meses`
- En esa fecha → paciente reaparece en bandeja del **Gestor de Citas**
- Tracking de ciclos completados en el año (meta: 4/año)

**Estados generados:**
- `PENDIENTE_NUTRICION` → asignado a nutricionista
- `PENDIENTE_PSICOLOGIA` → asignado a psicólogo
- `VISITA_COMPLETADA` → ciclo cerrado
- `PROXIMO_CICLO_EN_3M` → esperando fecha de reingreso

---

## Criterios de Ingreso al Programa

✅ **Se incluye:**
- Diagnóstico confirmado de ECNT
- Edad ≥ 18 años
- Asegurado activo
- Con teléfono / acceso a telemedicina

❌ **Se excluye:**
- Embarazadas (protocolo especial)
- Con deterioro cognitivo severo
- Sin acceso a dispositivos
- En cuidados paliativos

---

## Motivos de Retiro del Programa

Cualquier actor (Gestor de Citas, Médico o Enfermería) puede retirar al paciente con uno de estos motivos:

| Motivo | Actor típico |
|--------|-------------|
| Muerte | Cualquiera |
| Cambio de IPRESS definitivo | Gestor de Citas |
| Solicitud expresa del paciente | Gestor de Citas |
| Incumplimiento > 3 meses | Enfermería |
| No cumple criterios clínicos CENACRON | Médico General |
| Resolución de la ECNT | Médico General |

---

## Modelo de Datos (Propuesto)

### Tabla principal: `paciente_cenacron_journey`

```sql
CREATE TABLE paciente_cenacron_journey (
    id_journey          BIGSERIAL PRIMARY KEY,
    pk_asegurado        VARCHAR(20) NOT NULL,

    -- Control del journey
    estado_actual       VARCHAR(50) NOT NULL,   -- Ver estados arriba
    numero_visita       INT DEFAULT 1,          -- Ciclo actual (1, 2, 3, 4)
    ciclos_completados  INT DEFAULT 0,

    -- Fechas de cada etapa (para calcular SLA)
    fecha_admision      TIMESTAMP,
    fecha_med_general   TIMESTAMP,
    fecha_enfermeria    TIMESTAMP,
    fecha_nutricion     TIMESTAMP,
    fecha_psicologia    TIMESTAMP,
    fecha_visita_completada TIMESTAMP,
    fecha_proximo_ciclo DATE,                  -- admision + 3 meses

    -- Validación del médico
    validado_cenacron   BOOLEAN DEFAULT FALSE,
    validado_por        VARCHAR(255),
    fecha_validacion    TIMESTAMP,

    -- Egreso
    estado_general      VARCHAR(20),           -- ACTIVO, PAUSADO, EGRESADO
    motivo_egreso       VARCHAR(255),
    egresado_por        VARCHAR(255),          -- Actor que retiró
    fecha_egreso        TIMESTAMP,

    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pk_asegurado) REFERENCES asegurado(pk_asegurado)
);
```

### Tabla de interconsultas: `paciente_cenacron_interconsultas`

```sql
CREATE TABLE paciente_cenacron_interconsultas (
    id_interconsulta        BIGSERIAL PRIMARY KEY,
    id_journey              BIGINT NOT NULL,
    pk_asegurado            VARCHAR(20) NOT NULL,

    derivado_por            VARCHAR(50),        -- 'MED_GENERAL' o 'ENFERMERIA'
    especialidad_solicitada VARCHAR(100),
    motivo_interconsulta    TEXT,

    estado                  VARCHAR(50),        -- PENDIENTE, ASIGNADO, COMPLETADO
    fecha_solicitud         TIMESTAMP,
    fecha_asignacion        TIMESTAMP,
    fecha_atencion          TIMESTAMP,

    especialista_id         BIGINT,
    especialista_nombre     VARCHAR(255),
    recomendaciones         TEXT,

    FOREIGN KEY (id_journey) REFERENCES paciente_cenacron_journey(id_journey)
);
```

---

## Roadmap

| Fase | Alcance | Actor principal | Estado |
|------|---------|----------------|--------|
| **Fase 1** | Admisión + Retiro | Gestor de Citas | 📋 Pendiente |
| **Fase 2** | Validación + Retiro | Médico General | 📋 Pendiente |
| **Fase 3** | Seguimiento + SLA + Retiro | Enfermería | 📋 Pendiente |
| **Fase 4** | Nutrición + Psicología + Ciclos | Nutrición / Psicología | 📋 Pendiente |

> Las fases deben implementarse **en orden**, ya que cada una depende de la anterior.

---

## Archivos relacionados

- `spec/frontend/02_pages/05_modulo_cenacron.md` — Documentación técnica anterior (base)
- `backend/sql/update_estrategia_cenacron.sql` — Script BD estrategia
- `backend/sql/TEST_datos_dashboard_cenacron.sql` — Datos de prueba

---

*Documento creado: 2026-02-24 | Autor: Styp Canto Rondón / Claude Code*
