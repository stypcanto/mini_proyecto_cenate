# 📦 Componentes Agregados - Sistema CENATE

## ✅ Componentes Nuevos Integrados

### 1. Header Genérico (`Header.jsx`)

**Ubicación:** `src/components/Header/Header.jsx`

**Descripción:** Componente de encabezado flexible y reutilizable que permite mostrar dos logos (izquierda y derecha) con título y subtítulo centralizados.

**Props:**
- `title` (string): Título principal del header
- `subtitle` (string, opcional): Subtítulo debajo del título
- `logoLeft` (string): Ruta de la imagen del logo izquierdo
- `logoRight` (string): Ruta de la imagen del logo derecho

**Ejemplo de uso:**
```jsx
import Header from "../components/Header/Header";

<Header
  title="Sistema de Gestión CENATE"
  subtitle="Módulo Administrativo"
  logoLeft="/images/Logo ESSALUD Azul.png"
  logoRight="/images/Logo CENATE Azul.png"
/>
```

**Características:**
- ✅ Diseño responsive (se adapta a móviles, tablets y desktop)
- ✅ Transiciones suaves en logos
- ✅ Centrado perfecto del contenido
- ✅ Soporte para título opcional de subtítulo

---

### 2. Footer Simple (`Footer_azul.jsx`)

**Ubicación:** `src/components/Footer/Footer_azul.jsx`

**Descripción:** Footer minimalista con información de copyright y créditos.

