# 🎨 Documentación Frontend - Gestión de Períodos Médicos de Disponibilidad

## 📍 Ubicación
**Ruta:** `/roles/coordinador/periodo-disponibilidad-medica`  
**Componente Principal:** `GestionPeriodosDisponibilidad.jsx`  
**Carpeta:** `frontend/src/pages/roles/coordinador/gestion-periodos-disponibilidad/`

---

## 🎯 Descripción
Módulo frontend para la gestión de períodos globales de disponibilidad médica. Permite a los coordinadores crear, editar, activar/cerrar y eliminar períodos que definen los rangos de tiempo para la captura de disponibilidades médicas.

---

## 📁 Estructura de Archivos

```
frontend/src/pages/roles/coordinador/gestion-periodos-disponibilidad/
├── GestionPeriodosDisponibilidad.jsx    # Componente principal
├── components/
│   ├── CardStat.jsx                      # Tarjetas de estadísticas
│   ├── ModalAperturarPeriodo.jsx        # Modal para crear período
│   ├── ModalEditarPeriodo.jsx           # Modal para editar período
│   ├── ModalConfirmarEliminacion.jsx    # Modal de confirmación
│   ├── TabPeriodos.jsx                  # Tab de períodos
│   └── TabDisponibilidades.jsx          # Tab de disponibilidades
└── utils/
    └── ui.js                             # Utilidades de UI
```

---

## 🔌 Servicio de API

### Archivo
`frontend/src/services/periodoMedicoDisponibilidadService.js`

### Métodos Disponibles

#### 1. `listarTodos()`
Obtiene todos los períodos médicos de disponibilidad.

```javascript
const periodos = await periodoMedicoDisponibilidadService.listarTodos();
```

**Retorna:** `Promise<Array<PeriodoMedicoDisponibilidadResponse>>`

---

#### 2. `listarActivos()`
Obtiene solo los períodos activos.

```javascript
const periodosActivos = await periodoMedicoDisponibilidadService.listarActivos();
```

**Retorna:** `Promise<Array<PeriodoMedicoDisponibilidadResponse>>`

---

#### 3. `listarVigentes()`
Obtiene los períodos vigentes.

```javascript
const periodosVigentes = await periodoMedicoDisponibilidadService.listarVigentes();
```

**Retorna:** `Promise<Array<PeriodoMedicoDisponibilidadResponse>>`

---

#### 4. `listarAnios()`
Obtiene la lista de años disponibles.

```javascript
const anios = await periodoMedicoDisponibilidadService.listarAnios();
```

**Retorna:** `Promise<Array<Number>>`

---

#### 5. `obtenerPorId(id)`
Obtiene un período específico por su ID.

```javascript
const periodo = await periodoMedicoDisponibilidadService.obtenerPorId(1);
```

**Parámetros:**
- `id` (Number): ID del período

**Retorna:** `Promise<PeriodoMedicoDisponibilidadResponse>`

---

#### 6. `crear(data)`
Crea un nuevo período médico de disponibilidad.

```javascript
const nuevoPeriodo = await periodoMedicoDisponibilidadService.crear({
  anio: 2026,
  periodo: "202601",
  descripcion: "Enero 2026",
  fechaInicio: "2026-01-01",
  fechaFin: "2026-01-31"
});
```

**Parámetros:**
```typescript
{
  anio: number;              // 2020-2100
  periodo: string;           // Formato YYYYMM (6 caracteres)
  descripcion: string;       // Descripción del período
  fechaInicio: string;       // Formato YYYY-MM-DD
  fechaFin: string;         // Formato YYYY-MM-DD
}
```

**Retorna:** `Promise<PeriodoMedicoDisponibilidadResponse>`

---

#### 7. `actualizar(id, data)`
Actualiza un período existente.

```javascript
const periodoActualizado = await periodoMedicoDisponibilidadService.actualizar(1, {
  anio: 2026,
  periodo: "202601",
  descripcion: "Enero 2026 - Actualizado",
  fechaInicio: "2026-01-01",
  fechaFin: "2026-01-31"
});
```

