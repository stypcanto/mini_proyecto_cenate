# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.13.0** (2025-12-29)

---

## Stack Tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                             # Documentacion tecnica
│   ├── 001_espec_users_bd.md         # Modelo de datos usuarios
│   ├── 002_changelog.md              # Historial de cambios
│   ├── 003_api_endpoints.md          # Endpoints API REST
│   ├── 004_arquitectura.md           # Diagramas y arquitectura
│   ├── 005_troubleshooting.md        # Solucion de problemas
│   ├── 006_plan_auditoria.md         # Plan de auditoria
│   ├── 009_plan_disponibilidad_turnos.md   # Plan disponibilidad medica
│   ├── 010_reporte_pruebas_disponibilidad.md # Reporte de pruebas
│   └── scripts/
│       ├── 001_audit_view_and_indexes.sql  # Vista e indices auditoria
│       ├── 002_rename_logs_to_auditoria.sql # Renombrar menu
│       ├── 005_disponibilidad_medica.sql    # Tablas disponibilidad
│       ├── 006_agregar_card_disponibilidad.sql # Card dashboard medico
│       └── 007_agregar_email_preferido.sql  # Correo preferido notificaciones
│
├── backend/                          # Spring Boot API (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/                      # Controllers REST
│       │   └── disponibilidad/       # Disponibilidad turnos medicos
│       ├── service/                  # Logica de negocio
│       │   └── disponibilidad/       # Gestion disponibilidad medica
│       ├── model/                    # Entidades JPA (51)
│       ├── repository/               # JPA Repositories (48)
│       ├── dto/                      # Data Transfer Objects
│       ├── security/                 # JWT + MBAC
│       └── exception/                # Manejo de errores
│
├── frontend/                         # React (puerto 3000)
│   └── src/
│       ├── components/               # UI reutilizable
│       ├── context/                  # AuthContext, PermisosContext
│       ├── pages/                    # Vistas (31+)
│       ├── services/                 # API services
│       └── lib/apiClient.js          # HTTP client
│
└── README.md
```

---

## Configuracion de Desarrollo

### Variables de Entorno - Backend
```properties
# PostgreSQL (servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT (minimo 32 caracteres)
JWT_SECRET=your-secure-key-at-least-32-characters

# Email SMTP (Servidor Corporativo EsSalud) - v1.12.1
MAIL_HOST=172.20.0.227
MAIL_PORT=25
MAIL_USERNAME=cenate.contacto@essalud.gob.pe
MAIL_PASSWORD=essaludc50
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS=true
MAIL_SMTP_SSL=false

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos
```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start
```

### Credenciales de Prueba
```
Username: 44914706
Password: @Cenate2025
```

---

## Despliegue en Produccion (Docker)

### ⚠️ PASOS DE INICIO (IMPORTANTE)

Cada vez que reinicies la Mac o Docker, ejecutar en este orden:

```bash
# 1. Iniciar el relay SMTP (permite a Docker conectar al servidor corporativo)
./start-smtp-relay.sh

# 2. Iniciar Docker
docker-compose up -d

# 3. Verificar que todo funciona
docker-compose ps
docker logs cenate-backend --tail=20
```

### Relay SMTP para Docker (macOS)

Docker en macOS no puede acceder directamente a la red corporativa `172.20.0.227`. Se usa un relay `socat` como puente.

**Arquitectura del Relay:**
```
Docker Container → host.docker.internal:2525 → socat relay → 172.20.0.227:25
```

**Archivos involucrados:**
| Archivo | Descripcion |
|---------|-------------|
| `start-smtp-relay.sh` | Script para iniciar el relay socat |
| `docker-compose.yml` | Configurado con `MAIL_HOST: host.docker.internal` y `MAIL_PORT: 2525` |

**Verificar que el relay está activo:**
```bash
ps aux | grep socat
# Debe mostrar: socat TCP-LISTEN:2525,fork,reuseaddr TCP:172.20.0.227:25
```

**Si el relay no está activo:**
```bash
./start-smtp-relay.sh
```

**Requisitos:**
- socat instalado: `brew install socat`

### Arquitectura Docker

