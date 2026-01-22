# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.24.0** (2026-01-22) - Módulo Tele-ECG Optimización UI v3.2.0 ✅

---

## ¿Qué es CENATE?

**CENATE es el Centro Nacional de Telemedicina** del Seguro Social de Salud (EsSalud) en Perú. Coordina atenciones médicas remotas para 4.6M asegurados a través de 414 IPRESS a nivel nacional.

**IMPORTANTE:** Este sistema **NO realiza videollamadas**. Su función es **planificar, registrar y coordinar** atenciones de telemedicina.

---

## 📚 Índice de Documentación

### 🎯 Inicio Rápido
- **⭐ Changelog Completo:** `checklist/01_Historial/01_changelog.md`
- **Versiones:** `checklist/01_Historial/02_historial_versiones.md`
- **Troubleshooting:** `spec/05_Troubleshooting/01_guia_problemas_comunes.md`

### 🔐 Seguridad y Auditoría
- **⭐ Guía Auditoría:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- **Plan Seguridad:** `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`
- **Acceso Sensible:** `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/`

### 👨‍⚕️ Módulos Médicos
- **⭐ Resumen Optimización:** `plan/02_Modulos_Medicos/00_resumen_optimizacion_planes.md` (Decisión arquitectónica)
- **Disponibilidad Turnos + Integración Chatbot:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0)
- **📋 Checklist Disponibilidad:** `checklist/03_Checklists/01_checklist_disponibilidad_v2.md` (Seguimiento de implementación)
- **Solicitud Turnos IPRESS:** `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` (v1.2 - Independiente)
- **Reporte Testing:** `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`

### 🫀 Módulo Tele-ECG (v1.24.0) - ✅ 100% COMPLETADO + OPTIMIZACIÓN UI v3.2.0

**📌 INICIO RÁPIDO:** Para entender el módulo Tele-ECG completo, leer:
- **`plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md`** ⭐ (Recomendado - 2026-01-22 v1.24.0)

**Documentación Completa:**
- **⭐ Resumen Desarrollo:** `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md` (Arquitectura + 12 bugs resueltos + Optimización UI v1.21.1→v1.24.0)
- **📊 Análisis Completo:** `plan/02_Modulos_Medicos/07_analisis_completo_teleecg_v2.0.0.md` (Detalles técnicos, endpoints, permisos)
- **📋 Checklist Tele-ECG:** `plan/02_Modulos_Medicos/04_checklist_teleekgs.md` (Implementación 100% completada v1.24.0)
- **🐛 Reporte Bugs:** `checklist/02_Reportes_Pruebas/03_reporte_bugs_teleecg_v2.0.0.md` (12 bugs identificados + 12 resueltos)
- **📝 Changelog:** `checklist/01_Historial/01_changelog.md` (Versiones v1.21.1 → v1.24.0 con UI optimizations)
- **💾 Script SQL BYTEA:** `spec/04_BaseDatos/06_scripts/041_teleecg_bytea_storage.sql` (Almacenamiento en BD)

**Versión Actual (v1.24.0) - Optimización UI v3.2.0:**
- 🎨 **UI Comprimida**: Fuentes reducidas (text-sm → text-xs), espacios optimizados (p-6 → p-4)
- 📊 **Estadísticas Corregidas**: Conteo de CASOS (pacientes) en lugar de IMÁGENES
- 🔍 **Filtros Inteligentes**: Colapsables con auto-aplicación (debounce 300ms)
- 🏥 **IPRESS Field**: Adscripción del paciente integrada en modal
- 🎯 **Botones Estandarizados**: Cancelar=Naranja, Guardar=Verde, Rechazar=Rojo
- ⚡ **Performance**: Load times optimizados, rendering eficiente

**Estado Final:**
- ✅ 12 Bugs Identificados: 12 RESUELTOS (100%)
- ✅ 5 Mejoras UI/UX Implementadas (v1.24.0)
- ✅ 0 Bugs Críticos Pendientes
- ✅ Backend: BUILD SUCCESSFUL (0 errores)
- ✅ Frontend: Compilado sin errores
- ✅ Almacenamiento: BYTEA (DATABASE) + Filesystem (FILESYSTEM) dual
- ✅ **Status: PRODUCTION LIVE** 🎉 (Disponible desde 2026-01-22)

