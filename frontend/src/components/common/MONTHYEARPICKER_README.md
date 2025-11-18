# 📅 MonthYearPicker - Selector de Mes y Año

Componente para seleccionar mes y año con un modal visual elegante. Guarda automáticamente en formato `YYYYMM` (6 caracteres) compatible con la base de datos.

## ✨ Características

- 🎨 Diseño oscuro elegante similar a la imagen de referencia
- 📱 Responsive y con scroll suave
- ✅ Guarda automáticamente en formato `YYYYMM` (ejemplo: `202503` = Marzo 2025)
- 🔄 Convierte automáticamente para mostrar "Marzo 2025"
- 🎯 Modal no invasivo con backdrop blur

## 📦 Instalación

El componente ya está creado en:
```
/frontend/src/components/common/MonthYearPicker.jsx
```

## 🚀 Uso Básico

### En tu formulario de edición de usuario:

```jsx
import MonthYearPicker from '../../components/common/MonthYearPicker';

// En tu componente
const [formData, setFormData] = useState({
  // ... otros campos
  periodo_ingreso: '', // o per_pers
});

// En el JSX, reemplaza el input de texto por:
<MonthYearPicker
  label="Periodo de Ingreso"
  value={formData.periodo_ingreso}
  onChange={(value) => setFormData({ ...formData, periodo_ingreso: value })}
/>
```

## 📝 Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | string | `''` | Valor en formato YYYYMM (ejemplo: "202503") |
| `onChange` | function | required | Callback cuando se selecciona fecha `(value: string) => void` |
| `label` | string | "Periodo de Ingreso" | Etiqueta del campo |

## 💾 Formato de Datos

### Input (lo que recibe):
- Formato: `YYYYMM` (6 caracteres)
- Ejemplo: `"202503"` = Marzo 2025

### Output (lo que guarda):
- Mismo formato: `YYYYMM`
- Ejemplo: Usuario selecciona "Marzo 2025" → guarda `"202503"`

### Display (lo que muestra al usuario):
- Formato legible: `"Mes Año"`
- Ejemplo: `"Marzo 2025"`

## 🔧 Integración con Backend

El componente ya está diseñado para trabajar con el campo `per_pers` de la tabla `dim_personal_cnt`:

```sql
-- Campo en la base de datos
per_pers VARCHAR(6) NOT NULL  -- Formato: YYYYMM
```

Si la BD aún tiene VARCHAR(6), ejecutar:
```sql
ALTER TABLE public.dim_personal_cnt 
ALTER COLUMN per_pers TYPE VARCHAR(20);
```

## 🎨 Personalización

Puedes personalizar los colores editando las clases CSS en el componente:

```jsx
// Color primario
bg-[#0a5ba9]  // Azul institucional

// Fondo oscuro
bg-[#1a2332]  // Fondo del modal
bg-[#0f1419]  // Fondo de las listas
```

## 📸 Ejemplo Visual

El componente muestra:
1. Un input con icono de calendario que abre el modal
2. Modal con dos columnas: Meses (izquierda) y Años (derecha)
3. Área que muestra la selección actual
4. Botón "Usar fecha" para confirmar

## ⚠️ Requisitos

- React 16.8+ (hooks)
- lucide-react (para iconos)
- Tailwind CSS (para estilos)

## 🐛 Troubleshooting

**Error: "value too long for type character varying(6)"**
- Solución: Ejecutar el ALTER TABLE para aumentar el tamaño del campo

**No se muestra correctamente**
- Verificar que Tailwind CSS esté configurado
- Verificar que lucide-react esté instalado

## 📚 Ejemplo Completo

```jsx
import React, { useState } from 'react';
import MonthYearPicker from '../../components/common/MonthYearPicker';

const EditarUsuarioForm = () => {
  const [formData, setFormData] = useState({
    nombre: 'Juan',
    apellido: 'Pérez',
    periodo_ingreso: '202501', // Enero 2025
  });

  const handleSubmit = () => {
    console.log('Periodo:', formData.periodo_ingreso); 
    // Output: "202501"
    
    // Enviar al backend
    api.put('/usuarios/1', {
      per_pers: formData.periodo_ingreso
    });
  };

  return (
    <form>
      {/* Otros campos */}
      
      <MonthYearPicker
        label="Periodo de Ingreso"
        value={formData.periodo_ingreso}
        onChange={(value) => 
          setFormData({ ...formData, periodo_ingreso: value })
        }
      />
      
      <button onClick={handleSubmit}>Guardar</button>
    </form>
  );
};
```

## ✅ Checklist de Implementación

- [x] Crear componente MonthYearPicker.jsx
- [ ] Ejecutar ALTER TABLE en la base de datos
- [ ] Importar en el formulario de edición
- [ ] Reemplazar input de texto por MonthYearPicker
- [ ] Probar selección y guardado
- [ ] Verificar que el formato YYYYMM se guarda correctamente

---

**Creado por:** Sistema CENATE 2025  
**Última actualización:** 2025-11-09
