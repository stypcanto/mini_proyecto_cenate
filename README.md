
# 🏥 CENATE - Centro Nacional de Telemedicina

> **Sistema integral de coordinación de atenciones médicas remotas para EsSalud**
> **Versión:** v1.41.0 (2026-01-30)
> **Status:** ✅ Production Ready

---

## 🎯 ¿QUÉ ES CENATE?

**CENATE** es el Centro Nacional de Telemedicina del Seguro Social de Salud (EsSalud) en Perú. Coordina atenciones médicas remotas para **4.6M asegurados** a través de **414 IPRESS** a nivel nacional.

**Función Principal:** Planificar, registrar y coordinar atenciones de telemedicina (NO realiza videollamadas).

---

## 📚 DOCUMENTACIÓN - ¿POR DÓNDE EMPEZAR?

### 🚀 Para Entender el Proyecto Completo

**→ Lee primero:** `CLAUDE.md`
**→ Luego navega:** `spec/INDEX.md` (Índice maestro de documentación)

### 👥 Por Rol - Elige El Tuyo

| Rol | Punto de Entrada | Documento |
|-----|-----------------|-----------|
| 👨‍💻 **Backend Dev** | Spring Boot + APIs | `spec/backend/README.md` |
| 👩‍💻 **Frontend Dev** | React + Interfaces | `spec/frontend/README.md` |
| 🏗️ **Arquitecto** | Diagramas + Flujos | `spec/architecture/README.md` |
| 🎨 **Diseñador UI/UX** | Design System | `spec/UI-UX/README.md` |
| 💾 **Admin BD** | PostgreSQL + Backups | `spec/database/README.md` |
| 🔧 **DevOps** | Scripts + Deployment | `spec/sh/README.md` |
| 🔍 **QA/Support** | Problemas + Soluciones | `spec/troubleshooting/README.md` |

---

## 📂 ESTRUCTURA DEL PROYECTO

### Proyecto Maven/Gradle

```
mini_proyecto_cenate/
├── backend/                 ← Spring Boot 3.5.6 (Puerto 8080)
│   ├── src/main/java/
│   │   └── com/styp/cenate/
│   │       ├── api/                 → Controllers REST
│   │       ├── service/             → Lógica de negocio
│   │       ├── model/               → Entidades JPA
│   │       ├── repository/          → JPA Repositories
│   │       ├── dto/                 → Data Transfer Objects
│   │       ├── security/            → JWT + MBAC
│   │       └── exception/           → Manejo de errores
│   └── build.gradle
│
├── frontend/                ← React 19 (Puerto 3000)
│   ├── src/
│   │   ├── components/      → Componentes reutilizables
│   │   ├── pages/           → Páginas y módulos
│   │   ├── services/        → API client
│   │   ├── context/         → Estado global
│   │   └── App.jsx
│   └── package.json
│
└── spec/                    ← DOCUMENTACIÓN (Nueva estructura)
    ├── INDEX.md             ← ⭐ Comienza AQUÍ
    ├── README.md
    ├── backend/             → APIs, Servicios, Módulos (15 docs)
    ├── frontend/            → Componentes, Páginas (8 docs)
    ├── architecture/        → Diagramas, Flujos (3 docs)
    ├── UI-UX/              → Design System (2 docs)
    ├── database/            → Esquemas, Auditoría, Backups (15 docs)
    ├── troubleshooting/     → Problemas, Soluciones (8 docs)
    ├── uml/                → Diagramas UML (1 doc)
    ├── test/               → Tests (próximamente)
    └── sh/                 → Scripts SQL + Shell

```

---

## 🔗 ESTRUCTURA DE DOCUMENTACIÓN EN `spec/`

### 📂 Las 9 Carpetas Principales