**Características:**
- ✅ Fondo azul institucional (#0a5ba9)
- ✅ Información de copyright dinámica (año actual)
- ✅ Créditos al equipo de desarrollo
- ✅ Versión del sistema
- ✅ Diseño compacto (ideal para footer fijo)

**Ejemplo de uso:**
```jsx
import Footer_azul from "../components/Footer/Footer_azul";

<Footer_azul />
```

**Contenido mostrado:**
- © [Año actual] CENATE - ESSALUD. Todos los derechos reservados.
- Diseñado y desarrollado por Equipo de Gestión TI.
- Versión 1.0

---

### 3. Estilos Personalizados (`styles.css`)

**Ubicación:** `src/Styles/styles.css`

**Descripción:** Hoja de estilos con utilidades personalizadas para el sistema CENATE.

#### Clases disponibles:

**Animaciones:**
```css
.fade-in          /* Animación de aparición con fade */
.slide-in         /* Animación de deslizamiento lateral */
```

**Efectos hover:**
```css
.hover-scale      /* Efecto de escala al pasar el mouse */
```

**Gradientes:**
```css
.gradient-cenate         /* Gradiente azul principal */
.gradient-cenate-light   /* Gradiente azul claro */
```

**Sombras:**
```css
.shadow-cenate     /* Sombra con color azul CENATE */
.shadow-cenate-lg  /* Sombra grande con color azul */
```

**Inputs:**
```css
.input-cenate      /* Input con estilos CENATE y focus azul */
```

**Botones:**
```css
.btn-cenate        /* Botón con gradiente y efectos hover */
```

**Cards:**
```css
.card-cenate       /* Tarjeta con sombra y hover effect */
```

**Tablas:**
```css
.table-cenate      /* Tabla con estilos institucionales */
```

**Badges:**
```css
.badge-activo      /* Badge verde para estado activo */
.badge-inactivo    /* Badge rojo para estado inactivo */
```

**Loader:**
```css
.loader-cenate     /* Spinner de carga con colores CENATE */
```

#### Ejemplo de uso:
```jsx
<div className="card-cenate hover-scale">
  <h3 className="text-lg font-bold">Título</h3>
  <p>Contenido de la tarjeta</p>
</div>

<button className="btn-cenate">
  Guardar Cambios
</button>

<span className="badge-activo">Activo</span>
<span className="badge-inactivo">Inactivo</span>
```

---

## 📂 Estructura Actualizada

```
frontend/
├── src/
│   ├── components/
│   │   ├── Header/
│   │   │   ├── Header.jsx              ✅ NUEVO (Genérico)
│   │   │   └── Header_template.jsx     ✅ (Institucional)
│   │   ├── Footer/
│   │   │   └── Footer_azul.jsx         🔄 ACTUALIZADO (Versión simple)
│   │   ├── ConfirmDialog.jsx
│   │   ├── ExamenModal.jsx
│   │   └── PacienteCard.jsx
│   ├── Styles/
│   │   └── styles.css                  ✅ NUEVO
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── PacientesPage.jsx
│   │   └── TransferenciaExamenesPage.jsx
│   ├── Server/
│   │   └── Api.js
│   ├── api/
│   ├── hooks/
│   ├── index.css                       🔄 ACTUALIZADO (Importa styles.css)
│   └── App.js
```

---

## 🎨 Paleta de Colores CENATE

```css
/* Azules principales */
--azul-oscuro: #0a5ba9;    /* Azul principal CENATE */
--azul-medio: #1d4f8a;     /* Azul intermedio */
--azul-claro: #2e63a6;     /* Azul claro */

/* Azules pastel (fondos) */
--azul-pastel-1: #def4fe;  /* Fondo claro 1 */
--azul-pastel-2: #e8f4fd;  /* Fondo claro 2 */

/* Grises */
--gris-oscuro: #252546;    /* Gris oscuro para hover */
--gris-texto: #6b7280;     /* Gris para textos secundarios */

/* Estados */
--verde-activo: #10b981;   /* Verde para "Activo" */
--rojo-inactivo: #ef4444;  /* Rojo para "Inactivo" */
```

---

## 🔧 Diferencias entre Headers

### Header.jsx (Genérico)
✅ Más flexible y minimalista  
✅ Solo muestra logos + título  
✅ Ideal para páginas internas del sistema  
✅ Props configurables  

**Uso recomendado:**
- Páginas administrativas
- Módulos internos
- Dashboards

### Header_template.jsx (Institucional)
✅ Diseño institucional completo  
✅ Con gradiente de fondo azul  
✅ Incluye espacio para children (botones, menús)  
✅ Más elaborado visualmente  

**Uso recomendado:**
- Página de inicio (Home)
- Página de login
- Páginas públicas

---

## 💡 Ejemplos de Uso Completos

### Ejemplo 1: Página con Header Genérico

```jsx
import React from 'react';
import Header from '../components/Header/Header';
import Footer_azul from '../components/Footer/Footer_azul';

const MiPagina = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header
        title="Gestión de Pacientes"
        subtitle="Módulo de Administración"
        logoLeft="/images/Logo ESSALUD Azul.png"
        logoRight="/images/Logo CENATE Azul.png"
      />
      
      <main className="flex-1 container mx-auto p-6">
        {/* Contenido de la página */}
        <div className="card-cenate">
          <h2 className="text-2xl font-bold mb-4">Contenido Principal</h2>
          <p>Tu contenido aquí...</p>
        </div>
      </main>
      
      <Footer_azul />
    </div>
  );
};

export default MiPagina;
```

### Ejemplo 2: Usando Estilos Personalizados

```jsx
import '../Styles/styles.css';

const MiComponente = () => {
  return (
    <div className="container mx-auto p-6">
      {/* Card con animación */}
      <div className="card-cenate fade-in">
        <h3 className="text-xl font-bold mb-3">Título de Card</h3>
        
        {/* Botón con estilos CENATE */}
        <button className="btn-cenate">
          Guardar
        </button>
        
        {/* Badges de estado */}
        <div className="flex gap-2 mt-4">
          <span className="badge-activo">Activo</span>
          <span className="badge-inactivo">Inactivo</span>
        </div>
      </div>
      
      {/* Input con estilos */}
      <input 
        type="text" 
        className="input-cenate w-full mt-4" 
        placeholder="Ingresa texto..."
      />
      
      {/* Loader */}
      <div className="flex justify-center mt-4">
        <div className="loader-cenate"></div>
      </div>
    </div>
  );
};
```

---

## ✅ Verificación de Instalación

Para verificar que todo está correctamente instalado:

1. **Verifica los archivos:**
```bash
ls -la src/components/Header/
# Debe mostrar: Header.jsx y Header_template.jsx

ls -la src/Styles/
# Debe mostrar: styles.css
```

2. **Prueba en el navegador:**
- Abre la aplicación: `npm start`
- Verifica que no hay errores de importación en la consola
- Los estilos deben aplicarse correctamente

3. **Test de componentes:**
```jsx
// En cualquier página de prueba
import Header from './components/Header/Header';
import '../Styles/styles.css';

<Header
  title="Test"
  logoLeft="/images/Logo ESSALUD Azul.png"
  logoRight="/images/Logo CENATE Azul.png"
/>

<div className="card-cenate">
  <button className="btn-cenate">Test Button</button>
</div>
```

---

## 📝 Notas Importantes

1. **Importación de estilos:**
   - Los estilos ya están importados globalmente en `index.css`
   - No necesitas importar `styles.css` en cada componente
   - Solo importa si necesitas estilos específicos no globales

2. **Responsive Design:**
   - Todos los componentes son responsive por defecto
   - Se adaptan automáticamente a móviles, tablets y desktop

3. **Compatibilidad:**
   - Compatible con Tailwind CSS
   - Las clases personalizadas no interfieren con Tailwind
   - Puedes mezclar ambas sin problemas

4. **Performance:**
   - Los estilos están optimizados
   - Las animaciones usan CSS puro (mejor rendimiento)
   - No hay dependencias adicionales de JavaScript

---

**Última actualización:** 08/10/2025  
**Estado:** ✅ Todos los componentes integrados y funcionando