**Parámetros:**
- `id` (Number): ID del período a actualizar
- `data` (Object): Datos actualizados (misma estructura que `crear`)

**Retorna:** `Promise<PeriodoMedicoDisponibilidadResponse>`

---

#### 8. `cambiarEstado(id, estado)`
Cambia el estado de un período.

```javascript
const periodo = await periodoMedicoDisponibilidadService.cambiarEstado(1, "CERRADO");
```

**Parámetros:**
- `id` (Number): ID del período
- `estado` (String): Nuevo estado (`ACTIVO`, `CERRADO`, `BORRADOR`, `ANULADO`)

**Retorna:** `Promise<PeriodoMedicoDisponibilidadResponse>`

---

#### 9. `eliminar(id)`
Elimina un período médico de disponibilidad.

```javascript
await periodoMedicoDisponibilidadService.eliminar(1);
```

**Parámetros:**
- `id` (Number): ID del período a eliminar

**Retorna:** `Promise<void>`

---

## 🧩 Componentes

### GestionPeriodosDisponibilidad (Principal)

**Ubicación:** `GestionPeriodosDisponibilidad.jsx`

**Descripción:** Componente principal que gestiona la vista de períodos y disponibilidades.

**Estado Principal:**
```javascript
const [periodos, setPeriodos] = useState([]);
const [disponibilidades, setDisponibilidades] = useState([]);
const [activeTab, setActiveTab] = useState("periodos");
const [filtrosPeriodos, setFiltrosPeriodos] = useState({
  estado: "TODOS",
  anio: new Date().getFullYear()
});
```

**Funciones Principales:**

#### `cargarPeriodos()`
Carga los períodos según los filtros aplicados.

```javascript
const cargarPeriodos = async () => {
  setLoadingPeriodos(true);
  try {
    let response;
    
    if (filtrosPeriodos.estado === "ACTIVO") {
      response = await periodoMedicoDisponibilidadService.listarActivos();
    } else {
      response = await periodoMedicoDisponibilidadService.listarTodos();
    }
    
    // Filtrar por año y estado
    // Mapear datos al formato del frontend
    setPeriodos(periodosMapeados);
  } catch (err) {
    console.error("Error al cargar periodos:", err);
    setPeriodos([]);
  } finally {
    setLoadingPeriodos(false);
  }
};
```

#### `handleAperturarPeriodo(nuevoPeriodo)`
Crea un nuevo período.

```javascript
const handleAperturarPeriodo = async (nuevoPeriodo) => {
  try {
    const requestData = {
      anio: parseInt(nuevoPeriodo.periodo.substring(0, 4)),
      periodo: nuevoPeriodo.periodo,
      descripcion: nuevoPeriodo.descripcion,
      fechaInicio: nuevoPeriodo.fechaInicio.split('T')[0],
      fechaFin: nuevoPeriodo.fechaFin.split('T')[0]
    };
    
    await periodoMedicoDisponibilidadService.crear(requestData);
    await cargarPeriodos();
    window.alert("Período aperturado correctamente");
  } catch (err) {
    window.alert(`Error al aperturar el período:\n\n${err.message}`);
  }
};
```

#### `handleGuardarEdicionPeriodo(idPeriodo, fechas)`
Actualiza las fechas de un período.

```javascript
const handleGuardarEdicionPeriodo = async (idPeriodo, fechas) => {
  try {
    const periodoActual = periodoAEditar;
    const requestData = {
      anio: periodoActual.anio || parseInt(periodoActual.periodo?.substring(0, 4)),
      periodo: periodoActual.periodo,
      descripcion: periodoActual.descripcion,
      fechaInicio: fechas.fechaInicio.split(' ')[0],
      fechaFin: fechas.fechaFin.split(' ')[0]
    };
    
    await periodoMedicoDisponibilidadService.actualizar(idPeriodo, requestData);
    await cargarPeriodos();
    window.alert("¡Fechas actualizadas correctamente!");
  } catch (err) {
    window.alert(`Error al actualizar las fechas:\n\n${err.message}`);
  }
};
```

