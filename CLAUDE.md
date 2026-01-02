# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.14.0** (2025-12-30)

---

## ¿Qué es CENATE?

**CENATE es el Centro Nacional de Telemedicina** del Seguro Social de Salud (EsSalud) en Perú. Es una institución que usa tecnología para dar atención médica a distancia a los asegurados.  ￼

Funciones principales:
	•	Servicios de telemedicina: consultas, monitoreo y apoyo diagnóstico remoto.  ￼
	•	Atención en más de 20 especialidades médicas.  ￼
	•	Programas educativos y de prevención en salud en línea.  ￼
	•	Facilita acceso a salud para zonas alejadas y reduce necesidad de desplazamientos.  ￼

CENATE también es reconocido como el primer establecimiento de salud virtual en el país.  ￼

### Propósito

CENATE permite:
- **Planificación y registro** de atenciones de telemedicina a nivel nacional
- **Coordinación de atención médica especializada** desde CENATE hacia IPRESS de la red
- **Gestión de turnos médicos** según disponibilidad del personal asistencial
- **Administración de personal médico** con diferentes regímenes laborales (728, CAS, Locador)
- **Trazabilidad completa** de atenciones por paciente, servicio y estrategia
- **Control de accesos y auditoría** de todas las operaciones del sistema
- **Firma digital** para documentos médicos y administrativos

**IMPORTANTE:** Este sistema **NO realiza las videollamadas** directamente. Su función es **planificar, registrar y coordinar** las atenciones que se realizan por teléfono, videollamada (plataformas externas) o mediante el sistema ESSI para teleapoyo al diagnóstico.

---

## Alcance y Cobertura

### Cobertura Nacional

- **Alcance:** Todas las IPRESS (Instituciones Prestadoras de Servicios de Salud) de EsSalud a nivel nacional
- **Total IPRESS objetivo:** 414 instituciones
- **Estado actual:** Fase de expansión (pocas IPRESS conectadas, objetivo: 414)
- **Modelo:** Atención a demanda según capacidad de cada IPRESS

### Estructura Organizacional

```
EsSalud Nacional
    ↓
Macroregiones (5)
    ↓
Redes Asistenciales (36)
    ↓
IPRESS (414 hospitales y centros de salud)
    ↓
CENATE (Centro coordinador nacional)
```

---

## Modalidades de Atención

### 1. Teleconsultas

**Definición:** Atención médica donde el médico de CENATE llama al paciente desde su domicilio/consultorio.

**Características:**
- Médico CENATE → Paciente en su casa
- Llamada telefónica o videollamada (plataforma externa)
- El sistema SOLO registra y planifica, NO hace la conexión

**Flujo:**
```
Paciente solicita cita → Coordinador asigna médico y horario →
Sistema registra la agenda → Médico llama al paciente en el horario →
Sistema registra resultado de la atención
```

### 2. Teleconsultorio

**Definición:** Atención médica donde el paciente acude presencialmente a una IPRESS equipada con tecnología de telemedicina, y un médico especialista de CENATE lo atiende remotamente.

**Características:**
- Paciente presencial en IPRESS + Médico CENATE remoto
- Requiere que la IPRESS tenga infraestructura adecuada (equipamiento, conectividad)
- Se evalúa capacidad mediante el **Módulo de Diagnóstico Institucional** (`form_diag_*`)

**Flujo:**
```
IPRESS solicita turnos → CENATE evalúa capacidad de la IPRESS →
Si tiene equipamiento → Habilita teleconsultorio →
Paciente acude a IPRESS → Médico CENATE atiende remotamente
```

### 3. Teleorientaciones

Orientación médica general sin constituir consulta médica completa.

### 4. Teleinterconsultas

Interconsulta entre médicos de diferentes especialidades o instituciones.

### 5. Telemonitoreo

Seguimiento continuo de pacientes con condiciones crónicas.

### 6. Teleapoyo al Diagnóstico

Soporte diagnóstico mediante la plataforma ESSI (sistema externo de EsSalud).

---

## Estrategias de Atención

El sistema permite **etiquetar** las atenciones según estrategias nacionales de salud:

| Estrategia | Descripción |
|------------|-------------|
| **TeleDOT** | Tratamiento Directamente Observado por Telemedicina (tuberculosis) |
| **CENACRON** | Atención de enfermedades crónicas |
| **Teledengue** | Seguimiento de casos de dengue |
| **Telepsicoprofilaxis** | Atención psicológica preventiva |
| **TeleCAM** | Cáncer de Mama |
| **Otras** | Sistema extensible para futuras estrategias |

**Beneficio:** Permite **trazabilidad** y análisis estadístico por estrategia de salud pública.

---

## Actores del Sistema

