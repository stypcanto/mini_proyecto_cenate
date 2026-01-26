# REPORTE DE ANÁLISIS: Bolsa de la Red Arequipa DIC25.xlsx

**Archivo:** `/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/BOLSA DE LA RED AREQUIPA DIC25.xlsx`

**Fecha de análisis:** 2026-01-22

---

## 1. NOMBRES DE COLUMNAS (PRIMERA FILA)

| # | Nombre de Columna | Tipo de Dato |
|---|-------------------|--------------|
| 1 | REGISTRO | float64 (vacío) |
| 2 | FECHA DE CITA PENDIENTE | float64 (vacío) |
| 3 | FUENTE DE DATOS | str |
| 4 | TEL_FIJO | object/int |
| 5 | TEL_MOVIL | float64/int |
| 6 | TIPO DE DOC | float64 (vacío) |
| 7 | DOC_PACIENTE | int64 |
| 8 | PACIENTE | str |
| 9 | SEXO | str |
| 10 | FECNACIMPACIENTE | datetime64 |
| 11 | CAS_ADSCRIPCION | int64 |
| 12 | NOMBADSCRIPCION | str |
| 13 | TIPO_SEGURO | str |
| 14 | ESPECIALIDAD | float64 (vacío) |
| 15 | TELECONSULTA | float64 (vacío) |

---

## 2. CANTIDAD DE FILAS DE DATOS

**Total de filas de datos (excluyendo encabezado): 2,279 registros**

Dimensiones del archivo: 2,279 filas × 15 columnas

Rango en Excel: A1:O2280

---

## 3. TIPOS DE DATOS POR COLUMNA

| Columna | Tipo Pandas | Descripción | % Poblado |
|---------|------------|-------------|-----------|
| REGISTRO | float64 | Identificador de registro (VACÍO) | 0% |
| FECHA DE CITA PENDIENTE | float64 | Fecha de próxima cita (VACÍO) | 0% |
| FUENTE DE DATOS | str | Origen de los datos | 44.8% |
| TEL_FIJO | object | Teléfono fijo (int en Excel) | 34.5% |
| TEL_MOVIL | float64 | Teléfono móvil | 94.2% |
| TIPO DE DOC | float64 | Tipo de documento (VACÍO) | 0% |
| DOC_PACIENTE | int64 | DNI del paciente | 100% |
| PACIENTE | str | Nombre completo | 100% |
| SEXO | str | Sexo (M/F) | 100% |
| FECNACIMPACIENTE | datetime64 | Fecha de nacimiento | 100% |
| CAS_ADSCRIPCION | int64 | Código de IPRESS | 100% |
| NOMBADSCRIPCION | str | Nombre de IPRESS | 100% |
| TIPO_SEGURO | str | Régimen de aseguramiento | 99.5% |
| ESPECIALIDAD | float64 | Especialidad médica (VACÍO) | 0% |
| TELECONSULTA | float64 | Atención telemédica (VACÍO) | 0% |

---

## 4. EJEMPLOS DE LOS PRIMEROS 5 REGISTROS

### Registro 1:
```
FUENTE DE DATOS:    EXPLOTA DATOS
TEL_FIJO:           959706388
TEL_MOVIL:          959706388
DOC_PACIENTE:       29645427
PACIENTE:           SUCASAIRE MAMANI OSCAR ERNESTO
SEXO:               M
FECNACIMPACIENTE:   1975-01-23
CAS_ADSCRIPCION:    453
NOMBADSCRIPCION:    CAP III PAUCARPATA
TIPO_SEGURO:        OBLIGATORIO
```

### Registro 2:
```
FUENTE DE DATOS:    EXPLOTA DATOS
TEL_FIJO:           111
TEL_MOVIL:          959312960
DOC_PACIENTE:       29603339
PACIENTE:           SOSA CHAVEZ JORGE LUIS
SEXO:               M
FECNACIMPACIENTE:   1969-06-21
CAS_ADSCRIPCION:    77
NOMBADSCRIPCION:    POL. METROPOLITANO AREQUIPA
TIPO_SEGURO:        OBLIGATORIO
```

