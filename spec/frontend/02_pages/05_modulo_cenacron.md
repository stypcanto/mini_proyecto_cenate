# 📋 CENACRON - Estrategia de Gestión de Pacientes Crónicos

> Versión: 1.0.0 | Fecha: 2026-01-07 | Estado: Documentación Base

---

## 1. ¿Qué es CENACRON?

**CENACRON** es la **Estrategia Nacional de Gestión de Pacientes Crónicos** implementada por EsSalud a través del Centro Nacional de Telemedicina (CENATE).

### Objetivo Principal
CENACRON es un **paquete integral de atención** que estructura el recorrido completo del paciente crónico a través de múltiples etapas de atención médica:
- **Admisión y Registro** sistemático
- **Validación médica** (gatekeeper en Medicina General)
- **Atención multidisciplinaria coordinada** (Medicina General → Enfermería → Especialidades → Nutrición/Psicología)
- **Telemedicina** y telemonitoreo
- **Ciclos recurrentes** (4 visitas/año)
- **Control de SLA** con semaforización de tiempos

### Enfermedades Incluidas (CENACRON)
- **Hipertensión Arterial (HTA)**
- **Diabetes Mellitus (DM)**
- **Enfermedad Pulmonar Obstructiva Crónica (EPOC)**
- **Asma**
- **Insuficiencia Cardíaca**
- **Enfermedad Renal Crónica (ERC)**
- Otras enfermedades crónicas según normativa

---

## 2. Conceptos Clave

### 2.1 Paciente CENACRON
Un paciente marcado como **`esCronico = true`** en el sistema, que:
- Tiene diagnóstico de al menos una ECNT
- Requiere seguimiento continuo
- Puede recibir telemonitoreo
- Puede participar en programas de atención coordinada

### 2.2 Estrategias (Enfoques de Atención)
Un paciente puede estar asignado a **múltiples estrategias simultáneamente**:

| Estrategia | Descripción | Campo BD |
|-----------|-----------|---------|
| **CENACRON** | Programa crónico nacional | `estrategia_id = 1` |
| **TELEMEDICINA** | Seguimiento remoto | `requiereTelemonitoreo = true` |
| **MULTIDISCIPLINARIO** | Equipo médico coordinado | Tabla `paciente_estrategia` |
| **Otras** | Futuras estrategias | Extensible |

### 2.3 Estados del Paciente en el Patient Journey CENACRON

El paciente transita por los siguientes estados durante cada ciclo de atención:

**Estados de la Primera Visita (Ciclo Completo):**

| Estado | Descripción | Condición de Paso | Actor Responsable |
|--------|-----------|------------------|------------------|
| **ADMISIÓN_PENDIENTE** | Registro inicial en sistema | Datos completos capturados | Gestión de Citas |
| **PENDIENTE_MED_GENERAL** | Asignado a médico general (gatekeeper) | Admisión completada | Gestión de Citas |
| **VALIDACION_CENACRON** | Médico valida pertenencia al programa | Med. General confirma ECNT | Médico General |
| **RECHAZADO_CENACRON** | No cumple criterios CENACRON | Med. General marca "NO pertenece" | Médico General |
| **PENDIENTE_INTERCONSULTA_MG** | Derivado a especialista desde Med. General | Med. General solicita especialista | Medicina General |
| **PENDIENTE_ENFERMERIA** | Listo para atención de enfermería | Med. General aprobó CENACRON | Gestión de Citas |
| **PENDIENTE_INTERCONSULTA_ENF** | Derivado a especialista desde Enfermería | Enfermería solicita especialista | Enfermería |
| **PENDIENTE_ESPECIALIDADES** | En cola de espera para teleinterconsulta | Derivado por Med. General o Enfermería | Coordinador de Especialidades |
| **PENDIENTE_NUTRICION_PSICOLOGIA** | Listo para nutrición y psicología | Enfermería completada | Gestión de Citas |
| **PENDIENTE_NUTRICION** | Asignado a nutricionista | Enfermería completada | Gestión de Citas |
| **PENDIENTE_PSICOLOGIA** | Asignado a psicólogo | Enfermería completada | Gestión de Citas |
| **VISITA_COMPLETADA** | Primera visita ciclo finalizado | Nutrición + Psicología atendidas | Sistema |
| **PROXIMO_CICLO_EN_3M** | Listo para reingreso (después 3 meses) | Visita completada | Sistema (automático) |

**Estados Transversales:**

| Estado | Descripción |
|--------|-----------|
| **ACTIVO** | En seguimiento activo del programa |
| **PAUSADO** | Suspendido temporalmente (enfermedad aguda, etc.) |
| **EGRESADO** | Salida del programa (muerte, cambio IPRESS, solicitud paciente, incumplimiento) |

### 2.4 Roles y Actores en CENACRON