| Actor | Descripción | Función Principal | Institución |
|-------|-------------|-------------------|-------------|
| **Médicos** | Personal asistencial que brinda atenciones | Realizar teleconsultas, registrar atenciones | CENATE + IPRESS |
| **Coordinador de Especialidades** | Gestiona asignación de médicos a solicitudes | Asignar qué médico atiende cada solicitud | CENATE |
| **Coordinadores** | Gestionan agenda médica y turnos | Revisar disponibilidad, coordinar horarios | CENATE |
| **Coordinadores de Red** | Coordinan solicitudes de IPRESS | Enviar formularios de requerimiento, gestionar turnos | IPRESS de red |
| **Administradores** | Gestionan usuarios, roles y configuración | Control de accesos, seguridad, auditoría | CENATE - TI |
| **Personal Externo** | Usuarios de otras IPRESS (hospitales, centros de salud) | Solicitar turnos, ver disponibilidad | IPRESS de red |
| **Pacientes/Asegurados** | Usuarios finales del servicio | Recibir atención médica | Asegurados EsSalud (4.6M) |

---

## Flujos de Negocio Principales

### 1. Solicitud de Turnos (IPRESS → CENATE)

```
IPRESS solicita turnos para especialidad X →
CENATE envía formulario de requerimiento →
IPRESS completa formulario con demanda →
CENATE evalúa disponibilidad de médicos →
CENATE ofrece programación de turnos →
Coordinador de Red acepta/negocia →
Turnos confirmados
```

### 2. Asignación de Médicos

```
Solicitud de cita ingresa al sistema →
Coordinador de Especialidades revisa →
Verifica disponibilidad de médicos en periodo →
Asigna médico según especialidad y carga →
Médico recibe notificación →
Médico atiende en horario asignado
```

### 3. Gestión de Disponibilidad Médica

```
Médico declara disponibilidad mensual (calendario) →
Marca turnos: Mañana (M), Tarde (T), Completo (MT) →
Sistema calcula total de horas según régimen laboral →
Sistema valida >= 150 horas mínimas →
Médico envía (estado: ENVIADO) →
Coordinador revisa y ajusta si necesario →
Estado: REVISADO (disponibilidad confirmada) →
Sistema usa esta disponibilidad para asignar citas
```

### 4. Atención al Paciente

```
Paciente solicita cita (chatbot o coordinador) →
Sistema muestra servicios disponibles →
Paciente selecciona servicio y fecha/horario →
Solicitud creada (estado: PENDIENTE) →
Coordinador de Especialidades asigna médico →
Médico llama/atiende al paciente →
Sistema registra resultado de atención →
Puede generar: Recita, Interconsulta, Alta, etc. →
Sistema actualiza trazabilidad del paciente
```

### 5. Diagnóstico Institucional de IPRESS

```
IPRESS nueva se registra en sistema →
Admin solicita diagnóstico de capacidades →
IPRESS completa formulario form_diag_* →
Registra: Equipamiento, Infraestructura física,
          Infraestructura tecnológica, RRHH,
          Conectividad, Necesidades →
CENATE evalúa capacidad para teleconsultorio →
Si cumple requisitos → Habilita teleconsultorio →
Si no cumple → Solo teleconsultas (médico llama a casa)
```

---

## Glosario de Términos

### Instituciones y Organizaciones

| Término | Definición |
|---------|-----------|
| **EsSalud** | Seguro Social de Salud del Perú |
| **CENATE** | Centro Nacional de Telemedicina (centro coordinador) |
| **IPRESS** | Institución Prestadora de Servicios de Salud (hospital, centro de salud) |
| **Red Asistencial** | Conjunto de IPRESS de una zona geográfica |
| **Macroregión** | Agrupación de redes asistenciales (5 a nivel nacional) |

### Personal y Roles

| Término | Definición |
|---------|-----------|
| **Personal Interno CENATE** | Trabajadores de CENATE (médicos, coordinadores, admins) |
| **Personal de IPRESS** | Trabajadores de hospitales/centros de la red EsSalud |
| **Personal Externo** | Trabajadores de instituciones fuera de red EsSalud |
| **Régimen 728** | Personal nombrado (4h mañana, 4h tarde, 8h completo) |
| **Régimen CAS** | Contrato Administrativo de Servicios (4h/4h/8h) |
| **Régimen Locador** | Locación de servicios (6h/6h/12h) |

### Modalidades de Atención

| Término | Definición |
|---------|-----------|
| **Teleconsulta** | Médico CENATE llama a paciente en su casa |
| **Teleconsultorio** | Paciente acude a IPRESS, médico CENATE atiende remotamente |
| **Teleorientación** | Orientación médica general |
| **Teleinterconsulta** | Consulta entre médicos de diferentes especialidades |
| **Telemonitoreo** | Seguimiento continuo de pacientes crónicos |
| **Teleapoyo al Diagnóstico** | Soporte diagnóstico vía ESSI |

### Sistema y Tecnología

| Término | Definición |
|---------|-----------|
| **ESSI** | Sistema de información de EsSalud (catálogo de servicios) |
| **MBAC** | Module-Based Access Control (control de acceso modular) |
| **JWT** | JSON Web Token (autenticación) |
| **Firma Digital** | Token físico + certificado digital para firmar documentos |
| **Bolsa 107** | Área de asignación de pacientes nuevos |

### Otros Términos