```
┌─────────────────────────────────────────────────────────────┐
│                      SERVIDOR PRODUCCION                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │   cenate-frontend │      │   cenate-backend  │             │
│  │   (nginx:80)      │─────▶│   (spring:8080)   │             │
│  │                   │ /api │                   │             │
│  └────────┬──────────┘      └─────────┬─────────┘             │
│           │                           │                       │
│           │ :80                       │ :8080                 │
│           ▼                           ▼                       │
│  ┌──────────────────────────────────────────────┐            │
│  │              cenate-net (bridge)              │            │
│  └──────────────────────────────────────────────┘            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
              ┌───────────────────────────────┐
              │   PostgreSQL (10.0.89.13:5432) │
              │   Base de datos: maestro_cenate│
              └───────────────────────────────┘
```

### Archivos de Configuracion

| Archivo | Descripcion |
|---------|-------------|
| `docker-compose.yml` | Orquestacion principal |
| `frontend/Dockerfile` | Build React + nginx |
| `backend/Dockerfile` | Build Spring Boot + Java 17 |
| `frontend/nginx.conf` | Proxy reverso /api → backend |
| `frontend/.env.production` | Variables frontend (REACT_APP_API_URL=/api) |

### Variables de Entorno - Backend (Docker)

```yaml
# docker-compose.yml - servicio backend
environment:
  # Base de datos PostgreSQL
  SPRING_DATASOURCE_URL: jdbc:postgresql://10.0.89.13:5432/maestro_cenate
  SPRING_DATASOURCE_USERNAME: postgres
  SPRING_DATASOURCE_PASSWORD: Essalud2025
  SPRING_JPA_HIBERNATE_DDL_AUTO: none
  SPRING_JPA_SHOW_SQL: "true"

  # JWT (minimo 32 caracteres)
  JWT_SECRET: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
  JWT_EXPIRATION: 86400000

  # Email SMTP (via Relay socat → Servidor Corporativo EsSalud) - v1.12.2
  # IMPORTANTE: Requiere ejecutar ./start-smtp-relay.sh antes de docker-compose up
  MAIL_HOST: host.docker.internal   # Relay local (socat)
  MAIL_PORT: 2525                   # Puerto del relay
  MAIL_USERNAME: cenate.contacto@essalud.gob.pe
  MAIL_PASSWORD: essaludc50
  MAIL_SMTP_AUTH: false
  MAIL_SMTP_STARTTLS: true
  MAIL_SMTP_SSL: false

  # Frontend URL (para enlaces en emails de recuperacion de contrasena)
  FRONTEND_URL: http://10.0.89.239

  # Zona horaria
  TZ: America/Lima
```

### Variables de Entorno - Frontend (Build)

```bash
# frontend/.env.production
REACT_APP_API_URL=/api
```

**IMPORTANTE:** El frontend usa `/api` (URL relativa) para que nginx haga proxy al backend. NO usar `http://localhost:8080/api` en produccion.

### Configuracion Nginx (Proxy Reverso)

```nginx
# frontend/nginx.conf
location /api/ {
    proxy_pass http://backend:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

### Comandos de Despliegue

```bash
# Construir y levantar todo
docker-compose up -d --build

# Solo reconstruir frontend (cambios en React)
docker-compose build frontend && docker-compose up -d frontend

# Solo reconstruir backend (cambios en Java)
docker-compose build backend && docker-compose up -d backend

# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs solo del backend
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down

# Limpiar imagenes huerfanas
docker image prune -f
```

### Volumenes Persistentes

```yaml
volumes:
  # Fotos de personal (EXTERNO al proyecto)
  - /var/cenate-uploads:/app/uploads
```

**Crear directorio en servidor:**
```bash
sudo mkdir -p /var/cenate-uploads/personal
sudo chown -R 1000:1000 /var/cenate-uploads
```

### Troubleshooting Produccion

#### Error 502 Bad Gateway

**Causa:** nginx no puede conectar con el backend.

**Verificar:**
```bash
# 1. Estado del backend
docker-compose ps

# 2. Logs del backend
docker-compose logs backend --tail=100

