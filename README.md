# CENATE - Sistema de Telemedicina -

<div align="center">

![Version](https://img.shields.io/badge/version-1.34.0-blue)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.6-brightgreen)
![Java](https://img.shields.io/badge/Java-17-orange)
![React](https://img.shields.io/badge/React-19-blue)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)

**Sistema completo de gestión para el Centro Nacional de Telemedicina - EsSalud Perú**

*Coordinación de atención médica especializada a nivel nacional mediante tecnologías de telecomunicación*

[Documentación Completa](CLAUDE.md) • [Índice de Documentación](INDICE_DOCUMENTACION.md) • [Changelog](checklist/01_Historial/01_changelog.md) • [API Endpoints](spec/01_Backend/01_api_endpoints.md)

</div>

---

## 📖 Tabla de Contenidos

- [¿Qué es CENATE?](#qué-es-cenate)
- [Características Principales](#características-principales)
- [Stack Tecnológico](#stack-tecnológico)
- [🚀 Quick Start](#-quick-start)
- [Despliegue en Producción](#despliegue-en-producción-docker)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [📋 Cómo Agregar Nuevas Páginas](#-cómo-agregar-nuevas-páginas-component-registry) ⭐
- [Módulos Implementados](#módulos-implementados)
- [📚 Documentación](#-documentación)
- [Seguridad](#seguridad)
- [API REST & Swagger](#api-rest) ⭐ **Acceso rápido a documentación interactiva**
- [Historial de Versiones](#historial-de-versiones)
- [Contacto](#contacto)

---

## ¿Qué es CENATE?

**CENATE (Centro Nacional de Telemedicina)** es el sistema de gestión de telemedicina de **EsSalud Perú** que coordina la atención médica especializada a nivel nacional.

### Propósito

- **Planificación y registro** de atenciones de telemedicina a nivel nacional
- **Coordinación** entre CENATE y las 414 IPRESS (hospitales y centros de salud)
- **Gestión de turnos médicos** según disponibilidad del personal (150 horas mínimas/mes)
- **Trazabilidad completa** de atenciones por paciente, servicio y estrategia
- **Firma digital** para documentos médicos y administrativos
- **Auditoría** de todas las operaciones del sistema

### Alcance

- **Cobertura:** 414 IPRESS de EsSalud a nivel nacional (en fase de expansión)
- **Usuarios:** 4.6M asegurados registrados
- **Base de datos:** 135 tablas, 5.4 GB de datos históricos

### Modalidades de Atención

| Modalidad | Descripción |
|-----------|-------------|
| **Teleconsulta** | Médico CENATE llama a paciente en su casa |
| **Teleconsultorio** | Paciente acude a IPRESS equipada, médico CENATE atiende remotamente |
| **Teleorientación** | Orientación médica general |
| **Teleinterconsulta** | Consulta entre médicos de diferentes especialidades |
| **Telemonitoreo** | Seguimiento continuo de pacientes crónicos |
| **Teleapoyo Diagnóstico** | Soporte diagnóstico vía sistema ESSI |

> 📖 **Documentación completa de negocio:** Ver [CLAUDE.md - ¿Qué es CENATE?](CLAUDE.md#qué-es-cenate)

---

## Características Principales

### ✨ Módulos Implementados (v1.31.0)

#### 📦 Catálogos y Componentes
- **Módulo de Bolsas** - CRUD completo de tipos de bolsas (v1.31.0)
  - Backend: 7 endpoints REST con búsqueda avanzada
  - Frontend: Interfaz React con 4 modales (crear, ver, editar, eliminar)
  - Base de datos: Tabla `dim_tipos_bolsas` con 7 registros iniciales
  - Documentación: [Resumen Módulo](spec/01_Backend/06_resumen_modulo_bolsas_completo.md) + [CRUD Técnico](spec/01_Backend/05_modulo_tipos_bolsas_crud.md)

#### 📋 Desarrollo y Arquitectura
- **Component Registry** - Sistema de registro dinámico de rutas (v1.14.0)
  - Agregar nuevas páginas con solo 3 líneas de código
  - Lazy loading automático
  - Protección MBAC automática
  - Reducción del 80% de código en App.js

#### 🔐 Autenticación y Seguridad
- **JWT** con expiración de 24 horas
- **Sistema MBAC** (Module-Based Access Control) - Permisos granulares
- **Bloqueo automático** por 3 intentos fallidos (10 min)
- **Token Blacklist** para logout seguro
- **Auditoría completa** de acciones (registro, consulta, exportación)
- **Asignación automática de roles** según IPRESS (v1.13.0)

#### 👥 Gestión de Usuarios
- CRUD completo de usuarios internos y externos
- Sistema de **solicitudes de registro** con flujo de aprobación
- **20+ roles** pre-configurados con permisos específicos
- **Reenvío de correos** de activación (v1.11.0)
- **Recuperación de contraseña** con selección de correo (v1.10.2)
- **Usuarios pendientes de activación** con gestión centralizada

#### 🔔 Sistema de Notificaciones (v1.13.0)
- **Campanita de notificaciones** en tiempo real (polling 30s)
- **Panel de usuarios pendientes** de asignación de rol
- Identificación automática de usuarios que requieren atención

#### 👨‍⚕️ Disponibilidad Médica (v1.9.0)
- **Declaración mensual** de turnos (Mañana, Tarde, Completo)
- **Cálculo automático** de horas según régimen laboral (728/CAS/Locador)
- **Validación de 150 horas mínimas** por mes
- **Flujo de estados:** BORRADOR → ENVIADO → REVISADO
- **Revisión por coordinadores** con ajustes de turnos

#### ✍️ Firma Digital (v1.14.0)
- **Registro de tokens físicos** con número de serie
- **Gestión de certificados digitales** (fechas inicio/vencimiento)
- **Flujo de entregas pendientes** con actualización posterior
- **Validaciones en 3 capas** (frontend, backend DTO, base de datos)
- Auditoría completa de operaciones
- Solo para personal régimen **CAS y 728**

#### 💬 ChatBot de Citas
- **Wizard de 3 pasos** para solicitud de citas
- Consulta de paciente por **DNI**
- Selección de **disponibilidad** (fecha/hora/profesional)
- **Dashboard de reportes** con KPIs y exportación CSV
- Búsqueda avanzada de citas

#### 📊 Auditoría del Sistema
- Registro de **todas las acciones críticas** del sistema
- **Filtros avanzados** por usuario, módulo, acción, fechas
- **Dashboard** con actividad reciente (8 últimas acciones)
- **Exportación a CSV** para análisis
- Vista modular detallada con datos de personal

#### 📋 Formulario Diagnóstico Institucional
- **7 secciones** de evaluación de capacidades de IPRESS
- Evaluación de equipamiento, infraestructura, RRHH, conectividad
- Guardado de **borradores**
- Flujo de aprobación
- Determina si IPRESS puede operar **teleconsultorio**

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| **Backend** | Spring Boot | 3.5.6 |
| **Java** | OpenJDK | 17 |
| **Frontend** | React | 19 |
| **Base de Datos** | PostgreSQL | 14+ |
| **CSS Framework** | TailwindCSS | 3.4.18 |
| **Autenticación** | JWT | - |
| **HTTP Client** | Axios | - |
| **Iconos** | Lucide React | - |
| **Despliegue** | Docker + Docker Compose | 20+ |

---

## 🚀 Quick Start

### Prerrequisitos

- **Java 17+** - `java -version`
- **Node.js 18+** - `node -v`
- **npm 9+** - `npm -v`
- **Git 2+** - `git --version`
- **Acceso a PostgreSQL** en `10.0.89.13:5432`

### 1. Clonar el Repositorio

```bash
git clone https://github.com/stypcanto/mini_proyecto_cenate.git
cd mini_proyecto_cenate
```

### 2. Configurar Variables de Entorno

```bash
# Base de datos PostgreSQL (servidor remoto)
export DB_URL="jdbc:postgresql://10.0.89.13:5432/maestro_cenate"
export DB_USERNAME="postgres"
export DB_PASSWORD="Essalud2025"

# JWT (mínimo 32 caracteres)
export JWT_SECRET="404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970"

# Email SMTP (Servidor Corporativo EsSalud)
export MAIL_HOST="172.20.0.227"
export MAIL_PORT="25"
export MAIL_USERNAME="cenate.contacto@essalud.gob.pe"
export MAIL_PASSWORD="essaludc50"

# Frontend URL
export FRONTEND_URL="http://localhost:3000"
```

### 3. Levantar Backend (Spring Boot)

```bash
cd backend
./gradlew bootRun

# Backend disponible en: http://localhost:8080
# Endpoint de salud: http://localhost:8080/actuator/health
```

### 4. Levantar Frontend (React)

```bash
cd frontend
npm install
npm start

# Frontend disponible en: http://localhost:3000
```

### 5. Primer Acceso

**Credenciales de prueba:**
```
Username: 44914706
Password: @Cenate2025
Rol: SUPERADMIN
```

### 6. Verificar Funcionalidad Básica

1. ✅ **Login exitoso** → Dashboard carga correctamente
2. ✅ **Ver usuarios** → Menú "Gestión de Usuarios"
3. ✅ **Ver auditoría** → Menú "Seguridad" → "Auditoría"
4. ✅ **Crear usuario de prueba** → Verificar que aparece en lista

> 📖 **Guía completa de instalación:** Ver [CLAUDE.md - Quick Start](CLAUDE.md#-quick-start---levantar-el-proyecto)

---

## Despliegue en Producción (Docker)

### ⚠️ PASOS DE INICIO (macOS)

```bash
# 1. Iniciar relay SMTP (permite Docker → servidor corporativo)
./start-smtp-relay.sh

# 2. Levantar servicios
docker-compose up -d --build

# 3. Verificar estado
docker-compose ps
docker-compose logs backend --tail=20
```

### Arquitectura Docker

```
┌─────────────────────────────────────────────────────────────┐
│                      SERVIDOR PRODUCCIÓN                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐      ┌──────────────────┐             │
│  │   cenate-frontend │      │   cenate-backend  │             │
│  │   (nginx:80)      │─────▶│   (spring:8080)   │             │
│  │                   │ /api │                   │             │
│  └────────┬──────────┘      └─────────┬─────────┘             │
│           │                           │                       │
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
              │   Base de datos: maestro_cenate    │
              └───────────────────────────────────┘
```

### Comandos Docker Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar solo backend
docker-compose build backend && docker-compose up -d backend

# Reiniciar solo frontend
docker-compose build frontend && docker-compose up -d frontend

# Detener todo
docker-compose down

# Limpiar imágenes huérfanas
docker image prune -f
```

### Troubleshooting

**Error 502 Bad Gateway:**
```bash
# Verificar backend
docker-compose ps
docker-compose logs backend --tail=50

# Reiniciar servicios
docker-compose restart
```

**Correos no se envían (macOS):**
```bash
# Verificar relay SMTP
ps aux | grep socat

# Reiniciar relay
./start-smtp-relay.sh

# Reiniciar backend
docker-compose restart backend
```

> 📖 **Guía completa de Docker:** Ver [CLAUDE.md - Despliegue en Producción](CLAUDE.md#opción-b-producción-con-docker-para-despliegue)

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── 📚 DOCUMENTACIÓN
│   ├── CLAUDE.md                    # ⭐ Guía maestra del proyecto (2,462 líneas)
│   ├── INDICE_DOCUMENTACION.md      # ⭐ Índice maestro de navegación
│   ├── README.md                    # Este archivo
│   │
│   ├── spec/                        # Documentación técnica (13+ archivos)
│   │   ├── 01_Backend/
│   │   │   ├── 01_api_endpoints.md          # 100+ endpoints documentados
│   │   │   ├── 05_modulo_tipos_bolsas_crud.md # CRUD Tipos de Bolsas (v1.0.0)
│   │   │   └── 06_resumen_modulo_bolsas_completo.md # Resumen módulo Bolsas (v1.31.0)
│   │   ├── 03_Arquitectura/
│   │   │   └── 01_diagramas_sistema.md      # Flujos, capas, MBAC
│   │   ├── 04_BaseDatos/                    # 135 tablas, 5.4 GB
│   │   │   ├── 01_modelo_usuarios/
│   │   │   ├── 02_guia_auditoria/           # ⭐ Sistema de auditoría
│   │   │   ├── 04_analisis_estructura/      # ⭐ Análisis 135 tablas
│   │   │   ├── 05_plan_limpieza/            # ⭐ Optimización BD (-28%)
│   │   │   ├── 06_scripts/                  # 16 scripts SQL
│   │   │   └── 07_sql/
│   │   └── 05_Troubleshooting/
│   │       └── 01_guia_problemas_comunes.md
│   │
│   ├── plan/                        # Planificación (8 planes)
│   │   ├── 01_Seguridad_Auditoria/          # ✅ Implementados v1.12-v1.13
│   │   ├── 02_Modulos_Medicos/              # ✅ Disponibilidad v1.9.0
│   │   ├── 03_Infraestructura/              # 📋 Planificado
│   │   ├── 04_Integraciones/                # 🔍 En evaluación (Ollama)
│   │   └── 05_Firma_Digital/                # ✅ Implementado v1.14.0
│   │
│   └── checklist/                   # Logs y reportes (6 archivos)
│       ├── 01_Historial/
│       │   ├── 01_changelog.md              # ⭐ v1.0.0 → v1.14.0
│       │   └── 02_historial_versiones.md
│       ├── 02_Reportes_Pruebas/
│       ├── 03_Checklists/
│       └── 04_Analisis/
│
├── 🔧 CÓDIGO
│   ├── backend/                     # Spring Boot (puerto 8080)
│   │   └── src/main/java/com/styp/cenate/
│   │       ├── api/                         # Controllers REST
│   │       ├── service/                     # Lógica de negocio
│   │       ├── model/                       # Entidades JPA (51)
│   │       ├── repository/                  # JPA Repositories (48)
│   │       ├── dto/                         # Data Transfer Objects
│   │       ├── security/                    # JWT + MBAC
│   │       └── exception/                   # Manejo de errores
│   │
│   └── frontend/                    # React (puerto 3000)
│       ├── COMPONENT_REGISTRY.md            # ⭐ Guía del Component Registry
│       ├── QUICK_REFERENCE.md               # Referencia rápida
│       ├── IMPLEMENTATION_SUMMARY.md        # Resumen técnico
│       └── src/
│           ├── config/
│           │   └── componentRegistry.js     # ⭐ Registro de rutas dinámicas
│           ├── components/                  # UI reutilizable
│           ├── context/                     # AuthContext, PermisosContext
│           ├── pages/                       # Vistas (31+)
│           ├── services/                    # API services
│           └── lib/apiClient.js             # HTTP client
│
└── 🐳 DESPLIEGUE
    ├── docker-compose.yml           # Orquestación principal
    ├── Dockerfile (backend)         # Spring Boot + Java 17
    ├── Dockerfile (frontend)        # React + nginx
    └── start-smtp-relay.sh          # Relay SMTP para macOS
```

---

## 📋 Cómo Agregar Nuevas Páginas (Component Registry)

> **v1.14.0** - Sistema de registro dinámico de componentes

### ⚡ 3 Pasos Simples

#### 1️⃣ Crear el Componente

```bash
# Crear archivo en la carpeta correspondiente
frontend/src/pages/[carpeta]/NombrePagina.jsx
```

```jsx
import React from 'react';

export default function NombrePagina() {
  return (
    <div>
      <h1>Mi Nueva Página</h1>
      {/* Tu código aquí */}
    </div>
  );
}
```

#### 2️⃣ Registrar en componentRegistry.js

Abrir: `/frontend/src/config/componentRegistry.js`

Buscar el **final del objeto** (antes del `};`) y agregar:

```javascript
  // Al final, antes del cierre };

  '/ruta/a/tu/pagina': {
    component: lazy(() => import('../pages/[carpeta]/NombrePagina')),
    requiredAction: 'ver',
  },
};
```

#### 3️⃣ ¡Listo! 🎉

La página ya está disponible en: `http://localhost:3000/ruta/a/tu/pagina`

---

### 📝 Plantillas Copy-Paste

**Página Administrativa:**
```javascript
'/admin/[nombre]': {
  component: lazy(() => import('../pages/admin/[Componente]')),
  requiredAction: 'ver',
},
```

**Página Solo SUPERADMIN:**
```javascript
'/admin/[nombre]': {
  component: lazy(() => import('../pages/admin/[Componente]')),
  requiredAction: 'ver',
  requiredRoles: ['SUPERADMIN'],
},
```

**Página de Rol Específico (Médico, Coordinador, etc):**
```javascript
'/roles/[rol]/[nombre]': {
  component: lazy(() => import('../pages/roles/[rol]/[Componente]')),
  requiredAction: 'ver',
},
```

**Página Sin Protección MBAC:**
```javascript
'/[nombre]': {
  component: lazy(() => import('../pages/[Componente]')),
  requiredAction: null,
},
```

**Página con Parámetros (ej: `/detalle/:id`):**
```javascript
'/[ruta]/detalle/:id': {
  component: lazy(() => import('../pages/[carpeta]/[Componente]')),
  requiredAction: 'ver',
  pathMatch: '/[ruta]/detalle',  // Path sin parámetros para MBAC
},
```

---

### ⚠️ Errores Comunes

**❌ NO incluir extensión .jsx:**
```javascript
// ❌ INCORRECTO
lazy(() => import('../pages/Admin.jsx'))

// ✅ CORRECTO
lazy(() => import('../pages/Admin'))
```

**❌ NO olvidar `lazy()`:**
```javascript
// ❌ INCORRECTO
component: import('../pages/Admin')

// ✅ CORRECTO
component: lazy(() => import('../pages/Admin'))
```

**❌ NO olvidar la coma al final:**
```javascript
// ❌ INCORRECTO
'/admin/users': {
  component: lazy(() => import('../pages/Admin')),
  requiredAction: 'ver'
}  // ← Falta coma
'/admin/logs': {

// ✅ CORRECTO
'/admin/users': {
  component: lazy(() => import('../pages/Admin')),
  requiredAction: 'ver',
},  // ← Coma agregada
'/admin/logs': {
```

---

### 📊 Beneficios del Component Registry

| Antes (Manual) | Ahora (Registry) | Mejora |
|----------------|------------------|--------|
| Editar 3 secciones en App.js | Agregar 3 líneas en un archivo | **-70%** |
| 500+ líneas de rutas repetitivas | Generación automática | **-80%** código |
| Lazy loading manual | Automático | ✅ |
| Protección MBAC manual | Automática | ✅ |

---

### 📚 Documentación Adicional

- **Guía completa:** [frontend/COMPONENT_REGISTRY.md](frontend/COMPONENT_REGISTRY.md)
- **Referencia rápida:** [frontend/QUICK_REFERENCE.md](frontend/QUICK_REFERENCE.md)
- **Resumen técnico:** [frontend/IMPLEMENTATION_SUMMARY.md](frontend/IMPLEMENTATION_SUMMARY.md)

---

## Módulos Implementados

### 🔐 Panel Administrativo
- **Dashboard** - KPIs, actividad reciente, estadísticas
- **Gestión de Usuarios** - CRUD completo, activación, bloqueo
- **Solicitudes de Registro** - Aprobación/rechazo con notificaciones
- **Usuarios Pendientes** - Lista de usuarios requieren asignación de rol
- **Auditoría** - Logs del sistema con filtros avanzados
- **MBAC** - Gestión de módulos, páginas y permisos

### 👨‍⚕️ Panel Médico
- **Dashboard Médico** - Indicadores personalizados
- **Mi Disponibilidad** - Declaración mensual de turnos
- **Gestión de Pacientes** - Historial de atenciones
- **Citas Asignadas** - Calendario de atenciones

### 🏥 Panel Coordinador
- **Revisión de Disponibilidad** - Validar y ajustar turnos médicos
- **Asignación de Médicos** - Asignar médicos a solicitudes de citas
- **Gestión de Agenda** - Programación de turnos
- **Reportes de Atención** - Estadísticas y KPIs

### 💬 ChatBot de Citas
- **Consulta de Paciente** - Búsqueda por DNI con servicios disponibles
- **Solicitud de Cita** - Wizard de 3 pasos (paciente → servicio → fecha)
- **Dashboard de Reportes** - KPIs, evolución, top servicios, exportación CSV

### 📋 Otros Módulos
- **Formulario Diagnóstico** - Evaluación de capacidades de IPRESS
- **Gestión de IPRESS** - Listado de hospitales y centros de salud
- **Catálogos** - Áreas, profesiones, especialidades, servicios

---

## 📚 Documentación

### 🎯 Inicio Rápido

| Necesito... | Ver documento |
|-------------|---------------|
| **📖 Explorar/probar endpoints interactivamente** | [Swagger UI](http://localhost:8080/swagger-ui.html) ⭐ |
| **Levantar el proyecto en 5 minutos** | [CLAUDE.md - Quick Start](CLAUDE.md#-quick-start---levantar-el-proyecto) |
| **Entender qué es CENATE** | [CLAUDE.md - ¿Qué es CENATE?](CLAUDE.md#qué-es-cenate) |
| **🛡️ Entender el plan de backup y protecciones** | [**spec/04_BaseDatos/08_plan_backup_protecciones_completo.md**](spec/04_BaseDatos/08_plan_backup_protecciones_completo.md) ⭐ NUEVO |
| **Ver glosario de términos** | [CLAUDE.md - Glosario](CLAUDE.md#glosario-de-términos) |
| **Consultar API** | [spec/01_Backend/01_api_endpoints.md](spec/01_Backend/01_api_endpoints.md) |
| **Ver últimos cambios** | [checklist/01_Historial/01_changelog.md](checklist/01_Historial/01_changelog.md) |
| **Resolver problemas** | [spec/05_Troubleshooting/01_guia_problemas_comunes.md](spec/05_Troubleshooting/01_guia_problemas_comunes.md) |

### 📖 Guías Principales

| Documento | Descripción | Líneas |
|-----------|-------------|--------|
| [**CLAUDE.md**](CLAUDE.md) | ⭐ Guía maestra del proyecto (contexto de negocio + técnico) | 2,462 |
| [**INDICE_DOCUMENTACION.md**](INDICE_DOCUMENTACION.md) | ⭐ Índice de navegación de toda la documentación | 342 |
| [**README.md**](README.md) | Este archivo - Vista general del proyecto | - |

### 📚 Documentación Técnica (spec/)

#### Backend
- [**01_api_endpoints.md**](spec/01_Backend/01_api_endpoints.md) - Todos los endpoints REST (100+ endpoints)
- [**05_modulo_tipos_bolsas_crud.md**](spec/01_Backend/05_modulo_tipos_bolsas_crud.md) - CRUD Tipos de Bolsas (v1.0.0)
- [**06_resumen_modulo_bolsas_completo.md**](spec/01_Backend/06_resumen_modulo_bolsas_completo.md) - Resumen completo módulo de Bolsas (v1.31.0)

#### Arquitectura
- [**01_diagramas_sistema.md**](spec/03_Arquitectura/01_diagramas_sistema.md) - Flujos completos, capas, MBAC, patrones

#### Base de Datos (135 tablas, 5.4 GB)
- [**01_modelo_usuarios.md**](spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md) - Modelo de usuarios y autenticación
- [**02_guia_auditoria.md**](spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md) ⭐ - Sistema completo de auditoría
- [**03_guia_auditoria_acceso_sensible.md**](spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/03_guia_auditoria_acceso_sensible.md) - Auditoría de accesos críticos
- [**04_analisis_estructura/**](spec/04_BaseDatos/04_analisis_estructura/) ⭐ - Análisis de las 135 tablas categorizadas
- [**05_plan_limpieza/**](spec/04_BaseDatos/05_plan_limpieza/) ⭐ - Plan para reducir BD de 5.4 GB a 3.9 GB (-28%)
- [**06_scripts/**](spec/04_BaseDatos/06_scripts/) - 16 scripts SQL de migración
- [**07_sql/**](spec/04_BaseDatos/07_sql/) - Configuraciones SQL
- [**🛡️ 08_plan_backup_protecciones_completo.md**](spec/04_BaseDatos/08_plan_backup_protecciones_completo.md) ⭐ **NUEVO** - Plan integral de backup (5 niveles) + Protecciones contra DELETE + Monitoreo automático. **NIVELES IMPLEMENTADOS:** 1 (Backup 2x diarios), 3 (Auditoría + Permisos), 5 (Monitoreo diario). 5,165,000 registros protegidos. RTO 15 min, RPO 7 horas.

#### Troubleshooting
- [**01_guia_problemas_comunes.md**](spec/05_Troubleshooting/01_guia_problemas_comunes.md) - Solución a problemas frecuentes

### 📋 Planificación (plan/)

#### Seguridad y Auditoría (✅ Implementados v1.12.0-v1.13.0)
- [**01_plan_auditoria.md**](plan/01_Seguridad_Auditoria/01_plan_auditoria.md) - Sistema de auditoría
- [**02_plan_seguridad_auth.md**](plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md) - Seguridad JWT + MBAC
- [**03_plan_mejoras_auditoria.md**](plan/01_Seguridad_Auditoria/03_plan_mejoras_auditoria.md) - Mejoras implementadas

#### Módulos Médicos
- [**01_plan_disponibilidad_turnos.md**](plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md) ✅ - Disponibilidad (v1.9.0)
- [**02_plan_solicitud_turnos.md**](plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md) 📋 - Solicitud de turnos (planificado)

#### Infraestructura
- [**01_plan_modulo_red.md**](plan/03_Infraestructura/01_plan_modulo_red.md) 📋 - Módulo de red (planificado)

#### Integraciones
- [**01_analisis_ollama.md**](plan/04_Integraciones/01_analisis_ollama.md) 🔍 - Ollama AI (en evaluación)

#### Firma Digital
- [**01_plan_implementacion.md**](plan/05_Firma_Digital/01_plan_implementacion.md) ✅ - Firma digital (v1.14.0)

### ✅ Checklists y Logs (checklist/)

#### Historial
- [**01_changelog.md**](checklist/01_Historial/01_changelog.md) ⭐ - Historial v1.0.0 → v1.14.0 (CONSULTAR SIEMPRE)
- [**02_historial_versiones.md**](checklist/01_Historial/02_historial_versiones.md) - Registro de releases

#### Reportes de Pruebas
- [**01_reporte_disponibilidad.md**](checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md) - Pruebas de disponibilidad médica

#### Checklists de Implementación
- [**01_checklist_firma_digital.md**](checklist/03_Checklists/01_checklist_firma_digital.md) - Checklist firma digital (v1.14.0)

#### Análisis y Resúmenes
- [**01_analisis_chatbot_citas.md**](checklist/04_Analisis/01_analisis_chatbot_citas.md) - Análisis del chatbot
- [**02_resumen_mejoras_auditoria.md**](checklist/04_Analisis/02_resumen_mejoras_auditoria.md) - Resumen de mejoras

---

## Seguridad

### Autenticación JWT

- **Token JWT** con expiración de 24 horas
- **Claims:** userId, username, roles, permisos
- **Firma:** HMAC-SHA256 con secret de 256 bits
- **Validación** en cada request mediante `JwtAuthenticationFilter`

### Bloqueo de Cuenta

```
Intento 1: Contraseña incorrecta → failedAttempts = 1
Intento 2: Contraseña incorrecta → failedAttempts = 2
Intento 3: Contraseña incorrecta → failedAttempts = 3 → BLOQUEADO 10 MIN
```

**Auto-desbloqueo:** Después de 10 minutos
**Desbloqueo manual:** Admin puede desbloquear en cualquier momento

### Token Blacklist (Logout Seguro)

Al cerrar sesión, el token se invalida agregándolo a una blacklist:
```
POST /api/auth/logout
Authorization: Bearer {token}
→ Token hasheado (SHA-256) agregado a blacklist
→ Requests posteriores con ese token son rechazados
```

**Limpieza automática:** Cada hora se eliminan tokens expirados

### Sistema MBAC (Module-Based Access Control)

Control de acceso granular por **módulo → página → acción**:

```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) { ... }
```

**Acciones disponibles:** ver, crear, editar, eliminar, exportar, aprobar

### CORS por Ambiente

| Ambiente | Orígenes Permitidos |
|----------|---------------------|
| Desarrollo | `localhost:3000`, `localhost:8080` |
| Producción | `10.0.89.13`, `10.0.89.239` |

> 📖 **Guía completa de seguridad:** Ver [plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md](plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md)

---

## API REST

### 📖 Documentación Interactiva (Swagger/OpenAPI)

**URL:** http://localhost:8080/swagger-ui.html

**Especificación OpenAPI (JSON):** http://localhost:8080/api-docs

Swagger permite:
- ✅ Visualizar todos los endpoints disponibles
- ✅ Probar endpoints directamente desde la interfaz
- ✅ Ver esquemas de request/response
- ✅ Agregar token JWT en el botón "Authorize" para endpoints protegidos
- ✅ Consultar códigos de respuesta HTTP

**Instrucciones:**
1. Abrir http://localhost:8080/swagger-ui.html
2. Ir a `/api/auth/login` y obtener un token JWT
3. Hacer clic en "Authorize" (esquina superior derecha)
4. Pegar el token en el formato: `Bearer {token}`
5. ¡Listo! Puedes probar todos los endpoints protegidos

---

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

| Módulo | Endpoint | Descripción | Rol Requerido |
|--------|----------|-------------|---------------|
| **Auth** | `POST /api/auth/login` | Iniciar sesión | Público |
| **Auth** | `GET /api/auth/me` | Usuario actual | Autenticado |
| **Auth** | `POST /api/auth/logout` | Cerrar sesión | Autenticado |
| **Usuarios** | `GET /api/usuarios` | Listar usuarios | ADMIN |
| **Usuarios** | `POST /api/usuarios/crear` | Crear usuario | ADMIN |
| **Usuarios** | `GET /api/usuarios/pendientes-rol` | Usuarios pendientes | ADMIN |
| **Disponibilidad** | `GET /api/disponibilidad/mis-disponibilidades` | Mis disponibilidades | MEDICO |
| **Disponibilidad** | `POST /api/disponibilidad` | Crear disponibilidad | MEDICO |
| **Firma Digital** | `GET /api/firma-digital/personal/{id}` | Firma del personal | ADMIN |
| **Firma Digital** | `POST /api/firma-digital` | Registrar firma | ADMIN |
| **ChatBot** | `GET /api/chatbot/documento/{dni}` | Consultar paciente | Autenticado |
| **ChatBot** | `POST /api/v1/chatbot/solicitud` | Crear cita | Autenticado |
| **Auditoría** | `GET /api/auditoria/busqueda-avanzada` | Logs del sistema | ADMIN |
| **MBAC** | `GET /api/menu-usuario/usuario/{id}` | Menú dinámico | Autenticado |

> 📖 **Documentación completa de API:** Ver [spec/01_Backend/01_api_endpoints.md](spec/01_Backend/01_api_endpoints.md)

---

## Historial de Versiones

### Últimas Versiones

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| **v1.31.0** | 2026-01-22 | 📦 Módulo de Bolsas CRUD Completo (7 endpoints + UI React + 7 registros iniciales) |
| **v1.14.0** | 2025-12-30 | ✍️ Firma Digital + 📋 Component Registry (sistema de rutas dinámicas) |
| **v1.13.0** | 2025-12-29 | 🔔 Asignación Automática de Roles + Sistema de Notificaciones |
| **v1.12.2** | 2025-12-24 | 🐳 Relay SMTP para Docker en macOS |
| **v1.12.1** | 2025-12-23 | 📧 Migración a servidor SMTP corporativo EsSalud |
| **v1.12.0** | 2025-12-22 | 🔒 Sistema de Seguridad Avanzado (JWT + MBAC + Auditoría) |
| **v1.11.0** | 2025-12-21 | 📨 Reenvío de correo de activación con selección de tipo |
| **v1.10.2** | 2025-12-20 | 🔑 Recuperación de contraseña con selección de correo |
| **v1.10.1** | 2025-12-19 | 📧 Email preferido para notificaciones |
| **v1.10.0** | 2025-12-18 | 🐳 Docker: Documentación producción completa |
| **v1.9.0** | 2025-12-15 | 👨‍⚕️ Módulo de Disponibilidad de Turnos Médicos |

> 📖 **Changelog completo:** Ver [checklist/01_Historial/01_changelog.md](checklist/01_Historial/01_changelog.md)

---

## Estadísticas del Proyecto

| Métrica | Valor |
|---------|-------|
| **Archivos de documentación** | 26+ archivos |
| **Líneas de documentación** | 10,000+ líneas |
| **Scripts SQL** | 16 scripts |
| **Versiones documentadas** | 14 versiones (v1.0-v1.14) |
| **Endpoints API** | 100+ endpoints |
| **Tablas en BD** | 135 tablas (5.4 GB) |
| **Términos en glosario** | 60+ términos |
| **Usuarios registrados** | 127 usuarios activos |
| **Asegurados en BD** | 4.6 millones |
| **IPRESS objetivo** | 414 instituciones |

---

## Contacto

| Rol | Contacto |
|-----|----------|
| **Desarrollador Principal** | Ing. Styp Canto Rondon |
| **Soporte Técnico** | cenate.analista@essalud.gob.pe |
| **Email del Sistema** | cenate.contacto@essalud.gob.pe |

---

## Licencia

Este proyecto es propiedad de **EsSalud Perú - CENATE**.

Todos los derechos reservados © 2025

---

<div align="center">

**Sistema de Telemedicina CENATE**

*Desarrollado por el Ing. Styp Canto Rondon*

*EsSalud Perú - Centro Nacional de Telemedicina*

[Documentación](CLAUDE.md) • [Changelog](checklist/01_Historial/01_changelog.md) • [API](spec/01_Backend/01_api_endpoints.md)

</div>