| Rol | Responsabilidad |
|-----|-----------------|
| **Gestión de Citas** | Admisión, registro inicial, asignación de citas |
| **Médico General** | Gatekeeper - valida si paciente pertenece a CENACRON |
| **Medicina General** | Realiza primera atención, puede derivar a especialidades |
| **Enfermería** | Segunda atención - validación y seguimiento de crónicos |
| **Coordinador Especialidades** | Gestiona bolsa de teleinterconsulta |
| **Especialistas** | Atienden interconsultas derivadas |
| **Nutrición** | Tercera atención (parte de cierre de visita) |
| **Psicología** | Tercera atención (parte de cierre de visita) |
| **Coordinador CENACRON** | Monitoreo de SLA, alertas, reportes |

---

## 3. Modelo de Datos

### 3.1 Tabla: `asegurado`
```sql
-- Campos relevantes para CENACRON
SELECT
    pk_asegurado,
    doc_paciente,
    paciente,
    sexo,
    fecnacimpaciente,
    cas_adscripcion,          -- IPRESS
    -- Nuevos campos sugeridos (futuro):
    -- es_cronico BOOLEAN
    -- ultimo_diagnostico_cronico VARCHAR
FROM asegurado;
```

### 3.2 Tabla: `atencion_clinica`
```sql
-- Identificar pacientes CENACRON
SELECT
    id_atencion,
    pk_asegurado,
    diagnostico,              -- Contiene: HIPERTENSION, DIABETES, etc
    cie10_codigo,             -- Código CIE-10 de ECNT
    id_estrategia,            -- FK a tabla estrategias (ID=1 para CENACRON)
    requiere_telemonitoreo,   -- Boolean
    fecha_atencion
FROM atencion_clinica
WHERE id_estrategia = 1        -- Estrategia CENACRON
   OR diagnostico LIKE '%HIPERTENSION%'
   OR diagnostico LIKE '%DIABETES%';
```

### 3.3 Tabla: `paciente_cenacron_journey` (NUEVA - Core del Patient Journey)
```sql
CREATE TABLE paciente_cenacron_journey (
    id_journey BIGSERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(20) NOT NULL,

    -- Datos de admisión (Módulo 1)
    licenciada_a_cargo VARCHAR(255),
    telefonico VARCHAR(20),
    observaciones_admision TEXT,

    -- Estados del journey
    estado_actual VARCHAR(50) NOT NULL,    -- ADMISIÓN_PENDIENTE, PENDIENTE_MED_GENERAL, etc.
    numero_visita INT DEFAULT 1,           -- Qué ciclo es (1, 2, 3, 4 en el año)

    -- Fechas de transición para SLA
    fecha_admision TIMESTAMP,
    fecha_med_general TIMESTAMP,           -- Cuando llegó a Medicina General
    fecha_enfermeria TIMESTAMP,            -- Cuando llegó a Enfermería
    fecha_nutricion TIMESTAMP,
    fecha_psicologia TIMESTAMP,
    fecha_visita_completada TIMESTAMP,     -- Fin del ciclo

    -- Validación CENACRON
    validado_cenacron BOOLEAN DEFAULT FALSE,
    validado_por_medico VARCHAR(255),
    fecha_validacion TIMESTAMP,

    -- Ciclo recurrente
    fecha_proximo_ciclo DATE,              -- Fecha cuando debe reentrar (3 meses)
    ciclos_completados_anio INT DEFAULT 0, -- De 0 a 4

    -- Control transversal
    estado_general VARCHAR(20),            -- ACTIVO, PAUSADO, EGRESADO
    razon_egreso VARCHAR(255),
    fecha_egreso TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (pk_asegurado) REFERENCES asegurado(pk_asegurado),
    UNIQUE(pk_asegurado, numero_visita, YEAR(fecha_admision))
);
```

### 3.4 Tabla: `paciente_cenacron_interconsultas` (NUEVA - Bolsa de Especialidades)
```sql
CREATE TABLE paciente_cenacron_interconsultas (
    id_interconsulta BIGSERIAL PRIMARY KEY,
    id_journey BIGINT NOT NULL,
    pk_asegurado VARCHAR(20) NOT NULL,

    -- Origen de la derivación
    derivado_por VARCHAR(50),             -- 'MED_GENERAL', 'ENFERMERIA'
    especialidad_solicitada VARCHAR(100),
    motivo_interconsulta TEXT,

    -- Estado en bolsa
    estado VARCHAR(50),                   -- PENDIENTE, ASIGNADO, COMPLETADO
    fecha_solicitud TIMESTAMP,
    fecha_asignacion TIMESTAMP,
    fecha_atencion TIMESTAMP,

    -- Especialista asignado
    especialista_id BIGINT,
    especialista_nombre VARCHAR(255),

    -- Hallazgos y recomendaciones
    recomendaciones TEXT,

    FOREIGN KEY (id_journey) REFERENCES paciente_cenacron_journey(id_journey),
    FOREIGN KEY (pk_asegurado) REFERENCES asegurado(pk_asegurado)
);
```

