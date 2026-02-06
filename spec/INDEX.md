# 📚 CENATE Documentation Index v1.48.8

**Última actualización:** 2026-02-06
**Estado:** Recita + Interconsulta + Tipos de Bolsas Architecture Complete ✅ - PRODUCCIÓN 🚀

---

## 📂 Estructura de Documentación

```
spec/
├── 📦 backend/          → Spring Boot, APIs, Servicios
├── 📱 frontend/         → React, Componentes, Interfaces
├── 🏗️  architecture/     → Diagramas, Flujos, Modelos
├── 🎨 UI-UX/           → Design System, Guidelines
├── 💾 database/         → Esquemas, Auditoría, Backups
├── 🔧 troubleshooting/  → Problemas, Soluciones, Análisis
├── 📊 uml/              → Diagramas UML, Especificaciones
├── ✅ test/             → Test Cases, Reports
└── 🔧 sh/               → Scripts Shell, Deployment
```

---

## 🎯 Navegación Rápida

### Para Desarrolladores Backend
**Comienza en:** `/backend/README.md`
- API Endpoints: `backend/01_api/003_api_endpoints.md`
- Módulo Bolsas: `backend/08_modulo_bolsas_pacientes_completo.md`
- **🔥 NUEVO Storage Schema:** `backend/16_atender_paciente_storage.md` (v1.48.9 ⭐⭐ - Dónde se guardan datos de Atendido/Recita/Interconsulta/Crónico)
- **🔥 NUEVO Recita + Interconsulta:** `backend/15_recita_interconsulta_v1.47.md` (v1.47.2 ⭐⭐ - Atender Paciente completo)
- **🔥 NUEVO Sincronización ATENDIDO:** `backend/14_sincronizacion_atendido/README.md` (v1.43.0-44.0 ⭐⭐)
- **🔥 NUEVO Tipos de Bolsas Architecture:** `backend/tipos_bolsas.md` (v1.48.8 ⭐⭐ - dim_tipos_bolsas vs dim_solicitud_bolsa)
- **NUEVO Gestión de Iconos:** `backend/13_gestion_iconos.md` (v1.37.4)
- Estados Citas: `backend/07_modulo_estados_gestion_citas_crud.md`

### Para Desarrolladores Frontend
**Comienza en:** `/frontend/README.md`
- **🔥 NUEVO Mis Pacientes Médico:** `frontend/15_mis_pacientes_medico.md` (v1.45.1-45.2 ⭐)
  - Tabla de pacientes asignados + 3 acciones médicas
  - IPRESS institution names display (v1.45.2)
- Estructura: `frontend/02_pages/01_estructura_minima_paginas.md`
- Permisos: `frontend/01_gestion_usuarios_permisos.md`
- Excel Import: `frontend/02_pages/04_estructura_excel_solicitud_bolsa_v1_6.md`

### Para Diseño UI/UX
**Comienza en:** `/UI-UX/README.md`
- Design System: `UI-UX/01_design_system/01_design_system_tablas.md`

### Para Base de Datos
**Comienza en:** `/database/README.md`
- **🔥 NUEVO Diagnostic Queries:** `database/diagnostic_queries.sql` (v1.50.1 ⭐⭐⭐ - MANDATORY)
  - 9 secciones de análisis: Size, Audit, Indexes, Historical, BLOBs, Fragmentation, Backups, Performance, Summary
  - Identificar top 5 space consumers
  - Detectar bloated indexes, dead tuples, missing indexes
  - Decision matrix: Cuando ES necesaria segunda BD
- Modelo Usuarios: `database/01_models/01_modelo_usuarios.md`
- Plan Backups: `database/08_plan_backup_protecciones_completo.md`
- Auditoría: `database/02_audit/02_guia_auditoria.md`

### Para Arquitectura General
**Comienza en:** `/architecture/README.md`
- **🔥 NUEVO Database Scaling Review:** `architecture/database_scaling_architecture_review.md` (v1.50.1 ⭐⭐⭐ - CRÍTICO)
  - Análisis arquitectónico completo de propuesta de segunda BD
  - Por qué NO implementar segunda BD (premature optimization)
  - Diagnostic queries + Phase 1-2 optimizations
  - SOLID principles compliance + violations
  - Decision matrix + cost comparison
