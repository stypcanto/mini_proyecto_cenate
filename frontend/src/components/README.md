# 📦 Componentes Reutilizables - Design System CENATE

Guía de uso para componentes estandarizados siguiendo el Design System CENATE v1.0.0.

---

## 🎯 PageHeader

Encabezado estándar para todas las páginas con título, badge y botón principal.

### Ejemplo de uso:

```jsx
import PageHeader from '../../components/PageHeader';
import { FolderOpen } from 'lucide-react';

<PageHeader
  badge={{
    label: "Recepción de Bolsa",
    bgColor: "bg-blue-100 text-blue-700",
    icon: FolderOpen
  }}
  title="Solicitudes"
  primaryAction={{
    label: "Agregar Paciente",
    onClick: () => handleAddPatient()
  }}
  subtitle="Gestión centralizada de solicitudes de atención" // opcional
/>
```

### Props:

| Prop | Tipo | Descripción | Requerido |
|------|------|-------------|-----------|
| `badge` | object | Badge con label, bgColor, icon | No |
| `title` | string | Título principal de la página | Sí |
| `primaryAction` | object | Botón principal {label, onClick} | No |
| `subtitle` | string | Subtítulo opcional | No |

### Estilos por defecto:

- **Título**: `text-3xl font-bold text-gray-800`
- **Botón**: Verde teal (`bg-teal-500 hover:bg-teal-600`)
- **Badge**: Azul claro (`bg-blue-100 text-blue-700`)

---

## 📊 StatCard

Tarjeta de estadística con color, valor e ícono.

### Ejemplo de uso:

```jsx
import StatCard from '../../components/StatCard';

<StatCard
  label="Total Pacientes"
  value={8}
  borderColor="border-blue-500"
  textColor="text-blue-600"
  icon="👥"
/>

<StatCard
  label="Pendientes"
  value={2}
  borderColor="border-orange-500"
  textColor="text-orange-600"
  icon="⏳"
/>
```

### Props:

| Prop | Tipo | Descripción |
|------|------|-------------|
| `label` | string | Etiqueta de la estadística |
| `value` | number | Valor a mostrar |
| `borderColor` | string | Clase Tailwind para borde izquierdo |
| `textColor` | string | Clase Tailwind para color del valor |
| `icon` | string | Emoji o ReactComponent |

### Colores sugeridos:

```jsx
// Información
<StatCard borderColor="border-blue-500" textColor="text-blue-600" />

// Pendiente
<StatCard borderColor="border-orange-500" textColor="text-orange-600" />

// Citado
<StatCard borderColor="border-purple-500" textColor="text-purple-600" />

// Atendido
<StatCard borderColor="border-green-500" textColor="text-green-600" />

// Observado/Alerta
<StatCard borderColor="border-red-500" textColor="text-red-600" />
```

---

## 🔍 ListHeader

Encabezado de lista con búsqueda y filtros dinámicos.

### Ejemplo de uso:

```jsx
import ListHeader from '../../components/ListHeader';

const [searchTerm, setSearchTerm] = useState('');
const [filtroBolsa, setFiltroBolsa] = useState('todas');
const [filtroRed, setFiltroRed] = useState('todas');

<ListHeader
  title="Lista de Pacientes"
  searchPlaceholder="Buscar paciente, DNI o IPRESS..."
  searchValue={searchTerm}
  onSearchChange={(e) => setSearchTerm(e.target.value)}
  filters={[
    {
      name: "Bolsas",
      value: filtroBolsa,
      onChange: (e) => setFiltroBolsa(e.target.value),
      options: [
        { label: "Todas las bolsas", value: "todas" },
        { label: "BOLSA 107", value: "BOLSA_107" },
        { label: "BOLSA DENGUE", value: "BOLSA_DENGUE" }
      ]
    },
    {
      name: "Redes",
      value: filtroRed,
      onChange: (e) => setFiltroRed(e.target.value),
      options: [
        { label: "Todas las redes", value: "todas" },
        { label: "Red Centro", value: "Red Centro" },
        { label: "Red Norte", value: "Red Norte" }
      ]
    }
  ]}
/>
```