### 3.5 Tabla Propuesta: `paciente_estrategia` (Futuro - Para múltiples estrategias)
```sql
CREATE TABLE paciente_estrategia (
    id_paciente_estrategia BIGSERIAL PRIMARY KEY,
    pk_asegurado VARCHAR(20) NOT NULL,
    id_estrategia BIGINT NOT NULL,      -- FK a tabla estrategias
    estado VARCHAR(20),                  -- ACTIVO, PAUSADO, EGRESADO
    fecha_asignacion DATE,
    fecha_egreso DATE,
    observaciones TEXT,
    FOREIGN KEY (pk_asegurado) REFERENCES asegurado(pk_asegurado),
    FOREIGN KEY (id_estrategia) REFERENCES estrategia(id_estrategia)
);
```

### 3.4 DTO: `NursingWorklistDto`
```java
@Data
public class NursingWorklistDto {
    private String pacienteNombre;
    private String pacienteDni;
    private Integer pacienteEdad;
    private String pacienteSexo;

    // CENACRON
    private boolean esCronico;              // ✅ Actual
    private String diagnostico;             // Ejemplo: "HIPERTENSION"
    private boolean requiereTelemonitoreo;  // ✅ Actual

    // Futuro: múltiples estrategias
    // private List<EstrategiaDto> estrategias;
}
```

---

## 4. Lógica de Identificación CENACRON

### 4.1 En el Backend (`NursingService.java`)

**Criterio Actual:**
```java
boolean esCenacron =
    ID_ESTRATEGIA_CENACRON.equals(med.getIdEstrategia())
    || diagnostico.contains("HIPERTENSION")
    || diagnostico.contains("HIPERTENSIÓN")  // Con acento
    || diagnostico.contains("DIABETES");
```

**Limitaciones:**
- ❌ Solo busca por palabras clave
- ❌ No valida código CIE-10
- ❌ No considera todas las ECNT

**Mejora Futura:**
```java
// Usar tabla de códigos CIE-10 válidos para CENACRON
List<String> codigosECNT = Arrays.asList(
    "I10",      // HTA esencial
    "I11",      // HTA secundaria
    "E10",      // Diabetes tipo 1
    "E11",      // Diabetes tipo 2
    "J44",      // EPOC
    "J45"       // Asma
);

boolean esCenacron = codigosECNT.contains(med.getCie10Codigo());
```

### 4.2 En el Frontend (`MisPacientesEnfermeria.jsx`)

**Visualización Actual:**
```jsx
{paciente.esCronico ? (
  <span className="badge">CENACRON</span>
) : (
  <span>—</span>
)}
```

**Visualización Futura (Múltiples Estrategias):**
```jsx
{paciente.estrategias?.map(est => (
  <span key={est.id} className={`badge ${est.clase}`}>
    {est.nombre}
  </span>
))}
```

---

## 5. Patient Journey: Flujo Integral CENACRON

El programa CENACRON estructura el recorrido del paciente en **7 módulos operacionales** que debe implementar el software:

### 5.1 Módulo 1: Admisión y Registro (Input de Datos)

**Punto de entrada:** Gestión de Citas
**Estado del paciente:** `ADMISIÓN_PENDIENTE` → `PENDIENTE_MED_GENERAL`

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 1: ADMISIÓN Y REGISTRO                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Actor: Gestión de Citas                                    │
│                                                             │
│ Datos Requeridos:                                          │
│ ✓ Licenciada a cargo         (VARCHAR)                    │
│ ✓ DNI del paciente           (VARCHAR)                    │
│ ✓ Nombres y Apellidos        (VARCHAR)                    │
│ ✓ Edad y Género              (INT, VARCHAR)               │
│ ✓ Teléfono/Celular           (VARCHAR)                    │
│ ✓ Observaciones              (TEXT)                       │
│                                                             │
│ Resultado: Registro en BD + Asignación cita Med. General  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Módulo 2: Primera Atención - Medicina General (El "Gatekeeper")

**Punto de entrada:** Médico General recibe cita CENACRON
**Estado del paciente:** `PENDIENTE_MED_GENERAL` → `VALIDACION_CENACRON` o `RECHAZADO_CENACRON`

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 2: MEDICINA GENERAL (GATEKEEPER)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Actor: Médico General                                      │
│                                                             │
│ VALIDACIÓN CRÍTICA:                                        │
│ • Campo CHECKBOX: "¿Paciente pertenece a CENACRON?"       │
│                                                             │
│ IF respuesta = NO:                                         │
│    → Estado: RECHAZADO_CENACRON                           │
│    → Paciente SALE del programa                           │
│    → FIN DEL FLUJO                                         │
│                                                             │
│ IF respuesta = SÍ:                                         │
│    → Estado: VALIDACION_CENACRON → PENDIENTE_ENFERMERIA   │
│    → HABILITA SIGUIENTE ETAPA                             │
│                                                             │
│ SUB-PROCESO: Interconsulta (OPCIONAL)                     │
│ • ¿Requiere ver especialista? SI/NO                       │
│ • Si SI → Estado: PENDIENTE_INTERCONSULTA_MG              │
│        → Entra a BOLSA DE ESPECIALIDADES                  │
│        → Continúa en paralelo con Enfermería              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.3 Módulo 3: Segunda Atención - Enfermería

