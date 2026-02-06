# Upload EKG - Tablet Split View v1.52.1
**Modo Visual Tablet para Subida de Tele-EKG**

**Fecha:** 2026-02-06
**Versión:** v1.52.1
**Estado:** ✅ Implementado
**Archivo:** `/frontend/src/components/teleecgs/UploadImagenECG.jsx`

---

## 📋 Descripción

Interface optimizada para **enfermeras en campo** usando tablets horizontales. Diseñada para captura rápida y confiable de electrocardiogramas (EKG) con máxima accesibilidad y sin necesidad de scroll.

**Objetivo:** Permitir que la enfermera valide datos del paciente (mano izquierda) y capture fotos (mano derecha) simultáneamente, en una sola pantalla.

---

## 🎨 Layout - Split View (66% | 34%)

```
┌─────────────────────────────────────────────────────┬──────────────────────────┐
│                  LEFT PANEL (66%)                   │  RIGHT PANEL (34%)       │
│  ┌──────────────────────────────────────────────┐   │                          │
│  │ 🔍 Buscar Paciente (DNI Input)               │   │  ┌────────────────────┐  │
│  └──────────────────────────────────────────────┘   │  │                    │  │
│                                                       │  │   TOMAR FOTO      │  │
│  ┌──────────────────────────────────────────────┐   │  │      1/10         │  │
│  │ ✅ CONFIRMADO                                │   │  │                    │  │
│  │ ┌────────────────────────────────────────┐  │   │  └────────────────────┘  │
│  │ │ Paciente: CUMPA YAIPEN               │  │   │                          │
│  │ └────────────────────────────────────────┘  │   │  ┌────────────────────┐  │
│  │                                             │   │  │ 📸 Fotos (1/10)    │  │
│  │ ┌──────────────┬──────────────────────┐   │   │  │ [●][●][○][○]...  │  │
│  │ │ DNI          │ Edad                 │   │   │  │ X en hover       │  │
│  │ │ 16499864     │ 45                   │   │   │  └────────────────────┘  │
│  │ └──────────────┴──────────────────────┘   │   │                          │
│  │                                             │   │  [SUBIR] (sticky)       │
│  │ ┌────────────────────────────────────────┐  │   │                          │
│  │ │ Teléfono: 987654321                  │  │   │                          │
│  │ └────────────────────────────────────────┘  │   │                          │
│  │                                             │   │                          │
│  │ ┌────────────────────────────────────────┐  │   │                          │
│  │ │ IPRESS: CAP II LURÍN - HUANCAYO      │  │   │                          │
│  │ └────────────────────────────────────────┘  │   │                          │
│  │                                             │   │                          │
│  │ Progress: ███░░░░░░ 1/4                    │   │                          │
│  └──────────────────────────────────────────────┘   │                          │
└─────────────────────────────────────────────────────┴──────────────────────────┘
```

---

## 🎯 Componentes Principales

### **LEFT PANEL (66% ancho)**

#### **1. Sección Búsqueda**
```jsx
<label>DNI</label>
<input type="tel" inputMode="numeric" maxLength="8" placeholder="8 dígitos" />
```

**Características:**
- ✅ Teclado numérico móvil (`inputMode="numeric"`)
- ✅ Auto-búsqueda a 8 dígitos con debounce (200ms)
- ✅ Validación de longitud exacta
- 🔍 Loader mientras busca
- ✅ CheckMark cuando encuentra

#### **2. Confirmación de Paciente** (Expandida - v1.52.1)
```
┌─ ✅ CONFIRMADO ─────────────────┐
│                                 │
│ Paciente: CUMPA YAIPEN         │  ← Nombre completo
│                                 │
│ ┌─ DNI ────┬─ Edad ────────┐   │
│ │ 16499864 │ 45 años       │   │
│ └──────────┴───────────────┘   │
│                                 │
│ Teléfono: 987654321            │  ← Si disponible
│                                 │
│ IPRESS: CAP II LURÍN...        │  ← Si disponible
│         (name-clamp-2)          │
└─────────────────────────────────┘
```

**Campos Mostrados:**
- Nombres + Apellidos (nombre completo)
- DNI (del input)
- Edad (del paciente)
- Teléfono (si existe en BD)
- IPRESS (si existe en BD)

**Estilos:**
- Fondo: `from-green-400 to-emerald-500` (gradiente)
- Border: `border-green-600` 2px
- Boxes interiores: `bg-white/20` (contraste)
- Padding: `p-3 md:p-3`
- Shadow: `shadow-md`

#### **3. Progress Bar** (Oculto en Desktop)
```
Has bien Tomás 3 fotos más
████░░░░░░ 1/4
```

Muestra:
- Mensaje motivacional dinámico
- Barra visual de progreso
- Contador actual/mínimo

---

### **RIGHT PANEL (34% ancho)**

#### **1. Botón TOMAR FOTO - OPTIMIZADO**
```
┌──────────────────────────────┐
│                              │
│      📷  TOMAR FOTO          │
│           1/10               │
│                              │
└──────────────────────────────┘
```