| Término | Definición |
|---------|-----------|
| **DNI** | Documento Nacional de Identidad (username del sistema) |
| **Asegurado** | Paciente con seguro EsSalud (4.6M registrados) |
| **Disponibilidad** | Declaración mensual de turnos del médico |
| **Turno M** | Turno mañana |
| **Turno T** | Turno tarde |
| **Turno MT** | Turno completo (mañana + tarde) |
| **150 horas** | Mínimo de horas mensuales que debe declarar un médico |

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
├── spec/                                    # 📚 DOCUMENTACION TECNICA
│   ├── 01_Backend/                          # Spring Boot
│   │   └── 01_api_endpoints.md              # Endpoints API REST
│   ├── 02_Frontend/                         # React (próximamente)
│   ├── 03_Arquitectura/                     # Diagramas y flujos
│   │   └── 01_diagramas_sistema.md
│   ├── 04_BaseDatos/                        # PostgreSQL (numeración 01-07)
│   │   ├── 01_modelo_usuarios/              # Modelo de datos usuarios
│   │   │   └── 01_modelo_usuarios.md
│   │   ├── 02_guia_auditoria/               # ⭐ Guía auditoría
│   │   │   └── 02_guia_auditoria.md
│   │   ├── 03_guia_auditoria_acceso_sensible/
│   │   │   └── 03_guia_auditoria_acceso_sensible.md
│   │   ├── 04_analisis_estructura/          # Análisis completo BD
│   │   │   └── 01_resumen_general.md
│   │   ├── 05_plan_limpieza/                # Plan limpieza BD
│   │   │   ├── 01_resumen_ejecutivo.md
│   │   │   ├── 02_guia_ejecucion.md
│   │   │   └── 03_scripts_limpieza_fase1.sql
│   │   ├── 06_scripts/                      # Scripts SQL (16 archivos)
│   │   └── 07_sql/                          # Configuraciones SQL
│   ├── 05_Troubleshooting/
│   │   └── 01_guia_problemas_comunes.md
│   └── README.md                            # ⭐ Índice completo
│
├── plan/                                    # 📋 PLANIFICACION
│   ├── 01_Seguridad_Auditoria/              # Seguridad y auditoría
│   │   ├── 01_plan_auditoria.md
│   │   ├── 02_plan_seguridad_auth.md
│   │   └── 03_plan_mejoras_auditoria.md
│   ├── 02_Modulos_Medicos/                  # Funcionalidades médicas
│   │   ├── 01_plan_disponibilidad_turnos.md
│   │   └── 02_plan_solicitud_turnos.md
│   ├── 03_Infraestructura/                  # Red y coordinación
│   │   └── 01_plan_modulo_red.md
│   ├── 04_Integraciones/                    # IA y servicios externos
│   │   └── 01_analisis_ollama.md
│   ├── 05_Firma_Digital/                    # Firma digital
│   │   └── 01_plan_implementacion.md
│   └── README.md                            # ⭐ Guía de planificación
│
├── checklist/                               # ✅ LOGS Y REPORTES
│   ├── 01_Historial/                        # Changelog y versiones
│   │   ├── 01_changelog.md                  # ⭐ Historial completo
│   │   └── 02_historial_versiones.md
│   ├── 02_Reportes_Pruebas/                 # Reportes de testing
│   │   └── 01_reporte_disponibilidad.md
│   ├── 03_Checklists/                       # Checklists implementación
│   │   └── 01_checklist_firma_digital.md
│   ├── 04_Analisis/                         # Análisis y resúmenes
│   │   ├── 01_analisis_chatbot_citas.md
│   │   └── 02_resumen_mejoras_auditoria.md
│   └── README.md                            # ⭐ Guía de logs
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
  -f spec/04_BaseDatos/06_scripts/007_agregar_email_preferido.sql
```

### Documentacion Relacionada

- Changelog v1.10.1: `checklist/01_Historial/01_changelog.md`
- Script SQL: `spec/04_BaseDatos/06_scripts/007_agregar_email_preferido.sql`

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

- Changelog v1.10.2: `checklist/01_Historial/01_changelog.md`

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
- Changelog: `checklist/01_Historial/01_changelog.md`
- Archivo: `frontend/src/pages/admin/AprobacionSolicitudes.jsx`
- Backend: `AccountRequestService.java`, `SolicitudRegistroController.java`

---

## Asignacion Automatica de Roles + Sistema de Notificaciones

### Descripcion

Sistema inteligente que asigna roles automáticamente según la afiliación del usuario (IPRESS) al aprobar solicitudes de registro, y proporciona notificaciones en tiempo real a los administradores sobre usuarios que requieren asignación de rol específico.

### Problema Resuelto

**Antes (v1.12.x):**
- Todos los usuarios recibían rol genérico al aprobar solicitud
- Administradores debían asignar roles manualmente uno por uno
- Sin visibilidad de usuarios pendientes
- Usuarios externos sin aislamiento adecuado

**Después (v1.13.0):**
- ✅ Asignación automática según institución (IPRESS)
- ✅ Notificación visual en tiempo real (campanita)
- ✅ Panel de gestión centralizado
- ✅ Mejor seguridad y onboarding

### Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                   FLUJO DE ASIGNACIÓN                        │
└─────────────────────────────────────────────────────────────┘

Usuario registra solicitud → ADMIN aprueba
                                    ↓
              AccountRequestService.aprobarSolicitud()
                                    ↓
                    ┌───────────────┴───────────────┐
                    │   Verificar IPRESS            │
                    └───────────────┬───────────────┘
                                    ↓
            ┌───────────────────────┴───────────────────────┐
            │                                                │
    ¿Es usuario externo?                        ¿IPRESS es CENATE?
            │                                                │
           SÍ                                               NO
            │                                                │
            ↓                                                ↓
    Rol: INSTITUCION_EX                            Rol: INSTITUCION_EX
            │                                                │
            └────────────────────┬───────────────────────────┘
                                 │
                                 ↓ SÍ (Personal interno CENATE)
                            Rol: USER
                                 │
                                 ↓
                    Usuario creado con rol asignado
                                 ↓
                    ¿Tiene solo 1 rol básico?
                                 │
                                SÍ
                                 ↓
                    Aparece en notificaciones de admin

┌─────────────────────────────────────────────────────────────┐
│                FLUJO DE NOTIFICACIONES                       │
└─────────────────────────────────────────────────────────────┘

NotificationBell.jsx (polling cada 30s)
            ↓
GET /api/usuarios/pendientes-rol
            ↓
UsuarioService.contarUsuariosConRolBasico()
            ↓
Filtrar usuarios ACTIVOS con 1 solo rol (USER o INSTITUCION_EX)
            ↓
Retornar contador → Badge rojo en campanita
            ↓
Admin hace clic → Dropdown con lista
            ↓
Admin clic "Ver Todos" → Panel completo UsuariosPendientesRol.jsx
            ↓
GET /api/usuarios/pendientes-rol/lista
            ↓
Tabla con: Nombre, DNI, Rol Actual, IPRESS, Botón "Asignar Rol"
```

