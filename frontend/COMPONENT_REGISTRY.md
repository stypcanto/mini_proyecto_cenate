# 📋 Sistema de Registro de Componentes Dinámicos

> **v1.14.0** - Simplifica la creación de nuevas páginas eliminando la necesidad de modificar App.js manualmente

---

## 📖 ¿Qué es el Component Registry?

El **Component Registry** es un sistema que centraliza el registro de rutas y componentes en un solo archivo, permitiendo agregar nuevas páginas al sistema sin tener que:

- ❌ Importar componentes manualmente en App.js
- ❌ Escribir definiciones de rutas repetitivas
- ❌ Gestionar lazy loading manualmente
- ❌ Preocuparse por la protección MBAC de cada ruta

Todo se maneja automáticamente desde un **único archivo de configuración**.

---

## 🎯 Beneficios

| Antes (Manual) | Después (Registry) |
|----------------|-------------------|
| Editar 3 secciones de App.js | Editar 1 línea en componentRegistry.js |
| 500+ líneas de código repetitivo | Generación automática de rutas |
| Importaciones manuales | Lazy loading automático |
| Fácil cometer errores | Patrón consistente |

---

## 🚀 Cómo Agregar una Nueva Página

### Paso 1: Crear el Componente

Crea tu componente en la carpeta correspondiente:

```bash
# Ejemplo: Nueva página de reportes administrativos
frontend/src/pages/admin/ReportesAdmin.jsx
```

```jsx
// ReportesAdmin.jsx
import React from 'react';

export default function ReportesAdmin() {
  return (
    <div>
      <h1>Reportes Administrativos</h1>
      {/* Tu código aquí */}
    </div>
  );
}
```

### Paso 2: Registrar en componentRegistry.js

Abre el archivo `/frontend/src/config/componentRegistry.js` y agrega **una sola entrada**:

```javascript
// componentRegistry.js
import { lazy } from 'react';

export const componentRegistry = {
  // ... otras rutas existentes ...

  // 🆕 TU NUEVA RUTA
  '/admin/reportes': {
    component: lazy(() => import('../pages/admin/ReportesAdmin')),
    requiredAction: 'ver',
  },
};
```

### Paso 3: ¡Listo! 🎉

**No necesitas hacer nada más.** El sistema automáticamente:

✅ Importa el componente usando lazy loading
✅ Genera la ruta en el router
✅ Aplica la protección MBAC
✅ Agrega el loading state

---

## 📝 Estructura de una Entrada del Registry

```javascript
'/ruta/ejemplo': {
  component: lazy(() => import('../pages/carpeta/Componente')),  // REQUERIDO
  requiredAction: 'ver',                                         // REQUERIDO (o null)
  requiredRoles: ['SUPERADMIN'],                                 // OPCIONAL
  pathMatch: '/ruta/ejemplo',                                    // OPCIONAL (ver abajo)
}
```

### Propiedades

| Propiedad | Tipo | Requerido | Descripción | Ejemplo |
|-----------|------|-----------|-------------|---------|
| `component` | Lazy Component | ✅ Sí | Componente lazy-loaded | `lazy(() => import('../pages/Admin'))` |
| `requiredAction` | String \| null | ✅ Sí | Acción MBAC requerida | `'ver'`, `'editar'`, `null` |
| `requiredRoles` | Array<String> | ⬜ No | Roles específicos permitidos | `['SUPERADMIN', 'ADMIN']` |
| `pathMatch` | String | ⬜ No | Path para MBAC (rutas con parámetros) | `'/user/detail'` |

---

## 🔐 Configuraciones de Seguridad

### Ruta con MBAC Estándar

```javascript
'/admin/users': {
  component: lazy(() => import('../pages/user/UsersManagement')),
  requiredAction: 'ver',
}
```

- El usuario debe tener permiso `ver` en la ruta `/admin/users`

### Ruta con Roles Específicos