- **🔥 NUEVO Database Scaling Summary:** `architecture/database_scaling_decision_summary.md` (v1.50.1 ⭐⭐⭐ - Quick Reference)
  - TL;DR: DO NOT implement second database
  - Red flags + What to do instead
  - Cost comparison ($78,400 vs $550)
  - Action items + Decision record
- **🏥 FLUJO COMPLETO DE ATENCIONES:** `architecture/01_flujo_atenciones_completo.md` ⭐ v1.45.2
  - 4 etapas: Bolsas → Coordinador → Gestión Citas → Médico
  - Tabla de vinculaciones entre etapas
  - APIs por etapa
  - KPIs y seguridad
- Visión General: `architecture/004_arquitectura.md`

### Para Troubleshooting
**Comienza en:** `/troubleshooting/README.md`
- Problemas Comunes: `troubleshooting/01_guia_problemas_comunes.md`
- Estados Citas: `troubleshooting/02_guia_estados_gestion_citas.md`

### Para QA/Testing
**Comienza en:** `/test/README.md`
- **NUEVO Phase 7 Integration Testing:** `test/02_dengue_integration_testing_phase7.md` (v1.37.4 ⭐)
- **NUEVO Smoke Tests Report:** `test/03_dengue_smoke_tests_report.md` (v1.37.4 ⭐)
- **NUEVO UAT Checklist:** `test/04_dengue_uat_checklist_v1.37.4.md` (v1.37.4 ⭐)
- **NUEVO Phase 7 Completion:** `test/05_phase7_completion_report.md` (v1.37.4 ⭐)
- Playwright Tests: `frontend/tests/dengue-module.spec.ts`

### Scripts y Herramientas
**Comienza en:** `/sh/README.md`
- Scripts SQL: `sh/01_database/`
- Backups: `sh/02_backup/`

---

## 📋 Documentos Principales por Tipo

### 📦 Backend (10 docs principales)
1. **`backend/16_atender_paciente_storage.md` - Storage Schema Atender Paciente v1.48.9 ⭐ NUEVO**
   - Schema exacto: Dónde se guardan datos de Atendido, Recita, Interconsulta, Crónico
   - 4 Tablas involucradas: dim_solicitud_bolsa, solicitud_cita, receta, interconsulta, asegurado_enfermedad_cronica
   - DTO AtenderPacienteRequest + Validaciones condicionales
   - Ejemplos SQL + Relaciones FK + Diagrama de flujo
2. **`backend/15_recita_interconsulta_v1.47.md` - Recita + Interconsulta + Crónico v1.47.2 ⭐ NUEVO**
   - Flujo completo: Médico → Backend → Coordinador
   - Crear Recita automáticamente (seguimiento en días)
   - Crear Interconsulta automáticamente (referencia especialista)
   - Validaciones y duplicados
3. **`backend/tipos_bolsas.md` - Arquitectura Tipos de Bolsas v1.48.8 ⭐ NUEVO**
   - dim_tipos_bolsas (catálogo) vs dim_solicitud_bolsa (operacional)
   - Flujo de datos: import → backend → frontend
   - Tabla de equivalencia códigos ↔ descripciones
   - Troubleshooting y FAQ
4. `backend/01_api/003_api_endpoints.md` - Endpoints REST v1.34.1
5. `backend/08_modulo_bolsas_pacientes_completo.md` - Módulo bolsas v1.32.1
6. `backend/07_modulo_estados_gestion_citas_crud.md` - Estados citas v1.33.0
7. **`backend/11_modulo_tipos_bolsas_completo.md` - Tipos bolsas v1.37.0 ⭐ ANTERIOR**
8. **`backend/13_gestion_iconos.md` - Gestión de iconos v1.37.4 ⭐**
9. `backend/06_resumen_modulo_bolsas_completo.md` - Resumen módulo
10. `backend/05_modulo_tipos_bolsas_crud.md` - Tipos bolsas v1.1.0 (anterior)

### 📱 Frontend (5 docs principales)
1. **`frontend/15_mis_pacientes_medico.md` - Mis Pacientes Médico v1.45.2 ⭐ NUEVO**
   - Tabla pacientes asignados + 3 acciones médicas
   - IPRESS institution names (v1.45.2)
