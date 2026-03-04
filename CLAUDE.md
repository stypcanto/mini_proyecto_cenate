# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.83.5 (2026-03-03) 🚀
> **Última Feature:** v1.83.5 - Fix constraint unique bolsas: incluir especialidad en clave única (V6_25_0) ✅ (2026-03-03)
> **Última Feature Base:** v1.82.x - Refactor arquitectura IPRESS: id_ipress + id_ipress_atencion como única fuente de verdad ✅ (2026-03-03)
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

## 🏥 ARQUITECTURA IPRESS — Fuente de Verdad (v1.82.x)

**⭐ Documento Maestro:** [`spec/database/15_arquitectura_ipress_refactor.md`](spec/database/15_arquitectura_ipress_refactor.md)

### ⚠️ REGLA CRÍTICA — Solo usar FKs

`dim_solicitud_bolsa` tiene **2 FKs** como única fuente de verdad para IPRESS:

```
id_ipress          BIGINT FK → dim_ipress  ← IPRESS adscripción (origen del paciente)
id_ipress_atencion BIGINT FK → dim_ipress  ← IPRESS atención (donde se atiende)
```

**NUNCA leer estas columnas obsoletas** (existen solo para backup hasta autorización de drop):
- ~~`codigo_adscripcion`~~ — deprecated, sync automático vía trigger bidireccional
- ~~`codigo_ipress`~~ — deprecated, duplicado exacto de `codigo_adscripcion`

### JOIN correcto en queries

```sql
LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress          -- adscripción
LEFT JOIN dim_ipress di2 ON sb.id_ipress_atencion = di2.id_ipress -- atención
```

### Trigger activo en BD

`trg_sync_ipress_bidireccional` (función `fn_sync_ipress_bidireccional`) mantiene `codigo_adscripcion` y `codigo_ipress` en sync automáticamente como backup.

### Migraciones ejecutadas

| Migración | Descripción |
|-----------|-------------|
| `V6_22_0` | Backfill `id_ipress`: LPAD normalización + resolución directa + vía asegurados (736 registros) |
| `V6_23_0` | Trigger unidireccional: `id_ipress` → texto (reemplazado) |
| `V6_24_0` | Trigger bidireccional: `id_ipress ↔ codigo_adscripcion` |

### Fase B (pendiente backup)

```sql
ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_adscripcion;
ALTER TABLE dim_solicitud_bolsa DROP COLUMN codigo_ipress;
```

---

## 📋 MÓDULO DE REQUERIMIENTO DE ESPECIALIDADES (v1.58.0)

**⭐ Documento Maestro:** [`spec/backend/12_modulo_requerimientos_especialidades.md`](spec/backend/12_modulo_requerimientos_especialidades.md)

### 🎯 Descripción
Nuevo módulo completo para gestionar solicitudes de especialidades médicas de las IPRESS.

### 📍 Ubicaciones
- **Coordinador:** `/roles/coordinador/gestion-periodos`
  - Crear, editar, enviar, aprobar y rechazar solicitudes
  - Ver detalles completos con modal profesional
  - Filtros dinámicos en cascada
  - Exportación a Excel

- **Gestión Territorial:** `/roles/gestionterritorial/respuestas-solicitudes`
  - Vista read-only de solicitudes
  - Ver detalles sin permisos de edición
  - Acceso controlado por MBAC

### ✨ Nuevas Funcionalidades (v1.58.0)
- ✅ Modal "Ver Detalle" con información completa de solicitud
- ✅ Vista read-only para Gestión Territorial
- ✅ Filtros dinámicos con cascada (Macrorregión → Red → IPRESS)
- ✅ Columnas Macrorregión y Red pobladas desde BD
- ✅ Exportación a Excel mejorada (12 columnas)
- ✅ Registro en MBAC para control de acceso
- ✅ Botón cerrar (X) con diseño profesional
- ✅ Tooltips informativos
- ✅ Limpieza de datos de prueba

### 📊 Datos
- **Tablas principales:** `solicitud_turno_ipress`, `detalle_solicitud_turno`
- **Períodos:** `periodo_solicitud_turno`
- **Ubicación:** `dim_personal_cnt`, `dim_ipress`, `dim_red`
- **Estados:** BORRADOR, ENVIADO, INICIADO

### 🔐 Acceso (MBAC)
- **Coordinador:** Acceso completo (crear, editar, aprobar, rechazar)
- **Gestión Territorial:** Lectura (ver solicitudes y detalles)
- **Administrador:** Control de períodos y configuración

