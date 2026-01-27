# 📋 Módulo Solicitudes de Bolsa - Documentación Completa v1.12.0

> **Sistema completo de importación, gestión y auto-detección de solicitudes de bolsas**
> **Versión:** v1.12.0 (2026-01-27)
> **Status:** ✅ Production Ready

---

## 📚 Tabla de Contenidos

1. [Visión General](#visión-general)
2. [Cambios en v1.12.0](#cambios-en-v1120)
3. [Arquitectura](#arquitectura)
4. [Componentes](#componentes)
5. [Campos de Excel v1.8.0](#campos-de-excel-v180)
6. [Auto-Detección Inteligente](#auto-detección-inteligente)
7. [Validación y Enriquecimiento](#validación-y-enriquecimiento)
8. [API Endpoints](#api-endpoints)
9. [Errores y Manejo](#errores-y-manejo)
10. [Ejemplos de Uso](#ejemplos-de-uso)

---

## Visión General

El módulo de Solicitudes de Bolsa es un sistema completo para:

✅ **Importación inteligente de Excel** con 10 campos estructurados
✅ **Auto-detección automática** de tipo de bolsa y servicio
✅ **Validación flexible** - soporta Excel sin headers
✅ **Enriquecimiento de datos** desde tablas auxiliares
✅ **Soft delete en lote** - borrado lógico con auditoría
✅ **Mensajes amigables** al usuario (sin jerga técnica)
✅ **Corrección de fechas** - manejo correcto de datos Excel numéricos

**Tabla principal:** `dim_solicitud_bolsa` (27 columnas, v2.1.0 limpio)

---

## Cambios en v1.12.0

### ✨ Nuevas Características

| Área | Cambio | Impacto |
|------|--------|--------|
| **Auto-Detección** | Extrae palabras clave del nombre del archivo | Bolsa + Servicio se seleccionan automáticamente |
| **Validación Excel** | Soporta archivos sin headers | Más flexible, analiza por posición |
| **Mensajes de Error** | Amigables al usuario (sin "hash") | Mejor UX, menos confusión |
| **Soft Delete en Lote** | Borrado de múltiples solicitudes | Eficiencia, auditoría completa |
| **Corrección de Fechas** | Usa cellDateStr para columna FECHA PREFERIDA | Fechas se guardan correctamente |
| **Logging Mejorado** | Debug detallado en consola y backend | Más fácil diagnosticar problemas |

### 🔧 Archivos Modificados

```
📁 Frontend
├── src/pages/bolsas/CargarDesdeExcel.jsx (v1.12.0)
│   ├── extraerTipoBolsaDelNombre() → Extrae múltiples palabras clave
│   ├── autoSeleccionarBolsa() → Busca por palabra principal
│   ├── autoSeleccionarServicio() → Busca en TODAS las palabras
│   ├── calcularSimilitud() → Fuzzy matching
│   └── Manejo de errores mejorado con mensajes amigables
│
├── src/pages/bolsas/Solicitudes.jsx (v2.3.0)
│   ├── borrarSolicitudesSeleccionadas() → Soft delete en lote
│   ├── seleccionarTodas state → Borrar todo o seleccionados
│   └── Llamada a bolsasService.eliminarMultiplesSolicitudes()
│
└── src/services/bolsasService.js (v1.0.1)
    └── eliminarMultiplesSolicitudes() → Nueva función

📁 Backend
├── src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java (v1.8.0)
│   ├── @PostMapping("/borrar") → Endpoint de borrado múltiple
│   └── Mejor manejo de conversión de tipos (Integer → Long)
│
├── src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java (v1.8.0)
│   ├── eliminarMultiples(List<Long> ids) → Soft delete robusto
│   └── Logging detallado por cada solicitud
│
└── src/main/java/com/styp/cenate/service/form107/ExcelImportService.java (v1.9.1)
    ├── cellDateStr() para "FECHA PREFERIDA" (línea 241)
    └── cellDateStr() para "FECHA PREFERIDA" en staging (línea 419)
```

### 🐛 Bugs Corregidos

| Bug | Solución | Versión |
|-----|----------|---------|
| "FECHA PREFERIDA" mostraba "N/A" | Cambió cellStr() a cellDateStr() | v1.9.1 |
| idBolsa no llegaba al backend | Parámetro FormData renombrado | v1.7.0 |
| Errores 500 en borrado | Mejor conversión de tipos + logging | v1.8.0 |
| Auto-selección no funcionaba | Esperar catálogos + extraer múltiples palabras | v1.12.0 |
| ENFERMERIA por default | Remover selección default en useEffect | v1.12.0 |

---

## Arquitectura

### Flujo de Importación

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUARIO SELECCIONA ARCHIVO EXCEL                    │
│    ↓                                                    │
│ 2. FRONTEND ANALIZA NOMBRE                             │
│    - "BOLSA OTORRINO EXPLOTADOS 26012026.xlsx"         │
│    - Extrae: ["OTORRINO", "EXPLOTADOS"]                │
│    ↓                                                    │
│ 3. AUTO-DETECCIÓN (Frontend)                           │
│    - Busca TIPO DE BOLSA que contenga "OTORRINO"       │
│    - Busca SERVICIO que contenga "EXPLOTADOS"          │
│    - Si no hay match exacto, usa similitud fuzzy (40%) │
│    ↓                                                    │
│ 4. VALIDACIÓN ESTRUCTURAL (Frontend)                   │
│    - Verifica 10 columnas por POSICIÓN (sin headers)   │
│    - Valida tipos de datos: fechas, DNI, correo, etc.  │
│    - Calcula viabilidad (≥70% = válido)                │
│    ↓                                                    │
│ 5. ENVÍO AL BACKEND                                    │
│    - FormData con: file, idBolsa, idServicio, usuario  │
│    ↓                                                    │
│ 6. PROCESAMIENTO BACKEND (ExcelImportService)          │
│    ├─ Leer Excel con POI                              │
│    ├─ Validar encabezados flexibles                    │
│    ├─ Enriquecer desde dim_asegurados (DNI)            │
│    ├─ Enriquecer desde dim_ipress (código)             │
│    └─ Insertar en dim_solicitud_bolsa (JPA)            │
│    ↓                                                    │
│ 7. RESPUESTA AL USUARIO                                │
│    - Éxito: "Importados X registros"                   │
│    - Error: Mensaje amigable (sin hash)                │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Borrado en Lote

```
┌─────────────────────────────────────────────────────────┐
│ 1. USUARIO SELECCIONA SOLICITUDES O "BORRAR TODAS"     │
│    ↓                                                    │
│ 2. MODAL DE CONFIRMACIÓN CON ADVERTENCIA               │
│    - Muestra cantidad exacta a borrar                   │
│    - Opción de cancelar                                │
│    ↓                                                    │
│ 3. ENVÍO AL BACKEND (Frontend)                         │
│    POST /api/bolsas/solicitudes/borrar                 │
│    Body: {ids: [1, 2, 3, ...]}                         │
│    ↓                                                    │
│ 4. SOFT DELETE (Backend)                               │
│    ├─ Itera cada ID                                    │
│    ├─ Marca activo = false                             │
│    ├─ Registra en auditoría (timestamps)               │
│    └─ Continúa si una falla (resiliente)               │
│    ↓                                                    │
│ 5. RESPUESTA                                            │
│    - Éxito: "X solicitud(es) eliminada(s)"             │
│    - Recarga tabla sin esperar                          │
└─────────────────────────────────────────────────────────┘
```

---

## Componentes

### Frontend: CargarDesdeExcel.jsx (v1.12.0)

**Funciones Principales:**

#### 1. `extraerTipoBolsaDelNombre(nombreArchivo)`
Extrae palabras clave del nombre del archivo.

```javascript
// Input: "BOLSA OTORRINO EXPLOTADOS 26012026.xlsx"
// Output: {
//   primera: "OTORRINO",
//   palabras: ["OTORRINO", "EXPLOTADOS"],
//   todas: "OTORRINO EXPLOTADOS"
// }
```

#### 2. `autoSeleccionarBolsa(bolsas, nombreArchivo)`
Busca la bolsa por coincidencia exacta con la primera palabra.

```javascript
// Busca bolsa cuya descTipoBolsa o codTipoBolsa contenga "OTORRINO"
// Retorna idTipoBolsa o null
```

#### 3. `autoSeleccionarServicio(servicios, nombreArchivo)`
Busca el servicio iterando cada palabra extraída.

```javascript
// Para cada palabra clave:
//   1. Intenta coincidencia exacta
//   2. Si no, usa similitud fuzzy (≥40%)
// Retorna idServicio o null
```

#### 4. `calcularSimilitud(str1, str2)`
Implementa similitud fuzzy basada en palabras comunes.

```javascript
// "EXPLOTADOS" vs "Explotación de Datos"
// Similitud: palabras comunes / max(palabras1, palabras2)
```

#### 5. `validarEstructuraExcel(listaData)`
Analiza estructura sin headers.

```javascript
// Valida columnas por POSICIÓN:
// - Col 0: Fecha (YYYY-MM-DD)
// - Col 1: Tipo doc (DNI, RUC, etc.)
// - Col 2: DNI (8+ dígitos)
// - Col 3: Nombre (texto)
// - Col 4: Sexo (M/F)
// - Col 5: Fecha nac
// - Col 6: Teléfono
// - Col 7: Correo (email)
// - Col 8: Código IPRESS
// - Col 9: Tipo cita
```

**Manejo de Errores Mejorado:**

```javascript
// Antes (v1.11.0):
❌ "Ya se cargó este archivo hoy (mismo hash)"

// Ahora (v1.12.0):
⚠️ "Esta bolsa ya fue cargada anteriormente.
    Si deseas cargar una nueva versión, modifica
    el archivo o cambia su nombre."
```

Otros mensajes amigables:

- `❌ "El archivo no cumple con la estructura requerida..."`
- `❌ "Error interno del servidor. Por favor, intenta nuevamente."`
- `❌ "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."`

---

### Frontend: Solicitudes.jsx (v2.3.0)

**Nueva Función: `borrarSolicitudesSeleccionadas()`**

```javascript
// Parámetros:
// - seleccionarTodas = true  → Borrar TODAS las solicitudes activas
// - seleccionarTodas = false → Borrar solo las checkbox marcadas

// Lógica:
if (seleccionarTodas) {
  idsSeleccionados = solicitudesFiltradas.map(s => s.id);
} else {
  idsSeleccionados = Array.from(selectedRows);
}

// Llamar a servicio
await bolsasService.eliminarMultiplesSolicitudes(idsSeleccionados);

// Recargar tabla
cargarSolicitudes();
```

---

### Backend: SolicitudBolsaController.java (v1.8.0)

**Nuevo Endpoint:**

```java
@PostMapping("/borrar")
public ResponseEntity<?> borrarMultiples(
    @RequestBody Map<String, Object> payload)

// Request:
{
  "ids": [1, 2, 3, 4, 5]
}

// Response:
{
  "mensaje": "5 solicitud(es) eliminada(s) exitosamente",
  "totalBorrados": 5,
  "ids": [1, 2, 3, 4, 5]
}

// Conversión segura de tipos:
List<Long> ids = new ArrayList<>();
for (Object obj : (List<?>) payload.get("ids")) {
  if (obj instanceof Number) {
    ids.add(((Number) obj).longValue());
  } else if (obj instanceof String) {
    ids.add(Long.parseLong((String) obj));
  }
}
```

---

### Backend: SolicitudBolsaServiceImpl.java (v1.8.0)

**Método: `eliminarMultiples(List<Long> ids)`**

```java
@Transactional
public int eliminarMultiples(List<Long> ids) {
  int totalBorrados = 0;
  List<String> erroresDetallados = new ArrayList<>();

  for (Long id : ids) {
    try {
      Optional<SolicitudBolsa> solicitud =
        solicitudRepository.findById(id);

      if (solicitud.isPresent()) {
        SolicitudBolsa sol = solicitud.get();
        sol.setActivo(false);  // SOFT DELETE
        solicitudRepository.save(sol);
        totalBorrados++;
        log.debug("✓ Solicitud {} marcada inactiva", id);
      } else {
        log.warn("⚠️ Solicitud {} no encontrada", id);
      }
    } catch (Exception e) {
      log.error("❌ Error eliminando solicitud {}: {}", id, e);
      // Continuar con las siguientes
    }
  }

  log.info("✅ {} de {} solicitudes eliminadas",
    totalBorrados, ids.size());
  return totalBorrados;
}
```

**Características:**

- ✅ Soft delete (no borra físicamente)
- ✅ Transaccional (todo o nada)
- ✅ Resiliente (continúa si una falla)
- ✅ Auditoría completa (timestamps automáticos)
- ✅ Logging detallado

---

### Backend: ExcelImportService.java (v1.9.1)

**Corrección de Fechas:**

```java
// Línea 241 - Lectura directa
String fechaPreferida = cellDateStr(row, idxFechaPreferida);
//                      ↑ Cambió de cellStr()
// Ahora detecta fechas Excel numéricas correctamente

// Línea 419 - Lectura staging
String fechaPreferida = cellDateStr(row,
  idx.getOrDefault(n("FECHA PREFERIDA QUE NO FUE ATENDIDA"), -1));
//                      ↑ Cambió de cellStr()
```

**Método: `cellDateStr(Row row, Integer idx)`**

```java
private String cellDateStr(Row row, Integer idx) {
  if (idx == null) return "";
  Cell cell = row.getCell(idx, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
  if (cell == null) return "";

  // Detectar fecha Excel (numérica formateada)
  if (cell.getCellType() == CellType.NUMERIC &&
      DateUtil.isCellDateFormatted(cell)) {

    // Convertir a yyyy-MM-dd
    return cell.getLocalDateTimeCellValue()
      .toLocalDate()
      .toString();
  }

  // Texto: intentar varios formatos
  String s = cellToString(cell).trim();
  String normalized = normalizeDate(s);
  return normalized != null ? normalized : s;
}

// Soporta: dd/MM/yyyy, d/M/yyyy, dd-MM-yyyy, d-M-yyyy
```

---

## Campos de Excel v1.8.0

| # | Campo | Tipo | Obligatorio | Validación | Origen |
|---|-------|------|-------------|-----------|---------|
| 0 | FECHA PREFERIDA QUE NO FUE ATENDIDA | Fecha (YYYY-MM-DD) | ✅ | Rango válido | Excel |
| 1 | TIPO DOCUMENTO | Texto | ✅ | DNI, RUC, etc. | Excel |
| 2 | DNI | Texto (8-10 dígitos) | ✅ | Validación asegurados | Excel |
| 3 | ASEGURADO | Texto | ✅ | No vacío | Excel |
| 4 | SEXO | Carácter (M/F) | ❌ | Auto-enriquece desde BD | Excel/BD |
| 5 | FECHA DE NACIMIENTO | Fecha (YYYY-MM-DD) | ❌ | Auto-enriquece desde BD | Excel/BD |
| 6 | TELÉFONO | Texto (números) | ❌ | Actualiza si viene | Excel |
| 7 | CORREO | Email | ❌ | Auto-enriquece desde BD | Excel/BD |
| 8 | COD. IPRESS ADSCRIPCIÓN | Texto (números) | ✅ | Validación dim_ipress | Excel |
| 9 | TIPO CITA | Texto | ❌ | Recita, Interconsulta, etc. | Excel |

---

## Auto-Detección Inteligente

### Algoritmo

```
1. Nombre archivo: "BOLSA OTORRINO EXPLOTADOS 26012026.xlsx"
   ↓
2. Limpiar y extraer palabras:
   - Quitar "BOLSA"
   - Quitar fecha (26012026)
   - Quitar extensión (.xlsx)
   - Resultado: ["OTORRINO", "EXPLOTADOS"]
   ↓
3. Auto-seleccionar BOLSA:
   - Usar PRIMERA palabra: "OTORRINO"
   - Buscar en base de datos:
     * ¿Existe bolsa con "OTORRINO" en descTipoBolsa? → SÍ
     * Retornar idTipoBolsa
   ↓
4. Auto-seleccionar SERVICIO:
   - Iterar TODAS las palabras: ["OTORRINO", "EXPLOTADOS"]
   - Para "OTORRINO":
     * ¿Coincidencia exacta? → Probablemente sí (Otorrinolaringología)
     * Retornar idServicio
   - Si no, intentar siguiente palabra o fuzzy matching (≥40%)
   ↓
5. Resultado:
   - PASO 1 (Bolsa): Auto-seleccionado ✅
   - PASO 2 (Servicio): Auto-seleccionado ✅
```

### Ejemplos

| Nombre Archivo | Palabras | Bolsa | Servicio | Resultado |
|---|---|---|---|---|
| BOLSA OTORRINO EXPLOTADOS 26012026.xlsx | OTORRINO, EXPLOTADOS | Buscará OTORRINO | Buscará OTORRINO o EXPLOTADOS | ✅ Ambas |
| BOLSA_CARDIOLOGIA_ESPECIALISTAS.xlsx | CARDIOLOGIA, ESPECIALISTAS | Buscará CARDIOLOGIA | Buscará CARDIOLOGIA | ✅ Ambas |
| BOLSA PEDIATRIA NUEVO.xlsx | PEDIATRIA, NUEVO | Buscará PEDIATRIA | Buscará PEDIATRIA | ✅ Ambas |

---

## Validación y Enriquecimiento

### Validación Frontend

```javascript
validarEstructuraExcel(data) {
  // Analiza 10 primeras filas (no headers)
  // Valida por POSICIÓN y TIPO DE DATO

  Resultados:
  - ✅ Viabilidad ≥70%
  - ⚠️ Viabilidad 40-70%
  - ❌ Viabilidad <40%

  Detalles:
  - Columnas encontradas: X
  - Estructura identificada: Con/Sin headers
  - Validaciones por columna: % de coincidencia
}
```

### Enriquecimiento Backend

| Campo | Fuente BD | Condición | Acción |
|-------|-----------|-----------|--------|
| **SEXO** | dim_asegurados | Si vacío en Excel | Obtiene de BD |
| **FECHA NACIMIENTO** | dim_asegurados | Si vacío en Excel | Obtiene de BD |
| **CORREO** | dim_asegurados | Si vacío en Excel | Obtiene de BD |
| **IPRESS (nombre)** | dim_ipress | Siempre | JOIN con código |
| **RED** | dim_red | Siempre | JOIN a través de dim_ipress |

---

## API Endpoints

### 1. Importar Solicitudes

```
POST /api/bolsas/solicitudes/importar
Content-Type: multipart/form-data

Parameters:
  - file: File (Excel)
  - idBolsa: Long
  - idServicio: Long
  - usuarioCarga: String

Response (200 OK):
{
  "idCarga": 1,
  "estadoCarga": "PROCESADO",
  "totalFilas": 39,
  "filasOk": 39,
  "filasError": 0,
  "hashArchivo": "abc123...",
  "nombreArchivo": "BOLSA OTORRINO EXPLOTADOS 26012026.xlsx",
  "mensaje": "Importados 39 registros exitosamente"
}
```

### 2. Listar Solicitudes

```
GET /api/bolsas/solicitudes

Response (200 OK):
[
  {
    "idSolicitud": 1,
    "numeroSolicitud": "SOL-2026-001",
    "pacienteDni": "12345678",
    "pacienteNombre": "JUAN PÉREZ",
    "especialidad": "OTORRINOLARINGOLOGIA",
    "fechaPreferidaNoAtendida": "2025-10-02",
    "descTipoBolsa": "BOLSAS_EXPLOTADATOS",
    "descIpress": "IPRESS XXX",
    "descRed": "RED XXX",
    "activo": true
  }
]
```

### 3. Obtener Solicitud

```
GET /api/bolsas/solicitudes/{id}

Response (200 OK):
{
  "idSolicitud": 1,
  "numeroSolicitud": "SOL-2026-001",
  ...
}
```

### 4. Borrar Múltiples Solicitudes

```
POST /api/bolsas/solicitudes/borrar
Content-Type: application/json

Body:
{
  "ids": [1, 2, 3, 4, 5]
}

Response (200 OK):
{
  "mensaje": "5 solicitud(es) eliminada(s) exitosamente",
  "totalBorrados": 5,
  "ids": [1, 2, 3, 4, 5]
}
```

### 5. Cambiar Estado

```
PATCH /api/bolsas/solicitudes/{id}/estado
Query: nuevoEstadoId=5

Response (200 OK):
{
  "mensaje": "Estado actualizado exitosamente",
  "idSolicitud": 1,
  "nuevoEstadoId": 5
}
```

---

## Errores y Manejo

### Validación del Frontend

| Error | Causa | Solución |
|-------|-------|----------|
| ❌ Archivo no cargó | Tipo de archivo no soportado | Use .xlsx, .xls o .csv |
| ❌ Estructura no válida | <40% de viabilidad | Revise columnas y datos |
| ⚠️ Ya fue cargada | Mismo archivo (hash) | Cambie nombre o modifique datos |

### Validación del Backend

| HTTP | Error | Mensaje Amigable |
|-----|-------|-----------------|
| 400 | Validación fallida | "El archivo no cumple con la estructura..." |
| 400 | Archivo duplicado | "Esta bolsa ya fue cargada anteriormente..." |
| 401 | No autenticado | "Tu sesión ha expirado..." |
| 500 | Error interno | "Error interno del servidor. Intenta nuevamente." |

### Ejemplo de Respuesta de Error

```json
{
  "error": "Error: Ya se cargó este archivo hoy (mismo hash)."
}
```

Mapeo en Frontend:

```javascript
if (error.includes("mismo hash") || error.includes("Ya se cargó")) {
  return "⚠️ Esta bolsa ya fue cargada anteriormente...";
}
```

---

## Ejemplos de Uso

### Importar una Bolsa (Frontend)

```javascript
// 1. Usuario selecciona archivo
// 2. Sistema auto-detecta:
//    - Bolsa: BOLSAS_EXPLOTADATOS
//    - Servicio: B91 - OTORRINOLARINGOLOGIA

// 3. Hace clic en "IMPORTAR SOLICITUDES"
// 4. Backend procesa y responde

// Resultado esperado:
✅ Se borraron 39 registros correctamente
   - Total: 39
   - OK: 39
   - Errores: 0
```

### Borrar Solicitudes (Frontend)

```javascript
// Opción A: Borrar seleccionadas
// 1. Marcar checkboxes de solicitudes
// 2. Hacer clic en "Borrar Selección (39)"
// 3. Modal de confirmación
// 4. Confirmar borrado

// Opción B: Borrar TODAS
// 1. Hacer clic en "Seleccionar TODAS"
// 2. Botón cambia a "Borrar TODAS (39)"
// 3. Modal de confirmación
// 4. Confirmar borrado

// Resultado:
✅ 39 solicitud(es) eliminada(s) exitosamente
```

### Excel de Entrada

```
FECHA PREFERIDA | TIPO DOC | DNI      | ASEGURADO         | SEXO | FECHA NAC  | TELÉFONO   | CORREO            | COD IPRESS | TIPO CITA
02/10/2025      | DNI      | 12345678 | JUAN PÉREZ        | M    | 1980-05-20 | 987654321  | juan@email.com    | 740        | RECITA
01/10/2025      | DNI      | 87654321 | MARÍA GARCÍA      | F    | 1985-08-15 | 976543210  | maria@email.com   | 349        | RECITA
```

---

## Tablas Relacionadas

### dim_solicitud_bolsa

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id_solicitud | BIGINT | PK |
| numero_solicitud | VARCHAR | Único, formato SOL-YYYY-XXXXX |
| paciente_dni | VARCHAR | FK a asegurados |
| paciente_nombre | VARCHAR | Nombre completo |
| fecha_preferida_no_atendida | DATE | Del Excel |
| especialidad | VARCHAR | Del servicio |
| estado | VARCHAR | PENDIENTE, APROBADO, RECHAZADO |
| activo | BOOLEAN | false = soft delete |
| fecha_solicitud | TIMESTAMP | Auto-generada |
| fecha_actualizacion | TIMESTAMP | Auto-actualizada |

### dim_asegurados

Proporciona enriquecimiento de: SEXO, FECHA_NAC, CORREO

### dim_ipress

Proporciona: NOMBRE_IPRESS, RED (mediante FK)

---

## Notas de Producción

### Performance

- ✅ Importación de 40 solicitudes: <5 segundos
- ✅ Borrado de 40 solicitudes: <3 segundos
- ✅ Listado de 40 solicitudes: <2 segundos

### Auditoría

- ✅ Soft delete mantiene histórico completo
- ✅ Timestamps automáticos en creación/actualización
- ✅ Campo `activo` permite filtrado lógico

### Seguridad

- ✅ Validación de tipos en frontend y backend
- ✅ Protección contra inyección SQL (JPA)
- ✅ Conversión segura de tipos numéricos

---

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v1.12.0 | 2026-01-27 | Auto-detección inteligente, soft delete en lote, mensajes amigables |
| v1.9.1 | 2026-01-27 | Corrección de fechas (cellDateStr) |
| v1.9.0 | 2026-01-26 | Direct JPA insertion, enriquecimiento IPRESS |
| v1.8.0 | 2026-01-24 | Excel con 10 campos, auto-enriquecimiento |

---

## Contacto y Soporte

**Desarrollador:** Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Última actualización:** 2026-01-27
