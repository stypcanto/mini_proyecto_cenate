# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.51.0 (2026-02-06) 🚀
> **Última Feature:** v1.51.0 - Flujo End-to-End TeleEKG ✅ (2026-02-06) ⭐
> **Última Fix:** v1.47.2.1 - Persistencia de Enfermedades Crónicas ✅ (2026-02-06)
> **Status:** ✅ Production Ready

---

## 🎯 ¿Qué es CENATE?

**CENATE** = Centro Nacional de Telemedicina (EsSalud Perú)
- Coordina atenciones médicas remotas para **4.6M asegurados**
- **414 IPRESS** (Instituciones Prestadoras)
- NO realiza videollamadas - solo planifica, registra y coordina

---

---

## 🏥 FLUJO COMPLETO DE ATENCIONES

**⭐ Documento Maestro:** [`spec/architecture/01_flujo_atenciones_completo.md`](spec/architecture/01_flujo_atenciones_completo.md)

El flujo comprende **4 etapas**:

1. **📦 Etapa 1: Generación en Bolsas** (Módulo 107, Dengue, etc.)
   - Tabla: `dim_solicitud_bolsa`
   - Rol: COORDINADOR
   - Acción: Paciente ingresa a bolsa

2. **👤 Etapa 2: Coordinador Gestión Citas Asigna Médico**
   - Tabla: `dim_solicitud_bolsa.id_personal` ← ASIGNADO AQUÍ
   - Rol: COORDINADOR_GESTION_CITAS
   - Acción: Asignar médico al paciente

3. **📋 Etapa 3: Gestión de Citas Maneja Estados**
   - Tabla: `solicitud_cita`
   - Rol: COORDINADOR
   - Acción: Cambiar estado (Pendiente → Citado → Atendido, etc.)

4. **👨‍⚕️ Etapa 4: Médico Atiende Paciente**
   - Tabla: `dim_solicitud_bolsa` (lectura) → Sincroniza a `solicitud_cita`
   - Rol: MEDICO
   - Acción: Marcar Atendido, Generar Receta, Generar Interconsulta
   - Componente: **MisPacientes.jsx** (v1.45.1+)

**Sincronización (v1.44.0+):** Cuando médico marca ATENDIDO, sincroniza automáticamente a ambas tablas.

---

## 🏗️ ARQUITECTURA DE BOLSAS (v1.42.0+)

### **Modelo de Dos Niveles: Universo General + Mini-Bolsas**

El sistema de bolsas opera en **2 niveles jerárquicos escalables**:

```
┌─────────────────────────────────────────────────────────────┐
│          UNIVERSO GENERAL DE BOLSAS                          │
│          /bolsas/solicitudes                                 │
│  ✅ 7,973 REGISTROS (Módulo 107 + Dengue + Otras)            │
│  ✅ Visible: COORDINADORES                                   │
│  ✅ Campos: DNI, Nombre, IPRESS, Red, Estado, Teléfono       │
│  ✅ KPIs: Total, Pendiente Citar, Citados, Asistió           │
│  ✅ Filtros: Por bolsa, macrorregión, red, IPRESS, etc.      │
└─────────────────────────────────────────────────────────────┘
         ↓↓↓ Cada bolsa tiene su MINI-INTERFAZ ↓↓↓

┌──────────────────────────┐  ┌──────────────────────────┐
│   MÓDULO 107             │  │   DENGUE                 │
│ /bolsas/modulo107/*      │  │ /dengue/*                │
│ 6,404 pacientes          │  │ X pacientes dengue       │
│ Rol: COORDINADORES +     │  │ Rol: EPIDEMIOLOGÍA +     │
│       MÉDICOS 107        │  │       MÉDICOS            │
│                          │  │                          │
│ Campos: Fecha Registro,  │  │ Campos: DNI, CIE-10,     │
│ Especialista, Fecha      │  │ Síntomas, Severidad      │
│ Atención, Estado         │  │                          │
│ Atención                 │  │ KPIs: Casos, Severidad   │
│                          │  │                          │
│ KPIs: Atendidos,         │  │ Filtros: DNI, Código     │
│ Pendientes, En Proceso   │  │ CIE-10, Fecha            │
│                          │  │                          │
│ Filtros: IPRESS, Estado  │  │                          │
│ Atención                 │  │                          │
└──────────────────────────┘  └──────────────────────────┘

         ↓↓↓ Futuras Bolsas (escalable) ↓↓↓

┌──────────────────────────┐  ┌──────────────────────────┐
│   BOLSA XXXXX            │  │   BOLSA YYYYY            │
│ /bolsas/xxxx/*           │  │ /bolsas/yyyy/*           │
│ Estructura específica     │  │ Estructura específica     │
│ Permisos específicos      │  │ Permisos específicos      │
│ KPIs específicos          │  │ KPIs específicos          │
│ Campos específicos        │  │ Campos específicos        │
└──────────────────────────┘  └──────────────────────────┘
```

### **Características de cada Mini-Bolsa:**

| Aspecto | Descripción |
|---------|-------------|
| **Ruta dedicada** | Cada bolsa tiene su propia URL (`/bolsas/modulo107/`, `/dengue/`, etc.) |
| **Permisos MBAC** | Usuarios ven SOLO su bolsa asignada (controlado por roles) |
| **DTO personalizado** | Cada bolsa envía datos optimizados para su caso de uso |
| **KPIs específicos** | Módulo 107 muestra "Atendidos, Pendientes", Dengue muestra "Casos, Severidad" |
| **Campos únicos** | Módulo 107 incluye "Especialista, Fecha Atención"; Dengue incluye "CIE-10" |
| **Filtros customizados** | Módulo 107 filtra por IPRESS; Dengue filtra por CIE-10 |
| **Estadísticas propias** | Cada bolsa tiene endpoints `/modulo107/estadisticas`, `/dengue/estadisticas`, etc. |
| **Consolidación** | Todos los registros se consolidan en el universo general (`/bolsas/solicitudes`) |

