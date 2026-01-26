# Plan de Seguridad - Autenticacion y Autorizacion

> **Sistema CENATE - EsSalud** | Creado: 2025-12-27
> **Estado:** FASE 1 y 2 COMPLETADAS
> **Responsable:** Equipo de Desarrollo

---

## Resumen Ejecutivo

Este documento define el plan de accion para corregir las vulnerabilidades de seguridad identificadas en la auditoria del modulo de Autenticacion y Autorizacion del sistema CENATE.

| Severidad | Cantidad | Estado |
|-----------|----------|--------|
| CRITICO | 3 | **COMPLETADO** |
| ALTO | 3 | **COMPLETADO** |
| MEDIO | 5 | Pendiente |
| BAJO | 2 | Pendiente |

---

## Control de Cambios

| Version | Fecha | Autor | Descripcion |
|---------|-------|-------|-------------|
| 1.0 | 2025-12-27 | Auditoria | Documento inicial con hallazgos |
| 1.1 | 2025-12-27 | Claude | Implementacion Fase 1 (3 criticos) y Fase 2 (3 altos) |

---

## Archivos Creados/Modificados

### Archivos Nuevos

| Archivo | Descripcion |
|---------|-------------|
| `backend/.../model/TokenBlacklist.java` | Entidad JPA para tokens invalidados |
| `backend/.../repository/TokenBlacklistRepository.java` | Repositorio para blacklist |
| `backend/.../service/security/TokenBlacklistService.java` | Servicio de invalidacion de tokens |
| `backend/.../security/listener/AuthenticationFailureListener.java` | Listener para intentos fallidos |
| `backend/.../security/listener/AuthenticationSuccessListener.java` | Listener para login exitoso |
| `backend/.../resources/application-dev.properties` | Configuracion de desarrollo |
| `backend/.../resources/application-prod.properties` | Configuracion de produccion |
| `spec/scripts/004_token_blacklist.sql` | Script SQL para tabla blacklist |

### Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `application.properties` | Removidas credenciales hardcodeadas, JWT reducido a 2h |
| `SecurityConfig.java` | CORS dinamico, actuator restringido, import-excel protegido |
| `UserDetailsServiceImpl.java` | Verificacion de bloqueo de cuenta |
| `JwtAuthenticationFilter.java` | Verificacion de token en blacklist |
| `AuthController.java` | Nuevo endpoint `/api/auth/logout` |
| `.gitignore` | Agregado `application-dev.properties` |

---

## FASE 1: Vulnerabilidades CRITICAS - COMPLETADA

### SEC-001: Eliminar Credenciales Hardcodeadas

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-001 |
| **Severidad** | CRITICO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

1. `application.properties` - Removidos valores por defecto:
```properties
# ANTES (inseguro)
spring.datasource.password=${DB_PASSWORD:Essalud2025}
jwt.secret=${JWT_SECRET:dev-secret-key...}

# DESPUES (seguro)
spring.datasource.password=${DB_PASSWORD}
jwt.secret=${JWT_SECRET}
```

2. Creado `application-dev.properties` con valores de desarrollo
3. Agregado al `.gitignore`: `application-dev.properties`

**Verificacion:**
- [x] `application.properties` sin valores por defecto
- [x] `application-dev.properties` creado
- [x] `.gitignore` actualizado
- [ ] Variables de entorno configuradas en servidor produccion

---

### SEC-002: Activar Bloqueo de Cuenta por Intentos Fallidos

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-002 |
| **Severidad** | CRITICO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

1. `UserDetailsServiceImpl.java` - Ahora verifica bloqueo:
```java
if (usuario.isAccountLocked()) {
    throw new LockedException("Cuenta bloqueada...");
}
```

2. Creado `AuthenticationFailureListener.java`:
   - Incrementa contador de intentos fallidos
   - Bloquea cuenta despues de 3 intentos (10 minutos)
   - Registra en auditoria

3. Creado `AuthenticationSuccessListener.java`:
   - Resetea contador de intentos en login exitoso

**Verificacion:**
- [x] `UserDetailsServiceImpl.java` modificado
- [x] `AuthenticationFailureListener.java` creado
- [x] `AuthenticationSuccessListener.java` creado
- [ ] Probar: 3 intentos fallidos bloquean cuenta
- [ ] Probar: Login exitoso resetea contador

