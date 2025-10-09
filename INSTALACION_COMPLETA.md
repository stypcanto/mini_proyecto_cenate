# 🚀 SISTEMA DE LOGIN CON ROLES - INSTALACIÓN COMPLETA

## 📋 RESUMEN DEL SISTEMA

Has recibido un sistema completo de autenticación y autorización para CENATE que incluye:

### ✅ Backend (Spring Boot)
- Sistema de login con JWT
- Gestión de roles y permisos
- Bloqueo automático por intentos fallidos
- API REST completa
- Seguridad con Spring Security

### ✅ Frontend (React)
- Panel de login moderno y responsive
- Dashboard con control de acceso basado en roles
- Panel de administración de usuarios
- Protección de rutas
- Context API para autenticación global

### ✅ Base de Datos (PostgreSQL)
- Usuario SUPERADMIN pre-configurado
- 5 roles: SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO
- 18 permisos del sistema
- Tablas optimizadas con índices

---

## 🎯 INSTALACIÓN PASO A PASO

### PASO 1: Base de Datos ⚙️

```bash
# 1. Conectarse a PostgreSQL
psql -U postgres

# 2. Verificar que la base de datos existe
\l

# 3. Ejecutar el script de instalación
\c maestro_cenate
\i /ruta/completa/backend/sql/03_sistema_login_completo.sql

# 4. Verificar la instalación
SELECT * FROM dim_usuarios WHERE name_user = 'superadmin';
```

**Resultado esperado:**
- Usuario `superadmin` creado
- 5 roles creados
- 18 permisos creados
- Relaciones configuradas

---

### PASO 2: Backend (Spring Boot) 🔧

```bash
# 1. Navegar al directorio del backend
cd /Users/styp/Documents/CENATE/Chatbot/API_Springboot/cenate/backend

# 2. Compilar el proyecto
./mvnw clean package

# 3. Ejecutar la aplicación
./mvnw spring-boot:run

# O si usas Gradle:
./gradlew clean build
./gradlew bootRun
```

**Verificar que está corriendo:**
```bash
curl http://localhost:8080/api/auth/health
```

**Resultado esperado:**
```json
{"status":"OK","service":"Authentication Service"}
```

---

### PASO 3: Testing del Backend 🧪

```bash
# Dar permisos de ejecución al script
chmod +x backend/test_api.sh

# Ejecutar los tests
./backend/test_api.sh
```

**Resultado esperado:**
```
🧪 Iniciando Tests del Sistema de Login
✅ PASS - Backend está disponible
✅ PASS - Login exitoso con SUPERADMIN
✅ PASS - Rol SUPERADMIN presente en respuesta
✅ PASS - Permisos presentes en respuesta
...
📊 RESUMEN: ✅ 15/15 tests exitosos (100%)
```

---

### PASO 4: Frontend (React) 🎨

#### Opción A: Crear nuevo proyecto con Vite (Recomendado)

```bash
# 1. Crear proyecto
npm create vite@latest cenate-frontend -- --template react

# 2. Navegar al proyecto
cd cenate-frontend

# 3. Instalar dependencias
npm install
npm install react-router-dom

# 4. Copiar componentes
cp -r ../frontend/ejemplos/* src/

# 5. Actualizar src/main.jsx
```

**src/main.jsx:**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

```bash
# 6. Ejecutar
npm run dev
```

#### Opción B: Usar con Create React App

```bash
# 1. Crear proyecto
npx create-react-app cenate-frontend

# 2. Navegar al proyecto
cd cenate-frontend

# 3. Instalar dependencias
npm install react-router-dom

# 4. Copiar componentes
cp -r ../frontend/ejemplos/* src/

# 5. Actualizar src/index.js
```

**src/index.js:**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

```bash
# 6. Ejecutar
npm start
```

---

## 🔐 CREDENCIALES INICIALES

### SUPERADMIN
```
Username: superadmin
Password: SuperAdmin2024!
```

**⚠️ IMPORTANTE:** Cambiar esta contraseña después del primer login.

---

## 🧪 TESTING COMPLETO

### 1. Test de Login (Frontend)

1. Abrir navegador en `http://localhost:3000` o `http://localhost:5173`
2. Debería aparecer el panel de login
3. Ingresar credenciales del SUPERADMIN
4. Debería redirigir al Dashboard
5. Verificar que aparece el menú lateral con todas las opciones

### 2. Test de Permisos

1. En el Dashboard, verificar que aparecen todas las secciones:
   - ✅ Especialidades
   - ✅ Radiología
   - ✅ Teleurgencias
   - ✅ Gestión de Citas
   - ✅ Calidad
   - ✅ Gestión TI
   - ✅ Administración (Usuarios, Roles, Auditoría)
   - ✅ Reportes

2. Hacer clic en "Administración" > "Usuarios"
3. Debería mostrar el panel de gestión de usuarios
4. Ver el usuario SUPERADMIN en la lista

### 3. Test de Crear Usuario

1. En el panel de usuarios, hacer clic en "+ Crear Usuario"
2. Ingresar datos:
   ```
   Usuario: admin_test
   Contraseña: Admin2024!
   Roles: [ADMIN]
   Estado: ACTIVO
   ```
3. Hacer clic en "Crear Usuario"
4. Verificar que aparece en la lista

### 4. Test con Nuevo Usuario

