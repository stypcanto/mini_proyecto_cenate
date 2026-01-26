# 🚀 Guía Rápida: Cómo Agregar Nuevas Páginas

> **Recordatorio para el futuro** - Proceso simplificado v1.14.0

---

## ⚡ Solo 3 Pasos

### 1️⃣ Crear el Componente

```bash
frontend/src/pages/[carpeta]/TuPagina.jsx
```

```jsx
import React from 'react';

export default function TuPagina() {
  return (
    <div>
      <h1>Mi Página</h1>
    </div>
  );
}
```

---

### 2️⃣ Editar componentRegistry.js

**Archivo:** `/frontend/src/config/componentRegistry.js`

**Ir al final** (antes del `};`) y agregar:

```javascript
  '/tu/ruta': {
    component: lazy(() => import('../pages/[carpeta]/TuPagina')),
    requiredAction: 'ver',
  },
};
```

---

### 3️⃣ ¡Listo! ✅

La ruta ya está disponible automáticamente.

---

## 📝 Plantillas

### Administrativa
```javascript
'/admin/nombre': {
  component: lazy(() => import('../pages/admin/Componente')),
  requiredAction: 'ver',
},
```

### Solo SUPERADMIN
```javascript
'/admin/nombre': {
  component: lazy(() => import('../pages/admin/Componente')),
  requiredAction: 'ver',
  requiredRoles: ['SUPERADMIN'],
},
```

### Módulo de Rol
```javascript
'/roles/medico/nombre': {
  component: lazy(() => import('../pages/roles/medico/Componente')),
  requiredAction: 'ver',
},
```

### Sin MBAC
```javascript
'/nombre': {
  component: lazy(() => import('../pages/Componente')),
  requiredAction: null,
},
```

### Con Parámetros
```javascript
'/detalle/:id': {
  component: lazy(() => import('../pages/Componente')),
  requiredAction: 'ver',
  pathMatch: '/detalle',
},
```

---

## ⚠️ NO Olvidar

1. ❌ NO incluir `.jsx` en el import
2. ❌ NO olvidar `lazy(() => ...)`
3. ❌ NO olvidar la **coma** al final
4. ✅ Usar `../` para rutas relativas

---

## 📚 Más Info

- **Guía completa:** `frontend/COMPONENT_REGISTRY.md`
- **Referencia rápida:** `frontend/QUICK_REFERENCE.md`
- **README.md:** Sección "Cómo Agregar Nuevas Páginas"

---

*Última actualización: 2025-12-30 | v1.14.0*