### 👥 Módulos de Usuarios
- **⭐ Personal Externo:** `spec/02_Modulos_Usuarios/01_modulo_personal_externo.md` (v1.18.0)
  - Gestión de Modalidad de Atención (NUEVO)
  - Página de Bienvenida Personalizada (NUEVO)
  - Formulario de Diagnóstico
  - Solicitud de Turnos
- **⭐ Configuración de Módulos por IPRESS:** `spec/02_Modulos_Usuarios/02_configuracion_modulos_ipress.md` (NUEVO v1.20.1)
  - Sistema de activación de módulos por IPRESS
  - Tabla `ipress_modulos_config`
  - Caso: TELEECG exclusivo para PADOMI
  - Procedimientos administrativos

### 💾 Base de Datos
- **Modelo Usuarios:** `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
- **Análisis Estructura:** `spec/04_BaseDatos/04_analisis_estructura/`
- **Plan Limpieza:** `spec/04_BaseDatos/05_plan_limpieza/`
- **Scripts SQL (17+):** `spec/04_BaseDatos/06_scripts/`
- **⭐ Sistema Horarios:** `spec/04_BaseDatos/07_horarios_sistema/` (Modelo existente + Guía integración)

### 🔧 Backend y APIs
- **Endpoints REST:** `spec/01_Backend/01_api_endpoints.md`
- **Importación Bolsa 107:** `spec/01_Backend/04_auto_normalizacion_excel_107.md`

### 📋 Planificación
- **Firma Digital:** `plan/05_Firma_Digital/01_plan_implementacion.md`
- **Módulo Red:** `plan/03_Infraestructura/01_plan_modulo_red.md`
- **Integraciones:** `plan/04_Integraciones/`

---

## Stack Tecnológico

```
Backend:      Spring Boot 3.5.6 + Java 17
Frontend:     React 19 + TailwindCSS 3.4.18
Base de Datos: PostgreSQL 14+ (10.0.89.13:5432)
Seguridad:    JWT + MBAC (Module-Based Access Control)
```

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                    # 📚 DOCUMENTACIÓN TÉCNICA DETALLADA
│   ├── 01_Backend/          # API, endpoints, lógica de negocio
│   ├── 02_Frontend/         # Componentes React (próximamente)
│   ├── 03_Arquitectura/     # Diagramas, flujos del sistema
│   ├── 04_BaseDatos/        # Modelo, auditoría, análisis, scripts SQL
│   └── 05_Troubleshooting/  # Guía de problemas comunes
│
├── plan/                    # 📋 PLANIFICACIÓN DE MÓDULOS
│   ├── 01_Seguridad_Auditoria/
│   ├── 02_Modulos_Medicos/
│   ├── 03_Infraestructura/
│   ├── 04_Integraciones/
│   └── 05_Firma_Digital/
│
├── checklist/               # ✅ HISTORIAL Y REPORTES
│   ├── 01_Historial/        # ⭐ Changelog, versiones
│   ├── 02_Reportes_Pruebas/
│   ├── 03_Checklists/
│   └── 04_Analisis/
│
├── backend/                 # Spring Boot (puerto 8080)
│   └── src/main/java/com/styp/cenate/
│       ├── api/             # Controllers REST
│       ├── service/         # Lógica de negocio
│       ├── model/           # Entidades JPA (51)
│       ├── repository/      # JPA Repositories (48)
│       ├── dto/             # Data Transfer Objects
│       ├── security/        # JWT + MBAC
│       └── exception/       # Manejo de errores
│
└── frontend/                # React (puerto 3000)
    └── src/
        ├── components/      # UI reutilizable
        ├── context/         # AuthContext, PermisosContext
        ├── pages/           # Vistas (31+)
        └── services/        # API services
```

---

## Configuración de Desarrollo

### Variables de Entorno (Backend)

