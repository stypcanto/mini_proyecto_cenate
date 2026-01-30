# Módulo de Correo SMTP - CENATE

> **Versión:** 1.4.0 (2026-01-30)
> **Estado:** Producción

---

## Descripción

Sistema de envío de correos electrónicos para CENATE que utiliza un relay SMTP (Postfix) para reenviar correos a través del servidor oficial de EsSalud, cumpliendo con las políticas DMARC del dominio.

**Características principales:**
- Relay SMTP integrado en Docker Compose (no requiere scripts adicionales)
- Cumplimiento de políticas DMARC de EsSalud
- Templates HTML profesionales con diseño responsive
- Aviso de acceso desde red interna de EsSalud en todos los correos
- Tokens de activación con expiración de 24 horas

---

## Arquitectura

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  cenate-backend │────▶│  smtp-relay      │────▶│  SMTP EsSalud   │────▶│  Destinatario│
│  (Spring Boot)  │     │  (Postfix:2525)  │     │  172.20.0.227   │     │  (Gmail, etc)│
└─────────────────┘     └──────────────────┘     └─────────────────┘     └─────────────┘
     Puerto 2525            Puerto 25              Puerto 25
```

### Componentes

| Componente | Descripción | Puerto |
|------------|-------------|--------|
| **cenate-backend** | Aplicación Spring Boot que genera y envía correos | 8080 |
| **smtp-relay-cenate** | Contenedor Postfix que reenvía al servidor EsSalud | 2525:25 |
| **SMTP EsSalud** | Servidor SMTP corporativo (172.20.0.227) | 25 |

---

## Configuración

### Variables de Entorno (Backend)

```yaml
# docker-compose.yml - servicio backend
environment:
  MAIL_HOST: host.docker.internal    # Conexión al relay via host
  MAIL_PORT: 2525                    # Puerto del relay
  MAIL_USERNAME: cenate.contacto@essalud.gob.pe
  MAIL_PASSWORD: essaludc50
  MAIL_SMTP_AUTH: false
  MAIL_SMTP_STARTTLS: false          # Deshabilitado para relay local
  MAIL_SMTP_SSL: false
```

### Servicio SMTP Relay (docker-compose.yml)

```yaml
smtp-relay:
  container_name: smtp-relay-cenate
  image: boky/postfix
  ports:
    - "2525:25"
  environment:
    - RELAYHOST=172.20.0.227:25           # Servidor SMTP EsSalud
    - ALLOWED_SENDER_DOMAINS=essalud.gob.pe
    - POSTFIX_myhostname=cenate.essalud.gob.pe
    - TZ=America/Lima
  restart: unless-stopped
  healthcheck:
    test: ["CMD", "postfix", "status"]
    interval: 30s
    timeout: 10s
    retries: 3
```

---

## Casos de Uso - ¿Cuándo se Envían Correos?

### Resumen de Triggers

| # | Caso de Uso | Endpoint | Archivo | Línea |
|---|-------------|----------|---------|-------|
| 1 | **Bienvenida (Usuario Nuevo)** | `POST /api/usuarios/crear` | `UsuarioServiceImpl.java` | 405 |
| 2 | **Recuperación de Contraseña** | `POST /api/sesion/recuperar` | `SesionController.java` | 232 |
| 3 | **Reset de Contraseña (Admin)** | `POST /api/usuarios/{id}/reset-password` | `UsuarioController.java` | 330-334 |
| 4 | **Aprobación Solicitud Cuenta** | `PUT /api/account-requests/{id}/approve` | `AccountRequestService.java` | 245 |
| 5 | **Rechazo Solicitud Cuenta** | `PUT /api/account-requests/{id}/reject` | `AccountRequestService.java` | 434 |
| 6 | **Reenvío Token Activación** | `POST /api/account-requests/{id}/resend-email` | `AccountRequestService.java` | 791 |
| 7 | **Prueba SMTP** | `GET /api/health/smtp-test` | `HealthController.java` | 46 |

---

### Detalle por Flujo

#### 1. Creación de Usuario Nuevo (Admin crea usuario)
```
POST /api/usuarios/crear
    └── UsuarioServiceImpl.createUser()
        └── passwordTokenService.crearTokenYEnviarEmail(usuario, "BIENVENIDO")
            └── emailService.enviarCorreoCambioContrasena()
```
**Correo enviado:** Enlace para configurar contraseña inicial
**Token válido:** 24 horas

#### 2. Recuperación de Contraseña (Usuario olvidó contraseña)
```
POST /api/sesion/recuperar
    └── SesionController.iniciarRecuperacion()
        └── passwordTokenService.crearTokenYEnviarEmail(idUsuario, correo, "RECUPERACION")
            └── emailService.enviarCorreoCambioContrasena()