### **Implementación Técnica:**

```
Backend (Spring Boot):
├─ /api/bolsas/solicitudes                 ← Universo general (todos)
├─ /api/bolsas/modulo107/pacientes         ← Mini-bolsa Módulo 107
│  ├─ /pacientes                           ← Listado paginado
│  ├─ /pacientes/buscar                    ← Búsqueda avanzada
│  ├─ /estadisticas                        ← KPIs específicos
│  └─ Dto: Modulo107PacienteDTO            ← Campos específicos
├─ /api/dengue/*                           ← Mini-bolsa Dengue
│  ├─ /buscar                              ← Búsqueda por DNI/CIE-10
│  ├─ /estadisticas                        ← KPIs dengue
│  └─ Dto: DengueCasoDTO                   ← Campos específicos
└─ /api/bolsas/[futuro]/*                  ← Escalable para nuevas bolsas

Frontend (React 19):
├─ /bolsas/solicitudes                     ← Universo general
├─ /bolsas/modulo107/pacientes-de-107      ← Módulo 107
├─ /dengue/buscar                          ← Dengue
└─ /bolsas/[futuro]/*                      ← Escalable
```

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
| **📧 Email/SMTP** | [`spec/backend/11_email_smtp/README.md`](spec/backend/11_email_smtp/README.md) |
| **📦 Gestión Bolsas** | [`spec/backend/tipos_bolsas.md`](spec/backend/tipos_bolsas.md) |
| **🔍 QA/Support** | [`spec/troubleshooting/README.md`](spec/troubleshooting/README.md) |
| **🔐 Security** | [`plan/01_Seguridad_Auditoria/`](plan/01_Seguridad_Auditoria/) |
| **🤖 AI/Spring AI** | [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/) |

### Carpetas de Documentación