```javascript
'/admin/mbac': {
  component: lazy(() => import('../pages/admin/MBACControl')),
  requiredAction: 'ver',
  requiredRoles: ['SUPERADMIN'], // ← Solo SUPERADMIN puede acceder
}
```

### Ruta Sin Protección MBAC

```javascript
'/asegurados/buscar': {
  component: lazy(() => import('../pages/asegurados/BuscarAsegurado')),
  requiredAction: null, // ← Sin protección MBAC
}
```

### Rutas con Parámetros Dinámicos

Para rutas como `/user/detail/:id`, usa `pathMatch` para especificar el path sin parámetros:

```javascript
'/user/detail/:id': {
  component: lazy(() => import('../pages/user/UserDetail')),
  requiredAction: 'ver',
  pathMatch: '/user/detail', // ← Para validación MBAC, usa path sin :id
}
```

---

## 📂 Ejemplos Reales del Sistema

### Ejemplo 1: Dashboard Administrativo

```javascript
'/admin/dashboard': {
  component: lazy(() => import('../pages/AdminDashboard')),
  requiredAction: 'ver',
}
```

### Ejemplo 2: Módulo Médico

```javascript
'/roles/medico/pacientes': {
  component: lazy(() => import('../pages/roles/medico/ModuloPacientes')),
  requiredAction: 'ver',
}
```

### Ejemplo 3: Coordinador de Gestión de Citas (Formulario 107)

```javascript
'/roles/coordcitas/107': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
}
```

### Ejemplo 4: Control de Firma Digital

```javascript
'/admin/control-firma-digital': {
  component: lazy(() => import('../pages/admin/ControlFirmaDigital')),
  requiredAction: 'ver',
}
```

### Ejemplo 5: Configuración de Feriados (Coordinador)

```javascript
'/roles/coordinador/configuracion-feriados': {
  component: lazy(() => import('../pages/roles/coordinador/ConfiguracionFeriados')),
  requiredAction: 'ver',
}
```

---

## 🔍 Funciones Helper Disponibles

El archivo `componentRegistry.js` exporta funciones útiles:

### getRouteConfig(path)

Obtiene la configuración de una ruta:

```javascript
import { getRouteConfig } from './config/componentRegistry';

const config = getRouteConfig('/admin/users');
console.log(config);
// {
//   component: lazy(...),
//   requiredAction: 'ver'
// }
```

### getAllRoutes()

Obtiene todas las rutas registradas:

```javascript
import { getAllRoutes } from './config/componentRegistry';

const routes = getAllRoutes();
console.log(routes);
// ['/admin/dashboard', '/admin/users', ...]
```

### isRouteRegistered(path)

Verifica si una ruta está registrada:

```javascript
import { isRouteRegistered } from './config/componentRegistry';

if (isRouteRegistered('/admin/nueva-pagina')) {
  console.log('Ruta existe');
}
```

---

## ⚙️ Cómo Funciona Internamente

```
Usuario accede a /admin/users
         ↓
App.js genera rutas dinámicamente desde componentRegistry
         ↓
React Router detecta la ruta
         ↓
Suspense muestra LoadingFallback mientras carga
         ↓
Lazy loading importa el componente
         ↓
ProtectedRoute valida permisos MBAC
         ↓
Si tiene permisos: Renderiza componente
Si NO tiene permisos: Redirige a /unauthorized
```

### Código de App.js (simplificado)

```javascript
{Object.entries(componentRegistry).map(([path, config]) => {
  const Component = config.component;
  const requiredPath = config.pathMatch || path;
  const requiredAction = config.requiredAction;
  const requiredRoles = config.requiredRoles;

  return (
    <Route
      key={path}
      path={path}
      element={
        <Suspense fallback={<LoadingFallback />}>
          {requiredAction ? (
            <ProtectedRoute
              requiredPath={requiredPath}
              requiredAction={requiredAction}
              requiredRoles={requiredRoles}
            >
              <Component />
            </ProtectedRoute>
          ) : (
            <Component />
          )}
        </Suspense>
      }
    />
  );
})}
```

---

## 🎨 Loading State

