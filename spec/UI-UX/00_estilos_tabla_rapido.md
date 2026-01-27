# 🎨 Estilos UI/UX - Referencia Rápida de Tablas

> **Resumen ejecutivo** de estilos estándar CENATE para tablas
> Para especificación completa: [`01_design_system_tablas.md`](01_design_system_tablas.md)

---

## 🎯 Header (Encabezado)

```tsx
<thead className="bg-blue-700 text-white sticky top-0">
  <tr>
    <th className="px-4 py-3 text-left text-sm font-bold">Columna 1</th>
    <th className="px-4 py-3 text-left text-sm font-bold">Columna 2</th>
    <th className="px-4 py-3 text-center text-sm font-bold">Acciones</th>
  </tr>
</thead>
```

**Colores:**
- `bg-blue-700` o `bg-[#0D5BA9]` (Azul CENATE)
- `text-white` (Texto blanco)

---

## 📋 Fila (Row)

```tsx
<tbody>
  <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
    <td className="px-4 py-3 text-sm text-gray-900">{data}</td>
    <td className="px-4 py-3 text-sm text-gray-700">{data}</td>
    <td className="px-4 py-3 text-center">
      {/* Botones */}
    </td>
  </tr>
</tbody>
```

**Estilos:**
- `px-4 py-3` - Padding estándar
- `text-sm` - Tamaño de fuente
- `border-b border-gray-200` - Línea divisoria
- `hover:bg-gray-50` - Efecto hover
- `transition-colors` - Animación suave

---

## 🏷️ Badges / Estados

### Estado Completada (Verde)
```tsx
<span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">
  COMPLETADA
</span>
```

### Estado En Proceso (Azul)
```tsx
<span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">
  EN_PROCESO
</span>
```

### Estado Pendiente (Amarillo)
```tsx
<span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">
  PENDIENTE
</span>
```

### Estado Error (Rojo)
```tsx
<span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-700">
  ERROR
</span>
```

---

## 🔘 Botones de Acción

```tsx
<div className="flex justify-center gap-2">
  {/* Ver */}
  <button className="px-2 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded font-semibold transition-colors">
    👁️
  </button>

  {/* Eliminar */}
  <button className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded font-semibold transition-colors">
    🗑️
  </button>
</div>
```

**Colores por acción:**
- `bg-blue-500` → Ver/Editar
- `bg-red-500` → Eliminar
- `bg-green-500` → Guardar/Confirmar

---

## 📊 Estructura Completa de Tabla

```tsx
<div className="overflow-x-auto">
  <table className="w-full border-collapse">
    {/* HEADER */}
    <thead className="bg-blue-700 text-white sticky top-0">
      <tr>
        <th className="px-4 py-3 text-left text-sm font-bold">Columna A</th>
        <th className="px-4 py-3 text-left text-sm font-bold">Columna B</th>
        <th className="px-4 py-3 text-center text-sm font-bold">Acciones</th>
      </tr>
    </thead>

    {/* BODY */}
    <tbody>
      {data.map((item, idx) => (
        <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
          <td className="px-4 py-3 text-sm text-gray-900">{item.columnA}</td>
          <td className="px-4 py-3 text-sm text-gray-700">{item.columnB}</td>
          <td className="px-4 py-3 text-center">
            <div className="flex justify-center gap-2">
              <button>👁️</button>
              <button>🗑️</button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

---

## 🎨 Paleta de Colores Rápida

| Color | Hex | TailwindCSS | Uso |
|-------|-----|-------------|-----|
| Azul CENATE | `#0D5BA9` | `bg-blue-700` | Headers, primario |
| Verde | `#22C55E` | `bg-green-500` | Activos, completado |
| Rojo | `#EF4444` | `bg-red-500` | Eliminar, errores |
| Amarillo | `#FBBF24` | `bg-yellow-400` | Pendiente, alerta |
| Gris Claro | `#F3F4F6` | `bg-gray-50` | Hover filas |
| Gris Borde | `#E5E7EB` | `border-gray-200` | Divisoras |
| Blanco | `#FFFFFF` | `bg-white` | Fondo celdas |

---

## ✅ Checklist Rápido

- [ ] Header azul-700 con texto blanco bold
- [ ] Padding `px-4 py-3` en celdas
- [ ] Efecto hover `hover:bg-gray-50`
- [ ] Border bottom `border-b border-gray-200`
- [ ] Badges con colores cohesivos
- [ ] Botones de acción centrados
- [ ] Transiciones suaves `transition-colors`
- [ ] `text-sm` en filas
- [ ] Overflow para tablas grandes

---

## 🔗 Referencias

- **Documentación Completa:** [`01_design_system_tablas.md`](01_design_system_tablas.md)
- **Componentes Reutilizables:** [`01_design_system_tablas.md#-componentes-reutilizables-react`](01_design_system_tablas.md)
- **Ejemplos Implementados:** [`01_design_system_tablas.md#-caso-de-uso-tabla-de-asegurados-buscaraseguradojsx`](01_design_system_tablas.md)

---

**Versión:** 1.0.0
**Última actualización:** 2026-01-27
**Autor:** Claude Code
**Estado:** ✅ ACTIVO
