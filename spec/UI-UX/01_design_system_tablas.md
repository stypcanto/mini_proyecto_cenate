# Design System - Tablas de Datos CENATE

> Guía de estilos y colores para tablas profesionales reutilizable en todo el proyecto

**Versión**: 1.0.0
**Última actualización**: 2026-01-22
**Componentes base**: TailwindCSS 3.4.18 + React 19

---

## 📊 Tabla Profesional - Estructura Completa

### 1. Header de Tabla

#### Estilos:
```css
/* Contenedor Header */
- Background: #0D5BA9 (Azul CENATE primario)
- Color texto: #FFFFFF (Blanco)
- Padding: px-6 py-4
- Border radius: rounded-t-lg
- Font weight: font-bold
- Font size: text-sm uppercase tracking-wider
- Box shadow: shadow-md
- Altura mínima: h-16

/* Estructura Tailwind */
className="bg-[#0D5BA9] text-white px-6 py-4 rounded-t-lg shadow-md"
```

#### Ejemplo HTML:
```html
<thead className="bg-[#0D5BA9] text-white">
  <tr className="border-b-2 border-blue-800">
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Usuario</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Nombre Completo</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Documento</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Rol</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Tipo</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">IPRESS</th>
    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider">Estado</th>
    <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-wider">Acción</th>
  </tr>
</thead>
```

---

### 2. Filas de Tabla

#### Estilos Base:
```css
/* Fila Normal */
- Background: #FFFFFF (Blanco)
- Altura: h-16
- Border bottom: border-b border-gray-200
- Padding: px-6 py-4
- Font size: text-sm
- Color texto: #1F2937 (Gris oscuro)

/* Fila Hover */
- Background on hover: #F3F4F6 (Gris muy claro)
- Transition: transition-colors duration-200
- Cursor: cursor-pointer (si es clickeable)

/* Fila Alternada (Zebra striping) - Opcional */
- nth-child(even): bg-gray-50
- nth-child(odd): bg-white
```

#### Ejemplo HTML:
```html
<tbody>
  <tr className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
    <td className="px-6 py-4 text-sm text-gray-900">
      <!-- Contenido -->
    </td>
  </tr>
</tbody>
```

---

### 3. Componentes Específicos

#### 3.1 Avatar con Número (Círculo de Color)

```css
/* Contenedor Avatar */
- Width: w-10 h-10
- Border radius: rounded-full
- Display: flex items-center justify-center
- Font weight: font-bold
- Font size: text-xs
- Color texto: #FFFFFF (Blanco)

/* Colores por tipo (Rotatorio) */
- Naranja: bg-orange-500 (#F97316)
- Verde: bg-green-500 (#22C55E)
- Púrpura: bg-purple-500 (#A855F7)
- Azul: bg-blue-500 (#3B82F6)
- Rojo: bg-red-500 (#EF4444)
```

#### Ejemplo React:
```jsx
const getAvatarColor = (index) => {
  const colors = [
    'bg-orange-500',   // Naranja
    'bg-green-500',    // Verde
    'bg-purple-500',   // Púrpura
    'bg-blue-500',     // Azul
    'bg-red-500'       // Rojo
  ];
  return colors[index % colors.length];
};

<div className={`${getAvatarColor(rowIndex)} rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xs`}>
  {numero}
</div>
```

---

#### 3.2 Badges / Pills (Etiquetas)

##### Tipo 1: Rol / Categoría (Azul claro)
```css
- Background: #DBEAFE (Azul muy claro)
- Color texto: #0C63E4 (Azul oscuro)
- Border: border border-blue-300
- Padding: px-3 py-1
- Border radius: rounded-md
- Font size: text-xs
- Font weight: font-semibold
```

```jsx
<span className="bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-md text-xs font-semibold">
  SUPERADMIN
</span>
```

##### Tipo 2: Estado Interno (Verde con ícono)
```css
- Background: #DCFCE7 (Verde muy claro)
- Color texto: #166534 (Verde oscuro)
- Border: border border-green-300
- Icon: ✓ (checkmark verde)
- Padding: px-2 py-1
- Border radius: rounded-md
- Font size: text-xs
```

```jsx
<span className="bg-green-100 text-green-800 border border-green-300 px-2 py-1 rounded-md text-xs flex items-center gap-1">
  <CheckCircle2 size={14} />
  INTERNO
</span>
```

##### Tipo 3: Estado Externo (Naranja con ícono)
```css
- Background: #FEDBA9 (Naranja claro)
- Color texto: #92400E (Naranja oscuro)
- Icon: ⊕ (círculo)
- Similar estructura a Interno
```

```jsx
<span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-md text-xs flex items-center gap-1">
  <AlertCircle size={14} />
  EXTERNO
</span>
```

---

#### 3.3 Toggle Switch (Interruptor Estado)

