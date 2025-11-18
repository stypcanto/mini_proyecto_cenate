# 🔐 Sistema de Gestión de Permisos MBAC

## 📋 Descripción

Sistema moderno de gestión de permisos con **diseño tipo iPhone** que consume los endpoints del backend MBAC de CENATE. Permite visualizar y gestionar permisos por módulos y páginas de forma intuitiva.

## ✨ Características

- ✅ **Diseño moderno tipo iPhone** con colores vibrantes
- ✅ **Integración completa** con endpoints backend
- ✅ **Búsqueda y filtrado** por módulo y rol
- ✅ **Vista expandible** por módulos
- ✅ **Visualización de permisos** por acción (ver, crear, editar, eliminar, exportar, aprobar)
- ✅ **Estadísticas en tiempo real**
- ✅ **Responsive design**
- ✅ **Autenticación JWT** integrada

## 🚀 Implementación

### Archivos Creados/Modificados

1. **`/frontend/src/pages/admin/PermisosPage.jsx`** ✅ NUEVO
2. **`/frontend/src/App.js`** ✅ MODIFICADO
3. **`/frontend/src/pages/AdminDashboard.js`** ✅ MODIFICADO
4. **`/frontend/src/components/layout/AdminSidebar.jsx`** ✅ MODIFICADO

### Endpoints Consumidos

```javascript
// Obtener permisos del usuario
GET /api/permisos/usuario/{userId}

// Respuesta esperada:
[
  {
    "rol": "SUPERADMIN",
    "modulo": "Gestión de Citas",
    "pagina": "Dashboard de Citas",
    "rutaPagina": "/roles/citas/dashboard",
    "permisos": {
      "ver": true,
      "crear": true,
      "editar": true,
      "eliminar": true,
      "exportar": false,
      "aprobar": false
    }
  }
]
```

## 🎨 Diseño (Estilo iPhone)

### Paleta de Colores

