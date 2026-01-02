# CLAUDE.md - Proyecto CENATE

> Sistema de Telemedicina - EsSalud | **v1.14.1** (2026-01-02)

---

## ¿Qué es CENATE?

**CENATE es el Centro Nacional de Telemedicina** del Seguro Social de Salud (EsSalud) en Perú. Coordina atenciones médicas remotas para 4.6M asegurados a través de 414 IPRESS a nivel nacional.

### Propósito del Sistema

CENATE permite:
- **Planificación y registro** de atenciones de telemedicina
- **Coordinación de atención médica especializada** desde CENATE hacia IPRESS
- **Gestión de turnos médicos** según disponibilidad del personal
- **Administración de personal** (regímenes 728, CAS, Locador)
- **Trazabilidad completa** de atenciones por paciente/servicio
- **Control de accesos y auditoría** de operaciones
- **Firma digital** para documentos

**IMPORTANTE:** Este sistema **NO realiza videollamadas**. Su función es **planificar, registrar y coordinar** atenciones.

---

## Documentación Completa

### 📚 Especificaciones Técnicas (`spec/`)

| Tema | Archivo | Descripción |
|------|---------|-------------|
| **API Backend** | `spec/01_Backend/01_api_endpoints.md` | Endpoints REST documentados |
| **Normalización Excel** | `spec/01_Backend/04_auto_normalizacion_excel_107.md` | Importación masiva Bolsa 107 |
| **Arquitectura** | `spec/03_Arquitectura/01_diagramas_sistema.md` | Diagramas del sistema |
| **Modelo Usuarios** | `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md` | Estructura de usuarios |
| **⭐ Auditoría** | `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md` | Guía completa de auditoría |
| **Acceso Sensible** | `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/` | Auditoría de datos críticos |
| **Análisis BD** | `spec/04_BaseDatos/04_analisis_estructura/` | Análisis completo de BD |
| **Plan Limpieza** | `spec/04_BaseDatos/05_plan_limpieza/` | Plan limpieza BD |
| **Scripts SQL** | `spec/04_BaseDatos/06_scripts/` | 17+ scripts SQL |
| **Troubleshooting** | `spec/05_Troubleshooting/01_guia_problemas_comunes.md` | Solución de problemas |

### 📋 Planificación (`plan/`)

| Módulo | Archivo | Estado |
|--------|---------|--------|
| **Auditoría** | `plan/01_Seguridad_Auditoria/01_plan_auditoria.md` | ✅ Implementado |
| **Seguridad Auth** | `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md` | ✅ Implementado |
| **Disponibilidad Turnos** | `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md` | ✅ Implementado |
| **Solicitud Turnos** | `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md` | 🔄 En desarrollo |
| **Módulo Red** | `plan/03_Infraestructura/01_plan_modulo_red.md` | 📋 Pendiente |
| **Firma Digital** | `plan/05_Firma_Digital/01_plan_implementacion.md` | ✅ Implementado |

### ✅ Historial y Reportes (`checklist/`)

| Tipo | Archivo | Descripción |
|------|---------|-------------|
| **⭐ Changelog** | `checklist/01_Historial/01_changelog.md` | Historial completo de versiones |
| **Versiones** | `checklist/01_Historial/02_historial_versiones.md` | Resumen de releases |
| **Reporte Disponibilidad** | `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md` | Testing disponibilidad médica |
| **Checklist Firma** | `checklist/03_Checklists/01_checklist_firma_digital.md` | Checklist firma digital |
| **Análisis Chatbot** | `checklist/04_Analisis/01_analisis_chatbot_citas.md` | Análisis chatbot citas |

---

## Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|------------|---------|
| Backend | Spring Boot | 3.5.6 |
| Java | OpenJDK | 17 |
| Frontend | React | 19 |
| Base de Datos | PostgreSQL | 14+ |
| CSS | TailwindCSS | 3.4.18 |

---

## Estructura del Proyecto

