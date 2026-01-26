# 📐 Estructura Mínima de Páginas - Design System CENATE v1.0.0

Guía sobre la estructura HTML/CSS mínima recomendada para todas las páginas que siguen el patrón de diseño CENATE.

---

## 🎯 Patrón de Estructura General

```
┌─────────────────────────────────────────────────────────┐
│                    CENATE Header (Navbar)                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🏷️  Badge | 📄 Título Principal                   │  │
│  │                              ┌──────────────────┐  │  │
│  │                              │ ➕ Botón Principal│  │  │
│  │                              └──────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │
│  │  📊 8   │ │  ⏳ 2   │ │  📞 3   │ │  ✓ 2    │       │
│  │  Total  │ │Pendient │ │ Citados │ │Atendidos│       │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │ 🔍 Buscar... │ 📂 Todas │ 🌐 Todas │ 🏥 Todas   │  │
│  ├────────────────────────────────────────────────────┤  │
│  │ ┌────┬──────────┬──────────┬─────────────────────┐ │  │
│  │ │ ☐  │ 12345678 │ María G. │ Nutrición           │ │  │
│  │ ├────┼──────────┼──────────┼─────────────────────┤ │  │
│  │ │ ☐  │ 23456789 │ Juan P.  │ Psicología          │ │  │
│  │ └────┴──────────┴──────────┴─────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Estructura JSX Mínima

```jsx
import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';