**Especificaciones (v1.52.1):**
- **Tamaño:** `py-6 md:py-8` (altura fija, comprimida)
- **Icono:** `w-14 md:w-16` (proporcional)
- **Texto:** `text-2xl md:text-2xl` principal, `md:text-xl` contador
- **Gradient:** `from-cyan-500 via-teal-500 to-teal-600`
- **Estados:**
  - ✅ Habilitado: Verde vibrante, hover glow
  - ❌ Deshabilitado: Gris opaco cuando paciente no confirmado

**Comportamiento:**
- Acceso directo a cámara del dispositivo
- Comprime automáticamente a ≤1MB JPEG
- Muestra contador 1/10 (actual/máximo)

#### **2. Carrete Horizontal Inferior** (Nuevo v1.52.0)
```
📸 Fotos (1/10)
[●][○][○]...
  ↑ X hover
```

**Características:**
- Thumbnails horizontales: `w-16 h-16 md:w-20 md:h-20`
- Scroll automático (overflow-x-auto)
- Índice badge en esquina
- **X para eliminar** aparece en hover (`opacity-0 group-hover:opacity-100`)
- Border-top separador en lugar de box completo
- Compacto: `pt-2 px-1`

---

## 🔄 Flujo de Uso (Enfermera en Campo)

```
1. INGRESA DNI
   └─ Input numérico (8 dígitos)
   └─ Auto-búsqueda en BD (debounce 200ms)
        ↓
2. CONFIRMA PACIENTE
   └─ Ve datos: Nombre, edad, teléfono, IPRESS
   └─ Valida información correcta
        ↓
3. CAPTURA FOTO 1
   └─ Toca botón TOMAR FOTO
   └─ Abre cámara del tablet
   └─ Comprime automáticamente
   └─ Aparece en carrete: 1/10
        ↓
4. VERIFICA MINIATURA
   └─ Revisa en carrete inferior
   └─ Toca para ampliar o
   └─ X para eliminar
        ↓
5. REPITE 3 VECES MÁS
   └─ Toma fotos 2, 3, 4
   └─ Mínimo: 4 fotos requeridas
   └─ Máximo: 10 fotos permitidas
        ↓
6. SUBIR
   └─ Botón verde "SUBIR EKGs" disponible
   └─ Sticky en esquina inferior derecha (futuro)
   └─ Envía las 4+ fotos al servidor
```

---

## 📊 Datos del Paciente (Expandidos v1.52.1)

**Campos en datosCompletos:**
```javascript
{
  apellidos: string,      // De BD (dim_asegurados.apellido_paterno)
  nombres: string,        // De BD (dim_asegurados.nombre_asegurado)
  sexo: "M" | "F" | "-",  // De BD (dim_asegurados.sexo)
  codigo: string,         // PK asegurado o DNI
  telefono: string,       // NEW: De BD (telefonoContacto)
  ipress: string,         // NEW: De BD (ipress/descIpress)
  edad: number|string,    // NEW: Calculada de BD
}
```

**Búsqueda por DNI:**
- Endpoint: `/api/gestion-pacientes/buscar-asegurado?dni=XXXXXXXX`
- Service: `gestionPacientesService.buscarAseguradoPorDni()`
- Respuesta incluye: nombres, apellidos, sexo, telefonoContacto, ipress, edad

---

## 🎨 Responsive Design

### **Breakpoints:**
- **Mobile (<768px):** Vertical stack, botón TOMAR FOTO normal
- **Tablet (768-1279px):** ✅ Split View 66/34 (OPTIMIZADO)
- **Desktop (≥1280px):** Layout original vertical compacto

### **Tablet-Specific CSS:**
```css
/* Grid Layout */
md:grid md:grid-cols-3 md:gap-3

/* LEFT PANEL */
md:col-span-2        /* 2 de 3 columnas = 66% */
border-r-2          /* Divisor visual */

/* RIGHT PANEL */
md:col-span-1        /* 1 de 3 columnas = 34% */
md:justify-between   /* Distribuye contenido */

/* Botón TOMAR FOTO */
md:py-8             /* Altura fija */
md:text-3xl         /* Tamaño reducido */

/* Ocultar en Desktop */
xl:hidden           /* Solo tablet/mobile */
```

---

## 🎁 Features Implementados

✅ **Auto-búsqueda paciente** - 200ms debounce
✅ **Validación DNI** - 8 dígitos requeridos
✅ **Datos expandidos** - Nombre, edad, teléfono, IPRESS
✅ **Compresión automática** - Imágenes ≤1MB JPEG
✅ **Carrete horizontal** - Scroll infinito con miniaturas
✅ **Eliminar foto** - X en hover, fácil de usar
✅ **Contador dinámico** - Actual/máximo visible siempre
✅ **Progress bar** - Visual feedback de progreso
✅ **Sin scroll necesario** - Todo cabe en pantalla tablet
✅ **Touch-friendly** - Botones ≥48px para dedos
✅ **Offline support** - localStorage auto-save (draft)
✅ **Indicador online/offline** - Badge en header

