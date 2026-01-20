# 🔐 Reporte de Testing - Login Paciente DNI: 22672403

**Fecha**: 2026-01-19
**Usuario Probado**: Paciente DNI 22672403
**Contraseña Proporcionada**: `@Prueba654321`
**URL API**: `http://localhost:8080/api/auth/login`
**Estado General**: ❌ **FALLO DE AUTENTICACIÓN**

---

## 📊 Tabla Resumen de Errores

| # | Paso de Testing | Estado | Error/Resultado | Causa Probable | Severidad |
|---|-----------------|--------|-----------------|-----------------|-----------|
| 1 | **Health Check API** | ❌ FALLO | HTTP 500 - Endpoint no encontrado | No existe endpoint `/actuator/health` | ⚠️ MEDIA |
| 2 | **Login con DNI 22672403** | ❌ FALLO | `"error": "Credenciales inválidas"` | Usuario no existe O contraseña incorrecta | 🔴 CRÍTICA |
| 3 | **Verificación en BD** | ❌ NO EJECUTADO | Pendiente | Usuario podría no existir en la BD | 🔴 CRÍTICA |
| 4 | **Intento alterno** | ❌ FALLO | Mismo error "Credenciales inválidas" | Confirma problema de credenciales | 🔴 CRÍTICA |
| 5 | **Estado del Backend** | ✅ CORRIENDO | API respondiendo en puerto 8080 | Spring Boot está activo | ✅ OK |
| 6 | **Autenticador Spring** | ❌ FALLO | authenticationManager retorna error | Credenciales no coinciden o usuario no existe | 🔴 CRÍTICA |

---

## 🔴 Errores Críticos Encontrados

### Error 1: Credenciales Inválidas
```json
{
  "error": "Credenciales inválidas"
}
```
**Descripción**: El backend rechaza las credenciales del usuario.

**Causa Probable**:
1. El usuario DNI `22672403` **NO EXISTE** en la base de datos
2. El usuario existe pero la contraseña `@Prueba654321` es incorrecta
3. La contraseña está encriptada incorrectamente

**Recomendaciones**:
- ✅ Verificar si el usuario existe en BD: `SELECT * FROM dim_usuarios WHERE num_documento = '22672403'`
- ✅ Verificar si el usuario tiene estado ACTIVO ('A')
- ✅ Confirmar la contraseña correcta con el administrador
- ✅ Verificar el algoritmo de encriptación (BCrypt esperado)

---

### Error 2: Backend Health Check
```
HTTP 500 - No endpoint GET /actuator/health
```
**Descripción**: El endpoint de salud del API no está disponible.

**Impacto**: Bajo - Es solo para monitoreo, pero indica problemas de configuración

**Recomendaciones**:
- Agregar dependencia Actuator en `build.gradle`
- Habilitar endpoint en `application.properties`:
  ```properties
  management.endpoints.web.exposure.include=health
  management.endpoint.health.show-details=always
  ```

---

## 🔧 Pasos de Diagnóstico Recomendados

### Paso 1: Verificar Usuario en BD
```sql
-- Buscar usuario por DNI
SELECT id_user, username, nombre, apellidos, num_documento, email, estado, stat_user
FROM dim_usuarios
WHERE num_documento = '22672403';

-- Verificar estado del usuario
SELECT id_user, nombre, apellidos, stat_user, email, activo
FROM dim_usuarios
WHERE num_documento = '22672403' AND stat_user IN ('A', 'ACTIVO');
```

### Paso 2: Listar Usuarios de Prueba Disponibles
```sql
SELECT id_user, username, nombre, apellidos, num_documento, email, stat_user
FROM dim_usuarios
WHERE stat_user IN ('A', 'ACTIVO')
LIMIT 10;
```

### Paso 3: Crear Usuario de Prueba si No Existe
```sql
INSERT INTO dim_usuarios (
    username,
    nombre,
    apellidos,
    num_documento,
    email,
    pass_user,
    stat_user,
    activo,
    created_at
)
VALUES (
    '22672403',
    'Juan',
    'Pérez',
    '22672403',
    'juan.perez@example.com',
    -- Hash de '@Prueba654321' con BCrypt
    '$2a$10$...',  -- Se debe generar con BCrypt
    'A',
    true,
    NOW()
)
ON CONFLICT (username) DO NOTHING;
```

