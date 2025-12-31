# Módulo Formulario 107 (Bolsa 107) - Documentación Técnica

> Sistema de importación masiva de pacientes desde archivos Excel

**Versión:** v1.14.0
**Fecha:** 2025-12-30
**Commit:** c9dada8 - "Formulario 107"

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [¿Qué es la Bolsa 107?](#qué-es-la-bolsa-107)
3. [Arquitectura del Módulo](#arquitectura-del-módulo)
4. [Modelo de Datos](#modelo-de-datos)
5. [Flujo de Importación](#flujo-de-importación)
6. [Backend (Java/Spring)](#backend-javaspring)
7. [Frontend (HTML/JavaScript)](#frontend-htmljavascript)
8. [Validaciones](#validaciones)
9. [Manejo de Errores](#manejo-de-errores)
10. [Casos de Uso](#casos-de-uso)

---

## Resumen Ejecutivo

### ¿Qué hace este módulo?

Sistema que permite **importar masivamente** datos de pacientes desde archivos **Excel (.xlsx)** para ser asignados y gestionados por los coordinadores de CENATE.

### Características Principales

| Característica | Descripción |
|----------------|-------------|
| **Importación Excel** | Sube archivos .xlsx con datos de pacientes |
| **Validación Completa** | 14 columnas esperadas, 6 obligatorias |
| **Staging Area** | Tabla temporal antes de validar |
| **Detección Duplicados** | Hash SHA-256 del archivo |
| **Gestión de Errores** | Tabla específica para errores de validación |
| **Asignación Automática** | Asigna pacientes a coordinadores |
| **UI Moderna** | Interfaz drag & drop con Bootstrap 5 |

### Componentes

| Componente | Cantidad | Descripción |
|------------|----------|-------------|
| **Entidades JPA** | 3 | Bolsa107Carga, Bolsa107Item, Bolsa107Error |
| **Repositories** | 4 | + 1 DAO con queries nativas |
| **Services** | 2 | ExcelImportService (429 líneas), Bolsa107DataService (239 líneas) |
| **Controllers** | 1 | ImportExcelController (5 endpoints) |
| **Frontend** | 2 archivos | formulario.html (468 líneas), formulario.js (330 líneas) |
| **Tablas BD** | 4 | Cabecera, Items, Errores, Staging (raw) |

---

## ¿Qué es la Bolsa 107?

### Contexto de Negocio

La **Bolsa 107** es una lista de pacientes asegurados de EsSalud que requieren atención médica especializada y que ingresan al sistema CENATE para ser asignados a médicos disponibles.

### ¿Por qué "107"?

Posiblemente referencia a un código interno de EsSalud o al tipo de reporte/formulario que se genera desde otros sistemas.

### Flujo de Negocio

```
┌─────────────────────────────────────────────────────────────┐
│              FLUJO COMPLETO DE LA BOLSA 107                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Sistema externo genera Excel con lista de pacientes     │
│                    ↓                                         │
│  2. Coordinador descarga el Excel                           │
│                    ↓                                         │
│  3. Coordinador sube el Excel a CENATE                      │
│     (formularios/formulario107/formulario.html)             │
│                    ↓                                         │
│  4. Sistema valida archivo:                                 │
│     • Hash único (evita duplicados del día)                 │
│     • Formato Excel correcto                                │
│     • Columnas esperadas                                    │
│                    ↓                                         │
│  5. Carga a tabla staging (bolsa_107_raw)                   │
│     • Todas las filas sin validar                           │
│                    ↓                                         │
│  6. Stored Procedure ejecuta validaciones:                  │
│     • Campos obligatorios presentes                         │
│     • Formatos correctos (fechas, DNI, etc.)                │
│     • Coherencia de datos                                   │
│                    ↓                                         │
│  7. Separación en 2 grupos:                                 │
│     ✅ FILAS OK → bolsa_107_item (listos para asignar)      │
│     ❌ FILAS ERROR → bolsa_107_error (requieren corrección) │
│                    ↓                                         │
│  8. Coordinador visualiza resultados:                       │
│     • Total de filas procesadas                             │
│     • Filas OK (tabla verde con DataTables)                 │
│     • Filas con error (tabla roja con detalles)             │
│                    ↓                                         │
│  9. Coordinador asigna pacientes OK a médicos               │
│     (flujo manual o automático - futuro)                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Arquitectura del Módulo

### Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (HTML + JS)                      │
│  formularios/formulario107/formulario.html                   │
│  formularios/formulario107/js/formulario.js                  │
│    • Drag & Drop de archivos Excel                          │
│    • Validación cliente (solo .xlsx)                        │
│    • Upload multipart/form-data                             │
│    • DataTables para visualizar resultados                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ POST /api/import-excel/pacientes
                           │ (MultipartFile)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (Spring Boot)                     │
│  ImportExcelController.java                                  │
│    • POST /api/import-excel/pacientes                       │
│    • GET /api/import-excel/pacientes/{id}/datos             │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
│  ExcelImportService.java (429 líneas)                        │
│    • Validar formato Excel                                   │
│    • Calcular hash SHA-256                                   │
│    • Crear cabecera de carga                                 │
│    • Leer Excel con Apache POI                               │
│    • Batch insert a staging (bolsa_107_raw)                  │
│    • Ejecutar SP de procesamiento                            │
│    • Actualizar totales en cabecera                          │
│                                                              │
│  Bolsa107DataService.java                                    │
│    • Obtener items OK de una carga                           │
│    • Obtener errores de una carga                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   REPOSITORY LAYER                           │
│  Bolsa107CargaRepository.java                                │
│  Bolsa107ItemRepository.java                                 │
│  Bolsa107ErrorRepository.java                                │
│  Bolsa107RawDao.java (queries nativas)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │ JDBC / HikariCP
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    POSTGRESQL DATABASE                       │
│                                                              │
│  staging.bolsa_107_raw (tabla temporal)                      │
│    └─ Todas las filas del Excel sin validar                 │
│                                                              │
│  public.bolsa_107_carga (tabla de cabecera)                  │
│    ├─ id_carga (PK)                                          │
│    ├─ nombre_archivo, hash_archivo                           │
│    ├─ total_filas, filas_ok, filas_error                     │
│    └─ UNIQUE(fecha_reporte, hash_archivo)                    │
│                                                              │
│  public.bolsa_107_item (pacientes OK)                        │
│    └─ 25 columnas con datos de paciente                      │
│                                                              │
│  public.bolsa_107_error (filas con error)                    │
│    ├─ codigo_error, detalle_error                            │
│    ├─ columnas_error (qué columnas fallaron)                 │
│    └─ raw_json (datos originales en JSONB)                   │
│                                                              │
│  STORED PROCEDURE: fn_procesar_bolsa_107_v2()                │
│    └─ Lee de staging, valida, separa OK/ERROR                │
└─────────────────────────────────────────────────────────────┘
```

---

## Modelo de Datos

### 1. Bolsa107Carga.java (Cabecera de Importación)

**Tabla:** `public.bolsa_107_carga`

```java
@Entity
@Table(name = "bolsa_107_carga",
       uniqueConstraints = @UniqueConstraint(
           columnNames = {"fecha_reporte", "hash_archivo"}))
public class Bolsa107Carga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idCarga;

    private LocalDate fechaReporte;        // Fecha del reporte (hoy por default)
    private String nombreArchivo;          // "Bolsa107_2025-12-30.xlsx"
    private String hashArchivo;            // SHA-256 del archivo

    private Integer totalFilas;            // Total de filas procesadas
    private Integer filasOk;               // Filas válidas
    private Integer filasError;            // Filas con errores

    private String estadoCarga;            // RECIBIDO, STAGING_CARGADO, PROCESADO
    private String usuarioCarga;           // DNI del coordinador

    private OffsetDateTime createdAt;
}
```

**Constraint Importante:**
```sql
UNIQUE(fecha_reporte, hash_archivo)
```
- Evita cargar el mismo archivo dos veces en el mismo día
- Si se intenta, lanza `ExcelCargaDuplicadaException`

### 2. Bolsa107Item.java (Pacientes Válidos)

**Tabla:** `public.bolsa_107_item`

**25 Columnas:**

| Categoría | Columnas |
|-----------|----------|
| **Identificación** | idItem, idCarga, fechaReporte, registro |
| **Datos Personales** | tipoDocumento, numeroDocumento, paciente (nombre), sexo, fechaNacimiento, telefono |
| **Origen de Llamada** | opcionIngreso, motivoLlamada, afiliacion, derivacionInterna |
| **Servicio Médico** | idServicioEssi, codServicioEssi |
| **Ubicación Geográfica** | departamento, provincia, distrito |
| **Gestión** | idEstado, rolAsignado, usuarioAsignado, observacionGestion, observacionOrigen |
| **Auditoría** | createdAt, updatedAt |

**Estados del Paciente:**
```
1 = PENDIENTE_ASIGNACION   (recién ingresado, sin coordinador)
2 = ASIGNADO               (tiene coordinador asignado)
3 = EN_GESTION             (coordinador está gestionando)
4 = ATENDIDO               (cita realizada)
5 = CANCELADO              (paciente canceló)
6 = NO_CONTACTADO          (no se pudo contactar)
```

### 3. Bolsa107Error.java (Filas con Errores)

**Tabla:** `public.bolsa_107_error`

```java
@Entity
@Table(name = "bolsa_107_error")
public class Bolsa107Error {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idError;

    private Long idCarga;              // FK a bolsa_107_carga
    private Long idRaw;                // FK a staging.bolsa_107_raw

    private String registro;           // Número de registro del Excel
    private String codigoError;        // ERR_CAMPO_OBLIGATORIO, ERR_FORMATO_FECHA, etc.
    private String detalleError;       // Descripción legible del error
    private String columnasError;      // "DNI,SEXO,FechaNacimiento"

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String rawJson;            // Datos originales en JSON

    private OffsetDateTime createdAt;
}
```

**Códigos de Error Comunes:**
```
ERR_CAMPO_OBLIGATORIO     - Falta campo requerido (DNI, SEXO, etc.)
ERR_FORMATO_FECHA         - Fecha inválida o formato incorrecto
ERR_DNI_INVALIDO          - DNI no tiene 8 dígitos
ERR_SEXO_INVALIDO         - Sexo no es M/F
ERR_DERIVACION_VACIA      - Campo DERIVACION INTERNA vacío
ERR_SERVICIO_NO_EXISTE    - Código de servicio ESSI no encontrado
```

### 4. Staging: bolsa_107_raw (Tabla Temporal)

**Schema:** `staging.bolsa_107_raw`

**Propósito:** Recibir TODAS las filas del Excel antes de validar.

**Estructura:**
- Mismo número de columnas que Bolsa107Item
- Sin restricciones (todos los campos TEXT/VARCHAR)
- Permite insertar datos "sucios"
- Se limpia después del procesamiento (opcional)

---

## Flujo de Importación

### Paso a Paso Detallado

#### 1. Usuario Selecciona Archivo

**Frontend:**
```javascript
// formulario.js
function handleFileSelect(file) {
    // Validación cliente: solo .xlsx o .xls
    const nameOk = /\.(xlsx|xls)$/i.test(file.name);
    if (!nameOk) {
        alert('Por favor selecciona un archivo Excel válido');
        return;
    }
    selectedFile = file;
    // Mostrar info del archivo
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
}
```

#### 2. Envío al Backend

**Frontend:**
```javascript
async function uploadFile() {
    const formData = new FormData();
    formData.append('file', selectedFile);

    const response = await fetch(`${API_BASE}/pacientes`, {
        method: 'POST',
        body: formData
    });

    importResult = await response.json();
    mostrarResultados(importResult);
}
```

**Backend:**
```java
@PostMapping(value = "/pacientes",
             consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<?> importarPacientes(@RequestParam("file") MultipartFile file) {
    Map<String, Object> result = service.importarYProcesar(file, "70073164");
    return ResponseEntity.ok(result);
}
```

#### 3. Validación del Archivo

**ExcelImportService.java:**
```java
private void validateOnlyXlsx(MultipartFile file) {
    String nombre = file.getOriginalFilename();
    if (nombre == null || !nombre.toLowerCase().endsWith(".xlsx")) {
        throw new ExcelValidationException("Solo se permiten archivos .xlsx");
    }
}
```

#### 4. Cálculo de Hash (Evitar Duplicados)

```java
private String sha256Hex(MultipartFile file) {
    try (InputStream is = file.getInputStream()) {
        MessageDigest md = MessageDigest.getInstance("SHA-256");
        byte[] buffer = new byte[8192];
        int read;
        while ((read = is.read(buffer)) != -1) {
            md.update(buffer, 0, read);
        }
        byte[] hash = md.digest();
        return bytesToHex(hash);
    } catch (Exception e) {
        throw new RuntimeException("Error al calcular hash", e);
    }
}
```

#### 5. Crear Cabecera de Carga

```java
Bolsa107Carga carga = Bolsa107Carga.builder()
    .nombreArchivo(file.getOriginalFilename())
    .hashArchivo(hash)
    .usuarioCarga("70073164")  // DNI del coordinador
    .estadoCarga("RECIBIDO")
    .fechaReporte(LocalDate.now())
    .build();

try {
    carga = cargaRepo.save(carga);
} catch (DataIntegrityViolationException dup) {
    // UNIQUE(fecha_reporte, hash_archivo)
    throw new ExcelCargaDuplicadaException(
        "Ya se cargó este archivo hoy (mismo hash).");
}
```

#### 6. Lectura del Excel (Apache POI)

```java
private ExcelImportResult procesarEInsertarStaging(MultipartFile file, long idCarga) {
    try (InputStream is = file.getInputStream();
         Workbook wb = new XSSFWorkbook(is)) {

        Sheet sheet = wb.getSheetAt(0);
        Row headerRow = sheet.getRow(0);

        // Validar columnas esperadas
        validarColumnas(headerRow);

        // Leer todas las filas
        List<Bolsa107RawRow> rawRows = new ArrayList<>();
        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (isEmptyRow(row)) continue;

            Bolsa107RawRow rawRow = leerFila(row, idCarga, i);
            rawRows.add(rawRow);
        }

        // Batch insert a staging
        rawDao.insertarBatch(rawRows);

        return calcularTotales(rawRows);
    }
}
```

#### 7. Insert Masivo a Staging

**Bolsa107RawDao.java:**
```java
@Transactional
public void insertarBatch(List<Bolsa107RawRow> rows) {
    String sql = "INSERT INTO staging.bolsa_107_raw (...) VALUES (?,?,?,...)";

    jdbc.batchUpdate(sql, new BatchPreparedStatementSetter() {
        @Override
        public void setValues(PreparedStatement ps, int i) throws SQLException {
            Bolsa107RawRow r = rows.get(i);
            ps.setLong(1, r.getIdCarga());
            ps.setString(2, r.getRegistro());
            ps.setString(3, r.getTipoDocumento());
            // ... 25 columnas más
        }

        @Override
        public int getBatchSize() {
            return rows.size();
        }
    });
}
```

#### 8. Ejecutar Stored Procedure de Validación

```java
@Transactional
public Map<String, Object> importarYProcesar(MultipartFile file, String usuario) {
    // ... pasos anteriores ...

    // Ejecutar SP que valida y separa OK/ERROR
    jdbc.call("{call fn_procesar_bolsa_107_v2(?)}", idCarga);

    // Obtener totales actualizados
    Bolsa107Carga cargaFinal = cargaRepo.findById(idCarga).orElseThrow();

    return Map.of(
        "id_carga", cargaFinal.getIdCarga(),
        "total_filas", cargaFinal.getTotalFilas(),
        "filas_ok", cargaFinal.getFilasOk(),
        "filas_error", cargaFinal.getFilasError(),
        "estado", cargaFinal.getEstadoCarga()
    );
}
```

**Stored Procedure (PostgreSQL):**
```sql
CREATE OR REPLACE FUNCTION fn_procesar_bolsa_107_v2(p_id_carga BIGINT)
RETURNS VOID AS $$
BEGIN
    -- 1. Validar filas y separar en OK/ERROR

    -- 2. Insertar filas OK en bolsa_107_item
    INSERT INTO public.bolsa_107_item (...)
    SELECT ... FROM staging.bolsa_107_raw
    WHERE id_carga = p_id_carga
      AND [VALIDACIONES PASAN];

    -- 3. Insertar filas ERROR en bolsa_107_error
    INSERT INTO public.bolsa_107_error (...)
    SELECT ... FROM staging.bolsa_107_raw
    WHERE id_carga = p_id_carga
      AND [VALIDACIONES FALLAN];

    -- 4. Actualizar totales en cabecera
    UPDATE public.bolsa_107_carga
    SET total_filas = ...,
        filas_ok = ...,
        filas_error = ...,
        estado_carga = 'PROCESADO'
    WHERE id_carga = p_id_carga;
END;
$$ LANGUAGE plpgsql;
```

#### 9. Visualizar Resultados en Frontend

```javascript
function mostrarResultados(result) {
    // Estadísticas generales
    document.getElementById('totalFilas').textContent = result.total_filas;
    document.getElementById('filasOk').textContent = result.filas_ok;
    document.getElementById('filasError').textContent = result.filas_error;

    // Cargar items OK en tabla
    cargarDatosTabla(result.id_carga);
}

async function cargarDatosTabla(idCarga) {
    const response = await fetch(`${API_BASE}/pacientes/${idCarga}/datos`);
    const datos = await response.json();

    // DataTables para items OK
    $('#tableItems').DataTable({
        data: datos.items,
        columns: [
            { data: 'registro' },
            { data: 'numeroDocumento' },
            { data: 'paciente' },
            { data: 'telefono' },
            { data: 'derivacionInterna' }
            // ... más columnas
        ]
    });

    // DataTables para errores
    $('#tableErrores').DataTable({
        data: datos.errores,
        columns: [
            { data: 'registro' },
            { data: 'codigoError' },
            { data: 'detalleError' },
            { data: 'columnasError' }
        ]
    });
}
```

---

## Backend (Java/Spring)

### Controller: ImportExcelController.java

**Endpoints:**

| Método | Ruta | Descripción | Request | Response |
|--------|------|-------------|---------|----------|
| POST | `/api/import-excel/pacientes` | Importar archivo Excel | `MultipartFile` | Resultado de importación |
| GET | `/api/import-excel/cargas` | Listar todas las cargas importadas | - | Lista de cargas con estadísticas |
| GET | `/api/import-excel/pacientes/{id}/datos` | Obtener items y errores de una carga | Path: idCarga | Items + Errores |
| DELETE | `/api/import-excel/cargas/{id}` | Eliminar una carga | Path: idCarga | Confirmación de eliminación |
| GET | `/api/import-excel/cargas/{id}/exportar` | Exportar carga a archivo Excel | Path: idCarga | Archivo .xlsx (binary) |

**Ejemplo Request:**
```http
POST /api/import-excel/pacientes
Content-Type: multipart/form-data

file: [archivo.xlsx]
```

**Ejemplo Response:**
```json
{
  "id_carga": 42,
  "total_filas": 150,
  "filas_ok": 145,
  "filas_error": 5,
  "estado": "PROCESADO",
  "nombre_archivo": "Bolsa107_2025-12-30.xlsx"
}
```

**Ejemplo Request: Listar Cargas**
```http
GET /api/import-excel/cargas
```

**Ejemplo Response:**
```json
{
  "status": 200,
  "data": [
    {
      "id_carga": 42,
      "fecha_reporte": "2025-12-30",
      "nombre_archivo": "Bolsa107_2025-12-30.xlsx",
      "total_filas": 150,
      "filas_ok": 145,
      "filas_error": 5,
      "estado_carga": "PROCESADO",
      "usuario_carga": "70073164",
      "created_at": "2025-12-30T09:30:00-05:00"
    },
    {
      "id_carga": 41,
      "fecha_reporte": "2025-12-29",
      "nombre_archivo": "Bolsa107_2025-12-29.xlsx",
      "total_filas": 200,
      "filas_ok": 198,
      "filas_error": 2,
      "estado_carga": "PROCESADO",
      "usuario_carga": "70073164",
      "created_at": "2025-12-29T10:15:00-05:00"
    }
  ],
  "message": "Lista de cargas obtenida correctamente"
}
```

**Ejemplo Request: Eliminar Carga**
```http
DELETE /api/import-excel/cargas/42
```

**Ejemplo Response:**
```json
{
  "status": 200,
  "message": "Carga eliminada correctamente"
}
```

**Ejemplo Request: Exportar Carga**
```http
GET /api/import-excel/cargas/42/exportar
```

**Ejemplo Response:**
```
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="bolsa_107_carga_42.xlsx"
Content-Length: 45632

[Binary Excel data]
```

**Nota sobre Exportación:**
- El archivo Excel exportado contiene 2 hojas:
  1. **"Pacientes Importados"**: Todos los items OK de la carga
  2. **"Errores"**: Filas con errores de validación (solo si hay errores)
- Columnas auto-ajustadas para mejor lectura
- Headers con formato (negrita, fondo gris)

### Service: ExcelImportService.java (429 líneas)

**Métodos Principales:**

```java
@Service
public class ExcelImportService {

    // Método principal
    @Transactional
    public Map<String, Object> importarYProcesar(MultipartFile file, String usuario) {
        validateOnlyXlsx(file);
        String hash = sha256Hex(file);
        Bolsa107Carga carga = crearCabecera(file, hash, usuario);
        ExcelImportResult result = procesarEInsertarStaging(file, carga.getIdCarga());
        ejecutarStoredProcedure(carga.getIdCarga());
        return construirRespuesta(carga);
    }

    // Validación de formato
    private void validateOnlyXlsx(MultipartFile file) { ... }

    // Hash del archivo
    private String sha256Hex(MultipartFile file) { ... }

    // Crear cabecera
    private Bolsa107Carga crearCabecera(...) { ... }

    // Leer Excel y cargar staging
    private ExcelImportResult procesarEInsertarStaging(MultipartFile file, Long idCarga) { ... }

    // Ejecutar SP de validación
    private void ejecutarStoredProcedure(Long idCarga) { ... }
}
```

### Service: Bolsa107DataService.java (239 líneas)

**Métodos Principales:**

```java
@Service
public class Bolsa107DataService {

    // Listar todas las cargas importadas
    public List<Map<String, Object>> obtenerListaCargas() {
        List<Bolsa107Carga> cargas = cargaRepository.findAll();
        return cargas.stream()
            .map(this::mapCargaToResponse)
            .collect(Collectors.toList());
    }

    // Obtener detalles completos de una carga (items + errores)
    public Map<String, Object> obtenerDatosCarga(Long idCarga) {
        Bolsa107Carga carga = cargaRepository.findById(idCarga)
            .orElseThrow(() -> new RuntimeException("Carga no encontrada"));

        List<Map<String, Object>> items = itemRepository.findAllByIdCarga(idCarga);
        List<Map<String, Object>> errores = errorRepository.findAllByIdCarga(idCarga);

        return Map.of(
            "id_carga", carga.getIdCarga(),
            "fecha_reporte", carga.getFechaReporte(),
            "nombre_archivo", carga.getNombreArchivo(),
            "total_items", items.size(),
            "total_errores", errores.size(),
            "items", items,
            "errores", errores
        );
    }

    // Eliminar una carga (elimina cascada: items + errores)
    @Transactional
    public void eliminarCarga(Long idCarga) {
        Bolsa107Carga carga = cargaRepository.findById(idCarga)
            .orElseThrow(() -> new RuntimeException("Carga no encontrada"));

        log.info("Eliminando carga: {} - {}", idCarga, carga.getNombreArchivo());

        // El DELETE cascada eliminará items y errores automáticamente
        cargaRepository.delete(carga);

        log.info("Carga {} eliminada exitosamente", idCarga);
    }

    // Exportar carga a archivo Excel (2 hojas: Pacientes + Errores)
    public byte[] exportarCargaExcel(Long idCarga) {
        Bolsa107Carga carga = cargaRepository.findById(idCarga)
            .orElseThrow(() -> new RuntimeException("Carga no encontrada"));

        List<Bolsa107Item> items = itemRepository.findByIdCarga_IdCarga(idCarga);
        List<Bolsa107Error> errores = errorRepository.findByIdCarga_IdCarga(idCarga);

        try (Workbook workbook = new XSSFWorkbook()) {
            // Hoja 1: Pacientes Importados
            Sheet sheetItems = workbook.createSheet("Pacientes Importados");
            crearHojaPacientes(sheetItems, items, workbook);

            // Hoja 2: Errores (solo si existen)
            if (!errores.isEmpty()) {
                Sheet sheetErrores = workbook.createSheet("Errores");
                crearHojaErrores(sheetErrores, errores, workbook);
            }

            // Convertir a bytes
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Error al generar Excel: " + e.getMessage(), e);
        }
    }

    // Helpers privados para formatear Excel
    private void crearHojaPacientes(Sheet sheet, List<Bolsa107Item> items, Workbook wb) { ... }
    private void crearHojaErrores(Sheet sheet, List<Bolsa107Error> errores, Workbook wb) { ... }
    private CellStyle crearEstiloHeader(Workbook wb) { ... }
}
```

**Características del Servicio:**
- ✅ CRUD completo de cargas (Listar, Obtener, Eliminar)
- ✅ Exportación a Excel con Apache POI
- ✅ Manejo de cascada (eliminar carga = eliminar items + errores)
- ✅ Generación de Excel con 2 hojas (Pacientes + Errores)
- ✅ Auto-ajuste de columnas y estilos en Excel

---

## Frontend (HTML/JavaScript)

### formulario.html (468 líneas)

**Características:**

- ✅ **Bootstrap 5** para estilos modernos
- ✅ **Drag & Drop** de archivos
- ✅ **DataTables** para visualización de resultados
- ✅ **Bootstrap Icons** para íconos
- ✅ **Diseño responsivo** (mobile-friendly)
- ✅ **Gradientes modernos** (violeta/púrpura)

**Secciones:**

1. **Zona de Upload:**
   - Drag & drop visual
   - Click para seleccionar archivo
   - Preview de archivo seleccionado

2. **Resultados:**
   - Cards con estadísticas (total, OK, errores)
   - Tabla de items OK (verde)
   - Tabla de errores (roja)

### formulario.js (330 líneas)

**Funciones Principales:**

```javascript
// Configuración
const API_BASE = "http://localhost:8080/api/import-excel";

// Manejo de archivos
function handleFileSelect(file) { ... }
function uploadFile() { ... }
function resetUpload() { ... }

// Visualización de resultados
function mostrarResultados(result) { ... }
function cargarDatosTabla(idCarga) { ... }

// Helpers
function formatFileSize(bytes) { ... }
function showLoading() { ... }
function hideLoading() { ... }
```

**DataTables Configuración:**

```javascript
$('#tableItems').DataTable({
    data: datos.items,
    language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/es-ES.json'
    },
    order: [[0, 'asc']],
    pageLength: 25,
    responsive: true
});
```

---

## Validaciones

### Columnas Esperadas del Excel (14 columnas)

```java
private static final List<String> EXPECTED_COLUMNS = List.of(
    "REGISTRO",
    "OPCIONES DE INGRESO DE LLAMADA",
    "TELEFONO",
    "TIPO DOCUMENTO",
    "DNI",
    "APELLIDOS Y NOMBRES",
    "SEXO",
    "FechaNacimiento",
    "DEPARTAMENTO",
    "PROVINCIA",
    "DISTRITO",
    "MOTIVO DE LA LLAMADA",
    "AFILIACION",
    "DERIVACION INTERNA"
);
```

### Campos Obligatorios (6 campos)

```java
private static final List<String> REQUIRED = List.of(
    "TIPO DOCUMENTO",
    "DNI",
    "APELLIDOS Y NOMBRES",
    "SEXO",
    "FechaNacimiento",
    "DERIVACION INTERNA"
);
```

### Validaciones en Stored Procedure

```sql
-- 1. Campos obligatorios no vacíos
WHERE tipo_documento IS NOT NULL AND tipo_documento != ''
  AND numero_documento IS NOT NULL AND numero_documento != ''
  AND paciente IS NOT NULL AND paciente != ''
  AND sexo IS NOT NULL AND sexo != ''
  AND fecha_nacimiento IS NOT NULL
  AND derivacion_interna IS NOT NULL AND derivacion_interna != ''

-- 2. DNI tiene 8 dígitos
  AND LENGTH(numero_documento) = 8
  AND numero_documento ~ '^[0-9]+$'

-- 3. Sexo es M o F
  AND sexo IN ('M', 'F')

-- 4. Fecha de nacimiento es válida
  AND fecha_nacimiento <= CURRENT_DATE
  AND fecha_nacimiento >= '1900-01-01'

-- 5. Teléfono (opcional) tiene formato válido
  AND (telefono IS NULL OR telefono ~ '^[0-9]{9}$')
```

---

## Manejo de Errores

### Excepciones Personalizadas

```java
// ExcelCargaDuplicadaException.java
@ResponseStatus(HttpStatus.CONFLICT)
public class ExcelCargaDuplicadaException extends RuntimeException {
    public ExcelCargaDuplicadaException(String message) {
        super(message);
    }
}

// ExcelValidationException.java
@ResponseStatus(HttpStatus.BAD_REQUEST)
public class ExcelValidationException extends RuntimeException {
    public ExcelValidationException(String message) {
        super(message);
    }
}
```

### Manejo Global

```java
// GlobalExceptionHandler.java
@ExceptionHandler(ExcelCargaDuplicadaException.class)
public ResponseEntity<?> handleDuplicado(ExcelCargaDuplicadaException ex) {
    return ResponseEntity.status(HttpStatus.CONFLICT)
        .body(Map.of("error", ex.getMessage()));
}

@ExceptionHandler(ExcelValidationException.class)
public ResponseEntity<?> handleValidacion(ExcelValidationException ex) {
    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
        .body(Map.of("error", ex.getMessage()));
}
```

---

## Casos de Uso

### Caso 1: Importación Exitosa

**Escenario:** 150 filas, todas válidas.

```
1. Coordinador sube "Bolsa107_2025-12-30.xlsx"
2. Sistema calcula hash: "a3f2c9..."
3. Verifica: No existe carga con ese hash hoy ✓
4. Crea cabecera (id_carga=42, estado=RECIBIDO)
5. Lee Excel: 150 filas
6. Inserta 150 filas en staging.bolsa_107_raw
7. Ejecuta SP de validación
8. Resultado: 150 OK, 0 errores
9. Response: {id_carga: 42, filas_ok: 150, filas_error: 0}
10. Frontend muestra tabla verde con 150 pacientes
```

### Caso 2: Importación con Errores

**Escenario:** 150 filas, 5 con errores (DNI vacío, sexo inválido).

```
1. Coordinador sube archivo
2. Sistema procesa normalmente hasta staging
3. SP de validación detecta:
   - Fila 15: DNI vacío → bolsa_107_error
   - Fila 23: Sexo = "X" → bolsa_107_error
   - Fila 78: Fecha nacimiento = 2030-01-01 → bolsa_107_error
   - Fila 99: DNI = "123" (solo 3 dígitos) → bolsa_107_error
   - Fila 120: Derivación vacía → bolsa_107_error
4. Resultado: 145 OK, 5 errores
5. Frontend muestra:
   - Tabla verde: 145 pacientes listos
   - Tabla roja: 5 filas con detalles de error
```

### Caso 3: Archivo Duplicado

**Escenario:** Se intenta cargar el mismo archivo dos veces en el mismo día.

```
1. Primera carga: exitosa (id_carga=42, hash="a3f2c9...")
2. Segunda carga (mismo archivo, mismo día):
   - Hash calculado: "a3f2c9..." (igual)
   - Intenta insertar cabecera
   - UNIQUE constraint violation (fecha_reporte + hash_archivo)
   - Lanza ExcelCargaDuplicadaException
3. Response HTTP 409 Conflict:
   {
     "error": "Ya se cargó este archivo hoy (mismo hash)."
   }
4. Frontend muestra alert con error
```

### Caso 4: Archivo con Formato Incorrecto

**Escenario:** Archivo .csv o .xls antiguo.

```
1. Usuario selecciona "datos.csv"
2. Validación frontend: extensión no es .xlsx
3. Alert: "Por favor selecciona un archivo Excel válido (.xlsx)"
4. No se envía al backend
```

---

## Próximas Mejoras (Roadmap)

### Fase 2 (v1.15.0)

- [ ] **Asignación automática de pacientes**
  - Distribuir pacientes OK a coordinadores según carga
  - Reglas de asignación configurables

- [ ] **Notificaciones**
  - Email a coordinadores cuando se asignan pacientes
  - Alertas de pacientes no contactados

- [ ] **Dashboard de gestión**
  - Ver todas las cargas históricas
  - Filtros por fecha, usuario, estado
  - Exportar reportes

### Fase 3 (v1.16.0)

- [ ] **Validaciones avanzadas**
  - Validar contra catálogo de servicios ESSI
  - Validar UBIGEO (departamento, provincia, distrito)
  - Validar teléfonos con API externa

- [ ] **Re-procesamiento de errores**
  - Editar filas con error en interfaz
  - Re-procesar sin subir Excel nuevamente

- [ ] **Integración con Chatbot de Citas**
  - Crear solicitudes automáticamente desde Bolsa 107
  - Asignar slots de disponibilidad médica

---

## Anexos

### A. Estructura de Excel Esperada

```
REGISTRO | OPCIONES DE INGRESO | TELEFONO | TIPO DOC | DNI | APELLIDOS Y NOMBRES | ...
---------|---------------------|----------|----------|-----|---------------------|-----
001      | Llamada telefónica  | 987654321| DNI      | 12345678 | PEREZ LOPEZ JUAN | ...
002      | Videollamada        | 965432109| DNI      | 87654321 | GARCIA MARIA     | ...
...
```

### B. Estados del Sistema

| Estado Carga | Descripción |
|--------------|-------------|
| `RECIBIDO` | Archivo recibido, cabecera creada |
| `STAGING_CARGADO` | Datos en staging.bolsa_107_raw |
| `PROCESADO` | SP ejecutado, items y errores separados |
| `ASIGNADO` | Pacientes OK asignados a coordinadores |

---

**Fin de la documentación técnica del Módulo Formulario 107 (Bolsa 107) v1.14.0**

*EsSalud Perú - CENATE | Sistema de Telemedicina*
*Última actualización: 2025-12-30*
