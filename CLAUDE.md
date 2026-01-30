# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.37.5 (2026-01-30) 🚀
> **Status:** ✅ Production Ready

---

## 🎯 ¿Qué es CENATE?

**CENATE** = Centro Nacional de Telemedicina (EsSalud Perú)
- Coordina atenciones médicas remotas para **4.6M asegurados**
- **414 IPRESS** (Instituciones Prestadoras)
- NO realiza videollamadas - solo planifica, registra y coordina

---

## 📚 DOCUMENTACIÓN - START HERE

**👉 Índice Maestro:** [`spec/INDEX.md`](spec/INDEX.md)

### Por Rol (Acceso Rápido)

| Rol | Documentación |
|-----|---------------|
| **👨‍💻 Backend Dev** | [`spec/backend/README.md`](spec/backend/README.md) |
| **👩‍💻 Frontend Dev** | [`spec/frontend/README.md`](spec/frontend/README.md) |
| **🏗️ Arquitecto** | [`spec/architecture/README.md`](spec/architecture/README.md) |
| **💾 Admin BD** | [`spec/database/README.md`](spec/database/README.md) |
| **🚀 DevOps/Performance** | [`spec/backend/10_performance_monitoring/README.md`](spec/backend/10_performance_monitoring/README.md) |
| **🔍 QA/Support** | [`spec/troubleshooting/README.md`](spec/troubleshooting/README.md) |
| **🔐 Security** | [`plan/01_Seguridad_Auditoria/`](plan/01_Seguridad_Auditoria/) |
| **🤖 AI/Spring AI** | [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/) |

### Carpetas de Documentación

| Carpeta | Propósito |
|---------|-----------|
| **spec/backend/** | APIs, Servicios, Módulos (10 docs) |
| **spec/frontend/** | Componentes, Páginas, UI (8 docs) |
| **spec/database/** | Esquemas, Auditoría, Backups (15 docs) |
| **spec/architecture/** | Diagramas, Flujos, Modelos |
| **spec/UI-UX/** | Design System, Guidelines |
| **spec/troubleshooting/** | Problemas, Soluciones (8 docs) |
| **spec/uml/** | Diagramas UML |
| **plan/** | Planificación (8 carpetas) |
| **checklist/** | Historial, Reportes, Análisis |

---

## 📊 ÚLTIMAS VERSIONES

### v1.37.5 - Completado (2026-01-30) 🔐
✅ **Fix Autorización Coordinador** - Mismatch rol COORD. GESTION CITAS en @PreAuthorize
✅ **Historial de Bolsas** - Coordinador ahora accede sin Access Denied
✅ **Documentación** - FIXAUTORIZACION_COORDINADOR.md (análisis completo)

**Docs:** [`checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md`](checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md)

### v1.38.0 - Completado (2026-01-29)
✅ **Módulo Bolsas** v3.0.0 - Módulo 107 completamente integrado + Postman collection
✅ **Módulo 107** v3.0.0 - Búsqueda + Estadísticas + MBAC + DTOs
✅ **Documentación** v3.0.0 - Unificada en 1 documento maestro (antigua eliminada)

**Docs:** [`spec/backend/09_modules_bolsas/`](spec/backend/09_modules_bolsas/) | [`spec/coleccion-postman/`](spec/coleccion-postman/) | [`spec/backend/10_performance_monitoring/`](spec/backend/10_performance_monitoring/)

---

## 🛠️ Stack Tecnológico

```
Backend:        Spring Boot 3.5.6 + Java 17
Frontend:       React 19 + TailwindCSS 3.4.18
Database:       PostgreSQL 14+ (10.0.89.13:5432)
Seguridad:      JWT + MBAC (Role-Based Access Control)
```

---

## 📝 Configuración Rápida

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start

# Database
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate
```

**Env Vars:** `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, `ANTHROPIC_API_KEY`

---

## 🤖 Instrucciones para Claude

### Investigar o Responder
1. Consulta [`spec/INDEX.md`](spec/INDEX.md) - navegación maestra
2. Lee el README de la carpeta relevante
3. Accede a docs específicos
4. Enlaza en lugar de repetir

### Implementar Nuevas Funcionalidades

**Arquitectura:**
- Controller → Service → Repository pattern
- DTOs (nunca exponer entidades)
- Integrar `AuditLogService`
- Agregar `@CheckMBACPermission` si aplica

**Seguridad:**
- ❌ NUNCA credenciales en código
- ✅ Variables de entorno
- Prevenir: SQL injection, XSS, CSRF
- Auditar acciones críticas
- Validar permisos MBAC

**Documentación:**
- Actualizar `checklist/01_Historial/01_changelog.md`
- Crear/actualizar docs en `spec/`
- Agregar scripts SQL a `spec/database/06_scripts/`

---

## 👥 Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel, usuarios, auditoría |
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
├── CLAUDE.md                    ← Esta instrucciones (índices)
├── spec/                        ← DOCUMENTACIÓN COMPLETA
│   ├── INDEX.md                 ← ⭐ Índice maestro
│   ├── backend/                 → APIs, Servicios, Módulos
│   ├── frontend/                → Componentes, Páginas
│   ├── database/                → Esquemas, Backups, Auditoría
│   ├── architecture/            → Diagramas, Flujos
│   ├── UI-UX/                   → Design System
│   ├── troubleshooting/         → Problemas, Soluciones
│   ├── uml/                     → Diagramas UML
│   ├── test/ & sh/              → Tests y Scripts
│
├── plan/                        ← PLANIFICACIÓN (módulos, integraciones)
├── checklist/                   ← HISTORIAL (changelog, reportes)
├── backend/                     ← Spring Boot (Java 17)
└── frontend/                    ← React 19
```

---

## 🚀 Próximos Pasos

1. **Módulo Bolsas** - ✅ Completado v3.0.0 (Módulo 107 integrado)
2. **Performance Monitoring** - ✅ Completado v1.37.3
3. **Spring AI Chatbot** - En planificación (7 fases)
4. **Dengue Module** - Mantenimiento y mejoras

Ver: [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/)

---

## 📞 Contacto

**Desarrollado por:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Versión:** v1.38.0 (2026-01-29)

---

**¡Bienvenido a CENATE! 🏥**