#### `handleTogglePeriodo(periodo)`
Cambia el estado de un período entre ACTIVO y CERRADO.

```javascript
const handleTogglePeriodo = async (periodo) => {
  const nuevoEstado = periodo.estado === "ACTIVO" ? "CERRADO" : "ACTIVO";
  try {
    const idPeriodo = periodo.idPeriodoRegDisp || periodo.idPeriodo;
    await periodoMedicoDisponibilidadService.cambiarEstado(idPeriodo, nuevoEstado);
    await cargarPeriodos();
    window.alert(`Período ${nuevoEstado === "ACTIVO" ? 'activado' : 'cerrado'} correctamente`);
  } catch (err) {
    window.alert(`Error al cambiar estado del período:\n\n${err.message}`);
  }
};
```

#### `handleConfirmarEliminacion()`
Elimina un período.

```javascript
const handleConfirmarEliminacion = async () => {
  try {
    const idPeriodo = periodoAEliminar.idPeriodoRegDisp || periodoAEliminar.idPeriodo;
    await periodoMedicoDisponibilidadService.eliminar(idPeriodo);
    await cargarPeriodos();
    window.alert("¡Período eliminado correctamente!");
  } catch (err) {
    window.alert(`Error al eliminar el período:\n\n${err.message}`);
  }
};
```

---

### ModalAperturarPeriodo

**Ubicación:** `components/ModalAperturarPeriodo.jsx`

**Descripción:** Modal para crear un nuevo período.

**Props:**
- `onClose`: Función para cerrar el modal
- `onCrear`: Función que se ejecuta al crear el período

**Datos que envía:**
```javascript
{
  periodo: "202601",              // YYYYMM
  descripcion: "Enero 2026",
  fechaInicio: "2026-01-01",
  fechaFin: "2026-01-31",
  instrucciones: null
}
```

---

### ModalEditarPeriodo

**Ubicación:** `components/ModalEditarPeriodo.jsx`

**Descripción:** Modal para editar las fechas de un período existente.

**Props:**
- `periodo`: Objeto del período a editar
- `onClose`: Función para cerrar el modal
- `onGuardar`: Función que se ejecuta al guardar (recibe `idPeriodo` y `fechas`)

**Validaciones:**
- Ambas fechas deben estar completas
- La fecha de inicio debe ser anterior a la fecha de fin

**Datos que envía:**
```javascript
{
  fechaInicio: "2026-01-01 00:00:00",
  fechaFin: "2026-01-31 23:59:59"
}
```

---

### ModalConfirmarEliminacion

**Ubicación:** `components/ModalConfirmarPeriodo.jsx`

**Descripción:** Modal de confirmación antes de eliminar un período.

**Props:**
- `periodo`: Objeto del período a eliminar
- `onClose`: Función para cerrar el modal
- `onConfirmar`: Función que se ejecuta al confirmar
- `eliminando`: Boolean que indica si se está procesando la eliminación

---

### TabPeriodos

**Ubicación:** `components/TabPeriodos.jsx`

**Descripción:** Tab que muestra la lista de períodos con opciones de filtrado.

**Props:**
- `periodos`: Array de períodos
- `loading`: Boolean de carga
- `onTogglePeriodo`: Función para cambiar estado
- `onCrearPeriodo`: Función para abrir modal de creación
- `onEditarPeriodo`: Función para abrir modal de edición
- `onEliminarPeriodo`: Función para abrir modal de eliminación
- `filtros`: Objeto con filtros aplicados
- `onFiltrosChange`: Función para actualizar filtros
- `aniosDisponibles`: Array de años disponibles

---

### TabDisponibilidades

