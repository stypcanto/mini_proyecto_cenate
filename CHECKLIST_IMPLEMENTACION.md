# ✅ CHECKLIST DE IMPLEMENTACIÓN - CENATE

## 📋 Guía de Verificación Paso a Paso

Usa este checklist para asegurar que todos los componentes estén correctamente instalados y funcionando.

---

## 🗄️ FASE 1: BASE DE DATOS

### Instalación
- [ ] PostgreSQL 14+ está instalado y corriendo
- [ ] Base de datos `maestro_cenate` está creada
- [ ] Script SQL `03_sistema_login_completo.sql` está ejecutado sin errores

### Verificación
```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Resultado esperado: 5 tablas
-- ✓ dim_permisos
-- ✓ dim_roles
-- ✓ dim_usuarios
-- ✓ roles_permisos
-- ✓ usuarios_roles
```

- [ ] Las 5 tablas existen
- [ ] Usuario SUPERADMIN fue creado

```sql
-- Verificar SUPERADMIN
SELECT * FROM dim_usuarios WHERE name_user = 'superadmin';
```

- [ ] Usuario tiene ID, username, password encriptada
- [ ] Usuario está ACTIVO

```sql
-- Verificar roles
SELECT * FROM dim_roles ORDER BY id_rol;
```

- [ ] 5 Roles existen: SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO

```sql
-- Verificar permisos
SELECT COUNT(*) FROM dim_permisos;
```

- [ ] 18 Permisos existen

```sql
-- Verificar permisos del SUPERADMIN
SELECT DISTINCT p.desc_permiso
FROM dim_usuarios u
JOIN usuarios_roles ur ON u.id_user = ur.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN roles_permisos rp ON r.id_rol = rp.id_rol
JOIN dim_permisos p ON rp.id_permiso = p.id_permiso
WHERE u.name_user = 'superadmin'
ORDER BY p.desc_permiso;
```

- [ ] SUPERADMIN tiene 18 permisos

---

## 🔧 FASE 2: BACKEND

### Configuración
- [ ] Java 17+ está instalado

```bash
java -version
# Resultado esperado: java version "17.x.x" o superior
```

- [ ] Maven o Gradle está instalado

```bash
./mvnw -version
# o
./gradlew -version
```

- [ ] Archivo `application.properties` tiene las credenciales correctas

```bash
cat src/main/resources/application.properties
```

- [ ] URL de base de datos es correcta
- [ ] Usuario de base de datos es correcto
- [ ] Contraseña de base de datos es correcta

### Compilación
```bash
cd backend
./mvnw clean package
```

- [ ] Compilación exitosa sin errores
- [ ] Archivo JAR generado en `target/`

### Ejecución
```bash
./mvnw spring-boot:run
```

- [ ] Backend inicia sin errores
- [ ] Ver en consola: "Started CenateApplication"
- [ ] Backend está escuchando en puerto 8080

### Verificación de Endpoints

#### Health Check
```bash
curl http://localhost:8080/api/auth/health
```

- [ ] Respuesta: `{"status":"OK","service":"Authentication Service"}`

#### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"superadmin","password":"SuperAdmin2024!"}'
```

- [ ] Respuesta código 200
- [ ] Respuesta contiene `token`
- [ ] Respuesta contiene `username: "superadmin"`
- [ ] Respuesta contiene `roles: ["SUPERADMIN"]`
- [ ] Respuesta contiene array de `permisos`

**Guardar el token para siguientes pruebas:**
```bash
export TOKEN="tu_token_aqui"
```

#### Get Current User
```bash
curl http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Respuesta código 200
- [ ] Respuesta contiene información del usuario

#### Get All Users (Admin)
```bash
curl http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN"
```

- [ ] Respuesta código 200
- [ ] Respuesta contiene array de usuarios

### Test Automatizado
```bash
chmod +x test_api.sh
./test_api.sh
```

- [ ] 15/15 tests pasan (100%)
- [ ] No hay errores

---

## 🎨 FASE 3: FRONTEND

### Instalación
- [ ] Node.js 16+ está instalado

```bash
node -version
# Resultado esperado: v16.x.x o superior
```

- [ ] npm está instalado

```bash
npm -version
```

### Setup del Proyecto

#### Opción A: Vite (Recomendado)
```bash
npm create vite@latest cenate-frontend -- --template react
cd cenate-frontend
npm install
npm install react-router-dom
```

- [ ] Proyecto creado sin errores
- [ ] Dependencias instaladas

#### Opción B: Create React App
```bash
npx create-react-app cenate-frontend
cd cenate-frontend
npm install react-router-dom
```

- [ ] Proyecto creado sin errores
- [ ] Dependencias instaladas

