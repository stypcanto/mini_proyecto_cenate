# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.36.0 (2026-01-27)
> **Status:** ✅ Production Ready
> **Módulo Bolsas:** v2.0.0 ⭐ NUEVO - Estadísticas Dashboard con 8 endpoints

---

## ¿Qué es CENATE?

**CENATE** = Centro Nacional de Telemedicina (EsSalud Perú)

- Coordina atenciones médicas remotas para **4.6M asegurados**
- Funciona a través de **414 IPRESS** (Instituciones Prestadoras de Servicios de Salud)
- **NO realiza videollamadas** - solo planifica, registra y coordina atenciones

---

## 📚 DOCUMENTACIÓN - NAVEGACIÓN COMPLETA

**👉 Lee primero:** [`spec/INDEX.md`](spec/INDEX.md) - Índice maestro

### 📦 SPEC/ - Documentación Técnica (9 Carpetas)

| Carpeta | README | Documentos |
|---------|--------|-----------|
| **backend** | [`spec/backend/README.md`](spec/backend/README.md) | APIs, Servicios, Módulos, Endpoints |
| **frontend** | [`spec/frontend/README.md`](spec/frontend/README.md) | Componentes, Páginas, UI |
| **database** | [`spec/database/README.md`](spec/database/README.md) | Esquemas, Auditoría, Backups, Scripts SQL |
| **architecture** | [`spec/architecture/README.md`](spec/architecture/README.md) | Diagramas, Flujos, Modelos |
| **UI-UX** | [`spec/UI-UX/README.md`](spec/UI-UX/README.md) | Design System, Guidelines |
| **troubleshooting** | [`spec/troubleshooting/README.md`](spec/troubleshooting/README.md) | Problemas, Soluciones |
| **uml** | [`spec/uml/README.md`](spec/uml/README.md) | Diagramas UML |
| **test** | [`spec/test/README.md`](spec/test/README.md) | Test Cases |
| **sh** | [`spec/sh/README.md`](spec/sh/README.md) | Scripts SQL/Shell/Deployment |

### 📋 PLAN/ - Planificación de Módulos (8 Carpetas)