```css
/* Toggle Activo (Verde) */
- Background: bg-green-500 (#22C55E)
- Width: w-12
- Height: h-6
- Border radius: rounded-full
- Shadow: shadow-md
- Transición: transition-all duration-300

/* Toggle Inactivo (Gris) */
- Background: bg-gray-400 (#9CA3AF)
- Mismas dimensiones
```

```jsx
<button
  className={`
    relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300
    ${estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-400'}
  `}
>
  <span
    className={`
      inline-block h-5 w-5 transform rounded-full bg-white transition-transform
      ${estado === 'ACTIVO' ? 'translate-x-6' : 'translate-x-1'}
    `}
  />
</button>
```

---

#### 3.4 Botones de Acción (Iconos)

```css
/* Botones Individuales */
- Background: transparent (sin fondo por defecto)
- Hover: bg-gray-100
- Padding: p-2
- Border radius: rounded-md
- Transición: transition-colors duration-200
- Color: text-gray-700
- Tamaño ícono: 18-20px

/* Grupo de Botones */
- Display: flex gap-2
- Alineación: items-center justify-center
```

```jsx
<div className="flex items-center justify-center gap-2">
  {/* Ver / Abrir */}
  <button
    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
    title="Ver detalles"
  >
    <Eye size={18} />
  </button>

  {/* Editar */}
  <button
    className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-700"
    title="Editar"
  >
    <Pencil size={18} />
  </button>

  {/* Eliminar */}
  <button
    className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600"
    title="Eliminar"
  >
    <Trash2 size={18} />
  </button>
</div>
```

---

### 4. Checkbox (Selección)

```css
- Width: w-5 h-5
- Border: border-2 border-gray-300
- Border radius: rounded
- Checked: bg-blue-600 border-blue-600
- Transition: transition-colors
- Cursor: cursor-pointer
```

```jsx
<input
  type="checkbox"
  className="w-5 h-5 border-2 border-gray-300 rounded checked:bg-blue-600 checked:border-blue-600 transition-colors cursor-pointer"
/>
```

---

### 5. Texto Truncado (Para columnas largas)

```css
- Ancho máximo: max-w-xs
- Overflow: truncate
- Tooltip on hover (opcional)
```

```jsx
<td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title="Texto completo">
  CENTRO NACIONAL DE TELEMEDICINA...
</td>
```

---

## 🎨 Paleta de Colores

### Colores Primarios

| Nombre | Valor Hex | RGB | Uso |
|--------|-----------|-----|-----|
| **Azul CENATE** | `#0D5BA9` | (13, 91, 169) | Headers, botones primarios |
| **Azul Oscuro** | `#084a8a` | (8, 74, 138) | Hover azul, estados |
| **Blanco** | `#FFFFFF` | (255, 255, 255) | Fondos, texto sobre azul |

### Colores Secundarios

| Nombre | Valor Hex | Tailwind | Uso |
|--------|-----------|----------|-----|
| **Verde** | `#22C55E` | `green-500` | Estados activos, checks |
| **Naranja** | `#F97316` | `orange-500` | Avatares, alertas |
| **Púrpura** | `#A855F7` | `purple-500` | Avatares alternos |
| **Azul claro** | `#3B82F6` | `blue-500` | Avatares alternos |
| **Rojo** | `#EF4444` | `red-500` | Botones eliminar, errores |

### Colores Neutros

| Nombre | Valor Hex | Tailwind | Uso |
|--------|-----------|----------|-----|
| **Gris 50** | `#F9FAFB` | `gray-50` | Fondos claros, zebra |
| **Gris 100** | `#F3F4F6` | `gray-100` | Hover filas, fondo input |
| **Gris 200** | `#E5E7EB` | `gray-200` | Borders tablas |
| **Gris 400** | `#9CA3AF` | `gray-400` | Toggle inactivo |
| **Gris 700** | `#374151` | `gray-700` | Texto secundario |
| **Gris 900** | `#111827` | `gray-900` | Texto principal |

---

## 📐 Espaciado (Padding/Margin)

```css
/* Tabla Standard */
- Header padding: px-6 py-4
- Row padding: px-6 py-4
- Gap entre columnas: gap-2 (en flexbox)
- Gap entre acciones: gap-2

/* Componentes */
- Badge padding: px-3 py-1 (texto) | px-2 py-1 (con ícono)
- Botón padding: p-2
```

---

## 🔤 Tipografía

```css
/* Headers */
- Font size: text-xs
- Font weight: font-bold
- Letter spacing: tracking-wider
- Text transform: uppercase

/* Texto de fila */
- Font size: text-sm
- Font weight: font-normal
- Color: text-gray-900

/* Texto secundario */
- Font size: text-xs
- Color: text-gray-600
```

---

## 🎯 Estados Interactivos

### Hover
```css
- Fila: hover:bg-gray-50
- Botón: hover:bg-gray-100
- Transición: transition-colors duration-200
```

### Active/Focused
```css
- Checkbox checked: checked:bg-blue-600
- Toggle ON: bg-green-500
- Botón activo: bg-blue-100
```

### Disabled (Opcional)
```css
- Opacity: opacity-50
- Cursor: cursor-not-allowed
- Color: text-gray-400
```

---

## 📦 Componentes Reutilizables (React)

### Avatar Badge
```jsx
const AvatarBadge = ({ number, index }) => {
  const colors = ['bg-orange-500', 'bg-green-500', 'bg-purple-500', 'bg-blue-500', 'bg-red-500'];
  const bgColor = colors[index % colors.length];

  return (
    <div className={`${bgColor} rounded-full w-10 h-10 flex items-center justify-center text-white font-bold text-xs`}>
      {number}
    </div>
  );
};
```

### Status Badge
```jsx
const StatusBadge = ({ tipo, estado }) => {
  const configs = {
    'INTERNO': { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300', icon: '✓' },
    'EXTERNO': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: '⊕' }
  };

  const config = configs[tipo];
  return (
    <span className={`${config.bg} ${config.text} border ${config.border} px-2 py-1 rounded-md text-xs flex items-center gap-1`}>
      {config.icon} {tipo}
    </span>
  );
};
```

### Role Badge
```jsx
const RoleBadge = ({ rol }) => {
  return (
    <span className="bg-blue-100 text-blue-700 border border-blue-300 px-3 py-1 rounded-md text-xs font-semibold">
      {rol}
    </span>
  );
};
```

### Toggle Switch
```jsx
const ToggleSwitch = ({ estado, onChange }) => {
  return (
    <button
      onClick={onChange}
      className={`
        relative inline-flex h-6 w-12 items-center rounded-full transition-all duration-300
        ${estado === 'ACTIVO' ? 'bg-green-500' : 'bg-gray-400'}
      `}
    >
      <span
        className={`
          inline-block h-5 w-5 transform rounded-full bg-white transition-transform
          ${estado === 'ACTIVO' ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  );
};
```

---

## 🎨 Ejemplo Completo - Fila de Tabla

```jsx
<tr className="h-16 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
  {/* Checkbox */}
  <td className="px-6 py-4">
    <input type="checkbox" className="w-5 h-5 border-2 border-gray-300 rounded" />
  </td>

  {/* Avatar */}
  <td className="px-6 py-4">
    <AvatarBadge number={4} index={0} />
  </td>

  {/* Usuario */}
  <td className="px-6 py-4 text-sm text-gray-900">@44914706</td>

  {/* Nombre Completo */}
  <td className="px-6 py-4 text-sm text-gray-900">
    <div>Styp Canto</div>
    <div className="text-xs text-gray-600">Rondón</div>
  </td>

  {/* Documento */}
  <td className="px-6 py-4 text-sm text-gray-900">DNI 44914706</td>

  {/* Rol */}
  <td className="px-6 py-4">
    <RoleBadge rol="SUPERADMIN" />
  </td>

  {/* Tipo */}
  <td className="px-6 py-4">
    <StatusBadge tipo="INTERNO" />
  </td>

  {/* IPRESS */}
  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
    CENTRO NACIONAL DE TELEMEDICINA...
  </td>

  {/* Estado */}
  <td className="px-6 py-4">
    <ToggleSwitch estado="ACTIVO" onChange={() => {}} />
  </td>

  {/* Acciones */}
  <td className="px-6 py-4">
    <div className="flex items-center justify-center gap-2">
      <button className="p-2 hover:bg-gray-100 rounded-md transition-colors"><Eye size={18} /></button>
      <button className="p-2 hover:bg-gray-100 rounded-md transition-colors"><Pencil size={18} /></button>
      <button className="p-2 hover:bg-red-100 rounded-md transition-colors text-red-600"><Trash2 size={18} /></button>
    </div>
  </td>