```
spec/
├── 📚 INDEX.md
│   └── Navegación maestro
│       ├── Links a cada carpeta
│       ├── Documentos principales
│       ├── Referencias rápidas
│       └── Stack tecnológico

├── 📦 backend/
│   ├── README.md           ← Guía de inicio
│   ├── 01_api/             → Endpoints REST
│   ├── 02_modules/         → Módulos específicos
│   ├── 03_services/        → Lógica de servicios
│   ├── 04_dto/             → DTOs
│   ├── 05_notifications/   → Sistema notificaciones
│   ├── 06_auth/            → Seguridad + JWT
│   └── *.md               → Documentación técnica
│
├── 📱 frontend/
│   ├── README.md           ← Guía de inicio
│   ├── 01_components/      → Componentes reutilizables
│   ├── 02_pages/           → Páginas + Módulos
│   │   └── COMO_AGREGAR_PAGINAS.md
│   ├── 03_services/        → API Services
│   ├── 04_context/         → Contextos + Estado
│   ├── 05_layouts/         → Layouts principales
│   └── *.md               → Documentación técnica
│
├── 🏗️ architecture/
│   ├── README.md           ← Guía de inicio
│   ├── 01_diagrams/        → UML + Arquitectura
│   ├── 02_models/          → Modelos de dominio
│   ├── 03_flows/           → Flujos de negocio
│   └── *.md               → Documentación técnica
│
├── 🎨 UI-UX/
│   ├── README.md           ← Guía de inicio
│   ├── 01_design_system/   → Color, Tipografía, Componentes
│   ├── 02_components/      → Especificación de componentes
│   ├── 03_guidelines/      → Guías de uso
│   └── *.md               → Documentación de design
│
├── 💾 database/
│   ├── README.md           ← Guía de inicio
│   ├── 01_models/          → Esquemas de datos
│   ├── 02_audit/           → Auditoría + Trazabilidad
│   ├── 03_performance/     → Índices + Optimización
│   ├── 04_backup/          → Estrategia de backups
│   ├── 05_security/        → Permisos + Seguridad
│   ├── 06_scripts/         → Migraciones SQL
│   ├── 07_horarios/        → Sistema de horarios
│   └── *.md               → Documentación técnica
│
├── 🔧 troubleshooting/
│   ├── README.md           ← Guía de inicio
│   ├── 01_common_issues/   → Problemas comunes
│   ├── 02_solutions/       → Soluciones
│   ├── 03_analysis/        → Análisis técnicos
│   └── *.md               → Documentación de problemas
│
├── 📊 uml/
│   ├── README.md           ← Guía de inicio
│   └── UML_COMPLETO_*.md   → Diagramas UML maestros
│
├── ✅ test/
│   ├── README.md           ← Guía de inicio
│   └── (Próximamente test cases)
│
└── 🔧 sh/
    ├── README.md           ← Guía de inicio
    ├── 01_database/        → Scripts SQL
    ├── 02_backup/          → Scripts backup
    ├── 03_deploy/          → Scripts deployment
    └── *.sql / *.sh       → Scripts ejecutables
```

---

## 🎯 CÓMO NAVEGAR LA DOCUMENTACIÓN

### Opción 1: Punto de Entrada Rápido
```
README.md (este archivo)
    ↓
CLAUDE.md (Descripción general)
    ↓
spec/INDEX.md (Índice maestro)
    ↓
Carpeta según tu rol
    ↓
README.md de esa carpeta
```

### Opción 2: Acceso Directo por Tema

**Quiero entender...**
- 🔴 **El proyecto completo** → `spec/architecture/004_arquitectura.md`
- 🔴 **Cómo crear una página** → `spec/frontend/02_pages/COMO_AGREGAR_PAGINAS.md`
- 🔴 **Los endpoints API** → `spec/backend/01_api_endpoints.md`
- 🔴 **El módulo de bolsas** → `spec/uml/UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`
- 🔴 **Backups y seguridad** → `spec/database/08_plan_backup_protecciones_completo.md`
- 🔴 **Un problema específico** → `spec/troubleshooting/01_guia_problemas_comunes.md`

### Opción 3: Por Módulo Específico

| Módulo | Documentación |
|--------|---------------|
| **Gestión de Citas v1.41.0** | `spec/backend/13_gestion_citas_endpoints.md` + `spec/frontend/12_modulo_gestion_citas.md` |
| **Solicitudes Bolsa v1.8.0** | `spec/backend/08_modulo_bolsas_pacientes_completo.md` |
| **Estados Gestión Citas v1.33.0** | `spec/backend/07_modulo_estados_gestion_citas_crud.md` |
| **Tele-ECG v1.24.0** | `spec/backend/09_teleecg_v3.0.0_guia_rapida.md` |
| **Personal Externo v1.18.0** | `spec/frontend/01_modulo_personal_externo.md` |
| **Filtros Avanzados v1.0.0** | `spec/frontend/` (buscar filtros) |

---

## 🚀 STACK TECNOLÓGICO

### Backend
```
Spring Boot 3.5.6
Java 17
JPA/Hibernate
PostgreSQL 14+
JWT + MBAC (Module-Based Access Control)
```

### Frontend
```
React 19
TailwindCSS 3.4.18
Lucide React (iconos)
React Router
Context API
```

### Infraestructura
```
PostgreSQL 14+ (10.0.89.241:5432)
Docker (contenedores)
Git (control de versiones)
Maven/Gradle (build)
```

---

## 🔑 CONCEPTOS CLAVE

### Módulos Principales
- **Solicitudes de Bolsa:** Gestión de pacientes en bolsas de atención
- **Estados Gestión Citas:** Estados de seguimiento de citas
- **Tele-ECG:** Registro de electrocardiogramas remotos
- **Personal Externo:** Gestión de usuarios externos
- **Disponibilidad:** Sistema de turnos disponibles para médicos