1. Cerrar sesión
2. Login con `admin_test` / `Admin2024!`
3. Verificar que NO aparece el menú de "SUPERADMIN"
4. Verificar que SÍ aparece "Administración"

### 5. Test de Seguridad

1. Cerrar sesión
2. Intentar acceder directamente a `http://localhost:3000/admin/usuarios`
3. Debería redirigir a `/login`
4. Intentar 5 veces con contraseña incorrecta
5. En el 5to intento debería bloquearse

---

## 📁 ARCHIVOS CREADOS

### Backend

```
backend/
├── sql/
│   └── 03_sistema_login_completo.sql      # ✅ Script SQL completo
├── src/main/java/styp/com/cenate/
│   ├── dto/
│   │   ├── LoginRequest.java              # ✅ DTO para login
│   │   ├── LoginResponse.java             # ✅ DTO respuesta login
│   │   ├── UsuarioCreateRequest.java      # ✅ DTO crear usuario
│   │   └── UsuarioResponse.java           # ✅ DTO respuesta usuario
│   ├── security/
│   │   ├── UserDetailsServiceImpl.java    # ✅ Servicio UserDetails
│   │   ├── JwtAuthenticationFilter.java   # ✅ Filtro JWT
│   │   └── JwtService.java                # ✅ Ya existía
│   ├── service/
│   │   ├── AuthenticationService.java     # ✅ Servicio de autenticación
│   │   └── UsuarioService.java            # ✅ Servicio de usuarios
│   ├── config/
│   │   └── SecurityConfig.java            # ✅ Configuración de seguridad
│   └── api/
│       ├── AuthController.java            # ✅ Controlador de auth
│       └── UsuarioController.java         # ✅ Controlador de usuarios
├── test_api.sh                            # ✅ Script de testing
└── SISTEMA_LOGIN_GUIA_COMPLETA.md         # ✅ Documentación completa
```

### Frontend

```
frontend/ejemplos/
├── App.jsx                                # ✅ App principal con rutas
├── AuthContext.jsx                        # ✅ Context de autenticación
├── ProtectedRoute.jsx                     # ✅ Protección de rutas
├── LoginPanel.jsx                         # ✅ Panel de login
├── LoginPanel.css
├── Dashboard.jsx                          # ✅ Dashboard principal
├── Dashboard.css
├── UsersAdmin.jsx                         # ✅ Admin de usuarios
├── UsersAdmin.css
├── Unauthorized.jsx                       # ✅ Página no autorizado
├── Unauthorized.css
└── README_FRONTEND.md                     # ✅ Documentación frontend
```

---

## 🎯 PRÓXIMOS PASOS

Una vez instalado y probado:

1. **Cambiar contraseña del SUPERADMIN**
   - Login → Ir a perfil → Cambiar contraseña

2. **Crear usuarios para tu equipo**
   - Admin → Usuarios → Crear Usuario
   - Asignar roles apropiados

3. **Personalizar el frontend**
   - Cambiar colores en CSS
   - Agregar logo de CENATE
   - Modificar textos según necesites

4. **Implementar funcionalidades adicionales:**
   - Cambio de contraseña
   - Recuperación de contraseña
   - Perfil de usuario
   - Auditoría de acciones
   - 2FA (autenticación de dos factores)

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Backend no inicia

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Verificar credenciales en application.properties
cat src/main/resources/application.properties

# Ver logs del error
./mvnw spring-boot:run
```

### Frontend no conecta con Backend

1. Verificar que backend está en `http://localhost:8080`
2. Verificar CORS en SecurityConfig.java
3. Ver consola del navegador (F12) para errores

### Error de permisos en scripts

```bash
chmod +x backend/test_api.sh
```

### Usuario bloqueado

```sql
-- Desbloquear manualmente
UPDATE dim_usuarios 
SET failed_attempts = 0, locked_until = NULL 
WHERE name_user = 'superadmin';
```

---

## 📞 SOPORTE

### Logs útiles:

**Backend:**
```bash
# Ver logs en tiempo real
./mvnw spring-boot:run

# O si está corriendo como servicio
tail -f /var/log/cenate/application.log
```

**Frontend:**
```bash
# Consola del navegador
F12 → Console

# Ver requests HTTP
F12 → Network
```

**Base de Datos:**
```sql
-- Ver usuarios
SELECT * FROM dim_usuarios;

-- Ver roles de un usuario
SELECT u.name_user, r.desc_rol 
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
WHERE u.name_user = 'superadmin';

-- Ver permisos de un usuario
SELECT DISTINCT u.name_user, p.desc_permiso
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN roles_permisos rp ON r.id_rol = rp.id_rol
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE u.name_user = 'superadmin';
```

---

## 🎉 ¡LISTO!

Tu sistema de login con roles está completamente configurado y listo para usar.

**Credenciales de prueba:**
- Username: `superadmin`
- Password: `SuperAdmin2024!`

**URLs:**
- Backend: `http://localhost:8080`
- Frontend: `http://localhost:3000` o `http://localhost:5173`
- Login: `http://localhost:3000/login`
- Dashboard: `http://localhost:3000/dashboard`

---

**Fecha de creación:** 08/10/2025  
**Versión:** 1.0.0  
**Sistema:** CENATE - Centro Nacional de Telemedicina  
**Desarrollado para:** EsSalud Perú