# 3. Errores comunes:
#    - Falta variable MAIL_USERNAME/MAIL_PASSWORD
#    - No conecta a PostgreSQL
#    - Puerto 8080 ocupado
```

#### Frontend muestra "localhost:8080" en consola

**Causa:** El codigo antiguo no aceptaba URLs relativas.

**Solucion:** Verificar que `frontend/src/services/apiClient.js` acepte `/api`:
```javascript
// URL relativa como /api - VALIDA para produccion con nginx proxy
if (url.startsWith('/')) {
  console.log('✅ Usando URL relativa (nginx proxy):', url);
  return url;
}
```

#### Backend no arranca - Falta MAIL_USERNAME

**Error:**
```
Could not resolve placeholder 'MAIL_USERNAME' in value "${MAIL_USERNAME}"
```

**Solucion:** Agregar en docker-compose.yml:
```yaml
MAIL_USERNAME: cenateinformatica@gmail.com
MAIL_PASSWORD: nolq uisr fwdw zdly
```

#### Correos no se envian - Timeout SMTP

**Error en logs:**
```
Couldn't connect to host, port: 172.20.0.227, 25; timeout 10000
```

**Causa:** El relay SMTP no está activo o Docker no puede conectar.

**Solucion:**
```bash
# 1. Verificar si el relay está corriendo
ps aux | grep socat

# 2. Si no está activo, iniciarlo
./start-smtp-relay.sh

# 3. Reiniciar el backend
docker-compose restart backend

# 4. Probar envío de correo
docker logs cenate-backend -f | grep -E "SMTP|Correo|enviado"
```

#### Relay SMTP no inicia

**Error:**
```
Address already in use
```

**Solucion:**
```bash
# Matar proceso existente en puerto 2525
lsof -i :2525 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Reiniciar relay
./start-smtp-relay.sh
```

#### Fotos de personal no cargan

**Verificar:**
```bash
# Directorio existe
ls -la /var/cenate-uploads/personal/

# Permisos correctos
sudo chown -R 1000:1000 /var/cenate-uploads
```

### Puertos Expuestos

| Servicio | Puerto Interno | Puerto Externo |
|----------|----------------|----------------|
| Frontend (nginx) | 80 | 80 |
| Backend (Spring) | 8080 | 8080 |

### Recursos Asignados

```yaml
# docker-compose.yml
backend:
  deploy:
    resources:
      limits:
        memory: 2.5G

frontend:
  deploy:
    resources:
      limits:
        memory: 512M
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios |
| MEDICO | Dashboard medico, pacientes |
| COORDINADOR | Agenda, asignaciones |
| EXTERNO | Formulario diagnostico |

---

## Modulo de Registro de Usuarios

### Seleccion de Correo Preferido para Notificaciones

Los usuarios pueden elegir a qué correo desean recibir notificaciones del sistema durante el registro.

### Arquitectura

```
Usuario → Formulario /crear-cuenta → Selecciona correo preferido
                ↓
    AccountRequestService.crearSolicitud()
                ↓
    Guarda preferencia en account_requests.email_preferido
                ↓
        ADMIN aprueba solicitud
                ↓
    AccountRequestService.aprobarSolicitud()
                ↓
    solicitud.obtenerCorreoPreferido() → PERSONAL o INSTITUCIONAL
                ↓
    PasswordTokenService.crearTokenYEnviarEmailDirecto()
                ↓
    Email enviado al correo preferido
```

### Campos en Base de Datos

**Tabla: `account_requests`**
- `correo_personal` - Correo personal del usuario
- `correo_institucional` - Correo institucional (opcional)
- `email_preferido` - Preferencia: "PERSONAL" o "INSTITUCIONAL" (default: "PERSONAL")

### Metodo Helper

```java
// AccountRequest.java
public String obtenerCorreoPreferido() {
    if ("INSTITUCIONAL".equalsIgnoreCase(emailPreferido)) {
        return (correoInstitucional != null && !correoInstitucional.isBlank())
                ? correoInstitucional
                : correoPersonal; // Fallback
    }
    return (correoPersonal != null && !correoPersonal.isBlank())
            ? correoPersonal
            : correoInstitucional; // Fallback
}
```

### Componentes Involucrados

**Backend:**
- `AccountRequest.java` - Entidad con campo emailPreferido
- `SolicitudRegistroDTO.java` - DTO con campo emailPreferido
- `AccountRequestService.java` - Usa correo preferido al enviar emails

**Frontend:**
- `CrearCuenta.jsx` - Selector visual de correo preferido

### Puntos de Uso