2. `frontend/02_pages/01_estructura_minima_paginas.md` - Patrón arquitectónico
3. `frontend/01_modulo_personal_externo.md` - Módulo personal externo v1.18.0
4. `frontend/02_configuracion_modulos_ipress.md` - Config por IPRESS v1.20.1
5. `frontend/02_pages/02_estructura_excel_pacientes.md` - Excel estructura

### 💾 Database (6 docs principales)
1. `database/08_plan_backup_protecciones_completo.md` - Plan completo backups
2. `database/09_validacion_backups_2026_01_25.md` - Validación backups
3. `database/01_models/01_modelo_usuarios.md` - Modelo usuarios
4. `database/02_audit/02_guia_auditoria.md` - Guía auditoría
5. `database/07_horarios/01_modelo_horarios_existente.md` - Horarios
6. `database/08_tabla_areas/00_indice_tabla_areas.md` - Tabla áreas

### 🔧 Troubleshooting (4 docs principales)
1. `troubleshooting/01_guia_problemas_comunes.md` - Problemas comunes
2. `troubleshooting/02_guia_estados_gestion_citas.md` - Errores estados citas
3. `troubleshooting/03_solucion_importacion_excel_bolsas.md` - Excel import
4. `troubleshooting/02_coherencia_datos_personal.md` - Coherencia datos

### 📊 UML (1 documento maestro)
1. `uml/UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` - Diagrama completo v1.6.0

### ✅ Testing & QA (5 docs - Phase 7 v1.37.4)
1. **`test/02_dengue_integration_testing_phase7.md` - Integration Testing Plan ⭐ NUEVO**
2. **`test/03_dengue_smoke_tests_report.md` - Smoke Tests Report (4/4 PASS) ⭐ NUEVO**
3. **`test/04_dengue_uat_checklist_v1.37.4.md` - UAT Checklist (52/52 PASS) ⭐ NUEVO**
4. **`test/05_phase7_completion_report.md` - Phase 7 Completion Report ⭐ NUEVO**
5. `frontend/tests/dengue-module.spec.ts` - Playwright Test Suite (40+ tests)

---

## 🚀 Primeros Pasos

### 1. Lee la Visión General
```
→ /architecture/004_arquitectura.md
```

### 2. Entiende el Stack
- Backend: `/backend/README.md`
- Frontend: `/frontend/README.md`
- Database: `/database/README.md`

### 3. Consulta Módulos Específicos
**Solicitudes de Bolsa:**
- UML: `/uml/UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md`
- Backend: `/backend/08_modulo_bolsas_pacientes_completo.md`
- Frontend: `/frontend/02_pages/04_estructura_excel_solicitud_bolsa_v1_6.md`

**Tele-ECG:**
- Backend: `/backend/09_teleecg_v3.0.0_guia_rapida.md`

---

## 🔐 Stack Tecnológico

**Backend:** Spring Boot 3.5.6 + Java 17 + JPA  
**Frontend:** React 19 + TailwindCSS 3.4.18  
**Database:** PostgreSQL 14+  
**Seguridad:** JWT + MBAC  

---

## 📞 Referencias Rápidas

| Tema | Archivo |
|------|---------|
| Endpoints API | `backend/01_api/003_api_endpoints.md` |
| Modelo DB | `database/01_models/01_modelo_usuarios.md` |
| Auditoría | `database/02_audit/02_guia_auditoria.md` |
| Backups | `database/08_plan_backup_protecciones_completo.md` |
| Permisos | `frontend/01_gestion_usuarios_permisos.md` |
| Troubleshooting | `troubleshooting/01_guia_problemas_comunes.md` |

---

## ✅ Checklist Documentación

- [x] Backend documentado
- [x] Frontend documentado
- [x] Database documentado
- [x] Arquitectura documentada
- [x] Troubleshooting documentado
- [x] UML diagramas
- [x] README en cada carpeta
- [x] Índice maestro
- [x] Estructura limpia y ordenada

---

**Versión:** 1.48.8
**Última actualización:** 2026-02-06
**Status:** ✅ READY FOR PRODUCTION - Tipos de Bolsas Architecture Documented
**Responsable:** Sistema CENATE