```
mini_proyecto_cenate/
├── spec/                    # 📚 Documentación técnica
│   ├── 01_Backend/          # API, endpoints, lógica
│   ├── 02_Frontend/         # React (próximamente)
│   ├── 03_Arquitectura/     # Diagramas, flujos
│   ├── 04_BaseDatos/        # Modelo, auditoría, scripts
│   └── 05_Troubleshooting/  # Guía de problemas
│
├── plan/                    # 📋 Planificación
│   ├── 01_Seguridad_Auditoria/
│   ├── 02_Modulos_Medicos/
│   ├── 03_Infraestructura/
│   ├── 04_Integraciones/
│   └── 05_Firma_Digital/
│
├── checklist/               # ✅ Logs, reportes, análisis
│   ├── 01_Historial/        # Changelog, versiones
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
├── frontend/                # React (puerto 3000)
│   └── src/
│       ├── components/      # UI reutilizable
│       ├── context/         # AuthContext, PermisosContext
│       ├── pages/           # Vistas (31+)
│       └── services/        # API services
│
└── CLAUDE.md               # ⭐ Este archivo (guía rápida)
```

---

## Configuración de Desarrollo

### Variables de Entorno - Backend

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
MAIL_SMTP_AUTH=false
MAIL_SMTP_STARTTLS=true

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### Comandos Desarrollo

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start
```

### Credenciales de Prueba

```
Username: 44914706
Password: @Cenate2025
```

---

## Despliegue en Producción (Docker)

### ⚠️ PASOS DE INICIO (IMPORTANTE)

Cada vez que reinicies la Mac o Docker:

```bash
# 1. Iniciar relay SMTP (permite a Docker conectar al servidor corporativo)
./start-smtp-relay.sh

# 2. Iniciar Docker
docker-compose up -d

# 3. Verificar
docker-compose ps
docker logs cenate-backend --tail=20
```

### Arquitectura Docker

```
┌─────────────────────────────────────────┐
│       SERVIDOR PRODUCCIÓN               │
│                                          │
│  ┌────────────┐    ┌──────────────┐     │
│  │  frontend  │───▶│   backend    │     │
│  │ (nginx:80) │/api│ (spring:8080)│     │
│  └────────────┘    └──────────────┘     │
│                          │               │
└──────────────────────────┼───────────────┘
                           │
                           ▼
              PostgreSQL (10.0.89.13:5432)
```

### Comandos Docker

```bash
# Construir y levantar
docker-compose up -d --build

# Solo frontend
docker-compose build frontend && docker-compose up -d frontend

# Solo backend
docker-compose build backend && docker-compose up -d backend

# Ver logs
docker-compose logs -f backend

# Detener
docker-compose down
```

---

## Módulos Principales

### 1. Auditoría

📖 **Documentación completa:** `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`

**Resumen:**
- Tabla `audit_logs` con índices optimizados
- Vista `vw_auditoria_modular_detallada`
- Servicios integrados: Usuario, Auth, Disponibilidad
- Frontend: LogsDelSistema.jsx con filtros avanzados

**Endpoints:**
```
GET /api/auditoria/busqueda-avanzada
```

### 2. Disponibilidad de Turnos Médicos

📋 **Plan:** `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
📊 **Reporte:** `checklist/02_Reportes_Pruebas/01_reporte_disponibilidad.md`

**Resumen:**
- Médicos declaran disponibilidad mensual (M/T/MT)
- Validación 150 horas mínimas
- Estados: BORRADOR → ENVIADO → REVISADO
- Cálculo automático según régimen laboral

**Endpoints:**
```
GET  /api/disponibilidad/mis-disponibilidades
POST /api/disponibilidad
PUT  /api/disponibilidad/{id}/enviar
PUT  /api/disponibilidad/{id}/revisar
```

### 3. Firma Digital

📋 **Plan:** `plan/05_Firma_Digital/01_plan_implementacion.md`
✅ **Checklist:** `checklist/03_Checklists/01_checklist_firma_digital.md`

**Resumen:**
- Gestión de tokens y certificados digitales
- Solo para personal interno CAS/728
- Estados: PENDIENTE → ENTREGADO
- Tracking de vigencia de certificados

**Endpoints:**
```
POST /api/firma-digital
GET  /api/firma-digital/personal/{id}
PUT  /api/firma-digital/{id}/actualizar-entrega
GET  /api/firma-digital/pendientes
```

### 4. Bolsa 107 (Importación Masiva)