El correo preferido se utiliza automáticamente en:
1. **Aprobación de solicitud** - Envío de credenciales de activación
2. **Rechazo de solicitud** - Notificación de rechazo
3. **Recuperación de contraseña** - Enlaces de recuperación
4. **Cambio de contraseña** - Notificaciones de cambio

### Script SQL

```bash
# Agregar campo email_preferido
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/007_agregar_email_preferido.sql
```

### Documentacion Relacionada

- Changelog v1.10.1: `spec/002_changelog.md`
- Script SQL: `spec/scripts/007_agregar_email_preferido.sql`

---

## Recuperacion de Contrasena con Seleccion de Correo

### Descripcion

Los administradores pueden elegir a qué correo (personal o institucional) enviar el enlace de recuperación de contraseña.

### Flujo de Uso

```
Admin → Editar Usuario → "Enviar correo de recuperación"
                ↓
    Modal pregunta: ¿A qué correo enviar?
                ↓
    Admin selecciona: ○ Personal  ○ Institucional
                ↓
    UsuarioController.resetPassword(id, email)
                ↓
    PasswordTokenService.crearTokenYEnviarEmail(id, email, "RESET")
                ↓
    Email enviado al correo seleccionado
```

### Endpoint API

```java
PUT /api/usuarios/id/{id}/reset-password?email={correo}

// Parámetros:
// - id: ID del usuario (path)
// - email: Correo destino (query, opcional)

// Si se proporciona email: envía a ese correo específico
// Si NO se proporciona email: usa correo registrado del usuario
```

### Componentes Frontend

**ActualizarModel.jsx** - Modal de selección:
- Estado `correoSeleccionado` para guardar la elección del usuario
- Radio buttons para elegir entre correo personal e institucional
- Botón "Enviar Correo" deshabilitado hasta que se seleccione un correo
- Envía el correo seleccionado como query parameter

### Metodos Backend

**PasswordTokenService:**
```java
// Método existente (retrocompatible)
public boolean crearTokenYEnviarEmail(Long idUsuario, String tipoAccion)

// Nuevo método con correo específico
public boolean crearTokenYEnviarEmail(Long idUsuario, String email, String tipoAccion)
```

### Variables de Entorno Requeridas

**IMPORTANTE:** El backend DEBE iniciarse con las credenciales de correo configuradas:

```bash
export MAIL_USERNAME="cenateinformatica@gmail.com"
export MAIL_PASSWORD="nolq uisr fwdw zdly"
export DB_URL="jdbc:postgresql://10.0.89.13:5432/maestro_cenate"
export DB_USERNAME="postgres"
export DB_PASSWORD="Essalud2025"
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"
export FRONTEND_URL="http://localhost:3000"

# Iniciar backend
cd backend && ./gradlew bootRun --continuous
```

### Tiempos de Entrega

| Tipo de Correo | Tiempo Estimado | Notas |
|----------------|-----------------|-------|
| Gmail personal | 10-30 segundos | Entrega rápida y confiable |
| Correo corporativo (@essalud.gob.pe) | 1-5 minutos | Puede ser bloqueado por filtros anti-spam |

### Troubleshooting

**Correo no llega:**
1. Verificar que el backend esté corriendo con las credenciales de correo
2. Revisar logs del backend para errores SMTP
3. Revisar carpeta de SPAM del destinatario
4. Para correos corporativos: contactar TI para agregar `cenateinformatica@gmail.com` a lista blanca

**Verificar configuración:**
```bash
# Ver si el backend tiene las variables de entorno
ps aux | grep "CenateApplication" | grep -o "MAIL_USERNAME.*"

# Ver logs recientes del backend
tail -100 /ruta/logs/backend.log | grep -i "mail\|smtp\|email"
```

### Documentacion Relacionada

- Changelog v1.10.2: `spec/002_changelog.md`

---

## Reenvio de Correo de Activacion con Seleccion de Tipo

### Descripcion

Los administradores pueden reenviar el correo de activación a usuarios pendientes, seleccionando el tipo de correo (personal o corporativo) al que desean enviarlo.

### Flujo de Uso

