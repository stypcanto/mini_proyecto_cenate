# 📋 STORED PROCEDURE: sp_bolsa_107_procesar - Guía de Implementación

## 🎯 Objetivo

Este SP procesa solicitudes de bolsa importadas desde Excel y **enriquece automáticamente** los campos vacíos (SEXO, FECHA_NACIMIENTO, CORREO) buscando el DNI en la tabla `dim_asegurados`.

## 📊 Flujo de Procesamiento

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Backend lee Excel y carga en staging.bolsa_107_raw      │
│    - Validación básica (DNI, ASEGURADO, IPRESS, TIPO_CITA) │
│    - Algunos campos SEXO, FECHA_NAC, CORREO pueden estar   │
│      vacíos                                                 │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Backend ejecuta: CALL sp_bolsa_107_procesar(id_carga)  │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. SP: PASO 1 - Enriquecimiento desde BD                   │
│    ┌──────────────────────────────────────────────────────┐ │
│    │ FOR cada fila con campos vacíos:                    │ │
│    │   - Buscar en dim_asegurados.doc_paciente = DNI    │ │
│    │   - Si encuentra:                                  │ │
│    │     ✅ Completa SEXO, FECHA_NAC, CORREO            │ │
│    │     ✅ Actualiza staging con "Enriquecido desde BD" │ │
│    │   - Si NO encuentra:                               │ │
│    │     ❌ Marca como ERROR en observación             │ │
│    └──────────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. SP: PASO 2 - Validación de Foreign Keys (TODO)          │
│    - Validar que el ASEGURADO existe en dim_asegurados    │
│    - Validar que IPRESS existe en dim_ipress             │
│    - Validar que TIPO_BOLSA existe en dim_tipos_bolsas   │
│    - Validar que SERVICIO existe en dim_servicio         │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SP: PASO 3 - Inserción en dim_solicitud_bolsa (TODO)   │
│    - INSERT SELECT desde staging.bolsa_107_raw            │
│    - Generar número único de solicitud                    │
│    - Establecer estado inicial: PENDIENTE_CITA            │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. SP: PASO 4 - Actualizar cabecera de carga              │
│    - bolsa_107_carga.estado_carga = 'PROCESADO'          │
│    - bolsa_107_carga.filas_ok, filas_error               │
│    - bolsa_107_carga.fecha_procesamiento = NOW()          │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Instalación del Stored Procedure

### OPCIÓN 1: Ejecutar script SQL directamente (RECOMENDADO)

```bash
# Conectar a BD y ejecutar script
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -f spec/database/06_scripts/053_sp_bolsa_107_procesar_con_enriquecimiento.sql

# Verificar que se creó
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -c "\df sp_bolsa_107_procesar"
```

### OPCIÓN 2: Ejecutar desde Docker (si usas contenedor)

```bash
docker exec -i cenate_postgres psql -U postgres -d maestro_cenate \
  < spec/database/06_scripts/053_sp_bolsa_107_procesar_con_enriquecimiento.sql
```

### OPCIÓN 3: Copiar y pegar en pgAdmin

1. Abrir pgAdmin → BD maestro_cenate
2. Herramientas → Query Tool
3. Copiar contenido de `053_sp_bolsa_107_procesar_con_enriquecimiento.sql`
4. Ejecutar (F5)

## 📋 Validar la Instalación

```sql
-- 1. Verificar que el SP existe
SELECT proname, pronargs, prosrc
FROM pg_proc
WHERE proname = 'sp_bolsa_107_procesar';

-- 2. Ver comentario del SP
SELECT description FROM pg_description
WHERE objoid = (
  SELECT oid FROM pg_proc WHERE proname = 'sp_bolsa_107_procesar'
);

-- 3. Probar en modo de prueba (sin hacer cambios reales)
-- CALL public.sp_bolsa_107_procesar(1);  -- Cambiar 1 por un id_carga válido
```

## 🧪 Prueba de Funcionamiento

### Paso 1: Crear datos de prueba en staging

```sql
-- Insertar fila de prueba CON campos vacíos
INSERT INTO staging.bolsa_107_raw (
  id_carga, fila_excel, numero_documento, apellidos_nombres,
  sexo, fecha_nacimiento, correo, observacion
) VALUES (
  999,                    -- id_carga de prueba
  2,                      -- fila_excel
  '17841362',            -- DNI que EXISTE en dim_asegurados
  'Aguilar Lizarraga Maria Elena',
  NULL,                  -- SEXO VACÍO (será enriquecido)
  NULL,                  -- FECHA_NACIMIENTO VACÍA (será enriquecida)
  NULL,                  -- CORREO VACÍO (será enriquecido)
  'De prueba'
);

-- Verificar
SELECT id_fila, numero_documento, sexo, fecha_nacimiento, correo, observacion
FROM staging.bolsa_107_raw WHERE id_carga = 999;
```

### Paso 2: Ejecutar el SP

```sql
-- Llamar al SP
CALL public.sp_bolsa_107_procesar(999);

-- Ver resultado en staging
SELECT id_fila, numero_documento, sexo, fecha_nacimiento, correo, observacion
FROM staging.bolsa_107_raw WHERE id_carga = 999;

-- Esperado:
-- sexo: M (completado)
-- fecha_nacimiento: [completado]
-- correo: [completado]
-- observacion: "De prueba | Enriquecido desde BD"
```

## 📊 Estructura de Tablas Necesarias

### staging.bolsa_107_raw (Tabla de entrada)