### Reglas de Negocio

**Asignación Automática al Aprobar Solicitud:**

| Tipo Usuario | IPRESS | Rol Asignado | Razonamiento |
|--------------|--------|--------------|--------------|
| Externo | Cualquiera | **INSTITUCION_EX** | Usuario de otra institución |
| Interno | CENTRO NACIONAL DE TELEMEDICINA | **USER** | Personal CENATE |
| Internal | Otra IPRESS | **INSTITUCION_EX** | Personal de otra institución |

**Usuarios en Notificaciones:**
- Estado: **ACTIVO**
- Cantidad de roles: **Exactamente 1**
- Rol asignado: **USER** o **INSTITUCION_EX**

**Objetivo:** Identificar usuarios que necesitan roles específicos (MEDICO, ENFERMERIA, COORDINADOR, etc.)

### Componentes Backend

**1. AccountRequestService.java (Líneas 172-205)**

Lógica de asignación automática:

```java
String rolAsignado;
if (solicitud.isExterno()) {
    rolAsignado = "INSTITUCION_EX";
    log.info("Usuario EXTERNO → Rol asignado: INSTITUCION_EX");
} else {
    if (solicitud.getIdIpress() != null) {
        Ipress ipress = ipressRepository.findById(solicitud.getIdIpress()).orElse(null);
        if (ipress != null) {
            String nombreIpress = ipress.getDescIpress();
            if ("CENTRO NACIONAL DE TELEMEDICINA".equalsIgnoreCase(nombreIpress)) {
                rolAsignado = "USER";
                log.info("Usuario INTERNO de CENATE → Rol asignado: USER");
            } else {
                rolAsignado = "INSTITUCION_EX";
                log.info("Usuario INTERNO de otra institución → Rol asignado: INSTITUCION_EX");
            }
        } else {
            rolAsignado = "USER";
        }
    } else {
        rolAsignado = "USER";
    }
}
```

**2. UsuarioController.java (2 nuevos endpoints)**

| Endpoint | Método | Descripción | Response |
|----------|--------|-------------|----------|
| `/api/usuarios/pendientes-rol` | GET | Contador de usuarios pendientes | `{pendientes: 5, hayPendientes: true}` |
| `/api/usuarios/pendientes-rol/lista` | GET | Lista completa de usuarios | `Array<UsuarioResponse>` |

**3. UsuarioServiceImpl.java (Métodos de filtrado)**

Usa Stream API para filtrar usuarios:

```java
@Override
public Long contarUsuariosConRolBasico() {
    List<Usuario> todosUsuarios = usuarioRepository.findByStatUser("ACTIVO");

    return todosUsuarios.stream()
        .filter(usuario -> {
            List<Rol> roles = usuario.getRoles();
            if (roles == null || roles.isEmpty() || roles.size() > 1) {
                return false;
            }
            String rolNombre = roles.get(0).getDescRol();
            return "USER".equalsIgnoreCase(rolNombre) ||
                   "INSTITUCION_EX".equalsIgnoreCase(rolNombre);
        })
        .count();
}
```

### Componentes Frontend

**1. NotificationBell.jsx (176 líneas)**

Campanita de notificaciones con:
- **Badge rojo** con contador (99+ si excede)
- **Polling** cada 30 segundos
- **Dropdown** con lista rápida (5 usuarios)
- **Botón "Ver Todos"** → Navega a panel completo
- **Estados visuales:** Loading, sin notificaciones, con notificaciones

**Ubicación:** Header del AdminDashboard.js (esquina superior derecha)

**2. UsuariosPendientesRol.jsx (252 líneas)**