Cuando una página se está cargando, se muestra automáticamente:

```javascript
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Cargando módulo...</p>
      </div>
    </div>
  );
}
```

---

## 📋 Checklist para Agregar una Nueva Página

- [ ] 1. Crear el componente en la carpeta correcta
- [ ] 2. Abrir `/frontend/src/config/componentRegistry.js`
- [ ] 3. Agregar una entrada con:
  - [ ] Path de la ruta
  - [ ] Lazy import del componente
  - [ ] `requiredAction` (o `null` si no tiene MBAC)
  - [ ] (Opcional) `requiredRoles` si es solo para ciertos roles
  - [ ] (Opcional) `pathMatch` si tiene parámetros dinámicos
- [ ] 4. Guardar el archivo
- [ ] 5. Configurar permisos MBAC en la base de datos (si aplica)
- [ ] 6. Probar la ruta en el navegador

---

## 🚨 Troubleshooting

### Error: "Cannot read property 'component' of undefined"

**Causa:** La ruta no está registrada en componentRegistry.js

**Solución:** Verificar que agregaste la entrada correctamente en el registry.

### Error: "Element type is invalid"

**Causa:** El path del lazy import es incorrecto

**Solución:** Verificar que la ruta del componente sea correcta:
```javascript
// ✅ CORRECTO
lazy(() => import('../pages/admin/MiComponente'))

// ❌ INCORRECTO
lazy(() => import('../pages/admin/MiComponente.jsx')) // No incluir extensión
lazy(() => import('pages/admin/MiComponente'))        // Falta ../
```

### La página carga pero redirige a /unauthorized

**Causa:** Faltan permisos MBAC en la base de datos

**Solución:**
1. Ir a `/admin/mbac` (como SUPERADMIN)
2. Agregar la página en la tabla de permisos
3. Asignar permisos a los roles correspondientes

### El lazy loading no funciona

**Causa:** No estás usando `lazy()` correctamente

**Solución:**
```javascript
import { lazy } from 'react';

// ✅ CORRECTO
component: lazy(() => import('../pages/Admin'))

// ❌ INCORRECTO
component: import('../pages/Admin')  // Falta lazy()
```

---

## 📚 Archivos Relacionados

| Archivo | Descripción |
|---------|-------------|
| `/frontend/src/config/componentRegistry.js` | Registro centralizado de componentes |
| `/frontend/src/App.js` | Genera rutas dinámicamente desde el registry |
| `/frontend/src/components/security/ProtectedRoute.jsx` | Valida permisos MBAC |
| `/frontend/COMPONENT_REGISTRY.md` | Esta documentación |

---

## 🎓 Comparación: Antes vs Después

### ❌ Antes (Manual)

```javascript
// App.js - 3 pasos manuales

// 1. Import manual
import ReportesAdmin from "./pages/admin/ReportesAdmin";

// 2. Definición de ruta manual (líneas 200-250)
<Route
  path="/admin/reportes"
  element={
    <ProtectedRoute requiredPath="/admin/reportes" requiredAction="ver">
      <ReportesAdmin />
    </ProtectedRoute>
  }
/>

// 3. Sin lazy loading automático
```

**Total:** ~10 líneas de código, 3 secciones a modificar, sin optimización

---

### ✅ Después (Registry)

```javascript
// componentRegistry.js - 1 paso simple

'/admin/reportes': {
  component: lazy(() => import('../pages/admin/ReportesAdmin')),
  requiredAction: 'ver',
}
```

**Total:** 3 líneas de código, 1 archivo a modificar, lazy loading automático

---

## 🔮 Próximas Mejoras

- [ ] Validación automática de rutas duplicadas
- [ ] Generación automática de breadcrumbs
- [ ] Soporte para metadata (títulos, descripciones)
- [ ] Integración con analytics

---

## 👨‍💻 Desarrollado por

**Ing. Styp Canto Rondon**
EsSalud Perú - CENATE
Sistema de Telemedicina

---

*Última actualización: 2025-12-30 | v1.14.0*