---

## 🏥 MÓDULO CENACRON — Gestión de Pacientes Crónicos

**⭐ Documento Maestro:** [`spec/modules/cenacron/README.md`](spec/modules/cenacron/README.md)

### 🎯 Descripción
Estrategia Nacional de Gestión de Pacientes Crónicos (HTA, Diabetes, EPOC, Asma, Insuficiencia Cardíaca, ERC).
Flujo multidisciplinario con 4 visitas anuales por paciente (ciclos de 3 meses).

### ✅ Funcionalidades Operativas
- **Inscripción al programa** — Gestor de Citas desde `/roles/citas/gestion-asegurado` (botón `♾ CENACRON` en drawer)
- **Dar de baja** — Médico/Enfermería desde sus bandejas (estado → `INACTIVO` o `COMPLETADO`)
- **Badge CENACRON** — Visible en todas las bandejas de profesionales
- **Historial de bajas** — `/asegurados/bajas-cenacron` con auditoría completa (quién, cuándo, motivo)

### 👥 Actores
- **Gestor de Citas** — Inscripción al programa (`POST /api/paciente-estrategia`)
- **Médico General** — Dar de baja (`PUT /api/paciente-estrategia/baja-cenacron/{dni}`)
- **Enfermería** — Visible badge CENACRON, baja pendiente de implementar plenamente

### 📊 Datos Reales (BD)
- **Tabla inscripciones:** `paciente_estrategia` (estados: ACTIVO | INACTIVO | COMPLETADO)
- **Catálogo estrategias:** `dim_estrategia_institucional` (sigla='CENACRON')
- **Auditoría baja:** columna `id_usuario_desvinculo` + `fecha_desvinculacion` + `observacion_desvinculacion`
- **Vistas:** `vw_paciente_estrategias_activas`, `vw_historial_estrategias_paciente`

### 📋 Fases de Implementación
| Fase | Alcance | Estado |
|------|---------|--------|
| **Inscripción** | Gestor de Citas: Admisión al programa | ✅ Operativo |
| **Baja** | Médico/Enfermería: Dar de baja con motivo | ✅ Operativo |
| **Historial bajas** | Página auditoría completa de bajas | ✅ Operativo (v1.66.x) |
| **Validación médico** | Médico: Confirmar elegibilidad CENACRON | 📋 Pendiente |
| **Seguimiento enfermería** | Semáforo SLA + registro atenciones | 📋 Parcial |
| **Ciclos recurrentes** | Nutrición + Psicología + reingreso 3 meses | 📋 Pendiente |

### 🔐 Acceso (MBAC)
- **Gestor de Citas:** Inscripción de pacientes
- **Médico / Enfermería:** Dar de baja, ver badge CENACRON
- **Todos los roles:** Ver historial de bajas en `/asegurados/bajas-cenacron` (solo lectura + exportar)

---

## � MÓDULO GESTIÓN DE PERÍODOS DE DISPONIBILIDAD (v1.64.0)

**⭐ Documento Maestro:** [`docs/periodo-medico/README.md`](docs/periodo-medico/README.md)

### 🎯 Descripción
Módulo para gestionar los períodos durante los cuales los médicos registran su disponibilidad horaria.

### 📍 Ubicación
- **Coordinador:** `/roles/coordinador/periodo-disponibilidad-medica`

### ✨ Nuevas Funcionalidades (v1.64.0)
- ✅ **Filtro Estado:** Abierto, En Validación, Cerrado, Reabierto
- ✅ **Filtro Área:** 3 servicios SGDT (Medicina General, Tele Apoyo, Medicina Especializada)
- ✅ **Filtro Propietario:** Todos / Solo mis períodos (basado en `user.id`)
- ✅ **Filtro Año:** Dinámico
- ✅ **Columnas:** Periodo, Área, Creado por, Fecha Inicio/Fin, Fecha Registro/Actualización, Estado
- ✅ **Fix fechas:** Corrección zona horaria para fechas ISO

### 📊 Datos
- **Tabla principal:** `ctr_periodo` (PK compuesta: `periodo`, `id_area`)
- **Relaciones:** `dim_area`, `dim_usuarios`, `dim_personal_cnt`
- **Estados:** ABIERTO, EN_VALIDACION, CERRADO, REABIERTO

### 🔐 Acceso (MBAC)
- **Coordinador:** Crear, editar, cerrar, eliminar períodos

---