```
**Correo enviado:** Enlace para restablecer contraseña olvidada
**Token válido:** 24 horas

#### 3. Reset de Contraseña por Admin
```
POST /api/usuarios/{id}/reset-password
    └── UsuarioController.resetPassword()
        └── passwordTokenService.crearTokenYEnviarEmail(id, "RESET")
            └── emailService.enviarCorreoCambioContrasena()
```
**Correo enviado:** Enlace para que usuario configure nueva contraseña
**Token válido:** 24 horas

#### 4. Aprobación de Solicitud de Cuenta Externa
```
PUT /api/account-requests/{id}/approve
    └── AccountRequestService.approveRequest()
        └── passwordTokenService.crearTokenYEnviarEmailDirecto()
            └── emailService.enviarCorreoCambioContrasena()
```
**Correo enviado:** Notificación de aprobación + enlace para activar cuenta
**Token válido:** 24 horas

#### 5. Rechazo de Solicitud de Cuenta
```
PUT /api/account-requests/{id}/reject
    └── AccountRequestService.rejectRequest()
        └── emailService.enviarCorreoRechazoSolicitud()
```
**Correo enviado:** Notificación de rechazo con motivo
**Sin token**

#### 6. Reenvío de Email de Activación
```
POST /api/account-requests/{id}/resend-email
    └── AccountRequestService.resendActivationEmail()
        └── passwordTokenService.crearTokenYEnviarEmailDirecto()
            └── emailService.enviarCorreoCambioContrasena()
```
**Correo enviado:** Nuevo enlace de activación (invalida el anterior)
**Token válido:** 24 horas

#### 7. Prueba de Conexión SMTP
```
GET /api/health/smtp-test?email={correo}
    └── HealthController.probarSMTP()
        └── emailService.probarConexionSMTP()
```
**Correo enviado:** Mensaje de prueba de conectividad
**Uso:** Diagnóstico del sistema

---

### Diagrama de Flujo Completo

```
┌─────────────────────────────────────────────────────────────────┐
│                    TRIGGERS DE CORREO                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  [Usuario]                         [Admin]                      │
│     │                                 │                         │
│     ├─ Olvidó contraseña             ├─ Crear usuario           │
│     │  POST /sesion/recuperar        │  POST /usuarios/crear    │
│     │                                │                          │
│     └─ Solicita cuenta externa       ├─ Reset contraseña        │
│        POST /account-requests        │  POST /usuarios/{id}/    │
│                                      │       reset-password     │
│                                      │                          │
│                                      ├─ Aprobar solicitud       │
│                                      │  PUT /account-requests/  │
│                                      │       {id}/approve       │
│                                      │                          │
│                                      └─ Rechazar solicitud      │
│                                         PUT /account-requests/  │
│                                              {id}/reject        │
│                                                                 │
│                          ▼                                      │
│  ┌─────────────────────────────────────────┐                    │
│  │         PasswordTokenService            │                    │
│  │    crearTokenYEnviarEmail()             │                    │
│  │    - Genera token único (UUID)          │                    │
│  │    - Guarda en BD (24h expiración)      │                    │
│  │    - Invalida tokens anteriores         │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────┐                    │
│  │            EmailService                 │                    │
│  │   - enviarCorreoCambioContrasena()      │                    │
│  │   - enviarCorreoRechazoSolicitud()      │                    │
│  │   - enviarCorreoAprobacionSolicitud()   │                    │
│  │   (Envío asíncrono con @Async)          │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────┐                    │
│  │         SMTP Relay (Postfix)            │                    │
│  │         host.docker.internal:2525       │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────┐                    │
│  │         SMTP EsSalud                    │                    │
│  │         172.20.0.227:25                 │                    │
│  │         (Cumple política DMARC)         │                    │
│  └──────────────────┬──────────────────────┘                    │
│                     │                                           │
│                     ▼                                           │
│              [Gmail/Outlook/EsSalud]                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Métodos de EmailService

| Método | Propósito | Usado en |
|--------|-----------|----------|
| `enviarCorreoCambioContrasena()` | Token para configurar/cambiar contraseña | PasswordTokenService |
| `enviarCorreoAprobacionSolicitud()` | Solicitud de cuenta aprobada | AccountRequestService |
| `enviarCorreoRechazoSolicitud()` | Solicitud de cuenta rechazada | AccountRequestService |
| `enviarCorreoBienvenidaUsuario()` | Bienvenida (disponible, no usado) | - |
| `enviarCorreoResetPassword()` | **DEPRECADO** - usar `enviarCorreoCambioContrasena` | - |
| `probarConexionSMTP()` | Diagnóstico de conectividad | HealthController |

