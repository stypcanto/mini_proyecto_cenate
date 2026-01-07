# 📋 Plan de Unificación: Creación de Usuarios con Enlace por Email

**Versión:** 1.0
**Fecha:** 2026-01-06
**Estado:** 📋 PENDIENTE IMPLEMENTACIÓN
**Componentes Afectados:** Backend (Spring Boot), Frontend (React), Email Service

---

## 🎯 Objetivo

Unificar la lógica de **creación de usuarios** con la de **recuperación de contraseña**, para que:
- ✅ Los nuevos usuarios **reciban un enlace por email** para establecer su propia contraseña
- ✅ No se generen contraseñas temporales inseguras hardcoded (`@Cenate2025`)
- ✅ El flujo sea **consistente** con recuperación de contraseña
- ✅ Mejora de **seguridad** (contraseña generada por el usuario, no por el sistema)

---

## 📊 Análisis de Impacto

### Componentes Afectados

| Componente | Cambio | Criticidad | Estado |
|-----------|--------|-----------|--------|
| `UsuarioController.createUser()` | ❌ Modificar endpoint | Media | ⏳ Pendiente |
| `UsuarioServiceImpl.createUser()` | ✏️ Cambiar lógica de contraseña | Media | ⏳ Pendiente |
| `PasswordTokenService` | ➕ Agregar tipo `CREAR_USUARIO` | Baja | ⏳ Pendiente |
| `CrearUsuarioModal.jsx` | ✏️ Remover contraseña temporal | Media | ⏳ Pendiente |
| `EmailService.enviarCorreoCambioContrasena()` | 📧 Reutilizar (con parametrización) | Baja | ✅ Existente |
| `AuthController` (/cambiar-contrasena) | 🔄 Reutilizar endpoint | Ninguno | ✅ Existente |

---

## 🔄 Flujo Actual vs Flujo Deseado

### ❌ Flujo ACTUAL (Inseguro)

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN                                                       │
└────────────────┬──────────────────────────────────────────┘
                 │ 1. Llena datos + roles
                 ↓
        ┌────────────────────┐
        │ CrearUsuarioModal  │
        └────────┬───────────┘
                 │ 2. Envía: datos + password: "@Cenate2025"
                 ↓
        ┌────────────────────────────┐
        │ POST /usuarios/crear       │
        │ (UsuarioController)        │
        └────────┬───────────────────┘
                 │ 3. Crea usuario con password = "@Cenate2025"
                 ↓
        ┌────────────────────────────┐
        │ Usuario Creado en BD       │
        │ password = hash(@C...)     │
        └────────┬───────────────────┘
                 │ 4. Alert: muestra password en pantalla
                 ↓
        ┌────────────────────────────┐
        │ ADMIN ve: "@Cenate2025"    │
        │ y lo copia manualmente     │
        └────────┬───────────────────┘
                 │ 5. Envía contraseña por otros medios
                 │    (WhatsApp, email manual, etc)
                 ↓
        ┌─────────────────────────┐
        │ USUARIO recibe password │
        │ via múltiples canales   │
        └─────────────────────────┘

⚠️ PROBLEMAS:
- Contraseña visible en pantalla
- Transmisión insegura por otros canales
- No hay registro en email del sistema
- Contraseña débil y reutilizada
```

---

### ✅ Flujo DESEADO (Seguro)

```
┌─────────────────────────────────────────────────────────────┐
│ ADMIN                                                       │
└────────────────┬──────────────────────────────────────────┘
                 │ 1. Llena datos + roles (SIN PASSWORD)
                 ↓
        ┌────────────────────┐
        │ CrearUsuarioModal  │
        └────────┬───────────┘
                 │ 2. Envía: datos SIN password
                 ↓
        ┌────────────────────────────┐
        │ POST /usuarios/crear       │
        │ (UsuarioController)        │
        └────────┬───────────────────┘
                 │ 3.1 Crea usuario CON PASSWORD VACIO o RANDOM
                 │ 3.2 Genera token aleatorio (BASE64)
                 │ 3.3 Guarda token en PasswordResetToken
                 ↓
        ┌────────────────────────────┐
        │ Usuario Creado en BD       │
        │ password = hash(random)    │
        │ + Token guardado           │
        └────────┬───────────────────┘
                 │ 3.4 Llama a PasswordTokenService
                 │     .crearTokenYEnviarEmail()
                 ↓
        ┌────────────────────────────┐
        │ EmailService envia email   │
        │ con link:                  │
        │ /cambiar-contraseña?       │
        │ token=xxxxx                │
        └────────┬───────────────────┘
                 │ 4. Email llega a usuario
                 ↓
        ┌─────────────────────────────┐
        │ USUARIO hace click en link  │
        │ entra a página de cambio    │
        │ de contraseña               │
        └────────┬────────────────────┘
                 │ 5. Usuario ingresa su propia password
                 ↓
        ┌─────────────────────────────┐
        │ Password actualizada en BD  │
        │ Token marcado como "usado"  │
        └─────────────────────────────┘