</tr>
```

---

## 🚀 Implementación Recomendada

### En nuevos componentes de tabla:
1. Copiar estructura del header con colores primarios
2. Aplicar padding estándar (px-6 py-4)
3. Usar componentes reutilizables para badges
4. Agregar hover effects en filas
5. Mantener consistencia en tipografía

### Variables CSS útiles (Tailwind):
```javascript
// tailwind.config.js
colors: {
  cenate: {
    primary: '#0D5BA9',
    dark: '#084a8a',
  }
}
```

---

## 📋 Checklist de Diseño para nuevas Tablas

- [ ] Header azul CENATE (#0D5BA9) con texto blanco bold uppercase
- [ ] Filas con border-bottom gris-200
- [ ] Hover effect gris-50 con transición suave
- [ ] Avatares con colores rotativos (naranja, verde, púrpura, azul, rojo)
- [ ] Badges con colores cohesivos (azul para roles, verde/naranja para estados)
- [ ] Toggles verdes para estados activos
- [ ] Botones de acción con hover gris-100
- [ ] Texto truncado para columnas largas
- [ ] Consistencia de padding (px-6 py-4)
- [ ] Accesibilidad: aria-labels en botones

---

**Documento creado por**: Claude Code
**Versión**: 1.0.0
**Última actualización**: 2026-01-22
**Estado**: ACTIVO ✅
