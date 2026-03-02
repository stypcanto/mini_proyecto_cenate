# Guía: Cómo Crear una Nueva Página en el Sistema CENATE

> **Sistema de Telemedicina — EsSalud Perú**
> **Última actualización:** 2026-03-02

---

## Resumen

El sistema CENATE utiliza **3 capas** para registrar y mostrar páginas:

1. **Base de Datos (MBAC)** — Registra módulos, páginas y permisos por rol
2. **Frontend (`componentRegistry.js`)** — Registra la ruta y el componente React
3. **Sidebar dinámico** — Se construye automáticamente desde la BD al hacer login

**No es necesario modificar** `App.js`, `DynamicSidebar.jsx`, `ProtectedRoute.jsx` ni `PermisosContext.jsx`.

---

## Flujo Visual

```
┌─────────────────────────────────────────────────────────────┐
│  1. Crear componente JSX en frontend/src/pages/             │
│     └─ MiNuevaPagina.jsx                                    │
│                                                             │
│  2. Registrar en componentRegistry.js                       │
│     └─ path + lazy import + requiredAction                  │
│                                                             │
│  3. INSERT en dim_modulos_sistema (si módulo nuevo)         │
│                                                             │
│  4. INSERT en dim_paginas_modulo                            │
│     └─ ruta_pagina DEBE coincidir con componentRegistry     │
│                                                             │
│  5. INSERT en segu_permisos_rol_pagina (por cada rol)       │
└─────────────────────────────────────────────────────────────┘

    El sidebar se construye automáticamente:
    Login → GET /api/menu-usuario/usuario/{id} → DynamicSidebar
```

---

## Paso 1 — Crear el componente React

Crea tu archivo `.jsx` dentro de `frontend/src/pages/` siguiendo la estructura de carpetas por módulo.

**Ubicación:** `frontend/src/pages/<modulo>/MiNuevaPagina.jsx`

```jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

export default function MiNuevaPagina() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800">Mi Nueva Página</h1>
      <p className="mt-2 text-slate-600">Hola, {user?.nombre}</p>
      {/* Tu contenido aquí */}
    </div>
  );
}
```

---

## Paso 2 — Registrar en `componentRegistry.js`

**Archivo:** `frontend/src/config/componentRegistry.js`

Este es el archivo central de rutas. Las rutas se generan **automáticamente** desde aquí — nunca se edita `App.js`.

```js
// Agregar dentro del objeto componentRegistry:
'/mi-modulo/mi-pagina': {
  component: lazy(() => import('../pages/mimodulo/MiNuevaPagina')),
  requiredAction: 'ver',
  // requiredRoles: ['SUPERADMIN', 'ADMIN'],  // Opcional: restringir a roles
  // pathMatch: '/mi-modulo/mi-pagina',       // Solo si la ruta tiene :params
},
```

### Propiedades disponibles

| Propiedad        | Tipo       | Obligatorio | Descripción                                                         |
|------------------|------------|-------------|---------------------------------------------------------------------|
| `component`      | `lazy()`   | ✅          | Componente con `lazy()` para code-splitting                         |
| `requiredAction` | `string`   | ✅          | Acción MBAC: `'ver'`, `'crear'`, `'editar'`. Usar `null` sin MBAC  |
| `requiredRoles`  | `string[]` | ❌          | Array de roles que pueden acceder (filtro adicional)                |
| `pathMatch`      | `string`   | ❌          | Path sin parámetros para MBAC (ej: `/user/detail` si ruta es `/user/detail/:id`) |

---

## Paso 3 — Registrar el módulo en la BD (solo si es módulo nuevo)

> **Si tu página pertenece a un módulo que ya existe, salta al Paso 4.**

```sql
INSERT INTO dim_modulos_sistema (
    nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at
)
VALUES (
    'Mi Nuevo Módulo',
    'Descripción del módulo',
    'FileText',       -- Nombre del icono Lucide (ver lista abajo)
    15,               -- Orden en el sidebar
    true,
    NOW(), NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    activo = true,
    updated_at = NOW();
```

### Íconos disponibles (Lucide)

Los íconos están mapeados en `frontend/src/components/DynamicSidebar.jsx` (`iconMap`):

| Icono            | Uso sugerido            | Icono            | Uso sugerido             |
|------------------|-------------------------|------------------|--------------------------|
| `Settings`       | Configuración           | `Users`          | Gestión de usuarios      |
| `Stethoscope`    | Médico / Salud          | `Hospital`       | IPRESS / Instituciones   |
| `BarChart3`      | Estadísticas            | `Calendar`       | Agenda / Citas           |
| `FileText`       | Documentos / General    | `Network`        | Redes                    |
| `HeartPulse`     | Cardiología / ECG       | `Shield`         | Seguridad                |
| `ClipboardList`  | Listados / Formularios  | `UserCog`        | Coordinadores            |
| `Search`         | Búsqueda                | `Package`        | Bolsas                   |
| `Headphones`     | Mesa de Ayuda           | `Bot`            | Chatbot                  |
| `MapPin`         | Territorial             | `Pill`           | Farmacia                 |
| `TrendingUp`     | Producción / Reportes   | `Eye`            | Visualización            |
| `Upload`         | Carga de archivos       | `Download`       | Descargas / Exportar     |
| `AlertTriangle`  | Alertas / Dengue        | `Briefcase`      | Profesional              |