```
Admin → Solicitudes → Pendientes de Activación
                ↓
    Clic en botón "Reenviar Correo" (icono sobre)
                ↓
    Modal pregunta: ¿A qué correo enviar?
                ↓
    Admin selecciona: [Correo Personal] o [Correo Corporativo]
                ↓
    POST /api/admin/usuarios/{id}/reenviar-activacion
    Body: { "tipoCorreo": "PERSONAL" | "CORPORATIVO" }
                ↓
    AccountRequestService.reenviarEmailActivacion(id, tipoCorreo)
                ↓
    Email enviado al correo seleccionado
```

### Endpoint API

```java
POST /api/admin/usuarios/{idUsuario}/reenviar-activacion

// Body (opcional):
{
  "tipoCorreo": "PERSONAL" | "CORPORATIVO"
}

// Comportamiento:
// - "PERSONAL": Envía a correo personal, fallback a corporativo
// - "CORPORATIVO": Envía a correo corporativo, fallback a personal
// - Sin especificar: Comportamiento por defecto (prioriza personal)
```

### Componentes Frontend

**AprobacionSolicitudes.jsx:**
- Estado `modalTipoCorreo` para controlar el modal de selección
- Función `abrirModalTipoCorreo(usuario)` - Abre modal con datos del usuario
- Función `reenviarEmailActivacion(tipoCorreo)` - Envía petición con tipo seleccionado
- Modal elegante con dos opciones:
  - **Correo Personal** (fondo azul, icono de sobre)
  - **Correo Corporativo** (fondo verde, icono de edificio)
- Opciones deshabilitadas si el correo no está registrado

### Lógica Backend

**AccountRequestService.reenviarEmailActivacion():**

```java
public boolean reenviarEmailActivacion(Long idUsuario, String tipoCorreo) {
    // Obtener emails del usuario desde dim_personal_cnt
    String emailPers = result.get("email_pers");
    String emailCorp = result.get("email_corp_pers");

    // Seleccionar según tipo solicitado
    if ("CORPORATIVO".equalsIgnoreCase(tipoCorreo)) {
        email = (emailCorp != null) ? emailCorp : emailPers;
    } else if ("PERSONAL".equalsIgnoreCase(tipoCorreo)) {
        email = (emailPers != null) ? emailPers : emailCorp;
    } else {
        // Default: priorizar personal
        email = (emailPers != null) ? emailPers : emailCorp;
    }

    // Enviar email de activación
    return passwordTokenService.crearTokenYEnviarEmailDirecto(
        usuario, email, nombreCompleto, "BIENVENIDO");
}
```

### Validaciones

1. **Usuario debe existir** - `Usuario.findById()`
2. **Usuario debe estar pendiente** - `requiere_cambio_password = true`
3. **Usuario debe tener al menos un correo** - Personal o corporativo
4. **Tipo de correo solicitado debe estar registrado** - Si se solicita CORPORATIVO pero no existe, usa PERSONAL (fallback)

### Modal de Selección

El modal muestra:
- **Título:** "Seleccionar Tipo de Correo"
- **Nombre del usuario** al que se enviará
- **Dos tarjetas interactivas:**
  - Correo Personal: Fondo azul gradiente, icono de sobre
  - Correo Corporativo: Fondo verde gradiente, icono de edificio
- **Correos deshabilitados:** Si un correo no está registrado, se muestra en gris con mensaje "No registrado"
- **Botón Cancelar:** Cierra el modal sin enviar

### Casos de Uso

| Caso | Acción |
|------|--------|
| Usuario tiene ambos correos | Admin elige cuál usar |
| Usuario solo tiene correo personal | Opción corporativa deshabilitada |
| Usuario solo tiene correo corporativo | Opción personal deshabilitada |
| Usuario sin ningún correo | Botón de reenvío deshabilitado desde la tabla |

### Seguridad

- **Autorización:** Solo roles SUPERADMIN y ADMIN pueden reenviar correos
- **Validación:** El backend valida que el usuario exista y esté pendiente
- **Logs:** La acción se registra en auditoría (futuro)

### Beneficios

1. **Flexibilidad:** Admin decide el mejor canal de comunicación
2. **Redundancia:** Si un correo falla, puede intentar con el otro
3. **Transparencia:** Muestra claramente qué correos tiene el usuario
4. **UX Mejorada:** Modal elegante y fácil de usar

### Documentacion Relacionada