**Punto de entrada:** Paciente validado por Med. General
**Estado del paciente:** `PENDIENTE_ENFERMERIA` → `PENDIENTE_NUTRICION_PSICOLOGIA`

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 3: ENFERMERÍA                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Actor: Enfermería                                          │
│                                                             │
│ SLA (Regla de Negocio - Tiempo):                          │
│ • Máximo 15 días desde Medicina General → Enfermería     │
│ • DESPUÉS: 15-30 días (Amarillo), 30-60 (Rojo), >60 (Negro)
│                                                             │
│ Acciones:                                                   │
│ • Valida datos crónicos                                    │
│ • Registra atencion_enfermeria                            │
│ • Estado: PENDIENTE → ATENDIDO (en BD)                    │
│                                                             │
│ SUB-PROCESO: Interconsulta (OPCIONAL)                     │
│ • ¿Identifica necesidades adicionales?                    │
│ • Si SÍ → Estado: PENDIENTE_INTERCONSULTA_ENF             │
│        → Entra a BOLSA DE ESPECIALIDADES (en paralelo)    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.4 Módulo 4: Gestión de Interconsultas (Las "Bolsas")

**Punto de entrada:** Derivaciones de Med. General y Enfermería
**Estado del paciente:** `PENDIENTE_INTERCONSULTA_*` → `PENDIENTE_ESPECIALIDADES` → `COMPLETADO_ESPECIALIDADES`

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 4: BOLSA DE TELEINTERCONSULTA DE ESPECIALIDADES      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Actor: Coordinador de Especialidades                       │
│                                                             │
│ Fuentes de Entrada:                                        │
│ 1. Derivados por Medicina General                          │
│ 2. Derivados por Enfermería                                │
│                                                             │
│ Proceso (Cola de Espera):                                  │
│ • Tabla: paciente_cenacron_interconsultas                  │
│ • Estado: PENDIENTE → ASIGNADO → COMPLETADO               │
│                                                             │
│ Acciones del Coordinador:                                  │
│ • Visualiza cola de especialidades                         │
│ • Asigna especialista disponible                           │
│ • Registra fecha de atención                               │
│ • Captura recomendaciones del especialista                 │
│                                                             │
│ Resultado:                                                  │
│ • Paciente vuelve a flujo principal                        │
│ • Interconsulta completada                                 │
│ • Continúa o finaliza según recomendación                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.5 Módulo 5: Tercera Atención - Nutrición y Psicología

**Punto de entrada:** Enfermería completada + Especialidades (si aplica)
**Estado del paciente:** `PENDIENTE_NUTRICION` / `PENDIENTE_PSICOLOGIA` → `VISITA_COMPLETADA`

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 5: NUTRICIÓN Y PSICOLOGÍA (CIERRE DE VISITA)        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Actor: Nutricionista + Psicólogo                           │
│                                                             │
│ Orden: SIN ORDEN ESTRICTO                                  │
│ • Ambos pueden atenderse simultáneamente                   │
│ • Ambos son OBLIGATORIOS para cerrar el ciclo              │
│                                                             │
│ Regla de Negocio:                                          │
│ • Una vez Enfermería COMPLETADA                           │
│ • Sistema crea 2 citas: 1 Nutrición + 1 Psicología       │
│ • Paciente atiende AMBAS (sin orden requerido)            │
│                                                             │
│ Cierre de Visita:                                          │
│ • Cuando AMBAS están COMPLETADAS                          │
│ • Estado: VISITA_COMPLETADA                               │
│ • Marca fin de Primera Visita del Ciclo                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.6 Módulo 6: Ciclo de Vida Recurrente (Cronología)

**Punto de entrada:** Visita completada
**Estado del paciente:** `VISITA_COMPLETADA` → `PROXIMO_CICLO_EN_3M` → Reinicia ciclo