```bash
# PostgreSQL (servidor remoto)
DB_URL=jdbc:postgresql://10.0.89.13:5432/maestro_cenate
DB_USERNAME=postgres
DB_PASSWORD=Essalud2025

# JWT (mínimo 32 caracteres)
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970

# Email SMTP (Servidor Corporativo EsSalud)
MAIL_HOST=172.20.0.227
MAIL_PORT=25
MAIL_USERNAME=cenate.contacto@essalud.gob.pe
MAIL_PASSWORD=essaludc50

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos Rápidos

```bash
# Desarrollo
cd backend && ./gradlew bootRun    # Backend
cd frontend && npm start            # Frontend

# Docker Producción
./start-smtp-relay.sh               # 1. SMTP relay
docker-compose up -d                # 2. Iniciar containers
docker-compose logs -f backend      # Ver logs

# PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Credenciales de prueba
Username: 44914706
Password: @Cenate2025
```

---

## Módulos Principales

| Módulo | Documentación | Estado |
|--------|--------------|--------|
| **Auditoría** | `spec/04_BaseDatos/02_guia_auditoria/` | ✅ Implementado |
| **Disponibilidad + Integración Chatbot** | `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0) + Testing: `checklist/02_Reportes_Pruebas/02_reporte_integracion_chatbot.md` | ✅ Implementado (v1.17.0) |
| **Solicitud Turnos IPRESS** | `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` (v1.2) | ✅ Implementado |
| **Firma Digital** | `plan/05_Firma_Digital/01_plan_implementacion.md` | ✅ Implementado |
| **Bolsa 107 (Importación)** | `spec/01_Backend/04_auto_normalizacion_excel_107.md` | ✅ Implementado |
| **Pacientes 107** | Ver changelog v1.15.2 | ✅ Implementado |
| **Asignación Roles** | `checklist/01_Historial/01_changelog.md` (v1.13.0) | ✅ Implementado |
| **Asignación Admisionistas** | Ver changelog v1.14.2 | ✅ Implementado |
| **Notificaciones Cumpleaños** | Ver changelog v1.15.10 | ✅ Implementado |
| **Gestión Asegurado** | Ver changelog v1.16.0 | ✅ Implementado |
| **Tipos Profesionales** | Ver changelog v1.16.1 | ✅ Implementado |
| **Navegación Dinámica de Pestañas** | Ver changelog v1.17.1 | ✅ Implementado |
| **Creación de Usuarios con Email** | `plan/01_Seguridad_Auditoria/03_plan_unificacion_creacion_usuarios.md` | ✅ Implementado (v1.18.0) |
| **Personal Externo (Gestión Modalidad + Bienvenida)** | `spec/02_Modulos_Usuarios/01_modulo_personal_externo.md` | ✅ Implementado (v1.18.0) |
| **🫀 Tele-ECG v2.0.0** | `plan/02_Modulos_Medicos/08_resumen_desarrollo_tele_ecg.md` ⭐ + `checklist/02_Reportes_Pruebas/03_reporte_bugs_teleecg_v2.0.0.md` | ✅ **100% Completado** (v1.21.4 - 6 bugs resueltos) 🎉 |
| **Tele-ECG Exclusivo PADOMI** | `spec/02_Modulos_Usuarios/02_configuracion_modulos_ipress.md` + `spec/04_BaseDatos/06_scripts/034_teleecg_exclusivo_padomi.sql` | ✅ Implementado (v1.20.1) |
| **Módulo Red** | `plan/03_Infraestructura/01_plan_modulo_red.md` | 📋 Pendiente |

---

## Glosario

| Término | Definición |
|---------|-----------|
| **CENATE** | Centro Nacional de Telemedicina |
| **IPRESS** | Institución Prestadora de Servicios de Salud |
| **ESSI** | Sistema de información de EsSalud |
| **MBAC** | Module-Based Access Control |
| **Bolsa 107** | Módulo de importación masiva de pacientes |
| **Régimen 728/CAS** | Personal nombrado/CAS: M=4h, T=4h, MT=8h + 2h sanitarias/día (telemonitoreo 1h + administrativa 1h) |
| **Locador** | Locación de servicios: M=6h, T=6h, MT=12h (sin horas sanitarias) |
| **Horas Sanitarias** | 2h adicionales por día trabajado solo para 728/CAS (1h telemonitoreo + 1h administrativa) |
| **ctr_horario** | Sistema existente de slots del chatbot (producción) |
| **disponibilidad_medica** | Nuevo módulo de declaración médica (150h mínimas) |
| **TRN_CHATBOT** | Tipo de turno crítico para que slots aparezcan en chatbot |
| **Sincronización** | Proceso manual de mapear disponibilidad → slots chatbot |

