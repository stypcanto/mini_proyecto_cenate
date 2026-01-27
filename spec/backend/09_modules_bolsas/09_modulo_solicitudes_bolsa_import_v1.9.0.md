# 📋 Módulo Solicitudes de Bolsa - Importación Excel v1.9.0

> **Importación de Excel con enriquecimiento automático de datos**
> **Versión:** v1.9.0 (2026-01-26)
> **Status:** ✅ Production Ready

---

## 📚 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Cambios en v1.9.0](#cambios-en-v190)
3. [Arquitectura](#arquitectura)
4. [Campos de Excel v1.8.0](#campos-de-excel-v180)
5. [Enriquecimiento de Datos](#enriquecimiento-de-datos)
6. [DTO y Mapper](#dto-y-mapper)
7. [API Endpoints](#api-endpoints)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Verificación](#verificación)

---

## Visión General

El módulo de Solicitudes de Bolsa permite importar pacientes desde archivos Excel. El sistema:
- ✅ Lee datos de Excel con 10 campos estructurados (v1.8.0)
- ✅ Valida campos obligatorios
- ✅ Enriquece datos desde tablas auxiliares (asegurados, IPRESS, RED)
- ✅ Inserta directamente en `dim_solicitud_bolsa`
- ✅ Devuelve datos completos a través de la API

**Tabla principal:** `dim_solicitud_bolsa` (43 columnas)

---

## Cambios en v1.9.0

### ✨ Nuevas Características

| Área | Cambio | Versión |
|------|--------|---------|
| **Excel Import** | Bypassed staging → Direct JPA insertion | v1.8.0 |
| **DTO** | Agregados 11 campos Excel + v1.9.0 | v1.8.0 |
| **Mapper** | Mapea todos los campos a DTO | v1.8.0 |
| **Enriquecimiento** | IPRESS y RED automáticas | v1.9.0 |
| **Asegurados** | Sexo, email, fecha nacimiento | v1.8.0 |

### 🔧 Archivos Modificados

```
backend/src/main/java/
├── com/styp/cenate/
│   ├── service/form107/
│   │   └── ExcelImportService.java        ⭐ CORE LOGIC
│   ├── dto/bolsas/
│   │   └── SolicitudBolsaDTO.java        ⭐ EXTENDED
│   └── mapper/
│       └── SolicitudBolsaMapper.java     ⭐ ALL FIELDS
└── frontend/src/
    └── pages/bolsas/
        └── Solicitudes.jsx               ⭐ DISPLAY
```

---

## Arquitectura

### Flujo de Importación

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUARIO SUBE EXCEL DESDE FRONTEND                    │
│    - Selecciona TIPO BOLSA (ej: 4 = EXPLOTACIÓN DATOS)  │
│    - Selecciona SERVICIO (ej: 89 = NEUMONOLOGÍA)        │
│    - Carga archivo Excel                                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 2. CONTROLLER RECIBE REQUEST                            │
│    POST /api/bolsas/solicitudes/importar                │
│    - Valida tipo de archivo (.xlsx)                     │
│    - Calcula hash SHA256                                │
│    - Crea registro en bolsa_107_carga                   │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 3. EXCEL IMPORT SERVICE - leerExcelYProcesarDirecto()   │
│    ┌──────────────────────────────────────────────────┐ │
│    │ Para cada fila del Excel:                        │ │
│    │ ✓ Lee 10 campos                                 │ │
│    │ ✓ Valida campos obligatorios                    │ │
│    │ ✓ Enriquece desde dim_asegurados (DNI)          │ │
│    │ ✓ Enriquece desde dim_ipress (COD IPRESS)       │ │
│    │ ✓ Genera número solicitud único                 │ │
│    │ ✓ Crea entidad SolicitudBolsa                   │ │
│    └──────────────────────────────────────────────────┘ │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 4. INSERCIÓN BATCH EN BD                                │
│    - solicitudRepository.saveAll(solicitudes)           │
│    - Todas las solicitudes en transacción atómica       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 5. ACTUALIZAR HEADER DE CARGA                           │
│    - Actualizar bolsa_107_carga con estadísticas       │
│    - Estado = PROCESADO                                 │
│    - Total filas = n                                    │
│    - Filas OK = n                                       │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 6. RESPUESTA AL FRONTEND                                │
│    {                                                    │
│      "idCarga": 43,                                     │
│      "estadoCarga": "PROCESADO",                        │
│      "totalFilas": 39,                                  │
│      "filasOk": 39,                                     │
│      "filasError": 0,                                   │
│      "mensaje": "Importados 39 registros exitosamente" │
│    }                                                    │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│ 7. FRONTEND MUESTRA DATOS                               │
│    GET /api/bolsas/solicitudes?idBolsa=4               │
│    - Obtiene todas las solicitudes                      │
│    - Muestra en tabla con:                             │
│      • IPRESS enriquecida ✅                           │
│      • RED asistencial enriquecida ✅                  │
│      • Sexo, teléfono, email ✅                        │
│      • Tipo cita ✅                                    │
└─────────────────────────────────────────────────────────┘
```

---

## Campos de Excel v1.8.0

**Archivo esperado:** `.xlsx` (Excel 2007+)
**Hoja:** Primera hoja (index 0)
**Encabezados:** Fila 1

### Mapeo de Columnas

| Excel v1.8.0 | Tipo | Obligatorio | BD Field | Enriquecimiento |
|---|---|---|---|---|
| FECHA PREFERIDA QUE NO FUE ATENDIDA | LocalDate | ❌ | fecha_preferida_no_atendida | - |
| TIPO DOCUMENTO | String | ✅ | tipo_documento | - |
| DNI | String | ✅ | paciente_dni | **Clave de enriquecimiento** |
| ASEGURADO | String | ✅ | paciente_nombre | - |
| SEXO | String | ❌ | paciente_sexo | ✅ De dim_asegurados |
| FECHA DE NACIMIENTO | LocalDate | ❌ | fecha_nacimiento | ✅ De dim_asegurados |
| TELÉFONO | String | ❌ | paciente_telefono | - |
| CORREO | String | ❌ | paciente_email | ✅ De dim_asegurados |
| COD. IPRESS ADSCRIPCIÓN | String | ❌ | codigo_ipress_adscripcion | **Clave de enriquecimiento** |
| TIPO CITA | String | ❌ | tipo_cita | - |

**Total campos:** 10
**Campos obligatorios:** 3 (TIPO DOCUMENTO, DNI, ASEGURADO)
**Campos enriquecibles:** 5 (SEXO, FECHA NACIMIENTO, CORREO, IPRESS, RED)

---

## Enriquecimiento de Datos

El sistema enriquece automáticamente los datos desde tablas relacionadas:

### 1. Enriquecimiento desde `dim_asegurados` (por DNI)

Cuando el DNI existe en `dim_asegurados`:

```java
// Si SEXO está vacío en Excel → usa sexo de dim_asegurados
pacienteSexo = asegurado.isPresent() && isBlank(sexo)
    ? asegurado.get().getSexo()          // M, F, etc.
    : sexo;

// Si FECHA NACIMIENTO está vacía → usa fecha de dim_asegurados
fechaNacimiento = asegurado.isPresent() && isBlank(fechaNac)
    ? asegurado.get().getFecnacimpaciente()
    : parseLocalDate(fechaNac);

// Si CORREO está vacío → usa correo de dim_asegurados
pacienteEmail = asegurado.isPresent() && isBlank(correo)
    ? asegurado.get().getCorreoElectronico()
    : correo;
```

### 2. Enriquecimiento desde `dim_ipress` (por COD. IPRESS)

Cuando el código IPRESS existe en `dim_ipress`:

```java
Optional<Ipress> ipressOpt = ipressRepository.findByCodIpress(codigoIpress);
if (ipressOpt.isPresent()) {
    Ipress ipress = ipressOpt.get();

    // Obtener nombre IPRESS
    nombreIpress = ipress.getDescIpress();      // "HOSPITAL UNIVERSITARIO..."

    // Obtener ID IPRESS
    idIpress = ipress.getIdIpress();            // 1, 2, 3...

    // Obtener RED asistencial
    redAsistencial = ipress.getRed()
        .getDescripcion();                      // "RED METROPOLITANA"
}
```

### 3. Enriquecimiento desde `dim_tipos_bolsas` y `dim_servicio_essi`

```java
TipoBolsa tipoBolsa = tipoBolsaRepository.findById(idTipoBolsa)
    .orElseThrow(...);

// Obtener información de tipo bolsa
codTipoBolsa = tipoBolsa.getCodTipoBolsa();     // "BOLSAS_EXPLOTADATOS"
descTipoBolsa = tipoBolsa.getDescTipoBolsa();   // "Bolsas Explotación de..."

DimServicioEssi servicio = servicioRepository.findById(idServicio)
    .orElseThrow(...);

// Obtener información de servicio
codServicio = servicio.getCodServicio();        // "AE1"
especialidad = servicio.getDescServicio();      // "NEUMONOLOGIA"
```

---

## DTO y Mapper

### SolicitudBolsaDTO (v1.8.0)

La DTO ahora incluye todos los 43 campos de la tabla:

```java
@Data
@Builder
public class SolicitudBolsaDTO {
    // === IDENTIFICACIÓN ===
    private Long idSolicitud;
    private String numeroSolicitud;

    // === DATOS PACIENTE (Básico) ===
    private Long pacienteId;
    private String pacienteNombre;
    private String pacienteDni;
    private String especialidad;

    // === CAMPOS EXCEL v1.8.0 (NUEVO) ===
    private LocalDate fechaPreferidaNoAtendida;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private String pacienteSexo;
    private String pacienteTelefono;
    private String pacienteEmail;
    private Integer pacienteEdad;
    private String codigoIpressAdscripcion;
    private String tipoCita;

    // === FECHAS v1.9.0 (NUEVO) ===
    private OffsetDateTime fechaCita;
    private OffsetDateTime fechaAtencion;

    // === BOLSA Y SERVICIO ===
    private Long idBolsa;
    private String codTipoBolsa;
    private String descTipoBolsa;
    private String nombreBolsa;
    private Long idServicio;
    private String codServicio;

    // === IPRESS Y RED (ENRIQUECIDO) ===
    private String codigoAdscripcion;
    private Long idIpress;
    private String nombreIpress;           // ⭐ NUEVO
    private String redAsistencial;        // ⭐ NUEVO

    // === ESTADO Y AUDITORÍA ===
    private String estado;
    private String razonRechazo;
    private String notasAprobacion;
    private Long solicitanteId;
    private String solicitanteNombre;
    private Long responsableAprobacionId;
    private String responsableAprobacionNombre;
    private OffsetDateTime fechaSolicitud;
    private OffsetDateTime fechaAprobacion;
    private OffsetDateTime fechaActualizacion;
    private Long responsableGestoraId;
    private OffsetDateTime fechaAsignacion;
    private Long estadoGestionCitasId;
    private String codEstadoCita;
    private String descEstadoCita;
    private Boolean activo;
    private Boolean recordatorioEnviado;
}
```

### SolicitudBolsaMapper.toDTO()

El mapper mapea cada campo de la entidad al DTO:

```java
public static SolicitudBolsaDTO toDTO(SolicitudBolsa entity) {
    return SolicitudBolsaDTO.builder()
        // Identificación
        .idSolicitud(entity.getIdSolicitud())
        .numeroSolicitud(entity.getNumeroSolicitud())

        // Datos paciente
        .pacienteDni(entity.getPacienteDni())
        .pacienteId(entity.getPacienteId())
        .pacienteNombre(entity.getPacienteNombre())
        .especialidad(entity.getEspecialidad())

        // === CAMPOS EXCEL v1.8.0 ===
        .fechaPreferidaNoAtendida(entity.getFechaPreferidaNoAtendida())
        .tipoDocumento(entity.getTipoDocumento())
        .fechaNacimiento(entity.getFechaNacimiento())
        .pacienteSexo(entity.getPacienteSexo())
        .pacienteTelefono(entity.getPacienteTelefono())
        .pacienteEmail(entity.getPacienteEmail())
        .pacienteEdad(entity.getPacienteEdad())
        .codigoIpressAdscripcion(entity.getCodigoIpressAdscripcion())
        .tipoCita(entity.getTipoCita())

        // === FECHAS v1.9.0 ===
        .fechaCita(entity.getFechaCita())
        .fechaAtencion(entity.getFechaAtencion())

        // Bolsa y servicio
        .idBolsa(entity.getIdBolsa())
        .codTipoBolsa(entity.getCodTipoBolsa())
        .descTipoBolsa(entity.getDescTipoBolsa())
        .nombreBolsa(entity.getDescTipoBolsa())
        .idServicio(entity.getIdServicio())
        .codServicio(entity.getCodServicio())

        // === IPRESS Y RED ===
        .codigoAdscripcion(entity.getCodigoAdscripcion())
        .idIpress(entity.getIdIpress())
        .nombreIpress(entity.getNombreIpress())        // ⭐ NEW
        .redAsistencial(entity.getRedAsistencial())   // ⭐ NEW

        // Estado
        .estado(entity.getEstado())
        .razonRechazo(entity.getRazonRechazo())
        // ... resto de campos
        .build();
}
```

---

## API Endpoints

### 1. Importar Excel

```http
POST /api/bolsas/solicitudes/importar
Content-Type: multipart/form-data

Form Data:
  - file: <archivo.xlsx>
  - idTipoBolsa: 4
  - idServicio: 89
  - usuarioCarga: admin
```

**Respuesta exitosa (200):**
```json
{
  "idCarga": 43,
  "estadoCarga": "PROCESADO",
  "totalFilas": 39,
  "filasOk": 39,
  "filasError": 0,
  "hashArchivo": "abc123...",
  "nombreArchivo": "BOLSA_OTORRINO_26012026.xlsx",
  "mensaje": "Importados 39 registros exitosamente"
}
```

### 2. Listar Solicitudes por Bolsa

```http
GET /api/bolsas/solicitudes
Accept: application/json
```

**Respuesta:**
```json
[
  {
    "id_solicitud": 378,
    "numero_solicitud": "SOL-2026-521716-039",
    "paciente_dni": "16656886",
    "paciente_nombre": "VITON CERDAN YSMENIA",
    "tipo_documento": "DNI",
    "paciente_sexo": "F",
    "fecha_nacimiento": "1967-12-10",
    "paciente_telefono": "988580045",
    "paciente_email": "viton@example.com",
    "codigo_ipress_adscripcion": "740",
    "nombre_ipress": "HOSPITAL UNIVERSITARIO DE CARDIOLOGIA",
    "red_asistencial": "RED METROPOLITANA",
    "tipo_cita": "RECITA",
    "especialidad": "OTORRINOLARINGOLOGIA",
    "cod_tipo_bolsa": "BOLSAS_EXPLOTADATOS",
    "desc_tipo_bolsa": "Bolsas Explotación de Datos...",
    "estado": "PENDIENTE",
    "estado_gestion_citas_id": 5,
    "activo": true
  },
  ...
]
```

### 3. Obtener Solicitud por ID

```http
GET /api/bolsas/solicitudes/{id}
```

---

## Ejemplos de Uso

### Ejemplo 1: Importar desde curl

```bash
curl -X POST \
  -F "file=@PLANTILLA_SOLICITUD_BOLSA_CORREGIDA_v2.xlsx" \
  -F "idTipoBolsa=4" \
  -F "idServicio=89" \
  -F "usuarioCarga=admin" \
  http://localhost:8080/api/bolsas/solicitudes/importar
```

### Ejemplo 2: Verificar datos en BD

```sql
-- Ver registros importados
SELECT
  id_solicitud,
  numero_solicitud,
  paciente_dni,
  paciente_sexo,
  paciente_telefono,
  nombre_ipress,
  red_asistencial,
  tipo_cita,
  especialidad
FROM dim_solicitud_bolsa
WHERE id_bolsa = 4
LIMIT 5;
```

**Resultado:**
```
id_solicitud | numero_solicitud    | paciente_dni | paciente_sexo | paciente_telefono | nombre_ipress           | red_asistencial    | tipo_cita | especialidad
-------------|---------------------|--------------|---------------|-------------------|-------------------------|--------------------|-----------|--------------------
378          | SOL-2026-521716-039 | 16656886     | F             | 988580045         | HOSPITAL UNIVERSITARIO  | RED METROPOLITANA  | RECITA    | OTORRINOLARINGOLOGIA
379          | SOL-2026-521717-040 | 33589223     | F             | 976966975         | HOSPITAL DISTRITAL      | RED PERIFERICA     | RECITA    | OTORRINOLARINGOLOGIA
```

### Ejemplo 3: Obtener desde API

```bash
curl -s "http://localhost:8080/api/bolsas/solicitudes" | jq '.[0] | {
  numero_solicitud,
  paciente_dni,
  paciente_sexo,
  paciente_telefono,
  nombre_ipress,
  red_asistencial,
  tipo_cita
}'
```

---

## Verificación

### Checklist Post-Importación

- ✅ Registros en `dim_solicitud_bolsa`
- ✅ Campos Excel rellenados correctamente
- ✅ IPRESS enriquecida (nombre obtenido de `dim_ipress`)
- ✅ RED asistencial enriquecida (de relación IPRESS→RED)
- ✅ Asegurados enriquecidos (sexo, email, fecha nacimiento de `dim_asegurados`)
- ✅ Números de solicitud únicos generados
- ✅ Estado = PENDIENTE
- ✅ API devolviendo todos los campos

### Consultas de Verificación

```sql
-- 1. Contar registros importados
SELECT COUNT(*) as total FROM dim_solicitud_bolsa WHERE id_bolsa = 4;

-- 2. Verificar enriquecimiento IPRESS
SELECT
  COUNT(CASE WHEN nombre_ipress IS NOT NULL THEN 1 END) as con_ipress,
  COUNT(CASE WHEN red_asistencial IS NOT NULL THEN 1 END) as con_red
FROM dim_solicitud_bolsa
WHERE id_bolsa = 4;

-- 3. Verificar enriquecimiento Asegurados
SELECT
  COUNT(CASE WHEN paciente_sexo IS NOT NULL THEN 1 END) as con_sexo,
  COUNT(CASE WHEN fecha_nacimiento IS NOT NULL THEN 1 END) as con_fecha_nac,
  COUNT(CASE WHEN paciente_email IS NOT NULL THEN 1 END) as con_email
FROM dim_solicitud_bolsa
WHERE id_bolsa = 4;

-- 4. Ver un registro completo
SELECT * FROM dim_solicitud_bolsa
WHERE id_bolsa = 4
LIMIT 1 \gx
```

---

## Problemas Comunes y Soluciones

### Problema 1: "Código IPRESS no encontrado"
**Síntoma:** `nombre_ipress` = NULL en BD
**Solución:**
- Verificar que el código IPRESS existe en `dim_ipress`
- Verificar ortografía del código en Excel

```sql
SELECT cod_ipress, desc_ipress FROM dim_ipress WHERE cod_ipress = '740';
```

### Problema 2: "RED no se rellena"
**Síntoma:** `red_asistencial` = NULL en BD
**Solución:**
- La IPRESS debe tener relación con una RED
- Verificar en `dim_ipress` que `id_red` no sea NULL

```sql
SELECT di.cod_ipress, di.desc_ipress, dr.descripcion
FROM dim_ipress di
JOIN dim_red dr ON di.id_red = dr.id_red
WHERE di.cod_ipress = '740';
```

### Problema 3: "API devuelve NULL para nuevos campos"
**Síntoma:** `paciente_sexo`, `nombre_ipress` null en API
**Solución:**
- Reiniciar el servidor Spring Boot (compilación necesaria)
- Verificar que el Mapper está mapeando todos los campos

---

## Historial de Cambios

### v1.9.0 (2026-01-26)
- ✅ Agregado enriquecimiento automático de IPRESS y RED
- ✅ Actualizado DTO con 11 campos nuevos
- ✅ Actualizado Mapper con mapeo completo
- ✅ Documentación actualizada

### v1.8.0 (2026-01-25)
- ✅ Implementado Excel import directo sin staging
- ✅ Agregados 10 campos Excel v1.8.0
- ✅ Enriquecimiento desde dim_asegurados
- ✅ API devuelve todos los campos

### v1.6.0 (anterior)
- ✅ CRUD básico de solicitudes
- ✅ Estados de gestión de citas

---

## Referencias

- **Tabla:** `dim_solicitud_bolsa` (43 campos)
- **Staging:** `staging.bolsa_107_raw` (antiguo, no usado)
- **Carga:** `bolsa_107_carga` (auditoría)
- **Servicio:** `ExcelImportService` (core logic)
- **DTO:** `SolicitudBolsaDTO` (respuestas API)
- **Mapper:** `SolicitudBolsaMapper` (entity↔DTO)
- **Repository:** `SolicitudBolsaRepository` (persistencia)

---

## 🎯 Próximos Pasos

1. **Validación de IPRESS:** Agregar validación para códigos IPRESS inválidos
2. **Auto-cálculo de EDAD:** Calcular automáticamente de fecha_nacimiento
3. **Reportes de Importación:** Dashboard con estadísticas
4. **Exportación de Solicitudes:** Generar reportes en Excel
5. **Sincronización de Cambios:** Actualizar solicitudes después de aprobación

---

**Documentación generada:** 2026-01-26
**Autor:** Sistema CENATE v1.9.0
**Status:** ✅ Production Ready
