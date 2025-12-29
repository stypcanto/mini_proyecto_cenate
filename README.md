# CENATE - Sistema de Telemedicina

<div align="center">

![Version](https://img.shields.io/badge/version-1.10.0-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

**Sistema completo de gestion para el Centro Nacional de Telemedicina - EsSalud**

</div>

---

## Tabla de Contenidos

- [Caracteristicas](#caracteristicas)
- [Stack Tecnologico](#stack-tecnologico)
- [Instalacion Rapida](#instalacion-rapida)
- [Despliegue en Produccion (Docker)](#despliegue-en-produccion-docker)
- [Comandos con Makefile](#comandos-con-makefile)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Seguridad del Sistema](#seguridad-del-sistema)
- [API REST](#api-rest)
- [Modulos del Sistema](#modulos-del-sistema)
- [Documentacion](#documentacion)

---

## Caracteristicas

### Autenticacion y Seguridad
- Login con JWT (JSON Web Tokens) - Expiracion: 2 horas
- Sistema MBAC (Control de Acceso Basado en Modulos)
- Bloqueo automatico por intentos fallidos (3 intentos = 10 min bloqueo)
- Token Blacklist para invalidacion de sesiones (logout seguro)
- CORS restringido por ambiente (dev/prod)
- Auditoria completa de acciones

### Gestion de Usuarios
- CRUD completo de usuarios internos y externos
- 20+ Roles pre-configurados
- Permisos granulares por modulo y pagina
- Flujo de aprobacion de solicitudes de registro

### ChatBot de Citas
- Wizard de 3 pasos para solicitar citas
- Consulta de paciente por DNI
- Seleccion de disponibilidad (fecha/hora/profesional)
- Dashboard de reportes con KPIs y exportacion CSV

### Auditoria del Sistema
- Registro de todas las acciones del sistema
- Filtros por usuario, modulo, accion, fechas
- Dashboard con actividad reciente
- Exportacion a CSV

### Formulario Diagnostico
- 7 secciones de evaluacion de IPRESS
- Guardado de borradores
- Flujo de aprobacion

---

## Stack Tecnologico

| Componente | Tecnologia | Version |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |
| Iconos | Lucide React | - |
| HTTP Client | Axios | - |

---

## Instalacion Rapida

### Requisitos Previos
- Java 17+
- Node.js 20+
- PostgreSQL 14+

### 1. Clonar el Repositorio
```bash
git clone https://github.com/stypcanto/mini_proyecto_cenate.git
cd mini_proyecto_cenate
```

### 2. Configurar Variables de Entorno

Crear archivo `backend/src/main/resources/application-local.properties`:
```properties
# Base de Datos
spring.datasource.url=jdbc:postgresql://localhost:5432/maestro_cenate
spring.datasource.username=postgres
spring.datasource.password=tu_password

# JWT (minimo 32 caracteres)
jwt.secret=your-secure-key-at-least-32-characters

# Email SMTP (opcional)
spring.mail.username=tu_email@gmail.com
spring.mail.password=tu_app_password

# Frontend URL
app.frontend.url=http://localhost:3000
```

### 3. Ejecutar Backend
```bash
cd backend
./gradlew bootRun
```
Backend disponible en: **http://localhost:8080**

### 4. Ejecutar Frontend
```bash
cd frontend
npm install
npm start
```
Frontend disponible en: **http://localhost:3000**

---

## Despliegue en Produccion (Docker)

### Requisitos
- Docker 20+
- Docker Compose 2+
- Acceso a PostgreSQL (10.0.89.13:5432)

### Arquitectura

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
              ┌───────────────────────────────────┐
              │   PostgreSQL (10.0.89.13:5432)     │
              └───────────────────────────────────┘
```

### Archivos de Configuracion

| Archivo | Descripcion |
|---------|-------------|
| `docker-compose.yml` | Orquestacion principal |
| `frontend/Dockerfile` | Build React + nginx |
| `backend/Dockerfile` | Build Spring Boot + Java 17 |
| `frontend/nginx.conf` | Proxy reverso /api → backend |

### Variables de Entorno Requeridas

El archivo `docker-compose.yml` ya incluye valores por defecto:

```yaml
# Backend
SPRING_DATASOURCE_URL: jdbc:postgresql://10.0.89.13:5432/maestro_cenate
SPRING_DATASOURCE_USERNAME: postgres
SPRING_DATASOURCE_PASSWORD: Essalud2025
JWT_SECRET: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION: 86400000
MAIL_USERNAME: cenateinformatica@gmail.com   # OBLIGATORIO
MAIL_PASSWORD: nolq uisr fwdw zdly           # OBLIGATORIO
TZ: America/Lima

# Frontend (en .env.production)
REACT_APP_API_URL=/api
```

### Comandos de Despliegue

```bash
# Construir y levantar todo
docker-compose up -d --build

# Solo reconstruir frontend
docker-compose build frontend && docker-compose up -d frontend

# Solo reconstruir backend
docker-compose build backend && docker-compose up -d backend

# Ver estado
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Ver logs del backend
docker-compose logs -f backend

# Reiniciar servicios
docker-compose restart

# Detener todo
docker-compose down
```

### Preparar Servidor (Primera vez)

```bash
# Crear directorio para fotos de personal
sudo mkdir -p /var/cenate-uploads/personal
sudo chown -R 1000:1000 /var/cenate-uploads
```

### Puertos Expuestos

| Servicio | Puerto |
|----------|--------|
| Frontend (nginx) | 80 |
| Backend (Spring) | 8080 |

### Troubleshooting

#### Error 502 Bad Gateway
```bash
# Verificar que el backend este corriendo
docker-compose ps
docker-compose logs backend --tail=100
```

**Causas comunes:**
- Falta `MAIL_USERNAME` o `MAIL_PASSWORD`
- No conecta a PostgreSQL
- Backend no termino de arrancar

#### Backend no arranca - Falta MAIL_USERNAME
```
Could not resolve placeholder 'MAIL_USERNAME'
```
**Solucion:** Verificar que `docker-compose.yml` tenga las variables de email.

#### Frontend muestra "localhost:8080"
**Causa:** El codigo no acepta URL relativa `/api`.
**Solucion:** Reconstruir frontend con `docker-compose build frontend`.

> Ver documentacion completa en [CLAUDE.md](CLAUDE.md#despliegue-en-produccion-docker)

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
│   ├── sql/                          # Scripts SQL
│   └── scripts/                      # Scripts de BD
│
├── backend/                          # Spring Boot API (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/                      # Controllers REST
│       ├── service/                  # Logica de negocio
│       ├── model/                    # Entidades JPA
│       ├── repository/               # JPA Repositories
│       ├── dto/                      # Data Transfer Objects
│       ├── security/                 # JWT + MBAC
│       └── exception/                # Manejo de errores
│
├── frontend/                         # React (puerto 3000)
│   └── src/
│       ├── components/               # UI reutilizable
│       ├── context/                  # AuthContext, PermisosContext
│       ├── pages/                    # Vistas
│       ├── services/                 # API services
│       ├── hooks/                    # Custom hooks
│       └── config/version.js         # Version del sistema
│
├── CLAUDE.md                         # Guia rapida para desarrollo
└── README.md                         # Este archivo
```

---

## Documentacion

Toda la documentacion tecnica esta en la carpeta `spec/`:

| Documento | Descripcion |
|-----------|-------------|
| [001_espec_users_bd.md](spec/001_espec_users_bd.md) | Modelo de datos de usuarios, roles, flujos |
| [002_changelog.md](spec/002_changelog.md) | Historial detallado de cambios por version |
| [003_api_endpoints.md](spec/003_api_endpoints.md) | Documentacion completa de la API REST |
| [004_arquitectura.md](spec/004_arquitectura.md) | Diagramas de arquitectura del sistema |
| [005_troubleshooting.md](spec/005_troubleshooting.md) | Solucion a problemas comunes |
| [006_plan_auditoria.md](spec/006_plan_auditoria.md) | Plan de auditoria del sistema |
| [008_plan_seguridad_auth.md](spec/008_plan_seguridad_auth.md) | Plan de seguridad - Autenticacion |
| [CLAUDE.md](CLAUDE.md) | Guia rapida para desarrollo con Claude |

---

## Seguridad del Sistema

### Bloqueo de Cuenta por Intentos Fallidos

El sistema bloquea automaticamente las cuentas despues de **3 intentos fallidos** de login.

```
Intento 1: Contraseña incorrecta → failedAttempts = 1
Intento 2: Contraseña incorrecta → failedAttempts = 2
Intento 3: Contraseña incorrecta → failedAttempts = 3 → CUENTA BLOQUEADA
```

**Duracion del bloqueo:** 10 minutos (auto-desbloqueo)

**Archivos involucrados:**
- `AuthenticationFailureListener.java` - Detecta intentos fallidos
- `AuthenticationSuccessListener.java` - Resetea contador en login exitoso
- `UserDetailsServiceImpl.java` - Verifica si cuenta esta bloqueada

### Token Blacklist (Logout Seguro)

Cuando un usuario cierra sesion, el token JWT se invalida agregandolo a una blacklist.

```
POST /api/auth/logout
Authorization: Bearer {token}

→ Token agregado a blacklist (hash SHA-256)
→ Siguiente request con ese token es rechazado
```

**Limpieza automatica:** Cada hora se eliminan tokens expirados de la blacklist.

**Archivos involucrados:**
- `TokenBlacklist.java` - Entidad JPA
- `TokenBlacklistService.java` - Servicio de invalidacion
- `JwtAuthenticationFilter.java` - Verifica blacklist en cada request

### CORS por Ambiente

| Ambiente | Origenes Permitidos |
|----------|---------------------|
| Desarrollo | `localhost:3000`, `localhost:8080` |
| Produccion | `10.0.89.13`, `10.0.89.239` |

**Configuracion:**
- `application-dev.properties` - Origenes de desarrollo
- `application-prod.properties` - Origenes de produccion

### Perfiles de Ejecucion

```bash
# Desarrollo (con logs SQL, Swagger habilitado)
./gradlew bootRun --args='--spring.profiles.active=dev'

# Produccion (sin logs SQL, Swagger deshabilitado)
java -jar cenate.jar --spring.profiles.active=prod
```

> Ver plan completo de seguridad en [spec/008_plan_seguridad_auth.md](spec/008_plan_seguridad_auth.md)

> **Credenciales de prueba:** Ver [CLAUDE.md](CLAUDE.md#credenciales-de-prueba)

---

## Modulos del Sistema

### Panel Administrativo
- **Dashboard** - Vista general con KPIs y actividad reciente
- **Usuarios** - Gestion completa de usuarios
- **Auditoria** - Trazabilidad de acciones del sistema
- **Solicitudes** - Aprobacion de registros
- **Gestion MBAC** - Modulos, paginas y permisos

### ChatBot de Citas
- **Solicitar Cita** - Wizard de 3 pasos
- **Dashboard Citas** - Reportes y busqueda avanzada

### Roles Especializados
- **Medico** - Dashboard, pacientes, citas, indicadores
- **Coordinador** - Agenda, asignaciones
- **Externo** - Formulario diagnostico, reportes

### Otros Modulos
- **Gestion de Pacientes** - Telemedicina
- **IPRESS** - Listado y gestion
- **Catalogos** - Areas, profesiones, especialidades

---

## API REST

### Base URL
```
http://localhost:8080/api
```

### Headers Requeridos
```
Content-Type: application/json
Authorization: Bearer {token}
```

### Endpoints Principales

| Modulo | Endpoint | Descripcion |
|--------|----------|-------------|
| Auth | `POST /api/auth/login` | Iniciar sesion |
| Auth | `GET /api/auth/me` | Usuario actual |
| Usuarios | `GET /api/usuarios` | Listar usuarios |
| ChatBot | `GET /api/chatbot/documento/{dni}` | Consultar paciente |
| ChatBot | `POST /api/v1/chatbot/solicitud` | Crear cita |
| Auditoria | `GET /api/auditoria/modulos` | Logs del sistema |
| MBAC | `GET /api/menu-usuario/usuario/{id}` | Menu dinamico |

> Ver documentacion completa en [spec/003_api_endpoints.md](spec/003_api_endpoints.md)

---

## Comandos con Makefile

Ambos proyectos incluyen **Makefile** para facilitar el desarrollo:

### Backend
```bash
cd backend
make help        # Ver todos los comandos disponibles
make dev         # Iniciar con hot-reload
make build       # Compilar proyecto
make test        # Ejecutar tests
make jar         # Generar JAR ejecutable
make db-check    # Verificar conexion a PostgreSQL
```

### Frontend
```bash
cd frontend
make help        # Ver todos los comandos disponibles
make dev         # Iniciar en desarrollo (API local)
make dev-network # Iniciar en desarrollo (API en red)
make build       # Compilar para produccion
make test        # Ejecutar tests
make clean       # Limpiar node_modules y build
```

---

## Historial de Versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| **1.10.0** | 2025-12-29 | Docker: Documentacion produccion, fix apiClient URL relativa |
| 1.9.0 | 2025-12-27 | Seguridad: Bloqueo cuenta, Token Blacklist, CORS por ambiente |
| 1.8.0 | 2025-12-23 | Mejoras en Auditoria, fix usuario N/A |

> Ver historial completo en [spec/002_changelog.md](spec/002_changelog.md)

---

## Contacto

| Rol | Correo |
|-----|--------|
| Soporte tecnico | cenate.analista@essalud.gob.pe |
| Sistema (envio) | cenateinformatica@gmail.com |

---

## Licencia

Este proyecto es propiedad de **EsSalud Peru - CENATE**.
Todos los derechos reservados © 2025

---

*Desarrollado por el Ing. Styp Canto Rondon*
