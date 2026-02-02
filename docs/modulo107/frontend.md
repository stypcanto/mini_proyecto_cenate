# 🎨 Frontend - Módulo 107 (Atenciones Clínicas)

**Archivo:** `frontend/src/pages/roles/coordcitas/Modulo107AtencionesClinics.jsx`  
**Versión:** v2.1.0  
**Estado:** ✅ COMPLETADO - INTEGRADO CON API + MODAL DETALLE  
**Fecha:** 30 Enero 2026

---

## 📋 Descripción General

Componente React que implementa la gestión de **Atenciones Clínicas** del Módulo 107. Proporciona una interfaz completa para visualizar, filtrar y gestionar las solicitudes de atención clínica con **integración directa al backend** Spring Boot y capacidades avanzadas de búsqueda y estadísticas en tiempo real.

**🔗 INTEGRACIÓN COMPLETA:** El frontend consume directamente los endpoints REST del backend `/api/atenciones-clinicas-107/` sin datos simulados.

---

## 🎯 Funcionalidades

### ✅ Filtros Avanzados (7 filtros activos + 2 visuales)

**🆕 NUEVO**: Selector de rango de fechas colapsable que se expande para mostrar fecha inicio y fin.

| Filtro | Tipo | Opciones | Backend Integration |
|--------|------|----------|--------------------|
| **Estado** | Select | PENDIENTE, ATENDIDO, Todos | ✅ Enviado como string directo (estado) |
| **Tipo Documento** | Select | DNI, CE, PASAPORTE, Todos | ✅ Enviado como tipoDocumento |
| **Documento** | Input | Búsqueda parcial por número | ✅ Enviado como pacienteDni |
| **Rango Fechas** | Date Range | Selector colapsable con fecha inicio/fin | ✅ Enviado como fechaDesde/fechaHasta |
| **Derivación** | Select | MEDICINA, NUTRICION, PSICOLOGIA CENATE | ✅ Enviado como derivacion |
| **Búsqueda General** | Input | Nombre, DNI, Nº solicitud | ✅ Enviado como searchTerm |
| **Macrorregión** | Select | Dinámico, solo visual | ❌ NO se envía al backend |
| **Red** | Select | Dinámico, solo visual | ❌ NO se envía al backend |

### 📊 Dashboard de Estadísticas

```javascript
const [estadisticas, setEstadisticas] = useState({
  total: 0,
  pendientes: 0,
  atendidos: 0
});
```

- **Total de Solicitudes**
- **Pendientes** (estado PENDIENTE)
- **Atendidos** (estado ATENDIDO)
- Actualización en tiempo real con cada filtro

### 📝 Tabla de Datos (12 columnas)

| Columna | Campo | Tipo | Ordenable |
|---------|-------|------|-----------|
| Nº Solicitud | `numero_solicitud` | String | ✅ |
| Paciente | `paciente_nombre` | String | ✅ |
| DNI | `paciente_dni` | String | ✅ |
| Tipo Doc | `tipo_documento` | String | ✅ |
| Fecha Solicitud | `fecha_solicitud` | Date | ✅ |
| Estado | `estadoDescripcion` o `estado` | Badge con texto descriptivo | ✅ |
| IPRESS | `ipress_nombre` | String | ✅ |
| Derivación | `derivacion_interna` | String | ✅ |
| Responsable | `responsable_nombre` | String | ✅ |
| Especialidad | `especialidad` | String | ✅ |
| Tipo Cita | `tipo_cita` | String | ✅ |
| Acciones | Botones | Component | ❌ |

### 🔍 Búsqueda Global

```javascript
const [searchTerm, setSearchTerm] = useState('');

// Busca en: paciente_nombre, paciente_dni, numero_solicitud
```

**🔄 Manejo Mejorado del Estado**: La columna Estado ahora muestra texto descriptivo en lugar de iconos. Usa `estadoDescripcion` cuando está disponible, sino usa `estado` como fallback, asegurando compatibilidad con diferentes configuraciones de datos.

```javascript
// Lógica de visualización de estado
const estadoTexto = atencion.estadoDescripcion || atencion.estado || "SIN ESTADO";
const estadoNormalizado = estadoTexto.toUpperCase();

// Mapeo de colores dinámico
const colorClass = estadoNormalizado.includes("PENDIENTE") 
  ? "bg-orange-100 text-orange-700"
  : estadoNormalizado.includes("ATENDIDO") || estadoNormalizado.includes("COMPLETADO")
  ? "bg-green-100 text-green-700"
  : "bg-gray-100 text-gray-700";
```

### 📄 Paginación Inteligente

```javascript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);

// Opciones: 10, 25, 50, 100 registros por página
```

