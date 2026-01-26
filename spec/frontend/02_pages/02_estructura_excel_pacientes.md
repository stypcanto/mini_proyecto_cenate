# 📊 Estructura de Archivo Excel para Carga de Pacientes

Especificación completa de las **14 columnas obligatorias** que debe tener tu archivo Excel para importar pacientes en CENATE.

---

## 🎯 Resumen Ejecutivo

| Aspecto | Valor |
|---------|-------|
| **Formato** | .xlsx (Excel 2007+) |
| **Número de columnas** | 14 exactas |
| **Fila de encabezado** | Fila 1 (obligatorio) |
| **Datos** | A partir de fila 2 |
| **Campos obligatorios** | 6 (ver tabla abajo) |
| **Max filas** | Sin límite (pero recomendado ≤10,000) |
| **Encoding** | UTF-8 |

---

## 📋 Las 14 Columnas Obligatorias

### Orden EXACTO (Izquierda a Derecha)

```
A              | B                              | C        | D                  | E    | F                     | G     | H                  | I             | J         | K        | L                        | M          | N
───────────────┼────────────────────────────────┼──────────┼────────────────────┼──────┼───────────────────────┼───────┼────────────────────┼───────────────┼──────────┼──────────┼──────────────────────────┼────────────┼─────────────────
REGISTRO       | OPCIONES DE INGRESO DE LLAMADA | TELEFONO | TIPO DE DOCUMENTO  | DNI  | APELLIDOS Y NOMBRES   | SEXO  | FechaNacimiento    | DEPARTAMENTO  | PROVINCIA| DISTRITO | MOTIVO DE LA LLAMADA     | AFILIACION | DERIVACION INTERNA
```

---

## 📐 Detalle de Cada Columna

### A. REGISTRO
- **Tipo:** Número entero
- **Descripción:** ID del registro secuencial
- **Ejemplo:** 1, 2, 3, ...
- **Requerido:** SÍ (pero no validado)
- **Rango:** 1 a 999,999

### B. OPCIONES DE INGRESO DE LLAMADA
- **Tipo:** Texto
- **Descripción:** Cómo ingresó el paciente al sistema
- **Ejemplos:** "Derivación", "Consulta Externa", "Emergencia", etc.
- **Requerido:** NO (puede estar vacío)
- **Máx caracteres:** 100

### C. TELEFONO ⚠️
- **Tipo:** Texto (formato flexible)
- **Descripción:** Número de teléfono del paciente
- **Ejemplos:**
  - "+51 987654321"
  - "987654321"
  - "01-2345678"
  - "956789012"
- **Requerido:** NO (pero recomendado)
- **Máx caracteres:** 20
- **Formato:** Aceptaremos cualquier formato (se normaliza en backend)

### D. TIPO DE DOCUMENTO
- **Tipo:** Texto
- **Descripción:** Tipo de documento de identidad
- **Valores válidos:**
  - "DNI" (más común)
  - "PASAPORTE"
  - "CARNET EXTRANJERIA"
  - "PERMISO TEMPORAL"
  - "RUC"
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Máx caracteres:** 30
- **Nota:** Sistema es case-insensitive (DNI, dni, Dni → todos aceptados)

### E. DNI ⚠️
- **Tipo:** Texto/Número
- **Descripción:** Número de documento (sin guiones ni espacios)
- **Ejemplos:**
  - 12345678 (8 dígitos para DNI peruano)
  - 00123456789 (10 dígitos para pasaporte)
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Máx caracteres:** 15
- **Validación:** El backend valida que sea numérico
- **Importante:** SIN guiones, SIN espacios (ej: ❌ "12-345-678", ✅ "12345678")

### F. APELLIDOS Y NOMBRES
- **Tipo:** Texto
- **Descripción:** Nombre completo del paciente (Apellidos primero)
- **Ejemplos:**
  - "Gonzales Flores María"
  - "Pérez Rivera Juan"
  - "Martínez García Ana Rosa"
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Máx caracteres:** 200
- **Nota:** Se almacena tal como viene en el Excel

### G. SEXO
- **Tipo:** Texto
- **Descripción:** Género del paciente
- **Valores válidos:**
  - "Masculino", "M", "Hombre", "H"
  - "Femenino", "F", "Mujer", "M"
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Máx caracteres:** 20
- **Normalización:** Se convierte a "Masculino" o "Femenino" en backend