✅ VENTAJAS:
- Password GENERADO POR EL USUARIO (más seguro)
- Transmisión segura por email corporativo
- Registro en email del sistema
- Token expira en 24 horas
- Consistente con recuperación de contraseña
```

---

## 📝 Checklist de Implementación

### FASE 1: Preparación y Análisis ✅

- [ ] **Revisar código actual**
  - [ ] `UsuarioController.createUser()` (línea 144)
  - [ ] `UsuarioServiceImpl.createUser()` (línea 99)
  - [ ] `PasswordTokenService` (completo)
  - [ ] `CrearUsuarioModal.jsx` (línea 593, 955)

- [ ] **Identificar dependencias**
  - [ ] ¿Hay otros endpoints que llamen a `createUser()`?
  - [ ] ¿Hay tests unitarios que debamos actualizar?
  - [ ] ¿Hay scripts de importación masiva (Bolsa 107)?

- [ ] **Verificar email service**
  - [ ] `EmailService.enviarCorreoCambioContrasena()` funciona para "CREAR_USUARIO"?
  - [ ] ¿Necesita parametrización adicional?

---

### FASE 2: Backend - Cambios en Controlador ⏳

**Archivo:** `backend/src/main/java/com/styp/cenate/api/usuario/UsuarioController.java`

- [ ] **Modificar método `createUser()` (línea 140-175)**
  - [ ] Remover parámetro `password` del DTO o hacerlo opcional
  - [ ] Si `password` es NULL → generar contraseña random o usar password temporaria
  - [ ] Después de guardar usuario → llamar a `passwordTokenService.crearTokenYEnviarEmail()`
  - [ ] Retornar mensaje: "Usuario creado. Email enviado a {email} para establecer contraseña"
  - [ ] Registrar en auditoría: `auditLogService.registrarEvento()`

- [ ] **Actualizar DTOs**
  - [ ] `UsuarioCreateRequest.java` → hacer `password` opcional
  - [ ] Documentar cambio en comentarios

- [ ] **Manejar errores**
  - [ ] Si falla envío de email → retornar error 500 con detalles
  - [ ] Si usuario sin email → retornar error 400

---

### FASE 3: Backend - Cambios en Servicio ⏳

**Archivo:** `backend/src/main/java/com/styp/cenate/service/usuario/UsuarioServiceImpl.java`

- [ ] **Modificar método `createUser()` (línea 99-350)**
  - [ ] Si `request.getPassword()` es NULL o vacio:
    - [ ] Generar password random de 16 caracteres
    - [ ] Usar `passwordTokenService.generarPasswordTemporal()`
  - [ ] Codificar password y guardar usuario
  - [ ] Retornar usuario sin incluir la contraseña en response

- [ ] **Agregar lógica de token**
  - [ ] Después de guardar usuario → obtener su email
  - [ ] Llamar a `passwordTokenService.crearTokenYEnviarEmail(usuario, "CREAR_USUARIO")`
  - [ ] Manejar respuesta (true/false) del servicio de token

---

### FASE 4: Backend - Cambios en PasswordTokenService ⏳

**Archivo:** `backend/src/main/java/com/styp/cenate/service/security/PasswordTokenService.java`

- [ ] **Agregar soporte para tipo "CREAR_USUARIO"**
  - [ ] En método `crearTokenYEnviarEmailDirecto()` (línea 155)
  - [ ] Validar tipo de acción (RESET, CREAR_USUARIO)
  - [ ] Usar mismo token expiration (24 horas)

- [ ] **Actualizar EmailService call**
  - [ ] Pasar parámetro `tipoAccion` = "CREAR_USUARIO"
  - [ ] Verificar que EmailService lo use correctamente

---

### FASE 5: Backend - Cambios en EmailService ⏳

**Archivo:** `backend/src/main/java/com/styp/cenate/service/email/EmailService.java`

- [ ] **Parametrizar método `enviarCorreoCambioContrasena()`**
  - [ ] Si `tipoAccion == "CREAR_USUARIO"` → cambiar asunto y texto del email
    - [ ] Asunto actual: "Restablecimiento de Contraseña"
    - [ ] Asunto nuevo: "Bienvenido a CENATE - Establece tu Contraseña"
  - [ ] Mantener compatibilidad con "RESET"

- [ ] **Actualizar template de email**
  - [ ] Para CREAR_USUARIO: mensaje de bienvenida diferente
  - [ ] Para RESET: mensaje de recuperación (igual a actual)

---

### FASE 6: Frontend - Cambios en Modal ⏳

**Archivo:** `frontend/src/pages/user/components/common/CrearUsuarioModal.jsx`

- [ ] **Remover campo password temporal (línea 593)**
  - [ ] Eliminar: `const passwordTemporal = '@Cenate2025';`

- [ ] **Actualizar handleSubmit() (línea 955)**
  - [ ] Remover: `password: passwordTemporal,`
  - [ ] Comentar temporalmente para que NO se envíe password

- [ ] **Actualizar alert de éxito (línea 1082)**
  - [ ] Cambiar mensaje actual:
    ```
    `✅ Usuario creado exitosamente...
     Username: ${username}
     Password temporal: ${passwordTemporal}...`
    ```
  - [ ] Nuevo mensaje:
    ```
    `✅ Usuario creado exitosamente

     Se ha enviado un correo a:
     ${formData.correo_personal}

     El usuario debe:
     1. Revisar su correo
     2. Hacer clic en el enlace
     3. Establecer su propia contraseña

     El enlace expira en 24 horas.`
    ```

- [ ] **Remover lógicas dependientes de password visible**
  - [ ] Remover lógica de copiar password
  - [ ] Actualizar help text

---

### FASE 7: Testing - Unitario ⏳

**Backend:**

- [ ] **Tests para `UsuarioController.createUser()`**
  - [ ] Test: Crear usuario SIN password → debe generar token
  - [ ] Test: Crear usuario SIN email → debe retornar error
  - [ ] Test: Verificar que email se envía
  - [ ] Test: Verificar que usuario se crea con estado ACTIVO

- [ ] **Tests para `PasswordTokenService`**
  - [ ] Test: Token se genera correctamente
  - [ ] Test: Token se guarda en BD
  - [ ] Test: tipoAccion = "CREAR_USUARIO" se persiste

**Frontend:**

- [ ] **Tests para `CrearUsuarioModal`**
  - [ ] Test: No envía `password` field
  - [ ] Test: Alert muestra mensaje de email
  - [ ] Test: No muestra contraseña temporal

---

### FASE 8: Testing - Integración ⏳

**Escenario 1: Crear usuario INTERNO**

- [ ] Admin accede a "Crear Usuario"
- [ ] Llena formulario (SIN ver campo password)
- [ ] Hace click "Crear"
- [ ] Usuario se crea en BD
- [ ] Email se envía a `correo_personal`
- [ ] Email contiene link `/cambiar-contrasena?token=xxxxx`
- [ ] Token está guardado en `password_reset_token` table
- [ ] User hace click en link
- [ ] Page `/cambiar-contrasena` valida token
- [ ] User ingresa contraseña
- [ ] Contraseña se actualiza
- [ ] Usuario puede loguear con nueva contraseña

**Escenario 2: Crear usuario EXTERNO**

- [ ] Mismo flujo que INTERNO
- [ ] Verificar que se envía a `correo_personal` de PersonalExterno

**Escenario 3: Token expira**

- [ ] Generar token
- [ ] Esperar 24 horas (o modificar BD manualmente)
- [ ] Intentar usar link
- [ ] Debe retornar error "Token expirado"

**Escenario 4: Token ya usado**

- [ ] Generar token
- [ ] Usar token para establecer password
- [ ] Intentar usar mismo token nuevamente
- [ ] Debe retornar error "Token ya utilizado"

---

### FASE 9: Testing - Seguridad ⏳

- [ ] **Password no es visible en:**
  - [ ] Pantalla del admin
  - [ ] Logs del sistema
  - [ ] Respuesta del API

- [ ] **Token es seguro:**
  - [ ] Token es aleatorio (BASE64)
  - [ ] Token no es predecible
  - [ ] Token no aparece en logs

- [ ] **Email es seguro:**
  - [ ] Link solo funciona 1 vez
  - [ ] Link no se puede reutilizar
  - [ ] Solo el usuario con ese email puede usarlo

---

### FASE 10: Actualización de Documentación ⏳

- [ ] **Actualizar CLAUDE.md**
  - [ ] Agregar cambio a sección de módulos

- [ ] **Actualizar README de creación de usuarios**
  - [ ] Cambiar flujo de "password temporal" a "enlace por email"

- [ ] **Actualizar changelog**
  - [ ] `checklist/01_Historial/01_changelog.md`
  - [ ] Versión: v1.18.0 (o siguiente)
  - [ ] Descripción: "Unificación: Creación de usuarios con enlace por email"

- [ ] **Crear script SQL (si es necesario)**
  - [ ] Si hay datos de usuarios existentes → considerar migración
  - [ ] Script para auditoría del cambio

---

### FASE 11: Deployment y Rollback ⏳

**Pre-deployment:**

- [ ] Hacer backup de BD
- [ ] Verificar todos los tests pasan
- [ ] Code review completado

**Deployment:**

- [ ] Subir cambios de backend
- [ ] Subir cambios de frontend
- [ ] Verificar que emails se envían correctamente

**Post-deployment:**

- [ ] Monitorear logs de email
- [ ] Verificar que usuarios nuevos reciben emails
- [ ] Verificar que pueden establecer contraseña

**Rollback (si es necesario):**

- [ ] Revertir código a versión anterior
- [ ] Los usuarios ya creados mantienen acceso
- [ ] El siguiente usuario nuevo usará token system

---

## 🔐 Consideraciones de Seguridad

✅ **Implementado:**
- Token expires en 24 horas
- Token es aleatorio (SecureRandom + Base64)
- Token se marca como "usado" después de consumirse
- Email se envía por canal corporativo

⚠️ **A Verificar:**
- No exponer token en logs de Spring
- No exponer password en response del API
- Validar que token no se puede reutilizar
- Validar que link de email no se puede fuerza brute

---

## 📊 Estimación de Esfuerzo

| Fase | Tareas | Horas | Estado |
|------|--------|-------|--------|
| 1. Preparación | 3 tareas | 1h | ⏳ |
| 2. Backend Controller | 4 tareas | 1h | ⏳ |
| 3. Backend Service | 2 tareas | 1h | ⏳ |
| 4. PasswordTokenService | 2 tareas | 0.5h | ⏳ |
| 5. EmailService | 2 tareas | 0.5h | ⏳ |
| 6. Frontend Modal | 4 tareas | 1h | ⏳ |
| 7. Testing Unitario | 6 tareas | 2h | ⏳ |
| 8. Testing Integración | 4 tareas | 2h | ⏳ |
| 9. Testing Seguridad | 3 tareas | 1h | ⏳ |
| 10. Documentación | 4 tareas | 1h | ⏳ |
| 11. Deployment | 5 tareas | 1h | ⏳ |
| **TOTAL** | **41 tareas** | **~14h** | ⏳ |

---

## 🚀 Siguiente Paso

Confirmar checklist ✅ antes de iniciar implementación.

Preguntas de clarificación:
1. ¿Cambiar contraseña de usuarios EXISTENTES?
2. ¿Agregar checkbox "Enviar email de bienvenida" en modal?
3. ¿Registrar en auditoría quién creó el usuario?

---

**Autor:** Claude Code
**Última actualización:** 2026-01-06