- **Teal/Cyan** (#14b8a6, #06b6d4): Elementos principales
- **Blue** (#3b82f6): Información y estadísticas
- **Green** (#10b981): Estados activos
- **Purple** (#a855f7): Roles y categorías
- **Amber** (#f59e0b): Acciones de edición
- **Red** (#ef4444): Eliminación y alertas

### Componentes Principales

1. **Cards de Estadísticas con Gradientes**
2. **Barra de Búsqueda con Ícono**
3. **Filtros por Rol**
4. **Módulos Expandibles con Animaciones**
5. **Grid de Permisos con Badges**

## 🔧 Instalación y Uso

### 1. Ya está todo instalado

No necesitas instalar dependencias nuevas. Todo usa:
- ✅ React Router DOM (ya instalado)
- ✅ Lucide React (ya instalado)
- ✅ Tailwind CSS (ya configurado)

### 2. Arrancar el Proyecto

```bash
cd frontend
npm start
```

### 3. Acceder a Permisos MBAC

**Opción 1**: URL directa
```
http://localhost:3000/admin/permisos
```

**Opción 2**: Desde el Dashboard
- Dashboard → Acciones Rápidas → "Ver Permisos"

**Opción 3**: Desde el Sidebar
- Sidebar → Roles y Permisos → "Permisos MBAC"

## 📊 Funcionalidades

### 1. Visualización por Módulos

Los permisos se agrupan automáticamente por módulo:

```javascript
Gestión de Citas
  ├─ Dashboard de Citas
  └─ Agenda Médica

Panel Médico
  ├─ Dashboard Médico
  ├─ Citas del Médico
  ├─ Indicadores
  └─ Pacientes
```

### 2. Búsqueda en Tiempo Real

Busca por:
- Nombre del módulo
- Nombre de la página
- Ruta de la página

### 3. Filtrado por Rol

Filtra permisos por:
- TODOS (predeterminado)
- SUPERADMIN
- ADMIN
- COORDINADOR
- MÉDICO
- etc.

### 4. Estadísticas

- **Total Permisos**: Cantidad total de páginas con permisos
- **Activos**: Páginas con al menos un permiso habilitado
- **Módulos**: Cantidad de módulos únicos

### 5. Estados de Permisos

Cada permiso muestra 6 acciones posibles:

| Acción | Ícono | Color |
|--------|-------|-------|
| Ver | 👁️ Eye | Azul |
| Crear | ✓ CheckCircle | Verde |
| Editar | ✏️ Edit | Ámbar |
| Eliminar | 🗑️ Trash2 | Rojo |
| Exportar | 📥 FileDown | Púrpura |
| Aprobar | ✓ CheckCircle | Índigo |

## 🎯 Ejemplo de Uso

### Caso 1: Ver Permisos de un Usuario

1. Inicia sesión como SUPERADMIN
2. Navega a `/admin/permisos`
3. Automáticamente carga permisos del usuario actual
4. Expande módulos para ver páginas

### Caso 2: Buscar Permisos Específicos

1. Usa la barra de búsqueda
2. Escribe "médico"
3. Filtra solo módulos/páginas relacionados

### Caso 3: Filtrar por Rol

1. Selecciona un rol del dropdown
2. Visualiza solo permisos de ese rol
3. Compara permisos entre roles

## 🔒 Seguridad

### JWT Automático

```javascript
// Todas las peticiones incluyen el token
const data = await apiClient.get(`/permisos/usuario/${user.id}`, true);
//                                                              ^^^^
//                                                           auth=true
```

### Ruta Protegida

```javascript
<ProtectedRoute requiredPath="/admin/permisos">
  <PermisosPage />
</ProtectedRoute>
```

## 📱 Responsive Design

| Dispositivo | Grid de Permisos | Estadísticas |
|-------------|------------------|--------------|
| Mobile (<640px) | 2 columnas | 1 columna |
| Tablet (640-1024px) | 3 columnas | 1-2 columnas |
| Desktop (>1024px) | 6 columnas | 3 columnas |

## 🐛 Solución de Problemas

### Error: "Cannot fetch permisos"

**Síntomas**: Mensaje de error rojo en la página

**Soluciones**:
1. Verificar que el backend esté corriendo en `http://localhost:8080`
2. Verificar autenticación:
```javascript
// En la consola del navegador
console.log(localStorage.getItem('token'));
```
3. Probar endpoint manualmente:
```bash
curl -X GET "http://localhost:8080/api/permisos/usuario/1" \
  -H "Authorization: Bearer $TOKEN"
```

### Error: "User is undefined"

**Síntomas**: Pantalla en blanco o error de JavaScript

**Soluciones**:
1. Verificar que estés autenticado
2. Revisar AuthContext:
```javascript
// En componente
const { user } = useAuth();
console.log("User:", user);
```
3. Cerrar sesión y volver a iniciar

### Estilos no se aplican correctamente

**Síntomas**: Página sin colores o diseño roto

**Soluciones**:
1. Limpiar caché:
```bash
rm -rf node_modules/.cache
npm start
```
2. Verificar Tailwind:
```bash
# Verificar que esté compilando
npm run build:css
```

## 🎨 Personalización

### Cambiar Colores de Acciones

Edita en `PermisosPage.jsx`:

```javascript
const accionesConfig = {
  ver: { icon: Eye, label: "Ver", color: "blue" },
  crear: { icon: CheckCircle, label: "Crear", color: "green" },
  editar: { icon: Edit, label: "Editar", color: "amber" },
  eliminar: { icon: Trash2, label: "Eliminar", color: "red" },
  exportar: { icon: FileDown, label: "Exportar", color: "purple" },
  aprobar: { icon: CheckCircle, label: "Aprobar", color: "indigo" },
};
```

### Agregar Nuevas Acciones

Si el backend agrega nuevas acciones:

```javascript
// 1. Agregar configuración
const accionesConfig = {
  // ...existentes
  descargar: { icon: Download, label: "Descargar", color: "cyan" },
};

// 2. Agregar clase de color
const colorClasses = {
  // ...existentes
  cyan: "bg-cyan-50 text-cyan-700 border-cyan-200",
};
```

## 📈 Próximas Mejoras

### Fase 2: Edición de Permisos
- [ ] Botón "Editar" por página
- [ ] Modal con checkboxes
- [ ] Guardar cambios con endpoint PUT
- [ ] Toast de confirmación

### Fase 3: Gestión Avanzada
- [ ] Asignación masiva
- [ ] Clonar permisos entre roles
- [ ] Exportar a Excel
- [ ] Comparar roles

### Fase 4: Auditoría
- [ ] Historial de cambios
- [ ] Filtros por fecha
- [ ] Reportes
- [ ] Alertas

## 📝 Notas Técnicas

### Estructura de Estado

```javascript
const [permisos, setPermisos] = useState([]); // Array de permisos
const [loading, setLoading] = useState(true); // Carga inicial
const [error, setError] = useState(null); // Manejo de errores
const [expandedModules, setExpandedModules] = useState({}); // Estado UI
const [searchTerm, setSearchTerm] = useState(""); // Búsqueda
const [selectedRol, setSelectedRol] = useState("TODOS"); // Filtro
```

### Agrupación de Permisos

```javascript
// Agrupa por módulo usando reduce
const groupedPermisos = permisos.reduce((acc, permiso) => {
  if (!acc[permiso.modulo]) {
    acc[permiso.modulo] = [];
  }
  acc[permiso.modulo].push(permiso);
  return acc;
}, {});
```

### Filtrado Combinado

```javascript
// Combina búsqueda y filtro de rol
const filtered = paginas.filter(p => {
  const matchesSearch = 
    modulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.pagina.toLowerCase().includes(searchTerm.toLowerCase());
  const matchesRol = 
    selectedRol === "TODOS" || p.rol === selectedRol;
  return matchesSearch && matchesRol;
});
```

## 🎓 Buenas Prácticas Implementadas

1. ✅ **Single Responsibility**: Cada componente tiene una función clara
2. ✅ **DRY**: No hay código duplicado
3. ✅ **Loading States**: Feedback visual durante carga
4. ✅ **Error Handling**: Manejo elegante de errores
5. ✅ **Responsive**: Mobile-first approach
6. ✅ **Accessibility**: Colores con buen contraste
7. ✅ **Performance**: Auto-expande solo primer módulo
8. ✅ **Clean Code**: Comentarios y estructura clara

## 🏆 Resultado Final

Una interfaz moderna, intuitiva y profesional para gestionar permisos MBAC que:

- Se integra perfectamente con tu backend existente
- No requiere cambios en la base de datos
- Usa tu sistema de autenticación actual
- Respeta la estructura de tu proyecto
- Proporciona excelente UX/UI
- Es fácil de mantener y extender

---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o contacta al equipo de desarrollo.