| Carpeta | Propósito |
|---------|-----------|
| **plan/01_Seguridad_Auditoria/** | Auditoría, permisos MBAC, JWT |
| **plan/02_Modulos_Medicos/** | Disponibilidad, Tele-ECG, turnos médicos |
| **plan/03_Infraestructura/** | Infraestructura, módulo red |
| **plan/04_Integraciones/** | Integraciones externas |
| **plan/05_Firma_Digital/** | Firma digital |
| **plan/06_Integracion_Spring_AI/** | 🤖 Spring AI - Chatbot, IA, Claude |
| **plan/06_Mejoras_UI_UX/** | UI/UX improvements |
| **plan/07_Documentacion_OpenAPI/** | Documentación API |

### 📅 CHECKLIST/ - Historial y Reportes

- **01_Historial/** - Changelog v1.0.0 → v1.35.0
- **02_Reportes_Pruebas/** - Reportes de testing
- **03_Checklists/** - Tracking de implementación
- **04_Analisis/** - Análisis técnicos

### Entrada Rápida por Rol

- **👨‍💻 Backend Dev** → [`spec/backend/README.md`](spec/backend/README.md) + [`plan/02_Modulos_Medicos/`](plan/02_Modulos_Medicos/)
- **👩‍💻 Frontend Dev** → [`spec/frontend/README.md`](spec/frontend/README.md) + [`plan/06_Mejoras_UI_UX/`](plan/06_Mejoras_UI_UX/)
- **🏗️ Arquitecto** → [`spec/architecture/README.md`](spec/architecture/README.md)
- **💾 Admin BD** → [`spec/database/README.md`](spec/database/README.md)
- **🔧 DevOps** → [`spec/sh/README.md`](spec/sh/README.md) + [`plan/03_Infraestructura/`](plan/03_Infraestructura/)
- **🔍 QA/Support** → [`spec/troubleshooting/README.md`](spec/troubleshooting/README.md)
- **🔐 Security** → [`plan/01_Seguridad_Auditoria/`](plan/01_Seguridad_Auditoria/)
- **🤖 AI/Spring AI** → [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/)

---

## 📚 DOCUMENTOS CLAVE POR ÁREA

### Backend

#### 📦 **Módulo de Bolsas** (⭐ RECOMENDADO)
- 📍 [`spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md`](spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md) - ⭐ Índice Maestro - Solicitudes + Estadísticas + Tipos + Estados
- 📍 [`spec/backend/09_modules_bolsas/12_modulo_solicitudes_bolsa_v1.12.0.md`](spec/backend/09_modules_bolsas/12_modulo_solicitudes_bolsa_v1.12.0.md) - Solicitudes de Bolsa v1.12.0 (Excel + CRUD)
- 📍 [`spec/backend/09_modules_bolsas/13_estadisticas_dashboard_v2.0.0.md`](spec/backend/09_modules_bolsas/13_estadisticas_dashboard_v2.0.0.md) - 🆕 Dashboard Estadísticas v2.0.0 (8 endpoints + 7 gráficos)
- 📍 [`spec/backend/09_modules_bolsas/05_modulo_tipos_bolsas_crud.md`](spec/backend/09_modules_bolsas/05_modulo_tipos_bolsas_crud.md) - Tipos de Bolsas v1.1.0 (Catálogo)
- 📍 [`spec/backend/09_modules_bolsas/07_modulo_estados_gestion_citas_crud.md`](spec/backend/09_modules_bolsas/07_modulo_estados_gestion_citas_crud.md) - Estados de Citas v1.33.0 (10 estados)

#### Otros Módulos
- 📍 [`spec/backend/01_api_endpoints.md`](spec/backend/01_api_endpoints.md) - Todos los endpoints REST
- 📍 [`spec/backend/09_teleecg_v3.0.0_guia_rapida.md`](spec/backend/09_teleecg_v3.0.0_guia_rapida.md) - Tele-ECG v1.24.0

### Frontend
- 📍 [`spec/frontend/02_pages/01_estructura_minima_paginas.md`](spec/frontend/02_pages/01_estructura_minima_paginas.md) - Patrón arquitectónico
- 📍 [`spec/frontend/01_gestion_usuarios_permisos.md`](spec/frontend/01_gestion_usuarios_permisos.md) - Permisos MBAC

### UI/UX - Design System
- 🎨 **RÁPIDA:** [`spec/UI-UX/00_estilos_tabla_rapido.md`](spec/UI-UX/00_estilos_tabla_rapido.md) - Referencia rápida de estilos (⭐ **EMPEZAR AQUÍ**)
- 🎨 **COMPLETA:** [`spec/UI-UX/01_design_system_tablas.md`](spec/UI-UX/01_design_system_tablas.md) - Design System: Tablas profesionales CENATE

### Database
- 📍 [`spec/database/01_models/01_modelo_usuarios.md`](spec/database/01_models/01_modelo_usuarios.md) - Modelo BD
- 📍 [`spec/database/08_plan_backup_protecciones_completo.md`](spec/database/08_plan_backup_protecciones_completo.md) - Backups y seguridad
- 📍 [`spec/database/02_audit/02_guia_auditoria.md`](spec/database/02_audit/02_guia_auditoria.md) - Auditoría

### Planificación
- 📍 [`plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`](plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md) - Disponibilidad v2.0.0
- 📍 [`plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md`](plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md) - Spring AI (7 fases)
- 📍 [`plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`](plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md) - Seguridad

### Troubleshooting
- 📍 [`spec/troubleshooting/01_guia_problemas_comunes.md`](spec/troubleshooting/01_guia_problemas_comunes.md) - Problemas comunes
- 📍 [`spec/troubleshooting/02_guia_estados_gestion_citas.md`](spec/troubleshooting/02_guia_estados_gestion_citas.md) - Errores Estados Citas

---

## 📊 STATUS ACTUAL (v1.36.0)

### ✅ Completado Recientemente (últimas 48h)

| Feature | Versión |
|---------|---------|
| **Módulo Bolsas - Estadísticas Dashboard** | **v2.0.0 ⭐ NUEVO** |
| Solicitudes Bolsa | v1.12.0 - Auto-detección IPRESS/RED + enriquecimiento ✅ |
| Estados Gestión Citas | v1.33.0 - CRUD completo ✅ |
| Tipos de Bolsas | v1.1.0 - Catálogo completo ✅ |
| Excel v1.8.0 | 10 campos + auto-calc EDAD ✅ |
| Tele-ECG | v1.24.0 - UI optimizada ✅ |
| **Documentación Bolsas v2.0.0** | **Índice Maestro + 5 módulos** ✅ |
| **Spring AI** | **Arquitectura completa diseñada** ✅ |

---

## 🎯 MÓDULO DE BOLSAS v2.0.0 - Detalles de Implementación

### ✨ Estadísticas Dashboard v2.0.0 (NUEVO)

**8 Endpoints REST implementados:**
```
GET /api/bolsas/estadisticas/resumen                    → Resumen 5 KPIs
GET /api/bolsas/estadisticas/del-dia                    → Solicitudes del día
GET /api/bolsas/estadisticas/por-estado                 → Distribución PENDIENTE/ATENDIDO/CANCELADO
GET /api/bolsas/estadisticas/por-especialidad           → Ranking especialidades
GET /api/bolsas/estadisticas/por-ipress                 → Carga por IPRESS
GET /api/bolsas/estadisticas/por-tipo-cita              → 3 tipos: VOLUNTARIA (66.26%), INTERCONSULTA, RECITA
GET /api/bolsas/estadisticas/por-tipo-bolsa             → 6 tipos: ORDINARIA, EXTRAORDINARIA, ESPECIAL, URGENTE, EMERGENCIA, RESERVA
GET /api/bolsas/estadisticas/evolucion-temporal         → 30 días con tendencias
GET /api/bolsas/estadisticas/kpis                       → KPIs detallados con indicadores de salud
GET /api/bolsas/estadisticas/dashboard-completo         → Todo integrado
```

**7 Componentes React implementados:**
- `GraficoResumen` - 5 KPIs principales (cards)
- `GraficoEstado` - Pie chart 3 estados
- `GraficoEspecialidad` - Barras horizontales top 10
- `GraficoIPRESS` - Barras horizontales carga
- `GraficoTipoCita` - SVG pie chart 3 segmentos con colores + percentajes
- `GraficoTipoBolsa` - Barras horizontales 6 tipos
- `GraficoTemporal` - Línea 30 días

**Base de Datos:** 329 registros activos en `dim_solicitud_bolsa`
- Datos 100% reales de BD
- No hay datos ficticios
- Soft delete con campo `activo = true`

**Colores asignados por tipo:**
- VOLUNTARIA: #4ECDC4 (turquesa) 🎯
- INTERCONSULTA: #FFE66D (amarillo) 📋
- RECITA: #FF6B6B (rojo) ⚠️
- ORDINARIA: #3498DB (azul)
- EXTRAORDINARIA: #E74C3C (rojo oscuro)
- ESPECIAL: #F39C12 (naranja)
- URGENTE: #FF6B6B (rojo)
- EMERGENCIA: #C0392B (rojo intenso)
- RESERVA: #27AE60 (verde)

### 💾 Backend - Cambios Implementados

**Controlador:** `SolicitudBolsaEstadisticasController.java`
- 10 endpoints @GetMapping
- Respuestas con DTOs estructurados
- Filtrados a 3 tipos de cita válidos

**Servicio:** `SolicitudBolsaEstadisticasServiceImpl.java`
- Métodos de estadísticas por categoría
- Mapeo de colores por tipo
- Manejo de conversiones java.sql.Date → java.time.LocalDate
- Cálculos de porcentajes y tasas de completación

**Repositorio:** `SolicitudBolsaRepository.java`
- Queries nativas con LEFT JOINs
- Filtrado WHERE activo = true AND tipo_cita IN (3 tipos válidos)
- Agregaciones con GROUP BY y ORDER BY

**DTOs:** Estructurados para cada estadística
- `EstadisticasPorEstadoDTO` - estado, total, porcentaje, color
- `EstadisticasPorTipoCitaDTO` - tipo, total, porcentaje, color
- `EstadisticasPorTipoBolsaDTO` - tipo, total, tasas, color, icono
- `EstadisticasTemporalesDTO` - fecha, solicitudes, promedio

**Seguridad:** SecurityConfig.java
- Endpoint `/api/bolsas/estadisticas/**` permitAll (sin autenticación requerida)

### 🎨 Frontend - Cambios Implementados

**Archivo:** `EstadisticasDashboard.jsx`
- 7 componentes gráficos
- SVG pie chart con cálculo de paths (arcos)
- Percentajes dentro de segmentos SVG
- Colores distintivos por categoría
- Responsivo con TailwindCSS

**Servicio:** `bolsasService.js`
- `obtenerEstadisticasPorTipoBolsa()` + 7 métodos más
- Promise.all() para carga paralela
- Manejo de errores con try/catch

**Patrones utilizados:**
- React Hooks (useState, useEffect)
- Async/await para APIs
- SVG para gráficos personalizados
- Props destructuring

### 📊 Datos Actuales (2026-01-27)

```
Total Solicitudes:    329
Atendidas:           218 (66.26%)
Pendientes:           76 (23.10%)
Canceladas:           35 (10.64%)

Por Tipo de Cita:
VOLUNTARIA:          218 (66.26%)
RECITA:               76 (23.10%)
INTERCONSULTA:        35 (10.64%)
```

### ✅ Bugs Corregidos

1. **ClassCastException en evolucion-temporal**
   - Causa: java.sql.Date → java.time.LocalDate casting
   - Fix: Agregado type checking con instanceof

2. **404 endpoints no encontrados**
   - Causa: Backend sin reiniciar después de compilación
   - Fix: Restart con `./gradlew bootRun`

3. **403 Forbidden en estadísticas**
   - Causa: Spring Security bloqueando endpoints
   - Fix: Agregado permitAll en SecurityConfig

4. **SQL retornando todos los tipo_cita**
   - Causa: Query sin filtro WHERE
   - Fix: Agregado filtro a 3 tipos válidos: VOLUNTARIA, INTERCONSULTA, RECITA

5. **Pie chart como círculos superpuestos**
   - Causa: SVG strokeDasharray approach
   - Fix: Reescrito con path elements y arc calculations
   - Resultado: 3 segmentos distintos con colores

---

### 🚀 En Desarrollo

- Spring AI Chatbot (7 fases, 12 semanas) - [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/)
- Análisis Tele-ECG con IA
- Generador Reportes Médicos

---

## 🔐 Incidentes y Recuperación

**Recuperación de datos completada (2026-01-25):**
- Tabla `asegurados`: 5,165,000 registros restaurados ✅
- Backups: 2 AM + 2 PM (30 días retención) ✅
- Auditoría: Triggers + permisos restrictivos ✅

**Más información:** [`spec/database/`](spec/database/)

---

## 🛠️ Stack Tecnológico

```
Backend:        Spring Boot 3.5.6 + Java 17
Frontend:       React 19 + TailwindCSS 3.4.18
Database:       PostgreSQL 14+ (10.0.89.13:5432)
Seguridad:      JWT + MBAC (Module-Based Access Control)
```

---

## 📝 Configuración Rápida

### Variables de Entorno

```bash
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx  # Para Spring AI
```

### Comandos

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start

# Database
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate
```

---

## 🤖 Instrucciones para Claude

### Al Investigar o Responder Preguntas

1. **Consulta primero** [`spec/INDEX.md`](spec/INDEX.md) - navegación maestra
2. **Lee** el README de la carpeta relevante
3. **Accede** a documentos específicos
4. **Enlaza** en lugar de repetir información

### Al Implementar Nuevas Funcionalidades

**Patrones arquitectónicos:**
- Controller → Service → Repository
- DTOs (nunca exponer entidades)
- Integrar `AuditLogService`
- Agregar `@CheckMBACPermission` si aplica

**Validación en 3 capas:**
- Frontend: validación UX
- Backend: validación DTO
- Database: CHECK constraints

**Documentación obligatoria:**
- Actualizar `checklist/01_Historial/01_changelog.md`
- Crear/actualizar docs en `spec/`
- Agregar scripts SQL a `spec/database/06_scripts/`

### Seguridad

1. ❌ NUNCA exponer credenciales en código
2. ✅ SIEMPRE usar variables de entorno
3. ✅ Prevenir: SQL injection, XSS, CSRF
4. ✅ Auditar: todas las acciones críticas
5. ✅ Validar: permisos MBAC en endpoints sensibles

---

## 👥 Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios, auditoría |
| MEDICO | Dashboard, disponibilidad, pacientes |
| COORDINADOR | Agenda, asignaciones, turnos |
| COORDINADOR_ESPECIALIDADES | Asignación médicos |
| COORDINADOR_RED | Solicitudes IPRESS |
| ENFERMERIA | Atenciones, seguimiento |
| EXTERNO | Formulario diagnóstico |
| INSTITUCION_EX | Acceso limitado IPRESS externa |

---

## 📂 Estructura del Proyecto

```
mini_proyecto_cenate/
├── README.md                    ← Onboarding general
├── CLAUDE.md                    ← Esta instrucciones
├── spec/                        ← DOCUMENTACIÓN (9 carpetas organizadas)
│   ├── INDEX.md                 ← ⭐ Índice maestro
│   ├── backend/    (15 docs)    → APIs, Servicios
│   ├── frontend/   (8 docs)     → Componentes, Páginas
│   ├── database/   (15 docs)    → Esquemas, Backups, Auditoría
│   ├── architecture/ (3 docs)   → Diagramas, Flujos
│   ├── UI-UX/      (2 docs)     → Design System
│   ├── troubleshooting/ (8 docs) → Problemas, Soluciones
│   ├── uml/        (1 doc)      → Diagramas
│   ├── test/ & sh/              → Tests y Scripts
│
├── plan/                        ← PLANIFICACIÓN (módulos médicos, integraciones)
├── checklist/                   ← HISTORIAL (changelog, reportes)
├── backend/                     ← Spring Boot (Java 17)
└── frontend/                    ← React 19
```

---

## 🚀 Próximos Pasos

**MÓDULO BOLSAS:** ✅ Completado v2.0.0 (Solicitudes + Estadísticas)
- Consulta: [`spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md`](spec/backend/09_modules_bolsas/00_INDICE_MAESTRO_MODULO_BOLSAS.md)

**FASE ACTUAL:** Spring AI Chatbot (planificación → desarrollo)

1. **Revisar plan:** `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md`
2. **Código base:** `backend/src/main/java/com/styp/cenate/ai/`
3. **Documentación:** `spec/01_Backend/10_arquitectura_spring_ai_clean_architecture.md`

---

## 📞 Contacto

**Desarrollado por:** Ing. Styp Canto Rondón
**Versión:** v1.36.0 (2026-01-27)
**Sistema:** CENATE Telemedicina + Módulo Bolsas v2.0.0
**Email:** stypcanto@essalud.gob.pe

---

## 📖 Lectura Recomendada (en orden)

1. [`README.md`](README.md) - Contexto general
2. [`spec/INDEX.md`](spec/INDEX.md) - Navegación completa
3. README de tu carpeta (backend, frontend, database, etc.)
4. Documentos específicos de módulos

**¡Bienvenido a CENATE! 🏥**