## �📚 DOCUMENTACIÓN - START HERE

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
| **📋 Requerimientos Especialidades** | [`spec/backend/12_modulo_requerimientos_especialidades.md`](spec/backend/12_modulo_requerimientos_especialidades.md) |
| **📦 Gestión Bolsas** | [`spec/backend/tipos_bolsas.md`](spec/backend/tipos_bolsas.md) |
| **🔍 QA/Support** | [`spec/troubleshooting/README.md`](spec/troubleshooting/README.md) |
| **🔐 Security** | [`plan/01_Seguridad_Auditoria/`](plan/01_Seguridad_Auditoria/) |
| **🤖 AI/Spring AI** | [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/) |
| **🏥 CENACRON** | [`spec/modules/cenacron/README.md`](spec/modules/cenacron/README.md) |

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
| **spec/modules/** | Módulos funcionales (CENACRON, Bolsas, TeleECG, Trazabilidad) |

---

---

## 📖 VERSIONES Y CHANGELOG

**👉 Ver historial completo:** [`CHANGELOG-VERSIONES.md`](CHANGELOG-VERSIONES.md)

Versiones recientes:
- **v1.83.5** - Fix constraint `ux_solicitud_paciente_servicio_otras_bolsas`: incluir `especialidad` en clave única — Flyway V6_25_0 ✅ (2026-03-03) 🆕
- **v1.82.x** - Refactor arquitectura IPRESS: id_ipress + id_ipress_atencion como única fuente de verdad — V6_22_0/23_0/24_0 + 13 queries + 4 service methods ✅ (2026-03-03)
- **v1.82.6** - Trazabilidad completa (quién ejecuta cada acción) + badge CENACRON en citas + fix auditoría anulación ✅ (2026-03-02)
- **v1.82.5** - IPRESS muestra nombre en lugar de código numérico ✅ (2026-03-02)
- **v1.82.4** - IPRESS ATENCIÓN corregida en panel citas agendadas ✅ (2026-03-02)
- **v1.82.3** - Flyway V6_10_0: normalizar especialidades con paréntesis ✅ (2026-03-02)
- **v1.82.2** - Normalizar `condicion_medica` y `estado_bolsa` en BD y frontend ✅ (2026-03-02)
- **v1.82.1** - Fix FK violation al enviar ticket a Bolsa de Reprogramación ✅ (2026-03-02)
- **v1.81.x** - Trazabilidad del ciclo de vida (dim_historial_cambios_solicitud) ✅ (2026-02-28)
- **v1.78.x** - Bolsa Reprogramación + HistorialPacienteBtn en todos los módulos ✅ (2026-02-27)
- **v1.66.x** - Bajas CENACRON: página auditoría + fix tabla `dim_estrategia_institucional` ✅ (2026-02-24)

Para ver detalles de cada versión, abre: [`CHANGELOG-VERSIONES.md`](CHANGELOG-VERSIONES.md)

---


---


## 🚀 Próximos Pasos

### CENACRON — Funcionalidades pendientes
- **Validación médico** — Médico confirma si el paciente cumple criterios CENACRON
- **Semáforo SLA completo** — Enfermería: 🟢<15d | 🟡15-30d | 🔴30-60d | ⚫>60d
- **Registro de atención de enfermería** — Formulario de seguimiento
- **Ciclos recurrentes** — Reingreso automático cada 3 meses post visita completa

### Bolsas — Arquitectura v1.42.0 (COMPLETADA)
1. **Universo General** - ✅ `/bolsas/solicitudes` + Filtro Especialidades dinámico
2. **Mini-Bolsa Módulo 107** - ✅ Interfaz dedicada con KPIs propios
3. **Mini-Bolsa Dengue** - ✅ Sistema de búsqueda DNI/CIE-10 independiente
4. **Template Escalable** - ✅ Patrón documentado para futuras bolsas

### Nuevas Bolsas Especializadas (Futuro)
- **PADOMI** - Bolsa para atención domiciliaria
- **Referencia INTER** - Bolsa de referencias entre instituciones

### Integraciones Avanzadas
- **Spring AI Chatbot** - Asistente de atención (7 fases)
- **Analytics Dashboard** - Dashboard consolidado de todas las bolsas

Ver: [`plan/06_Integracion_Spring_AI/`](plan/06_Integracion_Spring_AI/)

---

## 📞 Contacto

**Desarrollado por:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Versión:** v1.62.0 (2026-02-08)
**Última Actualización:** 2026-02-08 - Notificaciones de Pacientes Pendientes

---

**¡Bienvenido a CENATE! 🏥**
