# Corrección Arquitectónica - Módulo 107 Integración en Bolsas de Pacientes

> **Status:** 🚨 CRITICAL ARCHITECTURAL CHANGE REQUIRED
>
> **Fecha:** 2026-01-29
> **Versión:** 3.0.0 → 3.0.1 (Refactoring)
> **Prioridad:** BLOCKER

---

## 🎯 Problema Identificado

El Módulo 107 está siendo implementado como un **módulo independiente**, pero según la arquitectura del proyecto, **DEBE ESTAR DENTRO de "Bolsas de Pacientes"** como un conjunto de páginas, similar a cómo está estructurado Dengue.

### Estado Actual (INCORRECTO) ❌
```
Sistema CENATE
├── Bolsas de Pacientes
│   ├── Cargar desde Excel
│   ├── Solicitudes
│   ├── Estadísticas de Bolsas
│   ├── Historial de Bolsas
│   ├── Errores de Importación
│   └── Dengue (6 páginas)
│       ├── Dashboard
│       ├── Buscar
│       ├── Resultados
│       ├── Cargar Excel
│       └── Listar Casos
│
├── Módulo 107 ❌ DEBERÍA NO EXISTIR AQUÍ
│   ├── Cargar Excel
│   ├── Historial
│   ├── Listado
│   ├── Búsqueda
│   └── Estadísticas
```

### Estado Deseado (CORRECTO) ✅
```
Sistema CENATE
├── Bolsas de Pacientes (Módulo Principal)
│   ├── Cargar desde Excel
│   ├── Solicitudes
│   ├── Estadísticas de Bolsas
│   ├── Historial de Bolsas
│   ├── Errores de Importación
│   ├── Dengue (6 páginas)
│   │   ├── Dashboard
│   │   ├── Buscar
│   │   ├── Resultados
│   │   ├── Cargar Excel
│   │   └── Listar Casos
│   │
│   └── Módulo 107 ✅ DENTRO DE BOLSAS
│       ├── Dashboard
│       ├── Cargar Excel
│       ├── Listado
│       ├── Búsqueda
│       └── Estadísticas
```

---

## 🔧 Cambios Requeridos

### 1. Base de Datos - Registrar Páginas en dim_paginas_modulo

**Archivo:** `backend/src/main/resources/db/migration/V3_3_1__registrar_modulo_107_en_bolsas_pacientes.sql`

```sql
-- ============================================================
-- V3_3_1__registrar_modulo_107_en_bolsas_pacientes.sql
-- Registrar Módulo 107 como subgrupo de Bolsas de Pacientes
-- Fecha: 2026-01-29
-- ============================================================

-- Obtener ID del módulo "Bolsas de Pacientes"
WITH bolsas_module AS (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Bolsas de Pacientes'
  LIMIT 1
)

-- Insertar las 5 páginas del Módulo 107
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, icono, orden, activo)
SELECT
  bm.id_modulo,
  pagina.nombre_pagina,
  pagina.ruta_pagina,
  pagina.icono,
  pagina.orden,
  true
FROM bolsas_module bm,
LATERAL (
  VALUES
    ('Módulo 107 Dashboard', '/bolsas/modulo107/dashboard', 'FileSpreadsheet', 7),
    ('Cargar Excel', '/bolsas/modulo107/cargar-excel', 'Upload', 8),
    ('Listado', '/bolsas/modulo107/listado', 'List', 9),
    ('Búsqueda', '/bolsas/modulo107/buscar', 'Search', 10),
    ('Estadísticas', '/bolsas/modulo107/estadisticas', 'BarChart3', 11)
) pagina(nombre_pagina, ruta_pagina, icono, orden)
WHERE NOT EXISTS (
  SELECT 1 FROM dim_paginas_modulo dp
  WHERE dp.id_modulo = bm.id_modulo
    AND dp.ruta_pagina = pagina.ruta_pagina
);

-- Eliminación opcional: Si el Módulo 107 existe como módulo independiente, borrarlo
DELETE FROM dim_paginas_modulo
WHERE id_modulo IN (
  SELECT id_modulo FROM dim_modulos_sistema
  WHERE nombre_modulo = 'Módulo 107'
);

DELETE FROM dim_modulos_sistema
WHERE nombre_modulo = 'Módulo 107';
```

---

### 2. Frontend - Cambiar Rutas en componentRegistry.js

**Ubicación:** `frontend/src/lib/componentRegistry.js`

**Cambios:**

```javascript
// ❌ ANTES (Rutas incorrectas - como módulo independiente)
'/modulo107/dashboard': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
},
'/modulo107/cargar-excel': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'cargar',
},

// ✅ DESPUÉS (Rutas correctas - dentro de Bolsas de Pacientes)
'/bolsas/modulo107/dashboard': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
},
'/bolsas/modulo107/cargar-excel': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'cargar',
},
'/bolsas/modulo107/listado': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
},
'/bolsas/modulo107/buscar': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
},
'/bolsas/modulo107/estadisticas': {
  component: lazy(() => import('../pages/roles/coordcitas/Listado107')),
  requiredAction: 'ver',
},
```

---