### Conceptos de Negocio
- **IPRESS:** Institución Prestadora de Servicios de Salud
- **Bolsa:** Conjunto de pacientes agrupados para atención
- **CENATE:** Centro Nacional de Telemedicina
- **MBAC:** Control de acceso basado en módulos
- **Auditoría:** Registro completo de acciones críticas

---

## 📋 ARCHIVOS IMPORTANTES EN RAÍZ

| Archivo | Propósito |
|---------|-----------|
| **CLAUDE.md** | Instrucciones para Claude (este proyecto) |
| **README.md** | Este archivo - Navegación general |
| **docker-compose.yml** | Configuración Docker (backend + frontend + smtp-relay) |
| **build.gradle** | Configuración Gradle (Backend) |
| **package.json** | Configuración npm (Frontend) |
| **.gitignore** | Archivos ignorados por Git |

---

## ✅ CHECKLIST - TU PRIMER DÍA

- [ ] Leer `CLAUDE.md` (10 min)
- [ ] Leer `spec/INDEX.md` (5 min)
- [ ] Ir al README según tu rol (5 min)
- [ ] Revisar la documentación de tu módulo (20 min)
- [ ] Clonar el repositorio y compilar (15 min)
- [ ] Ejecutar `docker-compose up -d` (5 min) - levanta backend, frontend y SMTP relay

**Total:** ~1 hora para estar operativo 🚀

---

## 🔧 COMANDOS RÁPIDOS

### Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun          # Ejecutar
./gradlew build            # Compilar
./gradlew test             # Tests
```

### Frontend (React)
```bash
cd frontend
npm install                # Instalar dependencias
npm start                  # Desarrollo (puerto 3000)
npm run build              # Producción
```

### Docker (Producción)
```bash
# Levantar todos los servicios (backend + frontend + smtp-relay)
docker-compose up -d

# Reconstruir después de cambios
docker-compose up -d --build backend

# Ver logs
docker-compose logs -f backend

# Ver estado de servicios
docker ps
```

### Servidor de Correo (SMTP)
```bash
# El relay SMTP está integrado en docker-compose (se levanta automáticamente)
# NO es necesario ejecutar scripts adicionales

# Probar envío de correo
curl "http://localhost:8080/api/health/smtp-test?email=tu@email.com"

# Ver logs del relay SMTP
docker logs smtp-relay-cenate --tail 50

# Configuración:
# - Backend → host.docker.internal:2525 → smtp-relay-cenate
# - Relay → 172.20.0.227:25 (SMTP EsSalud)
# - Remitente: cenate.contacto@essalud.gob.pe
# - Documentación: spec/backend/11_email_smtp/README.md
```

### Database
```bash
# Conectarse a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate

# Ver backups
ls -lh spec/sh/02_backup/
```

---

## 📞 CONTACTOS Y REFERENCIAS

**Desarrollado por:** Ing. Styp Canto Rondón
**Versión Actual:** v1.41.0
**Última Actualización:** 2026-01-30
**Email:** stypcanto@essalud.gob.pe

---

## 🎓 RECURSOS DE APRENDIZAJE

1. **Primero:** Leer toda la documentación en `spec/INDEX.md`
2. **Luego:** Explorar la carpeta según tu rol
3. **Después:** Leer los READMEs de cada carpeta
4. **Finalmente:** Revisar la documentación específica de módulos

**Tiempo estimado:** 2-3 horas para estar completamente orientado

---

## 📝 VERSIONADO

- **v1.41.0** (2026-01-30) - Módulo Gestión de Citas v1.41.0 + Endpoints estado + Actualizar teléfono
- **v1.39.0** (2026-01-30) - SMTP Relay integrado en docker-compose + Documentación
- **v1.38.0** (2026-01-29) - Módulo Bolsas v3.0.0 + Módulo 107
- **v1.37.4** (2026-01-28) - SMTP Relay EsSalud + Endpoint health/smtp-test
- **v1.37.3** (2026-01-28) - Performance Optimization 100 usuarios
- **v1.34.1** (2026-01-26) - Excel v1.8.0, Reorganización Documentación
- **v1.33.0** (2026-01-22) - Estados Gestión Citas
- **v1.24.0** (2026-01-22) - Tele-ECG optimizado
- **v1.20.1** (2026-01-21) - Configuración módulos por IPRESS
- **v1.18.0** (2026-01-20) - Personal Externo + Creación usuarios

[Ver changelog completo](spec/backend/002_changelog.md)

---

## ✨ STATUS ACTUAL

| Componente | Estado | Versión |
|-----------|--------|---------|
| Backend | ✅ Production | v3.5.6 |
| Frontend | ✅ Production | v19 |
| Database | ✅ Production | v14+ |
| SMTP Relay | ✅ Production | EsSalud |
| Gestión de Citas | ✅ Production | v1.41.0 |
| Documentación | ✅ Completa | v1.41.0 |
| Tests | ⏳ Próximamente | - |

---

**🚀 ¡Bienvenido a CENATE! Comienza en `spec/INDEX.md` →**
