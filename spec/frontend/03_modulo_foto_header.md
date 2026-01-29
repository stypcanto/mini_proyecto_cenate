# 📷 Módulo de Foto Header - Frontend

**Versión:** v1.37.4
**Fecha:** 2026-01-28
**Estado:** ✅ Implementado y Funcional

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Componentes Involucrados](#componentes-involucrados)
3. [Flujo de Datos](#flujo-de-datos)
4. [Implementación](#implementación)
5. [AuthContext](#authcontext)
6. [UserMenu Component](#usermenu-component)
7. [Estilos y UI](#estilos-y-ui)
8. [Debugging](#debugging)
9. [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

El **Módulo de Foto Header** en el frontend permite mostrar la foto de perfil del usuario autenticado en el header superior derecho de la aplicación.

**Características:**
- ✅ Avatar circular con foto del usuario
- ✅ Fallback a inicial del nombre si no hay foto
- ✅ Dropdown menu con información detallada
- ✅ Responsive (oculta texto en móviles)
- ✅ Integrado con AuthContext
- ✅ Manejo de errores de carga de imagen

---

## 🧩 Componentes Involucrados

### 1. AuthContext

**📁 Ubicación:**
`frontend/src/context/AuthContext.js`

**Responsabilidades:**
- Recibir datos del usuario desde el backend (incluido campo `foto`)
- Almacenar `foto` en el estado global del usuario
- Guardar `foto` en localStorage para persistencia
- Proveer `user.foto` a todos los componentes

### 2. UserMenu

**📁 Ubicación:**
`frontend/src/components/layout/UserMenu.jsx`

**Responsabilidades:**
- Renderizar avatar con foto o inicial
- Mostrar dropdown con información del usuario
- Manejar errores de carga de imagen
- Aplicar estilos responsive

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                 FLUJO DE FOTO EN FRONTEND                   │
└─────────────────────────────────────────────────────────────┘

1. Usuario hace LOGIN
   ↓
2. apiClient.post('/api/auth/login', credentials)
   ↓
3. Backend responde con:
   {
     token: "...",
     id_user: 1,
     foto: "/api/personal/foto/filename.png",
     ...
   }
   ↓
4. AuthContext.login() recibe respuesta
   ↓
5. Extrae campo foto:
   const userData = {
     ...
     foto: data.foto || payload.foto || null
   }
   ↓
6. Guarda en estado y localStorage:
   - setUser(userData)
   - saveUser(userData)
   ↓
7. UserMenu lee user.foto desde contexto
   ↓
8. Renderiza <img src={user.foto} /> o <span>{inicial}</span>
```

---

## 💻 Implementación

### AuthContext.js

#### Login Function (Líneas 134-187)

```javascript
const login = useCallback(async (username, password) => {
  setLoading(true);
  try {
    // 1️⃣ Llamada al backend
    const data = await apiClient.post("/auth/login", { username, password });
    console.log("📦 Respuesta del backend en login:", data);

    if (!data?.token) throw new Error("No se recibió token del servidor");

    const jwt = data.token;
    const payload = decodeJwt(jwt);
    console.log("🔐 JWT Payload en login:", payload);

    // 2️⃣ Extraer userId
    const userId = data.id_user || data.userId || data.id ||
                   payload.id_user || payload.userId || payload.id ||
                   payload.user_id;

    // 3️⃣ Construir objeto userData con foto
    const userData = {
      id: Number(userId),
      username: payload.username || data.username || username,
      roles: normalizeRoles(payload.roles || data.roles || []),
      permisos: payload.permisos || data.permisos || [],
      nombreCompleto: data.nombreCompleto || data.nombre_completo ||
                      payload.nombre_completo,
      foto: data.foto || payload.foto || null,  // 📷 URL de la foto del usuario
      requiereCambioPassword: data.requiereCambioPassword || false,
      token: jwt
    };

    // 4️⃣ Logs de debugging
    console.log("📷 Foto del usuario desde backend:", data.foto);
    console.log("👤 userData completo:", userData);

    // 5️⃣ Guardar en estado y localStorage
    saveToken(jwt);
    saveUser(userData);
    setUser(userData);
    setToken(jwt);

    // 6️⃣ Limpiar sesión invalidada
    clearInvalidatedSession(userData.id);

    toast.success(`Bienvenido, ${userData.nombreCompleto || userData.username}`);
    return { ok: true, user: userData, roles: userData.roles };

  } catch (error) {
    console.error("Error en login:", error);
    toast.error(error.message || "Error al iniciar sesión");
    return { ok: false, error: error.message };
  } finally {
    setLoading(false);
  }
}, []);
```

#### Restauración de Sesión (Líneas 47-97)

```javascript
useEffect(() => {
  if (token && !user) {
    try {
      const payload = decodeJwt(token);

      // Extraer userId del JWT
      const userId = payload.id_user || payload.userId ||
                     payload.id || payload.user_id;

      // Restaurar userData con foto desde JWT
      const restoredUser = {
        id: Number(userId),
        username: payload.username || payload.preferred_username || payload.sub,
        roles: normalizeRoles(payload.roles || payload.authorities || []),
        permisos: payload.permisos || [],
        nombreCompleto: payload.nombre_completo || payload.name ||
                        payload.username || payload.sub || "",
        foto: payload.foto || null,  // 📷 Foto restaurada del JWT
        requiereCambioPassword: payload.requiereCambioPassword || false,
        token
      };

      console.log("Usuario restaurado:", restoredUser);
      setUser(restoredUser);
      saveUser(restoredUser);

    } catch (error) {
      console.error("Error al restaurar sesión:", error);
      clearUser();
      clearToken();
    }
  }
  setInitialized(true);
}, [token, user]);
```

---

### UserMenu.jsx

#### Imports y Setup (Líneas 1-18)

```javascript
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, ChevronUp, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // 🐛 DEBUG: Verificar si user.foto llega al componente
  console.log("🖼️ [UserMenu] user.foto:", user?.foto);
  console.log("👤 [UserMenu] user completo:", user);

  if (!user) return null;
  // ...
}
```

#### Avatar en Header (Líneas 36-48)

```javascript
{/* Avatar circular con foto */}
<div className="w-14 h-14 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border border-white/30">
  {user?.foto ? (
    <img
      src={user.foto}
      alt={user.nombreCompleto}
      className="w-full h-full object-cover"
      onError={(e) => {
        console.error("❌ [UserMenu] Error cargando foto:", user.foto);
        console.error("❌ [UserMenu] Error event:", e);
      }}
      onLoad={() => console.log("✅ [UserMenu] Foto cargada exitosamente:", user.foto)}
    />
  ) : (
    <span className="text-white font-bold text-base">
      {user?.nombreCompleto?.charAt(0)?.toUpperCase()}
    </span>
  )}
</div>
```

#### Avatar en Dropdown (Líneas 77-89)

```javascript
{/* Avatar grande en dropdown */}
<div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0">
  {user?.foto ? (
    <img
      src={user.foto}
      alt={user.nombreCompleto}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-gray-600 font-bold text-2xl">
      {user?.nombreCompleto?.charAt(0)?.toUpperCase()}
    </span>
  )}
</div>
```

#### Información del Usuario (Líneas 91-102)

```javascript
{/* Datos del usuario */}
<div className="flex-1">
  <h3 className="text-lg font-bold text-gray-900">
    {user?.nombreCompleto || user?.username}
  </h3>
  <p className="text-sm text-gray-600">
    {user?.roles?.[0]?.toUpperCase() || "Usuario"}
  </p>
  <p className="text-xs text-gray-500 mt-1">
    {user?.institucion || "CENTRO NACIONAL DE TELEMEDICINA"}
  </p>
</div>
```

---

## 🎨 Estilos y UI

### Clases Tailwind

#### Avatar Header (pequeño, 56x56px)

```jsx
className="w-14 h-14 rounded-full bg-white/20 overflow-hidden flex items-center justify-center border border-white/30"
```

**Breakdown:**
- `w-14 h-14` → 56x56 pixels
- `rounded-full` → Círculo perfecto
- `bg-white/20` → Fondo blanco semi-transparente
- `overflow-hidden` → Crop de imagen
- `border border-white/30` → Borde blanco suave

#### Avatar Dropdown (grande, 80x80px)

```jsx
className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center flex-shrink-0"
```

**Breakdown:**
- `w-20 h-20` → 80x80 pixels
- `rounded-full` → Círculo perfecto
- `bg-gray-200` → Fondo gris claro
- `flex-shrink-0` → No reducir tamaño

#### Imagen

```jsx
className="w-full h-full object-cover"
```

**Breakdown:**
- `w-full h-full` → Llenar contenedor
- `object-cover` → Crop proporcional (mantiene aspect ratio)

#### Inicial (Fallback)

```jsx
{/* Header */}
<span className="text-white font-bold text-base">S</span>

{/* Dropdown */}
<span className="text-gray-600 font-bold text-2xl">S</span>
```

### Responsive Design

```jsx
{/* Nombre y rol (visible en pantallas grandes) */}
<div className="hidden md:flex flex-col items-end">
  <span className="text-sm text-white font-semibold leading-tight">
    {user?.nombreCompleto || user?.username}
  </span>
  <span className="text-xs text-white/70">
    {user?.roles?.[0]?.toUpperCase() || "Usuario"}
  </span>
</div>
```

**Comportamiento:**
- **Móviles (<768px):** Solo avatar circular
- **Tablets/Desktop (≥768px):** Avatar + nombre + rol

---

## 🐛 Debugging

### Console Logs

#### En AuthContext (Login)

```javascript
console.log("📦 Respuesta del backend en login:", data);
console.log("🔐 JWT Payload en login:", payload);
console.log("🆔 User ID en login:", userId, "Tipo:", typeof userId);
console.log("📷 Foto del usuario desde backend:", data.foto);
console.log("👤 userData completo:", userData);
```

**Salida esperada:**

```
📦 Respuesta del backend en login: {token: "...", id_user: 1, foto: "/api/personal/foto/...", ...}
🔐 JWT Payload en login: {id_user: 1, nombre_completo: "...", roles: [...], ...}
🆔 User ID en login: 1 Tipo: number
📷 Foto del usuario desde backend: /api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png
👤 userData completo: {id: 1, username: "...", foto: "/api/personal/foto/...", ...}
```

#### En UserMenu

```javascript
console.log("🖼️ [UserMenu] user.foto:", user?.foto);
console.log("👤 [UserMenu] user completo:", user);
console.log("✅ [UserMenu] Foto cargada exitosamente:", user.foto);
console.log("❌ [UserMenu] Error cargando foto:", user.foto);
```

**Salida esperada (éxito):**

```
🖼️ [UserMenu] user.foto: /api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png
👤 [UserMenu] user completo: {id: 1, username: "44914706", foto: "/api/personal/foto/...", ...}
✅ [UserMenu] Foto cargada exitosamente: /api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png
```

### Chrome DevTools

#### Network Tab

1. Abrir DevTools (F12)
2. Ir a **Network**
3. Filtrar por `login`
4. Inspeccionar respuesta:

```json
{
  "foto": "/api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png"
}
```

#### Application Tab → localStorage

```javascript
// Key: cenate_user
{
  "id": 1,
  "username": "44914706",
  "nombreCompleto": "Styp Canto Rondón",
  "foto": "/api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png",
  "roles": ["SUPERADMIN"]
}
```

---

## 🔧 Troubleshooting

### Problema: Foto no aparece (solo inicial)

**Diagnóstico:**

1. **Verificar que `user.foto` tiene valor:**
   ```javascript
   console.log(user?.foto);  // ¿null o undefined?
   ```

2. **Verificar localStorage:**
   ```javascript
   localStorage.clear();
   sessionStorage.clear();
   // Luego recargar y re-login
   ```

3. **Verificar respuesta del backend:**
   - F12 → Network → `/api/auth/login`
   - ¿Incluye campo `foto`?

**Soluciones:**

| Causa | Solución |
|-------|----------|
| Cache del navegador | Ctrl+Shift+R para hard reload |
| localStorage antiguo | `localStorage.clear()` + re-login |
| Campo `foto` no en response | Verificar backend |
| Frontend no actualizado | Rebuild Docker container |

### Problema: Error 404 al cargar imagen

**Síntomas:**
- Consola muestra: `❌ [UserMenu] Error cargando foto: /api/personal/foto/...`
- Network tab muestra: `GET /api/personal/foto/... 404`

**Diagnóstico:**

1. **Verificar URL completa:**
   ```
   http://10.0.89.239/api/personal/foto/filename.png
   ```

2. **Verificar que archivo existe en backend:**
   ```bash
   docker exec -it cenate-backend ls -la /app/uploads/personal/
   ```

3. **Verificar nginx proxy:**
   ```nginx
   location /api/ {
       proxy_pass http://backend:8080/api/;
   }
   ```

**Soluciones:**

| Causa | Solución |
|-------|----------|
| Archivo no existe | Subir foto al servidor |
| Endpoint no configurado | Verificar PersonalCntController |
| nginx no proxy | Verificar nginx.conf |
| Permisos de archivo | `chmod 644 /app/uploads/personal/*.png` |

### Problema: Imagen se ve distorsionada

**Síntomas:**
- Foto se ve estirada o comprimida
- No mantiene aspect ratio

**Solución:**

Verificar que la clase `object-cover` esté presente:

```jsx
<img
  src={user.foto}
  className="w-full h-full object-cover"  // ← object-cover es crítico
/>
```

**Alternativas:**

```jsx
object-contain  // Fit dentro del contenedor (puede dejar espacios)
object-cover    // Crop proporcional (recomendado)
object-fill     // Estirar (no recomendado)
```

### Problema: Foto no se actualiza al cambiar

**Síntomas:**
- Usuario sube nueva foto
- Header sigue mostrando foto antigua

**Solución:**

1. **Hacer logout y login nuevamente:**
   ```javascript
   logout();  // Limpia localStorage
   // Luego login nuevamente
   ```

2. **O forzar refresh del contexto:**
   ```javascript
   const { refreshUser } = useAuth();
   refreshUser();  // Re-fetch user data desde /api/usuarios/me
   ```

3. **Cache busting en URL:**
   ```jsx
   <img src={`${user.foto}?t=${Date.now()}`} />
   ```

---

## 📚 Referencias Relacionadas

- [Backend: Módulo Foto Header](../backend/11_modulo_foto_header.md)
- [AuthContext Completo](01_gestion_usuarios_permisos.md)
- [Componentes Layout](01_componentes_layout.md)
- [Design System](../UI-UX/01_design_system_tablas.md)

---

**Última actualización:** 2026-01-28
**Autor:** Ing. Styp Canto Rondón
**Versión:** v1.37.4