| Carpeta | Propósito |
|---------|-----------|
| **spec/backend/** | APIs, Servicios, Módulos, SMTP (11 docs) |
| **spec/frontend/** | Componentes, Páginas, UI (8 docs) |
| **spec/database/** | Esquemas, Auditoría, Backups (15 docs) |
| **spec/architecture/** | Diagramas, Flujos, Modelos |
| **spec/UI-UX/** | Design System, Guidelines |
| **spec/troubleshooting/** | Problemas, Soluciones (8 docs) |
| **spec/uml/** | Diagramas UML |
| **plan/** | Planificación (8 carpetas) |
| **checklist/** | Historial, Reportes, Análisis |

---

---

## 📖 DOCUMENTACIÓN PRINCIPAL POR VERSIÓN

### ✅ v1.51.0 - Flujo End-to-End TeleEKG (2026-02-06)
✅ **Redirección automática** - Upload → Listar (RegistroPacientes.jsx)
✅ **Breadcrumb de navegación** - 3 pasos con indicador de progreso (TeleEKGBreadcrumb.jsx)
✅ **Botón "Ver en CENATE"** - Abre vista consolidada en nueva pestaña
✅ **Auto-refresh en tiempo real** - Sincronización cada 30 segundos (TeleECGRecibidas.jsx)
✅ **Detección de redirección** - Auto-filtrado por DNI después de upload

**Features:**
- `UploadImagenECG.jsx` - useNavigate con state passing
- `RegistroPacientes.jsx` - useLocation, detecta redirección, aplica filtro, botón CENATE
- `TeleECGDashboard.jsx` - Breadcrumb agregado
- `TeleECGRecibidas.jsx` - Auto-refresh interval (30s silencioso)
- `TeleEKGBreadcrumb.jsx` - NUEVO componente (breadcrumb + progress bar)

**Frontend Spec:** [`spec/frontend/16_teleekg_workflow_end_to_end.md`](spec/frontend/16_teleekg_workflow_end_to_end.md) - Flujo completo documentado
**Changelog:** [`checklist/01_Historial/01_changelog.md#v1510-2026-02-06`](checklist/01_Historial/01_changelog.md) - Testing cases incluidos

**Flujo:**
1. IPRESS sube → Upload redirige a Listar (automático)
2. IPRESS ve cargas → Botón "Ver en CENATE" abre vista consolidada
3. CENATE ve todas → Auto-refresh cada 30 segundos

**Commit:** fdbbf9a

---

### ✅ v1.47.2 - Documentación Completa + Fix v1.47.2.1
- **Backend Spec:** [`spec/backend/15_recita_interconsulta_v1.47.md`](spec/backend/15_recita_interconsulta_v1.47.md) - Recita + Interconsulta Complete Workflow (400+ líneas)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#v1472-2026-02-06`](checklist/01_Historial/01_changelog.md) - Registro de atención médica + Fix Persistencia Enfermedades Crónicas
- **Index:** [`spec/INDEX.md`](spec/INDEX.md) - Referencia maestra actualizada con v1.47.2
- **Backend:**
  - `AtenderPacienteService.java` - Atender paciente, crear Recita e Interconsulta
  - `Asegurado.java` - Fix: mapeo `String[]` → PostgreSQL `text[]`
  - `GestionPacienteController.java` - Logging de request
- **Frontend:** `MisPacientes.jsx` - Modal para seleccionar Recita días, Interconsulta especialidad, Enfermedades crónicas (sin "Otra")
- **Fix v1.47.2.1:** Enfermedades crónicas ahora se guardan correctamente en BD (✅ Probado con {Hipertensión,Diabetes})

### ✅ v1.45.2 - Documentación Completa
- **Frontend Spec:** [`spec/frontend/15_mis_pacientes_medico.md`](spec/frontend/15_mis_pacientes_medico.md) - Mis Pacientes Médico (350+ líneas)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#v1452-2026-02-05`](checklist/01_Historial/01_changelog.md) - IPRESS Names Implementation
- **Index:** [`spec/INDEX.md`](spec/INDEX.md) - Referencia maestra actualizada
- **Backend:** `GestionPacienteServiceImpl.java:382` - obtenerNombreIpress() call
- **Frontend:** `MisPacientes.jsx` - Display IPRESS names

### ✅ v1.45.1 - Documentación Completa
- **Frontend Spec:** [`spec/frontend/15_mis_pacientes_medico.md`](spec/frontend/15_mis_pacientes_medico.md) - Complete Workflow (350+ líneas)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#v1451-2026-02-05`](checklist/01_Historial/01_changelog.md) - Mis Pacientes Complete + 3 Actions
- **Backend:** `GestionPacienteServiceImpl.java` - bolsaToGestionDTO() method
- **Frontend:** `MisPacientes.jsx` - Table layout + modals + stats

---

## 📊 ÚLTIMAS VERSIONES

### v1.51.0 - Completado (2026-02-06) 🔄 FLUJO END-TO-END TELEEKG
✅ **Redirección Automática** - Upload → Listar (RegistroPacientes.jsx)
✅ **Breadcrumb de Navegación** - 3 pasos con indicador de progreso (TeleEKGBreadcrumb.jsx)
✅ **Botón "Ver en CENATE"** - Abre vista consolidada en nueva pestaña
✅ **Auto-refresh en Tiempo Real** - Sincronización cada 30 segundos (TeleECGRecibidas.jsx)
✅ **Detección de Redirección** - Auto-filtrado por DNI después de upload

**Features:**
- Redirección automática con state passing (useNavigate)
- Breadcrumb con 3 pasos: Upload → Listar → Recibidas
- Indicador visual de progreso (barra azul)
- Auto-filtrado por DNI cuando viene del upload
- Toast de confirmación en cada etapa
- Botón "Ver en CENATE" para abrir consolidado
- Auto-refresh silencioso cada 30 segundos
- 0 breaking changes, 100% compatible

**Cambios:**
- `UploadImagenECG.jsx` - useNavigate, redirige con state
- `RegistroPacientes.jsx` - useLocation, detecta redirect, auto-filtra, botón CENATE
- `TeleECGDashboard.jsx` - Breadcrumb agregado
- `TeleECGRecibidas.jsx` - Auto-refresh interval (30s)
- `TeleEKGBreadcrumb.jsx` - NUEVO (breadcrumb + progress bar)

**Docs:**
- **Completo:** [`spec/frontend/16_teleekg_workflow_end_to_end.md`](spec/frontend/16_teleekg_workflow_end_to_end.md)

**Testing:**
- ✅ Upload → Listar (automático)
- ✅ Auto-filtrado por DNI
- ✅ Breadcrumb navegable
- ✅ Botón "Ver en CENATE" (nueva pestaña)
- ✅ Auto-refresh (30s silencioso)
- ✅ Frontend compila sin errores

**Build:** ✅ npm run build SUCCESS
**Commit:** fdbbf9a

---

### v1.48.8 - Completado (2026-02-06) 📦 TIPOS DE BOLSAS - DOCUMENTACIÓN COMPLETA
✅ **Documentación Bolsa Types Architecture** - Explicación completa del sistema de dos tablas
✅ **dim_tipos_bolsas vs dim_solicitud_bolsa** - Diferencia entre catálogo y datos operacionales
✅ **Flujo de Datos Completo** - Cómo se importan bolsas y se muestran en frontend
✅ **Troubleshooting Guide** - Respuestas a preguntas frecuentes sobre tipos de bolsas
✅ **Tabla de Equivalencia** - Mapeo de códigos (BOLSA_107) a descripciones (Bolsa 107 - Importación...)

**Features:**
- Diagrama detallado de arquitectura de datos (2 tablas, 3 niveles de abstracción)
- Explicación de por qué `desc_tipo_bolsa` en API puede variar de catálogo
- SQL examples para entender estructura de tablas
- Backend DTOs y Entity definitions
- Frontend rendering logic explicado
- Ejemplos de cómo cambiar/agregar tipos de bolsas
- Referencias a módulos relacionados (Pacientes, Citas, Telemedicina)

**Cambios:**
- Nuevo archivo: `spec/backend/tipos_bolsas.md` (310+ líneas)
- Actualizado: `CLAUDE.md` - Added reference in "Por Rol" section + version entry
- Actualizado: `spec/DOCUMENTACION.md` - Links in index

**Docs:**
- **Completo:** [`spec/backend/tipos_bolsas.md`](spec/backend/tipos_bolsas.md)
- **Índice:** [`spec/DOCUMENTACION.md`](spec/DOCUMENTACION.md)

**Referencia Rápida:**
```
BOLSA_107 (BOLSA_107 - Importación de pacientes masiva)
BOLSA_DENGUE (Bolsa Dengue - Control epidemiológico)
BOLSAS_ENFERMERIA (Bolsas Enfermería - Atenciones de enfermería)
BOLSAS_EXPLOTADATOS (Bolsas Explotación de Datos - Análisis y reportes)
BOLSAS_IVR (Bolsas IVR - Sistema interactivo de respuesta de voz)
BOLSAS_REPROGRAMACION (Bolsas Reprogramación - Citas reprogramadas)
BOLSA_GESTORES_TERRITORIAL (Bolsa Gestores Territorial - Gestión territorial)
```

**Frontend Impact:**
- FilaSolicitud.jsx: Muestra `solicitud.descBolsa` (descripción operacional)
- Solicitudes.jsx: Mapea `desc_tipo_bolsa` a `descBolsa` field
- MisPacientes.jsx: Acceso a información de origen de bolsa del paciente

---

### v1.48.9 - Completado (2026-02-06) 📋 ATENDER PACIENTE - SCHEMA ALMACENAMIENTO
✅ **Schema de Tablas Completo** - Dónde se guardan datos de Atendido, Recita, Interconsulta, Crónico
✅ **4 Operaciones Médicas** - Mapeo exacto de cada acción a su tabla de BD
✅ **Validaciones Condicionales** - Lógica de validación para campos opcionales
✅ **Flujo Backend Completo** - AtenderPacienteService.java con todas las operaciones
✅ **Relaciones y Constraints** - Foreign keys, UNIQUE constraints, sincronización automática
✅ **Ejemplos SQL** - Queries reales para verificar datos en BD

**Features:**
- `dim_solicitud_bolsa` + `solicitud_cita` para estado ATENDIDO (con sincronización v1.44.0+)
- `receta` tabla para Recita (con dias_seguimiento)
- `interconsulta` tabla para Interconsulta (con especialidad_referida)
- `asegurado_enfermedad_cronica` para Crónico (con tipo_enfermedad + descripcion_otra)
- Diagrama visual de flujo de datos y relaciones entre tablas
- Validación de datos: al menos 1 acción obligatoria + campos condicionales requeridos
- DTO `AtenderPacienteRequest` completo con toda la documentación
- Ejemplos SQL: obtener pacientes, contar acciones, verificar duplicados

**Cambios:**
- Nuevo archivo: `spec/backend/16_atender_paciente_storage.md` (400+ líneas)
- Actualizado: `CLAUDE.md` - Added v1.48.9 reference
- Actualizado: `spec/INDEX.md` - Added to backend docs list

**Docs:**
- **Completo:** [`spec/backend/16_atender_paciente_storage.md`](spec/backend/16_atender_paciente_storage.md)
- **Padre:** [`spec/backend/15_recita_interconsulta_v1.47.md`](spec/backend/15_recita_interconsulta_v1.47.md)
- **Sincronización:** [`spec/backend/14_sincronizacion_atendido/README.md`](spec/backend/14_sincronizacion_atendido/README.md)

**SQL Reference:**
- Actualizar ATENDIDO: `UPDATE dim_solicitud_bolsa SET estado='ATENDIDO'...`
- Crear Recita: `INSERT INTO receta (id_solicitud_cita, dni_paciente, dias_seguimiento)...`
- Crear Interconsulta: `INSERT INTO interconsulta (id_solicitud_cita, especialidad_referida)...`
- Registrar Crónico: `INSERT INTO asegurado_enfermedad_cronica (pk_asegurado, tipo_enfermedad)...`

**Relaciones:**
- `dim_solicitud_bolsa` ↔ `solicitud_cita` (sincronización automática)
- `solicitud_cita` → `receta` (1:N - una cita, muchas recitas)
- `solicitud_cita` → `interconsulta` (1:N - una cita, muchas interconsultas)
- `asegurados` → `asegurado_enfermedad_cronica` (1:N - paciente, muchas enfermedades)

---

### v1.49.0 - Completado (2026-02-06) 🔍 FILTROS AVANZADOS EN MIS PACIENTES
✅ **Filtro por IPRESS** - Médicos ven solo pacientes de su sede física actual
✅ **Filtros de Tiempo** - Hoy, Ayer, Últimos 7 días + Rango personalizado
✅ **Ordenamiento Cronológico** - Más recientes primero o más antiguos primero
✅ **3-Row Filter UI** - Layout profesional responsive con 3 filas de filtros
✅ **Smart IPRESS Loading** - API-first con fallback a datos de pacientes cargados
✅ **Combined Filtering** - Todos los filtros funcionan en conjunto (búsqueda + condición + IPRESS + fecha + orden)
✅ **Optimized Rendering** - React.useMemo para evitar re-renders innecesarios

**Features:**
- IPRESS dropdown carga desde `/ipress/activas` endpoint
- 5 opciones de rango de fecha: Todas, Hoy, Ayer, Últimos 7 días, Personalizado
- Date pickers aparecen condicionalmente cuando selecciona "Personalizado"
- Ordenamiento: "Más recientes primero" (DESC) o "Más antiguos primero" (ASC)
- Botón "Limpiar todos los filtros" auto-oculto cuando no hay filtros activos
- Soporte completo para ISO 8601 (Z y offset timezone)

**Cambios:**
- Frontend: MisPacientes.jsx - 6 nuevos estados + useEffect para IPRESS + filtrado de 5 niveles
- Imports: Calendar icon + ipressService
- UI: Reemplazó sección de filtros con layout de 3 filas responsive

**Docs:**
- Implementación Plan: Filtros Avanzados en MisPacientes.jsx ✅ COMPLETO
- Changelog: [`checklist/01_Historial/01_changelog.md#v1490-2026-02-06`](checklist/01_Historial/01_changelog.md)

**Testing Results:**
✅ IPRESS filter dropdown funciona
✅ Date range filters (Hoy, Ayer, 7 días) filtra correctamente
✅ Custom date range con "Desde" y "Hasta" funciona
✅ Ordenamiento cronológico (reciente/antiguo) ordena correctamente
✅ Filtros combinados trabajan en conjunto sin conflictos
✅ Botón limpiar aparece cuando hay filtros activos
✅ Responsive en móvil (1 columna) y desktop (2-3 columnas)

**Commit:** 7c9ee26

---

### v1.45.3 - Completado (2026-02-05) 📥 MULTI-SELECT PDF BATCH DOWNLOAD
✅ **Descarga Múltiple de PDFs** - Seleccionar y descargar diagnósticos en ZIP
✅ **Checkboxes en Tabla** - Seleccionar individual o todos los registros
✅ **Batch ZIP Download** - Nuevo endpoint `POST /descargar-zip` (máx. 50 PDFs)
✅ **Error Handling Robusto** - Si 1 PDF falla, los demás se incluyen
✅ **UI/UX Completo** - Action bar + contador + botón con spinner + toasts

**Cambios Backend:**
- `DescargarZipRequest` DTO (Jakarta validation @Size(max=50))
- `FirmaDigitalService.generarZipPdfs()` method
- `FirmaDigitalServiceImpl` - ZIP creation with ByteArrayOutputStream
- `FormDiagController` POST endpoint `/descargar-zip`

**Cambios Frontend:**
- `DiagnosticoIpress.jsx` - Multi-select state + toggle functions
- Checkbox column en tabla con "select all" header
- Action bar azul mostrando selected count + "Limpiar selección"
- Botón verde "Descargar Seleccionados" con loading spinner
- Toast notifications para feedback

**Docs:**
- **Plan:** [`/Users/styp/.claude/plans/inherited-cooking-puddle.md`](../../.claude/plans/inherited-cooking-puddle.md)
- **Commit:** c1acbed (311 insertions)

**Build:** ✅ Backend SUCCESS + ✅ Frontend SUCCESS

---

### v1.47.2 - Completado (2026-02-06) 📋 RECITA + INTERCONSULTA + CRÓNICO
✅ **Registro de Atención Médica Completo** - Médico marca paciente "Atendido" con seguimiento automático
✅ **Crear Recita** - Solicitud de seguimiento en días específicos (7, 14, 30 días)
✅ **Crear Interconsulta** - Referencia automática a especialista diferente
✅ **Enfermedades Crónicas** - Registro de condiciones crónicas del paciente
✅ **Duplicado Validation** - Prevenir Recitas duplicadas y múltiples interconsultas por especialidad
✅ **Especialidad Correcta** - Recita usa especialidad del médico (no la de interconsulta)
✅ **FechaAtencion Registrada** - Fecha de atención se guarda automáticamente (UTC-5 Peru)

**Features:**
- Modal en MisPacientes con 4 campos: Condición, ¿Tiene Recita? (días), ¿Tiene Interconsulta? (especialidad), ¿Es Crónico? (enfermedades)
- Atender automáticamente crea hasta 3 nuevas solicitudes: RECITA + INTERCONSULTA + CRÓNICO
- Bolsas creadas: ID 11 (BOLSA_GENERADA_X_PROFESIONAL) para Recita/Interconsulta
- Ambas se asignan a la coordinadora responsable (aparecen en su bandeja)
- Fecha preferida calculada: hoy + días especificados
- Transacción atómica: all-or-nothing (todo se crea o nada)

**Cambios Backend:**
- `AtenderPacienteService.java` - Método principal atenderPaciente() con 5 validaciones
- `crearBolsaRecita()` - Usa especialidad original del médico, NO la de interconsulta
- `crearBolsaInterconsulta()` - Usa especialidad seleccionada por médico
- `existeRecitaParaPaciente()` - Valida que no haya Recita previa
- `existeInterconsultaParaPaciente(especialidad)` - Valida por especialidad
- **Enfermedades Crónicas** - Se guardan directamente en tabla `asegurados` (String[] → PostgreSQL text[])
- FechaAtencion: Guardada como LocalDate (UTC-5 Peru timezone)

**🔧 Fix v1.47.2 - Persistencia de Enfermedades Crónicas (2026-02-06):**
- **Problema:** Array de enfermedades no se guardaba en BD (enfermedad_cronica column vacío)
- **Causa:** `@JdbcType(ArrayJdbcType.class)` incompatible con Hibernate 6 + Jakarta Persistence
- **Solución:** Remover anotación compleja, usar `@Column(columnDefinition = "text[]")`
- **Cambios:**
  * `Asegurado.java` - Mapeo correcto de `String[] enfermedadCronica`
  * `AtenderPacienteService.java` - Agregar `EntityManager.flush()` para persistencia inmediata
  * `GestionPacienteController.java` - Logging de request para debugging
- **Testing:** ✅ {Hipertensión,Diabetes}, {Diabetes} - Ambos casos funcionan

**Cambios Frontend:**
- Modal "Atendido" con 4 secciones: Condición, Recita toggle + días, Interconsulta toggle + especialidad, Crónico toggle + multiselect enfermedades
- Validaciones de negocio en frontend (días 1-365, especialidades válidas)
- Toast feedback: éxito, duplicado, error

**Database:**
- Tabla: `dim_solicitud_bolsa` - Ambas bolsas (RECITA, INTERCONSULTA) creadas aquí
- UNIQUE constraint: (id_bolsa, paciente_id, id_servicio) - Se evita con idServicio=NULL
- Índice: `idx_solicitud_bolsa_paciente_dni_activo` - Búsqueda rápida de pacientes
- Campo: `fecha_preferida_no_atendida` - Calculado como LocalDate (hoy + días)
- Campo: `fecha_atencion` - Registrada automáticamente cuando se marca Atendido

**Docs:**
- **Completo:** [`spec/backend/15_recita_interconsulta_v1.47.md`](spec/backend/15_recita_interconsulta_v1.47.md) (400+ líneas)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#v1472-2026-02-06`](checklist/01_Historial/01_changelog.md)
- **Test Cases:** 10/10 PASS - Flujo completo médico → coordinador → bandeja

**Testing Results:**
✅ Médico marca paciente como Atendido
✅ Sistema crea automáticamente RECITA (7 días)
✅ Sistema crea automáticamente INTERCONSULTA (especialidad seleccionada)
✅ Enfermedades crónicas se guardan correctamente
✅ Coordinador ve todas las 3 solicitudes en su bandeja
✅ Recita muestra especialidad del médico (MEDICINA GENERAL)
✅ Interconsulta muestra especialidad seleccionada (Cardiología)
✅ FechaAtencion se registra correctamente
✅ Duplicados rechazados con mensaje amigable
✅ Transacción atómica: si falla 1 paso, se revierte todo

**Stack:**
- Backend: `AtenderPacienteService.atenderPaciente()` transactional method
- Database: Bolsa ID 11 (BOLSA_GENERADA_X_PROFESIONAL) + idServicio NULL
- Security: @CheckMBACPermission para /roles/medico/pacientes (editar)
- Auditoría: Cada atención registrada en audit_logs

**Commit:** Múltiples (últimos 5 commits resuelven constraint violations + especialidad + fecha atencion)

---

### v1.45.2 - Completado (2026-02-05) 🏥 IPRESS NAMES + TABLE LAYOUT
✅ **Display IPRESS Institution Names** - Muestra "CAP II LURIN" en lugar de código "450"
✅ **API Data Enrichment** - Backend convierte códigos a nombres antes de enviar
✅ **Verification Tested** - API endpoint confirmado devolviendo nombres correctos
✅ **Frontend Display** - Tabla actualiza después de click en botón "Actualizar"

**Features:**
- IPRESS names from database lookup (IpressRepository.findByCodIpress())
- Centralized conversion in `bolsaToGestionDTO()` method
- Better UX: usuarios ven nombres amigables en lugar de códigos técnicos
- Backwards compatible: usa mismo método obtenerNombreIpress()

**Cambios:**
- Backend: GestionPacienteServiceImpl.java line 382 - Call obtenerNombreIpress()
- API Response: `"ipress": "CAP II LURIN"` (antes: `"ipress": "450"`)
- Frontend: MisPacientes.jsx recibe y muestra directamente los nombres

**Docs:**
- ⭐ Frontend Spec: [`spec/frontend/15_mis_pacientes_medico.md`](spec/frontend/15_mis_pacientes_medico.md) ✅ COMPLETO
- Changelog: [`checklist/01_Historial/01_changelog.md#v1452-2026-02-05`](checklist/01_Historial/01_changelog.md)

**Verification:**
```bash
# Test API endpoint
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8080/api/gestion-pacientes/medico/asignados | jq '.[] | .ipress'
# Output: "CAP II LURIN" ✅
```

**Screenshots:**
- ✅ Patient 1: IPRESS = CAP II LURIN
- ✅ Patient 2: IPRESS = CAP II LURIN

---

### v1.45.1 - Completado (2026-02-05) 👨‍⚕️ MIS PACIENTES COMPLETE + 3 ACTIONS
✅ **Complete Patient Workflow** - Tabla de pacientes asignados + 3 acciones médicas
✅ **Table Layout** - Reemplaza card layout con tabla profesional
✅ **Three Medical Actions** - Marcar Atendido, Generar Receta, Generar Interconsulta
✅ **Assignment Date** - Columna nueva "Fecha Asignación" desde dim_solicitud_bolsa
✅ **Action Modals** - Modal system con notas/diagnóstico por acción
✅ **Live Statistics** - Dashboard actualiza: Total, Filtrados, Atendidos

**Features:**
- Tabla con 7 columnas: DNI, Paciente, Teléfono, IPRESS, Condición, Fecha Asignación, Acciones
- 3 botones de acción por paciente (verde, azul, morado)
- Modal for each action (notes field + confirm/cancel)
- Real-time stats update después de actions
- Busca y filtro por condición
- Toast notifications para feedback

**Cambios:**
- Frontend: MisPacientes.jsx completa redesign (card → table)
- Backend: GestionPacienteDTO.java + fechaAsignacion field
- Service: bolsaToGestionDTO() nuevo método (v1.45.1)
- Date formatting: ISO 8601 con timezone parsing

**Docs:**
- ⭐ Frontend Spec: [`spec/frontend/15_mis_pacientes_medico.md`](spec/frontend/15_mis_pacientes_medico.md) ✅ COMPLETO
- Changelog: [`checklist/01_Historial/01_changelog.md#v1451-2026-02-05`](checklist/01_Historial/01_changelog.md)

**Live Testing Results:**
- ✅ Patient assignment visible in table
- ✅ Actions modal opens correctly
- ✅ Statistics update after actions
- ✅ Both patients show in list

---

### v1.44.0 - Completado (2026-02-05) ⚡ BATCH OPTIMIZATION + 📊 METRICS + 🔄 AUTO-SYNC
✅ **Sincronización Automática ATENDIDO** - Cuando médico marca cita ATENDIDO, sincroniza auto a dim_solicitud_bolsa
✅ **Batch Optimization** - Reduce BD roundtrips: N → 1 (50-90% mejora según cantidad bolsas)
✅ **Micrometer Metrics** - 4 counters + 1 timer + 1 gauge, Prometheus ready
✅ **Comprehensive Tests** - 7 unit tests (100% coverage: happy + error paths + batch scenarios)
✅ **Architectural Fixes** - AuditLogService, EstadosCitaConstants, 3-tier exception handling

**Features:**
- Sincronización automática: médico NO hace nada extra
- Tolerancia a fallos: si falla sync, NO falla la atención médica (world fact)
- Performance: 50% menos BD calls para 2 bolsas, 80% para 5+
- Single transaction: all-or-nothing (batch saveAll)
- Monitoring: Prometheus metrics + auditoría centralizada

**Docs:**
- **Completo:** [`spec/backend/14_sincronizacion_atendido/README.md`](spec/backend/14_sincronizacion_atendido/README.md)
- **Changelog:** [`checklist/01_Historial/SINCRONIZACION_v1.43.0-44.0.md`](checklist/01_Historial/SINCRONIZACION_v1.43.0-44.0.md) (crear)

**Stack:**
- Backend: SincronizacionBolsaService (auto-sync hook)
- Database: Index `idx_solicitud_bolsa_paciente_dni_activo` ✅
- Tests: 7/7 PASS (batch saveAll validated)
- Metrics: 6 Prometheus metrics available at `/actuator/prometheus`

**Commits:** 5 total (825bfbb + 2b106ac + 9b5ab0d + 371740c + 20d43ba)

### v1.42.2 - Completado (2026-02-05) 🔍 FIX AUDITORÍA + 🎨 STYLING EMAILS
✅ **Vista Auditoría Restaurada** - Crear `vw_auditoria_modular_detallada` en PostgreSQL
✅ **Página /admin/logs** - Ahora carga sin errores "relation does not exist"
✅ **EmailAuditLogs Styling** - Tema claro (blanco/azul) matching CENATE UI
✅ **Índices Optimizados** - 8 índices creados (fecha, usuario, módulo, acción, nivel, estado)

**Cambios:**
- Ejecutar: `spec/sh/001_audit_view_and_indexes.sql` en PostgreSQL
- Frontend: EmailAuditLogs.jsx con tema profesional blanco

**Docs:** [`checklist/01_Historial/01_changelog.md#v1422-2026-02-05`](checklist/01_Historial/01_changelog.md)

### v1.42.1 - Completado (2026-02-04) 📧 EMAIL AUDIT LOG SYSTEM
✅ **Sistema Auditoría Correos** - Backend + Frontend completo
✅ **API Endpoints** - 6 endpoints para auditoría (/fallidos, /resumen, /estadisticas, /destinatario, /usuario/{id}, /errores-conexion)
✅ **Correo Bienvenida Integrado** - Auditoría automática de todos los correos
✅ **Dashboard EmailAuditLogs** - Visualización de logs, filtros avanzados, estadísticas

**Cambios:**
- Entity: `EmailAuditLog.java` + Repository + Service
- Controller: `EmailAuditLogController.java` (6 endpoints protegidos)
- Frontend: `EmailAuditLogs.jsx` (componente con 3 tabs + filtros)
- Integración automática en `EmailService.java`

**Docs:** [`checklist/01_Historial/01_changelog.md#v1421-2026-02-04`](checklist/01_Historial/01_changelog.md)

### v1.42.0 - Completado (2026-02-01) 🏗️ ARQUITECTURA NUEVA + FILTROS
✅ **Arquitectura Bolsas 2 Niveles** - Universo General + Mini-Bolsas Especializadas
✅ **Mini-Bolsa Módulo 107** - Interfaz dedicada con KPIs, campos y permisos propios
✅ **Mini-Bolsa Dengue** - Sistema de búsqueda DNI/CIE-10 independiente
✅ **Escalabilidad** - Plantilla lista para futuras bolsas (PADOMI, etc.)
✅ **Consolidación** - Todas las mini-bolsas convergen en universo general
✅ **Filtro Especialidades Dinámico** - Endpoint dedicado + 9 especialidades disponibles + opción "S/E"

**Docs:**
- **Índice:** [`spec/backend/09_modules_bolsas/README.md`](spec/backend/09_modules_bolsas/README.md)
- **Técnico:** [`spec/backend/09_modules_bolsas/FILTRO_ESPECIALIDADES_v1.42.0.md`](spec/backend/09_modules_bolsas/FILTRO_ESPECIALIDADES_v1.42.0.md)
- **Changelog:** [`checklist/01_Historial/BOLSAS_FILTRO_ESPECIALIDADES_v1.42.0.md`](checklist/01_Historial/BOLSAS_FILTRO_ESPECIALIDADES_v1.42.0.md)
- **Arquitectura:** [`spec/backend/09_modules_bolsas/ARQUITECTURA_v1.42.0.md`](spec/backend/09_modules_bolsas/ARQUITECTURA_v1.42.0.md)

### v1.41.0 - Completado (2026-01-30) 📋
✅ **Módulo Gestión de Citas** - Dropdown de 11 estados + Modal Actualizar Teléfono
✅ **Entidad DimEstadosGestionCitas** - Mapeo JPA de tabla de estados
✅ **3 Nuevos Endpoints** - Estados, teléfono, y listado de pacientes asignados
✅ **4 Bugs Corregidos** - Token, autorización, parámetros, mapeo código→ID

**Docs:** [`spec/frontend/12_modulo_gestion_citas.md`](spec/frontend/12_modulo_gestion_citas.md) | [`spec/backend/13_gestion_citas_endpoints.md`](spec/backend/13_gestion_citas_endpoints.md) | [`checklist/01_Historial/GESTION_CITAS_v1.41.0.md`](checklist/01_Historial/GESTION_CITAS_v1.41.0.md)

### v1.39.3 - Completado (2026-01-30) ⏱️
✅ **Fix Timeouts SMTP** - Aumentar timeouts de 15s a 30s para conexiones lentas
✅ **Correo Bienvenida** - Ahora funciona correctamente al crear usuarios nuevos
✅ **Servidor EsSalud** - Tolerancia a latencia alta en 172.20.0.227

**Docs:** [`spec/backend/11_email_smtp/`](spec/backend/11_email_smtp/)

### v1.39.2 - Completado (2026-01-30) 🗑️
✅ **Fix Eliminación Usuarios** - Nombres de tablas de tokens incorrectos en `deleteUser()`
✅ **Tabla Corregida** - `password_reset_tokens` → `segu_password_reset_tokens`
✅ **Tabla Corregida** - `solicitud_contrasena` → `solicitud_contrasena_temporal`

**Docs:** [`checklist/01_Historial/01_changelog.md`](checklist/01_Historial/01_changelog.md)

### v1.39.1 - Completado (2026-01-30) 🔧
✅ **Fix Correo Bienvenida** - Sincronización relaciones JPA para envío de correos
✅ **Usuarios Externos** - Creación de PersonalExterno desde panel admin
✅ **Reset Contraseña** - Nuevo método `findByIdWithFullDetails()` con FETCH JOIN

**Docs:** [`spec/backend/11_email_smtp/`](spec/backend/11_email_smtp/)

### v1.39.0 - Completado (2026-01-30) 🎉
✅ **Módulo Correo SMTP** v1.0.0 - Relay Postfix integrado en Docker Compose + Aviso red EsSalud
✅ **Configuración DMARC** - Correos enviados via servidor oficial EsSalud (172.20.0.227)
✅ **Documentación** - Nueva guía de correo en spec/backend/11_email_smtp/

**Docs:** [`spec/backend/11_email_smtp/`](spec/backend/11_email_smtp/)

### v1.37.5 - Completado (2026-01-30) 🔐
✅ **Fix Autorización Coordinador** - Mismatch rol COORD. GESTION CITAS en @PreAuthorize
✅ **Historial de Bolsas** - Coordinador ahora accede sin Access Denied

**Docs:** [`checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md`](checklist/01_Historial/FIXAUTORIZACION_COORDINADOR.md)

### v1.38.0 - Completado (2026-01-29)
✅ **Módulo Bolsas** v3.0.0 - Módulo 107 completamente integrado + Postman collection
✅ **Módulo 107** v3.0.0 - Búsqueda + Estadísticas + MBAC + DTOs

**Docs:** [`spec/backend/09_modules_bolsas/`](spec/backend/09_modules_bolsas/) | [`spec/coleccion-postman/`](spec/coleccion-postman/)

---

## 🛠️ Stack Tecnológico

```
Backend:        Spring Boot 3.5.6 + Java 17
Frontend:       React 19 + TailwindCSS 3.4.18
Database:       PostgreSQL 14+ (10.0.89.241:5432)
Seguridad:      JWT + MBAC (Role-Based Access Control)
Email:          Postfix Relay → SMTP EsSalud (172.20.0.227)
```

---

## 📝 Configuración Rápida

```bash
# Backend
cd backend && ./gradlew bootRun

# Frontend
cd frontend && npm start

# Database
PGPASSWORD=Essalud2025 psql -h 10.0.89.241 -U postgres -d maestro_cenate
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

### Fase 1: Arquitectura de Bolsas v1.42.0 (COMPLETADA)
1. **Universo General** - ✅ `/bolsas/solicitudes` (7,973 registros) + Filtro Especialidades dinámico
2. **Mini-Bolsa Módulo 107** - ✅ Interfaz dedicada con KPIs propios
3. **Mini-Bolsa Dengue** - ✅ Sistema de búsqueda DNI/CIE-10 independiente
4. **Template Escalable** - ✅ Patrón documentado para futuras bolsas

### Fase 2: Nuevas Bolsas Especializadas (Futuro)
- **PADOMI** - Bolsa para atención domiciliaria
- **Referencia INTER** - Bolsa de referencias entre instituciones
- **Consulta Externa** - Bolsa de consultas generales
- (Cada una seguirá el patrón definido en v1.42.0)

### Fase 3: Integraciones Avanzadas
- **Spring AI Chatbot** - Asistente de atención (7 fases)
- **Analytics Dashboard** - Dashboard consolidado de todas las bolsas
- **Notificaciones Inteligentes** - Alertas por bolsa y rol

Ver: [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/)

---

## 📞 Contacto

**Desarrollado por:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Versión:** v1.42.0 (2026-02-01)

---

**¡Bienvenido a CENATE! 🏥**