---

## Paso 4 — Registrar la página en la BD

```sql
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at
)
SELECT
    id_modulo,
    'Mi Nueva Página',                    -- Nombre visible en el sidebar
    '/mi-modulo/mi-pagina',               -- ⚠️ DEBE coincidir con componentRegistry
    'Descripción de la página',
    1,                                     -- Orden dentro del módulo
    true,
    NOW(), NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Mi Nuevo Módulo'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    activo = true,
    updated_at = NOW();
```

> **Importante:** La `ruta_pagina` debe ser **idéntica** a la key usada en `componentRegistry.js`.

---

## Paso 5 — Asignar permisos MBAC por rol

```sql
-- Ejemplo: dar permisos al rol SUPERADMIN
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,    -- puede_ver
    true,    -- puede_crear
    true,    -- puede_editar
    true,    -- puede_eliminar
    true,    -- puede_exportar
    false,   -- puede_importar
    false,   -- puede_aprobar
    true,
    NOW(), NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'SUPERADMIN'
  AND p.ruta_pagina = '/mi-modulo/mi-pagina'
  AND NOT EXISTS (
    SELECT 1 FROM segu_permisos_rol_pagina
    WHERE id_rol = r.id_rol AND id_pagina = p.id_pagina
  );
```

Repetir este `INSERT` para **cada rol** que necesite acceso, ajustando los booleanos:

| Rol ejemplo         | `puede_ver` | `puede_crear` | `puede_editar` | `puede_eliminar` | `puede_exportar` |
|----------------------|-------------|----------------|-----------------|-------------------|-------------------|
| `SUPERADMIN`         | ✅          | ✅             | ✅              | ✅                | ✅                |
| `ADMIN`              | ✅          | ✅             | ✅              | ❌                | ✅                |
| `COORDINADOR`        | ✅          | ✅             | ✅              | ❌                | ✅                |
| `MEDICO`             | ✅          | ❌             | ❌              | ❌                | ❌                |
| `EXTERNO`            | ✅          | ❌             | ❌              | ❌                | ❌                |

---

## Bonus — Control granular dentro de la página

Usa `PermissionGate` para mostrar/ocultar elementos según permisos:

```jsx
import { PermissionGate } from '../components/security/ProtectedRoute';

// Solo muestra el botón si el usuario tiene permiso "crear"
<PermissionGate path="/mi-modulo/mi-pagina" action="crear">
  <button className="bg-blue-600 text-white px-4 py-2 rounded">
    Crear Nuevo Registro
  </button>
</PermissionGate>
```

### Hooks de permisos disponibles

| Hook                         | Uso                                                        |
|------------------------------|------------------------------------------------------------|
| `usePermisos()`              | Contexto completo: `tienePermiso(ruta, accion)`, `puedeAcceder(ruta)` |
| `usePermisosRuta(ruta)`      | Retorna los 6 permisos booleanos de una ruta específica    |
| `useCanPerform(ruta, accion)`| Retorna `{ puede: bool }` para una acción puntual          |
| `usePermissions(userId)`     | Hook de bajo nivel que obtiene datos crudos del API         |

---

## Archivos que NO se modifican

| Archivo                                              | Razón                                                   |
|------------------------------------------------------|---------------------------------------------------------|
| `frontend/src/App.js`                                | Las rutas se generan automáticamente desde `componentRegistry` |
| `frontend/src/components/DynamicSidebar.jsx`         | El sidebar lee dinámicamente desde la BD vía API        |
| `frontend/src/components/security/ProtectedRoute.jsx`| La protección es automática según `requiredAction`      |
| `frontend/src/context/PermisosContext.jsx`           | Carga permisos en login y valida automáticamente        |

---

## Archivos de referencia (ejemplos reales)

| Archivo SQL                                            | Qué hace                                    |
|--------------------------------------------------------|---------------------------------------------|
| `spec/sh/004_modulo_solicitud_turnos.sql`              | Crear módulo + página + permisos completos  |
| `spec/sh/046_registrar_pagina_periodo_disponibilidad.sql` | Agregar página a módulo existente        |
| `sql/agregar_gestion_redes.sql`                        | Ejemplo con esquema legacy                  |

| Archivo Frontend                                       | Qué hace                                    |
|--------------------------------------------------------|---------------------------------------------|
| `frontend/src/config/componentRegistry.js`             | Registro central de todas las rutas         |
| `frontend/src/pages/common/Bienvenida.jsx`             | Ejemplo de página simple                    |
| `frontend/src/pages/roles/medico/BienvenidaMedico.jsx` | Ejemplo de página por rol                   |

---

## API relacionada

| Método | Endpoint                                | Descripción                                  |
|--------|-----------------------------------------|----------------------------------------------|
| `GET`  | `/api/menu-usuario/usuario/{idUser}`    | Carga menú dinámico (módulos + páginas + permisos) |

Este endpoint es llamado automáticamente por `PermisosContext` al hacer login, y alimenta el `DynamicSidebar`.
