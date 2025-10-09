# 🎨 Frontend - Sistema de Login CENATE

## 📋 Estructura de Componentes

```
frontend/ejemplos/
├── App.jsx                  # App principal con rutas
├── AuthContext.jsx          # Contexto de autenticación global
├── ProtectedRoute.jsx       # Componente para proteger rutas
├── LoginPanel.jsx           # Página de login
├── LoginPanel.css
├── Dashboard.jsx            # Dashboard principal
├── Dashboard.css
├── UsersAdmin.jsx           # Panel de administración de usuarios
├── UsersAdmin.css
├── Unauthorized.jsx         # Página de acceso denegado
└── Unauthorized.css
```

## 🚀 Instalación

### 1. Prerequisitos

- Node.js 16+ y npm/yarn
- Backend corriendo en `http://localhost:8080`

### 2. Instalar dependencias

```bash
npm install react react-dom react-router-dom
```

### 3. Configuración

Los componentes asumen que el backend está en `http://localhost:8080`.

Si tu backend está en otra URL, actualiza en:
- `AuthContext.jsx` línea 24
- `LoginPanel.jsx` línea 16
- `UsersAdmin.jsx` línea 36

## 📦 Integración con tu proyecto

### Opción 1: Create React App

```bash
npx create-react-app cenate-frontend
cd cenate-frontend

# Instalar React Router
npm install react-router-dom

# Copiar los componentes de ejemplos/ a src/
cp ejemplos/* src/

# Actualizar src/index.js para usar App.jsx
npm start
```

### Opción 2: Vite (Más rápido)

```bash
npm create vite@latest cenate-frontend -- --template react
cd cenate-frontend
npm install
npm install react-router-dom

# Copiar los componentes
cp ejemplos/* src/

# Ejecutar
npm run dev
```

## 🔧 Uso de Componentes

### 1. AuthContext - Contexto de Autenticación

Envuelve tu app con AuthProvider:

```jsx
import { AuthProvider } from './AuthContext';

function App() {
  return (
    <AuthProvider>
      {/* Tu app aquí */}
    </AuthProvider>
  );
}
```

### 2. useAuth Hook

Usa el hook en cualquier componente:

```jsx
import { useAuth } from './AuthContext';

function MyComponent() {
  const { user, login, logout, hasPermission, hasRole } = useAuth();

  // Verificar autenticación
  if (!user) {
    return <div>No autenticado</div>;
  }

  // Verificar permisos
  if (hasPermission('GESTIONAR_USUARIOS')) {
    return <div>Puedes gestionar usuarios</div>;
  }

  // Verificar roles
  if (hasRole('SUPERADMIN')) {
    return <div>Eres SUPERADMIN</div>;
  }

  return <div>Hola {user.username}</div>;
}
```

### 3. ProtectedRoute - Proteger Rutas

```jsx
import ProtectedRoute from './ProtectedRoute';

// Requiere solo autenticación
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>

// Requiere rol específico
<Route 
  path="/admin" 
  element={
    <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
      <AdminPanel />
    </ProtectedRoute>
  } 
/>

// Requiere permiso específico
<Route 
  path="/reportes" 
  element={
    <ProtectedRoute permissions={['VER_REPORTES']}>
      <Reportes />
    </ProtectedRoute>
  } 
/>

// Requiere TODOS los roles (requireAll=true)
<Route 
  path="/super-secure" 
  element={
    <ProtectedRoute 
      roles={['SUPERADMIN', 'ADMIN']} 
      requireAll={true}
    >
      <SuperSecure />
    </ProtectedRoute>
  } 
/>
```

### 4. LoginPanel - Página de Login

Simplemente usa el componente:

```jsx
<Route path="/login" element={<LoginPanel />} />
```

### 5. Dashboard - Página Principal

```jsx
<Route 
  path="/dashboard" 
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } 
/>
```

### 6. UsersAdmin - Administración de Usuarios

```jsx
<Route 
  path="/admin/usuarios" 
  element={
    <ProtectedRoute roles={['SUPERADMIN', 'ADMIN']}>
      <UsersAdmin />
    </ProtectedRoute>
  } 
/>
```

## 🎯 Funcionalidades

### AuthContext Proporciona:

- `user`: Información del usuario actual
- `token`: JWT token
- `loading`: Estado de carga
- `login(username, password)`: Función para hacer login
- `logout()`: Función para hacer logout
- `hasPermission(permission)`: Verificar permiso
- `hasRole(role)`: Verificar rol
- `hasAnyRole(roles[])`: Verificar si tiene algún rol
- `hasAllRoles(roles[])`: Verificar si tiene todos los roles
- `isAuthenticated()`: Verificar si está autenticado
- `getAuthHeader()`: Obtener header de autorización
- `authenticatedFetch(url, options)`: Hacer fetch autenticado