📖 **Arquitectura:** `spec/01_Backend/04_auto_normalizacion_excel_107.md`

**Resumen:**
- Importación masiva desde Excel (14 columnas)
- Validación automática de formato
- Detección de duplicados por hash
- Trazabilidad de errores por fila

**Endpoints:**
```
POST   /api/import-excel/pacientes
GET    /api/import-excel/cargas
GET    /api/import-excel/pacientes/{id}/datos
DELETE /api/import-excel/cargas/{id}
GET    /api/import-excel/cargas/{id}/exportar
```

### 5. Pacientes de 107 (Gestión y Visualización)

**Ubicación:** Coordinador de Gestión de Citas → Pacientes de 107
**Ruta:** `/roles/coordcitas/pacientes-107`
**Versión:** v1.15.2

**Resumen:**
- Dashboard de estadísticas de pacientes importados
- Filtros avanzados (DNI, nombre, teléfono, derivación, departamento)
- Visualización centralizada de pacientes de Bolsa 107
- Selección múltiple para acciones masivas
- Integración con WhatsApp para contacto rápido
- Cálculo automático de edad desde fecha de nacimiento

**Estadísticas visualizadas:**
- Total de pacientes
- Pacientes por derivación (Psicología, Medicina)
- Pacientes por ubicación (Lima, Provincia)

**Componentes Frontend:**
- `PacientesDe107.jsx` (650+ líneas)
- 5 tarjetas de estadísticas con gradientes
- Tabla con badges de colores
- Buscador en tiempo real

**Componentes Backend:**
- `Bolsa107Controller.java`
- Repository: `Bolsa107ItemRepository`
- Modelo: `Bolsa107Item`

**Endpoints:**
```
GET /api/bolsa107/pacientes
GET /api/bolsa107/pacientes/por-derivacion?derivacion={tipo}
GET /api/bolsa107/estadisticas
```

**Permisos:**
- SUPERADMIN: Todos los permisos
- ADMIN: Todos los permisos

### 6. Asignación Automática de Roles

📖 **Changelog v1.13.0:** `checklist/01_Historial/01_changelog.md`

**Resumen:**
- Asignación automática según IPRESS al aprobar solicitud
- Notificaciones en tiempo real (campanita)
- Panel de gestión de usuarios pendientes
- Polling cada 30 segundos

**Endpoints:**
```
GET /api/usuarios/pendientes-rol
GET /api/usuarios/pendientes-rol/lista
```

---

## Glosario Rápido

| Término | Definición |
|---------|-----------|
| **CENATE** | Centro Nacional de Telemedicina |
| **IPRESS** | Institución Prestadora de Servicios de Salud |
| **ESSI** | Sistema de información de EsSalud |
| **MBAC** | Module-Based Access Control |
| **Bolsa 107** | Módulo de importación masiva de pacientes |
| **Régimen 728** | Personal nombrado (4h/4h/8h) |
| **Régimen CAS** | Contrato Administrativo (4h/4h/8h) |
| **Locador** | Locación de servicios (6h/6h/12h) |

---

## Instrucciones para Claude

### 🔍 Al Investigar o Responder Preguntas

1. **SIEMPRE consulta la documentación detallada primero:**
   - Backend: `spec/01_Backend/`
   - Base de datos: `spec/04_BaseDatos/`
   - Planes: `plan/`
   - Changelog: `checklist/01_Historial/01_changelog.md`

2. **Referencias específicas:**
   - Auditoría → `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
   - Disponibilidad → `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
   - Firma Digital → `plan/05_Firma_Digital/01_plan_implementacion.md`
   - Bolsa 107 → `spec/01_Backend/04_auto_normalizacion_excel_107.md`

3. **NO repitas información que ya existe en los documentos detallados**

### 💻 Al Implementar Nuevas Funcionalidades

1. **Análisis previo:**
   - Leer archivos relacionados existentes
   - Evaluar impacto en backend, frontend, BD
   - Consultar patrones similares en el código

2. **Seguir patrones arquitectónicos:**
   - Controller → Service → Repository
   - Usar DTOs, nunca exponer entidades
   - Integrar AuditLogService para auditoría
   - Agregar permisos MBAC si aplica

