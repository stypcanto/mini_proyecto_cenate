# 📚 CENATE Documentation Index v1.34.1

**Última actualización:** 2026-01-26  
**Estado:** Documentación reorganizada ✅

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
- Estados Citas: `backend/07_modulo_estados_gestion_citas_crud.md`

### Para Desarrolladores Frontend
**Comienza en:** `/frontend/README.md`
- Estructura: `frontend/02_pages/01_estructura_minima_paginas.md`
- Permisos: `frontend/01_gestion_usuarios_permisos.md`
- Excel Import: `frontend/02_pages/04_estructura_excel_solicitud_bolsa_v1_6.md`

### Para Diseño UI/UX
**Comienza en:** `/UI-UX/README.md`
- Design System: `UI-UX/01_design_system/01_design_system_tablas.md`

### Para Base de Datos
**Comienza en:** `/database/README.md`
- Modelo Usuarios: `database/01_models/01_modelo_usuarios.md`
- Plan Backups: `database/08_plan_backup_protecciones_completo.md`
- Auditoría: `database/02_audit/02_guia_auditoria.md`

### Para Arquitectura General
**Comienza en:** `/architecture/README.md`
- Visión General: `architecture/004_arquitectura.md`

### Para Troubleshooting
**Comienza en:** `/troubleshooting/README.md`
- Problemas Comunes: `troubleshooting/01_guia_problemas_comunes.md`
- Estados Citas: `troubleshooting/02_guia_estados_gestion_citas.md`

### Scripts y Herramientas
**Comienza en:** `/sh/README.md`
- Scripts SQL: `sh/01_database/`
- Backups: `sh/02_backup/`

---

## 📋 Documentos Principales por Tipo

### 📦 Backend (5 docs principales)
1. `backend/01_api/003_api_endpoints.md` - Endpoints REST v1.34.1
2. `backend/08_modulo_bolsas_pacientes_completo.md` - Módulo bolsas v1.32.1
3. `backend/06_resumen_modulo_bolsas_completo.md` - Resumen módulo
4. `backend/07_modulo_estados_gestion_citas_crud.md` - Estados citas v1.33.0
5. `backend/05_modulo_tipos_bolsas_crud.md` - Tipos bolsas v1.1.0

### 📱 Frontend (4 docs principales)
1. `frontend/02_pages/01_estructura_minima_paginas.md` - Patrón arquitectónico
2. `frontend/01_modulo_personal_externo.md` - Módulo personal externo v1.18.0
3. `frontend/02_configuracion_modulos_ipress.md` - Config por IPRESS v1.20.1
4. `frontend/02_pages/02_estructura_excel_pacientes.md` - Excel estructura

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

**Versión:** 1.34.1  
**Última actualización:** 2026-01-26  
**Responsable:** Sistema CENATE