Panel de gestión completo:
- **Header** con título y botón refrescar
- **Contador visual** con icono de UserCog
- **Tabla** con columnas:
  - Usuario (avatar + nombre + correo)
  - DNI
  - Rol Actual (badge de color)
  - IPRESS
  - Acción (botón "Asignar Rol")
- **Estados vacíos:** Mensaje positivo "¡Todo al día!"
- **Loading state**

**Ruta:** `/admin/usuarios-pendientes-rol`

**3. Integración en AdminDashboard.js**

```javascript
import NotificationBell from "../components/NotificationBell";

// En el header del dashboard
<div className="flex items-start justify-between">
  <div className="flex-1">
    <h1>Dashboard Administrativo</h1>
  </div>

  {/* 🔔 Campanita de Notificaciones */}
  <div className="flex-shrink-0">
    <NotificationBell />
  </div>
</div>
```

### Endpoints API Completos

```
┌─────────────────────────────────────────────────────────────┐
│                    ENDPOINTS v1.13.0                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔔 GET /api/usuarios/pendientes-rol                         │
│     Autenticación: Bearer Token                              │
│     Roles: SUPERADMIN, ADMIN                                 │
│     Response:                                                │
│     {                                                        │
│       "pendientes": 5,                                       │
│       "hayPendientes": true                                  │
│     }                                                        │
│                                                              │
│  📋 GET /api/usuarios/pendientes-rol/lista                   │
│     Autenticación: Bearer Token                              │
│     Roles: SUPERADMIN, ADMIN                                 │
│     Response:                                                │
│     [                                                        │
│       {                                                      │
│         "idUser": 226,                                       │
│         "nombreCompleto": "Juan Perez Lopez",                │
│         "username": "12345678",                              │
│         "roles": ["USER"],                                   │
│         "correoPersonal": "juan@gmail.com",                  │
│         "correoCorporativo": "juan@essalud.gob.pe",          │
│         "ipress": "HOSPITAL REBAGLIATI"                      │
│       }                                                      │
│     ]                                                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Casos de Uso

**Caso 1: Aprobación de médico de CENATE**
```
1. Médico solicita registro con IPRESS "CENTRO NACIONAL DE TELEMEDICINA"
2. Admin aprueba → Sistema asigna rol USER automáticamente
3. Médico aparece en campanita de notificaciones
4. Admin accede al panel y le asigna rol MEDICO
```

**Caso 2: Aprobación de usuario externo de otra institución**
```
1. Usuario solicita como EXTERNO con IPRESS "HOSPITAL GRAU"
2. Admin aprueba → Sistema asigna rol INSTITUCION_EX
3. Usuario aparece en notificaciones
4. Admin confirma que el rol es correcto (no necesita cambio)
```

**Caso 3: Aprobación de enfermera de otra institución**
```
1. Enfermera solicita con IPRESS "HOSPITAL REBAGLIATI" (no es CENATE)
2. Admin aprueba → Sistema asigna rol INSTITUCION_EX
3. Enfermera aparece en notificaciones
4. Admin le asigna rol ENFERMERIA según corresponda
```

### Beneficios

| Beneficio | Descripción | Impacto |
|-----------|-------------|---------|
| **Reducción de trabajo manual** | 80% de usuarios ya tienen rol correcto | ⏱️ Ahorra tiempo |
| **Mejor seguridad** | Usuarios externos automáticamente aislados | 🔒 Seguridad |
| **Visibilidad en tiempo real** | Notificaciones cada 30s | 👁️ Proactividad |
| **Centralización** | Panel único para gestión | 🎯 Eficiencia |
| **Mejor UX** | Onboarding más rápido | 😊 Satisfacción |

### Polling y Performance

**Configuración de Polling:**
```javascript
// NotificationBell.jsx
const INTERVALO_CONSULTA = 30000; // 30 segundos

useEffect(() => {
  consultarPendientes();
  const intervalo = setInterval(consultarPendientes, INTERVALO_CONSULTA);
  return () => clearInterval(intervalo);
}, []);
```

**Optimización Backend:**
- Filtrado en memoria (Stream API) sobre usuarios ACTIVOS
- Sin queries pesadas a BD
- Response mínimo (solo contador boolean)

### Testing

**Escenarios de Prueba:**

1. ✅ Aprobar usuario externo → Debe asignar INSTITUCION_EX
2. ✅ Aprobar usuario CENATE → Debe asignar USER
3. ✅ Aprobar usuario de otra IPRESS interna → Debe asignar INSTITUCION_EX
4. ✅ Campanita muestra contador correcto
5. ✅ Dropdown muestra usuarios pendientes
6. ✅ Panel completo lista todos los usuarios
7. ✅ Botón "Asignar Rol" navega a gestión de usuarios
8. ✅ Polling actualiza cada 30s
9. ✅ Badge desaparece cuando no hay pendientes

### Documentacion Relacionada

- **Versión:** v1.13.0
- **Changelog:** `checklist/01_Historial/01_changelog.md` (entrada completa de 148 líneas)
- **Archivos Modificados:**
  - Backend: `AccountRequestService.java`, `UsuarioController.java`, `UsuarioService.java`, `UsuarioServiceImpl.java`
  - Frontend: `NotificationBell.jsx`, `UsuariosPendientesRol.jsx`, `AdminDashboard.js`, `App.js`
  - Docs: `version.js`, `CLAUDE.md`, `changelog.md`

---

## Modulo de Auditoria

### Documentación Completa

📖 **Ver guía completa:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`

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
  -f spec/04_BaseDatos/06_scripts/001_audit_view_and_indexes.sql

