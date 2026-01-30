# 🗄️ MÓDULO 107 - DOCUMENTACIÓN BASE DE DATOS

**Versión:** 3.0.0  
**Fecha:** 2026-01-30  
**SGBD:** PostgreSQL 14+  
**Schema:** `public`, `staging`

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura de Datos](#arquitectura-de-datos)
3. [Tablas Principales](#tablas-principales)
4. [Migraciones](#migraciones)
5. [Índices y Optimizaciones](#índices-y-optimizaciones)
6. [Stored Procedures](#stored-procedures)
7. [Queries Principales](#queries-principales)
8. [Diagrama de Relaciones](#diagrama-de-relaciones)

---

## 🎯 RESUMEN EJECUTIVO

El **Módulo 107** utiliza una arquitectura de base de datos híbrida que combina:

### **v3.0 (ACTUAL)** ⭐
- **Tabla Principal:** `dim_solicitud_bolsa` (tabla unificada)
- **Estrategia:** Migración de datos legacy a estructura dimensional
- **Ventajas:** Normalización, integridad referencial, consultas optimizadas

### **v2.0 (LEGACY)**
- **Tablas Antiguas:** `bolsa_107_item`, `bolsa_107_carga`, `bolsa_107_error`
- **Estado:** Mantenidas para auditoría histórica
- **Uso:** Solo para importación de archivos Excel

---

## 🏗️ ARQUITECTURA DE DATOS

### **Flujo de Datos**

```
┌─────────────────────┐
│  ARCHIVO EXCEL      │
│  (Formulario 107)   │
└──────────┬──────────┘
           │ Importación
           ↓
┌─────────────────────────────┐
│  staging.bolsa_107_raw      │  ← Datos crudos temporales
│  (Tabla staging)            │
└──────────┬──────────────────┘
           │ Validación
           ↓
┌─────────────────────────────┐
│  bolsa_107_carga            │  ← Registro de importación
│  (Auditoría)                │
└──────────┬──────────────────┘
           │ Procesamiento
           ↓
┌─────────────────────────────┐
│  dim_solicitud_bolsa        │  ⭐ Tabla principal v3.0
│  (id_bolsa = 107)           │
└─────────────────────────────┘
           │
           ↓
     ┌────────────┐
     │  CONSULTAS │
     │  REPORTES  │
     └────────────┘
```

---

## 📊 TABLAS PRINCIPALES

### **1️⃣ dim_solicitud_bolsa** ⭐ (TABLA PRINCIPAL v3.0)

📋 **Schema:** `public`  
📍 **Propósito:** Almacena todos los pacientes del Módulo 107 en formato dimensional

#### **Estructura DDL**
```sql
CREATE TABLE dim_solicitud_bolsa (
    -- 🔑 Identificación
    id_solicitud BIGSERIAL PRIMARY KEY,
    numero_solicitud VARCHAR(50) UNIQUE NOT NULL,  -- BOL107-{id_carga}-{id_raw}
    
    -- 👤 Datos del Paciente
    paciente_id VARCHAR(20),
    paciente_dni VARCHAR(20) NOT NULL,
    paciente_nombre VARCHAR(200) NOT NULL,
    tipo_documento VARCHAR(10),
    fecha_nacimiento DATE,
    paciente_sexo VARCHAR(1),  -- M | F
    paciente_telefono VARCHAR(30),
    paciente_telefono_alterno VARCHAR(30),
    paciente_email VARCHAR(100),
    
    -- 📋 Datos Operativos
    especialidad VARCHAR(100),  -- PSICOLOGIA CENATE, MEDICINA CENATE, etc.
    codigo_adscripcion VARCHAR(10),  -- Código IPRESS
    codigo_ipress VARCHAR(10),
    tipo_cita VARCHAR(50),
    
    -- 🏢 Organización
    id_bolsa INTEGER NOT NULL DEFAULT 107,  -- Constante para Módulo 107
    id_servicio INTEGER DEFAULT 1,
    
    -- 📊 Estado y Gestión
    estado VARCHAR(20) DEFAULT 'PENDIENTE',
    estado_gestion_citas_id BIGINT,  -- FK a estado_gestion_citas
    
    -- 📅 Fechas
    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_asignacion TIMESTAMP WITH TIME ZONE,
    
    -- 👥 Asignación
    responsable_gestora_id BIGINT,  -- FK a usuarios
    
    -- 🔄 Control
    activo BOOLEAN DEFAULT TRUE,
    
    -- Constraints
    CONSTRAINT fk_estado_gestion 
        FOREIGN KEY (estado_gestion_citas_id) 
        REFERENCES estado_gestion_citas(id_estado),
    
    CONSTRAINT fk_responsable 
        FOREIGN KEY (responsable_gestora_id) 
        REFERENCES usuarios(id_usuario)
);
```

#### **Campos Clave**

| Campo | Tipo | Descripción | Ejemplo |
|-------|------|-------------|---------|
| `numero_solicitud` | VARCHAR(50) | Identificador único BOL107 | `BOL107-1-1` |
| `paciente_dni` | VARCHAR(20) | DNI del paciente | `12345678` |
| `paciente_nombre` | VARCHAR(200) | Nombre completo | `Juan Pérez García` |
| `especialidad` | VARCHAR(100) | Especialidad médica | `PSICOLOGIA CENATE` |
| `id_bolsa` | INTEGER | Identificador de bolsa (107) | `107` |
| `estado_gestion_citas_id` | BIGINT | Estado actual | `1` (PENDIENTE) |
| `activo` | BOOLEAN | Soft delete | `true` |

#### **Índices**

```sql
-- 1. Índice único (Primary Key)
CREATE UNIQUE INDEX dim_solicitud_bolsa_pkey 
    ON dim_solicitud_bolsa (id_solicitud);

-- 2. Índice único para numero_solicitud
CREATE UNIQUE INDEX dim_solicitud_bolsa_numero_solicitud_key 
    ON dim_solicitud_bolsa (numero_solicitud);

-- 3. Índice compuesto para búsquedas del Módulo 107
CREATE INDEX idx_modulo107_busqueda 
    ON dim_solicitud_bolsa (id_bolsa, paciente_dni, especialidad, estado_gestion_citas_id)
    WHERE id_bolsa = 107 AND activo = true;

-- 4. Índice para búsqueda por nombre
CREATE INDEX idx_modulo107_nombre 
    ON dim_solicitud_bolsa (id_bolsa, paciente_nombre)
    WHERE id_bolsa = 107 AND activo = true;

-- 5. Índice para fecha de solicitud (reportes temporales)
CREATE INDEX idx_modulo107_fecha 
    ON dim_solicitud_bolsa (id_bolsa, fecha_solicitud DESC)
    WHERE id_bolsa = 107 AND activo = true;

-- 6. Índice para código IPRESS
CREATE INDEX idx_modulo107_ipress 
    ON dim_solicitud_bolsa (id_bolsa, codigo_adscripcion)
    WHERE id_bolsa = 107 AND activo = true;
```

#### **Registros de Ejemplo**

```sql
INSERT INTO dim_solicitud_bolsa (
    numero_solicitud, paciente_dni, paciente_nombre, 
    paciente_sexo, especialidad, codigo_adscripcion,
    id_bolsa, estado_gestion_citas_id
) VALUES 
(
    'BOL107-1-1',
    '12345678',
    'Juan Pérez García',
    'M',
    'PSICOLOGIA CENATE',
    'IPRESS001',
    107,
    1  -- PENDIENTE
),
(
    'BOL107-1-2',
    '87654321',
    'María López Sánchez',
    'F',
    'MEDICINA CENATE',
    'IPRESS002',
    107,
    3  -- ATENDIDO
);
```

---

### **2️⃣ bolsa_107_item** (LEGACY)

📋 **Schema:** `public`  
📍 **Propósito:** Tabla legacy para pacientes individuales  
⚠️ **Estado:** MIGRADA a `dim_solicitud_bolsa`

#### **Estructura DDL**
```sql
CREATE TABLE bolsa_107_item (
    id_item BIGSERIAL PRIMARY KEY,
    id_carga BIGINT NOT NULL,
    fecha_reporte DATE NOT NULL,
    registro VARCHAR(50) NOT NULL,
    tipo_documento VARCHAR(10),
    numero_documento VARCHAR(20),
    paciente VARCHAR(200),
    sexo VARCHAR(1),
    fecha_nacimiento DATE,
    telefono VARCHAR(30),
    tel_celular VARCHAR(30),
    correo_electronico VARCHAR(100),
    cod_ipress VARCHAR(10),
    opcion_ingreso VARCHAR(100),
    motivo_llamada TEXT,
    afiliacion VARCHAR(100),
    derivacion_interna VARCHAR(100),
    id_servicio_essi INTEGER,
    cod_servicio_essi VARCHAR(30),
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    observacion_origen TEXT,
    id_estado INTEGER NOT NULL DEFAULT 1,
    rol_asignado VARCHAR(50),
    usuario_asignado VARCHAR(100),
    observacion_gestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    id_admisionista_asignado BIGINT,
    fecha_asignacion_admisionista TIMESTAMP WITH TIME ZONE,
    id_gestor_asignado BIGINT,
    fecha_asignacion_gestor TIMESTAMP WITH TIME ZONE,
    tipo_apoyo VARCHAR(50),
    fecha_programacion DATE,
    turno VARCHAR(20),
    profesional VARCHAR(200),
    dni_profesional VARCHAR(20),
    especialidad VARCHAR(100),
    
    CONSTRAINT fk_carga FOREIGN KEY (id_carga) 
        REFERENCES bolsa_107_carga(id_carga)
);
```

#### **Migración a dim_solicitud_bolsa**

```sql
-- Todos los registros fueron migrados mediante V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql
-- Mapeo de campos:
-- 
-- bolsa_107_item.numero_documento → dim_solicitud_bolsa.paciente_dni
-- bolsa_107_item.paciente → dim_solicitud_bolsa.paciente_nombre
-- bolsa_107_item.derivacion_interna → dim_solicitud_bolsa.especialidad
-- bolsa_107_item.cod_ipress → dim_solicitud_bolsa.codigo_adscripcion
```

**Nota:** Esta tabla se mantiene solo para auditoría histórica.

---

### **3️⃣ bolsa_107_carga**

📋 **Schema:** `public`  
📍 **Propósito:** Registro de importaciones Excel (auditoría)

#### **Estructura DDL**
```sql
CREATE TABLE bolsa_107_carga (
    id_carga BIGSERIAL PRIMARY KEY,
    fecha_reporte DATE NOT NULL,
    nombre_archivo TEXT NOT NULL,
    hash_archivo TEXT NOT NULL,  -- SHA-256 para detectar duplicados
    total_filas INTEGER,
    filas_ok INTEGER,
    filas_error INTEGER,
    estado_carga TEXT NOT NULL DEFAULT 'RECIBIDO',  -- RECIBIDO | PROCESADO | ERROR
    usuario_carga TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT bolsa_107_carga_fecha_reporte_hash_archivo_key 
        UNIQUE (fecha_reporte, hash_archivo)
);
```

#### **Campos Clave**

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_carga` | BIGSERIAL | ID único de la carga |
| `nombre_archivo` | TEXT | Nombre del archivo Excel |
| `hash_archivo` | TEXT | Hash SHA-256 (evita duplicados) |
| `total_filas` | INTEGER | Filas totales procesadas |
| `filas_ok` | INTEGER | Filas importadas correctamente |
| `filas_error` | INTEGER | Filas con errores |
| `estado_carga` | TEXT | RECIBIDO \| PROCESADO \| ERROR |

#### **Ejemplo de Registro**

```sql
INSERT INTO bolsa_107_carga (
    fecha_reporte, nombre_archivo, hash_archivo,
    total_filas, filas_ok, filas_error, estado_carga, usuario_carga
) VALUES (
    '2026-01-30',
    'Pacientes_Modulo107_20260130.xlsx',
    'a3f5b9c2d1e4...',
    150,
    148,
    2,
    'PROCESADO',
    'admin@cenate.gob.pe'
);
```

---

### **4️⃣ bolsa_107_error**

📋 **Schema:** `public`  
📍 **Propósito:** Registro de errores durante importación

#### **Estructura DDL**
```sql
CREATE TABLE bolsa_107_error (
    id_error BIGSERIAL PRIMARY KEY,
    id_carga BIGINT NOT NULL,
    id_raw BIGINT,  -- FK a staging.bolsa_107_raw
    registro VARCHAR(50),
    codigo_error VARCHAR(50) NOT NULL,
    detalle_error TEXT,
    columnas_error VARCHAR(200),
    raw_json JSONB,  -- Datos originales en JSON
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    CONSTRAINT fk_carga_error FOREIGN KEY (id_carga) 
        REFERENCES bolsa_107_carga(id_carga)
);
```

#### **Tipos de Errores Comunes**

| Código Error | Descripción |
|--------------|-------------|
| `INVALID_DNI` | DNI inválido o vacío |
| `MISSING_REQUIRED_FIELD` | Campo obligatorio faltante |
| `INVALID_DATE` | Formato de fecha incorrecto |
| `INVALID_IPRESS` | Código IPRESS no existe |
| `DUPLICATE_ENTRY` | Registro duplicado |

#### **Ejemplo de Error**

```sql
INSERT INTO bolsa_107_error (
    id_carga, id_raw, registro, codigo_error, detalle_error, columnas_error
) VALUES (
    1,
    25,
    'REG-00025',
    'INVALID_DNI',
    'DNI debe tener 8 dígitos',
    'numero_documento'
);
```

---

### **5️⃣ staging.bolsa_107_raw**

📋 **Schema:** `staging`  
📍 **Propósito:** Tabla temporal para datos crudos de Excel

#### **Estructura DDL**
```sql
CREATE SCHEMA IF NOT EXISTS staging;

CREATE TABLE staging.bolsa_107_raw (
    raw_id BIGSERIAL PRIMARY KEY,
    id_carga BIGINT NOT NULL,
    
    -- Campos del Excel (sin validación)
    numero_documento VARCHAR(20),
    paciente VARCHAR(200),
    sexo VARCHAR(1),
    fecha_nacimiento VARCHAR(20),  -- String crudo
    telefono VARCHAR(30),
    tel_celular VARCHAR(30),
    correo_electronico VARCHAR(100),
    derivacion_interna VARCHAR(100),
    cod_ipress VARCHAR(10),
    id_servicio_essi VARCHAR(10),
    tipo_documento VARCHAR(10),
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Nota:** Los datos se validan y transforman antes de insertarse en `dim_solicitud_bolsa`.

---

### **6️⃣ estado_gestion_citas**

📋 **Schema:** `public`  
📍 **Propósito:** Catálogo de estados de gestión

#### **Estructura DDL**
```sql
CREATE TABLE estado_gestion_citas (
    id_estado BIGSERIAL PRIMARY KEY,
    nombre_estado VARCHAR(50) UNIQUE NOT NULL,
    descripcion TEXT,
    color_hex VARCHAR(7),  -- Para UI: #28a745
    orden INTEGER,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Estados Predefinidos**

```sql
INSERT INTO estado_gestion_citas (id_estado, nombre_estado, descripcion, color_hex, orden) VALUES
(1, 'PENDIENTE', 'Paciente en espera de asignación', '#ffc107', 1),
(2, 'EN_PROCESO', 'Paciente en proceso de atención', '#17a2b8', 2),
(3, 'ATENDIDO', 'Paciente atendido exitosamente', '#28a745', 3),
(4, 'CANCELADO', 'Atención cancelada', '#dc3545', 4),
(5, 'NO_CONTACTADO', 'No se pudo contactar al paciente', '#6c757d', 5);
```

---

## 🔄 MIGRACIONES

### **V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql**

📍 **Ubicación:** `backend/src/main/resources/db/migration/`  
📅 **Fecha:** 2026-01-29  
📝 **Propósito:** Migración de arquitectura v2.0 a v3.0

#### **Fases de la Migración**

##### **FASE 1: Inserción de Datos Migrados**
```sql
INSERT INTO dim_solicitud_bolsa (
    numero_solicitud,
    paciente_id,
    paciente_dni,
    paciente_nombre,
    tipo_documento,
    fecha_nacimiento,
    paciente_sexo,
    paciente_telefono,
    paciente_telefono_alterno,
    paciente_email,
    especialidad,
    codigo_adscripcion,
    codigo_ipress,
    id_bolsa,
    id_servicio,
    estado,
    estado_gestion_citas_id,
    fecha_solicitud,
    fecha_actualizacion,
    activo
)
SELECT
    CONCAT('BOL107-', b.id_carga, '-', b.id_item),        -- numero_solicitud
    b.numero_documento,                                     -- paciente_id
    b.numero_documento,                                     -- paciente_dni
    COALESCE(b.paciente, 'N/A'),                           -- paciente_nombre
    b.tipo_documento,                                       -- tipo_documento
    b.fecha_nacimiento,                                     -- fecha_nacimiento
    b.sexo,                                                 -- paciente_sexo
    b.telefono,                                             -- paciente_telefono
    b.tel_celular,                                          -- paciente_telefono_alterno
    b.correo_electronico,                                   -- paciente_email
    b.derivacion_interna,                                   -- especialidad
    b.cod_ipress,                                           -- codigo_adscripcion
    b.cod_ipress,                                           -- codigo_ipress
    107 AS id_bolsa,                                        -- BOLSA 107 constant
    COALESCE(b.id_servicio_essi, 1),                       -- id_servicio
    'PENDIENTE',                                            -- estado
    1 AS estado_gestion_citas_id,                           -- PENDIENTE state
    b.created_at,                                           -- fecha_solicitud
    CURRENT_TIMESTAMP,                                      -- fecha_actualizacion
    true AS activo                                          -- activo
FROM bolsa_107_item b
WHERE NOT EXISTS (
    SELECT 1 FROM dim_solicitud_bolsa dsb
    WHERE dsb.paciente_dni = b.numero_documento
      AND dsb.id_bolsa = 107
)
ON CONFLICT (numero_solicitud) DO NOTHING;
```

##### **FASE 2: Creación de Índices Optimizados**
```sql
-- Índice compuesto para búsquedas del Módulo 107
CREATE INDEX IF NOT EXISTS idx_modulo107_busqueda
    ON dim_solicitud_bolsa (id_bolsa, paciente_dni, especialidad, estado_gestion_citas_id)
    WHERE id_bolsa = 107 AND activo = true;

-- Índice para búsqueda por nombre
CREATE INDEX IF NOT EXISTS idx_modulo107_nombre
    ON dim_solicitud_bolsa (id_bolsa, paciente_nombre)
    WHERE id_bolsa = 107 AND activo = true;

-- Índice para fecha de solicitud
CREATE INDEX IF NOT EXISTS idx_modulo107_fecha
    ON dim_solicitud_bolsa (id_bolsa, fecha_solicitud DESC)
    WHERE id_bolsa = 107 AND activo = true;

-- Índice para código IPRESS
CREATE INDEX IF NOT EXISTS idx_modulo107_ipress
    ON dim_solicitud_bolsa (id_bolsa, codigo_adscripcion)
    WHERE id_bolsa = 107 AND activo = true;
```

##### **FASE 3: Stored Procedure v3**
```sql
CREATE OR REPLACE PROCEDURE fn_procesar_bolsa_107_v3(p_id_carga BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
  v_total_ok INT := 0;
  v_total_error INT := 0;
  v_numero_solicitud VARCHAR(50);
  v_item RECORD;
BEGIN
  -- Procesar cada fila de staging
  FOR v_item IN
    SELECT * FROM staging.bolsa_107_raw
    WHERE id_carga = p_id_carga
  LOOP
    v_numero_solicitud := CONCAT('BOL107-', p_id_carga, '-', v_item.raw_id);
    
    -- Insertar en dim_solicitud_bolsa
    INSERT INTO dim_solicitud_bolsa (
      numero_solicitud, paciente_dni, paciente_nombre, especialidad,
      codigo_adscripcion, id_bolsa, estado_gestion_citas_id, activo
    ) VALUES (
      v_numero_solicitud,
      v_item.numero_documento,
      COALESCE(v_item.paciente, 'N/A'),
      v_item.derivacion_interna,
      v_item.cod_ipress,
      107,
      1,  -- PENDIENTE
      true
    ) ON CONFLICT (numero_solicitud) DO NOTHING;
    
    IF FOUND THEN
      v_total_ok := v_total_ok + 1;
    ELSE
      v_total_error := v_total_error + 1;
    END IF;
  END LOOP;
  
  RAISE NOTICE 'Procesamiento OK:%, ERROR:%', v_total_ok, v_total_error;
END $$;
```

##### **FASE 4: Verificación de Integridad**
```sql
DO $$
DECLARE
  v_count_original BIGINT;
  v_count_migrado BIGINT;
BEGIN
  SELECT COUNT(*) INTO v_count_original FROM bolsa_107_item;
  SELECT COUNT(*) INTO v_count_migrado FROM dim_solicitud_bolsa WHERE id_bolsa = 107;
  
  RAISE NOTICE '╔════════════════════════════════════════╗';
  RAISE NOTICE '║  REPORTE DE MIGRACIÓN BOLSA 107       ║';
  RAISE NOTICE '╠════════════════════════════════════════╣';
  RAISE NOTICE '║ Original:  %', v_count_original;
  RAISE NOTICE '║ Migrado:   %', v_count_migrado;
  RAISE NOTICE '╚════════════════════════════════════════╝';
END $$;
```

---

## 🔍 QUERIES PRINCIPALES

### **Query 1: Listar Pacientes del Módulo 107 con Paginación**

```sql
SELECT 
    s.id_solicitud,
    s.numero_solicitud,
    s.paciente_dni,
    s.paciente_nombre,
    s.paciente_sexo,
    s.paciente_telefono,
    s.fecha_nacimiento,
    s.especialidad,
    s.codigo_adscripcion,
    s.tipo_cita,
    s.estado_gestion_citas_id,
    egc.nombre_estado,
    s.fecha_solicitud,
    s.fecha_asignacion,
    s.responsable_gestora_id
FROM dim_solicitud_bolsa s
LEFT JOIN estado_gestion_citas egc ON s.estado_gestion_citas_id = egc.id_estado
WHERE s.id_bolsa = 107 
  AND s.activo = true
ORDER BY s.fecha_solicitud DESC
LIMIT 30 OFFSET 0;
```

---

### **Query 2: Búsqueda Avanzada con Filtros**

```sql
SELECT *
FROM dim_solicitud_bolsa s
WHERE s.id_bolsa = 107 
  AND s.activo = true
  AND (
    :dni IS NULL OR s.paciente_dni LIKE '%' || :dni || '%'
  )
  AND (
    :nombre IS NULL OR LOWER(s.paciente_nombre) LIKE LOWER('%' || :nombre || '%')
  )
  AND (
    :codigoIpress IS NULL OR s.codigo_adscripcion = :codigoIpress
  )
  AND (
    :estadoId IS NULL OR s.estado_gestion_citas_id = :estadoId
  )
  AND (
    :fechaDesde IS NULL OR s.fecha_solicitud >= :fechaDesde
  )
  AND (
    :fechaHasta IS NULL OR s.fecha_solicitud <= :fechaHasta
  )
ORDER BY s.fecha_solicitud DESC;
```

---

### **Query 3: KPIs Generales**

```sql
SELECT 
    COUNT(*) as total_pacientes,
    COUNT(*) FILTER (WHERE estado_gestion_citas_id = 3) as atendidos,
    COUNT(*) FILTER (WHERE estado_gestion_citas_id = 1) as pendientes,
    COUNT(*) FILTER (WHERE estado_gestion_citas_id = 4) as cancelados,
    ROUND(AVG(EXTRACT(EPOCH FROM (fecha_asignacion - fecha_solicitud)) / 3600.0), 2) as horas_promedio_atencion
FROM dim_solicitud_bolsa
WHERE id_bolsa = 107 AND activo = true;
```

**Resultado:**
```
total_pacientes | atendidos | pendientes | cancelados | horas_promedio_atencion
----------------|-----------|------------|------------|------------------------
     1500       |    800    |    500     |    200     |         48.50
```

---

### **Query 4: Distribución por Estado**

```sql
SELECT 
    egc.nombre_estado as estado,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM dim_solicitud_bolsa dsb
INNER JOIN estado_gestion_citas egc ON dsb.estado_gestion_citas_id = egc.id_estado
WHERE dsb.id_bolsa = 107 AND dsb.activo = true
GROUP BY egc.nombre_estado
ORDER BY cantidad DESC;
```

**Resultado:**
```
     estado     | cantidad | porcentaje
----------------|----------|------------
    ATENDIDO    |   800    |   53.33
    PENDIENTE   |   500    |   33.33
    CANCELADO   |   200    |   13.33
```

---

### **Query 5: Top 10 IPRESS**

```sql
SELECT 
    dsb.codigo_adscripcion as codigo_ipress,
    di.nombre as nombre,
    COUNT(*) as cantidad
FROM dim_solicitud_bolsa dsb
LEFT JOIN dim_ipress di ON dsb.codigo_adscripcion = di.codigo
WHERE dsb.id_bolsa = 107 AND dsb.activo = true
GROUP BY dsb.codigo_adscripcion, di.nombre
ORDER BY cantidad DESC
LIMIT 10;
```

**Resultado:**
```
 codigo_ipress |          nombre              | cantidad
---------------|------------------------------|----------
  IPRESS001    | Hospital Nacional Rebagliati |   350
  IPRESS002    | Hospital Almenara            |   280
  IPRESS003    | Hospital Sabogal             |   220
```

---

### **Query 6: Evolución Temporal (30 días)**

```sql
SELECT 
    DATE(fecha_solicitud) as fecha,
    COUNT(*) as cantidad
FROM dim_solicitud_bolsa
WHERE id_bolsa = 107 
    AND activo = true
    AND fecha_solicitud >= NOW() - INTERVAL '30 days'
GROUP BY DATE(fecha_solicitud)
ORDER BY fecha ASC;
```

**Resultado:**
```
   fecha     | cantidad
-------------|----------
 2026-01-01  |    50
 2026-01-02  |    65
 2026-01-03  |    58
```

---

## 📐 DIAGRAMA DE RELACIONES

### **Modelo ER Simplificado**

```
┌─────────────────────────────┐
│  bolsa_107_carga            │
│  ────────────────────────── │
│  PK  id_carga               │
│      nombre_archivo         │
│      hash_archivo           │
│      total_filas            │
│      estado_carga           │
└──────────┬──────────────────┘
           │
           │ 1:N
           ↓
┌─────────────────────────────┐         ┌──────────────────────────────┐
│  staging.bolsa_107_raw      │         │  bolsa_107_error             │
│  ────────────────────────── │         │  ─────────────────────────── │
│  PK  raw_id                 │         │  PK  id_error                │
│  FK  id_carga               │────────→│  FK  id_carga                │
│      numero_documento       │         │  FK  id_raw                  │
│      paciente               │         │      codigo_error            │
│      ...                    │         │      detalle_error           │
└──────────┬──────────────────┘         └──────────────────────────────┘
           │
           │ Procesamiento
           ↓
┌─────────────────────────────────────────┐
│  dim_solicitud_bolsa ⭐                 │
│  ─────────────────────────────────────  │
│  PK  id_solicitud                       │
│      numero_solicitud (BOL107-X-Y)     │
│      paciente_dni                       │
│      paciente_nombre                    │
│      especialidad                       │
│      codigo_adscripcion                 │
│  FK  estado_gestion_citas_id           │───┐
│  FK  responsable_gestora_id            │   │
│      id_bolsa = 107                    │   │
│      activo = true                     │   │
└─────────────────────────────────────────┘   │
                                              │ N:1
                                              ↓
                            ┌──────────────────────────────┐
                            │  estado_gestion_citas        │
                            │  ─────────────────────────── │
                            │  PK  id_estado               │
                            │      nombre_estado           │
                            │      color_hex               │
                            └──────────────────────────────┘
```

---

## 📊 ESTADÍSTICAS DE TABLAS

### **Tamaño Estimado de Tablas**

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    n_live_tup AS row_count
FROM pg_stat_user_tables
WHERE tablename LIKE '%bolsa_107%' OR tablename = 'dim_solicitud_bolsa'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Resultado Ejemplo:**
```
 schemaname |      tablename       |  size  | row_count
------------|----------------------|--------|------------
 public     | dim_solicitud_bolsa  | 2048 kB|    1500
 public     | bolsa_107_item       | 1024 kB|    1450
 public     | bolsa_107_carga      |  64 kB |      15
 public     | bolsa_107_error      |  32 kB |      25
 staging    | bolsa_107_raw        |  16 kB |       0
```

---

## 🛡️ SEGURIDAD Y PERMISOS

### **Roles y Permisos PostgreSQL**

```sql
-- Crear rol de lectura para aplicación
CREATE ROLE cenate_app_reader;

GRANT SELECT ON dim_solicitud_bolsa TO cenate_app_reader;
GRANT SELECT ON estado_gestion_citas TO cenate_app_reader;
GRANT SELECT ON bolsa_107_carga TO cenate_app_reader;

-- Crear rol de escritura para importaciones
CREATE ROLE cenate_app_writer;

GRANT SELECT, INSERT, UPDATE ON dim_solicitud_bolsa TO cenate_app_writer;
GRANT SELECT, INSERT ON bolsa_107_carga TO cenate_app_writer;
GRANT SELECT, INSERT ON bolsa_107_error TO cenate_app_writer;
GRANT ALL ON staging.bolsa_107_raw TO cenate_app_writer;
```

---

## 🔧 MANTENIMIENTO

### **Vacuum y Analyze**

```sql
-- Vacuum regular para liberar espacio
VACUUM ANALYZE dim_solicitud_bolsa;
VACUUM ANALYZE bolsa_107_item;

-- Vacuum full (offline) para compactación total
VACUUM FULL bolsa_107_item;
```

### **Reindex**

```sql
-- Reindexar índices del Módulo 107
REINDEX INDEX idx_modulo107_busqueda;
REINDEX INDEX idx_modulo107_nombre;
REINDEX INDEX idx_modulo107_fecha;
REINDEX INDEX idx_modulo107_ipress;
```

---

## 📝 NOTAS TÉCNICAS

### **Soft Delete**
- Usar `activo = false` en lugar de `DELETE`
- Permite auditoría y recuperación de datos
- Queries deben incluir `WHERE activo = true`

### **Nomenclatura de Índices**
- Prefijo `idx_` para índices regulares
- Prefijo `idx_modulo107_` para índices específicos del Módulo 107
- Nombre descriptivo del propósito

### **Timezone**
- Usar `TIMESTAMP WITH TIME ZONE` para fechas
- Almacenar siempre en UTC
- Convertir a zona local en la aplicación

---

## 📚 REFERENCIAS

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Flyway Migrations](https://flywaydb.org/)

---

**Última actualización:** 2026-01-30  
**Versión del documento:** 1.0.0  
**Mantenedor:** Equipo de Base de Datos CENATE