---

## 🔧 Arquitectura Técnica

### 🏗️ Estructura del Componente

```
Modulo107AtencionesClinics.jsx
├── Estados (useState hooks)
├── Efectos (useEffect hooks)
├── Funciones auxiliares
├── Handlers de eventos
├── JSX Render
│   ├── Header con título y stats
│   ├── Filtros (9 controles)
│   ├── Tabla responsive
│   └── Paginación
```

### 📦 Dependencias

```json
{
  "react": "^18.x",
  "tailwindcss": "^3.x",
  "lucide-react": "icons",
  "date-fns": "fecha handling"
}
```

### 🎨 Estilos (Tailwind CSS)

```javascript
// Color scheme
const colors = {
  primary: 'blue-600',
  secondary: 'gray-600',
  success: 'green-600',
  warning: 'yellow-600',
  danger: 'red-600'
};

// Responsive breakpoints
const responsive = {
  mobile: 'sm:',
  tablet: 'md:',
  desktop: 'lg:',
  wide: 'xl:'
};
```

---

## 🔌 Integración con API

### 🛠️ Servicio Frontend

```javascript
// frontend/src/services/atencionesClinicasService.js
import api from './apiClient';

const BASE_URL = '/atenciones-clinicas-107';

export const atencionesClinicasService = {
  // Listar con filtros avanzados
  listarConFiltros: async (filtros = {}, pageNumber = 0, pageSize = 25),
  
  // Obtener estadísticas
  obtenerEstadisticas: async ()
};
```

### 🌐 Endpoints Utilizados

#### 1. Listar Atenciones
```javascript
GET /api/atenciones-clinicas-107/listar
Query parameters:
- pageNumber: Integer (base 0)
- pageSize: Integer (default 25)
- estadoGestionCitasId: Long (1=PENDIENTE, 2=ATENDIDO)
- tipoDocumento: String (DNI, CE, PASAPORTE)
- pacienteDni: String (búsqueda parcial)
- fechaDesde: String (YYYY-MM-DD)
- fechaHasta: String (YYYY-MM-DD)
- derivacion: String (MEDICINA CENATE, NUTRICION CENATE)
- searchTerm: String (búsqueda general)

// Respuesta
{
  "content": [...],
  "totalElements": 150,
  "totalPages": 6,
  "currentPage": 0,
  "pageSize": 25,
  "hasNext": true,
  "hasPrevious": false
}
```

#### 2. Obtener Estadísticas
```javascript
GET /api/atenciones-clinicas-107/estadisticas

// Respuesta
{
  "total": 150,
  "pendientes": 80,
  "atendidos": 70
}
```
- especialidad: String
- tipoCita: String
- searchTerm: String
- pageNumber: Integer
- pageSize: Integer
```

#### 2. Obtener Estadísticas
```javascript
GET /api/atenciones-clinicas-107/estadisticas
Response: {
  total: 1250,
  pendientes: 340,
  atendidos: 910
}
```

#### 3. Carga de Datos en Tiempo Real
```javascript
// Función principal que consume el backend
const cargarAtenciones = async () => {
  setIsLoading(true);
  setErrorMessage("");
  
  try {
    // Preparar filtros para el backend
    const filtros = {};
    
    // Mapear estados a IDs (según el backend)
    if (filtroEstado !== "todos") {
      if (filtroEstado === "PENDIENTE") filtros.estadoGestionCitasId = 1;
      else if (filtroEstado === "ATENDIDO") filtros.estadoGestionCitasId = 2;
    }
    
    // Otros filtros
    if (filtroTipoDoc !== "todos") filtros.tipoDocumento = filtroTipoDoc;
    if (filtroDocumento) filtros.pacienteDni = filtroDocumento;
    if (filtroFechaSolicitudInicio) filtros.fechaDesde = filtroFechaSolicitudInicio;
    if (filtroFechaSolicitudFin) filtros.fechaHasta = filtroFechaSolicitudFin;
    if (filtroDerivacion !== "todas") filtros.derivacion = filtroDerivacion;
    if (searchTerm) filtros.searchTerm = searchTerm;
    
    // Llamar al servicio
    const response = await atencionesClinicasService.listarConFiltros(
      filtros, 
      currentPage - 1, // Backend usa páginas base 0
      REGISTROS_POR_PAGINA
    );
    
    // Actualizar estado con respuesta
    setAtenciones(response.content || []);
    setTotalElementos(response.totalElements || 0);
    
  } catch (error) {
    console.error("Error al cargar atenciones:", error);
    setErrorMessage("Error al cargar los datos de atenciones clínicas");
    setAtenciones([]);
    setTotalElementos(0);
  } finally {
    setIsLoading(false);
  }
};
```

### 🔄 Manejo de Estado Actualizado

```javascript
// Estado principal de datos (REAL - no simulado)
const [atenciones, setAtenciones] = useState([]);
const [totalElementos, setTotalElementos] = useState(0);
const [isLoading, setIsLoading] = useState(false);
const [errorMessage, setErrorMessage] = useState("");
const [currentPage, setCurrentPage] = useState(1);