```
┌─────────────────────────────────────────────────────────────┐
│ MÓDULO 6: CICLO RECURRENTE (CRÓNICO)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Naturaleza: PROGRAMA CÍCLICO Y PERMANENTE                 │
│                                                             │
│ Frecuencia de Reingreso:                                   │
│ • Cada ciclo completo = 1 VISITA (General → Enf → Nutr/Psico)
│ • Tiempo entre ciclos: 3 MESES                             │
│                                                             │
│ Meta Anual:                                                 │
│ • El paciente debe completar 4 VISITAS en 12 meses        │
│ • = 4 ciclos × 3 meses = cobertura completa               │
│                                                             │
│ Automatización Requerida:                                  │
│ • Sistema calcula fecha_proximo_ciclo = fecha_visita_completada + 3M
│ • Cuando fecha_proximo_ciclo llega                         │
│ • Sistema AUTOMÁTICAMENTE reinicia ciclo                   │
│ • Crea nuevo registro con numero_visita = numero_anterior + 1
│                                                             │
│ Tracking:                                                   │
│ • Campo: ciclos_completados_anio (0-4)                    │
│ • Sistema proyecta si paciente estará en META              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5.7 Flujo Completo Gráfico (Visión Integral)

```
INICIO
  │
  ├─→ MÓDULO 1: ADMISIÓN Y REGISTRO
  │      ├─ Captura datos básicos
  │      └─ Estado: PENDIENTE_MED_GENERAL
  │
  ├─→ MÓDULO 2: MEDICINA GENERAL (GATEKEEPER)
  │      ├─ ¿PERTENECE A CENACRON? [SI/NO]
  │      │
  │      ├─ SI → VALIDADO_CENACRON → PENDIENTE_ENFERMERIA
  │      │       ├─ ¿REQUIERE ESPECIALISTA? → Bolsa (paralelo)
  │      │       └─ SLA: < 15 días (Verde)
  │      │
  │      └─ NO → RECHAZADO_CENACRON → FIN
  │
  ├─→ MÓDULO 3: ENFERMERÍA (Segunda Atención)
  │      ├─ Valida crónicos
  │      └─ ¿REQUIERE ESPECIALISTA? → Bolsa (paralelo)
  │         SLA: < 15 días desde Med.General
  │
  ├─→ MÓDULO 4: BOLSA DE ESPECIALIDADES (Paralelo)
  │      ├─ Coordinador asigna especialista
  │      ├─ Especialista atiende
  │      └─ Retorna a flujo principal
  │
  ├─→ MÓDULO 5: NUTRICIÓN + PSICOLOGÍA
  │      ├─ NUTRICION (obligatoria)
  │      ├─ PSICOLOGIA (obligatoria)
  │      └─ Ambas COMPLETADAS = CIERRE VISITA
  │
  ├─→ MÓDULO 6: CICLO RECURRENTE
  │      ├─ Calcula fecha_proximo_ciclo (+ 3 meses)
  │      ├─ Almacena datos de Visita #1
  │      └─ Sistema automático reingresa después de 3M
  │
  └─→ REPETIR cada 3 meses (Meta: 4 visitas/año)
```

### 5.8 Flujo Futuro: Gestión de Múltiples Estrategias
```
┌──────────────────────────────────────────────────────┐
│ GESTIÓN DE CITAS (Futuro)                            │
├──────────────────────────────────────────────────────┤
│                                                      │
│ [Información Paciente] [✅ Estrategias]             │
│                                                      │
│ Estrategias Actuales:                               │
│ ☑ CENACRON (Crónico)                                │
│ ☑ TELEMONITOREO                                     │
│ ☐ MULTIDISCIPLINARIO                                │
│                                                      │
│ [+ Agregar Estrategia] [Guardar]                     │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 6. Sistema de Semaforización (SLA y Control de Tiempos)

**CRÍTICO PARA IMPLEMENTACIÓN:** Este es el sistema central de control del programa CENACRON.

### 6.1 Lógica de Semaforización Basada en SLA

Para **CADA TRANSICIÓN** entre etapas, el sistema calcula automáticamente **días transcurridos** desde la última atención:

```
REGLA GENERAL (Entre cualquier etapa):
┌─────────────────────────────────────────────────────────────┐
│ Días desde Última Atención  │ Semáforo │ Descripción        │
├─────────────────────────────┼──────────┼────────────────────┤
│ < 15 días                   │ 🟢 VERDE │ ÓPTIMO - En norma  │
│ 15-30 días                  │ 🟡 AMARILLO │ ALERTA - Retrasado│
│ 30-60 días                  │ 🔴 ROJO  │ CRÍTICO - Muy tarde│
│ > 60 días                   │ ⚫ NEGRO │ EMERGENCIA - Crisis│
└─────────────────────────────┴──────────┴────────────────────┘
```

### 6.2 Transiciones Específicas y SLA

| Transición | Máximo Ideal | 🟢 Verde | 🟡 Amarillo | 🔴 Rojo | ⚫ Negro |
|-----------|-------------|---------|-----------|--------|---------|
| Admisión → Med. General | 15d | 0-15d | 15-30d | 30-60d | >60d |
| Med. General → Enfermería | 15d | 0-15d | 15-30d | 30-60d | >60d |
| Enfermería → Nutrición | 15d | 0-15d | 15-30d | 30-60d | >60d |
| Enfermería → Psicología | 15d | 0-15d | 15-30d | 30-60d | >60d |
| Visita Completada → Próximo Ciclo (3M) | 90d | 0-90d | 90-120d | 120-180d | >180d |

