# Modelo de Horarios Existente - Sistema CENATE

**Versión:** 1.0.0
**Fecha:** 2026-01-03
**Basado en:** Guía operativa – Horario de profesionales (maestro_cenate) v1.0 del 16/12/2025
**Autor:** Administrador de Base de Datos + Ing. Styp Canto Rondón

---

## 📚 ÍNDICE

1. [Resumen Ejecutivo](#-resumen-ejecutivo)
2. [Objetivo del Documento](#-objetivo-del-documento)
3. [Modelo de Datos Existente](#-modelo-de-datos-existente)
4. [Reglas de Negocio](#-reglas-de-negocio)
5. [Flujo de Carga de Horarios](#-flujo-de-carga-de-horarios)
6. [Checklist Operativo](#-checklist-operativo)
7. [Consultas SQL Útiles](#-consultas-sql-útiles)
8. [Relación con Módulo de Disponibilidad Médica](#-relación-con-módulo-de-disponibilidad-médica)
9. [Troubleshooting](#-troubleshooting)

---

## 📋 RESUMEN EJECUTIVO

### ¿Qué es este documento?

Este documento describe el **modelo existente de horarios** en la base de datos `maestro_cenate` que alimenta el sistema de agendamiento de citas del chatbot de CENATE. Este modelo NO es parte del nuevo módulo de disponibilidad médica, sino que es la infraestructura actual de carga de horarios mensuales.

### Diferencia con el nuevo módulo

| Aspecto | Modelo Existente (`ctr_horario`) | Nuevo Módulo (`disponibilidad_medica`) |
|---------|----------------------------------|----------------------------------------|
| **Propósito** | Carga operativa de horarios para chatbot | Declaración voluntaria de médicos con validación |
| **Usuarios** | Coordinadores/Administradores | Médicos + Coordinadores |
| **Validación** | Validación de catálogos y FKs | Validación de 150 horas mínimas |
| **Estados** | Sin flujo de estados | BORRADOR → ENVIADO → REVISADO |
| **Uso principal** | Generación de slots para citas | Planificación mensual de disponibilidad |

### Tablas principales

- `ctr_periodo` - Periodos YYYYMM
- `ctr_horario` - Encabezado de horario (periodo + profesional + área)
- `ctr_horario_det` - Detalle diario (fecha + turno)
- `dim_horario` - Catálogo de turnos con horas
- `dim_catalogo_horario` - Configuración de horas por turno
- `rendimiento_horario` - Capacidad (pacientes por hora)
- `vw_slots_disponibles_chatbot` - Vista que genera slots
- `vw_fechas_disponibles_chatbot` - Vista de fechas disponibles

---

## 🎯 OBJETIVO DEL DOCUMENTO

1. **Documentar** el modelo existente de horarios para referencia futura
2. **Explicar** el flujo de carga de horarios por periodo
3. **Proporcionar** consultas SQL listas para auditoría y validación
4. **Diferenciar** este modelo del nuevo módulo de disponibilidad médica
5. **Servir** como guía para futuras integraciones o migraciones

---

## 🗄️ MODELO DE DATOS EXISTENTE

### 3.1 Diagrama de Relaciones

```
ctr_periodo (YYYYMM, fechas, coordinador)
    ↓ FK
ctr_horario (periodo, id_pers, id_area, id_servicio, totales)
    ↓ FK (1:N)
ctr_horario_det (fecha_dia, id_horario, id_tip_turno)
    ├─→ dim_horario (cod_horario, horas, régimen)
    │       ↓
    │   dim_catalogo_horario (hora_inicio, hora_fin, intervalo)
    │
    └─→ dim_tipo_turno (TRN_CHATBOT)

rendimiento_horario (servicio, capacidad)
    ↓
vw_slots_disponibles_chatbot (genera slots futuros)
    ↓
vw_fechas_disponibles_chatbot (lista fechas únicas)
```

### 3.2 Tabla: `ctr_periodo`

Define los periodos mensuales en formato YYYYMM.

```sql
CREATE TABLE ctr_periodo (
    periodo VARCHAR(6) PRIMARY KEY,  -- Ejemplo: '202601' para enero 2026
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado VARCHAR(50),  -- ABIERTO, EN_VALIDACION, CERRADO, REABIERTO
    id_coordinador BIGINT NOT NULL REFERENCES dim_usuarios(id_user),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Campos importantes:**
- `periodo`: Formato YYYYMM (ejemplo: '202601')
- `id_coordinador`: Usuario responsable del periodo (NOT NULL)
- `estado`: Estado del periodo según flujo interno

### 3.3 Tabla: `ctr_horario`

Encabezado del horario por periodo, profesional y área.

```sql
CREATE TABLE ctr_horario (
    id_ctr_horario BIGSERIAL PRIMARY KEY,
    periodo VARCHAR(6) NOT NULL REFERENCES ctr_periodo(periodo),
    id_pers BIGINT NOT NULL REFERENCES dim_personal_cnt(id_pers),
    id_area BIGINT NOT NULL REFERENCES dim_area_essi(id_area),
    id_servicio BIGINT REFERENCES dim_servicio_essi(id_servicio),  -- IMPORTANTE: puede ser NULL
    id_reg_lab BIGINT REFERENCES dim_regimen_laboral(id_reg_lab),
    turnos_totales INTEGER DEFAULT 0,
    turnos_validos INTEGER DEFAULT 0,
    horas_totales DECIMAL(7,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_ctr_horario_periodo_pers_area
        UNIQUE(periodo, id_pers, id_area)
);

CREATE INDEX idx_ctr_horario_periodo ON ctr_horario(periodo);
CREATE INDEX idx_ctr_horario_pers ON ctr_horario(id_pers);
```

**Reglas importantes:**
- ✅ Un profesional puede tener solo UN horario por (periodo, área)
- ⚠️ `id_servicio` puede ser NULL, pero esto impide generar slots para chatbot
- ✅ Se ejecuta trigger `fn_validar_asistencial()` que valida que el profesional sea ASISTENCIAL

### 3.4 Tabla: `ctr_horario_det`

Detalle diario del horario (cada fila = un día con turno específico).

```sql
CREATE TABLE ctr_horario_det (
    id_ctr_horario_det BIGSERIAL PRIMARY KEY,
    id_ctr_horario BIGINT NOT NULL REFERENCES ctr_horario(id_ctr_horario) ON DELETE CASCADE,
    fecha_dia DATE NOT NULL,
    id_horario BIGINT REFERENCES dim_horario(id_horario),  -- puede ser NULL (día libre)
    id_tip_turno BIGINT NOT NULL REFERENCES dim_tipo_turno(id_tip_turno),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_ctr_horario_det_horario_fecha
        UNIQUE(id_ctr_horario, fecha_dia)
);

CREATE INDEX idx_ctr_horario_det_horario ON ctr_horario_det(id_ctr_horario);
CREATE INDEX idx_ctr_horario_det_fecha ON ctr_horario_det(fecha_dia);
```

**Reglas importantes:**
- ✅ Un mismo día solo puede tener UN registro por horario
- ✅ `id_horario` NULL = día libre (sin atención)
- ⚠️ Para chatbot, se debe usar `id_tip_turno` con `cod_tip_turno = 'TRN_CHATBOT'` activo

### 3.5 Tabla: `dim_horario`

Catálogo de turnos con sus horas asociadas.

```sql
CREATE TABLE dim_horario (
    id_horario BIGSERIAL PRIMARY KEY,
    cod_horario VARCHAR(10) NOT NULL UNIQUE,  -- Ejemplo: 'M4', 'T4', 'MT8'
    desc_horario VARCHAR(100),
    horas DECIMAL(4,2) NOT NULL,  -- Horas del turno
    id_reg_lab BIGINT REFERENCES dim_regimen_laboral(id_reg_lab),
    stat_horario CHAR(1) DEFAULT 'A'  -- A=Activo, I=Inactivo
);
```

**Ejemplos de cod_horario:**
- `M4`: Mañana 4 horas (Régimen 728/CAS)
- `T4`: Tarde 4 horas (Régimen 728/CAS)
- `MT8`: Turno completo 8 horas (Régimen 728/CAS)
- `M6`: Mañana 6 horas (Régimen Locador)
- `T6`: Tarde 6 horas (Régimen Locador)
- `MT12`: Turno completo 12 horas (Régimen Locador)

### 3.6 Tabla: `dim_catalogo_horario`

Mapeo de códigos de horario a hora_inicio/hora_fin para generar slots.

```sql
CREATE TABLE dim_catalogo_horario (
    cod_horario VARCHAR(10) PRIMARY KEY,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    horas_turno DECIMAL(4,2) NOT NULL,
    intervalo_minutos INTEGER DEFAULT 15,  -- Intervalo entre slots
    estado CHAR(1) DEFAULT 'A'
);
```

**Ejemplo:**
```sql
INSERT INTO dim_catalogo_horario VALUES
('M4', '07:00', '11:00', 4.00, 15, 'A'),
('T4', '13:00', '17:00', 4.00, 15, 'A'),
('MT8', '07:00', '15:00', 8.00, 15, 'A');
```

### 3.7 Tabla: `dim_tipo_turno`

Tipos de turno. Para chatbot se usa `TRN_CHATBOT`.

```sql
CREATE TABLE dim_tipo_turno (
    id_tip_turno BIGSERIAL PRIMARY KEY,
    cod_tip_turno VARCHAR(20) NOT NULL UNIQUE,
    desc_tip_turno VARCHAR(100),
    stat_tip_turno CHAR(1) DEFAULT 'A'
);
```

**Importante:**
- ⚠️ Para que el chatbot genere slots, debe existir un registro con:
  - `cod_tip_turno = 'TRN_CHATBOT'`
  - `stat_tip_turno = 'A'`

### 3.8 Tabla: `rendimiento_horario`

Configura la capacidad (pacientes por hora) por servicio/actividad/subactividad.

```sql
CREATE TABLE rendimiento_horario (
    id_area_hosp BIGINT NOT NULL,  -- Para chatbot = 1
    id_servicio BIGINT NOT NULL REFERENCES dim_servicio_essi(id_servicio),
    id_actividad BIGINT REFERENCES dim_actividad(id_actividad),
    id_subactividad BIGINT REFERENCES dim_subactividad(id_subactividad),
    pacientes_por_hora INTEGER NOT NULL,  -- Ejemplo: 4 = slots cada 15 min
    adicional BOOLEAN DEFAULT FALSE,
    estado CHAR(1) DEFAULT 'A',

    PRIMARY KEY (id_area_hosp, id_servicio, id_actividad, id_subactividad)
);
```

**Cálculo de intervalo de slots:**
- `pacientes_por_hora = 4` → slots cada 15 minutos
- `pacientes_por_hora = 2` → slots cada 30 minutos
- `pacientes_por_hora = 1` → slots cada 60 minutos

### 3.9 Vista: `vw_slots_disponibles_chatbot`

Vista que genera automáticamente los slots disponibles para el chatbot.

**Funcionamiento:**
1. Obtiene horarios de `ctr_horario` + `ctr_horario_det`
2. Filtra solo fechas futuras
3. Cruza con `dim_catalogo_horario` para obtener hora_inicio/hora_fin
4. Cruza con `rendimiento_horario` para obtener capacidad
5. Genera slots según intervalo
6. Excluye slots ya ocupados en `solicitud_cita` con estados que bloquean

**Columnas importantes:**
- `fecha_cita`: Fecha del slot
- `hora_cita`: Hora del slot
- `id_pers`: ID del profesional
- `id_servicio`: Servicio/especialidad
- `turno_mt`: Turno (M/T/MT)
- `cod_servicio`: Código de especialidad
- `servicio`: Nombre de especialidad

### 3.10 Vista: `vw_fechas_disponibles_chatbot`

Vista que lista fechas únicas disponibles (simplificación de `vw_slots_disponibles_chatbot`).

---

## ⚙️ REGLAS DE NEGOCIO

### RN-01: Periodo Obligatorio

```sql
-- FK constraint
ALTER TABLE ctr_horario
ADD CONSTRAINT fk_ctr_horario_periodo
FOREIGN KEY (periodo) REFERENCES ctr_periodo(periodo);
```

**Validación:** Si el periodo no existe en `ctr_periodo`, no se puede insertar en `ctr_horario`.

### RN-02: Solo Personal ASISTENCIAL

```sql
-- Trigger que valida
CREATE TRIGGER trg_validar_asistencial_horario
BEFORE INSERT OR UPDATE ON ctr_horario
FOR EACH ROW
EXECUTE FUNCTION fn_validar_asistencial();
```

**Validación:**
- El profesional debe existir en `dim_personal_cnt`
- Debe estar clasificado como ASISTENCIAL en `dim_personal_tipo`

### RN-03: Unicidad del Encabezado

```sql
CONSTRAINT uq_ctr_horario_periodo_pers_area
    UNIQUE(periodo, id_pers, id_area)
```

**Validación:** Un profesional solo puede tener UN horario por (periodo, área).

### RN-04: Unicidad por Día

```sql
CONSTRAINT uq_ctr_horario_det_horario_fecha
    UNIQUE(id_ctr_horario, fecha_dia)
```

**Validación:** Un mismo día solo puede tener UN registro para un horario dado.

### RN-05: Slots del Chatbot - Condiciones

Para que se generen slots, se requiere:

1. ✅ Existe turno con `horas > 0`
2. ✅ `id_tip_turno` tiene `cod_tip_turno = 'TRN_CHATBOT'` activo
3. ✅ Existe configuración en `dim_catalogo_horario`
4. ✅ Existe configuración en `rendimiento_horario` para el servicio
5. ✅ `ctr_horario.id_servicio` NO es NULL

### RN-06: Separación Horario vs Citas

- **Horario cargado:** `ctr_horario` + `ctr_horario_det`
- **Citas reservadas:** `solicitud_cita`
- **Slots disponibles:** Vista excluye slots ocupados cuando `dim_estado_cita.bloquea_slot = TRUE`

---

## 🔄 FLUJO DE CARGA DE HORARIOS

### Paso 0: Catálogos Base

**Validar que existen:**

```sql
-- 1. Tipo de turno TRN_CHATBOT activo
SELECT * FROM dim_tipo_turno
WHERE cod_tip_turno = 'TRN_CHATBOT' AND stat_tip_turno = 'A';

-- 2. Catálogo de horarios
SELECT * FROM dim_catalogo_horario WHERE estado = 'A';

-- 3. Rendimiento por servicio
SELECT * FROM rendimiento_horario WHERE estado = 'A';

-- 4. Profesional es ASISTENCIAL
SELECT p.id_pers, tp.desc_tip_pers
FROM dim_personal_cnt p
JOIN dim_personal_tipo pt ON pt.id_pers = p.id_pers
JOIN dim_tipo_personal tp ON tp.id_tip_pers = pt.id_tip_pers
WHERE p.num_doc_pers = '<DNI>'
  AND UPPER(tp.desc_tip_pers) = 'ASISTENCIAL';
```

### Paso 1: Crear/Validar el Periodo

```sql
-- Insertar periodo
INSERT INTO ctr_periodo (periodo, fecha_inicio, fecha_fin, estado, id_coordinador)
VALUES ('202601', '2026-01-01', '2026-01-31', 'ABIERTO', <ID_COORDINADOR>);

-- Validar periodo
SELECT * FROM ctr_periodo WHERE periodo = '202601';
```

### Paso 2: Crear/Validar el Encabezado

```sql
-- Insertar encabezado
INSERT INTO ctr_horario (periodo, id_pers, id_area, id_servicio, id_reg_lab)
VALUES ('202601', <ID_PERS>, <ID_AREA>, <ID_SERVICIO>, <ID_REG_LAB>);

-- ⚠️ IMPORTANTE: id_servicio debe tener valor, no NULL
```

### Paso 3: Cargar el Detalle Diario

```sql
-- Insertar detalles por día
INSERT INTO ctr_horario_det (id_ctr_horario, fecha_dia, id_horario, id_tip_turno)
VALUES
    (<ID_CTR_HORARIO>, '2026-01-06', <ID_HORARIO_M4>, <ID_TIP_TURNO_CHATBOT>),
    (<ID_CTR_HORARIO>, '2026-01-07', <ID_HORARIO_T4>, <ID_TIP_TURNO_CHATBOT>),
    (<ID_CTR_HORARIO>, '2026-01-08', <ID_HORARIO_MT8>, <ID_TIP_TURNO_CHATBOT>);
```

### Paso 4: Validación Post-Carga

```sql
-- 1. Verificar horario en vista de auditoría
SELECT * FROM vw_ch_det_enriquecido
WHERE periodo = '202601' AND num_doc_pers = '<DNI>';

-- 2. Verificar slots generados
SELECT cod_servicio, fecha_cita, COUNT(*) AS total_slots
FROM vw_slots_disponibles_chatbot
WHERE fecha_cita >= CURRENT_DATE
  AND cod_servicio = '<COD_SERVICIO>'
GROUP BY cod_servicio, fecha_cita
ORDER BY fecha_cita;

-- 3. Verificar fechas disponibles
SELECT * FROM vw_fechas_disponibles_chatbot
WHERE fecha_cita >= CURRENT_DATE
  AND cod_servicio = '<COD_SERVICIO>'
ORDER BY fecha_cita;
```

---

## ✅ CHECKLIST OPERATIVO

### Antes de Cargar Horarios

- [ ] Existe el periodo en `ctr_periodo` (YYYYMM)
- [ ] El `id_coordinador` del periodo existe en `dim_usuarios`
- [ ] El profesional existe en `dim_personal_cnt` y está activo (`stat_pers = 'A'`)
- [ ] El profesional está clasificado como ASISTENCIAL
- [ ] Existe `TRN_CHATBOT` activo en `dim_tipo_turno`
- [ ] Los `cod_horario` a usar están en `dim_catalogo_horario`
- [ ] Existe `rendimiento_horario` para el servicio

### Durante la Carga

- [ ] Se crea `ctr_horario` con `id_servicio` NOT NULL
- [ ] Los días con atención están en `ctr_horario_det`
- [ ] No hay filas con `id_horario = NULL` sin justificación
- [ ] Se usa `id_tip_turno` con `cod_tip_turno = 'TRN_CHATBOT'`

### Después de la Carga

- [ ] El horario aparece en `vw_ch_det_enriquecido`
- [ ] Se generan slots en `vw_slots_disponibles_chatbot`
- [ ] Se ven fechas en `vw_fechas_disponibles_chatbot`
- [ ] No hay duplicados en `solicitud_cita` (estados que bloquean)

---

## 🔍 CONSULTAS SQL ÚTILES

### 7.1 Verificar Periodo

```sql
-- Ver periodo y su estado
SELECT periodo, fecha_inicio, fecha_fin, estado, id_coordinador
FROM ctr_periodo
WHERE periodo = '202601';

-- Periodos recientes
SELECT periodo, fecha_inicio, fecha_fin, estado
FROM ctr_periodo
ORDER BY periodo DESC
LIMIT 12;
```

### 7.2 Validar Profesional Asistencial

```sql
-- Validar existencia y estado
SELECT id_pers, num_doc_pers, ape_pater_pers, ape_mater_pers,
       nom_pers, stat_pers, id_area, id_servicio, id_reg_lab
FROM dim_personal_cnt
WHERE UPPER(BTRIM(num_doc_pers::text)) = UPPER(BTRIM('44914706'::text));

-- Validar clasificación ASISTENCIAL
SELECT p.id_pers, p.num_doc_pers, tp.desc_tip_pers, tp.stat_tip_pers
FROM dim_personal_cnt p
JOIN dim_personal_tipo pt ON pt.id_pers = p.id_pers
JOIN dim_tipo_personal tp ON tp.id_tip_pers = pt.id_tip_pers
WHERE UPPER(BTRIM(p.num_doc_pers::text)) = UPPER(BTRIM('44914706'::text))
  AND UPPER(tp.desc_tip_pers) = 'ASISTENCIAL';
```

### 7.3 Ver Encabezados de Horario

```sql
-- Encabezados por profesional y periodo
SELECT id_ctr_horario, periodo, id_pers, id_area, id_servicio,
       id_reg_lab, turnos_totales, horas_totales, updated_at
FROM ctr_horario
WHERE periodo = '202601' AND id_pers = 123
ORDER BY id_area;

-- Detectar encabezados sin servicio (⚠️ impiden slots)
SELECT id_ctr_horario, periodo, id_pers, id_area, id_servicio
FROM ctr_horario
WHERE periodo = '202601' AND id_servicio IS NULL;
```

### 7.4 Ver Detalle Diario

```sql
-- Detalle con turno completo
SELECT d.id_ctr_horario_det, d.id_ctr_horario, d.fecha_dia,
       d.id_tip_turno, tt.cod_tip_turno,
       d.id_horario, h.cod_horario, h.horas
FROM ctr_horario_det d
JOIN dim_tipo_turno tt ON tt.id_tip_turno = d.id_tip_turno
LEFT JOIN dim_horario h ON h.id_horario = d.id_horario
WHERE d.id_ctr_horario = 123
ORDER BY d.fecha_dia;

-- Días con id_horario NULL (⚠️ días libres)
SELECT d.*
FROM ctr_horario_det d
WHERE d.id_ctr_horario = 123 AND d.id_horario IS NULL
ORDER BY d.fecha_dia;

-- Turnos con horas = 0 (⚠️ no generan slots)
SELECT d.fecha_dia, h.id_horario, h.cod_horario, h.horas
FROM ctr_horario_det d
JOIN dim_horario h ON h.id_horario = d.id_horario
WHERE d.id_ctr_horario = 123 AND COALESCE(h.horas, 0) <= 0
ORDER BY d.fecha_dia;
```

### 7.5 Auditoría de Completitud

```sql
-- Detectar días faltantes en el periodo
WITH per AS (
    SELECT periodo, fecha_inicio, fecha_fin
    FROM ctr_periodo WHERE periodo = '202601'
),
cal AS (
    SELECT gs::date AS fecha_dia
    FROM per, generate_series(per.fecha_inicio, per.fecha_fin, interval '1 day') gs
)
SELECT c.fecha_dia
FROM cal c
LEFT JOIN ctr_horario_det d
    ON d.id_ctr_horario = 123 AND d.fecha_dia = c.fecha_dia
WHERE d.id_ctr_horario_det IS NULL
ORDER BY c.fecha_dia;
```

### 7.6 Validar Catálogos

```sql
-- Ver definición de turno
SELECT id_horario, cod_horario, desc_horario, horas, id_reg_lab, stat_horario
FROM dim_horario
WHERE cod_horario = 'M4';

-- Ver configuración de horas
SELECT cod_horario, hora_inicio, hora_fin, horas_turno, intervalo_minutos, estado
FROM dim_catalogo_horario
WHERE cod_horario = 'M4';

-- Detectar cod_horario sin configuración (⚠️ no generan slots)
SELECT DISTINCT h.cod_horario
FROM ctr_horario_det d
JOIN dim_horario h ON h.id_horario = d.id_horario
LEFT JOIN dim_catalogo_horario cat ON cat.cod_horario = h.cod_horario::text
WHERE d.fecha_dia >= CURRENT_DATE AND cat.cod_horario IS NULL;
```

### 7.7 Validar Tipo de Turno Chatbot

```sql
-- Validar TRN_CHATBOT activo
SELECT id_tip_turno, cod_tip_turno, desc_tip_turno, stat_tip_turno
FROM dim_tipo_turno
WHERE cod_tip_turno = 'TRN_CHATBOT';

-- Ver detalle enriquecido (si existe la vista)
SELECT *
FROM vw_ch_det_enriquecido
WHERE periodo = '202601' AND num_doc_pers = '44914706'
ORDER BY fecha_dia;
```

### 7.8 Validar Rendimiento (Capacidad)

```sql
-- Ver rendimiento por servicio
SELECT id_area_hosp, id_servicio, id_actividad, id_subactividad,
       pacientes_por_hora, adicional, estado
FROM rendimiento_horario
WHERE id_servicio = 123
ORDER BY id_area_hosp, id_actividad, id_subactividad;

-- Servicios sin rendimiento (⚠️ área hospitalaria chatbot = 1)
SELECT DISTINCT ch.id_servicio
FROM ctr_horario ch
JOIN ctr_horario_det d ON d.id_ctr_horario = ch.id_ctr_horario
WHERE ch.periodo = '202601'
  AND ch.id_servicio IS NOT NULL
  AND NOT EXISTS (
      SELECT 1 FROM rendimiento_horario rh
      WHERE rh.id_servicio = ch.id_servicio AND rh.id_area_hosp = 1
  );
```

### 7.9 Validar Slots Generados

```sql
-- Conteo de slots por servicio y fecha
SELECT cod_servicio, servicio, fecha_cita, turno_mt, COUNT(*) AS slots
FROM vw_slots_disponibles_chatbot
WHERE fecha_cita >= CURRENT_DATE AND cod_servicio = 'CARDIO'
GROUP BY cod_servicio, servicio, fecha_cita, turno_mt
ORDER BY fecha_cita, turno_mt;

-- Fechas disponibles para chatbot
SELECT *
FROM vw_fechas_disponibles_chatbot
WHERE fecha_cita >= CURRENT_DATE AND cod_servicio = 'CARDIO'
ORDER BY fecha_cita, turno_mt;
```

### 7.10 Auditoría de Reservas (Duplicados)

```sql
-- Detectar slots duplicados para médico (estados que bloquean)
SELECT sc.id_pers, sc.id_area_hosp, sc.id_servicio,
       sc.fecha_cita, sc.hora_cita, COUNT(*) AS n
FROM solicitud_cita sc
JOIN dim_estado_cita est ON est.id_estado_cita = sc.id_estado_cita
WHERE est.bloquea_slot = TRUE
GROUP BY sc.id_pers, sc.id_area_hosp, sc.id_servicio,
         sc.id_actividad, sc.id_subactividad, sc.fecha_cita, sc.hora_cita
HAVING COUNT(*) > 1
ORDER BY n DESC;

-- Detectar slots duplicados para paciente
SELECT sc.doc_paciente, sc.fecha_cita, sc.hora_cita, COUNT(*) AS n
FROM solicitud_cita sc
JOIN dim_estado_cita est ON est.id_estado_cita = sc.id_estado_cita
WHERE est.bloquea_slot = TRUE AND sc.doc_paciente IS NOT NULL
GROUP BY sc.doc_paciente, sc.fecha_cita, sc.hora_cita
HAVING COUNT(*) > 1
ORDER BY n DESC;
```

---

## 🔗 RELACIÓN CON MÓDULO DE DISPONIBILIDAD MÉDICA

### Diferencias Clave

| Característica | `ctr_horario` (Existente) | `disponibilidad_medica` (Nuevo) |
|----------------|---------------------------|----------------------------------|
| **Objetivo** | Carga operativa de horarios para chatbot | Declaración voluntaria de médicos |
| **Quien carga** | Coordinadores/Administradores | Médicos directamente |
| **Validación principal** | FK, catálogos, triggers | Mínimo 150 horas/mes |
| **Estados** | Sin flujo | BORRADOR → ENVIADO → REVISADO |
| **Edición** | Coordinador puede editar siempre | Médico hasta REVISADO |
| **Cálculo de horas** | No validado | Automático según régimen |
| **Turnos** | Códigos de `dim_horario` | M, T, MT simplificado |
| **Especialidad** | Opcional (`id_servicio`) | Obligatoria por periodo |

### Posible Integración Futura

**Opción 1: Independientes (Recomendado)**
- `disponibilidad_medica`: Médicos declaran intención
- `ctr_horario`: Coordinadores cargan horario final validado
- Coordinadores usan declaraciones como referencia

**Opción 2: Sincronización Unidireccional**
- Médicos declaran en `disponibilidad_medica`
- Al marcar REVISADO, se genera automáticamente en `ctr_horario`
- Requiere mapeo de turnos (M/T/MT → cod_horario)

**Opción 3: Migración Total**
- Deprecar `disponibilidad_medica`
- Usar solo `ctr_horario` con flujo de estados
- Requiere modificar modelo existente

**Recomendación actual:** Mantener separados (Opción 1)

---

## 🔧 TROUBLESHOOTING

### Problema: No aparecen slots en el chatbot

**Causas comunes:**

1. **El profesional no es ASISTENCIAL**
   ```sql
   -- Verificar
   SELECT p.id_pers, tp.desc_tip_pers
   FROM dim_personal_cnt p
   JOIN dim_personal_tipo pt ON pt.id_pers = p.id_pers
   JOIN dim_tipo_personal tp ON tp.id_tip_pers = pt.id_tip_pers
   WHERE p.id_pers = 123;
   ```

2. **id_servicio es NULL en ctr_horario**
   ```sql
   -- Verificar
   SELECT id_ctr_horario, id_servicio FROM ctr_horario
   WHERE id_ctr_horario = 123;

   -- Corregir
   UPDATE ctr_horario SET id_servicio = <ID_SERVICIO>
   WHERE id_ctr_horario = 123;
   ```

3. **El turno tiene horas = 0**
   ```sql
   -- Verificar
   SELECT h.cod_horario, h.horas
   FROM ctr_horario_det d
   JOIN dim_horario h ON h.id_horario = d.id_horario
   WHERE d.id_ctr_horario = 123;
   ```

4. **Tipo de turno no es TRN_CHATBOT**
   ```sql
   -- Verificar
   SELECT tt.cod_tip_turno, tt.stat_tip_turno
   FROM ctr_horario_det d
   JOIN dim_tipo_turno tt ON tt.id_tip_turno = d.id_tip_turno
   WHERE d.id_ctr_horario = 123;
   ```

5. **Falta cod_horario en dim_catalogo_horario**
   ```sql
   -- Verificar
   SELECT DISTINCT h.cod_horario
   FROM ctr_horario_det d
   JOIN dim_horario h ON h.id_horario = d.id_horario
   LEFT JOIN dim_catalogo_horario cat ON cat.cod_horario = h.cod_horario::text
   WHERE d.id_ctr_horario = 123 AND cat.cod_horario IS NULL;
   ```

6. **Falta rendimiento_horario para el servicio**
   ```sql
   -- Verificar
   SELECT * FROM rendimiento_horario
   WHERE id_servicio = 123 AND id_area_hosp = 1;

   -- Insertar si falta
   INSERT INTO rendimiento_horario
       (id_area_hosp, id_servicio, id_actividad, id_subactividad, pacientes_por_hora)
   VALUES (1, 123, 1, 1, 4);  -- 4 = slots cada 15 min
   ```

### Problema: Error FK de periodo

```sql
-- Error: "violates foreign key constraint"
-- Causa: El periodo no existe en ctr_periodo

-- Verificar
SELECT * FROM ctr_periodo WHERE periodo = '202601';

-- Insertar periodo si falta
INSERT INTO ctr_periodo (periodo, fecha_inicio, fecha_fin, estado, id_coordinador)
VALUES ('202601', '2026-01-01', '2026-01-31', 'ABIERTO', <ID_COORDINADOR>);
```

### Problema: Error NOT NULL id_coordinador

```sql
-- Error al crear periodo sin coordinador
-- Causa: id_coordinador es NOT NULL

-- Encontrar id_user del coordinador
SELECT id_user, username, nombres, apellidos
FROM dim_usuarios
WHERE UPPER(BTRIM(num_doc_usuario::text)) = UPPER(BTRIM('44914706'::text));
```

### Problema: Los slots ya están tomados

```sql
-- Verificar si hay citas en estados que bloquean
SELECT sc.*, est.desc_estado, est.bloquea_slot
FROM solicitud_cita sc
JOIN dim_estado_cita est ON est.id_estado_cita = sc.id_estado_cita
WHERE sc.id_pers = 123
  AND sc.fecha_cita = '2026-01-15'
  AND est.bloquea_slot = TRUE;
```

---

## 📚 REFERENCIAS

### Documentos relacionados

1. **Guía operativa original:** `Guia_operativa_horarios_maestro_cenate.pdf` (v1.0, 16/12/2025)
2. **Plan de disponibilidad médica:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
3. **Plan de solicitud de turnos:** `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md`

### Vistas importantes

- `vw_ch_det_enriquecido` - Vista de auditoría de horarios
- `vw_slots_disponibles_chatbot` - Slots disponibles para citas
- `vw_fechas_disponibles_chatbot` - Fechas disponibles

### Funciones/Triggers

- `fn_validar_asistencial()` - Valida que profesional sea ASISTENCIAL
- `fn_sc_validar_slot_disponible()` - Evita doble reserva de slots

---

**Fin del documento**

*Este documento sirve como referencia técnica del modelo existente de horarios. Para nuevas funcionalidades de declaración de disponibilidad, consultar `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`.*

---

*EsSalud Perú - CENATE | Ing. Styp Canto Rondón*
*Versión 1.0.0 | 2026-01-03*