### LoginPanel Features:

- ✅ Validación de formulario
- ✅ Manejo de errores
- ✅ Loading state
- ✅ Diseño responsive
- ✅ Animaciones suaves

### Dashboard Features:

- ✅ Menú lateral con permisos
- ✅ Tarjetas de acceso rápido
- ✅ Info del usuario y roles
- ✅ Botón de logout
- ✅ Diseño responsive

### UsersAdmin Features:

- ✅ Ver lista de usuarios
- ✅ Crear nuevo usuario
- ✅ Activar/Desactivar usuarios
- ✅ Desbloquear usuarios bloqueados
- ✅ Eliminar usuarios (solo SUPERADMIN)
- ✅ Estadísticas de usuarios
- ✅ Modal de creación
- ✅ Diseño responsive

## 🎨 Personalización

### Colores

Todos los CSS usan variables que puedes cambiar:

```css
/* Colores principales */
--primary: #667eea;
--secondary: #764ba2;
--success: #28a745;
--danger: #dc3545;
--warning: #ffc107;
--info: #17a2b8;
```

### Fuentes

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', ...
```

Puedes cambiar por tu fuente preferida.

## 🔐 Seguridad

### 1. Tokens en localStorage

Los tokens se guardan en localStorage. Para producción, considera:
- httpOnly cookies
- Refresh tokens
- Token rotation

### 2. Validación en Frontend

El frontend valida permisos, pero **SIEMPRE** valida en el backend.

### 3. HTTPS

En producción, usa HTTPS para todas las comunicaciones.

## 🧪 Testing

### Flujo de Login

```javascript
// Caso 1: Login exitoso
1. Ingresar: username="superadmin", password="SuperAdmin2024!"
2. Verificar: Redirección a /dashboard
3. Verificar: Token en localStorage
4. Verificar: Datos de usuario en localStorage

// Caso 2: Login fallido
1. Ingresar: username="superadmin", password="wrong"
2. Verificar: Mensaje de error
3. Verificar: No hay redirección
4. Verificar: No hay token en localStorage

// Caso 3: Bloqueo por intentos fallidos
1. Intentar login con contraseña incorrecta 5 veces
2. Verificar: Mensaje de "Cuenta bloqueada"
3. Verificar: No se puede hacer login por 30 minutos
```

### Flujo de Permisos

```javascript
// Caso 1: Usuario sin permisos intenta acceder
1. Login como "usuario" (rol: USUARIO)
2. Intentar acceder a /admin/usuarios
3. Verificar: Redirección a /unauthorized

// Caso 2: Usuario con permisos puede acceder
1. Login como "superadmin"
2. Acceder a /admin/usuarios
3. Verificar: Página se muestra correctamente
```

## 📱 Responsive

Todos los componentes son responsive y funcionan en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)
- 🖥️ Large Desktop (1440px+)

## 🐛 Troubleshooting

### Error: "Cannot read property 'roles' of null"

Asegúrate de envolver tu app con `<AuthProvider>`:

```jsx
<AuthProvider>
  <App />
</AuthProvider>
```

### Error: "useAuth must be used within AuthProvider"

El hook `useAuth()` solo funciona dentro de componentes que están dentro del `<AuthProvider>`.

### Token expirado

El `authenticatedFetch` detecta automáticamente tokens expirados (401) y hace logout.

### CORS Error

Asegúrate que el backend tiene CORS configurado correctamente en SecurityConfig.java.

## 📚 Próximos Pasos

1. ✅ Sistema de login completo
2. ✅ Gestión de roles y permisos
3. ✅ Dashboard con control de acceso
4. ✅ Administración de usuarios
5. 🔄 Implementar cambio de contraseña
6. 🔄 Implementar recuperación de contraseña
7. 🔄 Implementar perfil de usuario
8. 🔄 Implementar auditoría de acciones
9. 🔄 Implementar notificaciones
10. 🔄 Implementar tema oscuro

## 🤝 Contribuir

Para agregar nuevos componentes:

1. Crear el componente en `src/`
2. Agregar sus estilos en `.css`
3. Registrar la ruta en `App.jsx`
4. Proteger con `<ProtectedRoute>` si es necesario

## 📞 Soporte

Para problemas o preguntas:
1. Revisar esta documentación
2. Revisar SISTEMA_LOGIN_GUIA_COMPLETA.md en backend
3. Verificar logs del navegador (F12)
4. Verificar logs del backend

---

**Fecha:** 08/10/2025  
**Versión:** 1.0.0  
**Sistema:** CENATE - Centro Nacional de Telemedicina
