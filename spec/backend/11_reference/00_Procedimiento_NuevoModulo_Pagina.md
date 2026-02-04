# 📋 Procedimiento: Crear Nuevos Módulos y Páginas en CENATE

> **Versión:** 1.0.0
> **Fecha:** 2026-01-22
> **Autor:** Claude Code
> **Status:** ✅ DOCUMENTADO

---

## 📚 Tabla de Contenidos

1. [Introducción](#introducción)
2. [Conceptos Clave](#conceptos-clave)
3. [Crear Nuevo Módulo](#crear-nuevo-módulo)
4. [Crear Nueva Página en Módulo Existente](#crear-nueva-página-en-módulo-existente)
5. [Checklist de Verificación](#checklist-de-verificación)
6. [Ejemplo Práctico](#ejemplo-práctico)
7. [Troubleshooting](#troubleshooting)

---

## 📖 Introducción

Este documento proporciona un procedimiento paso a paso para crear nuevos módulos y páginas en el sistema CENATE. Se basa en la arquitectura actual del proyecto y cubre todos los niveles: Frontend, Backend (opcional) y Base de Datos.

**¿Cuándo crear un nuevo módulo?**
- Cuando necesitas una categoría completamente nueva de funcionalidades (ej: "Gestión de Voluntarios")
- Cuando las funcionalidades NO están relacionadas con módulos existentes

**¿Cuándo crear una nueva página?**
- Cuando necesitas agregar funcionalidades a un módulo existente
- Cuando la funcionalidad está relacionada lógicamente con un módulo
- Cuando reutilizas permisos y acceso de ese módulo

---

## 🎯 Conceptos Clave

### Estructura Jerárquica

```
Sistema CENATE
├── Módulo 1 (ej: "Gestión de Coordinador Médico")
│   ├── Página 1 (ej: "Rendimiento Horario")
│   ├── Página 2 (ej: "Configuración de Feriados")
│   └── Página 3 (ej: "Requerimiento Especialidades")
│
├── Módulo 2 (ej: "Gestión Médica")
│   ├── Página 1
│   └── Página 2
```

### Tablas de Base de Datos Relacionadas

```sql
-- Catálogo de módulos
dim_modulos
├── id_modulo (PK)
├── nombre_modulo (varchar)
├── descripcion (text)
└── activo (boolean)

-- Catálogo de páginas/menú
dim_paginas_modulo
├── id_pagina (PK)
├── id_modulo (FK -> dim_modulos)
├── nombre_pagina (varchar)
├── ruta_pagina (varchar - ruta React)
├── descripcion (text)
├── orden (integer - orden en menú)
└── activo (boolean)

-- Permisos por página y rol (MBAC)
dim_permisos_pagina_rol
├── id_rol (FK -> dim_roles)
├── id_pagina (FK -> dim_paginas_modulo)
├── puede_ver (boolean)
├── puede_crear (boolean)
├── puede_editar (boolean)
├── puede_eliminar (boolean)
└── activo (boolean)
```

---

## 🆕 Crear Nuevo Módulo

### Paso 1: Planificación

Antes de comenzar, documenta:

```markdown
Nombre del Módulo: [Nombre claro y descriptivo]
Descripción: [¿Qué hace? ¿Quién lo usa?]
Roles Objetivo: [Roles que accederán]
Páginas Iniciales: [Lista de 2-3 páginas principales]
Dependencias: [¿Requiere otras módulos o datos?]
```

### Paso 2: Crear Script SQL para el Módulo

**Archivo:** `spec/04_BaseDatos/06_scripts/XXX_crear_modulo_[nombre].sql`

```sql
-- ========================================================================
-- Script: XXX_crear_modulo_[nombre].sql
-- Descripción: Crea el módulo "[Nombre]"
-- Versión: 1.0.0
-- Fecha: YYYY-MM-DD
-- Autor: [Tu nombre]
-- ========================================================================

BEGIN;

-- ========================================================================
-- 1. INSERTAR NUEVO MÓDULO
-- ========================================================================
INSERT INTO dim_modulos (
    nombre_modulo,
    descripcion,
    activo,
    created_at,
    updated_at
) VALUES (
    '[Nombre del Módulo]',
    '[Descripción detallada]',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    updated_at = NOW();

-- ========================================================================
-- 2. OBTENER ID DEL MÓDULO RECIÉN CREADO
-- ========================================================================
DO $$
DECLARE
    v_id_modulo INTEGER;
BEGIN
    SELECT id_modulo INTO v_id_modulo
    FROM dim_modulos
    WHERE nombre_modulo = '[Nombre del Módulo]'
    LIMIT 1;

    IF v_id_modulo IS NOT NULL THEN
        -- Insertar páginas iniciales aquí (ver paso siguiente)
        RAISE NOTICE 'Módulo creado con ID: %', v_id_modulo;
    ELSE
        RAISE EXCEPTION 'No se pudo crear el módulo';
    END IF;

END $$;

-- ========================================================================
-- 3. VERIFICAR MÓDULO CREADO
-- ========================================================================
SELECT id_modulo, nombre_modulo, descripcion, activo
FROM dim_modulos
WHERE nombre_modulo = '[Nombre del Módulo]';

COMMIT;
```

### Paso 3: Crear Páginas Iniciales del Módulo

Continúa en el mismo script o crea uno nuevo:

```sql
-- ========================================================================
-- 4. INSERTAR PÁGINAS INICIALES
-- ========================================================================
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    orden,
    activo,
    created_at,
    updated_at
) VALUES (
    (SELECT id_modulo FROM dim_modulos WHERE nombre_modulo = '[Nombre]'),
    'Dashboard',
    '/roles/[modulo]/dashboard',
    'Vista general del módulo',
    1,
    true,
    NOW(),
    NOW()
);

INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    orden,
    activo,
    created_at,
    updated_at
) VALUES (
    (SELECT id_modulo FROM dim_modulos WHERE nombre_modulo = '[Nombre]'),
    '[Nombre Página]',
    '/roles/[modulo]/[ruta]',
    '[Descripción de la página]',
    2,
    true,
    NOW(),
    NOW()
);
```

### Paso 4: Asignar Permisos Iniciales

```sql
-- ========================================================================
-- 5. ASIGNAR PERMISOS A ROLES
-- ========================================================================
DO $$
DECLARE
    v_id_modulo INTEGER;
    v_id_pagina INTEGER;
BEGIN
    SELECT id_modulo INTO v_id_modulo
    FROM dim_modulos
    WHERE nombre_modulo = '[Nombre del Módulo]'
    LIMIT 1;

    -- Para cada página del módulo
    FOR v_id_pagina IN
        SELECT id_pagina FROM dim_paginas_modulo WHERE id_modulo = v_id_modulo
    LOOP
        -- COORDINADOR (rol 4)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (4, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = EXCLUDED.puede_ver,
            puede_crear = EXCLUDED.puede_crear,
            puede_editar = EXCLUDED.puede_editar,
            puede_eliminar = EXCLUDED.puede_eliminar,
            activo = EXCLUDED.activo;

        -- ADMIN (rol 2)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (2, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = EXCLUDED.puede_ver,
            puede_crear = EXCLUDED.puede_crear,
            puede_editar = EXCLUDED.puede_editar,
            puede_eliminar = EXCLUDED.puede_eliminar,
            activo = EXCLUDED.activo;

        -- SUPERADMIN (rol 1)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (1, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = EXCLUDED.puede_ver,
            puede_crear = EXCLUDED.puede_crear,
            puede_editar = EXCLUDED.puede_editar,
            puede_eliminar = EXCLUDED.puede_eliminar,
            activo = EXCLUDED.activo;
    END LOOP;

    RAISE NOTICE 'Permisos asignados correctamente';
END $$;
```

### Paso 5: Crear Componentes Frontend

**Estructura de directorios:**

```
frontend/src/pages/
├── roles/
│   └── [nombre_modulo]/
│       ├── Dashboard[Nombre].jsx          (Componente principal)
│       ├── [Pagina1].jsx
│       ├── [Pagina2].jsx
│       └── README.md                      (Documentación del módulo)
```

**Componente mínimo:**

```jsx
// frontend/src/pages/roles/[nombre_modulo]/Dashboard[Nombre].jsx

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export default function Dashboard[Nombre]() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // TODO: Conectar con API
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // const response = await axios.get('/api/[endpoint]');
      // setData(response.data);
      setData([]); // Datos de ejemplo
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card>
        <CardHeader>
          <CardTitle>[Nombre del Módulo]</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Búsqueda */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2">
                <Plus size={20} />
                Agregar
              </button>
            </div>

            {/* Tabla */}
            {loading ? (
              <p>Cargando...</p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3">Columna 1</th>
                    <th className="text-left p-3">Columna 2</th>
                    <th className="text-center p-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.col1}</td>
                      <td className="p-3">{item.col2}</td>
                      <td className="p-3 text-center">
                        <button className="text-blue-600 mr-2">
                          <Edit2 size={18} />
                        </button>
                        <button className="text-red-600">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Paso 6: Registrar Rutas en componentRegistry.js

**Archivo:** `frontend/src/config/componentRegistry.js`

```javascript
// Agregar al objeto componentRegistry dentro de la sección correspondiente:

'/roles/[nombre_modulo]/dashboard': {
  component: lazy(() => import('../pages/roles/[nombre_modulo]/Dashboard[Nombre]')),
  requiredAction: 'ver',
},

'/roles/[nombre_modulo]/pagina1': {
  component: lazy(() => import('../pages/roles/[nombre_modulo]/Pagina1')),
  requiredAction: 'ver',
},

'/roles/[nombre_modulo]/pagina2': {
  component: lazy(() => import('../pages/roles/[nombre_modulo]/Pagina2')),
  requiredAction: 'ver',
},
```

### Paso 7: Ejecutar y Verificar

```bash
# 1. Ejecutar script SQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/XXX_crear_modulo_[nombre].sql

# 2. Verificar en BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate

-- Dentro de psql:
SELECT id_modulo, nombre_modulo FROM dim_modulos WHERE nombre_modulo LIKE '%[nombre]%';
SELECT * FROM dim_paginas_modulo WHERE id_modulo = [id_modulo];
SELECT * FROM dim_permisos_pagina_rol WHERE id_pagina IN (SELECT id_pagina FROM dim_paginas_modulo WHERE id_modulo = [id_modulo]);

# 3. Recompilar frontend
cd frontend && npm start

# 4. Probar en navegador
# Navega a http://localhost:3000
# Verifica que el módulo aparece en el menú lateral
```

---

## 📄 Crear Nueva Página en Módulo Existente

Este es el proceso más común. Se usa cuando necesitas agregar funcionalidades a un módulo ya existente.

### Paso 1: Determinar el Módulo y ID

Identifica a qué módulo agregarás la página:

```bash
# Conectarse a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate

-- Ver módulos existentes
SELECT id_modulo, nombre_modulo FROM dim_modulos ORDER BY nombre_modulo;

-- Ver páginas actuales del módulo (ejemplo: Coordinador Médico = id 19)
SELECT id_pagina, nombre_pagina, ruta_pagina, orden
FROM dim_paginas_modulo
WHERE id_modulo = 19
ORDER BY orden;
```

### Paso 2: Crear Tablas de Base de Datos (si aplica)

**Archivo:** `spec/04_BaseDatos/06_scripts/XXX_crear_tablas_[nombre_pagina].sql`

Solo necesario si la página requiere almacenamiento en BD.

```sql
BEGIN;

-- ========================================================================
-- CREAR TABLA [NOMBRE]
-- ========================================================================
CREATE TABLE IF NOT EXISTS public.[nombre_tabla] (
    id_[nombre] SERIAL PRIMARY KEY,
    campo1 VARCHAR(100) NOT NULL,
    campo2 INTEGER,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_[tabla]_activo
    ON public.[nombre_tabla](activo);

-- Comentarios
COMMENT ON TABLE public.[nombre_tabla] IS '[Descripción de la tabla]';

-- ========================================================================
-- INSERTAR DATOS DE EJEMPLO
-- ========================================================================
INSERT INTO public.[nombre_tabla] (campo1, campo2, descripcion, activo)
VALUES
    ('Valor 1', 10, 'Descripción 1', true),
    ('Valor 2', 20, 'Descripción 2', true);

COMMIT;
```

### Paso 3: Registrar Página en BD

**Archivo:** `spec/04_BaseDatos/06_scripts/XXX_agregar_pagina_[nombre].sql`

```sql
BEGIN;

-- ========================================================================
-- ACTUALIZAR ORDEN DE PÁGINAS EXISTENTES (hacer espacio)
-- ========================================================================
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 19;  -- Reemplaza 19 con el ID de tu módulo

-- ========================================================================
-- INSERTAR NUEVA PÁGINA
-- ========================================================================
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    orden,
    activo,
    created_at,
    updated_at
) VALUES (
    19,  -- ID del módulo (cambiar según corresponda)
    'Nombre de la Página',
    '/roles/coordinador/ruta-pagina',  -- Cambiar según necesidad
    'Descripción de qué hace esta página',
    2,  -- Orden en el menú
    true,
    NOW(),
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ========================================================================
-- ASIGNAR PERMISOS A TODOS LOS ROLES
-- ========================================================================
DO $$
DECLARE
    v_id_pagina INTEGER;
BEGIN
    SELECT id_pagina INTO v_id_pagina
    FROM dim_paginas_modulo
    WHERE id_modulo = 19 AND ruta_pagina = '/roles/coordinador/ruta-pagina'
    LIMIT 1;

    IF v_id_pagina IS NOT NULL THEN
        -- COORDINADOR (rol 4)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (4, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true, puede_eliminar = true;

        -- ADMIN (rol 2)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (2, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true, puede_eliminar = true;

        -- SUPERADMIN (rol 1)
        INSERT INTO dim_permisos_pagina_rol (
            id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, activo
        ) VALUES (1, v_id_pagina, true, true, true, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true, puede_eliminar = true;

        RAISE NOTICE '✓ Página registrada y permisos asignados';
    ELSE
        RAISE EXCEPTION 'No se pudo encontrar la página recién creada';
    END IF;
END $$;

-- ========================================================================
-- VERIFICAR PÁGINAS EN EL MÓDULO
-- ========================================================================
SELECT nombre_pagina, ruta_pagina, orden, activo
FROM dim_paginas_modulo
WHERE id_modulo = 19
ORDER BY orden;

COMMIT;
```

### Paso 4: Crear Componente React

**Archivo:** `frontend/src/pages/roles/coordinador/NombrePagina.jsx`

Usa la estructura siguiente como plantilla:

```jsx
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export default function NombrePagina() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      // TODO: Conectar con API real
      // const response = await axios.get('/api/endpoint');
      // setItems(response.data);

      // Datos de ejemplo (remover después de API)
      setItems([
        { id: 1, nombre: 'Ejemplo 1', descripcion: 'Descripción' },
        { id: 2, nombre: 'Ejemplo 2', descripcion: 'Descripción' },
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    // TODO: POST /api/endpoint
    setShowModal(false);
    setFormData({});
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
  };

  const handleSaveEdit = async () => {
    // TODO: PUT /api/endpoint/{id}
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Está seguro?')) {
      // TODO: DELETE /api/endpoint/{id}
      setItems(items.filter(item => item.id !== id));
    }
  };

  const filteredItems = items.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Nombre de la Página</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Búsqueda y Botón */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 hover:bg-blue-700"
            >
              <Plus size={20} />
              Agregar
            </button>
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-100">
                  <th className="text-left p-3">Columna 1</th>
                  <th className="text-left p-3">Columna 2</th>
                  <th className="text-center p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4">Cargando...</td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center p-4 text-gray-500">
                      No hay registros
                    </td>
                  </tr>
                ) : (
                  filteredItems.map(item => (
                    <tr key={item.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{item.nombre}</td>
                      <td className="p-3">{item.descripcion}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800 mr-3"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Crear */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Crear Nuevo Registro</CardTitle>
              <button onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                type="text"
                placeholder="Campo 1"
                value={formData.nombre || ''}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
              />
              <textarea
                placeholder="Descripción"
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
```

### Paso 5: Registrar Ruta en componentRegistry.js

**Archivo:** `frontend/src/config/componentRegistry.js`

Agregar dentro de la sección del módulo correspondiente:

```javascript
'/roles/coordinador/nombre-pagina': {
  component: lazy(() => import('../pages/roles/coordinador/NombrePagina')),
  requiredAction: 'ver',
},
```

### Paso 6: Crear/Actualizar Documentación

**Archivo:** `spec/01_Backend/XX_nueva_pagina_[nombre].md`

```markdown
# Nueva Página: [Nombre]

## Información General

- **Módulo:** [Nombre Módulo]
- **Ruta:** `/roles/[modulo]/[ruta]`
- **Versión:** 1.0.0
- **Status:** ✅ Implementado

## Descripción

[Descripción detallada de qué hace la página]

## Funcionalidades

- ✅ CRUD (crear, leer, actualizar, eliminar)
- ✅ Búsqueda y filtrado
- ✅ [Otra funcionalidad]

## Estructura de Datos

```javascript
{
  id: number,
  nombre: string,
  descripcion: string,
  activo: boolean
}
```

## Permisos MBAC

| Rol | Ver | Crear | Editar | Eliminar |
|-----|-----|-------|--------|----------|
| COORDINADOR | ✅ | ✅ | ✅ | ✅ |
| ADMIN | ✅ | ✅ | ✅ | ✅ |
| SUPERADMIN | ✅ | ✅ | ✅ | ✅ |

## Próximos Pasos

- [ ] Crear endpoints en backend
- [ ] Crear servicios API en frontend
- [ ] Integrar con base de datos real
- [ ] Testing E2E
```

### Paso 7: Ejecutar y Verificar

```bash
# 1. Ejecutar scripts SQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/XXX_crear_tablas_[nombre].sql \
  -f spec/04_BaseDatos/06_scripts/XXX_agregar_pagina_[nombre].sql

# 2. Verificar en BD
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate << 'EOF'
SELECT nombre_pagina, ruta_pagina, orden FROM dim_paginas_modulo
WHERE id_modulo = 19 ORDER BY orden;
EOF

# 3. Recompilar frontend
cd frontend && npm start

# 4. Hacer logout/login completo para refrescar menú
# (El cache se invalida después de re-autenticación)

# 5. Verificar que la página aparece en el menú
```

---

## ✅ Checklist de Verificación

### Antes de Implementar

- [ ] Documentación de requerimientos completada
- [ ] Estructura de datos (si es necesario) definida
- [ ] Permisos MBAC identificados
- [ ] Módulo padre identificado (si es página nueva)

### Base de Datos

- [ ] Scripts SQL creados en `spec/04_BaseDatos/06_scripts/`
- [ ] Tabla creada con índices (si aplica)
- [ ] Datos de ejemplo insertados (si aplica)
- [ ] Página registrada en `dim_paginas_modulo`
- [ ] Permisos configurados en `dim_permisos_pagina_rol`
- [ ] Verificado con SELECT queries que todo existe

### Frontend

- [ ] Componente React creado en `frontend/src/pages/`
- [ ] Estructura de carpetas seguida (roles/[modulo]/[pagina].jsx)
- [ ] Componente registrado en `componentRegistry.js`
- [ ] Ruta coincide entre BD y componentRegistry
- [ ] Permisos MBAC incluidos en componente (si aplica)
- [ ] npm start ejecuta sin errores

### Testing

- [ ] Página accesible vía URL directa
- [ ] Página aparece en menú después de logout/login
- [ ] Búsqueda/filtrado funciona (si aplica)
- [ ] Botones CRUD son clickeables
- [ ] Formularios validan correctamente
- [ ] Mensajes de éxito/error muestran

### Documentación

- [ ] Archivo spec creado con descripción
- [ ] Changelog actualizado en `checklist/01_Historial/01_changelog.md`
- [ ] README incluido en la carpeta del módulo (si es nuevo módulo)
- [ ] Comentarios TODO en componentes para integración API

---

## 🔄 Ejemplo Práctico

### Caso Real: Agregar "Rendimiento Horario" al Coordinador Médico

Este ejemplo muestra cómo se implementó la página "Rendimiento Horario".

#### 1. Identificar Módulo

```sql
SELECT id_modulo, nombre_modulo FROM dim_modulos WHERE nombre_modulo LIKE '%Coordinador%';
-- Resultado: id_modulo = 19, nombre = "Gestión de Coordinador Médico"
```

#### 2. Crear Tablas SQL

Archivo: `spec/04_BaseDatos/06_scripts/045_crear_tablas_feriados_rendimiento.sql`

```sql
CREATE TABLE IF NOT EXISTS public.rendimiento_horario (
    id_rendimiento SERIAL PRIMARY KEY,
    id_servicio INTEGER NOT NULL,
    cod_turno VARCHAR(10) NOT NULL,
    pacientes_por_hora INTEGER NOT NULL DEFAULT 1,
    minutos_intervalo INTEGER NOT NULL DEFAULT 60,
    capacidad_total_dia INTEGER,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_rendimiento_servicio_turno UNIQUE (id_servicio, cod_turno),
    CONSTRAINT fk_rendimiento_servicio
        FOREIGN KEY (id_servicio)
        REFERENCES dim_servicio_essi(id_servicio)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_rendimiento_turno
        FOREIGN KEY (cod_turno)
        REFERENCES dim_horario(cod_horario)
        ON DELETE CASCADE ON UPDATE CASCADE
);
```

#### 3. Registrar Página en BD

Archivo: `spec/04_BaseDatos/06_scripts/046_agregar_paginas_coordinador_rendimiento_feriados.sql`

```sql
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at
) VALUES (
    19,
    'Rendimiento Horario',
    '/roles/coordinador/rendimiento-horario',
    'Gestión de capacidad de atención por servicio médico y tipo de turno',
    2,
    true,
    NOW(),
    NOW()
);
```

#### 4. Crear Componente React

Archivo: `frontend/src/pages/roles/coordinador/RendimientoHorario.jsx`

```jsx
// (Ver código completo en repositorio)
```

#### 5. Registrar Ruta

Archivo: `frontend/src/config/componentRegistry.js`

```javascript
'/roles/coordinador/rendimiento-horario': {
  component: lazy(() => import('../pages/roles/coordinador/RendimientoHorario')),
  requiredAction: 'ver',
},
```

#### 6. Resultado

✅ Página visible en menú bajo "Gestión de Coordinador Médico"
✅ URL accesible: `http://localhost:3000/roles/coordinador/rendimiento-horario`
✅ Datos pre-cargados desde BD
✅ CRUD funcional a nivel frontend (pendiente integración con API)

---

## 🐛 Troubleshooting

### Problema: Página no aparece en el menú

**Soluciones:**

1. Verificar que la página está en `dim_paginas_modulo`:
```sql
SELECT * FROM dim_paginas_modulo WHERE ruta_pagina = '/roles/coordinador/rendimiento-horario';
```

2. Si existe, hacer logout completo y login nuevamente (cache se invalida)

3. Si no existe, ejecutar el script SQL de registro nuevamente

4. Verificar que el usuario tiene permisos:
```sql
SELECT * FROM dim_permisos_pagina_rol
WHERE id_pagina = [id_pagina] AND id_rol = [tu_rol]
AND puede_ver = true;
```

### Problema: Ruta 404 al navegar a la página

**Soluciones:**

1. Verificar que la ruta está en `componentRegistry.js`
2. Verificar que el archivo existe: `frontend/src/pages/roles/[modulo]/[Pagina].jsx`
3. Verificar la capitalización de la ruta (React es sensible a mayúsculas/minúsculas)
4. Recompilar con `npm start`

### Problema: Script SQL no se ejecuta

**Soluciones:**

1. Verificar que las tablas base existen (FK):
```sql
SELECT * FROM dim_modulos LIMIT 1;
SELECT * FROM dim_servicio_essi LIMIT 1;
SELECT * FROM dim_horario LIMIT 1;
```

2. Usar `\i` en psql para ejecutar el script:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate -c "\i spec/04_BaseDatos/06_scripts/046_agregar_paginas_coordinador_rendimiento_feriados.sql"
```

3. Si hay errores, revisar la salida detallada con:
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate < spec/04_BaseDatos/06_scripts/046_agregar_paginas_coordinador_rendimiento_feriados.sql 2>&1 | head -50
```

### Problema: Datos no se muestran en la página

**Soluciones:**

1. Verificar que los datos existen en la tabla:
```sql
SELECT COUNT(*) FROM rendimiento_horario;
SELECT COUNT(*) FROM dim_feriados;
```

2. Si la página tiene datos de ejemplo hardcodeados, verificar que están en el estado inicial:
```jsx
const [items, setItems] = useState([
  { id: 1, nombre: 'Ejemplo', ... },
]);
```

3. Si se conecta con API, verificar que el endpoint responde:
```bash
curl http://localhost:8080/api/rendimiento-horario
```

---

## 📚 Referencias Rápidas

| Tarea | Documento |
|-------|-----------|
| Ver endpoints existentes | `spec/01_Backend/01_api_endpoints.md` |
| Entender MBAC | `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md` |
| Patrones de código | `CLAUDE.md` |
| Modelos existentes | `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md` |
| Horarios del sistema | `spec/04_BaseDatos/07_horarios_sistema/` |
| Troubleshooting general | `spec/05_Troubleshooting/01_guia_problemas_comunes.md` |

---

## 📝 Conclusión

Este procedimiento cubre todos los pasos necesarios para:
- ✅ Crear un nuevo módulo desde cero
- ✅ Crear una nueva página dentro de un módulo existente
- ✅ Configurar permisos MBAC
- ✅ Integrar con React y componentRegistry
- ✅ Verificar que todo funciona correctamente

**Versión:** 1.0.0 | **Estado:** ✅ Completado | **Fecha:** 2026-01-22
