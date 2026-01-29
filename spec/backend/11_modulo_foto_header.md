# 📷 Módulo de Foto Header - Backend

**Versión:** v1.37.4
**Fecha:** 2026-01-28
**Estado:** ✅ Implementado y Funcional

---

## 📋 Índice

1. [Descripción General](#descripción-general)
2. [Arquitectura](#arquitectura)
3. [Implementación Backend](#implementación-backend)
4. [Base de Datos](#base-de-datos)
5. [API Response](#api-response)
6. [Manejo de Archivos](#manejo-de-archivos)
7. [Logs y Debugging](#logs-y-debugging)
8. [Troubleshooting](#troubleshooting)

---

## 📖 Descripción General

El **Módulo de Foto Header** permite que cada usuario autenticado vea su foto de perfil en el header superior derecho de la aplicación (círculo de avatar junto al nombre y rol).

**Características:**
- ✅ Búsqueda automática de foto al hacer login
- ✅ Soporte para personal interno (`dim_personal_cnt`)
- ✅ Soporte para personal externo (`dim_personal_externo`)
- ✅ URL encoding para nombres de archivo con espacios y caracteres especiales
- ✅ Fallback a inicial del nombre si no hay foto
- ✅ Ruta relativa para compatibilidad con nginx proxy

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE FOTO HEADER                     │
└─────────────────────────────────────────────────────────────┘

1. Usuario hace LOGIN
   ↓
2. AuthenticationServiceImpl.authenticate()
   ↓
3. obtenerFotoUsuario(userId)
   ↓
4. Busca en dim_personal_cnt (id_usuario = ?)
   ├─ ✅ Encontrada → URL encode → /api/personal/foto/{filename}
   └─ ❌ No encontrada → Busca en dim_personal_externo
      ├─ ✅ Encontrada → URL encode → /api/personal/foto/{filename}
      └─ ❌ No encontrada → return null
   ↓
5. AuthResponse.builder().foto(fotoUrl).build()
   ↓
6. Frontend recibe { foto: "/api/personal/foto/..." }
   ↓
7. UserMenu muestra <img src={user.foto} />
```

---

## 💻 Implementación Backend

### Archivo Principal

**📁 Ubicación:**
`backend/src/main/java/com/styp/cenate/service/auth/AuthenticationServiceImpl.java`

### Método: `obtenerFotoUsuario()`

**Líneas:** 270-313

```java
/**
 * 📷 OBTENER FOTO DEL USUARIO
 * Busca la foto del usuario en dim_personal_cnt o dim_personal_externo
 * y retorna la URL codificada para el frontend.
 */
private String obtenerFotoUsuario(Long userId) {
    log.info("📷 Buscando foto para usuario ID: {}", userId);

    try {
        // 1️⃣ Buscar en dim_personal_cnt (personal interno)
        String fotoPersonalCnt = jdbcTemplate.queryForObject(
            "SELECT foto_pers FROM public.dim_personal_cnt WHERE id_usuario = ? AND foto_pers IS NOT NULL",
            String.class,
            userId
        );

        if (fotoPersonalCnt != null && !fotoPersonalCnt.trim().isEmpty()) {
            // URL encode el nombre del archivo para manejar espacios y caracteres especiales
            String fotoUrlEncoded = java.net.URLEncoder.encode(
                fotoPersonalCnt,
                java.nio.charset.StandardCharsets.UTF_8
            ).replace("+", "%20"); // Reemplazar + con %20 para espacios

            String fotoUrl = "/api/personal/foto/" + fotoUrlEncoded;
            log.info("✅ Foto encontrada en dim_personal_cnt: {} (encoded: {})",
                fotoPersonalCnt, fotoUrl);
            return fotoUrl;
        }
    } catch (Exception e) {
        log.debug("No se encontró foto en dim_personal_cnt para usuario {}: {}",
            userId, e.getMessage());
    }

    try {
        // 2️⃣ Buscar en dim_personal_externo (personal externo)
        String fotoPersonalExt = jdbcTemplate.queryForObject(
            "SELECT foto_ext FROM public.dim_personal_externo WHERE id_usuario = ? AND foto_ext IS NOT NULL",
            String.class,
            userId
        );

        if (fotoPersonalExt != null && !fotoPersonalExt.trim().isEmpty()) {
            String fotoUrlEncoded = java.net.URLEncoder.encode(
                fotoPersonalExt,
                java.nio.charset.StandardCharsets.UTF_8
            ).replace("+", "%20");

            String fotoUrl = "/api/personal/foto/" + fotoUrlEncoded;
            log.info("✅ Foto encontrada en dim_personal_externo: {} (encoded: {})",
                fotoPersonalExt, fotoUrl);
            return fotoUrl;
        }
    } catch (Exception e) {
        log.debug("No se encontró foto en dim_personal_externo para usuario {}", userId);
    }

    // 3️⃣ No se encontró foto
    log.info("⚠️ No se encontró foto para usuario ID: {}", userId);
    return null;
}
```

### Integración en `authenticate()`

**Líneas:** 103, 150

```java
@Override
@Transactional
public AuthResponse authenticate(AuthRequest request) {
    // ... autenticación ...

    // Obtener foto del usuario (línea 103)
    String fotoUrl = obtenerFotoUsuario(user.getIdUser());

    // ... construcción de JWT ...

    // Incluir foto en respuesta (línea 150)
    return AuthResponse.builder()
            .token(token)
            .id_user(user.getIdUser())
            .username(user.getNameUser())
            .nombreCompleto(user.getNombreCompleto())
            .foto(fotoUrl)  // 📷 URL completa de la foto
            .roles(roles)
            .permisos(null)
            .requiereCambioPassword(user.getRequiereCambioPassword() != null
                ? user.getRequiereCambioPassword() : false)
            .sessionId(sessionId)
            .message("Inicio de sesión exitoso")
            .build();
}
```

### Dependencias Inyectadas

```java
@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final PermisosService permisosService;
    private final AuditLogService auditLogService;
    private final com.styp.cenate.service.session.SessionService sessionService;
    private final com.styp.cenate.util.RequestContextUtil requestContextUtil;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;  // 🆕 Para queries directas
}
```

---

## 🗄️ Base de Datos

### Tabla: `dim_personal_cnt` (Personal Interno)

```sql
-- Campo: foto_pers
-- Tipo: VARCHAR
-- Nullable: Sí
-- Ejemplo: 'personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest (1).png'

SELECT
    id_usuario,
    num_doc_pers,
    nom_pers,
    ape_pater_pers,
    foto_pers
FROM public.dim_personal_cnt
WHERE id_usuario = 1;
```

### Tabla: `dim_personal_externo` (Personal Externo)

```sql
-- Campo: foto_ext
-- Tipo: VARCHAR
-- Nullable: Sí
-- Ejemplo: 'external_user_photo.jpg'

SELECT
    id_usuario,
    dni_ext,
    nom_ext,
    ape_pat_ext,
    foto_ext
FROM public.dim_personal_externo
WHERE id_usuario = 1;
```

---

## 📤 API Response

### DTO: `AuthResponse`

**📁 Ubicación:**
`backend/src/main/java/com/styp/cenate/dto/auth/AuthResponse.java`

```java
@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id_user;
    private String username;
    private String nombreCompleto;
    private String foto;  // 📷 URL completa de la foto del usuario
    private List<String> roles;
    private List<String> permisos;
    private Boolean requiereCambioPassword;
    private String sessionId;
    private String message;
}
```

### Ejemplo de Respuesta JSON

```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "id_user": 1,
  "username": "44914706",
  "nombreCompleto": "Styp Canto Rondón",
  "foto": "/api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png",
  "roles": ["SUPERADMIN"],
  "permisos": null,
  "requiereCambioPassword": false,
  "sessionId": "ade66579-3bf8-4112-bf5f-0022ccc64ec1",
  "message": "Inicio de sesión exitoso"
}
```

---

## 📁 Manejo de Archivos

### Directorio de Almacenamiento

**Configuración en `application.properties`:**

```properties
# Directorio donde se almacenan las fotos de perfil
app.upload.foto.dir=/app/uploads/fotos

# URL base para acceder a las fotos
app.upload.foto.url=/api/personal/foto
```

### Endpoint de Servicio de Fotos

**Endpoint existente:**
```
GET /api/personal/foto/{filename}
```

**Controlador:** `PersonalCntController` o `PersonalTotalController`

**Lógica:**
1. Recibe filename encoded
2. Decodifica URL
3. Busca archivo en `/app/uploads/personal/`
4. Retorna imagen con content-type apropiado

### URL Encoding

**¿Por qué se necesita?**

Los nombres de archivo pueden contener:
- Espacios: `fototest (1).png`
- Paréntesis: `foto(backup).jpg`
- Tildes: `José_Pérez.png`
- Caracteres especiales: `María & José.jpg`

**Encoding aplicado:**

```java
String fotoUrlEncoded = java.net.URLEncoder.encode(
    fotoPersonalCnt,
    java.nio.charset.StandardCharsets.UTF_8
).replace("+", "%20");
```

**Ejemplos:**

| Nombre Original | URL Encoded |
|----------------|-------------|
| `foto test.png` | `foto%20test.png` |
| `foto(1).png` | `foto%28%31%29.png` |
| `José_Pérez.jpg` | `Jos%C3%A9_P%C3%A9rez.jpg` |

---

## 📊 Logs y Debugging

### Logs de Éxito

```log
2026-01-28 20:39:06.614 [http-nio-0.0.0.0-8080-exec-13] INFO  c.s.c.s.a.AuthenticationServiceImpl - 📷 Buscando foto para usuario ID: 1
2026-01-28 20:39:06.620 [http-nio-0.0.0.0-8080-exec-13] INFO  c.s.c.s.a.AuthenticationServiceImpl - ✅ Foto encontrada en dim_personal_cnt: personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest (1).png (encoded: /api/personal/foto/personal_1_9f9b293e-2556-426b-86f0-19d039cd97fc_fototest%20%281%29.png)
```

### Logs de No Encontrado

```log
2026-01-28 20:39:06.614 [http-nio-0.0.0.0-8080-exec-13] INFO  c.s.c.s.a.AuthenticationServiceImpl - 📷 Buscando foto para usuario ID: 5
2026-01-28 20:39:06.620 [http-nio-0.0.0.0-8080-exec-13] DEBUG c.s.c.s.a.AuthenticationServiceImpl - No se encontró foto en dim_personal_cnt para usuario 5: No result found
2026-01-28 20:39:06.625 [http-nio-0.0.0.0-8080-exec-13] DEBUG c.s.c.s.a.AuthenticationServiceImpl - No se encontró foto en dim_personal_externo para usuario 5
2026-01-28 20:39:06.630 [http-nio-0.0.0.0-8080-exec-13] INFO  c.s.c.s.a.AuthenticationServiceImpl - ⚠️ No se encontró foto para usuario ID: 5
```

### Logs de Error

```log
2026-01-28 20:39:06.620 [http-nio-0.0.0.0-8080-exec-13] DEBUG c.s.c.s.a.AuthenticationServiceImpl - No se encontró foto en dim_personal_cnt para usuario 1: EmptyResultDataAccessException: Incorrect result size: expected 1, actual 0
```

---

## 🔧 Troubleshooting

### Problema: Foto no aparece en header

**Síntomas:**
- Login exitoso
- Solo aparece inicial del nombre (ej: "S")
- No se ve imagen

**Diagnóstico:**

1. **Verificar logs del backend:**
```bash
docker logs cenate-backend 2>&1 | grep "📷"
```

2. **Verificar que foto existe en BD:**
```sql
SELECT id_usuario, foto_pers
FROM dim_personal_cnt
WHERE id_usuario = 1;
```

3. **Verificar respuesta de login:**
   - F12 → Network → `/api/auth/login` → Response
   - Debe incluir campo `"foto": "/api/personal/foto/..."`

**Soluciones:**

| Causa | Solución |
|-------|----------|
| Foto no existe en BD | Subir foto para el usuario |
| Campo `foto` es NULL en response | Verificar que `obtenerFotoUsuario()` se ejecuta |
| URL mal formada | Verificar URL encoding |
| Archivo no existe en servidor | Verificar `/app/uploads/personal/` |
| Cache del navegador | Ctrl+Shift+R para recargar |

### Problema: Error 404 al cargar imagen

**Síntomas:**
- Campo `foto` tiene URL
- Consola muestra error 404

**Diagnóstico:**

```bash
# Verificar que archivo existe
docker exec -it cenate-backend ls -la /app/uploads/personal/
```

**Soluciones:**

1. Verificar que el endpoint `/api/personal/foto/{filename}` existe
2. Verificar permisos del directorio de uploads
3. Verificar que nginx está proxy pasando correctamente

### Problema: Espacios en nombre de archivo

**Síntomas:**
- URL tiene espacios sin encodear
- Error 400 Bad Request

**Solución:**

El método `obtenerFotoUsuario()` ya aplica URL encoding automáticamente:
```java
.replace("+", "%20")
```

Si persiste el problema, verificar que el frontend no esté decodificando la URL.

---

## 📚 Referencias

- [Backend API Endpoints](01_api_endpoints.md)
- [Frontend UserMenu Component](../frontend/01_componentes_layout.md)
- [Modelo de Usuarios](../database/01_models/01_modelo_usuarios.md)
- [Performance Optimization](10_performance_monitoring/README.md)

---

**Última actualización:** 2026-01-28
**Autor:** Ing. Styp Canto Rondón
**Versión:** v1.37.4