### 3. Frontend - Actualizar Navegación

**Ubicación:** `frontend/src/pages/roles/coordcitas/` o sidebar de Bolsas

**Cambio:** Los links a Módulo 107 deben apuntar a `/bolsas/modulo107/*` en lugar de `/modulo107/*`

```javascript
// ❌ ANTES
<Link to="/modulo107/dashboard">Módulo 107</Link>

// ✅ DESPUÉS
<Link to="/bolsas/modulo107/dashboard">Módulo 107</Link>
```

---

### 4. Backend - Mantener la Misma Estructura API

**IMPORTANTE:** Los endpoints REST **NO CAMBIAN**

```javascript
// ✅ IGUAL - Los endpoints siguen siendo /api/bolsa107/*
GET  /api/bolsa107/pacientes
GET  /api/bolsa107/pacientes/buscar
GET  /api/bolsa107/estadisticas
```

Solo las rutas **FRONTEND** cambian de `/modulo107/*` a `/bolsas/modulo107/*`

---

### 5. Frontend - Crear Página Contenedora (Opcional)

Si Módulo 107 debe tener su propia página contenedora dentro del módulo de Bolsas:

**Archivo:** `frontend/src/pages/roles/admin/Bolsas/Modulo107.jsx`

```jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import { FileSpreadsheet } from 'lucide-react';

/**
 * Modulo107 - Página contenedora dentro de Bolsas de Pacientes
 * Estructura similar a DengueModule.jsx
 */
export default function Modulo107() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-8 h-8 text-violet-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Módulo 107</h1>
            <p className="text-gray-600">Importación y gestión de Formulario 107 - CENATE</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <Outlet />  {/* Renderiza la página específica (dashboard, listado, etc.) */}
      </div>
    </div>
  );
}
```

---

## 📋 Plan de Ejecución

### Fase 1: Cambios en Base de Datos (30 minutos)
- [ ] Crear y ejecutar migración `V3_3_1__registrar_modulo_107_en_bolsas_pacientes.sql`
- [ ] Verificar que páginas están registradas en `dim_paginas_modulo`
- [ ] Confirmar que módulo independiente "Módulo 107" fue eliminado (si existe)

### Fase 2: Cambios en Frontend Rutas (1 hora)
- [ ] Actualizar `componentRegistry.js` con nuevas rutas `/bolsas/modulo107/*`
- [ ] Actualizar todos los links en navegación
- [ ] Crear página contenedora `Modulo107.jsx` si es necesario
- [ ] Verificar que rutas antiguas `/modulo107/*` redirigen correctamente

### Fase 3: Testing y Validación (1 hora)
- [ ] Navegar a `/bolsas/modulo107/dashboard` - debe cargar correctamente
- [ ] Verificar que los 5 tabs funcionan
- [ ] Confirmar que aparece bajo "Bolsas de Pacientes" en el sidebar
- [ ] No debe haber link a módulo "Módulo 107" independiente
- [ ] Verificar permisos MBAC se asignan correctamente

### Fase 4: Actualizar Documentación (30 minutos)
- [ ] Actualizar diagrama de módulos en documentación
- [ ] Cambiar referencias de rutas en guías
- [ ] Actualizar changelog

**Total: ~3 horas**

---

## 🔗 Referencias

**Similar al módulo Dengue:**
- Location: `frontend/src/pages/roles/admin/Dengue/` or `frontend/src/components/Dengue/`
- Routes: `/bolsas/dengue/dashboard`, `/bolsas/dengue/buscar`, etc.
- Database: Páginas registradas en `dim_paginas_modulo` con `id_modulo` de "Bolsas de Pacientes"

**Archivo de referencia:**
- Ver cómo Dengue está integrado en `dim_paginas_modulo` (query):
```sql
SELECT * FROM dim_paginas_modulo
WHERE nombre_pagina LIKE '%Dengue%'
  AND id_modulo IN (
    SELECT id_modulo FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Bolsas de Pacientes'
  );
```

---

## ✅ Checklist Pre-Merge

- [ ] Base de datos: Migración V3_3_1 ejecutada
- [ ] Frontend: Rutas actualizadas en componentRegistry.js
- [ ] Frontend: Links actualizados en navegación
- [ ] Frontend: Página contenedora creada (opcional)
- [ ] Testing: Navegar a `/bolsas/modulo107/dashboard` funciona
- [ ] Testing: Aparece bajo "Bolsas de Pacientes" en UI
- [ ] Testing: No hay módulo independiente "Módulo 107"
- [ ] Documentación: Actualizada

---

## 🚨 Impacto Actual de NO Hacer estos Cambios

1. **Arquitectura inconsistente** - Módulo 107 no sigue patrón de Dengue
2. **Confusión de usuarios** - Módulo aparece en lugar incorrecto
3. **Permisos potencialmente erróneos** - Se asignan a módulo independiente en lugar de Bolsas
4. **Mantenimiento más difícil** - Código duplicado entre Módulo 107 y Dengue

---

**Conclusión:** Este cambio debe realizarse **ANTES de mergear a main**, para mantener consistencia arquitectónica con el módulo Dengue.
