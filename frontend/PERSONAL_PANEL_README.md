# 📋 Panel de Gestión de Personal - CENATE

## 🎯 Descripción General

Sistema profesional de gestión de personal con diseño Apple-like, que integra personal interno (CENATE) y externo con control de acceso basado en módulos (MBAC - Modular-Based Access Control).

---

## ✨ Características Principales

### 🎨 Diseño y UX
- **Diseño Apple-like**: Interfaz minimalista inspirada en macOS y iCloud Dashboard
- **Animaciones fluidas**: Transiciones suaves con Framer Motion
- **Responsive**: Optimizado para desktop, tablet y móvil
- **Glassmorphism**: Efectos de vidrio y blur para un aspecto moderno
- **Feedback visual**: Hover states, scaling y sombras dinámicas

### 👥 Gestión de Personal
- **Vista unificada**: Personal CENATE y Externo en una sola tabla
- **Búsqueda inteligente**: Por nombre, documento o username
- **Filtros múltiples**: Por tipo de personal, rol y estado
- **Estadísticas en tiempo real**: Cards con contadores dinámicos
- **Export a CSV**: Exportación de datos con encoding UTF-8

### 🔒 Seguridad MBAC
- **Control de permisos**: Ver, crear, editar, eliminar, exportar
- **Validación por ruta**: Permisos granulares por página del sistema
- **Integración con roles**: SUPERADMIN tiene acceso completo
- **Protección de datos**: Solo muestra información según permisos del usuario

### 📊 Detalle de Personal
- **Card modal animado**: Vista completa de información del personal
- **Estructura adaptativa**: Diferencia automática entre CENATE y Externo
- **Información completa**: Datos personales, contacto, laborales y de usuario
- **Fotos de perfil**: Soporte para imágenes del personal CENATE
- **Badges visuales**: Roles, especialidades y estados claramente identificados

---

## 📁 Estructura de Archivos

```
frontend/src/
├── api/
│   ├── personal.js                 # ✅ ACTUALIZADO - API endpoints con función unificada
│   └── permisosApi.js             # Sistema MBAC para permisos
├── components/ui/
│   └── PersonalDetailCard.jsx     # ✅ ACTUALIZADO - Card de detalle mejorado
├── pages/admin/
│   └── AdminPersonalPanel.jsx     # ✅ ACTUALIZADO - Panel principal corregido
└── hooks/
    └── useAuth.js                  # Hook de autenticación
```

---

## 🔧 Cambios Realizados

### 1. **personal.js** - API de Personal
#### ✅ Correcciones:
- **Función unificada**: `getDetallePersonal(idUser)` reemplaza `getDetalleCenate` y `getDetalleExterno`
- **Endpoint correcto**: Usa `/api/personal/detalle/{idUser}` que determina el tipo automáticamente
- **Nuevas funciones**: Agregado soporte para cumpleaños (hoy, mes actual, mes específico)

```javascript
// ❌ ANTES (incorrecto):
export const getDetalleCenate = (id) =>
    safeFetch(`${API_BASE}/personal/cenate/${id}`, ...);
export const getDetalleExterno = (id) =>
    safeFetch(`${API_BASE}/personal/externo/${id}`, ...);

// ✅ AHORA (correcto):
export const getDetallePersonal = (idUser) =>
    safeFetch(`${API_BASE}/personal/detalle/${idUser}`, ...);
```

### 2. **AdminPersonalPanel.jsx** - Panel Principal
#### ✅ Correcciones:
- **ID correcto**: Usa `persona.id_user` en lugar de `persona.id_personal`
- **Estado actualizado**: Compara con `'ACTIVO'` en lugar de `'A'`
- **Función API correcta**: Llama a `getDetallePersonal(persona.id_user)`
- **Mejor manejo de errores**: Mensajes más descriptivos y opción de reintentar
- **Export mejorado**: CSV con encoding UTF-8 y escape de comillas

```javascript
// ❌ ANTES (incorrecto):
const handleVerDetalle = async (persona) => {
  let detalle;
  if (persona.tipo_personal === 'CENATE') {
    detalle = await getDetalleCenate(persona.id_personal); // ❌ id_personal no existe
  } else {
    detalle = await getDetalleExterno(persona.id_personal);
  }
};

// ✅ AHORA (correcto):
const handleVerDetalle = async (persona) => {
  const detalle = await getDetallePersonal(persona.id_user); // ✅ usa id_user correcto
  setSelectedPersonal(detalle);
  setShowDetail(true);
};
```

### 3. **PersonalDetailCard.jsx** - Card de Detalle
#### ✅ Correcciones:
- **Estructura de datos anidada**: Accede correctamente a `personal.personal.*`
- **Detección de tipo**: `isCenate` basado en presencia de `data.laboral.area`
- **Campos condicionales**: Muestra especialidades, colegiatura, etc. solo para CENATE
- **Formateo mejorado**: Cumpleaños con mes en español, edad actual
- **Validación de datos**: No muestra campos vacíos o null

```javascript
// ✅ Estructura correcta del JSON del backend:
{
  "id_user": 1,
  "username": "scantor",
  "estado_usuario": "ACTIVO",
  "roles": ["SUPERADMIN"],
  "personal": {
    "nombre_completo": "STYP CANTO RONDON",
    "contacto": {
      "correo_corporativo": "...",
      "telefono": "..."
    },
    "laboral": {
      "area": "GESTIÓN TI",
      "especialidades": ["CARDIOLOGIA"]
    }
  }
}

// ✅ Acceso correcto en el componente:
const data = personal.personal;
const isCenate = data.laboral?.area !== undefined;
<Campo value={data.nombre_completo} />
<Campo value={data.contacto.telefono} />
```

