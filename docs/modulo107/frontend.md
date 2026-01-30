# 📱 MÓDULO 107 - DOCUMENTACIÓN FRONTEND

**Versión:** 3.0.0  
**Fecha:** 2026-01-30  
**Sistema:** CENATE - Sistema de Gestión de Citas EsSalud

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura Frontend](#arquitectura-frontend)
3. [Componentes Principales](#componentes-principales)
4. [Servicios y APIs](#servicios-y-apis)
5. [Rutas y Navegación](#rutas-y-navegación)
6. [Flujos de Usuario](#flujos-de-usuario)
7. [Configuración MBAC](#configuración-mbac)

---

## 🎯 RESUMEN EJECUTIVO

El **Módulo 107** es un sistema especializado para la gestión de pacientes diagnosticados bajo el protocolo 107. Permite visualizar, buscar y exportar información de pacientes, así como consultar estadísticas de atención.

### Funcionalidades Principales
- ✅ **Visualización de Pacientes:** Listado completo con paginación
- 🔍 **Búsqueda Avanzada:** Filtros por DNI, nombre, IPRESS y estado
- 📊 **Estadísticas:** KPIs y gráficos de atención
- 📥 **Exportación:** Generación de reportes Excel
- 🏥 **Atenciones Clínicas:** Registro y seguimiento de atenciones (placeholder)

---

## 🏗️ ARQUITECTURA FRONTEND

### Stack Tecnológico
```
React 18.2.0
- Lucide React (iconos)
- React Hot Toast (notificaciones)
- XLSX (exportación Excel)
- Tailwind CSS (estilos)
```

### Estructura de Carpetas
```
frontend/src/
├── pages/roles/coordcitas/
│   ├── Modulo107AtencionesClinics.jsx  (71 líneas)
│   ├── Modulo107PacientesList.jsx      (578 líneas) ⭐
│   ├── Modulo107EstadisticasAtencion.jsx (136 líneas)
│   ├── Modulo107CargaPacientes.jsx     (109 líneas)
│   └── Modulo107Bienvenida.jsx         (73 líneas)
├── services/
│   └── formulario107Service.js          (Servicio API)
├── lib/
│   └── apiClient.js                     (Cliente HTTP)
└── config/
    └── componentRegistry.js             (Registro de rutas)
```

---

## 🧩 COMPONENTES PRINCIPALES

### 1️⃣ **Modulo107PacientesList.jsx** ⭐ (COMPONENTE PRINCIPAL)

📍 **Ubicación:** `frontend/src/pages/roles/coordcitas/Modulo107PacientesList.jsx`  
📍 **Ruta:** `/bolsas/modulo107/pacientes-de-107`  
📏 **Tamaño:** 578 líneas  

#### **Descripción**
Componente principal que muestra el listado completo de pacientes del Módulo 107 con funcionalidades avanzadas de gestión.

#### **Características Principales**

##### 📊 **Estadísticas en Tiempo Real**
```javascript
const [stats, setStats] = useState({
  total: 0,
  atendidos: 0,
  pendientes: 0,
  en_proceso: 0,
  cancelados: 0,
});
```

Muestra 5 tarjetas con KPIs:
- **Total Pacientes** → Icono azul
- **Atendidos** → Icono verde
- **Pendientes** → Icono amarillo
- **En Proceso** → Icono azul (animado)
- **Cancelados** → Icono rojo

##### 🔍 **Sistema de Filtros**
```javascript
const [searchTerm, setSearchTerm] = useState("");        // Búsqueda general
const [filterEstado, setFilterEstado] = useState("");    // Por estado
const [filterDepartamento, setFilterDepartamento] = ""; // Por departamento
const [filterIpress, setFilterIpress] = useState("");   // Por IPRESS
```

**Lógica de Filtrado:**
```javascript
const pacientesFiltrados = pacientes.filter((p) => {
  const matchSearch = !searchTerm ||
    p.numero_documento?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.paciente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.telefono?.includes(searchTerm);
  
  const matchEstado = !filterEstado || p.estado_atencion === filterEstado;
  const matchDepartamento = !filterDepartamento || p.departamento === filterDepartamento;
  const matchIpress = !filterIpress || p.desc_ipress === filterIpress;
  
  return matchSearch && matchEstado && matchDepartamento && matchIpress;
});
```

##### 📄 **Paginación Inteligente**
```javascript
const [currentPage, setCurrentPage] = useState(1);
const itemsPerPage = 20;

const totalPages = Math.ceil(pacientesFiltrados.length / itemsPerPage);
const startIndex = (currentPage - 1) * itemsPerPage;
const endIndex = startIndex + itemsPerPage;
const pacientesPaginados = pacientesFiltrados.slice(startIndex, endIndex);
```

**Características:**
- ✅ 20 registros por página
- ✅ Navegación con botones anterior/siguiente
- ✅ Salto directo a páginas específicas
- ✅ Muestra elipsis (...) cuando hay muchas páginas
- ✅ Auto-reset a página 1 cuando cambian los filtros

##### ☑️ **Selección Múltiple**
```javascript
const [selectedIds, setSelectedIds] = useState([]);

// Seleccionar/deseleccionar individual
const handleSelectOne = (id) => {
  setSelectedIds((prev) =>
    prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
  );
};

// Seleccionar/deseleccionar todos en la página actual
const handleSelectAll = () => {
  const idsEnPaginaActual = pacientesPaginados.map((p) => p.id_item);
  const todosSeleccionados = idsEnPaginaActual.every((id) => selectedIds.includes(id));
  
  if (todosSeleccionados) {
    setSelectedIds((prev) => prev.filter((id) => !idsEnPaginaActual.includes(id)));
  } else {
    setSelectedIds((prev) => [...new Set([...prev, ...idsEnPaginaActual])]);
  }
};
```

##### 📥 **Exportación a Excel**
```javascript
const handleExportar = () => {
  if (selectedIds.length === 0) {
    toast.error("Selecciona al menos un paciente para exportar");
    return;
  }

  const pacientesExportar = pacientes.filter((p) => selectedIds.includes(p.id_item));
  
  const datosExcel = pacientesExportar.map((p) => ({
    "Fecha Registro": formatearFecha(p.created_at),
    "DNI": p.numero_documento || "",
    "Paciente": p.paciente || "",
    "Sexo": p.sexo || "",
    "Edad": calcularEdad(p.fecha_nacimiento) || "",
    "Teléfono": p.telefono || "",
    "IPRESS Nombre": p.desc_ipress || "",
    "Departamento": p.departamento || "",
    "Estado Atención": p.estado_atencion || "",
    "Fecha Atención": p.fecha_atencion || "",
    "Especialista": p.especialista || "",
  }));

  const ws = XLSX.utils.json_to_sheet(datosExcel);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Pacientes Módulo 107");
  
  const nombreArchivo = `Pacientes_Modulo107_${timestamp}.xlsx`;
  XLSX.writeFile(wb, nombreArchivo);
  
  toast.success(`✅ Se exportaron ${selectedIds.length} pacientes correctamente`);
};
```

##### 🎨 **Sistema de Badges para Estados**
```javascript
const getEstadoBadge = (estado) => {
  const estilos = {
    ATENDIDO: "bg-green-100 text-green-800 border-green-300",
    PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-300",
    EN_PROCESO: "bg-blue-100 text-blue-800 border-blue-300",
    CANCELADO: "bg-red-100 text-red-800 border-red-300",
  };

  const iconos = {
    ATENDIDO: <CheckCircle2 className="w-4 h-4" />,
    PENDIENTE: <Clock className="w-4 h-4" />,
    EN_PROCESO: <RefreshCw className="w-4 h-4 animate-spin" />,
    CANCELADO: <AlertCircle className="w-4 h-4" />,
  };

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-semibold border flex items-center gap-2 ${estilos[estado]}`}>
      {iconos[estado]}
      {estado}
    </div>
  );
};
```

#### **Endpoint Utilizado**
```javascript
GET /api/bolsa107/pacientes
```

#### **Estructura de Datos**
```javascript
{
  id_item: Long,
  registro: String,
  numero_documento: String,
  paciente: String,
  sexo: String,
  fecha_nacimiento: Date,
  telefono: String,
  departamento: String,
  provincia: String,
  distrito: String,
  cod_ipress: String,
  desc_ipress: String,
  estado_atencion: String,  // ATENDIDO | PENDIENTE | EN_PROCESO | CANCELADO
  fecha_atencion: Date,
  especialista: String,
  created_at: DateTime
}
```

---

### 2️⃣ **Modulo107EstadisticasAtencion.jsx**

📍 **Ubicación:** `frontend/src/pages/roles/coordcitas/Modulo107EstadisticasAtencion.jsx`  
📍 **Ruta:** `/bolsas/modulo107/estadisticas`  
📏 **Tamaño:** 136 líneas  

#### **Descripción**
Página de visualización de estadísticas y métricas de atención del Módulo 107.

#### **Características**

##### 🎛️ **Filtros**
```javascript
const [filterMes, setFilterMes] = useState("");
const [filterEspecialidad, setFilterEspecialidad] = useState("");
```

Filtros disponibles:
- **Por Mes:** Enero - Diciembre
- **Por Especialidad:** Medicina General, Psicología, Nutrición, etc.

##### 📊 **KPIs Principales**
```javascript
// 4 Cards de métricas principales:
1. Atenciones Realizadas → Icono BarChart3 (azul)
2. Pacientes Atendidos → Icono TrendingUp (verde)
3. Tasa de Cumplimiento → Icono TrendingUp (morado)
4. Tiempo Promedio → Icono Calendar (naranja)
```

##### 📈 **Gráficos (Placeholders)**
- **Gráfico 1:** Atenciones por Especialidad
- **Gráfico 2:** Tendencia Mensual

**Nota:** Actualmente muestra placeholders. Los datos reales se cargarán desde el endpoint de estadísticas.

#### **Endpoint Esperado**
```javascript
GET /api/bolsas/modulo107/estadisticas
```

---

### 3️⃣ **Modulo107AtencionesClinics.jsx**

📍 **Ubicación:** `frontend/src/pages/roles/coordcitas/Modulo107AtencionesClinics.jsx`  
📍 **Ruta:** `/bolsas/modulo107/atenciones-clínicas`  
📏 **Tamaño:** 71 líneas  

#### **Descripción**
Página para visualizar y gestionar atenciones clínicas realizadas a pacientes del Módulo 107.

#### **Estado Actual**
⚠️ **PLACEHOLDER** - Componente básico preparado para futura implementación.

#### **Características Implementadas**
```javascript
const [searchTerm, setSearchTerm] = useState("");
```

- ✅ Búsqueda por paciente, expediente o especialista
- ✅ Botón de filtros
- ✅ Mensaje informativo: "Sin atenciones registradas"

#### **Funcionalidades Pendientes**
- 🔲 Integración con endpoint de atenciones
- 🔲 Tabla con datos reales
- 🔲 Formulario de nueva atención
- 🔲 Detalle de atención
- 🔲 Filtros avanzados

#### **Endpoint Esperado**
```javascript
GET /api/atenciones-clinicas/modulo107
GET /api/atenciones-clinicas/{id}
POST /api/atenciones-clinicas
```

---

## 🔌 SERVICIOS Y APIS

### **formulario107Service.js**

📍 **Ubicación:** `frontend/src/services/formulario107Service.js`

#### **Endpoints Implementados**

##### 1. **Importar Pacientes (Excel)**
```javascript
export const importarPacientesExcel = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await apiClient.post('/api/import-excel/pacientes', formData, true);
  return response.data;
};
```

**Uso:** Carga masiva de pacientes desde archivo Excel.

---

##### 2. **Listar Pacientes del Módulo 107** ⭐
```javascript
export const listarPacientesModulo107 = async (
  page = 0,
  size = 30,
  sortBy = 'fechaSolicitud',
  sortDirection = 'DESC'
) => {
  const response = await apiClient.get('/api/bolsas/modulo107/pacientes', true, {
    params: { page, size, sortBy, sortDirection }
  });
  return response.data;
};
```

**Response:**
```javascript
{
  total: 150,
  page: 0,
  size: 30,
  totalPages: 5,
  pacientes: [
    {
      idSolicitud: 1,
      numeroSolicitud: "BOL107-1-1",
      pacienteDni: "12345678",
      pacienteNombre: "Juan Pérez",
      pacienteSexo: "M",
      pacienteTelefono: "987654321",
      especialidad: "PSICOLOGIA CENATE",
      codigoAdscripcion: "IPRESS001",
      estadoGestionCitasId: 1,
      fechaSolicitud: "2026-01-15T10:30:00Z"
    }
  ]
}
```

---

##### 3. **Buscar Pacientes con Filtros**
```javascript
export const buscarPacientesModulo107 = async (filtros = {}) => {
  const params = {
    page: filtros.page || 0,
    size: filtros.size || 30,
    ...(filtros.dni && { dni: filtros.dni }),
    ...(filtros.nombre && { nombre: filtros.nombre }),
    ...(filtros.codigoIpress && { codigoIpress: filtros.codigoIpress }),
    ...(filtros.estadoId && { estadoId: filtros.estadoId }),
    ...(filtros.fechaDesde && { fechaDesde: filtros.fechaDesde }),
    ...(filtros.fechaHasta && { fechaHasta: filtros.fechaHasta }),
  };
  
  const response = await apiClient.get('/api/bolsas/modulo107/pacientes/buscar', true, { params });
  return response.data;
};
```

**Ejemplo de Uso:**
```javascript
const resultados = await buscarPacientesModulo107({
  dni: "12345",
  nombre: "Juan",
  codigoIpress: "IPRESS001",
  estadoId: 1,
  fechaDesde: "2026-01-01T00:00:00Z",
  fechaHasta: "2026-01-31T23:59:59Z",
  page: 0,
  size: 50
});
```

---

##### 4. **Obtener Estadísticas**
```javascript
export const obtenerEstadisticasModulo107 = async () => {
  const response = await apiClient.get('/api/bolsas/modulo107/estadisticas', true);
  return response.data;
};
```

**Response Esperado:**
```javascript
{
  kpis: {
    total_pacientes: 1500,
    atendidos: 800,
    pendientes: 500,
    cancelados: 200,
    horas_promedio_atencion: 48.5
  },
  distribucion_estado: [
    { estado: "ATENDIDO", cantidad: 800, porcentaje: 53.3 },
    { estado: "PENDIENTE", cantidad: 500, porcentaje: 33.3 },
    { estado: "CANCELADO", cantidad: 200, porcentaje: 13.3 }
  ],
  distribucion_especialidad: [
    { especialidad: "PSICOLOGIA CENATE", cantidad: 600 },
    { especialidad: "MEDICINA CENATE", cantidad: 500 },
    { especialidad: "NUTRICION", cantidad: 400 }
  ],
  top_10_ipress: [
    { codigo_ipress: "IPRESS001", nombre: "Hospital Nacional", cantidad: 350 }
  ],
  evolucion_temporal: [
    { fecha: "2026-01-01", cantidad: 50 },
    { fecha: "2026-01-02", cantidad: 65 }
  ]
}
```

---

##### 5. **Obtener Lista de Cargas**
```javascript
export const obtenerListaCargas = async () => {
  const response = await apiClient.get('/api/import-excel/cargas', true);
  return response.data || [];
};
```

---

##### 6. **Exportar Carga a Excel**
```javascript
export const exportarCargaExcel = async (idCarga) => {
  const response = await apiClient.get(`/api/import-excel/cargas/${idCarga}/exportar`, true);
  return response;
};
```

---

## 🗺️ RUTAS Y NAVEGACIÓN

### **Registro de Rutas (componentRegistry.js)**

```javascript
'/bolsas/modulo107/atenciones-clínicas': {
  component: lazy(() => import('../pages/roles/coordcitas/Modulo107AtencionesClinics')),
  requiredAction: 'ver',
},

'/bolsas/modulo107/pacientes-de-107': {
  component: lazy(() => import('../pages/roles/coordcitas/Modulo107PacientesList')),
  requiredAction: 'ver',
},

'/bolsas/modulo107/estadisticas': {
  component: lazy(() => import('../pages/roles/coordcitas/Modulo107EstadisticasAtencion')),
  requiredAction: 'ver',
},

'/bolsas/modulo107/carga-de-pacientes-107': {
  component: lazy(() => import('../pages/roles/coordcitas/Modulo107CargaPacientes')),
  requiredAction: 'crear',
},
```

### **URLs Completas**

| Componente | URL Frontend | Permiso MBAC |
|------------|--------------|--------------|
| Atenciones Clínicas | `http://localhost:3000/bolsas/modulo107/atenciones-clínicas` | `ver` |
| Pacientes de 107 | `http://localhost:3000/bolsas/modulo107/pacientes-de-107` | `ver` |
| Estadísticas | `http://localhost:3000/bolsas/modulo107/estadisticas` | `ver` |
| Carga de Pacientes | `http://localhost:3000/bolsas/modulo107/carga-de-pacientes-107` | `crear` |

---

## 🔄 FLUJOS DE USUARIO

### **Flujo 1: Visualizar Pacientes**

```
1. Usuario navega a /bolsas/modulo107/pacientes-de-107
2. Componente carga automáticamente → cargarPacientes()
3. GET /api/bolsa107/pacientes
4. Backend retorna lista de pacientes
5. Frontend calcula estadísticas (total, atendidos, pendientes, etc.)
6. Renderiza tabla con 20 registros por página
7. Usuario puede:
   - Buscar por DNI/nombre/teléfono
   - Filtrar por estado/departamento/IPRESS
   - Seleccionar pacientes
   - Exportar a Excel
   - Navegar entre páginas
```

### **Flujo 2: Buscar Pacientes**

```
1. Usuario ingresa criterios de búsqueda en los filtros
2. Frontend ejecuta filtrado local (client-side)
3. Pacientes se filtran en tiempo real
4. Paginación se resetea a página 1
5. Tabla se actualiza con resultados filtrados
```

### **Flujo 3: Exportar a Excel**

```
1. Usuario selecciona pacientes (checkboxes)
2. Aparece banner con contador de seleccionados
3. Usuario hace clic en "Exportar"
4. Frontend valida que haya al menos 1 seleccionado
5. Genera archivo Excel con biblioteca XLSX
6. Descarga automática con nombre timestamped
7. Toast de éxito: "Se exportaron N pacientes"
8. Selección se limpia automáticamente
```

### **Flujo 4: Visualizar Estadísticas**

```
1. Usuario navega a /bolsas/modulo107/estadisticas
2. Componente carga → obtenerEstadisticasModulo107()
3. GET /api/bolsas/modulo107/estadisticas
4. Backend ejecuta queries SQL agregadas
5. Retorna KPIs, distribuciones y evolución temporal
6. Frontend renderiza:
   - 4 tarjetas de KPIs
   - Gráficos por especialidad
   - Gráfico de tendencia mensual
   - Tabla de detalle
7. Usuario puede filtrar por mes y especialidad
```

---

## 🔐 CONFIGURACIÓN MBAC (Model-Based Access Control)

### **Permisos Requeridos**

```javascript
// Página: /bolsas/modulo107/listado
// Acción: ver
@CheckMBACPermission(pagina = "/bolsas/modulo107/listado", accion = "ver")

// Página: /bolsas/modulo107/buscar
// Acción: ver
@CheckMBACPermission(pagina = "/bolsas/modulo107/buscar", accion = "ver")

// Página: /bolsas/modulo107/estadisticas
// Acción: ver
@CheckMBACPermission(pagina = "/bolsas/modulo107/estadisticas", accion = "ver")

// Página: /bolsas/modulo107/carga
// Acción: crear
@CheckMBACPermission(pagina = "/bolsas/modulo107/carga", accion = "crear")
```

### **Roles con Acceso**

```
- COORDINADOR_CITAS ✅
- ADMISIONISTA ✅ (solo lectura)
- GESTOR_CITAS ✅
- ADMIN_SISTEMA ✅ (acceso completo)
```

---

## 📊 RESUMEN DE MÉTRICAS

### **Tamaño del Código**

| Componente | Líneas | Complejidad |
|------------|--------|-------------|
| Modulo107PacientesList.jsx | 578 | ⭐⭐⭐⭐⭐ Alta |
| Modulo107EstadisticasAtencion.jsx | 136 | ⭐⭐ Media |
| Modulo107AtencionesClinics.jsx | 71 | ⭐ Baja (Placeholder) |
| formulario107Service.js | 180 | ⭐⭐⭐ Media-Alta |

### **Funcionalidades Implementadas**

✅ **Completadas:**
- Listado de pacientes con paginación
- Búsqueda y filtros avanzados
- Selección múltiple
- Exportación a Excel
- Estadísticas básicas (frontend)
- Sistema de badges

⚠️ **En Progreso:**
- Integración de estadísticas con backend
- Gráficos interactivos

🔲 **Pendientes:**
- Módulo de atenciones clínicas completo
- Formulario de nueva atención
- Detalle de paciente individual
- Historial de atenciones por paciente

---

## 🔧 CONFIGURACIÓN Y DEPENDENCIAS

### **Instalación**
```bash
npm install lucide-react react-hot-toast xlsx
```

### **Imports Principales**
```javascript
// Componentes
import { Users, Search, RefreshCw, Filter, Download } from "lucide-react";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

// Servicios
import apiClient from "../../../lib/apiClient";
import formulario107Service from "../../../services/formulario107Service";
```

---

## 📝 NOTAS TÉCNICAS

### **Optimizaciones Implementadas**
1. **useCallback** para cargarPacientes() → Evita re-renders innecesarios
2. **useEffect** con dependencias para auto-reset de paginación
3. **Filtrado client-side** para búsqueda instantánea
4. **Lazy loading** de componentes (React.lazy)

### **Buenas Prácticas**
- ✅ Componentes funcionales con Hooks
- ✅ Separación de lógica de negocio (servicios)
- ✅ Manejo de errores con try-catch
- ✅ Feedback al usuario (toasts)
- ✅ Validaciones antes de operaciones críticas
- ✅ Formato consistente de fechas
- ✅ Nombres descriptivos de variables

---

## 🐛 TROUBLESHOOTING

### **Problema: No se cargan los pacientes**
**Solución:**
```javascript
// Verificar en consola del navegador:
console.log("Response:", response);

// Verificar endpoint en Network tab
GET /api/bolsa107/pacientes
Status: 200 OK
```

### **Problema: Exportación falla**
**Solución:**
```javascript
// Verificar que haya pacientes seleccionados
if (selectedIds.length === 0) {
  toast.error("Selecciona al menos un paciente");
  return;
}

// Verificar que XLSX esté instalado
import * as XLSX from "xlsx";
```

### **Problema: Filtros no funcionan**
**Solución:**
```javascript
// Verificar que los campos existan en los datos
console.log("Paciente:", paciente);
console.log("Tiene numero_documento?", paciente.numero_documento);
```

---

## 📚 REFERENCIAS

- [React Hooks](https://react.dev/reference/react)
- [Lucide Icons](https://lucide.dev/)
- [XLSX Library](https://docs.sheetjs.com/)
- [React Hot Toast](https://react-hot-toast.com/)

---

**Última actualización:** 2026-01-30  
**Mantenedor:** Equipo de Desarrollo CENATE  
**Versión del documento:** 1.0.0
