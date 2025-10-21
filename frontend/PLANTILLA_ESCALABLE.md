# 🎨 Sistema de Plantillas Escalables - CENATE

## 📋 Descripción

Sistema de componentes reutilizables con **tipografía mejorada** y **diseño consistente** para todas las páginas administrativas de CENATE.

## ✨ Mejoras Implementadas

### 🎯 Tipografía Mejorada
- ✅ **Tamaños de fuente incrementados** para mejor legibilidad
- ✅ **Font-weight optimizado** (semibold, bold)
- ✅ **Contraste mejorado** en modo claro y oscuro
- ✅ **Espaciado consistente** entre elementos
- ✅ **Bordes más gruesos** (2px) para mejor definición

### 🧩 Componentes Reutilizables

#### 1. **PageHeader** (`/components/ui/PageHeader.jsx`)
Header reutilizable para todas las páginas

```jsx
import PageHeader from "../components/ui/PageHeader";
import { Shield } from "lucide-react";

<PageHeader
  icon={Shield}
  title="Título de la Página"
  subtitle="Descripción breve"
  actions={
    <button>Acción</button>
  }
/>
```

**Props:**
- `icon`: Componente de ícono (Lucide React)
- `title`: Título principal (string)
- `subtitle`: Subtítulo opcional (string)
- `actions`: Botones o acciones (ReactNode)
- `gradient`: Color del ícono (string) - default: "from-teal-500 to-cyan-600"

#### 2. **StatCard** (`/components/ui/StatCard.jsx`)
Tarjetas de estadísticas con colores personalizables

```jsx
import StatCard from "../components/ui/StatCard";
import { Users } from "lucide-react";

<StatCard
  icon={Users}
  label="Total Usuarios"
  value={245}
  trend="+12%"
  color="blue"
/>
```

**Props:**
- `icon`: Ícono (Lucide React)
- `label`: Etiqueta (string)
- `value`: Valor a mostrar (number/string)
- `trend`: Tendencia opcional (string)
- `color`: Color del tema - "blue" | "green" | "purple" | "teal"
- `onClick`: Función opcional para hacer la card clickeable

**Colores disponibles:**
- `blue`: Azul/Índigo
- `green`: Verde/Esmeralda
- `purple`: Púrpura/Rosa
- `teal`: Turquesa/Cian

## 📁 Estructura de Archivos

```
frontend/src/
├── components/
│   ├── layout/
│   │   ├── AdminLayout.jsx      ✅ Layout principal
│   │   ├── AdminSidebar.jsx     ✅ Sidebar con menú
│   │   └── HeaderCenate.jsx     ✅ Header superior
│   └── ui/
│       ├── PageHeader.jsx       ⭐ NUEVO
│       ├── StatCard.jsx         ⭐ NUEVO
│       ├── button.jsx
│       └── card.jsx
└── pages/
    ├── admin/
    │   └── PermisosPage.jsx     ✅ Actualizado
    ├── AdminDashboard.js        ✅ Actualizado
    └── UsersPage.js             ✅ Actualizado
```

## 🎨 Guía de Estilos

### Tipografía

```jsx
// Títulos principales
className="text-3xl font-bold text-slate-900 dark:text-white"

// Subtítulos
className="text-base text-slate-600 dark:text-slate-400"

// Texto de cards
className="text-sm font-semibold uppercase tracking-wide"

// Valores grandes (stats)
className="text-3xl font-bold text-slate-900 dark:text-white"

// Etiquetas pequeñas
className="text-xs font-bold"
```

### Colores (Modo Claro/Oscuro)

```jsx
// Fondo principal
bg-white dark:bg-slate-800

// Fondo secundario
bg-slate-50 dark:bg-slate-900/30

// Bordes
border-slate-200 dark:border-slate-700

// Texto principal
text-slate-900 dark:text-white

// Texto secundario
text-slate-600 dark:text-slate-400

// Inputs
bg-slate-50 dark:bg-slate-900/50
border-2 border-slate-200 dark:border-slate-700
```

### Espaciado Consistente

```jsx
// Padding de cards
p-6 o p-8

// Gaps entre elementos
gap-3, gap-4, gap-6

// Margins bottom
mb-6, mb-8

// Padding de botones
px-4 py-3 o px-5 py-3
```

### Bordes y Sombras

```jsx
// Bordes de cards
border-2 border-slate-200 dark:border-slate-700

// Rounded corners
rounded-xl o rounded-2xl

// Sombras
shadow-sm, shadow-lg
shadow-teal-500/30 (para elementos teal)
```

## 🚀 Cómo Usar la Plantilla

### Paso 1: Importar componentes base

```jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { TuIcono } from "lucide-react";
```

