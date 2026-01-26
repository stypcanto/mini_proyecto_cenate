# 🤖 Auto-Normalización de Archivos Excel - Formulario 107

## Descripción

Sistema inteligente que **corrige automáticamente** variaciones en los nombres de las cabeceras de archivos Excel del Formulario 107, eliminando errores de importación causados por:

- ✅ Mayúsculas/minúsculas diferentes
- ✅ Espacios extras
- ✅ Tildes/acentos
- ✅ Variaciones ortográficas ("TIPO DOCUMENTO" vs "TIPO DE DOCUMENTO")
- ✅ Abreviaciones comunes

---

## Problema Resuelto

**Antes (v1.14.x):**
```
❌ Archivo con "TIPO DOCUMENTO" → ERROR de importación
❌ Archivo con "Teléfono" → ERROR de importación
❌ Archivo con "Fecha Nacimiento" → ERROR de importación
```

**Ahora (v1.15.0):**
```
✅ Archivo con "TIPO DOCUMENTO" → Auto-corregido a "TIPO DE DOCUMENTO"
✅ Archivo con "Teléfono" → Auto-corregido a "TELEFONO"
✅ Archivo con "Fecha Nacimiento" → Auto-corregido a "FechaNacimiento"
✅ Importación exitosa sin intervención manual
```

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUJO DE AUTO-NORMALIZACIÓN                  │
└─────────────────────────────────────────────────────────────┘

Usuario sube archivo Excel
         ↓
ExcelImportService.procesarEInsertarStaging()
         ↓
readHeader() → Lee cabeceras originales
         ↓
validateHeaderStrict() → Normaliza automáticamente
         ↓
ExcelHeaderNormalizer.normalizeAll()
         ↓
┌────────────────────────────────────────┐
│ Mapeo de 50+ variaciones conocidas:   │
│ - "tipo documento" → "TIPO DE DOCUMENTO" │
│ - "teléfono" → "TELEFONO"             │
│ - "fecha nacimiento" → "FechaNacimiento"│
│ - "DNI" → "DNI"                       │
│ - ...                                 │
└────────────────────────────────────────┘
         ↓
Validación de orden correcto
         ↓
Log de correcciones aplicadas
         ↓
✅ Importación exitosa
```

---

## Variaciones Soportadas

### 📋 Columnas con Múltiples Variaciones

| Columna Estándar | Variaciones Aceptadas |
|------------------|----------------------|
| **TIPO DE DOCUMENTO** | tipo documento, tipo_documento, tipo doc, tip doc, tipodocumento |
| **DNI** | numero de documento, numero documento, nro documento, nro doc, documento |
| **TELEFONO** | teléfono, tel, celular, movil, móvil |
| **FechaNacimiento** | fecha nacimiento, fecha de nacimiento, fec nacimiento, fec nac, f nac, fecha_nacimiento |
| **APELLIDOS Y NOMBRES** | nombres y apellidos, nombre completo, paciente, nombres, apellidos |
| **SEXO** | genero, género, sex |
| **DEPARTAMENTO** | depto, dpto, dep |
| **DERIVACION INTERNA** | derivación interna, derivacion, derivación, deriva |

### ✨ Total de Variaciones Soportadas: **50+**

---

## Componentes Implementados

### 1. Backend - ExcelHeaderNormalizer.java

**Ubicación:** `backend/src/main/java/com/styp/cenate/util/ExcelHeaderNormalizer.java`

**Métodos principales:**
```java
// Normalizar una cabecera individual
String normalized = ExcelHeaderNormalizer.normalize("tipo documento");
// → "TIPO DE DOCUMENTO"

// Normalizar lista completa
List<String> normalized = ExcelHeaderNormalizer.normalizeAll(rawHeaders);

// Verificar si es reconocida
boolean ok = ExcelHeaderNormalizer.isRecognized("teléfono");
// → true