---

## Templates de Correo

### Estructura de los Correos

Todos los correos HTML siguen una estructura consistente:

```
┌─────────────────────────────────────┐
│          HEADER (azul)              │
│        Título del correo            │
├─────────────────────────────────────┤
│                                     │
│  Saludo: "Estimado/a [Nombre]"      │
│                                     │
│  Mensaje principal                  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Credenciales o Enlace        │  │
│  │  (caja con borde)             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ⚠️ Advertencia (amarillo)          │
│  - Token expira en 24 horas         │
│  - Solo puede usarse una vez        │
│                                     │
│  🏥 Aviso Red EsSalud (azul claro)  │
│  "El sistema Intranet CENATE solo   │
│   es accesible desde la red interna │
│   de EsSalud..."                    │
│                                     │
├─────────────────────────────────────┤
│          FOOTER (gris)              │
│  "Correo automático - No responder" │
│  © 2025 CENATE                      │
└─────────────────────────────────────┘
```

### Aviso de Acceso desde Red EsSalud

**Todos los correos con enlaces o credenciales incluyen este aviso:**

```html
<div style="background-color: #dbeafe; border-left: 4px solid #1a56db; padding: 15px; margin: 20px 0;">
    <strong>🏥 Acceso desde Red EsSalud:</strong>
    <p>El sistema <strong>Intranet CENATE</strong> solo es accesible desde la red
    interna de EsSalud. Asegúrate de estar conectado a la <strong>red corporativa
    o VPN</strong> para acceder al sistema.</p>
</div>
```

**Correos que incluyen este aviso:**
- ✅ `enviarCorreoCambioContrasena` (bienvenida y recuperación)
- ✅ `enviarCorreoAprobacionSolicitud`
- ✅ `enviarCorreoBienvenidaUsuario`
- ✅ `enviarCorreoResetPassword`
- ❌ `enviarCorreoRechazoSolicitud` (no tiene enlace)
- ❌ `probarConexionSMTP` (correo de diagnóstico simple)

### Tipos de Correo y Contenido