### Paso 2: Estructura básica de la página

```jsx
export default function TuPagina() {
  return (
    <AdminLayout>
      {/* 1. Header */}
      <PageHeader
        icon={TuIcono}
        title="Título"
        subtitle="Descripción"
        actions={<>Botones</>}
      />

      {/* 2. Stats Cards (opcional) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={Icon1} label="Stat 1" value={100} color="blue" />
        <StatCard icon={Icon2} label="Stat 2" value={200} color="green" />
        <StatCard icon={Icon3} label="Stat 3" value={300} color="purple" />
      </div>

      {/* 3. Filtros/Búsqueda (opcional) */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 mb-8">
        {/* Tu buscador aquí */}
      </div>

      {/* 4. Contenido principal */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700">
        {/* Tu contenido aquí */}
      </div>
    </AdminLayout>
  );
}
```

### Paso 3: Input de búsqueda estándar

```jsx
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
  <input
    type="text"
    placeholder="Buscar..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-2 border-slate-200 dark:border-slate-700 
             focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent 
             text-base font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500
             transition-all"
  />
</div>
```

### Paso 4: Botones estándar

```jsx
// Botón primario
<button className="px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 
                   text-white font-bold rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-500/30">
  <Icon className="w-5 h-5" />
  Texto
</button>

// Botón secundario
<button className="px-4 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 
                   text-slate-700 dark:text-slate-200 font-semibold rounded-xl transition-colors flex items-center gap-2">
  <Icon className="w-4 h-4" />
  Texto
</button>
```

## 📊 Ejemplo Completo: Página de Reportes

```jsx
import React, { useState, useEffect } from "react";
import AdminLayout from "../components/layout/AdminLayout";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import { BarChart3, Download, RefreshCw, FileText } from "lucide-react";

export default function ReportesPage() {
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);

  return (
    <AdminLayout>
      <PageHeader
        icon={BarChart3}
        title="Reportes y Análisis"
        subtitle="Visualiza y exporta reportes del sistema"
        actions={
          <>
            <button className="px-5 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-xl flex items-center gap-2">
              <Download className="w-5 h-5" />
              Exportar
            </button>
            <button className="px-4 py-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Actualizar
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard icon={FileText} label="Total Reportes" value={150} color="blue" />
        <StatCard icon={Download} label="Descargados" value={89} color="green" />
        <StatCard icon={BarChart3} label="Pendientes" value={61} color="purple" />
      </div>

      {/* Contenido aquí */}
    </AdminLayout>
  );
}
```

## 🎯 Ventajas del Sistema

1. ✅ **Consistencia Visual** - Mismo diseño en todas las páginas
2. ✅ **Código Reutilizable** - Menos código duplicado
3. ✅ **Fácil Mantenimiento** - Cambios centralizados
4. ✅ **Escalable** - Agregar nuevas páginas es rápido
5. ✅ **Responsive** - Funciona en todos los dispositivos
6. ✅ **Modo Oscuro** - Soporte completo para dark mode
7. ✅ **Tipografía Clara** - Mejor legibilidad
8. ✅ **Accesible** - Alto contraste y semántica correcta

## 🔧 Personalización

### Cambiar colores del PageHeader

```jsx
<PageHeader
  gradient="from-purple-500 to-pink-600"  // Gradiente personalizado
  // ... resto de props
/>
```

### Agregar nuevo color a StatCard

En `/components/ui/StatCard.jsx`, agregar:

```js
const colorClasses = {
  // ...existentes
  amber: {
    bg: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
    // ...resto de clases
  }
};
```

## 📝 Checklist para Nueva Página

- [ ] Importar `AdminLayout`, `PageHeader`, `StatCard`
- [ ] Usar `PageHeader` con ícono y título
- [ ] Agregar StatCards si hay métricas
- [ ] Usar input de búsqueda estándar si aplica
- [ ] Aplicar clases de tipografía consistentes
- [ ] Usar bordes de 2px en cards principales
- [ ] Probar en modo claro y oscuro
- [ ] Verificar responsive en móvil

## 🎓 Buenas Prácticas

1. **Siempre usa AdminLayout** como wrapper principal
2. **Usa font-bold o font-semibold** para títulos
3. **Mantén padding consistente** (p-6 o p-8)
4. **Usa text-base o text-lg** para contenido principal
5. **Aplica dark mode** a todos los elementos
6. **Usa rounded-xl o rounded-2xl** para cards
7. **Mantén gaps consistentes** (gap-3, gap-4, gap-6)
8. **Usa iconos de Lucide React** del mismo tamaño

---

**¡Sistema listo para escalar!** 🚀 Ahora puedes crear nuevas páginas rápidamente usando estos componentes.