### Registro 3:
```
FUENTE DE DATOS:    EXPLOTA DATOS
TEL_FIJO:           959887169
TEL_MOVIL:          959887169
DOC_PACIENTE:       30413808
PACIENTE:           LLERENA BELTRAN JOSE BENITO WIL
SEXO:               M
FECNACIMPACIENTE:   1956-06-03
CAS_ADSCRIPCION:    75
NOMBADSCRIPCION:    H.I SAMUEL PASTOR
TIPO_SEGURO:        PENSIONISTA
```

### Registro 4:
```
FUENTE DE DATOS:    EXPLOTA DATOS
TEL_FIJO:           (vacío)
TEL_MOVIL:          900264622
DOC_PACIENTE:       29517982
PACIENTE:           CALDERON CORNEJO TOMAS ADOLFO
SEXO:               M
FECNACIMPACIENTE:   1936-09-22
CAS_ADSCRIPCION:    77
NOMBADSCRIPCION:    POL. METROPOLITANO AREQUIPA
TIPO_SEGURO:        PENSIONISTA
```

### Registro 5:
```
FUENTE DE DATOS:    EXPLOTA DATOS
TEL_FIJO:           (vacío)
TEL_MOVIL:          958710914
DOC_PACIENTE:       1230169
PACIENTE:           LUQUE PAMPA CORINA
SEXO:               F
FECNACIMPACIENTE:   1960-03-23
CAS_ADSCRIPCION:    79
NOMBADSCRIPCION:    H.I EDMUNDO ESCOMEL
TIPO_SEGURO:        OBLIGATORIO
```

---

## 5. INFORMACIÓN ESTADÍSTICA DETALLADA

### Valores Nulos por Columna:

| Columna | Nulos | % Nulos |
|---------|-------|---------|
| REGISTRO | 2,279 | 100% ⚠️ |
| FECHA DE CITA PENDIENTE | 2,279 | 100% ⚠️ |
| FUENTE DE DATOS | 1,258 | 55.2% |
| TEL_FIJO | 1,493 | 65.5% |
| TIPO DE DOC | 2,279 | 100% ⚠️ |
| TEL_MOVIL | 132 | 5.8% |
| DOC_PACIENTE | 0 | 0% ✓ |
| PACIENTE | 0 | 0% ✓ |
| SEXO | 0 | 0% ✓ |
| FECNACIMPACIENTE | 0 | 0% ✓ |
| CAS_ADSCRIPCION | 0 | 0% ✓ |
| NOMBADSCRIPCION | 0 | 0% ✓ |
| TIPO_SEGURO | 11 | 0.5% |
| ESPECIALIDAD | 2,279 | 100% ⚠️ |
| TELECONSULTA | 2,279 | 100% ⚠️ |

**OBSERVACIÓN:** 5 columnas están completamente vacías (REGISTRO, FECHA DE CITA PENDIENTE, TIPO DE DOC, ESPECIALIDAD, TELECONSULTA)

### Análisis por Columna Clave:

#### SEXO:
- Mujeres (F): 1,375 (60.3%)
- Hombres (M): 904 (39.7%)

#### DOC_PACIENTE (DNI):
- Mínimo: 406,741
- Máximo: 17,402,879,402 ⚠️ (DNI inválido - muy largo)
- Promedio: 81,952,583
- Valores únicos: 2,011

#### FECNACIMPACIENTE (Edad):
- Edad mínima: 0.1 años ⚠️ (recién nacido o error en datos)
- Edad máxima: 103.7 años
- Edad promedio: 53.2 años
- Fecha más antigua: 1922-04-05
- Fecha más reciente: 2025-12-07

