# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.35.0 (2026-01-26)
> **Status:** ✅ Production Ready

---

## ¿Qué es CENATE?

**CENATE** = Centro Nacional de Telemedicina (EsSalud Perú)

- Coordina atenciones médicas remotas para **4.6M asegurados**
- Funciona a través de **414 IPRESS** (Instituciones Prestadoras de Servicios de Salud)
- **NO realiza videollamadas** - solo planifica, registra y coordina atenciones

---

## 📚 DOCUMENTACIÓN - COMIENZA AQUÍ

**👉 Lee primero:** [`spec/INDEX.md`](spec/INDEX.md) - Índice maestro con navegación completa

### Estructura de Documentación (9 Carpetas)

| Carpeta | Contenido | README |
|---------|----------|--------|
| **backend** | APIs, Servicios, Módulos | `spec/backend/README.md` |
| **frontend** | Componentes, Páginas | `spec/frontend/README.md` |
| **architecture** | Diagramas, Flujos | `spec/architecture/README.md` |
| **UI-UX** | Design System | `spec/UI-UX/README.md` |
| **database** | Esquemas, Auditoría, Backups | `spec/database/README.md` |
| **troubleshooting** | Problemas, Soluciones | `spec/troubleshooting/README.md` |
| **uml** | Diagramas UML | `spec/uml/README.md` |
| **test** | Test Cases | `spec/test/README.md` |
| **sh** | Scripts SQL/Shell | `spec/sh/README.md` |

### Entrada Rápida por Rol

- **👨‍💻 Backend Dev** → `spec/backend/README.md`
- **👩‍💻 Frontend Dev** → `spec/frontend/README.md`
- **🏗️ Arquitecto** → `spec/architecture/README.md`
- **💾 Admin BD** → `spec/database/README.md`
- **🔧 DevOps** → `spec/sh/README.md`
- **🔍 QA/Support** → `spec/troubleshooting/README.md`

---

## 📊 STATUS ACTUAL (v1.35.0)

### ✅ Completado Recientemente

| Feature | Versión | Link |
|---------|---------|------|
| **Excel v1.8.0** | 10 campos + auto-calc edad | `spec/backend/` |
| **Solicitudes Bolsa** | v1.6.0 - Estados integrados | `spec/backend/08_modulo_bolsas_pacientes_completo.md` |
| **Estados Gestión Citas** | v1.33.0 - CRUD completo | `spec/backend/07_modulo_estados_gestion_citas_crud.md` |
| **Tele-ECG** | v1.24.0 - UI optimizada | `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md` |
| **Filtros Usuarios** | v1.0.0 - Backend-driven | línea 231-303 anterior |
| **Documentación** | Reorganizada en 9 carpetas | `spec/INDEX.md` |
| **Limpieza Proyecto** | 233 archivos temp eliminados | `.gitignore` actualizado |
| **Spring AI** | Arquitectura completa diseñada | `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md` |

### 📋 Módulos en Desarrollo

- **Spring AI Chatbot** (7 fases, 12 semanas)
- **Análisis Tele-ECG con IA**
- **Generador Reportes Médicos**

**Más detalles:** [`spec/INDEX.md`](spec/INDEX.md)

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

**FASE ACTUAL:** Spring AI Chatbot (planificación → desarrollo)

1. **Revisar plan:** `plan/06_Integracion_Spring_AI/01_plan_implementacion_spring_ai.md`
2. **Código base:** `backend/src/main/java/com/styp/cenate/ai/`
3. **Documentación:** `spec/01_Backend/10_arquitectura_spring_ai_clean_architecture.md`

---

## 📞 Contacto

**Desarrollado por:** Ing. Styp Canto Rondón
**Versión:** v1.35.0 (2026-01-26)
**Email:** stypcanto@essalud.gob.pe

---

## 📖 Lectura Recomendada (en orden)

1. [`README.md`](README.md) - Contexto general
2. [`spec/INDEX.md`](spec/INDEX.md) - Navegación completa
3. README de tu carpeta (backend, frontend, database, etc.)
4. Documentos específicos de módulos

**¡Bienvenido a CENATE! 🏥**