# Renombrar menu a "Auditoría"
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/002_rename_logs_to_auditoria.sql
```

### Documentacion Relacionada

- Plan de accion: `plan/01_Seguridad_Auditoria/01_plan_auditoria.md`
- Scripts SQL: `spec/04_BaseDatos/06_scripts/`

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
  -f spec/04_BaseDatos/06_scripts/005_disponibilidad_medica.sql

# Agregar card "Mi Disponibilidad" al dashboard medico
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/006_agregar_card_disponibilidad.sql
```

### Documentacion Relacionada

- Plan de implementacion: `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
- Reporte de pruebas: `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`
- Scripts SQL: `spec/04_BaseDatos/06_scripts/005_*.sql`, `spec/04_BaseDatos/06_scripts/006_*.sql`

---

## Modulo de Firma Digital para Personal Interno

### Descripcion

Sistema completo de gestion de firmas digitales (tokens y certificados) para personal interno de regimen CAS y 728. Permite registrar la entrega de tokens, fechas de certificados digitales, y gestionar entregas pendientes con flujo de actualizacion posterior.

### Alcance

**Solo para usuarios INTERNOS (tipo_personal = '1')**
- Personal de regimen **CAS** y **728**: Formulario completo
- Personal de regimen **LOCADOR**: Mensaje informativo (gestionan su propia firma)
- Usuarios **EXTERNOS**: No se muestra la pestana

### Arquitectura

```
Usuario INTERNO → Datos Laborales → Firma Digital
                                          ↓
                              ¿Regimen LOCADOR?
                         ┌─────────┴─────────┐
                        SI                   NO (CAS/728)
                         │                    │
            Mensaje informativo      ¿Entrego token?
            "Gestiona su propia      ┌────┴────┐
             firma digital"          SI        NO
                         │            │        │
                         ↓            ↓        ↓
                    A Roles    Capturar:  Motivo:
                               • N° Serie Token         • YA_TIENE → Fechas existentes
                               • Fechas certificado     • NO_REQUIERE
                               • Fecha entrega          • PENDIENTE
                                                              ↓
                                                        (EDICION POSTERIOR)
                                                              ↓
                                                   Boton: "Registrar entrega"
                                                              ↓
                                                        Modal especial
                                                              ↓
                                                        Capturar datos y
                                                        cambiar a ENTREGADO
```

### Componentes Backend

**Tabla de Base de Datos:**
- `firma_digital_personal` con 12 columnas
- 7 CHECK constraints para integridad de datos
- 5 indices para performance
- Trigger auto-update para timestamps

**Entidad JPA:**
- `FirmaDigitalPersonal.java` con 10+ metodos helper
- Relacion `@ManyToOne` con `PersonalCnt`
- Metodos clave:
  - `esPendienteEntrega()` - Detecta estado PENDIENTE
  - `puedeActualizarEntrega()` - Valida si puede actualizarse
  - `tieneCertificadoVigente()` - Verifica vigencia
  - `obtenerEstadoCertificado()` - VIGENTE/VENCIDO/SIN_CERTIFICADO

**DTOs (3):**
- `FirmaDigitalRequest` - Crear/actualizar firma digital
- `FirmaDigitalResponse` - Respuesta con datos completos
- `ActualizarEntregaTokenRequest` - Actualizar entregas PENDIENTE

**Service Layer:**
- `FirmaDigitalService` - Interface con 8 metodos
- `FirmaDigitalServiceImpl` - Implementacion con:
  - Patron UPSERT (crea si no existe, actualiza si existe)
  - Validacion de regimen laboral para calcular horas
  - Integracion con `AuditLogService`
  - Metodo especial `actualizarEntregaToken()` para PENDIENTE

**Controller REST:**
- `FirmaDigitalController` - 9 endpoints:
  ```
  POST   /api/firma-digital                    # Crear/actualizar
  GET    /api/firma-digital/personal/{id}      # Obtener por personal
  PUT    /api/firma-digital/{id}/actualizar-entrega  # Actualizar PENDIENTE
  GET    /api/firma-digital/pendientes         # Listar pendientes
  GET    /api/firma-digital/proximos-vencer    # Certificados por vencer
  DELETE /api/firma-digital/{id}               # Eliminar (soft delete)
  ```

### Componentes Frontend

**FirmaDigitalTab.jsx (420 lineas):**
- Componente tab condicional segun regimen
- Tres flujos distintos:
  1. **Locador**: Solo mensaje informativo
  2. **CAS/728 con token**: Formulario completo con numero de serie
  3. **CAS/728 sin token**: Selector de motivo + campos condicionales
- Validacion en tiempo real
- Limpieza automatica de campos segun seleccion

**ActualizarEntregaTokenModal.jsx (357 lineas):**
- Modal especifico para actualizar entregas PENDIENTE
- Muestra informacion del personal en solo lectura
- Badge de estado "PENDIENTE"
- Formulario con validacion de:
  - Numero de serie del token (obligatorio)
  - Fecha de entrega (default: hoy)
  - Fechas de certificado (inicio y vencimiento)
  - Observaciones (opcional)
- Integrado con PUT `/api/firma-digital/{id}/actualizar-entrega`

**Integracion en Modales:**

1. **CrearUsuarioModal.jsx:**
   - Tab "Firma Digital" entre "Datos Laborales" y "Roles"
   - 7 campos nuevos en formData
   - Validacion completa antes de avanzar al tab "Roles"
   - Envia `firmaDigital` object en request de creacion

2. **ActualizarModel.jsx:**
   - Misma integracion que CrearUsuarioModal
   - Funcion `cargarFirmaDigital()` para cargar datos existentes
   - Deteccion automatica de estado PENDIENTE
   - Boton especial "Registrar Entrega" cuando es PENDIENTE
   - Modal `ActualizarEntregaTokenModal` para completar entrega

### Reglas de Negocio

**Validaciones de Datos:**

| Condicion | Campos Obligatorios | Constraint BD |
|-----------|-------------------|---------------|
| Entrego token = SI | numero_serie_token, fecha_inicio, fecha_vencimiento, fecha_entrega | chk_entrego_token_fechas |
| Entrego token = NO | motivo_sin_token | chk_no_entrego_motivo |
| Motivo = YA_TIENE | fecha_inicio, fecha_vencimiento del certificado existente | chk_motivo_ya_tiene |
| Cualquier caso | fecha_vencimiento > fecha_inicio | chk_fechas_coherentes |

**Flujo de Estados:**
```
PENDIENTE → (Admin registra entrega) → ENTREGADO
   ↑                                        │
   │                                        ↓
   └──────── (Solo lectura) ────── NO puede volver