export default function MiPagina() {
  // 1️⃣ STATE (datos que cambian)
  const [datos, setDatos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({ tipo: 'todas' });

  // 2️⃣ EFECTOS (cargar datos al montar)
  useEffect(() => {
    cargarDatos();
  }, []);

  // 3️⃣ FUNCIONES (lógica de negocio)
  const cargarDatos = async () => {
    // TODO: Llamar a API
    // const response = await miService.obtener();
    // setDatos(response.data);
  };

  // 4️⃣ CÁLCULOS (estadísticas, filtrados)
  const estadisticas = {
    total: datos.length
    // ... más estadísticas
  };

  const datosFiltrados = datos.filter(d => {
    const matchBusqueda = d.nombre.includes(searchTerm);
    const matchFiltro = filtros.tipo === 'todas' || d.tipo === filtros.tipo;
    return matchBusqueda && matchFiltro;
  });

  // 5️⃣ RENDER
  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-7xl mx-auto">

        {/* A. HEADER */}
        <PageHeader {...props} />

        {/* B. ESTADÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard {...props} />
        </div>

        {/* C. TABLA/LISTA */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ListHeader {...props} />

          {/* Contenido (tabla, cards, etc) */}
          <div className="overflow-x-auto">
            {isLoading ? <Spinner /> : <Tabla datos={datosFiltrados} />}
          </div>
        </div>

      </div>
    </div>
  );
}
```

---

## 📦 Componentes Clave

### 1. PageHeader (Encabezado)

**Responsabilidad**: Mostrar título, badge y botón principal

```jsx
<PageHeader
  badge={{
    label: "Etiqueta",
    bgColor: "bg-blue-100 text-blue-700",
    icon: IconComponent
  }}
  title="Título de Página"
  primaryAction={{
    label: "Botón Principal",
    onClick: () => handleAction()
  }}
/>
```

**HTML Generado**:
```html
<div className="mb-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className="bg-blue-100 text-blue-700 ...">
        <Icon /> Etiqueta
      </div>
      <h1 className="text-3xl font-bold">Título de Página</h1>
    </div>
    <button className="bg-teal-500 hover:bg-teal-600 ...">
      <Icon /> Botón Principal
    </button>
  </div>
</div>
```

---

### 2. StatCard (Tarjetas de Estadística)

**Responsabilidad**: Mostrar métrica con color y ícono

```jsx
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
  <StatCard label="Total" value={8} borderColor="border-blue-500" textColor="text-blue-600" icon="👥" />
  <StatCard label="Pendiente" value={2} borderColor="border-orange-500" textColor="text-orange-600" icon="⏳" />
  <StatCard label="Citado" value={3} borderColor="border-purple-500" textColor="text-purple-600" icon="📞" />
  <StatCard label="Atendido" value={2} borderColor="border-green-500" textColor="text-green-600" icon="✓" />
  <StatCard label="Observado" value={1} borderColor="border-red-500" textColor="text-red-600" icon="⚠️" />
</div>
```

**HTML Generado**:
```html
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
  <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
    <p className="text-gray-600 text-sm">Total</p>
    <p className="text-3xl font-bold text-blue-600 mt-1">8</p>
  </div>
  <!-- Más tarjetas... -->
</div>
```

---

### 3. ListHeader (Búsqueda y Filtros)

**Responsabilidad**: Proporcionar búsqueda y filtros dinámicos

```jsx
<ListHeader
  title="Lista de Pacientes"
  searchPlaceholder="Buscar paciente, DNI o IPRESS..."
  searchValue={searchTerm}
  onSearchChange={(e) => setSearchTerm(e.target.value)}
  filters={[
    {
      name: "Tipo",
      value: filtros.tipo,
      onChange: (e) => setFiltros({...filtros, tipo: e.target.value}),
      options: [
        { label: "Todos", value: "todas" },
        { label: "Tipo 1", value: "tipo_1" }
      ]
    }
  ]}
/>
```

**HTML Generado**:
```html
<div className="p-4 border-b border-gray-200">
  <h2 className="text-lg font-bold text-gray-800 mb-3">Lista de Pacientes</h2>
  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
    <!-- Search Input -->
    <div className="relative md:col-span-2">
      <Search className="absolute left-4 top-3" />
      <input className="w-full pl-12 pr-4 py-2 border rounded-md" />
    </div>
    <!-- Filtros dinámicos -->
    <select className="w-full px-4 py-2 border rounded-md">
      <option>Todos</option>
    </select>
  </div>
</div>
```

---

## 📊 Tabla Mínima Dentro del Contenedor

```jsx
<div className="bg-white rounded-lg shadow-md overflow-hidden">
  <ListHeader {...props} />

  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead className="bg-[#0D5BA9] text-white sticky top-0">
        <tr>
          <th className="px-6 py-4 text-left font-bold uppercase">Columna 1</th>
          <th className="px-6 py-4 text-left font-bold uppercase">Columna 2</th>
        </tr>
      </thead>
      <tbody>
        {datosFiltrados.map(item => (
          <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
            <td className="px-6 py-4">{item.campo1}</td>
            <td className="px-6 py-4">{item.campo2}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>
```

---

## 🎨 Clases Tailwind Recomendadas

### Layout Principales

| Clase | Propósito |
|-------|-----------|
| `min-h-screen bg-slate-50` | Contenedor principal |
| `w-full max-w-7xl mx-auto` | Ancho máximo centrado |
| `p-4` | Padding exterior |
| `mb-8` | Margen inferior (espaciado entre secciones) |
| `gap-4` | Espacio entre elementos en grid |

### Headers y Títulos

| Clase | Propósito |
|-------|-----------|
| `text-3xl font-bold text-gray-800` | Título principal |
| `text-lg font-bold text-gray-800` | Título de sección |
| `text-sm font-semibold` | Texto de etiqueta |
| `text-xs font-bold uppercase` | Encabezado de tabla |

### Colores CENATE

| Clase | Propósito |
|-------|-----------|
| `bg-[#0D5BA9] text-white` | Header de tabla (azul CENATE) |
| `bg-blue-100 text-blue-700` | Badge/etiqueta información |
| `bg-orange-500` | Advertencia/pendiente |
| `bg-green-500` | Éxito/completado |
| `bg-red-500` | Error/observado |
| `bg-purple-500` | Secundario |

### Componentes

| Clase | Propósito |
|-------|-----------|
| `bg-white rounded-lg shadow-md` | Caja/card |
| `border border-gray-300` | Borde sutil |
| `border-l-4` | Borde izquierdo (StatCard) |
| `overflow-hidden` | Cortar contenido |
| `overflow-x-auto` | Tabla horizontal scrollable |

---

## 🚀 Checklist para Nueva Página

Cuando crees una página nueva que siga este patrón:

- [ ] Importa los 3 componentes (PageHeader, StatCard, ListHeader)
- [ ] Define state para datos, búsqueda y filtros
- [ ] Crea useEffect para cargar datos
- [ ] Calcula estadísticas en función del estado
- [ ] Filtra datos por búsqueda y filtros
- [ ] Estructura HTML: Header → Estadísticas → Tabla
- [ ] Usa clases Tailwind según la tabla anterior
- [ ] Implementa loading state con spinner
- [ ] Maneja error state con mensajes claros
- [ ] Haz responsive (mobile-first)
- [ ] Prueba con datos reales de API

---

## 📝 Ejemplo Completo Minimalista

```jsx
import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';
import { Plus } from 'lucide-react';

export default function Ejemplo() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('todas');

  useEffect(() => {
    setItems([
      { id: 1, nombre: 'Item 1', tipo: 'tipo_a' },
      { id: 2, nombre: 'Item 2', tipo: 'tipo_b' }
    ]);
  }, []);

  const filtered = items.filter(i =>
    i.nombre.includes(search) && (filter === 'todas' || i.tipo === filter)
  );

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-7xl mx-auto">
        <PageHeader
          badge={{ label: "Ejemplo", bgColor: "bg-blue-100 text-blue-700" }}
          title="Mi Página"
          primaryAction={{ label: "Agregar", onClick: () => {} }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <StatCard label="Total" value={items.length} borderColor="border-blue-500" textColor="text-blue-600" icon="📊" />
          <StatCard label="Filtrados" value={filtered.length} borderColor="border-green-500" textColor="text-green-600" icon="✓" />
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ListHeader
            title="Items"
            searchPlaceholder="Buscar..."
            searchValue={search}
            onSearchChange={(e) => setSearch(e.target.value)}
            filters={[
              {
                name: "Tipo",
                value: filter,
                onChange: (e) => setFilter(e.target.value),
                options: [
                  { label: "Todas", value: "todas" },
                  { label: "Tipo A", value: "tipo_a" }
                ]
              }
            ]}
          />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#0D5BA9] text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">Nombre</th>
                  <th className="px-6 py-4 text-left font-bold">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{item.nombre}</td>
                    <td className="px-6 py-4">{item.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔗 Referencias

- **Componentes**: `frontend/src/components/` (PageHeader, StatCard, ListHeader)
- **Ejemplo completo**: `frontend/src/pages/bolsas/PLANTILLA_PAGINA_MINIMA.jsx`
- **Documentación componentes**: `frontend/src/components/README.md`
- **Design System**: `spec/03_UI_UX/01_design_system_tablas.md`

---

**Versión**: 1.0.0
**Fecha**: 2026-01-22
**Design System**: CENATE v1.0.0