---

### SEC-003: Implementar Invalidacion de Tokens JWT (Blacklist)

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-003 |
| **Severidad** | CRITICO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

1. Creado modelo `TokenBlacklist.java`
2. Creado repositorio `TokenBlacklistRepository.java`
3. Creado servicio `TokenBlacklistService.java`:
   - `invalidateToken()` - Agrega token a blacklist
   - `isBlacklisted()` - Verifica si token esta invalidado
   - `cleanupExpiredTokens()` - Limpia tokens expirados (cada hora)

4. Modificado `JwtAuthenticationFilter.java`:
```java
if (tokenBlacklistService.isBlacklisted(token)) {
    log.warn("Token en blacklist rechazado");
    filterChain.doFilter(request, response);
    return;
}
```

5. Agregado endpoint en `AuthController.java`:
```java
@PostMapping("/logout")
public ResponseEntity<?> logout(...)
```

6. Creado script SQL: `spec/scripts/004_token_blacklist.sql`

**Verificacion:**
- [x] Entidad `TokenBlacklist.java` creada
- [x] Repositorio creado
- [x] Servicio de blacklist creado
- [x] Filtro JWT verificando blacklist
- [x] Endpoint `/api/auth/logout` agregado
- [ ] **PENDIENTE:** Ejecutar SQL para crear tabla

**Comando para crear tabla:**
```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/004_token_blacklist.sql
```

---

## FASE 2: Vulnerabilidades ALTAS - COMPLETADA

### SEC-004: Restringir CORS por Ambiente

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-004 |
| **Severidad** | ALTO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

1. `SecurityConfig.java` - CORS dinamico desde properties:
```java
@Value("${cors.allowed-origins:http://localhost:3000}")
private String corsAllowedOrigins;
```

2. `application-dev.properties`:
```properties
cors.allowed-origins=http://localhost:3000,http://localhost:8080
```

3. `application-prod.properties`:
```properties
cors.allowed-origins=http://10.0.89.13,http://10.0.89.13:80,http://10.0.89.239,http://10.0.89.239:80
```

**Verificacion:**
- [x] `SecurityConfig.java` usa propiedad dinamica
- [x] `application-prod.properties` creado con CORS restringido
- [ ] Probar en produccion: origen no autorizado rechazado

---

### SEC-005: Proteger Endpoint de Import Excel

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-005 |
| **Severidad** | ALTO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

`SecurityConfig.java` linea 225-227:
```java
// ANTES (inseguro)
.requestMatchers(HttpMethod.POST, "/api/import-excel/**").permitAll()

// DESPUES (seguro)
.requestMatchers(HttpMethod.POST, "/api/import-excel/**")
    .hasAnyRole("SUPERADMIN", "ADMIN")
```

**Verificacion:**
- [x] Endpoint protegido con roles
- [ ] Probar: Usuario sin rol no puede importar
- [ ] Probar: Admin puede importar

---

### SEC-006: Restringir Actuator

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-006 |
| **Severidad** | ALTO |
| **Estado** | **COMPLETADO** |

**Cambios Realizados:**

1. `SecurityConfig.java`:
```java
// Solo health publico
.requestMatchers("/actuator/health").permitAll()
// Resto requiere SUPERADMIN
.requestMatchers("/actuator/**").hasRole("SUPERADMIN")
```

2. `application-prod.properties`:
```properties
management.endpoints.web.exposure.include=health
management.endpoint.health.show-details=never
```

**Verificacion:**
- [x] Solo `/actuator/health` publico
- [x] Otros endpoints requieren SUPERADMIN
- [ ] Probar acceso a `/actuator/mappings` sin autenticacion

---

## FASE 3: Vulnerabilidades MEDIAS - PENDIENTE

### SEC-007: Reducir Tiempo de Expiracion JWT

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-007 |
| **Severidad** | MEDIO |
| **Estado** | **COMPLETADO** (aplicado en SEC-001) |

**Cambio Realizado:**
```properties
# ANTES
jwt.expiration=86400000  # 24 horas

# DESPUES
jwt.expiration=7200000   # 2 horas
```

---