### H. FechaNacimiento
- **Tipo:** Fecha
- **Descripción:** Fecha de nacimiento del paciente
- **Formatos aceptados:**
  - "DD/MM/YYYY" (10/03/1985)
  - "DD-MM-YYYY" (10-03-1985)
  - "YYYY-MM-DD" (1985-03-10)
  - Formato Excel date (automático si es celda de fecha)
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Ejemplo:** 15/06/1990
- **Validación:** Debe ser mayor de 0 años y menor de 120 años

### I. DEPARTAMENTO
- **Tipo:** Texto
- **Descripción:** Departamento/Región de procedencia
- **Ejemplos:**
  - "Lima"
  - "Arequipa"
  - "Cusco"
  - "Trujillo"
  - "Puno"
- **Requerido:** NO (pero recomendado)
- **Máx caracteres:** 50
- **Nota:** Debe ser un departamento válido de Perú

### J. PROVINCIA
- **Tipo:** Texto
- **Descripción:** Provincia dentro del departamento
- **Ejemplos:**
  - "Lima" (en Departamento Lima)
  - "Arequipa" (en Departamento Arequipa)
  - "Cusco" (en Departamento Cusco)
- **Requerido:** NO
- **Máx caracteres:** 50

### K. DISTRITO
- **Tipo:** Texto
- **Descripción:** Distrito dentro de la provincia
- **Ejemplos:**
  - "San Isidro"
  - "Miraflores"
  - "La Victoria"
  - "Breña"
- **Requerido:** NO
- **Máx caracteres:** 50

### L. MOTIVO DE LA LLAMADA
- **Tipo:** Texto
- **Descripción:** Razón por la que el paciente llamó/solicitó atención
- **Ejemplos:**
  - "Control de hipertensión"
  - "Consulta por diabetes"
  - "Seguimiento post-operatorio"
  - "Renovación de prescripción"
- **Requerido:** NO
- **Máx caracteres:** 200

### M. AFILIACION
- **Tipo:** Texto
- **Descripción:** Estado de afiliación del paciente
- **Valores comunes:**
  - "Afiliado"
  - "No afiliado"
  - "Beneficiario"
  - "Jubilado"
- **Requerido:** NO
- **Máx caracteres:** 50

### N. DERIVACION INTERNA
- **Tipo:** Texto
- **Descripción:** Especialidad/Área a la que se deriva el paciente
- **Ejemplos:**
  - "Cardiología"
  - "Medicina General"
  - "Psicología"
  - "Endocrinología"
  - "Nutrición"
- **Requerido:** ✅ **SÍ (obligatorio)**
- **Máx caracteres:** 100
- **Nota:** Debe ser una especialidad válida en el sistema

---

## 🔴 Campos Obligatorios (6 campos)

Estos 6 campos **DEBEN estar completos** (no vacíos):

| # | Columna | Validación | Ejemplo |
|---|---------|-----------|---------|
| 1 | **D: TIPO DE DOCUMENTO** | No puede estar vacío | "DNI" |
| 2 | **E: DNI** | No puede estar vacío, debe ser numérico | "12345678" |
| 3 | **F: APELLIDOS Y NOMBRES** | No puede estar vacío | "Gonzales Flores María" |
| 4 | **G: SEXO** | No puede estar vacío, debe ser M/F/Masculino/Femenino | "Femenino" |
| 5 | **H: FechaNacimiento** | No puede estar vacío, formato válido | "15/06/1990" |
| 6 | **N: DERIVACION INTERNA** | No puede estar vacío | "Cardiología" |

---

## ✅ Ejemplo de Excel Válido