### 6.3 Implementación en Backend (Motor de Reglas)

**Lógica a implementar en cada transición de estado:**

```java
// Pseudocódigo del Motor de Reglas CENACRON
public class CenacronSemaforoEngine {

    public enum EstadoSemaforo {
        VERDE(0, 15),      // 0-15 días
        AMARILLO(15, 30),  // 15-30 días
        ROJO(30, 60),      // 30-60 días
        NEGRO(60, 9999);   // >60 días

        private final int minDias;
        private final int maxDias;

        public static EstadoSemaforo calcular(LocalDateTime ultAtendido) {
            long diasTranscurridos = ChronoUnit.DAYS.between(
                ultAtendido, LocalDateTime.now()
            );

            if (diasTranscurridos < 15) return VERDE;
            if (diasTranscurridos < 30) return AMARILLO;
            if (diasTranscurridos < 60) return ROJO;
            return NEGRO;
        }
    }

    // Automáticamente se ejecuta:
    // 1. En cada cambio de estado
    // 2. En dashboard (polling cada 1h)
    // 3. En alertas (notificación cuando cambia de color)
}
```

### 6.4 Dashboard de Control - Visualización del Semáforo

**El Coordinador CENACRON debe ver una tabla con semaforización en tiempo real:**

```
╔════════════════════════════════════════════════════════════════════════════╗
║           DASHBOARD CENACRON - CONTROL DE SLA EN TIEMPO REAL              ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║ PACIENTE             │ ESTADO ACTUAL        │ SEMÁFORO │ DÍAS │ PRÓXIMA  ║
║ ─────────────────────┼──────────────────────┼──────────┼──────┼─────────  ║
║ Juan Pérez (DNI)    │ Pendiente Enfermería │ 🟢 VERDE │  8d  │ Enf.     ║
║ María López (DNI)   │ Pendiente Especial.  │ 🟡 AMARILLO│ 22d │ Esp.    ║
║ Carlos Gómez (DNI)  │ Pendiente Nutrición  │ 🔴 ROJO  │ 45d  │ Nutri.   ║
║ Ana Rodríguez (DNI) │ Pendiente Psicología │ ⚫ NEGRO  │ 67d  │ Psico.   ║
║                                                                            ║
║ RESUMEN:                                                                  ║
║ ✅ Verde: 245 pacientes   🟡 Amarillo: 89   🔴 Rojo: 34   ⚫ Negro: 12    ║
║                                                                            ║
║ ALERTAS ACTIVAS: 46 pacientes requieren intervención inmediata           ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
```

### 6.5 Sistema de Alertas Automáticas

El software debe generar alertas cuando:

```
1. TRANSICIÓN AMARILLO → ROJO
   • Enviar notificación al Coordinador CENACRON
   • Asunto: "⚠️ Paciente CRÍTICO - SLA vencido"

2. TRANSICIÓN ROJO → NEGRO
   • Enviar escalada a Gerencia
   • Asunto: "🚨 EMERGENCIA - Paciente en crisis de SLA"

3. DIARIO (0:00 hrs)
   • Recalcular todos los semáforos
   • Actualizar dashboard
   • Generar reporte de estado

4. POR DEMANDA (Manual)
   • Botón "Recalcular ahora" en dashboard
   • Para validar cambios recientes
```

---

## 7. Indicadores y Métricas

### 7.1 Indicadores CENACRON
| Indicador | Fórmula | Objetivo |
|-----------|---------|----------|
| **Cobertura** | (Pacientes CENACRON / Total asegurados) × 100 | > 85% |
| **Adherencia** | (Atendidos en 30d / Citados en 30d) × 100 | > 80% |
| **Cumplimiento Telemonitoreo** | (Con telemonitoreo activo / CENACRON) × 100 | > 70% |
| **Reducción Urgencias** | (Urgencias pre-CENACRON - post) / pre × 100 | > 40% |