// Estado de estadísticas (REAL desde backend)
const [estadisticas, setEstadisticas] = useState({
  total: 0,
  pendientes: 0,
  atendidos: 0
});

// Estado de filtros (SE ENVÍAN AL BACKEND)
const [filtroEstado, setFiltroEstado] = useState("todos");
const [filtroTipoDoc, setFiltroTipoDoc] = useState("todos");
const [filtroDocumento, setFiltroDocumento] = useState("");
const [filtroFechaSolicitudInicio, setFiltroFechaSolicitudInicio] = useState("");
const [filtroFechaSolicitudFin, setFiltroFechaSolicitudFin] = useState("");
const [filtroDerivacion, setFiltroDerivacion] = useState("todas");
const [searchTerm, setSearchTerm] = useState("");

// Estados visuales (NO se envían al backend)
const [filtroMacrorregion, setFiltroMacrorregion] = useState("todas");
const [filtroRed, setFiltroRed] = useState("todas");
```

### ⚡ useEffect para Recarga Automática

```javascript
// Cargar estadísticas iniciales
useEffect(() => {
  cargarEstadisticas();
}, []);

// Recargar atenciones cuando cambien los filtros
useEffect(() => {
  cargarAtenciones();
}, [
  currentPage, filtroEstado, filtroTipoDoc, filtroDocumento,
  filtroFechaSolicitudInicio, filtroFechaSolicitudFin, 
  filtroDerivacion, searchTerm
]);
```

---

## 🎯 Funciones Principales

### 🔍 Aplicar Filtros
```javascript
const aplicarFiltros = async () => {
  setLoading(true);
  try {
    const queryParams = new URLSearchParams({
      pageNumber: currentPage - 1,
      pageSize: itemsPerPage,
      ...Object.entries(filtros).filter(([_, v]) => v && v !== 'todos' && v !== 'todas')
    });

    const response = await fetch(`/api/atenciones-clinicas-107/listar?${queryParams}`);
    const data = await response.json();
    
    setAtenciones(data.content);
    setTotalPages(data.totalPages);
    setTotalElements(data.totalElements);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 🧹 Limpiar Filtros
```javascript
const limpiarFiltros = () => {
  setFiltros({
    estado: 'todos',
    tipoDocumento: 'todos',
    documento: '',
    fechaDesde: '',
    fechaHasta: '',
    macrorregion: 'todas',
    red: 'todas',
    ipress: 'todas',
    derivacion: 'todas'
  });
  setCurrentPage(1);
  setSearchTerm('');
};
```

### 📊 Obtener Estadísticas
```javascript
const obtenerEstadisticas = async () => {
  try {
    const response = await fetch('/api/atenciones-clinicas-107/estadisticas');
    const data = await response.json();
    setEstadisticas(data);
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err);
  }
};
```

---

## 🎨 Componentes UI

### 📊 Tarjetas de Estadísticas
```jsx
const StatCard = ({ title, value, color }) => (
  <div className="bg-white p-4 rounded-lg shadow">
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`text-2xl font-bold text-${color}-600`}>
      {value.toLocaleString()}
    </p>
  </div>
);
```

### 🏷️ Badge de Estado
```jsx
const EstadoBadge = ({ estado }) => {
  const colors = {
    'PENDIENTE': 'bg-yellow-100 text-yellow-800',
    'ATENDIDO': 'bg-green-100 text-green-800',
    'CANCELADO': 'bg-red-100 text-red-800'
  };
  
  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[estado] || 'bg-gray-100 text-gray-800'}`}>
      {estado}
    </span>
  );
};
```

### 📄 Paginación
```jsx
const Paginacion = ({ currentPage, totalPages, onPageChange }) => (
  <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
    <div className="flex items-center">
      <span className="text-sm text-gray-700">
        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, totalElements)} de {totalElements} resultados
      </span>
    </div>
    <div className="flex items-center space-x-2">
      {/* Botones de paginación */}
    </div>
  </div>
);
```

### 📋 Modal de Detalle de Atención

**🆕 NUEVO COMPONENTE**: `DetalleAtencionModal.jsx`

**Ubicación:** `frontend/src/components/modals/DetalleAtencionModal.jsx`

**Funcionalidad:** Modal completo para visualizar todos los detalles de una atención clínica organizada en 7 secciones claramente definidas.

```jsx
import DetalleAtencionModal from '../../../components/modals/DetalleAtencionModal';

