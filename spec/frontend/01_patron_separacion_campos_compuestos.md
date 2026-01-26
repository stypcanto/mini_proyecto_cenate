# 📋 Patrón: Separación de Campos Compuestos en Tablas

**Versión:** 1.0
**Fecha:** 2026-01-07
**Contexto:** CENATE - Gestión de Áreas y otros módulos
**Autor:** Styp Canto Rondón

---

## 🎯 Objetivo

Documentar el patrón utilizado para separar un campo compuesto (formato: `CODIGO - DESCRIPCION`) en dos columnas independientes de tabla, permitiendo mejor legibilidad y búsqueda granular de datos.

---

## 📊 Caso de Uso Actual

### Tabla de Áreas
**Antes:**
```
DESCRIPCIÓN
DD - DIRECCIÓN DE DESPACHO
DD - LOGISTICA
DG - AUDITORÍA MÉDICA
```

**Después:**
```
DEPENDENCIA | NOMBRE DEL ÁREA
DD          | DIRECCIÓN DE DESPACHO
DD          | LOGISTICA
DG          | AUDITORÍA MÉDICA
```

---

## 🔧 Implementación Técnica

### 1. Funciones de Extracción (utilities)

```javascript
// Extrae el código de dependencia (antes del guión)
// Ejemplo: "DD - DIRECCIÓN DE DESPACHO" → "DD"
const extractDependencia = (descArea) => {
  if (!descArea) return '';
  const match = descArea.match(/^([A-Z0-9]+)\s*-\s*/);
  return match ? match[1] : '';
};

// Extrae el nombre/descripción del área (después del guión)
// Ejemplo: "DD - DIRECCIÓN DE DESPACHO" → "DIRECCIÓN DE DESPACHO"
const extractNombreArea = (descArea) => {
  if (!descArea) return '';
  const match = descArea.match(/^[A-Z0-9]+\s*-\s*(.*)$/);
  return match ? match[1].trim() : descArea;
};

// Combina ambos campos en el formato original para guardar
// Ejemplo: ("DD", "DIRECCIÓN DE DESPACHO") → "DD - DIRECCIÓN DE DESPACHO"
const combinareAreaDescripcion = (dependencia, nombreArea) => {
  if (!dependencia || !nombreArea) return '';
  return `${dependencia} - ${nombreArea}`;
};
```

### 2. Estructura del Estado (Form Data)

**Antes:**
```javascript
const [formData, setFormData] = useState({
  descArea: '',      // Ej: "DD - DIRECCIÓN DE DESPACHO"
  statArea: '1'
});
```

**Después:**
```javascript
const [formData, setFormData] = useState({
  dependencia: '',   // Ej: "DD"
  nombreArea: '',    // Ej: "DIRECCIÓN DE DESPACHO"
  statArea: '1'
});
```

### 3. Columnas de Tabla

```javascript
<thead className="bg-[#0A5BA9]">
  <tr>
    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
      DEPENDENCIA
    </th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
      NOMBRE DEL ÁREA
    </th>
    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase">
      FECHA CREACIÓN
    </th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase">
      ESTADO
    </th>
    <th className="px-6 py-4 text-center text-xs font-semibold text-white uppercase">
      ACCIÓN
    </th>
  </tr>
</thead>

<tbody>
  {filteredAreas.map((area) => (
    <tr key={area.idArea}>
      {/* Columna Dependencia - Más destacada */}
      <td className="px-6 py-4">
        <p className="text-sm font-semibold text-gray-900">
          {extractDependencia(area.descArea)}
        </p>
      </td>

      {/* Columna Nombre del Área */}
      <td className="px-6 py-4">
        <p className="text-sm text-gray-900">
          {extractNombreArea(area.descArea)}
        </p>
      </td>

      {/* Resto de columnas... */}
    </tr>
  ))}
</tbody>
```

### 4. Modal - Campos Separados

```javascript
{/* Campo Dependencia */}
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Dependencia <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.dependencia}
    onChange={(e) => setFormData({
      ...formData,
      dependencia: e.target.value.toUpperCase()  // Auto mayúsculas
    })}
    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
    placeholder="Ej: DD, AD, TL..."
    required
  />
</div>

{/* Campo Nombre del Área */}
<div>
  <label className="block text-sm font-semibold text-slate-700 mb-2">
    Nombre del Área <span className="text-red-500">*</span>
  </label>
  <input
    type="text"
    value={formData.nombreArea}
    onChange={(e) => setFormData({
      ...formData,
      nombreArea: e.target.value
    })}
    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl"
    placeholder="Ej: DIRECCIÓN DE DESPACHO, ADMINISTRACIÓN..."
    required
  />
</div>
```

### 5. Guardar Datos (combinar antes de enviar)

```javascript
const handleSave = async (e) => {
  e.preventDefault();

  if (!formData.dependencia.trim() || !formData.nombreArea.trim()) {
    alert('La dependencia y el nombre del área son requeridos');
    return;
  }

  setSaving(true);
  try {
    // Combinar campos antes de enviar al backend
    const descAreaCombinada = combinareAreaDescripcion(
      formData.dependencia,
      formData.nombreArea
    );

    const dataToSave = {
      descArea: descAreaCombinada,  // "DD - DIRECCIÓN DE DESPACHO"
      statArea: formData.statArea
    };

    if (selectedArea) {
      await areaService.actualizar(selectedArea.idArea, dataToSave);
    } else {
      await areaService.crear(dataToSave);
    }

    handleCloseModal();
    loadAreas();
  } catch (err) {
    console.error('Error al guardar:', err);
  } finally {
    setSaving(false);
  }
};
```

### 6. Cargar Datos (separar al abrir modal)