3. **Validación en 3 capas:**
   - Frontend (validación UX)
   - Backend DTO (validación de negocio)
   - Base de datos (CHECK constraints)

4. **Documentación obligatoria:**
   - Actualizar `checklist/01_Historial/01_changelog.md`
   - Crear/actualizar documentos en `spec/` si es necesario
   - Agregar scripts SQL a `spec/04_BaseDatos/06_scripts/`

### ✏️ Al Modificar Código Existente

1. **LEER archivos antes de modificar**
2. **Mantener consistencia** con estilo existente
3. **No sobreingeniería:** Solo cambios necesarios
4. **Respetar separación de capas**
5. **Probar cambios** antes de confirmar

### 🔐 Seguridad y Buenas Prácticas

1. **NUNCA** exponer credenciales en código
2. **SIEMPRE** usar variables de entorno
3. **Prevenir:** SQL injection, XSS, CSRF
4. **Auditar:** Todas las acciones críticas
5. **Validar:** Permisos MBAC en endpoints sensibles

### 📝 Formato de Código

**Backend (Java):**
```java
@CheckMBACPermission(pagina = "/admin/users", accion = "crear")
@PostMapping
public ResponseEntity<?> crearUsuario(...) {
    // Auditar acción
    auditLogService.registrarEvento(...);

    // Lógica de negocio
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

### 📦 Formato de Respuesta API

```javascript
// Éxito
{
  "status": 200,
  "data": { ... },
  "message": "Operación exitosa"
}

// Error
{
  "status": 400,
  "error": "Validation Error",
  "message": "Mensaje descriptivo",
  "validationErrors": { "campo": "error" }
}
```

---

## Scripts SQL Importantes

```bash
# Conectar a PostgreSQL
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate

# Ejecutar script
PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
  -f spec/04_BaseDatos/06_scripts/[nombre_script].sql

# Scripts disponibles en: spec/04_BaseDatos/06_scripts/
# - 001_audit_view_and_indexes.sql (Auditoría)
# - 005_disponibilidad_medica.sql (Disponibilidad)
# - 015_crear_tabla_firma_digital_personal.sql (Firma Digital)
# - 016_crear_tablas_bolsa_107.sql (Bolsa 107)
# ... y más (17+ scripts)
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

## Contactos

| Rol | Correo |
|-----|--------|
| Soporte técnico | cenate.analista@essalud.gob.pe |
| Sistema (envío emails) | cenateinformatica@gmail.com |

---

## Índice de Documentación por Tema

### 🔐 Seguridad y Auditoría
- Guía completa: `spec/04_BaseDatos/02_guia_auditoria/02_guia_auditoria.md`
- Plan seguridad: `plan/01_Seguridad_Auditoria/02_plan_seguridad_auth.md`
- Acceso sensible: `spec/04_BaseDatos/03_guia_auditoria_acceso_sensible/`

### 👨‍⚕️ Módulos Médicos
- Disponibilidad: `plan/02_Modulos_Medicos/01_plan_disponibilidad_turnos.md`
- Solicitud turnos: `plan/02_Modulos_Medicos/02_plan_solicitud_turnos.md`

### 💾 Base de Datos
- Modelo usuarios: `spec/04_BaseDatos/01_modelo_usuarios/01_modelo_usuarios.md`
- Análisis estructura: `spec/04_BaseDatos/04_analisis_estructura/`
- Plan limpieza: `spec/04_BaseDatos/05_plan_limpieza/`
- Scripts SQL: `spec/04_BaseDatos/06_scripts/`

### 📊 Importación y Reportes
- Bolsa 107: `spec/01_Backend/04_auto_normalizacion_excel_107.md`

### ✍️ Firma Digital
- Plan implementación: `plan/05_Firma_Digital/01_plan_implementacion.md`
- Checklist: `checklist/03_Checklists/01_checklist_firma_digital.md`

### 📜 Historial y Versiones
- **⭐ Changelog completo:** `checklist/01_Historial/01_changelog.md`
- Versiones: `checklist/01_Historial/02_historial_versiones.md`

---

*EsSalud Perú - CENATE | Desarrollado por Ing. Styp Canto Rondón*
*Versión 1.14.1 | 2026-01-02*