### Props:

| Prop | Tipo | Descripción |
|------|------|-------------|
| `title` | string | Título de la sección |
| `searchPlaceholder` | string | Placeholder de búsqueda |
| `searchValue` | string | Valor actual de búsqueda |
| `onSearchChange` | function | Callback onChange para búsqueda |
| `filters` | array | Array de objetos de filtro |

### Estructura de filtros:

```javascript
{
  name: string,              // Nombre del filtro (para referencia)
  value: string,             // Valor actual seleccionado
  onChange: function,        // Callback cuando cambia
  options: [                 // Opciones disponibles
    {
      label: string,         // Texto mostrado
      value: string          // Valor interno
    }
  ]
}
```

---

## 🎨 Patrón de Layout Completo

Cómo usar los tres componentes juntos para una página completa:

```jsx
import React, { useState } from 'react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import ListHeader from '../../components/ListHeader';
import { Plus, FolderOpen } from 'lucide-react';

export default function MiPagina() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtros, setFiltros] = useState({
    bolsa: 'todas',
    red: 'todas'
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4">
      <div className="w-full max-w-7xl mx-auto">

        {/* 1. PageHeader */}
        <PageHeader
          badge={{
            label: "Mi Módulo",
            bgColor: "bg-blue-100 text-blue-700",
            icon: FolderOpen
          }}
          title="Título de Página"
          primaryAction={{
            label: "Agregar",
            onClick: () => console.log('Agregar')
          }}
        />

        {/* 2. Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            label="Total"
            value={100}
            borderColor="border-blue-500"
            textColor="text-blue-600"
            icon="📊"
          />
          {/* Más tarjetas... */}
        </div>

        {/* 3. Lista con filtros */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ListHeader
            title="Lista de Items"
            searchPlaceholder="Buscar..."
            searchValue={searchTerm}
            onSearchChange={(e) => setSearchTerm(e.target.value)}
            filters={[
              {
                name: "Categoría",
                value: filtros.bolsa,
                onChange: (e) => setFiltros({...filtros, bolsa: e.target.value}),
                options: [
                  { label: "Todas", value: "todas" },
                  { label: "Opción 1", value: "opt1" }
                ]
              }
            ]}
          />

          {/* Tabla o contenido aquí */}
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Tu tabla */}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 🎯 Colores CENATE

Colores primarios según Design System v1.0.0:

```css
/* Color Primario CENATE */
--cenate-primary: #0D5BA9  /* Azul CENATE */

/* Paleta de Estados */
--info: #0D5BA9       /* Azul - Información */
--warning: #F59E0B    /* Naranja - Advertencia */
--success: #10B981    /* Verde - Éxito */
--danger: #EF4444     /* Rojo - Peligro */
--secondary: #6366F1  /* Púrpura - Secundario */
```

---

## 📝 Notas Importantes

1. **Props opcionales**: Si no proporcionas ciertos props, se usan valores por defecto.

2. **Tailwind obligatorio**: Asegúrate de que TailwindCSS 3.4.18+ esté configurado en el proyecto.

3. **Lucide React**: Los íconos usan lucide-react, importa lo que necesites.

4. **Responsive**: Todos los componentes son responsive (mobile-first).

5. **Accesibilidad**: Los componentes incluyen labels semánticos y atributos ARIA cuando es posible.

---

## 🚀 Importes rápidos

```jsx
// PageHeader
import PageHeader from '../../components/PageHeader';

// StatCard
import StatCard from '../../components/StatCard';

// ListHeader
import ListHeader from '../../components/ListHeader';

// Íconos
import { Plus, FolderOpen, Search, ChevronDown } from 'lucide-react';
```

---

**Última actualización**: 2026-01-22
**Versión**: 1.0.0
**Design System**: CENATE v1.0.0
