# 🚀 GUÍA DE IMPLEMENTACIÓN - Sistema con Códigos de Usuario

## 📋 Resumen de Cambios

Hemos actualizado tu sistema para usar **códigos de usuario** en lugar de DNI:

### ✅ Lo que ya funciona:
- Backend usa `name_user` (campo de texto) ✅
- Base de datos acepta códigos alfanuméricos ✅
- API REST ya está lista ✅

### 🔄 Lo que necesitas actualizar:
- Frontend para pedir "Código de Usuario" en lugar de "DNI"
- Crear usuarios con códigos en la base de datos

---

## PASO 1: Actualizar Base de Datos

### 1.1 Conectar a PostgreSQL

```bash
psql -U postgres -d maestro_cenate
```

### 1.2 Ejecutar Script de Usuarios

```bash
# Desde terminal
psql -U postgres -d maestro_cenate -f backend/sql/04_crear_usuarios_con_codigos.sql

# O desde psql
\i /ruta/completa/backend/sql/04_crear_usuarios_con_codigos.sql
```

### 1.3 Verificar Usuarios Creados

```sql
SELECT 
    u.name_user as "Código",
    STRING_AGG(r.desc_rol, ', ') as "Roles",
    u.stat_user as "Estado"
FROM dim_usuarios u
LEFT JOIN usuarios_roles ur ON u.id_user = ur.id_user
LEFT JOIN dim_roles r ON ur.id_rol = r.id_rol
GROUP BY u.id_user, u.name_user, u.stat_user
ORDER BY u.id_user;
```

**Resultado esperado:**
```
   Código    |    Roles     | Estado 
-------------|--------------|--------
 superadmin  | SUPERADMIN   | ACTIVO
 ADMIN001    | ADMIN        | ACTIVO
 MED001      | ESPECIALISTA | ACTIVO
 RAD001      | RADIOLOGO    | ACTIVO
 USR001      | USUARIO      | ACTIVO
```

---

## PASO 2: Actualizar Frontend

### 2.1 Ubicación de Archivos

Los archivos actualizados están en:
```
frontend/ejemplos/
├── LoginPanel.jsx (ACTUALIZADO)
└── LoginPanel.css (ACTUALIZADO)
```

### 2.2 Copiar Archivos Actualizados

#### Si usas Vite:
```bash
cd cenate-frontend
cp ../frontend/ejemplos/LoginPanel.jsx src/
cp ../frontend/ejemplos/LoginPanel.css src/
```

#### Si usas Create React App:
```bash
cd cenate-frontend
cp ../frontend/ejemplos/LoginPanel.jsx src/
cp ../frontend/ejemplos/LoginPanel.css src/
```

### 2.3 Verificar que App.jsx esté configurado

Tu `App.jsx` debe tener:
```jsx
import LoginPanel from './LoginPanel';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPanel />} />
          {/* ... otras rutas */}
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
```

---

## PASO 3: Probar el Sistema

### 3.1 Iniciar Backend

```bash
cd backend
./mvnw spring-boot:run
```

**Verificar que está corriendo:**
```bash
curl http://localhost:8080/api/auth/health
# Debe responder: {"status":"OK","service":"Authentication Service"}
```

### 3.2 Iniciar Frontend

```bash
cd frontend
npm run dev    # Vite
# o
npm start      # Create React App
```

### 3.3 Abrir en Navegador

- Vite: `http://localhost:5173`
- CRA: `http://localhost:3000`

### 3.4 Probar Login

Usa cualquiera de estos usuarios:

| Código Usuario | Contraseña | Rol |
|----------------|------------|-----|
| `superadmin` | `SuperAdmin2024!` | SUPERADMIN |
| `ADMIN001` | `SuperAdmin2024!` | ADMIN |
| `MED001` | `SuperAdmin2024!` | ESPECIALISTA |
| `RAD001` | `SuperAdmin2024!` | RADIOLOGO |
| `USR001` | `SuperAdmin2024!` | USUARIO |

---

## PASO 4: Crear Usuarios Personalizados

### 4.1 Usando el Panel de Administración (Recomendado)

1. Login como `superadmin`
2. Ir a "Administración" → "Usuarios"
3. Click en "+ Crear Usuario"
4. Ingresar datos:
   - **Usuario:** `DR_PEREZ` (o el código que prefieras)
   - **Contraseña:** `Password2024!`
   - **Roles:** Seleccionar rol apropiado
   - **Estado:** ACTIVO
5. Click en "Crear Usuario"

### 4.2 Usando SQL (Avanzado)

```sql
DO $$
DECLARE
    v_id_rol INTEGER;
BEGIN
    -- Seleccionar el rol (SUPERADMIN, ADMIN, ESPECIALISTA, RADIOLOGO, USUARIO)
    SELECT id_rol INTO v_id_rol 
    FROM dim_roles 
    WHERE desc_rol = 'ESPECIALISTA';
    
    -- Crear el usuario
    INSERT INTO dim_usuarios (
        name_user, 
        pass_user, 
        stat_user, 
        create_at, 
        update_at, 
        password_changed_at, 
        failed_attempts
    ) VALUES (
        'DR_GARCIA',  -- Tu código de usuario
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhCy', -- SuperAdmin2024!
        'ACTIVO',
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        CURRENT_TIMESTAMP, 
        0
    );
    
    -- Asignar rol
    INSERT INTO usuarios_roles (id_user, id_rol)
    SELECT id_user, v_id_rol 
    FROM dim_usuarios 
    WHERE name_user = 'DR_GARCIA';
    
    RAISE NOTICE 'Usuario DR_GARCIA creado exitosamente';
END $$;
```