### Paso 4: Actualizar Contraseña si Usuario Existe
```sql
-- Se requiere hash BCrypt de '@Prueba654321'
UPDATE dim_usuarios
SET pass_user = '$2a$10$...'
WHERE num_documento = '22672403';
```

---

## 📋 Secuencia de Testing Ejecutada

```
1️⃣  Verificar API disponible
    └─> HTTP 500 (Endpoint /actuator/health no existe)

2️⃣  Intentar Login DNI 22672403 + @Prueba654321
    └─> "Credenciales inválidas"

3️⃣  Intentar Login alternativo (mismo usuario/password)
    └─> "Credenciales inválidas"

4️⃣  Revisar Controlador Auth
    └─> ✅ Bien implementado (manejo de excepciones correcto)

5️⃣  Revisar Servicio de Autenticación
    └─> ✅ Usa authenticationManager (Spring Security estándar)

6️⃣  Conclusión
    └─> El problema está en los datos (usuario/contraseña), NO en el código
```

---

## 🎯 Acciones Recomendadas (Orden de Prioridad)

| Prioridad | Acción | Responsable | Estado |
|-----------|--------|------------|--------|
| 🔴 1 | Verificar si usuario 22672403 existe en BD | DBA/Admin | ⏳ PENDIENTE |
| 🔴 2 | Confirmar contraseña correcta con usuario | Admin | ⏳ PENDIENTE |
| 🟡 3 | Crear/Actualizar usuario en BD si es necesario | DBA | ⏳ PENDIENTE |
| 🟡 4 | Re-ejecutar test de login después de actualizar BD | Tester | ⏳ PENDIENTE |
| 🟢 5 | Habilitar Actuator health endpoint (mejora) | DevOps | ⏳ PENDIENTE |

---

## 📝 Logs Relevantes

### Log del Backend (AuthController)
```
🔐 Intentando autenticación MBAC para usuario: 22672403
❌ Error en login: Credenciales inválidas
```

### Código del Controlador Relevante
```java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthRequest request) {
    try {
        log.info("🔐 Intentando autenticación MBAC para usuario: {}", request.getUsername());
        AuthResponse response = authenticationService.authenticate(request);
        log.info("✅ Login exitoso → {}", request.getUsername());
        return ResponseEntity.ok(response);
    } catch (RuntimeException e) {
        log.error("❌ Error en login: {}", e.getMessage());
        // ... manejo de errores ...
        return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
    }
}
```

---

## ✅ Verificaciones Pendientes

- [ ] Ejecutar query SQL para verificar usuario en BD
- [ ] Confirmar estado del usuario (debe ser 'A' o 'ACTIVO')
- [ ] Confirmar contraseña correcta
- [ ] Crear usuario de prueba si no existe
- [ ] Re-ejecutar login test después de actualizar BD
- [ ] Verificar si usuario está habilitado para acceso
- [ ] Revisar roles asignados al usuario

---

## 🔗 Referencias de Código

| Componente | Ubicación | Descripción |
|-----------|-----------|-------------|
| **AuthController** | `/api/seguridad/AuthController.java` | Endpoint POST /login |
| **AuthenticationService** | `/service/auth/AuthenticationServiceImpl.java` | Lógica de autenticación |
| **AuthRequest** | `/dto/auth/AuthRequest.java` | DTO de login (username, password) |
| **Usuario Model** | `/model/Usuario.java` | Entidad de usuario en BD |

---

## 📞 Próximos Pasos

**Si la BD está actualizada correctamente y el usuario existe:**
1. Capturar logs detallados del backend
2. Revisar configuración de PasswordEncoder (BCrypt)
3. Ejecutar test nuevamente desde el navegador
4. Considerar agregar más logs en AuthenticationServiceImpl

**Si el usuario NO existe en la BD:**
1. Crear usuario manualmente en la BD
2. Asegurar que tenga rol asignado
3. Asegurar que tenga estado ACTIVO
4. Re-ejecutar test

---

*Reporte generado automáticamente - 2026-01-19 16:39*