```javascript
const handleOpenModal = (area = null) => {
  if (area) {
    setSelectedArea(area);
    setFormData({
      dependencia: extractDependencia(area.descArea),    // "DD"
      nombreArea: extractNombreArea(area.descArea),      // "DIRECCIÓN DE DESPACHO"
      statArea: area.statArea === 'A' ? '1' : '0'
    });
  } else {
    setSelectedArea(null);
    setFormData({
      dependencia: '',
      nombreArea: '',
      statArea: '1'
    });
  }
  setShowModal(true);
};
```

### 7. Búsqueda Mejorada

```javascript
const filteredAreas = areas
  .filter(area => {
    const dependencia = extractDependencia(area.descArea);
    const nombreArea = extractNombreArea(area.descArea);
    const searchLower = searchTerm.toLowerCase();

    return (
      dependencia.toLowerCase().includes(searchLower) ||
      nombreArea.toLowerCase().includes(searchLower) ||
      area.statArea?.toLowerCase().includes(searchLower)
    );
  })
  .sort((a, b) => (a.descArea || '').localeCompare(b.descArea || '', 'es'));
```

---

## 💡 Ventajas del Patrón

| Aspecto | Beneficio |
|--------|-----------|
| **Legibilidad** | Datos separados visualmente en columnas distintas |
| **Búsqueda** | Buscar por dependencia O por nombre del área independientemente |
| **UX** | Usuarios pueden editar código y descripción por separado |
| **Compatibilidad** | Backend sigue almacenando en formato `CODIGO - DESCRIPCION` |
| **Reutilizable** | Aplica a cualquier campo con este formato |

---

## 🔄 Flujo de Datos Completo

```
Backend DB: "DD - DIRECCIÓN DE DESPACHO"
                    ↓
         [extractDependencia] → "DD"
         [extractNombreArea]  → "DIRECCIÓN DE DESPACHO"
                    ↓
        Mostrar en tabla (2 columnas)
                    ↓
        Usuario edita separadamente
                    ↓
         [combinareAreaDescripcion]
                    ↓
        Backend DB: "DD - DIRECCIÓN DE DESPACHO" (formato original)
```

---

## 📋 Regex Explicado

### `extractDependencia` - Patrón: `/^([A-Z0-9]+)\s*-\s*/`

- `^` - Inicio de string
- `([A-Z0-9]+)` - Captura 1+ caracteres alfanuméricos mayúsculas
- `\s*` - 0 o más espacios
- `-` - Guión literal
- `\s*` - 0 o más espacios

**Ejemplos:**
- `"DD - DIRECCIÓN"` → `"DD"`
- `"DG-AUDITORÍA"` → `"DG"`
- `"SDGT  -  GESTIÓN"` → `"SDGT"`

### `extractNombreArea` - Patrón: `/^[A-Z0-9]+\s*-\s*(.*)$/`

- `^[A-Z0-9]+` - Ignora código inicial
- `\s*-\s*` - Ignora separador con espacios
- `(.*)$` - Captura todo lo demás hasta el final

**Ejemplos:**
- `"DD - DIRECCIÓN DE DESPACHO"` → `"DIRECCIÓN DE DESPACHO"`
- `"DG-AUDITORÍA  MÉDICA"` → `"AUDITORÍA  MÉDICA"`

---

## 🎨 Ejemplo Completo de Implementación

### Archivo: `src/components/MiComponenteCRUD.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';

// ✅ Utilities - Reutilizables
const extractCodigo = (descCompleta) => {
  if (!descCompleta) return '';
  const match = descCompleta.match(/^([A-Z0-9]+)\s*-\s*/);
  return match ? match[1] : '';
};

const extractDescripcion = (descCompleta) => {
  if (!descCompleta) return '';
  const match = descCompleta.match(/^[A-Z0-9]+\s*-\s*(.*)$/);
  return match ? match[1].trim() : descCompleta;
};

const combinarCampos = (codigo, descripcion) => {
  if (!codigo || !descripcion) return '';
  return `${codigo} - ${descripcion}`;
};

export default function MiComponenteCRUD() {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    codigo: '',
    descripcion: '',
    estado: '1'
  });

  // ... resto del componente usando el patrón
}
```

---

## 🚀 Dónde Aplicar Este Patrón

- ✅ **Gestión de Áreas** (actual)
- ✅ **Gestión de Regímenes** (código + nombre)
- ✅ **Gestión de Especialidades** (similar estructura)
- ✅ **Gestión de Servicios** (código + descripción)
- ✅ **Cualquier catálogo** con formato `CODIGO - DESCRIPCION`

---

## ⚠️ Consideraciones

1. **Validación Backend**: Asegurar que el backend acepte ambos campos combinados
2. **Formato Consistente**: Mantener siempre el patrón `CODIGO - DESCRIPCION`
3. **Espacios**: El regex acepta espacios flexibles alrededor del guión
4. **Caracteres Especiales**: Ajustar regex si códigos contienen caracteres especiales
5. **Internacionalización**: Considerar si la búsqueda necesita acentos/caracteres especiales

---

## 📝 Notas de Implementación

- Las funciones son **puras** y **reutilizables**
- No tienen dependencias de estado de React
- Pueden exportarse a un archivo `utils.js` compartido
- Funcionan con datos desacoplados del componente

```javascript
// Exportar desde utils/areaUtils.js
export const extractDependencia = (descArea) => { /* ... */ };
export const extractNombreArea = (descArea) => { /* ... */ };
export const combinareAreaDescripcion = (dep, nombre) => { /* ... */ };

// Importar en cualquier componente
import { extractDependencia, extractNombreArea } from '@/utils/areaUtils';
```

---

**Fin de Documentación**
*Para preguntas o mejoras, contactar al equipo de desarrollo CENATE*