// Generar reporte de cambios
Map<String, Object> report = ExcelHeaderNormalizer.generateReport(original, normalized);
```

**Características:**
- ✅ Mapeo de 50+ variaciones
- ✅ Case-insensitive
- ✅ Normalización de espacios
- ✅ Soporte para tildes/acentos
- ✅ Logging detallado de correcciones

### 2. Backend - ExcelImportService.java (Actualizado)

**Cambios implementados:**
```java
// Antes (v1.14.x) - Validación estricta
if (!expected.equals(actual)) {
    throw new ExcelValidationException("Cabecera inválida");
}

// Ahora (v1.15.0) - Auto-normalización
List<String> normalized = ExcelHeaderNormalizer.normalizeAll(actualColumns);
if (!expected.equals(normalized.get(i))) {
    log.error("❌ Orden incorrecto...");
    throw new ExcelValidationException(...);
} else {
    log.info("✅ Auto-corrección: '{}' → '{}'", actual, normalized);
}
```

**Logging mejorado:**
```
✅ Auto-normalización de cabeceras: 3 columnas corregidas automáticamente
   📝 'tipo documento' → 'TIPO DE DOCUMENTO'
   📝 'Teléfono' → 'TELEFONO'
   📝 'fecha nac' → 'FechaNacimiento'
```

### 3. Script Python - normalizar_excel_107.py

**Ubicación:** `spec/scripts/normalizar_excel_107.py`

**Uso:**
```bash
# Normalizar un archivo individual
python normalizar_excel_107.py archivo.xlsx

# Normalizar todos los archivos de un directorio
python normalizar_excel_107.py /ruta/carpeta/

# Ayuda
python normalizar_excel_107.py
```

**Ejemplo de salida:**
```
======================================================================
🔧 Normalizando archivo: CENATE 1.01.26 AL 02.01.26.xlsx
======================================================================

✅ Cambios detectados:
  📝 Posición 4: 'tipo documento' → 'TIPO DE DOCUMENTO'
  📝 Posición 3: 'Teléfono' → 'TELEFONO'

📁 Archivo guardado: normalizados/CENATE_1.01.26_normalizado_20260102_110530.xlsx
======================================================================
```

**Características del script:**
- ✅ Procesamiento batch (múltiples archivos)
- ✅ Resalta celdas modificadas (azul claro)
- ✅ Genera reporte detallado
- ✅ Crea archivo normalizado separado
- ✅ Timestamp en nombre de archivo

---

## Casos de Uso

### Caso 1: Importación Automática (Backend)

```
1. Usuario sube archivo con variaciones en cabeceras
2. Backend detecta y normaliza automáticamente
3. Sistema registra correcciones en log
4. Importación exitosa sin intervención
```

**Log del backend:**
```
📤 Iniciando importación de archivo Excel: CENATE 1.01.26.xlsx
✅ Auto-normalización de cabeceras: 2 columnas corregidas automáticamente
   📝 'tipo documento' → 'TIPO DE DOCUMENTO'
   📝 'Teléfono' → 'TELEFONO'
✅ Importación exitosa - Total: 8, OK: 8, Errores: 0
```

### Caso 2: Pre-procesamiento con Script Python

```bash
# Recibiste 5 archivos Excel por correo
cd /Users/styp/Downloads/Archivos_Cenate/

# Normalizar todos antes de importar
python /ruta/spec/scripts/normalizar_excel_107.py .

# Resultado: carpeta "normalizados/" con archivos corregidos
# Importar los archivos normalizados al sistema
```

### Caso 3: Validación de Archivo Nuevo

```python
from util.ExcelHeaderNormalizer import ExcelHeaderNormalizer

# Verificar si un archivo es compatible
headers = ["REGISTRO", "tipo documento", "DNI", ...]
normalized = ExcelHeaderNormalizer.normalizeAll(headers)

if None in normalized:
    print("❌ Archivo incompatible")
else:
    print("✅ Archivo compatible (con auto-corrección)")