### Copiar Componentes
```bash
cp -r ../ejemplos/* src/
```

- [ ] Archivos copiados correctamente
- [ ] Verificar que `src/` tiene:
  - [ ] App.jsx
  - [ ] AuthContext.jsx
  - [ ] ProtectedRoute.jsx
  - [ ] LoginPanel.jsx + .css
  - [ ] Dashboard.jsx + .css
  - [ ] UsersAdmin.jsx + .css
  - [ ] ChangePassword.jsx + .css
  - [ ] Unauthorized.jsx + .css

### Configurar main.jsx (Vite) o index.js (CRA)

**Para Vite (src/main.jsx):**
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

**Para CRA (src/index.js):**
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] Archivo configurado correctamente

### Ejecución
```bash
npm run dev  # Vite
# o
npm start    # CRA
```

- [ ] Frontend inicia sin errores
- [ ] Navegador se abre automáticamente
- [ ] URL: http://localhost:3000 o http://localhost:5173

---

## 🧪 FASE 4: TESTING FUNCIONAL

### Test 1: Login Exitoso
1. [ ] Abrir http://localhost:3000 (o 5173)
2. [ ] Se muestra el panel de login
3. [ ] Ingresar:
   - Username: `superadmin`
   - Password: `SuperAdmin2024!`
4. [ ] Click en "Iniciar Sesión"
5. [ ] Redirige a `/dashboard`
6. [ ] Se muestra el dashboard con:
   - [ ] Nombre de usuario en el header
   - [ ] Badge "SUPERADMIN"
   - [ ] Menú lateral con todas las opciones
   - [ ] Tarjetas de acceso rápido

### Test 2: Login Fallido
1. [ ] Ir a http://localhost:3000/login
2. [ ] Ingresar credenciales incorrectas
3. [ ] Se muestra mensaje de error
4. [ ] NO redirige
5. [ ] NO hay token en localStorage

### Test 3: Protección de Rutas
1. [ ] Cerrar sesión (botón en header)
2. [ ] Intentar acceder a http://localhost:3000/dashboard
3. [ ] Redirige automáticamente a `/login`
4. [ ] Intentar acceder a http://localhost:3000/admin/usuarios
5. [ ] Redirige automáticamente a `/login`

### Test 4: Menú Dinámico
1. [ ] Login como SUPERADMIN
2. [ ] Verificar que el menú lateral muestra:
   - [ ] Aplicaciones (todas)
   - [ ] Administración (Usuarios, Roles, Auditoría)
   - [ ] Reportes
3. [ ] Todos los enlaces son accesibles

### Test 5: Gestión de Usuarios
1. [ ] Login como SUPERADMIN
2. [ ] Ir a "Administración" > "Usuarios"
3. [ ] Se muestra la lista de usuarios
4. [ ] Click en "+ Crear Usuario"
5. [ ] Ingresar datos:
   ```
   Usuario: test_user
   Contraseña: Test2024!
   Roles: [USUARIO]
   Estado: ACTIVO
   ```
6. [ ] Click en "Crear Usuario"
7. [ ] Usuario aparece en la lista
8. [ ] Verificar acciones disponibles:
   - [ ] Desactivar (botón ⏸️)
   - [ ] Eliminar (botón 🗑️) - solo SUPERADMIN

### Test 6: Cambio de Contraseña
1. [ ] Login como SUPERADMIN
2. [ ] Navegar a página de cambio de contraseña
3. [ ] Ingresar:
   - Contraseña actual: `SuperAdmin2024!`
   - Nueva contraseña: `NewPass2024!`
   - Confirmar: `NewPass2024!`
4. [ ] Se muestra indicador de fortaleza
5. [ ] Click en "Cambiar Contraseña"
6. [ ] Mensaje de éxito
7. [ ] Cerrar sesión
8. [ ] Login con nueva contraseña
9. [ ] Login exitoso

### Test 7: Bloqueo por Intentos Fallidos
1. [ ] Cerrar sesión
2. [ ] Intentar login 5 veces con contraseña incorrecta
3. [ ] En el 5to intento: mensaje "Cuenta bloqueada"
4. [ ] Login con contraseña correcta falla
5. [ ] En backend, desbloquear manualmente:
```sql
UPDATE dim_usuarios 
SET failed_attempts = 0, locked_until = NULL 
WHERE name_user = 'superadmin';
```
6. [ ] Login con contraseña correcta funciona

### Test 8: Responsive Design
1. [ ] Abrir DevTools (F12)
2. [ ] Toggle device toolbar
3. [ ] Probar en diferentes tamaños:
   - [ ] Mobile (320px)
   - [ ] Tablet (768px)
   - [ ] Desktop (1024px)
   - [ ] Large (1440px)