---

## 📱 Consideraciones de UX/Usabilidad

### **Para Enfermeras:**
- ✅ Mano izquierda valida DNI (LEFT PANEL)
- ✅ Mano derecha captura fotos (RIGHT PANEL)
- ✅ Sin necesidad de scroll entre datos y cámara
- ✅ Visual feedback inmediato
- ✅ Íconos Lucide (semánticos, no emojis)

### **Accesibilidad:**
- ✅ Contraste WCAG AA
- ✅ Touch targets ≥44px principales
- ✅ Labels descriptivos
- ✅ Titles en hover
- ✅ aria-labels en botones

### **Performance:**
- ✅ Compresión de imágenes iterativa
- ✅ localStorage para offline
- ✅ Debounce en búsqueda
- ✅ Lazy load de miniaturas

---

## 🔧 Customización

### **Cambiar Colores:**
```jsx
// Botón TOMAR FOTO
from-cyan-500 via-teal-500 to-teal-600
// → Cambiar a rojo: from-red-500 to-red-600

// Confirmación Paciente
from-green-400 to-emerald-500
// → Cambiar a azul: from-blue-400 to-blue-500
```

### **Ajustar Tamaños:**
```jsx
// Altura botón TOMAR FOTO
md:py-8              // Cambiar a md:py-6 (más pequeño)

// Tamaño carrete
md:w-20 md:h-20      // Cambiar a md:w-24 (más grande)

// Icono cámara
md:w-16 md:h-16      // Cambiar a md:w-20 (más grande)
```

---

## 🚀 Próximas Versiones

### **v1.52.2 - Sticky Button**
- [ ] Botón "SUBIR EKGs" sticky en esquina inferior derecha
- [ ] Color dinámico: Gris (Faltan X) → Verde (SUBIR)
- [ ] Z-index correcto (no cubre carrete)

### **v1.52.3 - Enhanced Carrete**
- [ ] Modal para ampliar foto (verificar nitidez)
- [ ] Swipe para navegar entre fotos
- [ ] Indicador de foto actual/total

### **v1.53.0 - Multi-Idioma**
- [ ] Español (actual)
- [ ] Quechua (para usuarios andinos)
- [ ] Traducción de mensajes motivacionales

### **v1.54.0 - Advanced Features**
- [ ] OCR de datos del EKG
- [ ] Validación automática de calidad de imagen
- [ ] Historial de uploads por paciente
- [ ] Exportar PDF con metadata

---

## 📁 Archivos Relacionados

**Componente:**
- `/frontend/src/components/teleecgs/UploadImagenECG.jsx` (850+ líneas)

**Servicios:**
- `/frontend/src/services/gestionPacientesService.js` (búsqueda asegurado)
- `/frontend/src/services/teleekgService.js` (subida imágenes)

**Estilos:**
- TailwindCSS (responsive grid, gradient)
- Lucide Icons (Camera, X, Upload, etc.)

**Utilidades:**
- Compresión Canvas API (iterativa, ≤1MB)
- localStorage draft (sync offline)
- Debounce búsqueda (200ms)

---

## 🧪 Testing Checklist

- [ ] ✅ Búsqueda de paciente funciona
- [ ] ✅ Datos se cargan completamente
- [ ] ✅ Botón TOMAR FOTO accede a cámara
- [ ] ✅ Imágenes se comprimen automáticamente
- [ ] ✅ Carrete muestra miniaturas
- [ ] ✅ Eliminar foto con X funciona
- [ ] ✅ Sin scroll necesario en tablet
- [ ] ✅ Progress bar actualiza
- [ ] ✅ Draft se guarda en localStorage
- [ ] ✅ Online/offline indicator trabaja

---

## 📞 Notas de Implementación

**Consideraciones Técnicas:**
1. **Grid Layout:** 3 columnas (2+1) en tablet, flex-col en mobile
2. **Compresión:** Canvas + iterativa (quality 0.9 → 0.1 decrement)
3. **Touch:** Tapping en miniatura → seleccionar, hover (desktop) → mostrar X
4. **Data Binding:** DNI → API call → datosCompletos state
5. **Storage:** localStorage STORAGE_KEY = "ekgUploadDraft"

**Limitaciones Conocidas:**
- No soporta imágenes HEIC (solo JPEG/PNG)
- Máximo 10 fotos (limitación del servidor)
- Mínimo 4 fotos (requisito PADOMI)
- Requiere conexión para buscar paciente (sin offline)

---

## 💡 Tips para Enfermeras

1. **Mejor iluminación:** Usar linterna trasera del tablet
2. **Estabilidad:** Apoyar codo en el pecho del paciente
3. **Ángulo:** Paralelo al pecho para máxima captura
4. **Limpieza:** Limpiar sensores antes de cada foto
5. **Verificación:** Revisar miniaturas antes de enviar

---

**Versión:** v1.52.1
**Estado:** ✅ Production Ready
**Última actualización:** 2026-02-06