---

## PASO 5: Convenciones de Códigos (Sugerencias)

### Ejemplos de Códigos por Área:

| Área | Formato | Ejemplos |
|------|---------|----------|
| **Administración** | `ADM###` | `ADM001`, `ADM002` |
| **Médicos** | `MED###` o `DR_NOMBRE` | `MED001`, `DR_PEREZ` |
| **Radiología** | `RAD###` | `RAD001`, `RAD002` |
| **TI/Sistemas** | `TI###` o `SIS###` | `TI001`, `SIS_ADMIN` |
| **Enfermería** | `ENF###` | `ENF001`, `ENF002` |
| **Personal** | Nombre o iniciales | `jperez`, `mgarcia` |

### Reglas Recomendadas:

✅ **Usar:**
- Letras y números
- Guiones bajos `_`
- Mayúsculas o minúsculas consistentes

❌ **Evitar:**
- Espacios
- Caracteres especiales (excepto `_`)
- Códigos muy largos (máx 20 caracteres)

---

## PASO 6: Testing Completo

### Test 1: Login Exitoso ✅

1. Abrir `http://localhost:3000/login`
2. Ingresar:
   - **Código:** `superadmin`
   - **Contraseña:** `SuperAdmin2024!`
3. Click "Iniciar sesión"
4. **Resultado esperado:** Redirige a `/dashboard`

### Test 2: Login con Diferentes Usuarios ✅

Probar con cada usuario creado:
- `ADMIN001`
- `MED001`
- `RAD001`
- `USR001`

Verificar que cada uno ve diferente menú según sus permisos.

### Test 3: Login Fallido ✅

1. Ingresar código correcto pero contraseña incorrecta
2. **Resultado esperado:** Mensaje de error
3. **NO debe redirigir**

### Test 4: Usuario No Existente ✅

1. Ingresar código que no existe: `USUARIO_FALSO`
2. **Resultado esperado:** Mensaje de error "Usuario o contraseña incorrectos"

### Test 5: Crear Usuario desde Panel ✅

1. Login como `superadmin`
2. Ir a "Administración" → "Usuarios"
3. Crear nuevo usuario con código `TEST001`
4. Cerrar sesión
5. Login con `TEST001`
6. Verificar que funciona

---

## PASO 7: Cambiar Contraseñas

### Usando el Panel (Recomendado)

1. Login con el usuario
2. Ir a "Cambiar Contraseña"
3. Ingresar:
   - Contraseña actual
   - Nueva contraseña
   - Confirmar nueva contraseña
4. Guardar cambios

### Usando SQL

```sql
-- Cambiar contraseña de un usuario específico
UPDATE dim_usuarios
SET 
    pass_user = '$2a$10$TU_PASSWORD_ENCRIPTADO_AQUI',
    password_changed_at = CURRENT_TIMESTAMP,
    failed_attempts = 0
WHERE name_user = 'superadmin';
```

**Para generar password encriptado en BCrypt:**
- Usa: https://bcrypt-generator.com/
- Rounds: 10
- Copiar el hash generado

---

## 📊 Resumen de Archivos Modificados

### Backend:
✅ `Usuario.java` - Ya usa `name_user` (TEXT)  
✅ `AuthenticationService.java` - Funciona con códigos  
✅ `LoginRequest.java` - Campo `username`  

### Frontend:
🔄 `LoginPanel.jsx` - **ACTUALIZADO** (pide código en lugar de DNI)  
🔄 `LoginPanel.css` - **ACTUALIZADO** (estilos mejorados)  

### Base de Datos:
🆕 `04_crear_usuarios_con_codigos.sql` - **NUEVO** (script para crear usuarios)

---

## ✅ Checklist Final

- [ ] Script SQL ejecutado sin errores
- [ ] Usuarios creados en base de datos
- [ ] Frontend actualizado con nuevos archivos
- [ ] Backend corriendo en puerto 8080
- [ ] Frontend corriendo en puerto 3000/5173
- [ ] Login con `superadmin` funciona
- [ ] Otros usuarios también funcionan
- [ ] Panel de administración accesible
- [ ] Crear usuarios desde panel funciona
- [ ] Cambio de contraseña funciona

---

## 🆘 Problemas Comunes

### Error: "Usuario no encontrado"
- Verificar que el código esté exactamente como en la BD
- Los códigos distinguen mayúsculas/minúsculas

### Error: CORS
- Verificar que backend tenga CORS configurado para tu frontend
- Ver `SecurityConfig.java` → `corsConfigurationSource()`

### Error: "Cannot read property of null"
- Asegurarse de tener `<AuthProvider>` en App.jsx

### Frontend no se actualiza
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run dev
```

---

## 🎯 ¡Listo!

Tu sistema ahora usa **códigos de usuario** alfanuméricos en lugar de DNI.

**Usuarios de prueba disponibles:**
- `superadmin` - Acceso total
- `ADMIN001` - Administrador
- `MED001` - Especialista
- `RAD001` - Radiólogo
- `USR001` - Usuario básico

**Todos con contraseña:** `SuperAdmin2024!`

**⚠️ Recuerda cambiar las contraseñas después del primer login.**

---

**Fecha:** 08/10/2025  
**Versión:** 1.1.0  
**Sistema:** CENATE - Centro Nacional de Telemedicina
