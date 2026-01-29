# 🎨 Gestión de Iconos - CENATE

**Versión:** 1.0.0
**Fecha:** 2026-01-29
**Status:** ✅ Implementado

---

## 📋 Tabla de Contenidos

1. [Arquitectura](#arquitectura)
2. [Agregar Iconos Nuevos](#agregar-iconos-nuevos)
3. [Modificar Iconos Existentes](#modificar-iconos-existentes)
4. [Iconos Disponibles](#iconos-disponibles)
5. [Flujo de Carga](#flujo-de-carga)
6. [Solución de Problemas](#solución-de-problemas)

---

## 🏗️ Arquitectura

El sistema de iconos en CENATE funciona en **dos niveles**:

### 1️⃣ **Frontend: Iconos Hardcoded (Primario)**
- Se define en `DynamicSidebar.jsx`
- Mapea nombres de páginas a componentes Lucide React
- Se ejecuta en el navegador del cliente
- **Rápido y confiable** - no depende de la BD

### 2️⃣ **Backend: Iconos en Base de Datos (Secundario)**
- Se almacenan en `dim_paginas_modulo.icono`
- Retornados por `/api/menu-usuario/usuario/{id}`
- Permite personalización dinámica sin recompilación

**Flujo actual:** Frontend intenta usar hardcoded → fallback a BD → fallback a Folder

---

## ➕ Agregar Iconos Nuevos

### Opción A: Agregar Icono Hardcoded (Recomendado)

**Paso 1: Abrir `DynamicSidebar.jsx`**

```bash
src/components/DynamicSidebar.jsx
```

**Paso 2: Agregar Import de Lucide Icon**

Si el icono no está importado, agregarlo a la sección de imports (líneas 15-59):

```javascript
import {
  // ... otros iconos ...
  YourNewIcon,  // ← Nuevo icono
} from "lucide-react";
```

**Listado de iconos disponibles en Lucide React:**
🔗 [lucide.dev/icons](https://lucide.dev)

**Paso 3: Actualizar `getPageIcon()` (líneas 446-481)**

```javascript
function getPageIcon(nombreModulo, nombrePagina) {
  const lowerName = nombrePagina.toLowerCase();

  // Agregar tu nuevo icono aquí:
  if (lowerName === 'tu-pagina-nombre') {
    return YourNewIcon;  // ← Tu icono
  }

  // ... resto del código ...
}
```

**Paso 4: Agregar a `iconMap` (líneas 62-104)**

```javascript
const iconMap = {
  // ... otros iconos ...
  'YourNewIcon': YourNewIcon,  // ← Mapeo para API
};
```

**Paso 5: Recargar la página**

```bash
npm start  # Si no está corriendo
# Ctrl+R en el navegador
```

---

### Opción B: Agregar Icono en Base de Datos

**Para páginas dinámicas o cuando necesites cambiar sin recompilación:**

**Paso 1: Actualizar la BD**

```sql
UPDATE dim_paginas_modulo
SET icono = 'NombreDelIcono'
WHERE id_pagina = 109;
```

**Ejemplo:**
```sql
UPDATE dim_paginas_modulo
SET icono = 'Activity'
WHERE nombre_pagina = 'Mi Nueva Página';
```

**Paso 2: Reiniciar el Backend**

```bash
./gradlew bootRun
```

**Paso 3: Recargar el Frontend**

```
Ctrl+R en el navegador
```

---

## 🔄 Modificar Iconos Existentes

### Cambiar Icono de una Página Existente

**Método 1: Base de Datos (Sin recompilación)**

```sql
UPDATE dim_paginas_modulo
SET icono = 'NuevoIcono'
WHERE id_pagina = 110;
```

Luego reinicia el backend y recarga el navegador.

**Método 2: Frontend Hardcoded (Recomendado)**

En `getPageIcon()`, cambiar:

```javascript
// Antes
if (lowerName === 'dengue') {
  return Bug;
}

// Después
if (lowerName === 'dengue') {
  return Mosquito;  // ← Nuevo icono
}
```

---

## 🎨 Iconos Disponibles

### Iconos Actuales en CENATE

| Página | Icono | Nombre Lucide | Código |
|--------|-------|---------------|--------|
| Dengue | 🦟 | `Bug` | `<Bug />` |
| Cargar Excel | 📤 | `Upload` | `<Upload />` |
| Listar Casos | 📋 | `List` | `<List />` |
| Buscar | 🔍 | `Search` | `<Search />` |
| Resultados | 📊 | `BarChart3` | `<BarChart3 />` |
| Solicitudes | ✅ | `ListChecks` | `<ListChecks />` |
| Estadísticas | 📈 | `BarChart3` | `<BarChart3 />` |
| Historial | 📂 | `FolderOpen` | `<FolderOpen />` |
| Errores | 🔎 | `FileSearch` | `<FileSearch />` |

### Iconos Recomendados por Módulo

**Administración:**
- Settings, Users, Shield, Database, Lock

**Gestión:**
- Calendar, ClipboardList, UserCog, Hospital

**Reportes:**
- BarChart3, TrendingUp, FileBarChart

**Búsqueda:**
- Search, Eye, FileSearch

**Acciones:**
- Upload, Download, Save, Trash2

---

## 🔄 Flujo de Carga

```
Usuario carga página
          ↓
Frontend obtiene menú del API
          ↓
DynamicSidebar renderiza
          ↓
Para cada página:
  1. ¿Tiene nombre conocido en getPageIcon()?
     SÍ → Usa icono hardcoded ✅
     NO ↓
  2. ¿API retorna icono?
     SÍ → Usa icono de BD ✅
     NO ↓
  3. Usa icono por defecto (Folder)
```

---

## 🔧 Solución de Problemas

### ❌ Los iconos no aparecen

**Causa 1: Caché del navegador**
```bash
# Limpiar caché
Ctrl+Shift+Delete  # Windows/Linux
Cmd+Shift+Delete   # macOS

# O recargar sin caché
Ctrl+Shift+R  # Windows/Linux
Cmd+Shift+R   # macOS
```

**Causa 2: npm start no reinició**
```bash
pkill -f "npm start"
npm start  # Reiniciar
```

**Causa 3: Nombre del icono incorrecto**
- Verificar en [lucide.dev](https://lucide.dev) que el nombre es correcto
- Los nombres son **case-sensitive**: `Bug` ≠ `bug`

### ❌ Backend no retorna iconos de BD

**Verificar que la columna existe:**
```sql
SELECT icono FROM dim_paginas_modulo WHERE id_pagina = 109;
```

**Si es NULL, actualizar:**
```sql
UPDATE dim_paginas_modulo
SET icono = 'Bug'
WHERE id_pagina = 109;
```

### ❌ Icono no aparece en las subpáginas

**Asegurar que getPageIcon() incluye el nombre:**
```javascript
// En getPageIcon()
if (lowerName === 'cargar excel') {
  return Upload;
}
```

**Verificar nombres exactos:**
```javascript
// Depuración en consola del navegador
console.log('Nombre página:', nombrePagina);
// Debe coincidir exactamente con el if
```

---

## 📝 Checklist para Agregar Nueva Página con Icono

- [ ] Nueva página creada en BD (`dim_paginas_modulo`)
- [ ] Icono ingresado en columna `icono`
- [ ] Icono importado en `DynamicSidebar.jsx`
- [ ] Icono agregado a `getPageIcon()`
- [ ] Icono agregado a `iconMap`
- [ ] npm start reiniciado
- [ ] Navegador recargado (Cmd+R / Ctrl+R)
- [ ] Icono verificado en el menú

---

## 🚀 Ejemplo Completo: Agregar Página "Reportes"

### 1. Crear en BD:
```sql
INSERT INTO dim_paginas_modulo
(id_modulo, nombre_pagina, ruta_pagina, orden, icono, activo)
VALUES (1, 'Reportes', '/reportes', 10, 'BarChart3', true);
```

### 2. Actualizar Frontend (DynamicSidebar.jsx):

```javascript
// 1. Importar (si no existe)
import { BarChart3 } from "lucide-react";

// 2. Agregar a getPageIcon()
if (lowerName === 'reportes') {
  return BarChart3;
}

// 3. Agregar a iconMap
const iconMap = {
  // ...
  'BarChart3': BarChart3,
};
```

### 3. Reiniciar:
```bash
npm start
# Ctrl+R en navegador
```

### ✅ Resultado:
- Menú muestra "Reportes" con icono 📊

---

## 📚 Referencias

- **Lucide React Icons:** https://lucide.dev/icons
- **Implementación:** `src/components/DynamicSidebar.jsx`
- **BD:** `dim_paginas_modulo.icono`
- **API:** `GET /api/menu-usuario/usuario/{id}`

---

**Última actualización:** 2026-01-29
**Mantenedor:** Sistema CENATE v1.37.4+