**Ubicación:** `components/TabDisponibilidades.jsx`

**Descripción:** Tab que muestra las disponibilidades individuales de médicos.

**Nota:** Este tab usa el servicio antiguo `periodoDisponibilidadService` porque maneja disponibilidades individuales, no períodos globales.

---

## 📊 Estados del Período

```javascript
const ESTADO_PERIODO = {
  BORRADOR: "BORRADOR",
  ACTIVO: "ACTIVO",
  CERRADO: "CERRADO"
};
```

---

## 🎨 UI/UX

### Estadísticas (CardStat)
El componente muestra tarjetas con estadísticas:
- **Total:** Total de períodos registrados
- **Activos:** Períodos en estado ACTIVO
- **Cerrados:** Períodos en estado CERRADO
- **Borradores:** Períodos en estado BORRADOR

### Filtros
- **Por Estado:** TODOS, ACTIVO, CERRADO
- **Por Año:** Selector de año basado en años disponibles

---

## 🔄 Flujo de Datos

```
Usuario → Componente → Servicio → API Client → Backend
                ↓
         Actualización de Estado
                ↓
         Re-renderizado de UI
```

---

## ⚠️ Manejo de Errores

Todos los métodos del servicio y componentes manejan errores con:
- `try/catch` blocks
- Mensajes de error al usuario mediante `window.alert`
- Logging en consola con `console.error`

---

## 📝 Notas de Implementación

1. **Formato de Fechas:**
   - El backend espera `LocalDate` (YYYY-MM-DD)
   - El frontend extrae solo la fecha antes de enviar: `.split('T')[0]`

2. **Mapeo de IDs:**
   - El backend usa `idPeriodoRegDisp`
   - El frontend mapea a `idPeriodo` para compatibilidad

3. **Filtrado:**
   - Los filtros se aplican en el frontend después de obtener los datos
   - El filtro por año se aplica en `cargarPeriodos()`

4. **Actualización Automática:**
   - Después de crear, editar o eliminar, se recargan los períodos automáticamente

---

## 🧪 Ejemplos de Uso

### Importar el servicio
```javascript
import periodoMedicoDisponibilidadService from '../../../../services/periodoMedicoDisponibilidadService';
```

### Crear un período
```javascript
const nuevoPeriodo = {
  anio: 2026,
  periodo: "202601",
  descripcion: "Enero 2026",
  fechaInicio: "2026-01-01",
  fechaFin: "2026-01-31"
};

try {
  const resultado = await periodoMedicoDisponibilidadService.crear(nuevoPeriodo);
  console.log("Período creado:", resultado);
} catch (error) {
  console.error("Error:", error.message);
}
```

### Cambiar estado
```javascript
try {
  await periodoMedicoDisponibilidadService.cambiarEstado(1, "CERRADO");
  console.log("Estado cambiado correctamente");
} catch (error) {
  console.error("Error:", error.message);
}
```

---

## 🔗 Archivos Relacionados

- **Servicio:** `frontend/src/services/periodoMedicoDisponibilidadService.js`
- **API Client:** `frontend/src/services/apiClient.js`
- **Registro de Rutas:** `frontend/src/config/componentRegistry.js`
- **Utilidades UI:** `frontend/src/pages/roles/coordinador/gestion-periodos-disponibilidad/utils/ui.js`

---

## 🐛 Solución de Problemas

### Error: "No endpoint POST /api/api/periodos-medicos-disponibilidad"
**Causa:** URL duplicada con `/api/api/`

**Solución:** El `BASE_URL` en el servicio debe ser `/periodos-medicos-disponibilidad` (sin `/api`) porque el `apiClient` ya agrega `/api` automáticamente.

### Error: "Formato de fecha inválido"
**Causa:** El backend espera `YYYY-MM-DD` pero se está enviando con hora.

**Solución:** Extraer solo la fecha antes de enviar: `fecha.split('T')[0]`

---

**Última actualización:** 2026-01-27