4. [ ] UI se adapta correctamente en todos los tamaños

### Test 9: Crear Usuario con Diferentes Roles
1. [ ] Login como SUPERADMIN
2. [ ] Crear usuarios con diferentes roles:
   - [ ] Usuario ADMIN
   - [ ] Usuario ESPECIALISTA
   - [ ] Usuario RADIOLOGO
   - [ ] Usuario USUARIO básico
3. [ ] Cerrar sesión
4. [ ] Login como cada usuario
5. [ ] Verificar que el menú muestra solo las opciones permitidas

---

## 🔒 FASE 5: SEGURIDAD

### Verificaciones de Seguridad
- [ ] Contraseñas están encriptadas en BD (BCrypt)
- [ ] JWT tokens expiran (verificar después de 24h)
- [ ] CORS está configurado correctamente
- [ ] Endpoints protegidos requieren autenticación
- [ ] Roles son verificados en backend
- [ ] No hay console.log con información sensible
- [ ] .env no está en Git (.gitignore)

### Pruebas de Seguridad

#### Test 1: Token Inválido
```bash
curl http://localhost:8080/api/usuarios/me \
  -H "Authorization: Bearer token_invalido_123"
```
- [ ] Respuesta: 401 o 403

#### Test 2: Sin Token
```bash
curl http://localhost:8080/api/usuarios
```
- [ ] Respuesta: 401 o 403

#### Test 3: Usuario sin Permisos
1. [ ] Login como USUARIO básico
2. [ ] Intentar acceder a `/admin/usuarios`
3. [ ] Redirige a `/unauthorized`

---

## 📚 FASE 6: DOCUMENTACIÓN

### Archivos Verificados
- [ ] README.md existe y está completo
- [ ] INSTALACION_COMPLETA.md existe
- [ ] RESUMEN_EJECUTIVO.md existe
- [ ] backend/SISTEMA_LOGIN_GUIA_COMPLETA.md existe
- [ ] frontend/ejemplos/README_FRONTEND.md existe

### Colección de Postman
- [ ] Archivo .json existe
- [ ] Se puede importar en Postman
- [ ] Todos los requests funcionan

---

## 🚀 FASE 7: PREPARACIÓN PARA PRODUCCIÓN

### Backend
- [ ] Cambiar JWT_SECRET_KEY en producción
- [ ] Cambiar contraseña de BD
- [ ] Configurar HTTPS
- [ ] Configurar logging apropiado
- [ ] Configurar backup de BD
- [ ] Revisar CORS allowed origins

### Frontend
- [ ] Cambiar URL del backend (production)
- [ ] Build de producción funciona (`npm run build`)
- [ ] Assets optimizados
- [ ] Configurar servidor web (nginx)

### Infraestructura
- [ ] Firewall configurado
- [ ] SSL/TLS configurado
- [ ] Backup automático
- [ ] Monitoring configurado
- [ ] Logs centralizados

---

## ✅ CHECKLIST FINAL

### Funcionalidades Core
- [ ] Login funciona
- [ ] Logout funciona
- [ ] Cambio de contraseña funciona
- [ ] Crear usuarios funciona
- [ ] Activar/Desactivar usuarios funciona
- [ ] Eliminar usuarios funciona (SUPERADMIN)
- [ ] Roles limitan acceso correctamente
- [ ] Menú se adapta a permisos
- [ ] Bloqueo por intentos fallidos funciona

### Documentación
- [ ] README principal completo
- [ ] Documentación de instalación completa
- [ ] Documentación de API completa
- [ ] Ejemplos de código incluidos
- [ ] Colección de Postman disponible

### Testing
- [ ] Tests automatizados pasan (15/15)
- [ ] Tests manuales completados
- [ ] Pruebas de seguridad pasadas
- [ ] Pruebas responsive completadas

### Producción (Opcional)
- [ ] Variables de entorno configuradas
- [ ] Credenciales por defecto cambiadas
- [ ] HTTPS configurado
- [ ] Logs configurados
- [ ] Backup configurado
- [ ] Monitoring configurado

---

## 🎉 COMPLETADO

Si todos los items están marcados, el sistema está completamente funcional y listo para usar.

**¡Felicidades! Tu sistema de autenticación CENATE está operativo.** 🚀

---

## 📝 NOTAS

- Fecha de completación: ______________
- Versión instalada: 1.0.0
- Instalado por: ______________
- Problemas encontrados: ______________
- Soluciones aplicadas: ______________

---

**Para soporte, consultar:**
- INSTALACION_COMPLETA.md
- SISTEMA_LOGIN_GUIA_COMPLETA.md
- README_FRONTEND.md
