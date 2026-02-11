# CLAUDE.md - Proyecto CENATE

> **Sistema de Telemedicina - EsSalud Perú**
> **Versión:** v1.63.2 (2026-02-11) 🚀
> **Última Feature:** v1.63.2 - Fix: Pacientes No Visibles en Mis Pacientes ✅ (2026-02-11)
> **Última Feature Base:** v1.62.0 - Notificaciones de Pacientes Pendientes ✅ (2026-02-08)
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
| **📋 Requerimientos Especialidades** | [`spec/backend/12_modulo_requerimientos_especialidades.md`](spec/backend/12_modulo_requerimientos_especialidades.md) |
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

## 📖 VERSIONES Y CHANGELOG

**👉 Ver historial completo:** [`CHANGELOG-VERSIONES.md`](CHANGELOG-VERSIONES.md)

Versiones recientes:
- **v1.62.0** - Notificaciones de Pacientes Pendientes ✅ (2026-02-08) 🆕
- **v1.58.0** - Módulo de Requerimiento de Especialidades ✅ (2026-02-08)
- **v1.57.1** - Exportación de Tabla Especialidades (2026-02-07)
- **v1.56.1** - Filtros Clínicos DNI + Fecha (2026-02-07)
- **v1.56.3** - Género y Edad en Tabla (2026-02-06)
- **v1.54.4** - KPI Cards + Filtros Estado (2026-02-07)

Para ver detalles de cada versión, abre: [`CHANGELOG-VERSIONES.md`](CHANGELOG-VERSIONES.md)

---


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
**Versión:** v1.62.0 (2026-02-08)
**Última Actualización:** 2026-02-08 - Notificaciones de Pacientes Pendientes

---

**¡Bienvenido a CENATE! 🏥**