- Versión: v1.11.0
- Changelog: `spec/002_changelog.md`
- Archivo: `frontend/src/pages/admin/AprobacionSolicitudes.jsx`
- Backend: `AccountRequestService.java`, `SolicitudRegistroController.java`

---

## Modulo de Auditoria

### Documentación Completa

📖 **Ver guía completa:** `spec/011_guia_auditoria.md`

La guía incluye:
- Arquitectura y flujo completo de auditoría
- Estructura de tabla `audit_logs` e índices
- Definición de vista `vw_auditoria_modular_detallada`
- Patrón de implementación en servicios
- Cómo auditar nuevas acciones
- Troubleshooting y mantenimiento
- Consultas SQL útiles y reportes
- Estadísticas y análisis de seguridad

### Arquitectura (Resumen)

```
Accion del Usuario
       ↓
Service (UsuarioServiceImpl, AccountRequestService, etc.)
       ↓
AuditLogService.registrarEvento()
       ↓
Tabla: audit_logs
       ↓
Vista: vw_auditoria_modular_detallada
       ↓
API: /api/auditoria/busqueda-avanzada
       ↓
Frontend: LogsDelSistema.jsx
```

### Servicios con Auditoria Integrada

| Servicio | Acciones Auditadas |
|----------|-------------------|
| **UsuarioServiceImpl** | CREATE_USER, DELETE_USER, ACTIVATE_USER, DEACTIVATE_USER, UNLOCK_USER |
| **AccountRequestService** | APPROVE_REQUEST, REJECT_REQUEST, DELETE_PENDING_USER, CLEANUP_ORPHAN_DATA |
| **AuthenticationServiceImpl** | LOGIN, LOGIN_FAILED, LOGOUT, PASSWORD_CHANGE |

### Patron de Implementacion

```java
// 1. Inyectar servicio
private final AuditLogService auditLogService;

// 2. Metodo helper
private void auditar(String action, String detalle, String nivel, String estado) {
    try {
        String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.registrarEvento(usuario, action, "MODULO", detalle, nivel, estado);
    } catch (Exception e) {
        log.warn("No se pudo registrar auditoria: {}", e.getMessage());
    }
}

// 3. Uso en metodos
public void eliminarUsuario(Long id) {
    Usuario u = repo.findById(id).orElseThrow();
    repo.delete(u);
    auditar("DELETE_USER", "Usuario eliminado: " + u.getNameUser(), "WARNING", "SUCCESS");
}
```

### Acciones Estandarizadas

```
// Autenticacion
LOGIN, LOGOUT, LOGIN_FAILED, PASSWORD_CHANGE, PASSWORD_RESET

// Usuarios
CREATE_USER, UPDATE_USER, DELETE_USER, ACTIVATE_USER, DEACTIVATE_USER, UNLOCK_USER

// Solicitudes
APPROVE_REQUEST, REJECT_REQUEST, DELETE_PENDING_USER, CLEANUP_ORPHAN_DATA

// Disponibilidad Medica
CREATE_DISPONIBILIDAD, UPDATE_DISPONIBILIDAD, SUBMIT_DISPONIBILIDAD,
DELETE_DISPONIBILIDAD, REVIEW_DISPONIBILIDAD, ADJUST_DISPONIBILIDAD

// Niveles
INFO, WARNING, ERROR, CRITICAL

// Estados
SUCCESS, FAILURE
```

### Frontend - Auditoria

**Menu:** "Auditoría" (antes "Logs del Sistema")
**Ubicacion:** `/admin/logs`

#### LogsDelSistema.jsx
- Filtros por usuario, modulo, accion, fechas
- Exportacion a CSV
- Estadisticas (total, hoy, semana, usuarios activos)
- Paginacion de 20 registros

#### AdminDashboard.js - Actividad Reciente
- Muestra **8 ultimas actividades** del sistema
- Formato ejecutivo con acciones legibles
- Muestra usuario + nombre completo
- Indicador de estado (verde=exito, rojo=fallo)

```javascript
// Formato ejecutivo de acciones
const formatAccionEjecutiva = (log) => {
  const acciones = {
    'LOGIN': 'Inicio de sesión',
    'LOGIN_FAILED': 'Acceso denegado',
    'CREATE_USER': 'Nuevo usuario creado',
    'APPROVE_REQUEST': 'Solicitud aprobada',
    // ...
  };
  return acciones[accion] || accion;
};
```