### 7.2 Dashboard Propuesto (Visión Integral)
```
┌─────────────────────────────────────────────┐
│      DASHBOARD CENACRON                     │
├─────────────────────────────────────────────┤
│ Pacientes CENACRON Activos: 1,234           │
│                                             │
│ ESTADO ACTUAL:                              │
│ 🟢 Verde: 245    🟡 Amarillo: 89           │
│ 🔴 Rojo: 34      ⚫ Negro: 12               │
│                                             │
│ CICLOS COMPLETADOS ESTE AÑO:                │
│ Ciclo 1 (Q1): ✅ 892/1,234 (72%)           │
│ Ciclo 2 (Q2): 🟡 456/1,234 (37%)           │
│ Ciclo 3 (Q3): ⏳ Próximo mes               │
│ Ciclo 4 (Q4): ⏳ Futuro                    │
│                                             │
│ INDICADORES:                                │
│ Tasa Adherencia: 87% (Meta: >80%)          │
│ Urgencias Evitadas: 156 (Meta: >40%)       │
│ Cobertura: 73% (Meta: >85%)                │
│                                             │
│ ALERTAS ACTIVAS: 46 pacientes requieren    │
│ intervención inmediata                      │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 8. Protocolos y Guías

### 8.1 Protocolo de Telemonitoreo CENACRON
**Frecuencia según ECNT:**

| ECNT | Frecuencia Telemonitoreo | Parámetros |
|------|-------------------------|-----------|
| **HTA** | 2-3 veces/semana | PA, FC, peso |
| **Diabetes** | 1-2 veces/semana | Glucemia, PA, peso |
| **EPOC** | 2 veces/semana | SatO2, FC, disnea |
| **IC** | 3 veces/semana | PA, FC, peso, disnea |

### 8.2 Criterios de Ingreso CENACRON
✅ **Se incluye:**
- Pacientes con diagnóstico confirmado de ECNT
- Edad ≥ 18 años
- Asegurado activo
- Con teléfono/acceso a telemedicina

❌ **Se excluye:**
- Embarazadas (protocolo especial)
- Con deterioro cognitivo severo
- Sin acceso a dispositivos
- En paliativismo

### 8.3 Criterios de Egreso CENACRON
- Muerte
- Cambio de IPRESS definitivo
- Solicitud expresa del paciente
- Incumplimiento > 3 meses
- Resolución de la ECNT (raro)

---

## 9. Arquitectura Técnica Propuesta

### 9.1 Componentes del Sistema

Para implementar correctamente CENACRON como **paquete integral**, el software debe incluir:

**A. Motor de Estados (State Machine)**
- Transiciones automáticas entre estados
- Validaciones en cada cambio de estado
- Auditoría de transiciones

**B. Motor de Reglas (Rules Engine)**
- Cálculo automático de semáforos
- Validación de criterios de ingreso/egreso
- Automatización de reingresos (cada 3 meses)

**C. Sistema de Alertas**
- Notificaciones en transiciones AMARILLO → ROJO → NEGRO
- Dashboard en tiempo real
- Reportes automáticos

**D. Gestión de Bolsas (Queue Management)**
- Cola de especialidades
- Asignación automática de especialistas
- Tracking de interconsultas

**E. Módulo de Reportes**
- KPIs de adherencia
- Ciclos completados por año
- SLA compliance dashboard

### 9.2 Stack Técnico Sugerido

| Capa | Tecnología | Responsabilidad |
|-----|-----------|-----------------|
| **Base de Datos** | PostgreSQL (Existente) | Tablas `paciente_cenacron_journey` + `paciente_cenacron_interconsultas` |
| **Backend** | Spring Boot (Existente) | `CenacronJourneyService` + `CenacronSemaforoEngine` |
| **Scheduler** | Spring Scheduler | Job diario para recalcular semáforos |
| **Notificaciones** | Event Bus + Email | Alertas automáticas |
| **Frontend** | React (Existente) | Dashboard de Control + Módulos por Actor |
| **Auditoría** | AuditLogService (Existente) | Logging de todas las transiciones |

---

## 10. Integración con Otros Módulos

### 10.1 Integración con Gestión de Citas (Fase 2)
```
Gestión de Citas (Módulo 1)
    ↓
[Crear Cita CENACRON] → [Captura datos admisión]
    ↓
paciente_cenacron_journey.estado = ADMISIÓN_PENDIENTE
    ↓
Sistema asigna cita con Med. General (Módulo 2)
```

### 10.2 Integración con Disponibilidad Médica (Fase 2)
```
Médico declara disponibilidad (Bolsa de Especialidades)
    ↓
Sistema filtra por especialidad solicitada
    ↓
Asigna paciente PENDIENTE_ESPECIALIDADES
    ↓
paciente_cenacron_interconsultas.estado = ASIGNADO
```

### 10.3 Integración con Firma Digital (Fase 3)
```
Enfermera firma atención CENACRON
    ↓
Sistema detecta: especialista_id = Enfermería
    ↓
Registra firma en AuditLog
    ↓