```

---

## Ventajas del Sistema

| Ventaja | Beneficio |
|---------|-----------|
| **Automatización** | Elimina corrección manual de archivos |
| **Tolerancia** | Acepta 50+ variaciones comunes |
| **Logging** | Trazabilidad de correcciones aplicadas |
| **Sin cambios en UI** | Usuario no nota diferencia (just works™) |
| **Escalable** | Fácil agregar nuevas variaciones |
| **Dual Mode** | Backend automático + script manual |

---

## Cómo Agregar Nuevas Variaciones

### Backend (Java)

**Editar:** `ExcelHeaderNormalizer.java`

```java
static {
    // Agregar nueva variación
    COLUMN_MAPPINGS.put("nuevo alias", "COLUMNA ESTANDAR");

    // Ejemplo: aceptar "doc tipo" como "TIPO DE DOCUMENTO"
    COLUMN_MAPPINGS.put("doc tipo", "TIPO DE DOCUMENTO");
}
```

### Script Python

**Editar:** `normalizar_excel_107.py`

```python
COLUMN_MAPPINGS = {
    # Agregar nueva variación
    "nuevo alias": "COLUMNA ESTANDAR",

    # Ejemplo
    "doc tipo": "TIPO DE DOCUMENTO",
}
```

---

## Testing

### Test 1: Variaciones Comunes

**Entrada:**
```
REGISTRO | tipo documento | DNI | Teléfono | ...
```

**Esperado:**
```
✅ Auto-normalización exitosa
✅ Importación sin errores
```

### Test 2: Orden Incorrecto

**Entrada:**
```
DNI | REGISTRO | TIPO DE DOCUMENTO | ...
```

**Esperado:**
```
❌ Error: orden incorrecto
```

### Test 3: Columna No Reconocida

**Entrada:**
```
REGISTRO | columna_rara | DNI | ...
```

**Esperado:**
```
❌ Error: columna no reconocida en posición 2
```

---

## Logs de Ejemplo

### Importación Exitosa con Auto-corrección

```
📤 Iniciando importación de archivo Excel: CENATE_2025_01_02.xlsx
✅ Auto-normalización de cabeceras: 4 columnas corregidas automáticamente
   📝 'tipo documento' → 'TIPO DE DOCUMENTO'
   📝 'Teléfono' → 'TELEFONO'
   📝 'fecha nac' → 'FechaNacimiento'
   📝 'deriva' → 'DERIVACION INTERNA'
✅ Cabeceras validadas correctamente
✅ Importación exitosa - Total: 8, OK: 8, Errores: 0
```

### Error por Columna No Reconocida

```
📤 Iniciando importación de archivo Excel: archivo_invalido.xlsx
❌ Columnas no reconocidas en el archivo: [Posición 4: 'campo_desconocido']
❌ Error en importación: Encabezado inválido: columnas no reconocidas
```

---

## Troubleshooting

### Problema: "Columna no reconocida"

**Causa:** Variación no está en el mapeo

**Solución:**
1. Identificar la variación exacta en el error
2. Agregar al mapeo en `ExcelHeaderNormalizer.java`
3. Recompilar backend
4. Reintentar importación

### Problema: "Orden incorrecto"

**Causa:** Las columnas están en diferente orden al esperado

**Solución:**
- El sistema NO reordena columnas automáticamente
- El archivo debe tener las 14 columnas en el orden estándar
- Usar el script Python para validar el orden

### Problema: Script Python no encuentra openpyxl

**Solución:**
```bash
pip install openpyxl
```

---

## Próximas Mejoras

1. **Auto-reordenamiento:** Detectar y reordenar columnas automáticamente
2. **API REST:** Endpoint `/api/excel/validate` para validar antes de importar
3. **Dashboard:** Estadísticas de correcciones más frecuentes
4. **Aprendizaje:** Sugerir nuevas variaciones basadas en errores recurrentes
5. **Batch API:** Importar múltiples archivos en una sola petición

---

## Documentación Relacionada

- **Changelog:** `checklist/01_Historial/01_changelog.md` (v1.15.0)
- **Script Python:** `spec/scripts/normalizar_excel_107.py`
- **Código Backend:** `backend/src/main/java/com/styp/cenate/util/ExcelHeaderNormalizer.java`
- **Tests:** `backend/src/test/java/com/styp/cenate/util/ExcelHeaderNormalizerTest.java` (próximamente)

---

*Sistema CENATE v1.15.0 - Normalización Inteligente de Excel*
*Desarrollado por Ing. Styp Canto Rondon*