### Fix: Usuario N/A en logs

**Problema:** Los logs mostraban "N/A" en lugar del usuario.

**Solucion en AuditoriaServiceImpl.java:**
```java
private AuditoriaModularResponseDTO mapToAuditoriaResponseDTO(AuditoriaModularView view) {
    // Priorizar usuarioSesion (el que hizo la accion)
    String usuario = view.getUsuarioSesion();
    if (usuario == null || usuario.isBlank()) {
        usuario = view.getUsername();
    }
    if (usuario == null || usuario.isBlank()) {
        usuario = "SYSTEM";
    }
    // ... builder
}
```

### Scripts SQL

```bash
# Crear vista e indices de auditoria
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/001_audit_view_and_indexes.sql

# Renombrar menu a "Auditoría"
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/002_rename_logs_to_auditoria.sql
```

### Documentacion Relacionada

- Plan de accion: `spec/006_plan_auditoria.md`
- Scripts SQL: `spec/scripts/`

---

## Modulo de Disponibilidad de Turnos Medicos

### Descripcion

Modulo completo que permite a los medicos declarar su disponibilidad mensual por turnos (Manana, Tarde, Turno Completo) con validacion de 150 horas minimas, y a los coordinadores revisar y ajustar estas disponibilidades.

### Arquitectura

```
Medico: Dashboard → Mi Disponibilidad → Calendario Interactivo → Guardar/Enviar
                                              ↓
                                        BORRADOR → ENVIADO
                                              ↓
Coordinador: Dashboard → Revision Disponibilidad → Listar ENVIADAS → Revisar/Ajustar
                                              ↓
                                         ENVIADO → REVISADO
```

### Componentes Clave

**Backend (14 archivos):**
- `DisponibilidadMedica.java` - Entidad principal
- `DetalleDisponibilidad.java` - Turnos por dia
- `DisponibilidadController.java` - 15 endpoints REST
- `DisponibilidadServiceImpl.java` - Logica de negocio (560+ lineas)
- 6 DTOs para request/response
- 2 Repositories con queries optimizadas

**Frontend (3 archivos):**
- `CalendarioDisponibilidad.jsx` - Panel medico (650+ lineas)
- `RevisionDisponibilidad.jsx` - Panel coordinador (680+ lineas)
- `disponibilidadService.js` - Cliente API

### Reglas de Negocio

**Horas por Turno (segun regimen laboral):**
- **Regimen 728/CAS:** M=4h, T=4h, MT=8h
- **Regimen Locador:** M=6h, T=6h, MT=12h
- Se obtiene consultando: `PersonalCnt.regimenLaboral.descRegLab`

**Validaciones:**
- Minimo 150 horas/mes para enviar
- Una solicitud por medico, periodo y especialidad
- Medico puede editar hasta que coordinador marque REVISADO
- Estados: BORRADOR → ENVIADO → REVISADO

### Flujo de Estados

```
BORRADOR (medico crea y edita libremente)
    ↓ enviar() - requiere totalHoras >= 150
ENVIADO (medico aun puede editar, coordinador puede revisar)
    ↓ marcarRevisado() - solo coordinador
REVISADO (solo coordinador puede ajustar turnos)
```

### Metodo Critico - Calculo de Horas

```java
private BigDecimal calcularHorasPorTurno(PersonalCnt personal, String turno) {
    RegimenLaboral regimen = personal.getRegimenLaboral();
    String descRegimen = regimen.getDescRegLab().toUpperCase();

    // Regimen 728 o CAS: M=4h, T=4h, MT=8h
    if (descRegimen.contains("728") || descRegimen.contains("CAS")) {
        return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
    }

    // Regimen Locador: M=6h, T=6h, MT=12h
    if (descRegimen.contains("LOCADOR")) {
        return "MT".equals(turno) ? new BigDecimal("12.00") : new BigDecimal("6.00");
    }

    // Default: 728
    return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
}
```

### Endpoints REST