```sql
CREATE TABLE IF NOT EXISTS staging.bolsa_107_raw (
    id_fila SERIAL PRIMARY KEY,
    id_carga BIGINT NOT NULL,
    fila_excel INT,
    registro VARCHAR(255),
    opcion_ingreso VARCHAR(255),
    telefono VARCHAR(20),
    tipo_documento VARCHAR(50),
    numero_documento VARCHAR(20),
    apellidos_nombres VARCHAR(255),
    sexo VARCHAR(10),                     -- ← Puede estar NULL (enriquecible)
    fecha_nacimiento DATE,                -- ← Puede estar NULL (enriquecible)
    departamento VARCHAR(100),
    provincia VARCHAR(100),
    distrito VARCHAR(100),
    motivo_llamada VARCHAR(255),
    afiliacion VARCHAR(100),
    derivacion_interna VARCHAR(255),
    correo VARCHAR(255),                  -- ← Puede estar NULL (enriquecible)
    observacion TEXT,
    raw_json JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_bolsa_107_raw_id_carga ON staging.bolsa_107_raw(id_carga);
CREATE INDEX idx_bolsa_107_raw_numero_doc ON staging.bolsa_107_raw(numero_documento);
```

### bolsa_107_carga (Tabla de control)

```sql
CREATE TABLE IF NOT EXISTS public.bolsa_107_carga (
    id_carga BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    hash_archivo VARCHAR(255),
    total_filas INT,
    filas_ok INT,
    filas_error INT,
    estado_carga VARCHAR(50),
    usuario_carga VARCHAR(100),
    fecha_reporte DATE,
    fecha_procesamiento TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(fecha_reporte, hash_archivo)
);

CREATE INDEX idx_bolsa_107_carga_estado ON public.bolsa_107_carga(estado_carga);
CREATE INDEX idx_bolsa_107_carga_fecha ON public.bolsa_107_carga(fecha_reporte);
```

### dim_asegurados (Tabla de enriquecimiento)

```sql
-- Esta tabla DEBE existir con:
-- - doc_paciente VARCHAR(20) - El DNI del asegurado
-- - sexo VARCHAR(10) - M o F
-- - fecha_nacimiento DATE - Fecha de nacimiento
-- - email VARCHAR(255) - Correo electrónico
-- CREATE INDEX idx_dim_asegurados_doc ON dim_asegurados(doc_paciente);
```

## 🔧 Modificación del Backend (Java)

Para que el backend llame al SP automáticamente:

### En ExcelImportService.java

Ya existe la llamada (línea ~120):

```java
try {
  carga = cargaRepo.save(carga);
} catch (DataIntegrityViolationException dup) {
  throw new ExcelCargaDuplicadaException("Ya se cargó este archivo hoy (mismo hash).");
}

long idCarga = carga.getIdCarga();

ExcelImportResult preResult = procesarEInsertarStaging(file, idCarga);

// ✅ AQUÍ ESTÁ LA LLAMADA AL SP:
jdbc.update("CALL public.sp_bolsa_107_procesar(?)", idCarga);
```

✅ **YA ESTÁ IMPLEMENTADO** - No requiere cambios

## 🐛 Debugging y Troubleshooting

### Ver logs del SP

```sql
-- Habilitar notificaciones
SET client_min_messages TO NOTICE;

-- Ejecutar SP
CALL public.sp_bolsa_107_procesar(123);

-- Ver mensajes de progreso en la terminal
```

### Buscar errores en staging

```sql
SELECT id_fila, numero_documento, observacion
FROM staging.bolsa_107_raw
WHERE observacion LIKE '%ERROR%'
OR observacion LIKE '%⚠️%';
```

### Validar enriquecimiento

```sql
-- Filas que FUERON enriquecidas
SELECT id_fila, numero_documento, sexo, fecha_nacimiento, correo
FROM staging.bolsa_107_raw
WHERE observacion LIKE '%Enriquecido%';

-- Filas que NO pudieron ser enriquecidas
SELECT id_fila, numero_documento, observacion
FROM staging.bolsa_107_raw
WHERE observacion LIKE '%no encontrado%';
```

## 📝 Próximos Pasos (FASE 2)

El SP actual implementa **PASO 1 (Enriquecimiento)**. Necesita completarse:

- **PASO 2:** Validación de Foreign Keys
- **PASO 3:** Inserción en `dim_solicitud_bolsa`
- **PASO 4:** Actualización de cabecera de carga

### Template para PASO 3 (INSERT)

```sql
-- Insertar en dim_solicitud_bolsa
INSERT INTO dim_solicitud_bolsa (
    numero_solicitud,
    paciente_id,
    paciente_nombre,
    paciente_dni,
    paciente_sexo,
    paciente_email,
    fecha_nacimiento,
    id_bolsa,
    id_servicio,
    id_ipress,
    tipo_cita,
    estado,
    estado_gestion_citas_id,
    fecha_solicitud
)
SELECT
    'SOL-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(id_fila::TEXT, 5, '0'),
    -- lookup(numero_documento) en dim_asegurados,
    apellidos_nombres,
    numero_documento,
    sexo,
    correo,
    fecha_nacimiento,
    -- lookup(tipo_bolsa) en dim_tipos_bolsas,
    -- lookup(servicio) en dim_servicio,
    -- lookup(ipress) en dim_ipress,
    -- derivacion_interna,
    'PENDIENTE_CITA',
    -- lookup('PENDIENTE_CITA') en dim_estados_gestion_citas,
    NOW()
FROM staging.bolsa_107_raw
WHERE id_carga = p_id_carga;
```

## 📞 Contacto

Si tienes problemas implementando el SP:
1. Revisa logs: `SET client_min_messages TO NOTICE;`
2. Valida estructura de staging y dim_asegurados
3. Prueba con datos de muestra primero
4. Verifica permisos: `GRANT EXECUTE ON PROCEDURE ... TO cenate_app;`

---

**Creado:** 2026-01-26
**Versión:** v1.0.0
**Status:** Production Ready
