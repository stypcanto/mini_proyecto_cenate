# ⚡ Referencia Rápida - Component Registry

> Guía de 30 segundos para agregar una nueva página

---

## 🎯 3 Pasos para Agregar una Página

### 1️⃣ Crear el Componente

```bash
# Crear archivo en la carpeta correspondiente
frontend/src/pages/[carpeta]/[NombrePagina].jsx
```

```jsx
import React from 'react';

export default function NombrePagina() {
  return (
    <div>
      <h1>Mi Nueva Página</h1>
    </div>
  );
}
```

### 2️⃣ Registrar en componentRegistry.js

Abrir: `/frontend/src/config/componentRegistry.js`

Agregar al final (antes del `};`):

```javascript
  '/ruta/a/tu/pagina': {
    component: lazy(() => import('../pages/[carpeta]/[NombrePagina]')),
    requiredAction: 'ver',
  },
```

### 3️⃣ ¡Listo! 🎉

La página ya está disponible en: `http://localhost:3000/ruta/a/tu/pagina`

---

## 📝 Plantillas Copy-Paste

### Página Administrativa

```javascript
  '/admin/[nombre]': {
    component: lazy(() => import('../pages/admin/[Componente]')),
    requiredAction: 'ver',
  },
```

### Página Solo SUPERADMIN

```javascript
  '/admin/[nombre]': {
    component: lazy(() => import('../pages/admin/[Componente]')),
    requiredAction: 'ver',
    requiredRoles: ['SUPERADMIN'],
  },
```

### Página de Usuario

```javascript
  '/user/[nombre]': {
    component: lazy(() => import('../pages/user/[Componente]')),
    requiredAction: 'ver',
  },
```

### Página de Rol Específico

```javascript
  '/roles/[rol]/[nombre]': {
    component: lazy(() => import('../pages/roles/[rol]/[Componente]')),
    requiredAction: 'ver',
  },
```

### Página Sin Protección

```javascript
  '/[nombre]': {
    component: lazy(() => import('../pages/[Componente]')),
    requiredAction: null,
  },
```

### Página con Parámetros

```javascript
  '/[ruta]/detalle/:id': {
    component: lazy(() => import('../pages/[carpeta]/[Componente]')),
    requiredAction: 'ver',
    pathMatch: '/[ruta]/detalle',
  },
```

---

## 🔧 Propiedades

| Propiedad | Requerido | Valores |
|-----------|-----------|---------|
| `component` | ✅ Sí | `lazy(() => import('...'))` |
| `requiredAction` | ✅ Sí | `'ver'` / `'editar'` / `'crear'` / `null` |
| `requiredRoles` | ⬜ No | `['SUPERADMIN']` / `['ADMIN', 'MEDICO']` |
| `pathMatch` | ⬜ No | `/ruta/sin/parametros` (para rutas con `:id`) |

---

## ⚠️ Errores Comunes

### ❌ Error: Lazy loading no funciona
```javascript
// ❌ INCORRECTO
component: import('../pages/Admin')

// ✅ CORRECTO
component: lazy(() => import('../pages/Admin'))
```

### ❌ Error: Path incorrecto
```javascript
// ❌ INCORRECTO
lazy(() => import('../pages/Admin.jsx'))       // No incluir extensión
lazy(() => import('pages/Admin'))              // Falta ../

// ✅ CORRECTO
lazy(() => import('../pages/Admin'))
```

### ❌ Error: Falta coma
```javascript
// ❌ INCORRECTO
'/admin/users': {
  component: lazy(() => import('../pages/Admin')),
  requiredAction: 'ver'
}  // ← Falta coma aquí
'/admin/logs': {

// ✅ CORRECTO
'/admin/users': {
  component: lazy(() => import('../pages/Admin')),
  requiredAction: 'ver',
},  // ← Coma agregada
'/admin/logs': {
```

---

## 🚀 Después de Agregar la Ruta

1. **Guardar** `componentRegistry.js`
2. **Configurar MBAC** en `/admin/mbac` (si requiere permisos)
3. **Probar** navegando a la ruta en el navegador
4. **Listo** ✅

---

## 📚 Documentación Completa

- **Guía detallada:** `/frontend/COMPONENT_REGISTRY.md`
- **Resumen de implementación:** `/frontend/IMPLEMENTATION_SUMMARY.md`

---

*Última actualización: 2025-12-30 | v1.14.0*