---

## 🚀 Cómo Usar

### 1. **Acceso al Panel**
- **Ruta**: `/admin/personal`
- **Permisos requeridos**: Usuario debe tener permiso `ver` en ruta `/roles/admin/personal` o rol `SUPERADMIN`

### 2. **Búsqueda y Filtros**
- **Búsqueda**: Escribe nombre, documento o username
- **Filtro por tipo**: TODOS, CENATE, EXTERNO
- **Filtro por rol**: Lista dinámica de roles disponibles
- **Filtro por estado**: TODOS, ACTIVO, INACTIVO

### 3. **Ver Detalle**
- Click en botón "Ver Detalle" de cualquier registro
- Se abre modal con información completa
- Diseño adaptativo según tipo de personal (CENATE/EXTERNO)

### 4. **Exportar Datos**
- Click en botón "Exportar" (solo si tienes permiso `exportar`)
- Genera archivo CSV con encoding UTF-8
- Incluye todos los registros filtrados actualmente

---

## 🔌 Endpoints del Backend

### Personal Total
```
GET /api/personal/total
```
Retorna lista de todo el personal (CENATE + Externo)

### Detalle de Personal
```
GET /api/personal/detalle/{idUser}
```
Retorna detalle completo del usuario (determina tipo automáticamente)

**Respuesta:**
```json
{
  "id_user": 1,
  "username": "scantor",
  "estado_usuario": "ACTIVO",
  "roles": ["SUPERADMIN"],
  "personal": {
    "id_personal": 1,
    "nombre_completo": "STYP CANTO RONDON",
    "tipo_documento": "DNI",
    "numero_documento": "44914706",
    "genero": "M",
    "fecha_nacimiento": "1988-02-25",
    "edad_actual": 37,
    "cumpleanos": { "mes": "February", "dia": 25 },
    "foto": "personal_1_xxx.png",
    "contacto": {
      "correo_corporativo": "...",
      "correo_personal": "...",
      "telefono": "..."
    },
    "direccion": {
      "domicilio": "...",
      "distrito": "MIRAFLORES",
      "provincia": "LIMA",
      "departamento": "LIMA"
    },
    "ipress": "CENTRO NACIONAL DE TELEMEDICINA",
    "laboral": {          // Solo CENATE
      "area": "GESTIÓN TI",
      "profesion": "MEDICO",
      "regimen_laboral": "LOCADOR",
      "codigo_planilla": "s/n",
      "numero_colegiatura": "13178",
      "rne_especialista": "14257",
      "especialidades": ["CARDIOLOGIA"]
    }
  },
  "fechas": {
    "fecha_registro": "2025-10-08T21:06:13...",
    "ultima_actualizacion": "2025-10-15T12:00:27..."
  }
}
```

### Cumpleaños
```
GET /api/personal/cumpleaneros/hoy        # Hoy
GET /api/personal/cumpleaneros/mes        # Mes actual
GET /api/personal/cumpleaneros/mes/{mes}  # Mes específico (1-12)
```

---

## 🎨 Componentes de UI

### EstadoBadge
Badge que muestra el estado del usuario con colores:
- **Verde**: ACTIVO
- **Gris**: INACTIVO

### TipoBadge
Badge que identifica el tipo de personal:
- **Índigo**: CENATE
- **Púrpura**: EXTERNO

### Campo (PersonalDetailCard)
Componente reutilizable para mostrar información con ícono:
```jsx
<Campo 
  icon={Mail} 
  label="Correo" 
  value="email@example.com" 
  highlight={true} 
/>
```

---

## ⚙️ Variables de Entorno

```env
REACT_APP_API_URL=http://localhost:8080/api
```

---

## 🐛 Troubleshooting

### Problema: "No se pudo cargar el detalle del personal"
**Causa**: El usuario no tiene datos de personal asociados en la BD  
**Solución**: Verificar que `id_user` tenga registro en `dim_personal_cnt` o `dim_personal_externo`

### Problema: "Acceso Denegado"
**Causa**: Usuario no tiene permisos MBAC  
**Solución**: Asignar permiso `ver` en `/roles/admin/personal` o rol `SUPERADMIN`

### Problema: Foto no se muestra
**Causa**: Archivo de foto no existe o ruta incorrecta  
**Solución**: Verificar que la foto esté en la carpeta correcta del backend

### Problema: Export CSV con caracteres raros
**Causa**: Encoding incorrecto  
**Solución**: El código ya incluye BOM UTF-8 (`'\uFEFF' + csv`)

---

## 📊 Estructura MBAC

### Rutas de Permisos
```
/roles/admin/personal
```

### Permisos Disponibles
- `ver`: Ver lista y detalles
- `crear`: Crear nuevo personal (próximamente)
- `editar`: Modificar personal (próximamente)
- `eliminar`: Eliminar personal (próximamente)
- `exportar`: Exportar a CSV

### Roles con Acceso Completo
- `SUPERADMIN`: Acceso total sin restricciones

---

## 🔮 Próximas Mejoras

- [ ] Crear/Editar personal desde el panel
- [ ] Subir/Actualizar fotos de perfil
- [ ] Historial de cambios (auditoría)
- [ ] Filtros avanzados (fecha de ingreso, departamento)
- [ ] Exportar a Excel/PDF
- [ ] Vista de cumpleaños del mes
- [ ] Integración con chat interno
- [ ] Notificaciones push

---

## 👨‍💻 Desarrollado por

**CENATE Development Team**  
Sistema de Telemedicina - ESSALUD

---

## 📄 Licencia

Uso interno - CENATE © 2025