#### TIPO_SEGURO (Régimen de Aseguramiento):
| Régimen | Cantidad | % |
|---------|----------|---|
| OBLIGATORIO | 1,208 | 53.0% |
| PENSIONISTA | 737 | 32.3% |
| BENEFICIARIO LEY 30425 | 140 | 6.1% |
| S.REGULAR D.LEG.1057(CAS) | 78 | 3.4% |
| TRABAJADOR DEL HOGAR | 29 | 1.3% |
| CONSTRUCCION CIVIL | 26 | 1.1% |
| AGRARIO INDEPENDIENTE | 24 | 1.1% |
| AGRARIO DEPENDIENTE | 8 | 0.4% |
| PESCADOR ARTESANAL | 7 | 0.3% |
| TERCERO | 6 | 0.3% |
| POTESTATIVO | 5 | 0.2% |
| (Sin especificar) | 11 | 0.5% |

#### NOMBADSCRIPCION (IPRESS/Establecimientos):
- Cantidad de IPRESS diferentes: 52

**Top 10 IPRESS por pacientes:**
| IPRESS | Pacientes | % |
|--------|-----------|---|
| POL. METROPOLITANO AREQUIPA | 502 | 22.0% |
| H.III YANAHUARA | 392 | 17.2% |
| H.I EDMUNDO ESCOMEL | 236 | 10.4% |
| CAP III MELITON SALAS TEJADA | 208 | 9.1% |
| CAP III MIRAFLORES | 188 | 8.2% |
| CENT.DE COMPLEJ.CRECIENTE CERRO COLORADO | 181 | 7.9% |
| CAP III ALTO SELVA ALEGRE | 133 | 5.8% |
| CAP II HUNTER | 61 | 2.7% |
| H.II MANUEL DE TORRES MUÑOZ | 59 | 2.6% |
| H.I SAMUEL PASTOR | 43 | 1.9% |

#### TEL_MOVIL:
- Registros con teléfono: 2,147 (94.2%)
- Registros sin teléfono: 132 (5.8%)
- Teléfonos con formato válido (9 dígitos): Requiere validación
- Valores únicos: 1,853

#### TEL_FIJO:
- Registros con teléfono: 786 (34.5%)
- Registros sin teléfono: 1,493 (65.5%)
- Valores únicos: 538

---

## 6. PROBLEMAS Y OBSERVACIONES DETECTADAS

⚠️ **CRÍTICOS:**
1. **5 columnas completamente vacías:** REGISTRO, FECHA DE CITA PENDIENTE, TIPO DE DOC, ESPECIALIDAD, TELECONSULTA
2. **DNI inválido:** Valor máximo 17,402,879,402 (muy largo - típico es 8 dígitos)
3. **Edad anómala:** Bebés de 0.1 años o errores en fechas

⚠️ **MODERADOS:**
1. Teléfono fijo poco poblado (34.5%)
2. TIPO_SEGURO con 11 valores vacíos
3. FUENTE DE DATOS poco poblada (44.8%)

✓ **FORTALEZAS:**
1. DNI del paciente completo (100%)
2. Nombre de paciente completo (100%)
3. Sexo del paciente (100%)
4. Fecha de nacimiento (100%)
5. Adscripción a IPRESS (100%)
6. Teléfono móvil bien poblado (94.2%)

---

## 7. RESUMEN TÉCNICO

| Concepto | Valor |
|----------|-------|
| **Formato** | Excel 2007+ (.xlsx) |
| **Hoja activa** | Hoja1 |
| **Filas** | 2,279 datos + 1 encabezado |
| **Columnas** | 15 |
| **Rango** | A1:O2280 |
| **Tamaño aproximado** | ~500 KB |
| **Codificación** | UTF-8 |
| **Columnas con datos** | 10 de 15 (66.7%) |
| **Columnas vacías** | 5 de 15 (33.3%) |
| **Registros únicos** | 2,011 pacientes (268 registros duplicados) |

---

## 8. RECOMENDACIONES PARA IMPORTACIÓN

1. **Validar DNIs:** Algunos tienen valores anormales
2. **Limpiar teléfonos:** Normalizar formato (9 dígitos)
3. **Llenar especialidades:** Columna está vacía, requiere carga manual o integración
4. **Validar fechas:** Revisar registros con edad < 1 año
5. **Mapear IPRESS:** Vincular CAS_ADSCRIPCION con base de datos IPRESS
6. **Completar tipo de seguro:** 11 registros sin especificar

---

**Análisis completado con éxito**