```
REGISTRO | OPCIONES DE INGRESO | TELEFONO      | TIPO DE DOCUMENTO | DNI      | APELLIDOS Y NOMBRES      | SEXO      | FechaNacimiento | DEPARTAMENTO | PROVINCIA | DISTRITO    | MOTIVO DE LA LLAMADA         | AFILIACION | DERIVACION INTERNA
---------|-------------------|---------------|-------------------|----------|--------------------------|-----------|-----------------|--------------|-----------|-------------|------------------------------|------------|-------------------
1        | Derivación        | +51 987654321 | DNI               | 12345678 | Gonzales Flores María    | Femenino  | 15/06/1990      | Lima         | Lima      | San Isidro  | Control de hipertensión      | Afiliado   | Cardiología
2        | Consulta Externa  | 956789012     | DNI               | 23456789 | Pérez Rivera Juan        | Masculino | 22/03/1985      | Arequipa     | Arequipa  | Arequipa    | Consulta por diabetes        | Afiliado   | Endocrinología
3        | Emergencia        | 912345678     | DNI               | 34567890 | Martínez Soto Ana        | Femenino  | 08/11/1992      | Cusco        | Cusco     | Cusco       | Seguimiento post-operatorio  | Beneficiario | Medicina General
4        |                   | 945123456     | DNI               | 45678901 | Sánchez Morales Laura    | Femenino  | 30/07/1988      | Trujillo     | Trujillo  | Trujillo    | Renovación de prescripción   | Afiliado   | Nutrición
5        | Consulta Externa  | 965432109     | PASAPORTE         | 00123456 | Torres Gutierrez Roberto | Masculino | 12/05/1980      | Puno         | Puno      | Puno        | Control post-cirugía         | Jubilado   | Psicología
```

---

## 🚨 Errores Comunes a Evitar

### ❌ PROBLEMA: DNI con guiones
```
DNI: "12-345-678"  ❌ INCORRECTO
DNI: "12345678"    ✅ CORRECTO
```

### ❌ PROBLEMA: Teléfono incompleto
```
TELEFONO: ""       ❌ (vacío)
TELEFONO: "123"    ⚠️ (muy corto, pero se acepta)
TELEFONO: "+51 987654321" ✅ (válido)
TELEFONO: "987654321"     ✅ (válido)
```

### ❌ PROBLEMA: Fecha en formato incorrecto
```
FechaNacimiento: "1990/06/15"  ❌ (formato confuso)
FechaNacimiento: "15/06/1990"  ✅ (CORRECTO)
FechaNacimiento: "15-06-1990"  ✅ (también válido)
```

### ❌ PROBLEMA: Columnas en orden incorrecto
```
El sistema NO reordena columnas automáticamente.
Las 14 columnas DEBEN estar en el ORDEN EXACTO especificado.
```

### ❌ PROBLEMA: Caracteres especiales en DNI
```
DNI: "12.345.678"  ❌ (con puntos)
DNI: "12 345 678"  ❌ (con espacios)
DNI: "12345678"    ✅ (sin separadores)
```

---

## 🔄 Variaciones de Nombres de Columnas (Auto-Normalizadas)

El sistema **auto-corrige** estas variaciones de nombres de columnas:

| Columna Estándar | Variaciones Aceptadas |
|------------------|----------------------|
| TIPO DE DOCUMENTO | tipo documento, tipo_documento, tipo doc, TipoDDocumento |
| TELEFONO | teléfono, tel, celular, móvil, movil |
| FechaNacimiento | fecha nacimiento, fecha de nacimiento, fec nac, fecha_nac |
| APELLIDOS Y NOMBRES | nombres y apellidos, nombre completo, apellidos_nombres |
| SEXO | género, genero, sex, G |
| DERIVACION INTERNA | derivación, derivacion interna, derivacion, deriva |
| DEPARTAMENTO | depto, dpto, dep |
| PROVINCIA | prov, provincia |
| DISTRITO | dist, distrito |

**Ejemplo:** Si tu Excel tiene "teléfono" en lugar de "TELEFONO", el sistema lo corrige automáticamente ✅

---

## 📥 Guía de Preparación del Excel

### Paso 1: Crear Estructura Base

```
Crear archivo Excel con estas 14 columnas en la Fila 1:
A: REGISTRO
B: OPCIONES DE INGRESO DE LLAMADA
C: TELEFONO
D: TIPO DE DOCUMENTO
E: DNI
F: APELLIDOS Y NOMBRES
G: SEXO
H: FechaNacimiento
I: DEPARTAMENTO
J: PROVINCIA
K: DISTRITO
L: MOTIVO DE LA LLAMADA
M: AFILIACION
N: DERIVACION INTERNA
```

### Paso 2: Agregar Datos (desde Fila 2)

```
Fila 2: Datos del paciente 1
Fila 3: Datos del paciente 2
...
Fila N: Datos del paciente N
```

### Paso 3: Validación Manual

Antes de subir, verifica:
- [ ] 14 columnas exactas en el orden correcto
- [ ] Fila 1 contiene los encabezados
- [ ] DNI sin guiones/espacios
- [ ] Fechas en formato DD/MM/YYYY o YYYY-MM-DD
- [ ] 6 campos obligatorios completos en cada fila
- [ ] Archivo guardado como .xlsx