#### 1. Correo de Cambio/Configuración de Contraseña
- **Asunto (nuevo usuario):** "CENATE - Configura tu contraseña de acceso"
- **Asunto (recuperación):** "CENATE - Restablece tu contraseña"
- **Header:** Azul (#1a56db)
- **Contenido:**
  - Usuario de acceso
  - Botón: "Activar mi Cuenta" o "Restablecer Contraseña"
  - Enlace: `{FRONTEND_URL}/cambiar-contrasena?token={token}`
  - Aviso de expiración (24 horas)
  - Aviso de red EsSalud

#### 2. Correo de Aprobación de Solicitud
- **Asunto:** "CENATE - Tu solicitud de acceso ha sido aprobada"
- **Header:** Azul (#1a56db)
- **Contenido:**
  - Usuario y contraseña temporal
  - Aviso de cambio obligatorio en primer login
  - Aviso de red EsSalud

#### 3. Correo de Rechazo de Solicitud
- **Asunto:** "CENATE - Respuesta a tu solicitud de acceso"
- **Header:** Rojo (#dc2626)
- **Contenido:**
  - Motivo del rechazo
  - Sin aviso de red (no hay enlace)

#### 4. Correo de Bienvenida
- **Asunto:** "CENATE - Cuenta de usuario creada"
- **Header:** Azul (#1a56db)
- **Contenido:**
  - Usuario y contraseña temporal
  - Aviso de cambio obligatorio
  - Aviso de red EsSalud

### Configuración de URL del Frontend

Los enlaces en los correos usan la variable `FRONTEND_URL`:

```java
// PasswordTokenService.java
@Value("${app.frontend.url:http://localhost:3000}")
private String frontendUrl;

// Generación del enlace
String enlace = frontendUrl + "/cambiar-contrasena?token=" + tokenValue;
```

**Configuración en docker-compose.yml:**
```yaml
environment:
  FRONTEND_URL: ${FRONTEND_URL:-http://10.0.89.239}
```

| Ambiente | Valor | URL en correos |
|----------|-------|----------------|
| Desarrollo | `http://localhost:3000` | `http://localhost:3000/cambiar-contrasena?token=...` |
| Producción | `http://10.0.89.239` | `http://10.0.89.239/cambiar-contrasena?token=...` |

---

## Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| `EmailService.java` | Servicio principal de envío de correos |
| `PasswordTokenService.java` | Gestión de tokens y envío de correos de activación |
| `HealthController.java` | Endpoint de prueba SMTP |
| `application.properties` | Configuración SMTP |

### Rutas en el proyecto

```
backend/src/main/java/com/styp/cenate/
├── service/
│   ├── email/
│   │   └── EmailService.java          # Envío de correos HTML
│   └── security/
│       └── PasswordTokenService.java  # Tokens de activación
└── api/
    └── pruebas/
        └── HealthController.java      # Endpoint /api/health/smtp-test
```

---

## Diagnóstico

### Probar Conexión SMTP

```bash
# Desde el navegador o curl
curl "http://10.0.89.239/api/health/smtp-test?email=tu@correo.com"

# Respuesta exitosa
{
  "exitoso": true,
  "mensaje": "Conexión SMTP exitosa",
  "servidor": "host.docker.internal",
  "puerto": 2525
}
```

### Ver Logs del Relay

```bash
docker logs smtp-relay-cenate --tail 50
```

### Ver Cola de Correos

```bash
docker exec smtp-relay-cenate postqueue -p
```

### Verificar Configuración del Relay

```bash
docker exec smtp-relay-cenate postconf relayhost
# Debe mostrar: relayhost = 172.20.0.227:25
```

---

## Solución de Problemas

### Error: "DMARC policy reject"

**Causa:** El correo se envía directamente a Gmail/Outlook sin pasar por el servidor de EsSalud.

**Solución:** Verificar que el relay tenga configurado `RELAYHOST=172.20.0.227:25`

```bash
docker exec smtp-relay-cenate postconf relayhost
```

### Error: "Connection timed out to 172.20.0.227"

**Causa:** El relay no puede alcanzar el servidor SMTP de EsSalud.

**Solución:** Verificar conectividad de red desde el host:

```bash
nc -zv 172.20.0.227 25
```

### Error: "PKIX path building failed" (certificado SSL)

**Causa:** STARTTLS habilitado pero el relay no tiene certificado válido.

**Solución:** Asegurar que `MAIL_SMTP_STARTTLS=false` en el backend.

### Correos no llegan pero el sistema dice "enviado"

**Causa:** El envío es asíncrono. El backend no espera confirmación del relay.

**Diagnóstico:**
1. Revisar logs del relay: `docker logs smtp-relay-cenate`
2. Verificar cola: `docker exec smtp-relay-cenate postqueue -p`
3. Revisar carpeta de spam del destinatario

### Log dice "Usuario no tiene email registrado" al crear usuario

**Causa:** Las relaciones JPA (`PersonalCnt`, `PersonalExterno`) no están sincronizadas en memoria después de guardar.

**Solución (ya implementada en v1.3.0):**
1. Después de `personalCntRepository.save(personalCnt)`, agregar `usuario.setPersonalCnt(personalCnt)`
2. Para usuarios externos, crear el `PersonalExterno` en el mismo método `createUser()`

**Verificación:**
```java
// Correcto (v1.3.0+)
personalCntRepository.save(personalCnt);
usuario.setPersonalCnt(personalCnt);  // ← Sincronizar relación
log.info("PersonalCnt guardado");
```

### Reset de contraseña no encuentra email del usuario

**Causa:** El método `findById()` no carga las relaciones LAZY (`PersonalCnt`, `PersonalExterno`).

**Solución (ya implementada en v1.3.0):**
Usar `findByIdWithFullDetails()` que incluye `JOIN FETCH`:

```java
// Antes (no funcionaba)
Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);

// Después (funciona)
Usuario usuario = usuarioRepository.findByIdWithFullDetails(idUsuario).orElse(null);
```

---

## Flujo de Envío de Correo

```
1. Backend genera correo HTML
   └── EmailService.enviarCorreoCambioContrasena()

2. Backend envía al relay (asíncrono)
   └── host.docker.internal:2525

3. Relay recibe y encola
   └── smtp-relay-cenate (Postfix)

4. Relay reenvía a servidor EsSalud
   └── 172.20.0.227:25

5. Servidor EsSalud entrega al destinatario
   └── Gmail, Outlook, etc.
```

---

## Seguridad

- **DMARC:** Los correos pasan por el servidor oficial de EsSalud para cumplir con políticas DMARC
- **Dominio autorizado:** Solo se permite enviar desde `@essalud.gob.pe`
- **Tokens:** Válidos por 24 horas, uso único
- **Sin credenciales en código:** Configuración via variables de entorno

---

## Mantenimiento

### Reiniciar servicios

```bash
cd /Users/cenate2/PortalWeb/mini_proyecto_cenate
docker-compose up -d
```

### Forzar reenvío de cola

```bash
docker exec smtp-relay-cenate postqueue -f
```

### Limpiar cola de correos

```bash
docker exec smtp-relay-cenate postsuper -d ALL
```

---

## Historial de Cambios

| Fecha | Versión | Cambio |
|-------|---------|--------|
| 2026-01-30 | 1.4.0 | **Aumentar timeouts SMTP** de 15s a 30s para conexiones lentas al servidor EsSalud |
| 2026-01-30 | 1.3.0 | **Fix crítico:** Corrección de sincronización de relaciones JPA para envío de correos |
| 2026-01-30 | 1.2.0 | Agregar aviso de red EsSalud en templates + documentación de templates |
| 2026-01-30 | 1.1.0 | Agregar análisis completo de casos de uso y triggers |
| 2026-01-30 | 1.0.0 | Configuración inicial con relay SMTP integrado en docker-compose |

### Detalle v1.3.0 - Fix de Relaciones JPA

**Problema detectado:** Los correos de bienvenida no se enviaban al crear usuarios desde el panel de administración porque las relaciones JPA (`PersonalCnt`, `PersonalExterno`) no estaban sincronizadas en memoria.

**Archivos modificados:**

| Archivo | Cambio |
|---------|--------|
| `UsuarioServiceImpl.java` | Sincronizar `usuario.setPersonalCnt()` después de guardar PersonalCnt |
| `UsuarioServiceImpl.java` | Crear `PersonalExterno` completo para usuarios externos desde panel admin |
| `UsuarioRepository.java` | Nuevo método `findByIdWithFullDetails()` con FETCH JOIN |
| `PasswordTokenService.java` | Usar `findByIdWithFullDetails()` en lugar de `findById()` |

**Flujos corregidos:**

| Flujo | Antes | Después |
|-------|-------|---------|
| Crear usuario interno desde panel | ❌ No enviaba correo | ✅ Funciona |
| Crear usuario externo desde panel | ❌ No enviaba correo | ✅ Funciona |
| Reset contraseña desde panel admin | ❌ No encontraba email | ✅ Funciona |

**Causa raíz:** En JPA, cuando se guarda una entidad relacionada (`personalCntRepository.save(personalCnt)`), la relación bidireccional no se sincroniza automáticamente en memoria. El objeto `Usuario` no sabía que tenía un `PersonalCnt` asociado.

**Solución:**
1. Sincronizar manualmente la relación después de guardar: `usuario.setPersonalCnt(personalCnt)`
2. Usar queries con `JOIN FETCH` para cargar relaciones al buscar usuario por ID

### Detalle v1.4.0 - Aumento de Timeouts SMTP

**Problema detectado:** Al crear usuarios nuevos, el correo de bienvenida fallaba con `SocketTimeoutException: Read timed out` después de exactamente 15 segundos.

**Causa raíz:** El relay SMTP (Postfix) necesita conectarse al servidor de EsSalud (172.20.0.227:25) para reenviar el correo. Cuando el servidor de EsSalud tiene latencia alta, la conexión tarda más de 15 segundos y el backend cancela la operación.

**Archivo modificado:** `application.properties`

```properties
# ANTES (15 segundos - insuficiente)
spring.mail.properties.mail.smtp.connectiontimeout=15000
spring.mail.properties.mail.smtp.timeout=15000
spring.mail.properties.mail.smtp.writetimeout=15000

# DESPUÉS (30 segundos - suficiente para conexiones lentas)
spring.mail.properties.mail.smtp.connectiontimeout=30000
spring.mail.properties.mail.smtp.timeout=30000
spring.mail.properties.mail.smtp.writetimeout=30000
```

**Configuración de timeouts:**

| Timeout | Valor | Descripción |
|---------|-------|-------------|
| `connectiontimeout` | 30000ms | Tiempo máximo para establecer conexión TCP |
| `timeout` | 30000ms | Tiempo máximo para leer respuesta del servidor |
| `writetimeout` | 30000ms | Tiempo máximo para escribir datos al servidor |

**Nota:** Los correos se envían de forma asíncrona (`@Async`), por lo que estos timeouts no afectan el tiempo de respuesta de la API al crear usuarios.

---

**Contacto:** Ing. Styp Canto Rondón - stypcanto@essalud.gob.pe