```

**Calculo de Vigencia:**
- Sistema compara `fecha_vencimiento_certificado` vs fecha actual
- Estados: VIGENTE, VENCIDO, SIN_CERTIFICADO
- Puede usarse para alertas automaticas (futuro)

### Patron UPSERT Implementado

```java
// Service method
public FirmaDigitalResponse guardarFirmaDigital(FirmaDigitalRequest request) {
    // Buscar si ya existe
    FirmaDigitalPersonal firma = firmaRepository
        .findByPersonal_IdPers(request.getIdPersonal())
        .orElse(null);

    boolean esNuevo = (firma == null);

    if (esNuevo) {
        firma = FirmaDigitalPersonal.builder()
            .personal(personal)
            .statFirma("A")
            .build();
    }

    // Mapear campos y guardar
    mapearCampos(request, firma);
    FirmaDigitalPersonal firmaSaved = firmaRepository.save(firma);

    // Auditar
    auditar(esNuevo ? "CREATE" : "UPDATE", ...);

    return mapToResponse(firmaSaved);
}
```

### Scripts SQL

```bash
# Crear tabla firma_digital_personal
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/015_crear_tabla_firma_digital_personal.sql
```

**Script incluye:**
- Creacion de tabla con 12 columnas
- 5 indices (id_pers, stat, motivo, fechas)
- 7 CHECK constraints para validaciones
- Trigger `trg_update_firma_digital_timestamp`
- GRANT de permisos a postgres
- Mensajes de confirmacion

### Casos de Uso

**Caso 1: Medico CAS con token entregado**
```
1. Admin crea usuario medico, regimen CAS
2. En tab "Firma Digital" selecciona "SI" en ¿Entrego token?
3. Ingresa numero de serie: ABC123456789
4. Ingresa fechas: 2025-01-01 a 2027-01-01
5. Guarda usuario → Firma digital se crea con estado ENTREGADO
```

**Caso 2: Enfermera 728 con entrega PENDIENTE**
```
1. Admin crea usuaria enfermera, regimen 728
2. En tab "Firma Digital" selecciona "NO" en ¿Entrego token?
3. Selecciona motivo: PENDIENTE
4. Guarda usuario → Firma digital con estado PENDIENTE
5. Dias despues, enfermera trae el token
6. Admin edita usuario, ve boton "Registrar Entrega"
7. Hace clic, abre modal especial
8. Completa: numero serie, fechas certificado
9. Guarda → Estado cambia a ENTREGADO
```

**Caso 3: Personal Locador**
```
1. Admin crea usuario, regimen LOCADOR
2. En tab "Firma Digital" ve solo mensaje informativo
3. No puede ingresar datos (gestionan su propia firma)
4. Continua a tab "Roles"
```

**Caso 4: Personal con firma existente (YA_TIENE)**
```
1. Admin crea usuario que ya tiene firma digital propia
2. Selecciona "NO" en ¿Entrego token?
3. Selecciona motivo: YA_TIENE
4. Sistema pide fechas del certificado existente
5. Ingresa fechas de su certificado actual
6. Guarda → Queda registrado para seguimiento de vencimiento
```

### Validacion en 3 Capas

**1. Frontend (FirmaDigitalTab + Modales):**
```javascript
// Validacion antes de avanzar de tab
if (formData.entrego_token === 'SI') {
  if (!formData.numero_serie_token) {
    errors.numero_serie_token = 'Numero de serie obligatorio';
  }
  if (!formData.fecha_inicio_certificado) {
    errors.fecha_inicio = 'Fecha obligatoria';
  }
  // ... mas validaciones
}
```

**2. Backend DTO:**
```java
// FirmaDigitalRequest.esValido()
public boolean esValido() {
    if (Boolean.TRUE.equals(entregoToken)) {
        if (numeroSerieToken == null || numeroSerieToken.isBlank()) {
            return false;
        }
        if (fechaInicioCertificado == null || fechaVencimientoCertificado == null) {
            return false;
        }
    }
    return true;
}
```

**3. Base de Datos (CHECK Constraints):**
```sql
CONSTRAINT chk_entrego_token_fechas CHECK (
    (entrego_token = TRUE AND
     fecha_inicio_certificado IS NOT NULL AND
     fecha_vencimiento_certificado IS NOT NULL AND
     numero_serie_token IS NOT NULL) OR
    (entrego_token = FALSE)
)
```

### Auditoria

Todas las operaciones son auditadas via `AuditLogService`:

| Accion | Nivel | Detalle |
|--------|-------|---------|
| CREATE_FIRMA_DIGITAL | INFO | "Nueva firma digital: {nombre} - {regimen}" |
| UPDATE_FIRMA_DIGITAL | INFO | "Firma digital actualizada: {idPersonal}" |
| UPDATE_ENTREGA_TOKEN | INFO | "Token entregado: {numeroSerie}" |
| DELETE_FIRMA_DIGITAL | WARNING | "Firma digital eliminada: {idPersonal}" |

### Beneficios

| Beneficio | Descripcion |
|-----------|-------------|
| **Trazabilidad** | Historial completo de entregas y certificados |
| **Seguridad** | Validaciones en 3 capas evitan inconsistencias |
| **Flexibilidad** | Permite entregas inmediatas o pendientes |
| **Compliance** | Seguimiento de vigencia de certificados |
| **Auditoria** | Registro de todas las operaciones |

### Proximas Mejoras

1. **Dashboard de alertas** - Certificados proximos a vencer
2. **Notificaciones email** - Avisos 30 dias antes de vencimiento
3. **Reporte Excel** - Exportacion de firmas digitales
4. **Historial de renovaciones** - Tracking de multiples certificados
5. **Integracion con RENIEC** - Validacion automatica de identidad

### Documentacion Relacionada

- Plan Implementación: `plan/05_Firma_Digital/01_plan_implementacion.md`
- Checklist: `checklist/03_Checklists/01_checklist_firma_digital.md`
- Script SQL: `spec/04_BaseDatos/06_scripts/015_crear_tabla_firma_digital_personal.sql`
- Version: v1.14.0

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

**📚 Documentación Técnica (spec/):**
- **Backend**:
  - API Endpoints: `spec/01_Backend/01_api_endpoints.md`
- **Arquitectura**:
  - Diagramas Sistema: `spec/03_Arquitectura/01_diagramas_sistema.md`
- **Base de Datos**:
  - Modelo Usuarios: `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
  - Guía Auditoría: `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md` ⭐
  - Guía Auditoría Acceso Sensible: `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/03_guia_auditoria_acceso_sensible.md`
  - Análisis Estructura BD: `spec/04_BaseDatos/04_analisis_estructura/`
  - Plan Limpieza BD: `spec/04_BaseDatos/05_plan_limpieza/`
  - Scripts SQL: `spec/04_BaseDatos/06_scripts/`
  - Configuraciones SQL: `spec/04_BaseDatos/07_sql/`