// En el componente principal
const [modalAbierto, setModalAbierto] = useState(false);
const [atencionSeleccionada, setAtencionSeleccionada] = useState(null);

const abrirModal = (atencion) => {
  setAtencionSeleccionada(atencion);
  setModalAbierto(true);
};

const cerrarModal = () => {
  setModalAbierto(false);
  setAtencionSeleccionada(null);
};
```

#### 🗂️ Secciones del Modal

1. **📋 Identificación**
   - ID Solicitud
   - Número de Solicitud  
   - ID Bolsa
   - Estado Activo

2. **👤 Datos del Paciente**
   - Nombre completo
   - DNI y tipo de documento
   - Edad y fecha de nacimiento
   - Sexo
   - Teléfono principal y alterno
   - Email

3. **🏥 Información IPRESS**
   - Código de adscripción
   - ID y código IPRESS
   - Nombre del centro asistencial

4. **🩺 Información Clínica**
   - Derivación interna
   - Especialidad
   - Tipo de cita
   - ID del servicio

5. **📌 Gestión de Estados**
   - Estado de gestión de citas (ID)
   - Estado actual
   - Código de estado
   - Descripción del estado

6. **📅 Información de Fechas**
   - Fecha de solicitud
   - Fecha de actualización
   - Fecha de asignación

7. **👥 Personal Asignado**
   - ID responsable gestora
   - Nombre del responsable

#### 🎨 Diseño del Modal

- **Layout responsivo** con scroll automático
- **Colores consistentes** con el sistema de diseño
- **Iconos descriptivos** para cada sección
- **Animaciones suaves** de apertura/cierre
- **Overlay con backdrop** para mejor UX

---

## 📱 Responsive Design

### 🖥️ Desktop (lg: 1024px+)
- Filtros en grid 3x3
- Tabla completa con todas las columnas
- 25 registros por página por defecto

### 📱 Tablet (md: 768px - 1023px)
- Filtros en grid 2x5
- Tabla con scroll horizontal
- 10 registros por página por defecto

### 📱 Mobile (sm: 640px - 767px)
- Filtros en stack vertical
- Cards en lugar de tabla
- 5 registros por página por defecto

---

## 🔄 Flujo de Datos

### 1. Carga Inicial
```
ComponentDidMount → obtenerEstadisticas() → obtenerCatalogos() → aplicarFiltros()
```

### 2. Aplicar Filtro
```
onChange(filtro) → setFiltros() → useEffect → aplicarFiltros() → updateUI
```

### 3. Cambio de Página
```
onPageChange → setCurrentPage() → useEffect → aplicarFiltros() → updateUI
```

### 4. Búsqueda
```
onSearchChange → setSearchTerm() → debounce(500ms) → aplicarFiltros()
```

---

## 🚀 Optimizaciones

### ⚡ Performance
- **Debounce**: 500ms en búsqueda de texto
- **Memoization**: React.memo en componentes de tabla
- **Lazy Loading**: Paginación server-side
- **Caching**: Catálogos estáticos en localStorage

### 🎯 UX/UI
- **Loading States**: Spinners durante carga
- **Error Boundaries**: Manejo graceful de errores
- **Skeleton Loading**: Placeholders mientras carga
- **Keyboard Navigation**: Soporte completo

### 📊 Analytics
- **Event Tracking**: Google Analytics en filtros
- **Performance Monitoring**: Core Web Vitals
- **Error Reporting**: Sentry integration

---

## 🧪 Testing

### Unit Tests
```bash
npm test src/pages/modulos/Modulo107AtencionesClinics.test.jsx
```

### E2E Tests
```bash
cypress run --spec "cypress/integration/modulo107.spec.js"
```

### Coverage
```bash
npm run test:coverage
# Target: >80% coverage
```

---

## 📝 Notas de Desarrollo

### 🔧 Variables de Entorno
```bash
REACT_APP_API_BASE_URL=http://localhost:8080
REACT_APP_ITEMS_PER_PAGE_DEFAULT=10
REACT_APP_DEBOUNCE_DELAY=500
```

### 🚀 Comandos de Desarrollo
```bash
# Desarrollo local
npm start

# Build para producción
npm run build

# Lint y format
npm run lint
npm run format
```

### 📚 Documentación Adicional
- **Storybook**: Componentes aislados
- **JSDoc**: Documentación en código
- **README**: Instrucciones de setup

---

**Frontend Módulo 107 - Documentación Completa ✅**
