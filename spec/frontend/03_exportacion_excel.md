# Exportación a Excel - Gestión de Períodos y Solicitudes

**Versión:** v1.57.0
**Fecha:** 2026-02-07
**Estado:** ✅ Implementada

## 📋 Descripción

Se ha agregado la funcionalidad de exportación a Excel en el módulo de **Gestión de Períodos y Solicitudes** para los coordinadores. Esto permite descargar reportes en formato Excel con toda la información de las solicitudes de turnos de las IPRESS.

## 🎯 Características

### 1. **Exportación General de Solicitudes**
- **Ubicación:** Botón "Exportar a Excel" en la sección de filtros
- **Datos incluidos:**
  - ID Solicitud
  - IPRESS (nombre y código)
  - Período
  - Estado
  - Fecha Envío
- **Archivo generado:** `Reporte_Solicitudes_YYYY-MM-DD_HHmmss.xlsx`

### 2. **Exportación Individual (Fila)**
- **Ubicación:** Botón verde "📥" al lado de cada solicitud en la tabla
- **Datos incluidos:** Los mismos que la exportación general, pero para una solicitud
- **Archivo generado:** `{NombreIPRESS}_Solicitud_YYYY-MM-DD_HHmmss.xlsx`

### 3. **Exportación Completa (Modal)**
- **Ubicación:** Botón "📥" en el encabezado del modal de detalle
- **Hojas del Excel:**
  - **Hoja 1 (General):** Información general de la solicitud
    - ID Solicitud
    - IPRESS y código
    - Período
    - Estado
    - Fecha Envío

  - **Hoja 2 (Especialidades):** Detalle de cada especialidad solicitada
    - Nº de especialidad
    - Nombre y código de especialidad
    - Cantidad de turnos
    - Fechas inicio y fin
    - Estado de la especialidad
    - Observaciones

- **Archivo generado:** `{NombreIPRESS}_Reporte_Completo_YYYY-MM-DD_HHmmss.xlsx`

## 🚀 Cómo Usar

### Exportar Todas las Solicitudes (o Filtradas)

1. Accede a: `http://localhost:3000/roles/coordinador/gestion-periodos`
2. Ve a la pestaña **"Solicitudes"**
3. Aplica los filtros que desees (Estado, Período, Macroregión, Red, IPRESS)
4. Haz clic en el botón **"Exportar a Excel"** (botón verde con 📥)
5. El archivo se descargará automáticamente

### Exportar Una Solicitud Individual

1. En la tabla de solicitudes, identifica la IPRESS que necesitas
2. Haz clic en el botón **"📥"** (a la derecha del botón "Ver")
3. El archivo se descargará con el nombre de la IPRESS

### Exportar Solicitud Completa (Con Especialidades)

1. En la tabla de solicitudes, haz clic en **"Ver"**
2. Se abrirá el modal de detalle con toda la información
3. Haz clic en el botón **"📥"** en la esquina superior derecha del modal
4. Se descargará un Excel con múltiples hojas incluyendo los detalles de especialidades

## 📊 Ejemplo: H.I CARLOS ALCANTARA BUTTERFIELD

Si necesitas exportar el reporte de "H.I CARLOS ALCANTARA BUTTERFIELD":

1. Filtra por IPRESS: "CARLOS ALCANTARA BUTTERFIELD"
2. Haz clic en **"Consultar"**
3. Verás la solicitud en la tabla
4. Tienes 2 opciones:
   - **Opción A (Rápida):** Haz clic en el botón "📥" para exportar solo esa fila
   - **Opción B (Completa):** Haz clic en "Ver" → Se abre el modal → Haz clic en "📥" para exportar con detalles de especialidades

## 🛠️ Implementación Técnica

### Archivos Modificados
- `frontend/src/pages/roles/coordinador/gestion-periodos/components/TabSolicitudes.jsx`
- `frontend/src/pages/roles/coordinador/gestion-periodos/components/ModalDetalleSolicitud.jsx`

### Archivos Creados
- `frontend/src/pages/roles/coordinador/gestion-periodos/utils/exportarExcel.js`

### Funciones Disponibles

#### `exportarSolicitudesAExcel(solicitudes, nombreArchivo, periodoMap)`
Exporta una o varias solicitudes en formato simple.

**Parámetros:**
- `solicitudes` (Array): Lista de solicitudes a exportar
- `nombreArchivo` (String): Nombre base del archivo (se agrega timestamp)
- `periodoMap` (Map): Mapa de períodos para obtener descripciones

**Ejemplo:**
```javascript
import { exportarSolicitudesAExcel } from '../utils/exportarExcel';

exportarSolicitudesAExcel(
  [solicitud1, solicitud2],
  'Mi_Reporte',
  periodoMap
);
```

#### `exportarSolicitudCompleta(solicitud, nombreArchivo, periodoMap)`
Exporta una solicitud completa con múltiples hojas incluyendo especialidades.

**Parámetros:**
- `solicitud` (Object): Objeto de solicitud con propiedad `detalles`
- `nombreArchivo` (String): Nombre base del archivo
- `periodoMap` (Map): Mapa de períodos

**Ejemplo:**
```javascript
import { exportarSolicitudCompleta } from '../utils/exportarExcel';

exportarSolicitudCompleta(
  solicitudConDetalles,
  'Reporte_Completo',
  periodoMap
);
```

## 📦 Dependencias

- `xlsx` (^0.18.5) - Ya incluida en el proyecto
- `date-fns` (^2.30.0) - Ya incluida en el proyecto
- `lucide-react` (^0.548.0) - Ya incluida en el proyecto

## 🎨 Formato del Excel

- **Encabezados:** Fondo azul (#0A5BA9) con texto blanco y negrita
- **Ancho de columnas:** Ajustado automáticamente para cada tipo de dato
- **Fechas:** Formato `dd/MM/yyyy HH:mm:ss` en español
- **Nombre del archivo:** Incluye timestamp para evitar sobrescrituras

## ⚙️ Configuración

Puedes personalizar el nombre del archivo modificando las variables en el código:

```javascript
// Cambiar nombre predeterminado
exportarSolicitudesAExcel(solicitudes, 'MI_NOMBRE_CUSTOM', periodoMap);
```

## 🔄 Flujo Integrado

```
TabSolicitudes.jsx
├── Botón "Exportar a Excel" (general)
│   └── exportarSolicitudesAExcel()
├── Botón "📥" por fila
│   └── exportarSolicitudesAExcel([solicitudSeleccionada])
└── Ver detalle → ModalDetalleSolicitud.jsx
    └── Botón "📥" en header
        └── exportarSolicitudCompleta()
```

## 💡 Casos de Uso

| Caso | Acción | Resultado |
|------|--------|-----------|
| Revisar todas las solicitudes | Exportar general | Excel con todas las solicitudes filtradas |
| Reportar solicitud de un IPRESS | Exportar individual | Excel con una solicitud |
| Análisis detallado con especialidades | Exportar completa desde modal | Excel con 2 hojas: general + especialidades |
| Auditoría de solicitudes | Aplicar filtros + Exportar general | Excel filtrado por período, estado, etc. |

## 🚀 Próximas Mejoras

- [ ] Agregar gráficos en el Excel
- [ ] Personalizar colores por estado
- [ ] Exportación a CSV
- [ ] Exportación múltiple (seleccionar varias filas)
- [ ] Historial de descargas

---

**Desarrollado por:** Sistema CENATE
**Versión:** v1.57.0
