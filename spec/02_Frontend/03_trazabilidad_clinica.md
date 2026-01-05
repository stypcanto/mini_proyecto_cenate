# Módulo de Trazabilidad Clínica - Documentación Técnica

> **Estado**: ✅ Implementado (Frontend 100%, Backend 100%, Múltiples CIE-10 ✅)
> **Versión**: 2.1.0
> **Fecha**: 2026-01-03
> **Autores**: Claude Code + Ing. Styp Canto Rondón

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Módulo](#arquitectura-del-módulo)
3. [Módulo de Múltiples Diagnósticos CIE-10](#módulo-de-múltiples-diagnósticos-cie-10) ⭐ **NUEVO**
4. [Componentes Implementados](#componentes-implementados)
5. [Estado de Implementación](#estado-de-implementación)
6. [Problemas Identificados](#problemas-identificados)
7. [Plan de Corrección](#plan-de-corrección)
8. [Testing y Validación](#testing-y-validación)

---

## 1. Resumen Ejecutivo

El **Módulo de Trazabilidad Clínica** permite registrar, visualizar y gestionar el historial completo de atenciones médicas de los asegurados. Incluye:

- ✅ Registro de atenciones clínicas (teleconsultas, presenciales, etc.)
- ✅ Visualización de timeline de atenciones por asegurado
- ✅ Gestión de signos vitales y diagnósticos
- ✅ Integración con módulo de Búsqueda de Asegurados
- ⚠️  Backend REST API (requiere ajustes de schema)

### Objetivos Cumplidos

| Objetivo | Estado | Descripción |
|----------|--------|-------------|
| Catálogos Base | ✅ 100% | Estrategias Institucionales + Tipos de Atención |
| Frontend CRUD | ✅ 100% | Componentes de gestión de catálogos |
| Integración UI | ✅ 100% | Tabs en panel de admin |
| Modal 3-Tab | ✅ 100% | Paciente / IPRESS / Antecedentes |
| Timeline Component | ✅ 100% | HistorialAtencionesTab funcional |
| Backend API | 🟡 70% | 7 endpoints creados, requieren validación |

---

## 2. Arquitectura del Módulo

### 2.1 Estructura de Datos (Base de Datos)

```sql
-- Tablas principales
dim_estrategia_institucional  ← Estrategias institucionales (PROMSA, DOTS, etc.)
dim_tipo_atencion_telemedicina ← Tipos de atención (TC, TA, TE, etc.)
atencion_clinica               ← Registro de atenciones médicas

-- Relaciones
atencion_clinica.pk_asegurado → asegurados(pk_asegurado)
atencion_clinica.id_ipress → dim_ipress(id_ipress)
atencion_clinica.id_especialidad → dim_servicio_essi(id_servicio)
atencion_clinica.id_estrategia → dim_estrategia_institucional(id_estrategia)
atencion_clinica.id_tipo_atencion → dim_tipo_atencion_telemedicina(id_tipo_atencion)
atencion_clinica.id_personal_creador → dim_personal_cnt(id_pers)
```

### 2.2 Arquitectura Frontend

```
frontend/src/
├── services/
│   ├── estrategiasService.js          ← API service para estrategias
│   ├── tiposAtencionService.js        ← API service para tipos de atención
│   └── atencionesClinicasService.js   ← API service para atenciones (7 métodos)
│
├── components/trazabilidad/
│   └── HistorialAtencionesTab.jsx     ← Timeline de atenciones del asegurado
│
└── pages/
    ├── admin/catalogs/
    │   ├── EstrategiasInstitucionales.jsx    ← CRUD estrategias (665 líneas)
    │   └── TiposAtencionTelemedicina.jsx     ← CRUD tipos atención (735 líneas)
    │
    ├── asegurados/
    │   └── BuscarAsegurado.jsx               ← Modal modificado con 3 tabs
    │
    └── user/
        ├── UsersManagement.jsx               ← Agregadas 2 nuevas tabs
        └── components/TabsNavigation.jsx     ← Botones de navegación
```

### 2.3 Arquitectura Backend (Planeada)

```
backend/src/main/java/com/styp/cenate/
├── api/atencion/
│   └── AtencionClinicaController.java        ← 7 endpoints REST
│
├── service/atencion/
│   ├── IAtencionClinicaService.java          ← Interface de servicio
│   └── AtencionClinicaServiceImpl.java       ← Implementación (⚠️ requiere ajustes)
│
├── repository/
│   ├── AtencionClinicaRepository.java        ← JPA Repository
│   ├── EstrategiaInstitucionalRepository.java
│   └── TipoAtencionTelemedicinaRepository.java
│
└── model/
    ├── AtencionClinica.java                  ← Entity (atencion_clinica)
    ├── EstrategiaInstitucional.java
    └── TipoAtencionTelemedicina.java
```

---

## 3. Módulo de Múltiples Diagnósticos CIE-10

> ⭐ **Implementación Completa**: Backend + Frontend + UI/UX Médico
> **Versión**: 1.0.0
> **Fecha**: 2026-01-03

### 3.1 Resumen

El módulo permite registrar **múltiples diagnósticos CIE-10** por atención clínica, diferenciando entre diagnóstico principal y secundarios. Implementa principios de **UI/UX médico** priorizando información clínica sobre administrativa.

### 3.2 Estructura de Base de Datos

#### Tabla: `atencion_diagnosticos_cie10`

```sql
CREATE TABLE atencion_diagnosticos_cie10 (
    id SERIAL PRIMARY KEY,
    id_atencion INTEGER NOT NULL REFERENCES atencion_clinica(id_atencion) ON DELETE CASCADE,
    cie10_codigo VARCHAR(10) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE,
    orden INTEGER NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_atencion_diagnosticos_atencion ON atencion_diagnosticos_cie10(id_atencion);
CREATE INDEX idx_atencion_diagnosticos_codigo ON atencion_diagnosticos_cie10(cie10_codigo);
```

#### Catálogo: `dim_cie10`

```sql
-- Contiene 14,400+ códigos CIE-10 con descripciones
SELECT codigo, descripcion FROM dim_cie10 WHERE codigo IN ('I10', 'I251', 'E785');

 codigo |           descripcion
--------|----------------------------------
 I10    | Hipertensión esencial (primaria)
 I251   | Enfermedad aterosclerótica del corazón
 E785   | Hiperlipidemia no especificada
```

#### Ejemplo de Datos Reales

```sql
-- Atención #15: Paciente con hipertensión y comorbilidades
SELECT
  adc.id_atencion,
  adc.cie10_codigo,
  dc.descripcion,
  adc.es_principal,
  adc.orden,
  adc.observaciones
FROM atencion_diagnosticos_cie10 adc
LEFT JOIN dim_cie10 dc ON adc.cie10_codigo = dc.codigo
WHERE adc.id_atencion = 15
ORDER BY adc.orden;

 id_atencion | cie10_codigo | descripcion                            | es_principal | orden | observaciones
-------------|--------------|----------------------------------------|--------------|-------|------------------
 15          | I10          | Hipertensión esencial (primaria)       | t            | 1     | Diagnóstico principal
 15          | I251         | Enfermedad aterosclerótica del corazón | f            | 2     | Cardiopatía aterosclerótica
 15          | E785         | Hiperlipidemia no especificada         | f            | 3     | Factor de riesgo cardiovascular
```

### 3.3 Backend Implementation

#### Service Layer: `AtencionClinicaServiceImpl.java`

**Archivo**: `/backend/src/main/java/com/styp/cenate/service/atencion/AtencionClinicaServiceImpl.java`

**Líneas**: 340-399

```java
// Obtener lista completa de diagnósticos CIE-10 (soporte múltiple)
List<DiagnosticoCie10DTO> diagnosticosCie10 = diagnosticoCie10Repository
        .findByIdAtencionOrderByOrdenAsc(atencion.getIdAtencion())
        .stream()
        .map(diag -> {
            // JOIN con catálogo dim_cie10 para obtener descripción
            String descripcion = dimCie10Repository
                    .findDescripcionByCodigo(diag.getCie10Codigo())
                    .orElse(null);

            return DiagnosticoCie10DTO.builder()
                    .cie10Codigo(diag.getCie10Codigo())
                    .cie10Descripcion(descripcion)
                    .esPrincipal(diag.getEsPrincipal())
                    .orden(diag.getOrden())
                    .observaciones(diag.getObservaciones())
                    .build();
        })
        .collect(Collectors.toList());

// Agregar al DTO de respuesta
return AtencionClinicaResponseDTO.builder()
        // ... otros campos ...
        .diagnosticosCie10(diagnosticosCie10)  // Array de diagnósticos
        .cie10Codigo(atencion.getCie10Codigo()) // Legacy - mantiene compatibilidad
        .cie10Descripcion(cie10Descripcion)     // Legacy
        .build();
```

#### DTO: `DiagnosticoCie10DTO.java`

```java
@Data
@Builder
public class DiagnosticoCie10DTO {
    private String cie10Codigo;        // Ej: "I10"
    private String cie10Descripcion;   // Ej: "Hipertensión esencial (primaria)"
    private Boolean esPrincipal;       // true = diagnóstico principal ⭐
    private Integer orden;             // 1, 2, 3, ...
    private String observaciones;      // Notas adicionales del médico
}
```

#### API Response Format

```json
{
  "status": 200,
  "data": {
    "idAtencion": 15,
    "diagnosticosCie10": [
      {
        "cie10Codigo": "I10",
        "cie10Descripcion": "Hipertensión esencial (primaria)",
        "esPrincipal": true,
        "orden": 1,
        "observaciones": "Diagnóstico principal"
      },
      {
        "cie10Codigo": "I251",
        "cie10Descripcion": "Enfermedad aterosclerótica del corazón",
        "esPrincipal": false,
        "orden": 2,
        "observaciones": "Cardiopatía aterosclerótica - Diagnóstico secundario"
      },
      {
        "cie10Codigo": "E785",
        "cie10Descripcion": "Hiperlipidemia no especificada",
        "esPrincipal": false,
        "orden": 3,
        "observaciones": "Hiperlipidemia - Factor de riesgo cardiovascular"
      }
    ],
    "tratamiento": "Enalapril 10mg VO c/12h. Control en 15 días.",
    "recomendacionEspecialista": "Control periódico de presión arterial..."
  }
}
```

### 3.4 Frontend Components

#### 3.4.1 Modal de Detalle: `DetalleAtencionModal.jsx`

**Archivo**: `/frontend/src/components/trazabilidad/DetalleAtencionModal.jsx`
**Líneas**: 300-451

**Diseño UI/UX Médico** (Basado en feedback de profesionales de salud):

```
┌─────────────────────────────────────────────────────────────┐
│                  DATOS CLÍNICOS                             │
├─────────────────────────────────────────────────────────────┤
│  [2/3 COLUMNA IZQ - ACCIÓN CLÍNICA]  │ [1/3 COL DER - CTX] │
│                                        │                     │
│  💊 PLAN FARMACOLÓGICO (VERDE)         │ 📋 CIE-10 (COMPACTO)│
│  ┌────────────────────────────┐       │ ┌─────────────────┐ │
│  │ Enalapril 10mg VO c/12h    │       │ │ [I10] ⭐ Hiper. │ │
│  │ Control en 15 días         │       │ │ [I251] Enf. Ate.│ │
│  └────────────────────────────┘       │ │ [E785] Hiperlip.│ │
│                                        │ └─────────────────┘ │
│  👨‍⚕️ RECOMENDACIONES (TEAL)            │                     │
│  ┌────────────────────────────┐       │ 📝 ANTECEDENTES     │
│  │ Control periódico PA       │       │                     │
│  │ Modificar hábitos aliment. │       │ 🎯 ESTRATEGIA       │
│  └────────────────────────────┘       │                     │
└────────────────────────────────────────┴─────────────────────┘
```

**Principios aplicados**:
1. ✅ **Tratamiento > Códigos**: Medicación visible sin scroll
2. ✅ **2 columnas**: Izq (acción clínica) + Der (contexto administrativo)
3. ✅ **CIE-10 comprimido**: De cards gigantes → lista compacta (3 líneas)
4. ✅ **Sin redundancia**: No repetir valores numéricos de Signos Vitales

**Código del layout 2 columnas**:

```jsx
{/* Grid 2 columnas responsive */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

  {/* COLUMNA IZQUIERDA: ACCIÓN CLÍNICA (2/3) */}
  <div className="lg:col-span-2 space-y-4">

    {/* 💊 Plan Farmacológico (PRIORIDAD #1) */}
    {atencion.tratamiento && (
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-3 border-green-500 rounded-xl p-5 shadow-lg">
        <h3 className="text-lg font-black text-green-900 uppercase">
          💊 Plan Farmacológico
        </h3>
        <pre className="text-sm text-green-900 font-semibold">
          {atencion.tratamiento}
        </pre>
      </div>
    )}

    {/* 👨‍⚕️ Recomendaciones Clínicas */}
    {atencion.recomendacionEspecialista && (
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-400">
        {/* ... */}
      </div>
    )}
  </div>

  {/* COLUMNA DERECHA: CONTEXTO ADMINISTRATIVO (1/3) */}
  <div className="lg:col-span-1 space-y-4">

    {/* 📋 Códigos CIE-10 COMPACTOS */}
    <div className="bg-slate-50 border-2 border-slate-300 rounded-xl p-4">
      <h3 className="text-xs font-bold text-slate-600 uppercase">
        Códigos CIE-10
      </h3>
      <ul className="space-y-2 text-xs text-slate-700">
        {atencion.diagnosticosCie10.map((diag, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
              diag.esPrincipal ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {diag.cie10Codigo}
            </span>
            <span className="leading-tight">
              {diag.esPrincipal && <strong>⭐ </strong>}
              {diag.cie10Descripcion}
            </span>
          </li>
        ))}
      </ul>
    </div>
  </div>
</div>
```

#### 3.4.2 Historial de Atenciones: `HistorialAtencionesTab.jsx`

**Archivo**: `/frontend/src/components/trazabilidad/HistorialAtencionesTab.jsx`
**Líneas**: 562-640

**Orden de información** (según prioridad médica):

1. **💊 Plan Farmacológico** (verde, destacado)
2. **👨‍⚕️ Recomendaciones** (teal)
3. **📋 Códigos CIE-10** (compacto, gris)
4. **📝 Impresión Diagnóstica** (morado)

**Código de CIE-10 compacto**:

```jsx
{/* 📋 CIE-10 Compacto (Contexto administrativo) */}
{(atencion.diagnosticosCie10?.length > 0 || atencion.cie10Codigo) && (
  <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg">
    <h4 className="text-xs font-bold text-slate-600 uppercase flex items-center gap-2">
      <Stethoscope className="w-3 h-3" />
      Códigos CIE-10 {atencion.diagnosticosCie10?.length > 0 && `(${atencion.diagnosticosCie10.length})`}
    </h4>

    {atencion.diagnosticosCie10?.length > 0 ? (
      <ul className="space-y-1.5 text-xs text-slate-700">
        {atencion.diagnosticosCie10.map((diag, index) => (
          <li key={index} className="flex items-start gap-2">
            <span className={`px-1.5 py-0.5 rounded font-mono font-bold text-[10px] ${
              diag.esPrincipal ? 'bg-red-600 text-white' : 'bg-slate-300 text-slate-700'
            }`}>
              {diag.cie10Codigo}
            </span>
            <span className="leading-tight">
              {diag.esPrincipal && <strong>⭐ </strong>}
              {diag.cie10Descripcion}
            </span>
          </li>
        ))}
      </ul>
    ) : (
      /* Formato legacy para atenciones antiguas */
      <div className="flex items-start gap-2 text-xs">
        <span className="px-1.5 py-0.5 bg-red-600 text-white rounded font-mono font-bold text-[10px]">
          {atencion.cie10Codigo}
        </span>
        <span className="leading-tight">{atencion.cie10Descripcion}</span>
      </div>
    )}
  </div>
)}
```

### 3.5 Principios de UI/UX Médico Aplicados

#### Retroalimentación del Usuario (Médico)

> **Feedback original**: "¿Por qué rayos ocupa la mitad de la pantalla? Tienes tres tarjetas gigantes para códigos administrativos. A mí, el código exacto me importa para la estadística y la aseguradora. Para tratar al paciente, ya sé que es hipertenso porque lo vi arriba en rojo gigante."

#### Solución Implementada

| Antes ❌ | Después ✅ |
|---------|----------|
| 3 tarjetas gigantes de CIE-10 | Lista compacta en 3 líneas |
| Códigos ocupan 50% pantalla | Códigos en columna lateral (33%) |
| Tratamiento fuera de vista | Tratamiento PRIMERO, sin scroll |
| Redundancia numérica en texto | Solo texto cualitativo |
| Colores "chillones" | Slate gris, sin distracciones |

#### Reglas de Oro

1. **Diagnóstico + Tratamiento**: Deben verse juntos sin scroll
2. **Jerarquía Visual**: Medicación > Códigos administrativos
3. **Espacio Eficiente**: Comprimir datos administrativos
4. **No Redundancia**: No repetir valores numéricos ya mostrados
5. **Workflow Médico**: Pensar como médico, no como programador

### 3.6 Testing y Validación

#### Test 1: Obtener atenciones con múltiples CIE-10

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"44914706","password":"@Styp654321"}' | jq -r '.token')

curl -s -X GET "http://localhost:8080/api/atenciones-clinicas/asegurado/1?page=0&size=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.data.content[0].diagnosticosCie10'
```

**Resultado esperado**:
```json
[
  {
    "cie10Codigo": "I10",
    "cie10Descripcion": "Hipertensión esencial (primaria)",
    "esPrincipal": true,
    "orden": 1,
    "observaciones": "Diagnóstico principal"
  },
  {
    "cie10Codigo": "I251",
    "cie10Descripcion": "Enfermedad aterosclerótica del corazón",
    "esPrincipal": false,
    "orden": 2,
    "observaciones": "Cardiopatía aterosclerótica - Diagnóstico secundario"
  },
  {
    "cie10Codigo": "E785",
    "cie10Descripcion": "Hiperlipidemia no especificada",
    "esPrincipal": false,
    "orden": 3,
    "observaciones": "Hiperlipidemia - Factor de riesgo cardiovascular"
  }
]
```

#### Test 2: Validación Frontend

1. Login en `http://localhost:3000`
2. Buscar asegurado con pk_asegurado = 1
3. Navegar a tab "Antecedentes Clínicos"
4. Abrir atención #15 (clic en card)
5. Verificar:
   - ✅ Tratamiento visible sin scroll
   - ✅ CIE-10 compacto en columna derecha
   - ✅ Diagnóstico principal marcado con ⭐ y badge rojo
   - ✅ Diagnósticos secundarios con badge gris
   - ✅ Contador "(3)" en header de CIE-10

### 3.7 Archivos Modificados

| Archivo | Líneas | Cambios |
|---------|--------|---------|
| `AtencionClinicaServiceImpl.java` | 340-399 | Query y mapeo múltiples CIE-10 |
| `DetalleAtencionModal.jsx` | 300-451 | Layout 2 columnas, CIE-10 compacto |
| `HistorialAtencionesTab.jsx` | 562-640 | Reordenar prioridades, CIE-10 compacto |

### 3.8 Scripts SQL de Referencia

**Insertar múltiples diagnósticos**:
```sql
INSERT INTO atencion_diagnosticos_cie10 (id_atencion, cie10_codigo, es_principal, orden, observaciones)
VALUES
  (15, 'I10', TRUE, 1, 'Diagnóstico principal'),
  (15, 'I251', FALSE, 2, 'Cardiopatía aterosclerótica - Diagnóstico secundario'),
  (15, 'E785', FALSE, 3, 'Hiperlipidemia - Factor de riesgo cardiovascular');
```

**Consultar con descripción**:
```sql
SELECT
  adc.id_atencion,
  adc.cie10_codigo,
  dc.descripcion AS cie10_descripcion,
  adc.es_principal,
  adc.orden
FROM atencion_diagnosticos_cie10 adc
LEFT JOIN dim_cie10 dc ON adc.cie10_codigo = dc.codigo
WHERE adc.id_atencion = 15
ORDER BY adc.orden;
```

---

## 4. Componentes Implementados

### 3.1 Frontend Services

#### `estrategiasService.js` (90 líneas)

```javascript
// 6 métodos CRUD
obtenerTodas(page, size)
obtenerActivas()
obtenerPorId(id)
crear(data)
actualizar(id, data)
eliminar(id)

// Base URL
/admin/estrategias-institucionales
```

#### `tiposAtencionService.js` (93 líneas)

```javascript
// 6 métodos CRUD
obtenerTodos(page, size)
obtenerActivos()
obtenerPorId(id)
crear(data)
actualizar(id, data)
eliminar(id)

// Base URL
/admin/tipos-atencion-telemedicina
```

#### `atencionesClinicasService.js` (120 líneas)

```javascript
// 7 métodos especializados
obtenerPorAsegurado(pkAsegurado, page, size)    ← Principal para timeline
obtenerDetalle(id)
obtenerMisAtenciones(page, size)                ← Para médicos
crear(data)
actualizar(id, data)
agregarObservacionEnfermeria(id, data)          ← Rol ENFERMERIA
eliminar(id)

// Base URL
/atenciones-clinicas
```

### 3.2 Componentes de Catálogos

#### `EstrategiasInstitucionales.jsx` (665 líneas)

**Características**:
- CRUD completo con paginación
- Validación de duplicados (código y sigla)
- Modal de creación/edición con 2 columnas
- Toggle de estado (Activo/Inactivo)
- Búsqueda en tiempo real

**Campos**:
- `codigo`: Código único (requerido, uppercase)
- `sigla`: Sigla única (requerido, uppercase)
- `descripcion`: Descripción de la estrategia
- `estado`: A (Activo) / I (Inactivo)

**Ejemplos de registros**:
```
PROMSA  → Programa del adulto mayor
DOTS    → Tratamiento acortado directamente observado
ESAVI   → Eventos supuestamente atribuidos a vacunación o inmunización
```

#### `TiposAtencionTelemedicina.jsx` (735 líneas)

**Características**:
- Similar a Estrategias con campo adicional
- Checkbox "Requiere Profesional de Salud"
- Badge visual en tabla para campo booleano
- Validación duplicados + caso especial SIN CLASIFICAR

**Campos**:
- `codTipoAtencion`: Código único
- `sigla`: Sigla única
- `descTipoAtencion`: Descripción
- `requiereProfesional`: Boolean (default: true)
- `estado`: A/I

**Ejemplos de registros**:
```
TC → Teleconsulta              (requiere profesional)
TA → Teleasistencia            (requiere profesional)
TE → Teleeducación             (no requiere profesional)
TM → Telemonitoreo             (no requiere profesional)
```

### 3.3 Modal BuscarAsegurado (Modificado)

**Archivo**: `frontend/src/pages/asegurados/BuscarAsegurado.jsx`

**Cambios realizados**:

1. **Imports agregados**:
```jsx
import { Activity, FileText } from "lucide-react";
import HistorialAtencionesTab from "../../components/trazabilidad/HistorialAtencionesTab";
```

2. **Estado de tabs**:
```jsx
const [tabActiva, setTabActiva] = useState('paciente');
// Valores: 'paciente', 'ipress', 'antecedentes'
```

3. **Navegación de tabs** (3 botones):
   - 🧑 **Información del Paciente** → Datos personales del asegurado
   - 🏥 **Centro de Adscripción** → Información de IPRESS
   - 📋 **Antecedentes Clínicos** → Timeline de atenciones (nuevo)

4. **Renderizado condicional**:
```jsx
{tabActiva === 'paciente' && <div>Datos del asegurado...</div>}
{tabActiva === 'ipress' && <div>Datos de IPRESS...</div>}
{tabActiva === 'antecedentes' && (
  <HistorialAtencionesTab pkAsegurado={detalleAsegurado.asegurado.pkAsegurado} />
)}
```

### 3.4 HistorialAtencionesTab Component

**Archivo**: `frontend/src/components/trazabilidad/HistorialAtencionesTab.jsx` (250 líneas)

**Propósito**: Mostrar timeline vertical de todas las atenciones clínicas de un asegurado.

**Props**:
```jsx
<HistorialAtencionesTab pkAsegurado="8634451-202307" />
```

**Características**:
- Timeline vertical con líneas conectoras
- Cards por cada atención con información completa
- Estados: loading, error, empty, populated
- Botón de actualización manual
- Badges para signos vitales, interconsulta, telemonitoreo

**Estructura de cada card**:
```
┌─────────────────────────────────────────┐
│ [Icono] Teleconsulta Médica             │ [ACTIVA/INACTIVA]
│         Medicina General                │
├─────────────────────────────────────────┤
│ 📅 03 de enero, 2026                    │
│ 👨‍⚕️ Dr. Juan Pérez López                │
│ 🏥 Hospital Nacional Edgardo Rebagliati │
│ 📄 Estrategia PROMSA                    │
├─────────────────────────────────────────┤
│ Motivo: Consulta de control            │  ← Box azul
│ Diagnóstico: Paciente estable          │  ← Box morado
├─────────────────────────────────────────┤
│ [Signos Vitales ✓] [Interconsulta]     │  ← Badges
└─────────────────────────────────────────┘
```

**Estados manejados**:
1. **Loading**: Spinner + "Cargando atenciones clínicas..."
2. **Error**: Mensaje de error + botón "Reintentar"
3. **Empty**: "No se encontraron atenciones clínicas"
4. **Populated**: Timeline con todas las atenciones

**Datos mostrados por atención**:
- Tipo de atención (TC, TA, TM, etc.)
- Especialidad médica
- Fecha de atención
- Profesional de salud
- IPRESS donde se realizó
- Estrategia institucional (si aplica)
- Motivo de consulta
- Diagnóstico
- Flags: signos vitales, interconsulta, telemonitoreo

---

## 4. Estado de Implementación

### ✅ COMPLETADO (100%)

#### FASE 1-2: Catálogos Base (BD + Backend)
- ✅ Tabla `dim_estrategia_institucional`
- ✅ Tabla `dim_tipo_atencion_telemedicina`
- ✅ Tabla `atencion_clinica` con 30+ campos
- ✅ Repositories Spring Data JPA
- ✅ Entities con anotaciones JPA
- ✅ Índices de rendimiento

#### FASE 4: Frontend Servicios + CRUD
- ✅ 3 servicios API creados (240 líneas total)
- ✅ 2 componentes CRUD completos (1400 líneas total)
- ✅ Integración en `UsersManagement.jsx`
- ✅ Tabs de navegación en panel admin

#### FASE 5: Modal Búsqueda con 3 Tabs
- ✅ Sistema de tabs implementado
- ✅ Preservación de contenido existente
- ✅ Integración con `HistorialAtencionesTab`

#### FASE 6: Componente Timeline
- ✅ `HistorialAtencionesTab.jsx` funcional
- ✅ Manejo completo de estados
- ✅ UI responsiva y moderna

### 🟡 PARCIALMENTE COMPLETADO

#### FASE 3: Backend API Atenciones

**Archivos creados** (no compilables actualmente):
```
backend/src/main/java/com/styp/cenate/
├── api/atencion/AtencionClinicaController.java          (355 líneas)
└── service/atencion/AtencionClinicaServiceImpl.java     (420 líneas)
```

**7 Endpoints definidos**:
```java
GET    /api/atenciones-clinicas/asegurado/{pkAsegurado}
GET    /api/atenciones-clinicas/{id}
GET    /api/atenciones-clinicas/mis-atenciones
POST   /api/atenciones-clinicas
PUT    /api/atenciones-clinicas/{id}
PUT    /api/atenciones-clinicas/{id}/observacion-enfermeria
DELETE /api/atenciones-clinicas/{id}
```

**Permisos MBAC configurados**:
```java
@CheckMBACPermission(pagina = "/atenciones-clinicas", accion = "ver|crear|editar|eliminar")
```

### ❌ PENDIENTE

#### FASE 7: Testing y Documentación
- ⏳ Testing de endpoints backend (bloqueado por errores de compilación)
- ⏳ Validación end-to-end
- ⏳ Actualización de changelog a v2.0.0
- ⏳ Commit final

---

## 5. Problemas Identificados

### 5.1 Errores de Compilación Backend

**Problema principal**: El `AtencionClinicaServiceImpl.java` tiene **37 errores de compilación**.

#### Categorías de errores:

1. **Métodos de Repository inexistentes** (15 errores)
```java
// ❌ ERROR: No existe este método
atencionRepository.findByAsegurado_PkAsegurado(pkAsegurado, pageable)

// ✅ SOLUCIÓN: Verificar métodos disponibles en AtencionClinicaRepository
// Probablemente sea:
findAllByPkAsegurado(pkAsegurado, pageable)
```

2. **Tipos de Entidad incorrectos** (8 errores)
```java
// ❌ ERROR: Especialidad vs DimServicioEssi
Especialidad especialidad = especialidadRepository.findById(...)

// ✅ SOLUCIÓN: Usar el tipo correcto
DimServicioEssi especialidad = especialidadRepository.findById(...)
```

3. **Métodos de Entidad faltantes** (10 errores)
```java
// ❌ ERROR: Método no existe en la entidad
atencion.setAsegurado(asegurado);

// ✅ SOLUCIÓN: Verificar getters/setters reales de AtencionClinica
// Probablemente sea:
atencion.setPkAsegurado(pkAsegurado);
```

4. **Firma de AuditLogService incorrecta** (4 errores)
```java
// ❌ ERROR: Espera String pero recibe Long
auditLogService.registrarEvento(userId, "CREATE", "ATENCION_CLINICA", id, mensaje);

// ✅ SOLUCIÓN: Convertir Long a String
auditLogService.registrarEvento(userId, "CREATE", "ATENCION_CLINICA", id.toString(), mensaje);
```

### 5.2 Schema Mismatch

El código del Service fue escrito asumiendo un schema de BD diferente al real:

**Esperado por el código**:
```
Especialidad entity
PersonalSalud entity
Repository method: findByAsegurado_PkAsegurado()
```

**Real en la BD**:
```
DimServicioEssi entity
PersonalCnt entity
Método real: (desconocido, requiere verificación)
```

---

## 6. Plan de Corrección

### Fase 6.1: Análisis de Entities (2-3 horas)

**Objetivo**: Entender el schema real de la BD.

1. **Leer definiciones de entidades**:
```bash
# Verificar estructura real de:
backend/src/main/java/com/styp/cenate/model/AtencionClinica.java
backend/src/main/java/com/styp/cenate/model/Asegurado.java
backend/src/main/java/com/styp/cenate/model/PersonalCnt.java
backend/src/main/java/com/styp/cenate/model/DimServicioEssi.java
```

2. **Leer repositories disponibles**:
```bash
# Verificar métodos custom de:
backend/src/main/java/com/styp/cenate/repository/AtencionClinicaRepository.java
backend/src/main/java/com/styp/cenate/repository/AseguradoRepository.java
```

3. **Comparar con schema de BD**:
```sql
\d atencion_clinica
\d asegurados
\d dim_personal_cnt
\d dim_servicio_essi
```

### Fase 6.2: Corrección de ServiceImpl (3-4 horas)

**Tareas**:

1. ✅ **Corregir imports**
   - `PersonalSalud` → `PersonalCnt`
   - `Especialidad` → `DimServicioEssi` (si aplica)
   - `UnauthorizedException` → `IllegalStateException`

2. ⏳ **Actualizar métodos de conversión** (`convertirADTO()`)
   - Usar getters/setters correctos de la entidad
   - Mapear campos de relaciones correctamente

3. ⏳ **Corregir queries de Repository**
   - Reemplazar `findByAsegurado_PkAsegurado()` por método real
   - Verificar otros métodos findBy...

4. ⏳ **Ajustar lógica de negocio**
   - Validar que las relaciones FK existen antes de insertar
   - Corregir cálculo de campos derivados (edad, IMC, etc.)

### Fase 6.3: Testing Backend (1-2 horas)

Una vez compilable:

1. **Reiniciar backend**:
```bash
./gradlew bootRun
```

2. **Testing con curl** (7 endpoints):
```bash
# 1. Obtener atenciones de asegurado (vacío)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/asegurado/8634451-202307?page=0&size=10

# 2. Crear atención de prueba
curl -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"pkAsegurado":"8634451-202307","idIpress":2,"idTipoAtencion":1,...}' \
  http://localhost:8080/api/atenciones-clinicas

# 3. Obtener detalle de atención
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/{id}

# 4. Actualizar atención
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/{id} \
  -d '{...}'

# 5. Agregar observación de enfermería
curl -X PUT -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/{id}/observacion-enfermeria \
  -d '{"observacion":"..."}'

# 6. Obtener mis atenciones (profesional)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/mis-atenciones?page=0&size=10

# 7. Eliminar atención
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/atenciones-clinicas/{id}
```

3. **Validación de resultados**:
   - Verificar códigos de respuesta (200, 201, 404, 500)
   - Validar estructura de JSON responses
   - Confirmar datos en BD con `psql`

### Fase 6.4: Testing Frontend Integrado (1 hora)

1. Crear 3-5 atenciones de prueba vía API
2. Abrir frontend en `http://localhost:3000`
3. Buscar asegurado de prueba
4. Navegar a tab "Antecedentes Clínicos"
5. Verificar timeline se visualiza correctamente
6. Probar botón "Actualizar"
7. Validar formato de fechas y datos

---

## 7. Testing y Validación

### 7.1 Tests Manuales Frontend (✅ Completados)

| Test | Estado | Resultado |
|------|--------|-----------|
| CRUD Estrategias - Crear | ✅ | Funcional |
| CRUD Estrategias - Editar | ✅ | Funcional |
| CRUD Estrategias - Eliminar | ✅ | Funcional |
| CRUD Estrategias - Búsqueda | ✅ | Funcional |
| CRUD Estrategias - Validación duplicados | ✅ | Funcional |
| CRUD Tipos Atención - Crear | ✅ | Funcional |
| CRUD Tipos Atención - Checkbox "Requiere Prof" | ✅ | Funcional |
| Modal 3 tabs - Navegación | ✅ | Funcional |
| Modal 3 tabs - Preservación contenido | ✅ | Funcional |
| HistorialAtencionesTab - Render | ✅ | Funcional |
| HistorialAtencionesTab - Loading state | ✅ | Funcional |
| HistorialAtencionesTab - Error state | ✅ | Funcional |

### 7.2 Tests Backend (⏳ Pendientes)

```bash
# Una vez corregido el ServiceImpl, ejecutar:

# Test 1: Verificar tabla vacía
curl http://localhost:8080/api/atenciones-clinicas/asegurado/TEST?page=0&size=5

# Test 2: Crear atención
ID=$(curl -X POST ... | jq -r '.data.idAtencion')

# Test 3: Obtener detalle
curl http://localhost:8080/api/atenciones-clinicas/$ID

# Test 4: Actualizar
curl -X PUT http://localhost:8080/api/atenciones-clinicas/$ID -d '{...}'

# Test 5: Obtener lista actualizada
curl http://localhost:8080/api/atenciones-clinicas/asegurado/TEST

# Test 6: Eliminar
curl -X DELETE http://localhost:8080/api/atenciones-clinicas/$ID

# Test 7: Verificar eliminación (debe dar 404)
curl http://localhost:8080/api/atenciones-clinicas/$ID
```

### 7.3 Tests de Integración E2E (⏳ Pendientes)

1. Crear atención vía POST
2. Refrescar frontend
3. Buscar asegurado
4. Verificar aparece en timeline
5. Actualizar datos vía PUT
6. Refrescar frontend
7. Verificar cambios reflejados

---

## 8. Referencias y Archivos Clave

### Documentación Técnica

```
📂 /spec/02_Frontend/03_trazabilidad_clinica.md          ← Este archivo
📂 /plan/02_Modulos_Medicos/03_plan_trazabilidad_clinica.md  ← Plan original
📂 /checklist/01_Historial/01_changelog.md               ← Changelog general
```

### Código Frontend

```
📂 /frontend/src/services/
   ├── estrategiasService.js
   ├── tiposAtencionService.js
   └── atencionesClinicasService.js

📂 /frontend/src/components/trazabilidad/
   └── HistorialAtencionesTab.jsx

📂 /frontend/src/pages/admin/catalogs/
   ├── EstrategiasInstitucionales.jsx
   └── TiposAtencionTelemedicina.jsx

📂 /frontend/src/pages/asegurados/
   └── BuscarAsegurado.jsx
```

### Código Backend (Requiere corrección)

```
📂 /backend/src/main/java/com/styp/cenate/
   ├── api/atencion/AtencionClinicaController.java
   ├── service/atencion/
   │   ├── IAtencionClinicaService.java
   │   └── AtencionClinicaServiceImpl.java
   ├── repository/AtencionClinicaRepository.java
   ├── model/AtencionClinica.java
   └── dto/
       ├── AtencionClinicaDTO.java
       ├── AtencionClinicaCreateDTO.java
       ├── AtencionClinicaUpdateDTO.java
       └── ObservacionEnfermeriaDTO.java
```

### Base de Datos

```sql
-- Scripts de creación
📂 /spec/04_BaseDatos/06_scripts/30_create_estrategias_institucionales.sql
📂 /spec/04_BaseDatos/06_scripts/31_create_tipos_atencion_telemedicina.sql
📂 /spec/04_BaseDatos/06_scripts/32_create_atencion_clinica.sql
```

---

## 9. Conclusiones y Próximos Pasos

### ✅ Logros de Esta Implementación

1. **Frontend 100% funcional** con 2 nuevos catálogos CRUD completos
2. **Integración UI** perfecta en panel de administración
3. **Componente Timeline** profesional y reutilizable
4. **Arquitectura escalable** lista para backend API real
5. **Base de datos** completamente normalizada con índices

### ⚠️  Limitaciones Actuales

1. **Backend no compilable** - requiere 2-4 horas de ajustes
2. **Sin datos de prueba** - tabla `atencion_clinica` vacía
3. **Testing backend pendiente** - 7 endpoints sin validar
4. **Documentación incompleta** - falta API docs

### 🎯 Próximos Pasos Recomendados

#### Prioridad 1: Corregir Backend (Urgente)
```
1. Analizar schema real de entities (30 min)
2. Corregir ServiceImpl.java (2 horas)
3. Testing con curl (1 hora)
4. Documentar API endpoints (30 min)
```

#### Prioridad 2: Datos de Prueba
```sql
-- Insertar 10-15 atenciones de prueba para diferentes asegurados
INSERT INTO atencion_clinica (...) VALUES (...);
```

#### Prioridad 3: Componentes Adicionales (Opcional)
- `DetalleAtencionModal.jsx` - Modal para ver atención completa
- `FormularioAtencionModal.jsx` - Form para crear/editar atención
- `SignosVitalesCard.jsx` - Card de signos vitales
- `InterconsultaCard.jsx` - Card de interconsulta

#### Prioridad 4: Mejoras UX
- Filtros en timeline (por fecha, tipo, IPRESS)
- Exportar PDF del historial
- Gráficos de signos vitales (Chart.js)
- Notificaciones de interconsultas pendientes

---

## 10. Preguntas Frecuentes (FAQ)

### ¿Por qué el backend no compila?

El `AtencionClinicaServiceImpl.java` fue diseñado asumiendo un schema de BD diferente. Los nombres de entities, repositories y métodos no coinciden con el código real.

### ¿Puedo usar el frontend sin el backend?

**No completamente**. El tab "Antecedentes Clínicos" llama a `atencionesClinicasService.obtenerPorAsegurado()` que requiere el endpoint `/api/atenciones-clinicas/asegurado/{pk}`.

### ¿Cómo agrego datos de prueba?

Opción 1 (Manual):
```sql
INSERT INTO atencion_clinica (pk_asegurado, fecha_atencion, id_ipress, id_tipo_atencion, ...)
VALUES ('8634451-202307', NOW(), 2, 1, ...);
```

Opción 2 (API - cuando esté lista):
```bash
curl -X POST http://localhost:8080/api/atenciones-clinicas -d '{...}'
```

### ¿Qué hacer si el timeline no carga?

1. Abrir DevTools (F12) → Console
2. Buscar errores de red (Network tab)
3. Verificar que el endpoint `/api/atenciones-clinicas/asegurado/{pk}` responde 200 OK
4. Si responde 500, el backend tiene errores
5. Si responde 404, el endpoint no existe (backend no compiló)

---

**Documento actualizado**: 2026-01-03 14:30 GMT-5
**Autor**: Claude Code + Ing. Styp Canto Rondón
**Versión**: 2.0.0-dev (Parcial)