### SEC-008: Deshabilitar SQL Logging en Produccion

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-008 |
| **Severidad** | MEDIO |
| **Estado** | **COMPLETADO** (en application-prod.properties) |

**Configurado en `application-prod.properties`:**
```properties
spring.jpa.show-sql=false
logging.level.org.hibernate.SQL=WARN
```

---

### SEC-009: Proteger Swagger en Produccion

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-009 |
| **Severidad** | MEDIO |
| **Estado** | **COMPLETADO** (en application-prod.properties) |

**Configurado en `application-prod.properties`:**
```properties
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false
```

---

### SEC-010: Implementar Rate Limiting

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-010 |
| **Severidad** | MEDIO |
| **Estado** | Pendiente - Mejora futura |

**Nota:** Con el bloqueo de cuenta (SEC-002) ya hay proteccion contra brute force en login.

---

### SEC-011: Considerar Algoritmo RS256 para JWT

| Campo | Detalle |
|-------|---------|
| **ID** | SEC-011 |
| **Severidad** | MEDIO |
| **Estado** | No aplica - Sistema monolitico |

**Nota:** HS256 es adecuado para la arquitectura actual.

---

## Pasos Post-Implementacion

### 1. Ejecutar Script SQL (OBLIGATORIO)

```bash
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/004_token_blacklist.sql
```

### 2. Configurar Variables de Entorno en Produccion

```bash
export DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
export DB_USERNAME=postgres
export DB_PASSWORD=Essalud2025
export JWT_SECRET=clave-secreta-produccion-minimo-32-caracteres
export MAIL_USERNAME=cenateinformatica@gmail.com
export MAIL_PASSWORD=app-password-gmail
export FRONTEND_URL=http://10.0.89.239
```

### 3. Comandos de Ejecucion

**Desarrollo:**
```bash
cd backend
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Produccion:**
```bash
java -jar cenate.jar --spring.profiles.active=prod
```

---

## Checklist de Verificacion Final

### Implementacion (Codigo)
- [x] SEC-001: Credenciales removidas de properties
- [x] SEC-002: Bloqueo de cuenta implementado
- [x] SEC-003: Token blacklist implementado
- [x] SEC-004: CORS configurable por ambiente
- [x] SEC-005: Import Excel protegido
- [x] SEC-006: Actuator restringido
- [x] SEC-007: JWT reducido a 2 horas
- [x] SEC-008: SQL logging deshabilitado en prod
- [x] SEC-009: Swagger deshabilitado en prod

### Infraestructura (Servidor)
- [ ] Ejecutar `004_token_blacklist.sql`
- [ ] Configurar variables de entorno
- [ ] Desplegar con perfil `prod`
- [ ] Verificar CORS funciona correctamente
- [ ] Probar logout invalida token

### Pruebas Funcionales
- [ ] Login con 3 intentos fallidos bloquea cuenta
- [ ] Login exitoso resetea contador
- [ ] Logout invalida token (no puede reutilizarse)
- [ ] Usuario sin rol no puede importar Excel
- [ ] `/actuator/mappings` requiere autenticacion

---

## Resumen de Archivos

```
backend/src/main/java/com/styp/cenate/
├── model/
│   └── TokenBlacklist.java                    [NUEVO]
├── repository/
│   └── TokenBlacklistRepository.java          [NUEVO]
├── service/security/
│   └── TokenBlacklistService.java             [NUEVO]
├── security/
│   ├── listener/
│   │   ├── AuthenticationFailureListener.java [NUEVO]
│   │   └── AuthenticationSuccessListener.java [NUEVO]
│   ├── filter/
│   │   └── JwtAuthenticationFilter.java       [MODIFICADO]
│   └── service/
│       └── UserDetailsServiceImpl.java        [MODIFICADO]
├── api/seguridad/
│   └── AuthController.java                    [MODIFICADO]
└── config/
    └── SecurityConfig.java                    [MODIFICADO]

backend/src/main/resources/
├── application.properties                     [MODIFICADO]
├── application-dev.properties                 [NUEVO]
└── application-prod.properties                [NUEVO]

spec/scripts/
└── 004_token_blacklist.sql                    [NUEVO]

.gitignore                                     [MODIFICADO]
```

---

*Documento actualizado: 2025-12-27 | Auditoria de Seguridad - CENATE*