Genera trazabilidad completa de journey
```

---

## 11. Errores Comunes y Soluciones

| Problema | Causa | Solución |
|----------|-------|----------|
| Paciente marcado CENACRON pero no es crónico | Búsqueda por palabras clave errónea | Validar contra CIE-10 válidos |
| Múltiples registros del mismo paciente | No hay deduplicación | Implementar `pk_asegurado` único |
| Estrategia no se actualiza | Caché del frontend | Invalidar caché tras cambio |
| Telemonitoreo no se registra | Datos no persisten | Verificar endpoint POST |

---

## 12. Roadmap de Implementación (Patient Journey CENACRON)

### Fase 0 (✅ Completada - 2026-01-07)
**Fundación CENACRON Básica**
- [x] Identificación de pacientes crónicos (`esCronico`)
- [x] Visualización en tabla de enfermería
- [x] Columna "Estrategia" con badge CENACRON
- [x] Documentación completa del patient journey

### Fase 1 (📋 Próxima - Q1-Q2 2026)
**Implementación del Motor de Estados y Módulo 1-2**
- [ ] Crear tabla `paciente_cenacron_journey`
- [ ] Crear tabla `paciente_cenacron_interconsultas`
- [ ] **Módulo 1:** Admisión y Registro (integración Gestión de Citas)
- [ ] **Módulo 2:** Medicina General (Gatekeeper) - Checkbox validación CENACRON
- [ ] Estado machine: ADMISIÓN → MED_GENERAL → VALIDACION/RECHAZO
- [ ] Auditoría de validaciones

### Fase 2 (📋 Q2-Q3 2026)
**Módulos 3-4 y Semaforización**
- [ ] **Módulo 3:** Enfermería - Segunda atención
- [ ] **Módulo 4:** Bolsa de Especialidades (Interconsultas)
- [ ] Motor de Semáforos (VERDE/AMARILLO/ROJO/NEGRO)
- [ ] SLA Engine - Cálculo automático de dias transcurridos
- [ ] Dashboard de Control con semaforización en tiempo real
- [ ] Sistema de Alertas (Transiciones de color)
- [ ] Notificaciones automáticas

### Fase 3 (📋 Q3-Q4 2026)
**Módulos 5-6 y Ciclos Recurrentes**
- [ ] **Módulo 5:** Nutrición y Psicología (Cierre de visita)
- [ ] **Módulo 6:** Ciclo Recurrente (Reingreso automático cada 3M)
- [ ] Spring Scheduler - Job diario para recalcular semáforos
- [ ] Automatización de reingresos (fecha_proximo_ciclo + 3M)
- [ ] Tracking de ciclos completados por año (Meta: 4/año)
- [ ] Reportes de KPIs y adherencia

### Fase 4 (🔮 Q4 2026 - 2027)
**Optimización y Análisis Avanzado**
- [ ] Dashboard CENACRON completo con todas las métricas
- [ ] Reportes ejecutivos (Cobertura, Adherencia, Urgencias Evitadas)
- [ ] Integración con firma digital para trazabilidad
- [ ] Integración completa con Gestión de Citas
- [ ] IA para predicción de descompensaciones
- [ ] Alertas inteligentes basadas en patrones

### Fase 5 (🚀 Largo plazo - 2027+)
**Extensiones y Mejoras Futuras**
- [ ] Integración con wearables
- [ ] App móvil para pacientes (telemonitoreo autoservicio)
- [ ] Análisis predictivo avanzado
- [ ] Integración con sistema de facturación (para KPIs económicos)

---

## 13. Referencias Normativas

- **Resolución CENATE 2023** - Estrategia de Gestión de Crónicos
- **Guía Clínica HTA EsSalud 2022**
- **Guía Clínica DM2 EsSalud 2022**
- **Protocolo de Telemonitoreo CENATE**

---

## 14. Contactos y Soporte

| Rol | Contacto |
|-----|----------|
| Responsable CENACRON | cenacron@essalud.gob.pe |
| Soporte Técnico | cenate-tech@essalud.gob.pe |
| Documentación | wiki.cenate.essalud.gob.pe |
| Equipo de Desarrollo | dev-cenate@essalud.gob.pe |

---

## 15. Resumen Ejecutivo

**CENACRON es un paquete integral de atención**, no solo un programa de identificación. Estructura el recorrido completo del paciente crónico en **6 módulos operacionales**:

1. **Admisión y Registro** - Captura sistemática de datos
2. **Medicina General (Gatekeeper)** - Validación de pertenencia CENACRON
3. **Enfermería** - Segunda atención multidisciplinaria
4. **Bolsa de Especialidades** - Interconsultas coordinadas
5. **Nutrición y Psicología** - Cierre de visita
6. **Ciclo Recurrente** - Reingreso automático cada 3 meses (Meta: 4 visitas/año)

**Elemento crítico:** **Sistema de Semaforización (SLA)** con 4 colores (Verde/Amarillo/Rojo/Negro) que automáticamente alerta cuando pacientes están fuera de norma.

**Esfuerzo de implementación:** ~18 meses (Fases 1-4), considerando:
- Motor de estados transaccional
- Scheduler automático para reingresos
- Dashboard de control en tiempo real
- Sistema inteligente de alertas
- Integración con módulos existentes (Citas, Disponibilidad, Firma Digital)

---

**Documento creado por:** Claude Code
**Versión:** 2.0.0 (Actualización con Patient Journey completo)
**Última actualización:** 2026-01-07 (Ampliación significativa)
**Estado:** Especificación Técnica Detallada - Listo para Análisis de Viabilidad