---

## 🤖 Instrucciones para Claude

### 📖 Al Investigar o Responder Preguntas

**IMPORTANTE:** Toda la información detallada está en los archivos de `spec/`, `plan/` y `checklist/`. **NO repitas información**, enlaza a los archivos correspondientes.

**Flujo de consulta:**
1. Consulta **primero** la documentación detallada en:
   - `spec/` para detalles técnicos
   - `plan/` para planificación de módulos
   - `checklist/01_Historial/01_changelog.md` para cambios recientes
2. Resume brevemente y enlaza al archivo completo
3. Solo proporciona detalles si el usuario lo solicita explícitamente

**Referencias rápidas:**
- Auditoría → `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- Optimización Planes → `plan/02_Modulos_Medicos/00_resumen_optimizacion_planes.md`
- Disponibilidad + Chatbot → `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` (v2.0.0)
- Horarios Existentes → `spec/04_BaseDatos/07_horarios_sistema/01_modelo_horarios_existente.md`
- Integración Horarios → `spec/04_BaseDatos/07_horarios_sistema/02_guia_integracion_horarios.md`
- Firma Digital → `plan/05_Firma_Digital/01_plan_implementacion.md`
- Bolsa 107 → `spec/01_Backend/04_auto_normalizacion_excel_107.md`
- Troubleshooting → `spec/05_Troubleshooting/01_guia_problemas_comunes.md`

### 💻 Al Implementar Nuevas Funcionalidades

**Análisis previo:**
1. Leer archivos relacionados existentes
2. Evaluar impacto en backend, frontend, BD
3. Consultar patrones similares en el código

**Patrones arquitectónicos:**
- Controller → Service → Repository
- Usar DTOs, nunca exponer entidades
- Integrar `AuditLogService` para auditoría
- Agregar permisos MBAC si aplica

**Validación en 3 capas:**
- Frontend (validación UX)
- Backend DTO (validación de negocio)
- Base de datos (CHECK constraints)

**Documentación obligatoria:**
- Actualizar `checklist/01_Historial/01_changelog.md`
- Crear/actualizar documentos en `spec/` si es necesario
- Agregar scripts SQL a `spec/04_BaseDatos/06_scripts/`

### 🔐 Seguridad y Buenas Prácticas

1. **NUNCA** exponer credenciales en código
2. **SIEMPRE** usar variables de entorno
3. **Prevenir:** SQL injection, XSS, CSRF
4. **Auditar:** Todas las acciones críticas
5. **Validar:** Permisos MBAC en endpoints sensibles

### 📝 Patrones de Código

**Backend (Java):**
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) {
    auditLogService.registrarEvento(...);
    return ResponseEntity.ok(...);
}
```

**Frontend (React):**
```jsx
<ProtectedRoute requiredPath="/admin/users" requiredAction="ver">
  <UsersManagement />
</ProtectedRoute>

<PermissionGate path="/admin/users" action="crear">
  <Button>Crear Usuario</Button>
</PermissionGate>
```

**Formato API Response:**
```javascript
// Éxito
{ "status": 200, "data": {...}, "message": "..." }

// Error
{ "status": 400, "error": "...", "message": "...", "validationErrors": {...} }
```

---

## Roles del Sistema

| Rol | Acceso |
|-----|--------|
| SUPERADMIN | Todo el sistema |
| ADMIN | Panel admin, usuarios, auditoría |
| MEDICO | Dashboard médico, disponibilidad, pacientes |
| COORDINADOR | Agenda, asignaciones, revisión turnos |
| COORDINADOR_ESPECIALIDADES | Asignación de médicos |
| COORDINADOR_RED | Solicitudes IPRESS, turnos |
| ENFERMERIA | Atenciones, seguimiento pacientes |
| EXTERNO | Formulario diagnóstico |
| INSTITUCION_EX | Acceso limitado IPRESS externa |

---

*EsSalud Perú - CENATE | Desarrollado por Ing. Styp Canto Rondón*
*Versión 1.22.1 | 2026-01-21*