### Paso 4: Subir al Sistema

```
1. Ir a: http://localhost:3000/bolsas/solicitudes
2. Click en "Cargar desde Excel"
3. Seleccionar archivo .xlsx
4. Confirmar carga
```

---

## 💾 Plantilla Descargable

Estructura mínima (vacía) para copiar y llenar:

```
| REGISTRO | OPCIONES DE INGRESO DE LLAMADA | TELEFONO | TIPO DE DOCUMENTO | DNI | APELLIDOS Y NOMBRES | SEXO | FechaNacimiento | DEPARTAMENTO | PROVINCIA | DISTRITO | MOTIVO DE LA LLAMADA | AFILIACION | DERIVACION INTERNA |
|----------|--------------------------------|----------|-------------------|-----|-----------------|------|-----------------|--------------|-----------|----------|-------------------|------------|---|
|          |                                |          |                   |     |                 |      |                 |              |           |          |                   |            |   |
|          |                                |          |                   |     |                 |      |                 |              |           |          |                   |            |   |
|          |                                |          |                   |     |                 |      |                 |              |           |          |                   |            |   |
```

---

## 🔗 Integración con el Sistema

### Frontend - Componente de Carga

```jsx
// Ubicación: frontend/src/pages/bolsas/Solicitudes.jsx
// o frontend/src/pages/bolsas/GestionBolsasPacientes.jsx

const handleExcelUpload = async (file) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await bolsasService.importarExcel(formData);

    console.log('✅ Importación exitosa');
    console.log(`   Total: ${response.totalFilas}`);
    console.log(`   OK: ${response.filasOk}`);
    console.log(`   Errores: ${response.filasError}`);

  } catch (error) {
    console.error('❌ Error en importación:', error);
  }
};
```

### Backend - Endpoint

```
POST /api/bolsa107/importar
Content-Type: multipart/form-data

Parámetros:
- file: archivo.xlsx (form file)

Respuesta:
{
  "idCarga": 123,
  "estadoCarga": "PROCESADO",
  "totalFilas": 100,
  "filasOk": 98,
  "filasError": 2,
  "nombreArchivo": "archivo.xlsx",
  "hashArchivo": "abc123..."
}
```

---

## 📞 Validaciones en Tiempo Real

El sistema valida:

| Validación | Regla | Resultado |
|-----------|-------|-----------|
| Columnas obligatorias | Deben existir | ❌ Falla si faltan |
| Orden de columnas | Deben estar en orden exacto | ❌ Falla si desordenadas |
| Campos obligatorios | DNI, Nombre, Sexo, Fecha, Derivación | ❌ Fila marcada como ERROR |
| Tipo de dato DNI | Debe ser numérico | ❌ Fila marcada como ERROR |
| Formato fecha | DD/MM/YYYY o similar | ⚠️ Se intenta parsear |
| Duplicados | Mismo DNI + TIPO DOCUMENTO | ⚠️ Se marca duplicado |

---

## 🎯 Resumen: Checklist de Preparación

```
☐ Archivo en formato .xlsx
☐ 14 columnas en orden exacto (A-N)
☐ Encabezados en Fila 1
☐ Datos a partir de Fila 2
☐ DNI: números sin guiones (ej: 12345678)
☐ Teléfono: con o sin +51 (ej: 987654321 o +51 987654321)
☐ Fecha: formato DD/MM/YYYY (ej: 15/06/1990)
☐ Sexo: Masculino, Femenino, M, o F
☐ Tipo Documento: DNI, PASAPORTE, etc.
☐ 6 campos obligatorios completos en todas las filas
☐ Sin columnas extras
☐ Sin filas vacías en el medio
☐ Sin caracteres especiales en nombres de columnas
```

---

## 📚 Referencias

- **Auto-Normalización:** `spec/01_Backend/04_auto_normalizacion_excel_107.md`
- **Servicio Backend:** `backend/src/main/java/com/styp/cenate/service/form107/ExcelImportService.java`
- **Componente Frontend:** `frontend/src/pages/bolsas/GestionBolsasPacientes.jsx`
- **Componentes Reutilizables:** `frontend/src/components/README.md`

---

**Versión**: 1.0.0
**Fecha**: 2026-01-22
**Sistema**: CENATE Telemedicina
**Compatibilidad**: v1.15.0+