- **Troubleshooting**:
  - Guía Problemas Comunes: `spec/05_Troubleshooting/01_guia_problemas_comunes.md`

**📋 Planificación (plan/):**
- **Seguridad y Auditoría**:
  - Plan Auditoría: `plan/01_Seguridad_Auditoria/01_plan_auditoria.md`
  - Plan Seguridad Auth: `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`
  - Plan Mejoras Auditoría: `plan/01_Seguridad_Auditoria/03_plan_mejoras_auditoria.md`
- **Módulos Médicos**:
  - Plan Disponibilidad Turnos: `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
  - Plan Solicitud Turnos: `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md`
- **Infraestructura**:
  - Plan Módulo Red: `plan/03_Infraestructura/01_plan_modulo_red.md`
- **Integraciones**:
  - Análisis Ollama: `plan/04_Integraciones/01_analisis_ollama.md`
- **Firma Digital**:
  - Plan Implementación: `plan/05_Firma_Digital/01_plan_implementacion.md`

**✅ Checklists y Logs (checklist/):**
- **Historial**:
  - Changelog: `checklist/01_Historial/01_changelog.md` ⭐
  - Historial Versiones: `checklist/01_Historial/02_historial_versiones.md`
- **Reportes de Pruebas**:
  - Reporte Disponibilidad: `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`
- **Checklists**:
  - Checklist Firma Digital: `checklist/03_Checklists/01_checklist_firma_digital.md`
- **Análisis**:
  - Análisis Chatbot Citas: `checklist/04_Analisis/01_analisis_chatbot_citas.md`
  - Resumen Mejoras Auditoría: `checklist/04_Analisis/02_resumen_mejoras_auditoria.md`

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
