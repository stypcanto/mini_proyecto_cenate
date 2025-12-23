# CENATE - Sistema de Telemedicina

<div align="center">

![Version](https://img.shields.io/badge/version-1.8.0-blue)
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
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Documentacion](#documentacion)
- [Credenciales de Prueba](#credenciales-de-prueba)
- [Modulos del Sistema](#modulos-del-sistema)
- [Contacto](#contacto)

---

## Caracteristicas

### Autenticacion y Seguridad
- Login con JWT (JSON Web Tokens)
- Sistema MBAC (Control de Acceso Basado en Modulos)
- Bloqueo automatico por intentos fallidos
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
| [CLAUDE.md](CLAUDE.md) | Guia rapida para desarrollo con Claude |

---

## Credenciales de Prueba

```
Username: 44914706
Password: @Cenate2025
Rol: SUPERADMIN
```

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

## Comandos Utiles

### Backend
```bash
# Desarrollo
cd backend && ./gradlew bootRun

# Produccion
cd backend && ./gradlew clean bootJar
java -jar build/libs/cenate-0.0.1-SNAPSHOT.jar
```

### Frontend
```bash
# Desarrollo
cd frontend && npm start

# Produccion
cd frontend && npm run build
```

### Base de Datos
```bash
# Conectar a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Ejecutar script SQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate -f script.sql
```

---

## Historial de Versiones

| Version | Fecha | Descripcion |
|---------|-------|-------------|
| **1.8.0** | 2025-12-23 | Mejoras en Auditoria, fix usuario N/A |
| 1.7.9 | 2025-12-23 | Dashboard ChatBot mejorado, footer con version |
| 1.7.8 | 2025-12-23 | Integracion ChatBot de Citas |
| 1.7.7 | 2025-12-23 | Documentacion de usuarios |
| 1.7.6 | 2025-12-23 | Limpieza de datos huerfanos |

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
