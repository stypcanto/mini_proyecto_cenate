# Módulo de Correo SMTP - CENATE

> **Versión:** 1.1.0 (2026-01-30)
> **Estado:** Producción

---

## Descripción

Sistema de envío de correos electrónicos para CENATE que utiliza un relay SMTP (Postfix) para reenviar correos a través del servidor oficial de EsSalud, cumpliendo con las políticas DMARC del dominio.

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
| 2026-01-30 | 1.1.0 | Agregar análisis completo de casos de uso y triggers |
| 2026-01-30 | 1.0.0 | Configuración inicial con relay SMTP |

---

**Contacto:** Ing. Styp Canto Rondón - stypcanto@essalud.gob.pe