**Para Medico (8 endpoints):**
```
GET    /api/disponibilidad/mis-disponibilidades
GET    /api/disponibilidad/mi-disponibilidad?periodo={YYYYMM}&idEspecialidad={id}
POST   /api/disponibilidad                    # Crear
POST   /api/disponibilidad/borrador           # Guardar borrador
PUT    /api/disponibilidad/{id}               # Actualizar
PUT    /api/disponibilidad/{id}/enviar        # Enviar para revision
GET    /api/disponibilidad/{id}/validar-horas # Validar cumplimiento
DELETE /api/disponibilidad/{id}               # Eliminar borrador
```

**Para Coordinador (7 endpoints):**
```
GET    /api/disponibilidad/periodo/{periodo}         # Todas del periodo
GET    /api/disponibilidad/periodo/{periodo}/enviadas # Solo ENVIADAS
GET    /api/disponibilidad/{id}                       # Detalle
PUT    /api/disponibilidad/{id}/revisar               # Marcar REVISADO
PUT    /api/disponibilidad/{id}/ajustar-turno         # Ajustar turno
```

### Scripts SQL

```bash
# Crear tablas (disponibilidad_medica, detalle_disponibilidad)
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/005_disponibilidad_medica.sql

# Agregar card "Mi Disponibilidad" al dashboard medico
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/scripts/006_agregar_card_disponibilidad.sql
```

### Documentacion Relacionada

- Plan de implementacion: `spec/009_plan_disponibilidad_turnos.md`
- Reporte de pruebas: `spec/010_reporte_pruebas_disponibilidad.md`
- Scripts SQL: `spec/scripts/005_*.sql`, `spec/scripts/006_*.sql`

---

## Instrucciones para Claude

### Al implementar nuevos features:
1. **Analisis previo**: Evaluar impacto en backend, frontend y base de datos
2. **Seguir patrones**: Controller -> Service -> Repository
3. **Usar DTOs**: Nunca exponer entidades directamente
4. **Agregar permisos MBAC** si es necesario

### Al modificar codigo existente:
1. **Leer archivos** antes de modificar
2. **Mantener consistencia** con el estilo existente
3. **No sobreingenieria**: Solo cambios necesarios
4. **Respetar capas**: No mezclar logica de negocio en controllers

### Documentacion adicional:
- **API Endpoints**: `spec/003_api_endpoints.md`
- **Arquitectura**: `spec/004_arquitectura.md`
- **Troubleshooting**: `spec/005_troubleshooting.md`
- **Changelog**: `spec/002_changelog.md`
- **Modelo Usuarios**: `spec/001_espec_users_bd.md`
- **Plan Auditoria**: `spec/006_plan_auditoria.md`
- **Plan Seguridad Auth**: `spec/008_plan_seguridad_auth.md`
- **Plan Disponibilidad Turnos**: `spec/009_plan_disponibilidad_turnos.md`
- **Reporte Pruebas Disponibilidad**: `spec/010_reporte_pruebas_disponibilidad.md`
- **Guia Sistema de Auditoria**: `spec/011_guia_auditoria.md` ⭐
- **Scripts SQL**: `spec/scripts/`

---

## Archivos Clave

### Backend
```
backend/src/main/java/com/styp/cenate/
├── config/SecurityConfig.java
├── security/filter/JwtAuthenticationFilter.java
├── security/service/JwtUtil.java
├── security/mbac/MBACPermissionAspect.java
├── exception/GlobalExceptionHandler.java
├── api/seguridad/AuthController.java
├── api/usuario/UsuarioController.java
├── service/usuario/UsuarioServiceImpl.java
└── model/Usuario.java

backend/src/main/resources/application.properties
```

### Frontend
```
frontend/src/
├── App.js                              # Router principal
├── context/AuthContext.js              # Estado de autenticacion
├── context/PermisosContext.jsx         # Permisos MBAC
├── lib/apiClient.js                    # HTTP client
├── components/security/ProtectedRoute.jsx
├── components/DynamicSidebar.jsx
└── config/version.js                   # Version del sistema
```

---

## MBAC - Uso Rapido

### Backend
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) { ... }
```

### Frontend
```jsx
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

---

## Formato de Respuesta API

### Exito
```json
{
  "status": 200,
  "data": { ... },
  "message": "Operacion exitosa"
}
```

### Error
```json
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "validationErrors": { "campo": "error" }
}
```

---

## Contactos

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |

---

*EsSalud Peru - CENATE | Desarrollado por Ing. Styp Canto Rondon*
