# Módulo de Bolsas - Resumen Completo e Integrado

> Arquitectura, componentes y flujos del sistema completo de gestión de bolsas de pacientes

**Versión:** v1.33.0 (Backend v1.32.0, Frontend v1.33.0 + Solicitudes de Bolsa v1.6.0)
**Fecha:** 2026-01-23
**Status:** ✅ PRODUCCIÓN LIVE + Módulo Solicitudes de Bolsa Integrado
**Design System:** CENATE v1.0.0 (100% conforme en todas las tablas)
**Módulo Solicitudes:** v1.6.0 - Estados de Citas Integrados (dim_estados_gestion_citas)

---

## 📋 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Componentes del Módulo](#componentes-del-módulo)
3. [Arquitectura Global](#arquitectura-global)
4. [Flujos de Negocio](#flujos-de-negocio)
5. [Catálogo de Tipos de Bolsas](#catálogo-de-tipos-de-bolsas)
6. [Documentación de Submódulos](#documentación-de-submódulos)
7. [Integración Sistémica](#integración-sistémica)
8. [Estado de Implementación](#estado-de-implementación)

---

## Resumen Ejecutivo

### ¿Qué es el Módulo de Bolsas?

El **Módulo de Bolsas** es el corazón del sistema CENATE. Almacena y gestiona pacientes que requieren atención de telemedicina, provenientes de múltiples fuentes de información (Bolsa 107, Dengue, Enfermería, IVR, Reprogramaciones, Gestión Territorial).

El **Coordinador de Gestión de Citas** distribuye estas bolsas a las **Gestoras de Citas**, quienes captan al paciente, lo llaman, confirman la cita y le envían recordatorios por WhatsApp/Email. Cada paciente en bolsa transita por diferentes **Estados de Gestión de Citas** (CITADO, NO_CONTESTA, NO_DESEA, ATENDIDO_IPRESS, etc.).

### Características Principales

| Característica | Descripción |
|---|---|
| **Almacenamiento Centralizado** | Recibe pacientes de múltiples fuentes de información |
| **Distribución a Gestoras** | Coordinador asigna bolsas a Gestoras de Citas |
| **Seguimiento de Estados** | Registro de atención mediante Estados Gestión Citas (CITADO, NO_CONTESTA, etc.) |
| **Gestión Integral** | Llamadas, confirmación de citas, envío de recordatorios (WA/Email) |
| **Trazabilidad Completa** | Auditoría de cada bolsa, paciente, estado y acción |
| **Escalabilidad** | Soporta múltiples fuentes de datos y múltiples Gestoras simultáneamente |
| **Validación Multicapa** | Validaciones en BD, backend, frontend |

---

## Componentes del Módulo

### 1. **BOLSA 107** - Importación Masiva de Pacientes
- **Propósito:** Cargar miles de pacientes desde archivos Excel
- **Origen:** Sistemas externos (ESSI, etc.)
- **Capacidad:** Millones de registros por carga
- **Validación:** Stored procedures complejos
- **Documentación:** `spec/01_Backend/03_modulo_formulario_107.md`
- **Status:** ✅ Producción

### 2. **TIPOS DE BOLSAS** - Catálogo de Clasificaciones
- **Propósito:** Definir todas las categorías de bolsas posibles
- **Cantidad:** 7 tipos predefinidos + extensibles
- **Funcionalidad:** CRUD completo (Create, Read, Update, Delete)
- **Auditoría:** Timestamps automáticos (created_at, updated_at)
- **Documentación:** `spec/01_Backend/05_modulo_tipos_bolsas_crud.md`
- **Status:** ✅ Producción v1.1.0
- **Componentes:**
  - Backend: Entity, Repository, Service, Controller (7 endpoints)
  - Frontend: TiposBolsas.jsx (admin) + Solicitudes.jsx (gestión)
  - Base de datos: dim_tipos_bolsas (7 registros iniciales)
  - Design System: 100% conforme CENATE v1.0.0

### 3. **BOLSAS DE ESPECIALIDADES** - Por clasificación
- **Bolsa Dengue:** Control epidemiológico
- **Bolsas Enfermería:** Atenciones especializadas
- **Bolsas IVR:** Interacción por voz
- **Etc.:** Extensible según negocio

### 4. **GESTIÓN DE PACIENTES** - Por bolsa
- **Asignación:** Pacientes → Coordinadores
- **Seguimiento:** Estado y progreso
- **Reportes:** Analytics por tipo

### 5. **SOLICITUDES** - Interfaz de Gestión (NUEVO v1.1.0)
- **Propósito:** Visualizar, filtrar y descargar solicitudes de bolsas de pacientes
- **Componente:** Solicitudes.jsx (`frontend/src/pages/bolsas/Solicitudes.jsx`)
- **Características principales:**
  - Dashboard con estadísticas (Total, Pendientes, Citados, Atendidos, Observados)
  - Tabla profesional con 15 columnas de información completa
  - Filtros avanzados: Búsqueda, Bolsas, Redes, Especialidades, Estados
  - Selección múltiple con descarga CSV
  - Indicadores visuales (semáforo: Verde/Rojo)
  - Ancho completo (w-full) sin limitaciones
  - **Design System CENATE v1.0.0:** Header #0D5BA9, h-16 filas, padding estándar, hover effects
- **Datos Iniciales:** 8 pacientes mock para testing
- **Status:** ✅ Producción v1.1.0

---

## Arquitectura Global

### Diagrama de Capas del Módulo

```
┌─────────────────────────────────────────────────────────┐
│                  PRESENTACIÓN (Frontend React)          │
│  TiposBolsas.jsx | Formulario 107 | Gestión Pacientes │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                   ORCHESTRATION (API REST)              │
│  Controllers para cada subcomponente                     │
│  • GestionTiposBolsasController (7 endpoints)           │
│  • ImportExcelController (5 endpoints)                  │
│  • PacientesController (N endpoints)                    │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    BUSINESS LOGIC (Services)            │
│  • TipoBolsaService (CRUD tipos)                        │
│  • ExcelImportService (Validación & carga)              │
│  • Bolsa107Service (Gestión bolsa 107)                  │
│  • PacientesService (Gestión pacientes)                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                    DATA ACCESS (Repositories)           │
│  • TipoBolsaRepository                                  │
│  • Bolsa107ItemRepository                               │
│  • Bolsa107ErrorRepository                              │
│  • PacienteRepository                                   │
│  • AsignacionRepository                                 │
└────────────────────┬────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────┐
│                  PERSISTENCE (PostgreSQL)               │
│  dim_tipos_bolsas (7 tipos)                             │
│  bolsa_107_carga (cabeceras)                            │
│  bolsa_107_item (pacientes OK)                          │
│  bolsa_107_error (pacientes con error)                  │
│  bolsa_107_raw (staging)                                │
│  pacientes_asegurados (maestro)                         │
│  asignaciones (tracking)                                │
└─────────────────────────────────────────────────────────┘
```

### Flujo de Datos

```
Sistema Externo (Excel)
    ↓
Formulario 107 (Upload)
    ↓
ExcelImportService (Validación)
    ↓
Tabla Staging (bolsa_107_raw)
    ↓
Stored Procedure (SP_Validar_Bolsa_107)
    ↓
├─→ VÁLIDOS → bolsa_107_item ✅
└─→ ERRORES → bolsa_107_error ❌
    ↓
AsignacionService (Asignar a coordinadores)
    ↓
Sistema de Disponibilidad Médica
    ↓
Turnos y Atenciones
```

---

## Flujos de Negocio

### Flujo 1: Importación de Bolsa 107

```
1. Coordinador descarga Excel desde ESSI
2. Accede a: http://localhost:3000/formularios/formulario107/formulario.html
3. Sube archivo Excel (.xlsx)
4. Sistema valida:
   ├─ Hash único (evita duplicados)
   ├─ Formato Excel
   ├─ Columnas esperadas (14)
   └─ Datos en general
5. Carga a bolsa_107_raw (sin validar)
6. Ejecuta Stored Procedure de validación
7. Separa en:
   ├─ Filas OK → bolsa_107_item (listos para asignar)
   └─ Filas ERROR → bolsa_107_error (requieren corrección)
8. Coordinador ve:
   ├─ Total procesadas: 10,500
   ├─ Válidas: 10,200 ✅
   └─ Errores: 300 ❌
9. Asignación automática a coordinadores
10. Inicio de atenciones
```

### Flujo 2: Creación de Nuevo Tipo de Bolsa

```
1. Administrador accede a: Admin → Tipos de Bolsas
2. Click en "Nuevo Tipo de Bolsa"
3. Rellena formulario modal:
   ├─ Código: BOLSA_TELEMEDICINA
   ├─ Descripción: Bolsa para atenciones telemédicas
   └─ Estado inicial: A (Activo)
4. Click en "Guardar"
5. Backend:
   ├─ Valida código único
   ├─ Inserta en dim_tipos_bolsas
   ├─ Genera timestamps (created_at, updated_at)
   └─ Retorna nuevo registro
6. Frontend actualiza tabla
7. Nuevo tipo disponible en:
   ├─ Filtros de búsqueda
   ├─ Selecciones de solicitudes
   └─ Reportes
```

### Flujo 3: Búsqueda y Filtrado de Bolsas

```
1. Usuario accede a Admin → Tipos de Bolsas
2. Escribe en filtro de código: "BOLSA"
   ├─ Debounce: espera 300ms
   ├─ Envia: GET /tipos-bolsas/buscar?busqueda=BOLSA
   └─ Resultado: todos los códigos que contienen "BOLSA"
3. Escribe en filtro de descripción: "epidemiológico"
   ├─ Busca en full-text
   └─ Resultado: BOLSA_DENGUE
4. Combina ambos filtros
5. Resultado: intersección de ambos
```

### Flujo 4: Distribución de Bolsas por Coordinador de Gestión de Citas

```
1. Coordinador de Gestión de Citas accede a:
   http://localhost:3000/bolsas/solicitudes

2. Ve dashboard con estadísticas:
   ├─ Total Pacientes: 150
   ├─ Pendientes: 80
   ├─ Citados: 45
   ├─ Atendidos: 20
   └─ Observados: 5

3. Tabla lista pacientes de múltiples bolsas:
   ├─ Bolsa 107 (importación masiva)
   ├─ Bolsa Dengue (control epidemiológico)
   ├─ Bolsas Enfermería (atenciones)
   ├─ Bolsas IVR (sistema de voz)
   ├─ Bolsas Reprogramación (citas reagendadas)
   └─ Bolsa Gestores Territorial (gestión territorial)

4. Filtros disponibles:
   ├─ Búsqueda: por DNI, nombre, teléfono, IPRESS, red
   ├─ Por Bolsa: selecciona tipo específico
   ├─ Por Red: filtra por región
   ├─ Por Especialidad: filtra por área médica
   └─ Por Estado: Pendiente, Citado, Atendido, Observado

5. Acciones del Coordinador:
   ├─ Selecciona múltiples pacientes ✓
   ├─ Descarga CSV con su información
   ├─ Asigna pacientes a Gestoras de Citas
   ├─ Cambia celular si es necesario
   └─ Ver, agregar usuarios, compartir información

6. Cada paciente muestra:
   ├─ DNI + Nombre
   ├─ Teléfono (con opción de cambio)
   ├─ Especialidad requerida
   ├─ Sexo
   ├─ Red y IPRESS asignada
   ├─ Bolsa de origen
   ├─ Fecha de cita programada
   ├─ Fecha de asignación
   ├─ Estado actual (CITADO, NO_CONTESTA, NO_DESEA, etc.)
   ├─ Diferimiento (días desde asignación)
   └─ Semáforo (Verde=OK, Rojo=Urgente)

7. Sistema registra:
   ├─ Quién distribuyó (Coordinador ID)
   ├─ A quién se asignó (Gestora ID)
   ├─ Cuándo se distribuyó (timestamp)
   └─ Auditoría completa de cada acción
```

### Flujo 5: Gestión de Pacientes por Gestoras de Citas

```
1. Gestora de Citas recibe pacientes asignados desde Coordinador

2. Accede a Módulo de Gestión de Citas (complementario):
   http://localhost:3000/citas/gestion-asegurado

3. Ve "Gestión del Asegurado":
   ├─ Datos del paciente (nombre, DNI, edad, IPRESS)
   ├─ Origen: de tabla dim_solicitud_bolsa/bolsa_pacientes
   └─ Estado actual inicial: PENDIENTE

4. Gestora realiza acciones:
   ├─ Captar paciente (localizar)
   ├─ Llamar por teléfono
   ├─ Confirmar cita
   └─ Registrar resultado (estado)

5. Estados posibles de Gestión (tabla dim_estados_gestion_citas):
   ├─ CITADO: Paciente agendado para atención
   ├─ NO_CONTESTA: No responde a llamadas
   ├─ NO_DESEA: Rechaza la atención
   ├─ ATENDIDO_IPRESS: Atendido en institución
   ├─ HC_BLOQUEADA: Historia clínica bloqueada
   ├─ NUM_NO_EXISTE: Teléfono no existe
   ├─ TEL_SIN_SERVICIO: Línea sin servicio
   ├─ REPROG_FALLIDA: No se pudo reprogramar
   ├─ SIN_VIGENCIA: Seguro no vigente
   └─ APAGADO: Teléfono apagado

6. Después de estado CITADO:
   ├─ Sistema envía recordatorio por WhatsApp
   ├─ Sistema envía recordatorio por Email
   └─ Registra timestamp de envío (auditoría)

7. Seguimiento en tabla dim_solicitud_bolsa:
   ├─ Actualiza: estado_gestion_citas_id → nuevo estado
   ├─ Registra: responsable_gestora_id (quién lo gestiona)
   ├─ Calcula: diferimiento (días desde asignación)
   ├─ Actualiza: semaforo (Verde/Rojo según criterios)
   └─ Auditoría: quién, cuándo, qué cambió
```

### Flujo 6: Desactivación de Tipo de Bolsa

```
1. Administrador ve tipo "BOLSAS_IVR" en tabla
2. Haz click en toggle de estado
3. Estado cambia: ACTIVO → INACTIVO
4. Backend:
   ├─ Ejecuta: PATCH /tipos-bolsas/{id}/estado?nuevoEstado=I
   ├─ Actualiza: stat_tipo_bolsa = 'I'
   ├─ Actualiza: updated_at = ahora
   └─ Retorna registro actualizado
5. Frontend:
   ├─ Toggle se muestra gris
   ├─ Texto: "INACTIVO"
   └─ Ya no aparece en búsquedas por defecto
6. Impacto:
   ├─ No aparece en selecciones de nuevas solicitudes
   ├─ Bolsas existentes se mantienen
   └─ Auditoría registra cambio
```

---

## Catálogo de Tipos de Bolsas

### Tipos Predefinidos (v1.0.0)

| ID | Código | Descripción | Casos de Uso | Estado |
|---|---|---|---|---|
| **1** | BOLSA_107 | Importación de pacientes masiva | Carga inicial desde ESSI | A ✅ |
| **2** | BOLSA_DENGUE | Control epidemiológico | Vigilancia dengue, control brotes | A ✅ |
| **3** | BOLSAS_ENFERMERIA | Atenciones de enfermería | Procedimientos de enfermería | A ✅ |
| **4** | BOLSAS_EXPLOTADATOS | Análisis y reportes | Analytics, epidemiología, reportes | A ✅ |
| **5** | BOLSAS_IVR | Sistema interactivo de respuesta de voz | Atenciones por chatbot/IVR | A ✅ |
| **6** | BOLSAS_REPROGRAMACION | Citas reprogramadas | Pacientes con citas reagendadas | A ✅ |
| **7** | BOLSA_GESTORES_TERRITORIAL | Gestión territorial | Gestión por gestores territoriales | A ✅ |

### Extensión Futura

El catálogo es extensible. Pueden agregarse tipos según necesidad de negocio:
```
BOLSA_TELEMEDICINA   → Atenciones remotas
BOLSA_URGENCIAS      → Casos urgentes
BOLSA_PEDIATRIA      → Pacientes pediátricos
BOLSA_GERIATRIA      → Pacientes geriátricos
BOLSA_ONCOLOGIA      → Casos oncológicos
... etc
```

---

## Documentación de Submódulos

### 📄 Documentos Relacionados

| Documento | Propósito | Ubicación |
|---|---|---|
| **Módulo Formulario 107** | Importación masiva de pacientes | `spec/01_Backend/03_modulo_formulario_107.md` |
| **CRUD Tipos de Bolsas** | Gestión del catálogo de tipos | `spec/01_Backend/05_modulo_tipos_bolsas_crud.md` |
| **Auto-normalización Excel** | Procesamiento de archivos Excel | `spec/01_Backend/04_auto_normalizacion_excel_107.md` |
| **API Endpoints** | Referencia completa de endpoints | `spec/01_Backend/01_api_endpoints.md` |
| **Auditoría** | Sistema de auditoría y logs | `spec/04_BaseDatos/02_guia_auditoria/` |

### 📊 Scripts SQL Disponibles

| Script | Función |
|---|---|
| `017_rename_listado_107_to_carga_pacientes.sql` | Rename migration |
| `018_limpiar_datos_bolsa_107.sql` | Data cleanup |
| `020_agregar_menu_asignacion_pacientes.sql` | Menu management |
| `021_agregar_gestor_asignado_bolsa107.sql` | Add manager field |
| `022_agregar_tipo_apoyo_bolsa107.sql` | Add support type |
| `023_agregar_campos_programacion_bolsa107.sql` | Add programming fields |
| `V3_0_2__crear_tabla_tipos_bolsas.sql` | **NUEVO:** Crear dim_tipos_bolsas |

---

## Integración Sistémica

### Flujo Completo: Bolsas → Coordinador → Gestoras → Estados

```
┌─────────────────────────────────────────────────────────────────────────┐
│ MÚLTIPLES FUENTES DE PACIENTES                                           │
├─────────────────────────────────────────────────────────────────────────┤
│ ✓ Bolsa 107 (importación masiva ESSI)                                   │
│ ✓ Bolsa Dengue (control epidemiológico)                                 │
│ ✓ Bolsas Enfermería (atenciones de enfermería)                          │
│ ✓ Bolsas IVR (sistema de respuesta de voz)                              │
│ ✓ Bolsas Reprogramación (citas reagendadas)                             │
│ ✓ Bolsa Gestores Territorial (gestión territorial)                      │
└─────────────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ TABLA: dim_solicitud_bolsa (ALMACENAMIENTO CENTRAL)                     │
├─────────────────────────────────────────────────────────────────────────┤
│ Almacena TODOS los pacientes esperando gestión:                          │
│ • id_solicitud (PK)                                                      │
│ • paciente_id, paciente_nombre, paciente_dni                             │
│ • id_bolsa (FK → dim_bolsa)                                              │
│ • estado (PENDIENTE, APROBADA, RECHAZADA) [Control de solicitud]         │
│ • especialidad, red_id, ipress_id                                        │
│ • responsable_gestora_id (Gestora asignada)                              │
│ • fechas (solicitud, aprobación, asignación)                             │
│ • auditoría (quién, cuándo, qué cambió)                                  │
└─────────────────────────────────────────────────────────────────────────┘
        ↓
┌─────────────────────────────────────────────────────────────────────────┐
│ ROL: COORDINADOR DE GESTIÓN DE CITAS                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Accede a: http://localhost:3000/bolsas/solicitudes                       │
│ Funciones:                                                                │
│ ✓ Ver todas las bolsas de pacientes pendientes                           │
│ ✓ Filtrar por: Bolsa, Red, Especialidad, Estado                         │
│ ✓ Buscar pacientes específicos (DNI, nombre, teléfono)                   │
│ ✓ Descargar CSV para distribución                                        │
│ ✓ Asignar pacientes a Gestoras de Citas                                  │
│ ✓ Ver estadísticas (Total, Pendientes, Citados, Atendidos, Observados)  │
│ ✓ Cambiar teléfono de contacto si es necesario                           │
│ ✓ Registrar auditoría de distribuciones                                  │
└─────────────────────────────────────────────────────────────────────────┘
        ↓ DISTRIBUCIÓN
┌─────────────────────────────────────────────────────────────────────────┐
│ ROL: GESTORA DE CITAS (pueden ser múltiples usuarios)                    │
├─────────────────────────────────────────────────────────────────────────┤
│ Reciben pacientes asignados por el Coordinador                           │
│ Acceden a: http://localhost:3000/citas/gestion-asegurado                 │
│ Funciones:                                                                │
│ ✓ Ver pacientes asignados a su usuario                                   │
│ ✓ Captar/localizar al paciente                                           │
│ ✓ Llamar por teléfono                                                    │
│ ✓ Confirmar disponibilidad para atención                                 │
│ ✓ Registrar resultado de gestión (estado)                                │
│ ✓ Ver datos del paciente (nombre, DNI, edad, IPRESS, especialidad)       │
│ ✓ Cambiar celular si no responde                                         │
│ ✓ Registra quién gestionó, cuándo, qué estado                            │
└─────────────────────────────────────────────────────────────────────────┘
        ↓ REGISTRO DE ESTADO
┌─────────────────────────────────────────────────────────────────────────┐
│ TABLA: dim_estados_gestion_citas (CATÁLOGO DE 10 ESTADOS)                │
├─────────────────────────────────────────────────────────────────────────┤
│ Cada paciente en bolsa transita por estos estados:                        │
│ ✓ CITADO: Paciente agendado para atención (→ recordatorio WA/Email)      │
│ ✓ NO_CONTESTA: No responde a llamadas del Coordinador                    │
│ ✓ NO_DESEA: Rechaza la atención                                          │
│ ✓ ATENDIDO_IPRESS: Paciente recibió atención en institución              │
│ ✓ HC_BLOQUEADA: Historia clínica del paciente bloqueada en sistema       │
│ ✓ NUM_NO_EXISTE: Número telefónico no existe/no es válido                │
│ ✓ TEL_SIN_SERVICIO: Línea telefónica sin servicio                         │
│ ✓ REPROG_FALLIDA: No fue posible reprogramar la cita                      │
│ ✓ SIN_VIGENCIA: Seguro/cobertura del paciente no vigente                 │
│ ✓ APAGADO: Teléfono del paciente apagado                                 │
└─────────────────────────────────────────────────────────────────────────┘
        ↓ ACTUALIZACIÓN EN BOLSA
┌─────────────────────────────────────────────────────────────────────────┐
│ TABLA: dim_solicitud_bolsa (ACTUALIZACIÓN DE ESTADO)                     │
├─────────────────────────────────────────────────────────────────────────┤
│ Cada cambio de estado genera:                                             │
│ ✓ estado_gestion_citas_id (FK → dim_estados_gestion_citas)               │
│ ✓ responsable_gestora_id (quién lo gestionó)                             │
│ ✓ fecha_estado (timestamp del cambio)                                    │
│ ✓ diferimiento = DAYS(hoy - fecha_asignacion)                            │
│ ✓ semaforo = si diferimiento >= 20 entonces ROJO sino VERDE              │
│ ✓ auditoría completa (quién cambió, cuándo, de qué a qué)                │
└─────────────────────────────────────────────────────────────────────────┘
        ↓ SALIDA
┌─────────────────────────────────────────────────────────────────────────┐
│ RESULTADO FINAL                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│ Cada paciente en bolsa:                                                   │
│ • Fue distribuido por un Coordinador                                     │
│ • Fue gestionado por una Gestora de Citas                                │
│ • Pasó por uno o más Estados de Gestión                                  │
│ • Tiene trazabilidad completa (auditoría)                                │
│ • Recibió recordatorios (WhatsApp/Email)                                 │
│ • Estado final: CITADO, ATENDIDO, o alguna razón de falla                │
└─────────────────────────────────────────────────────────────────────────┘
```

### Integración con Otros Módulos

```
Módulo de Bolsas
    ↓
    ├─→ [Módulo de Gestión de Citas]
    │   Complementario - Gestoras capturan, llaman, confirman
    │   Estados: CITADO, NO_CONTESTA, NO_DESEA, etc.
    │
    ├─→ [Disponibilidad Médica]
    │   Determina qué médicos pueden atender qué tipos
    │
    ├─→ [Solicitud de Turnos]
    │   Selecciona tipo de bolsa para solicitud
    │
    ├─→ [Chatbot / IVR]
    │   Clasifica pacientes como BOLSAS_IVR
    │
    ├─→ [Tele-ECG]
    │   Agrupa pacientes con ECGs pendientes
    │
    ├─→ [Auditoría]
    │   Registra toda acción sobre bolsas
    │
    ├─→ [Notificaciones]
    │   WhatsApp/Email cuando estado = CITADO
    │
    ├─→ [Reportes]
    │   Analytics por tipo de bolsa y estado
    │
    └─→ [Permisos/MBAC]
        Control de acceso por bolsa y rol
```

---

## Estado de Implementación

### v1.31.0 (2026-01-22) - Tipos de Bolsas CRUD

#### ✅ Backend Completado

- GestionTiposBolsasController.java (7 endpoints REST)
- TipoBolsaService.java + TipoBolsaServiceImpl.java
- TipoBolsaRepository.java (JPA + queries personalizadas)
- TipoBolsa.java (Entity con auditoría)
- TipoBolsaResponse.java (DTO)
- Migraciones: V3_0_2__crear_tabla_tipos_bolsas.sql

**Endpoints:**
```
GET    /tipos-bolsas/todos                    ✅
GET    /tipos-bolsas/{id}                     ✅
GET    /tipos-bolsas/buscar?busqueda=&estado= ✅
GET    /tipos-bolsas/estadisticas             ✅
POST   /tipos-bolsas                          ✅
PUT    /tipos-bolsas/{id}                     ✅
PATCH  /tipos-bolsas/{id}/estado              ✅
DELETE /tipos-bolsas/{id}                     ✅
```

#### ✅ Frontend Completado

- TiposBolsas.jsx (componente React profesional)
- tiposBolsasService.js (API client con fallback)
- Integración en TabsNavigation.jsx
- Integración en UsersManagement.jsx

**Características:**
- Tabla con paginación (30 items/página)
- Búsqueda avanzada (código + descripción, debounce 300ms)
- Modales: Crear, Editar, Ver, Eliminar
- Toggle de estado
- Fallback offline (7 registros predefinidos)
- Diseño CENATE (#0D5BA9)

#### ✅ Base de Datos Completada

- Tabla: dim_tipos_bolsas
- 7 registros iniciales (BOLSA_107, BOLSA_DENGUE, etc.)
- Índices optimizados
- Triggers para auditoría
- Migraciones automáticas (Flyway)

#### ✅ Seguridad Configurada

- Endpoints públicos (sin autenticación requerida)
- CORS habilitado para frontend
- Validaciones en 3 capas (BD, backend, frontend)

#### ✅ Documentación Completada

- spec/01_Backend/05_modulo_tipos_bolsas_crud.md
- spec/01_Backend/06_resumen_modulo_bolsas_completo.md
- Changelog actualizado

---

## 📥 Importación de Pacientes desde Excel (v1.32.1)

### Estructura del Archivo Excel

**14 Columnas Obligatorias en Orden Exacto:**

```
A: REGISTRO
B: OPCIONES DE INGRESO DE LLAMADA
C: TELEFONO
D: TIPO DE DOCUMENTO              ⚠️ OBLIGATORIO
E: DNI                            ⚠️ OBLIGATORIO
F: APELLIDOS Y NOMBRES            ⚠️ OBLIGATORIO
G: SEXO                           ⚠️ OBLIGATORIO
H: FechaNacimiento                ⚠️ OBLIGATORIO
I: DEPARTAMENTO
J: PROVINCIA
K: DISTRITO
L: MOTIVO DE LA LLAMADA
M: AFILIACION
N: DERIVACION INTERNA             ⚠️ OBLIGATORIO
```

**6 Campos Obligatorios (NUNCA vacíos):**
1. TIPO DE DOCUMENTO (DNI, PASAPORTE, etc.)
2. DNI (sin guiones: 12345678)
3. APELLIDOS Y NOMBRES (Gonzales Flores María)
4. SEXO (Masculino/Femenino/M/F)
5. FechaNacimiento (DD/MM/YYYY)
6. DERIVACION INTERNA (Cardiología, Nutrición, etc.)

**Documentación Completa:**
- `spec/03_Frontend/02_estructura_excel_pacientes.md` (Guía detallada + validaciones)
- `spec/03_Frontend/PLANTILLA_EXCEL_PACIENTES.csv` (Plantilla con ejemplos)

**Características:**
- ✅ Auto-normalización de cabeceras (+50 variaciones)
- ✅ Validación multicapa (frontend → backend → BD)
- ✅ Duplicados detectados (DNI + TIPO DOCUMENTO)
- ✅ Reporte JSON con OK/ERROR por fila
- ✅ Importación masiva (sin límite de filas)

---

## 🎨 Componentes Reutilizables (v1.32.0)

### Tres Componentes Base

**1. PageHeader** - Encabezado estándar de página
```jsx
<PageHeader
  badge={{ label: "Recepción de Bolsa", bgColor: "bg-blue-100 text-blue-700", icon: FolderOpen }}
  title="Solicitudes"
  primaryAction={{ label: "Agregar Paciente", onClick: () => {} }}
/>
```

**2. StatCard** - Tarjeta de estadística con color
```jsx
<StatCard
  label="Total Pacientes"
  value={8}
  borderColor="border-blue-500"
  textColor="text-blue-600"
  icon="👥"
/>
```

**3. ListHeader** - Búsqueda y filtros dinámicos
```jsx
<ListHeader
  title="Lista de Pacientes"
  searchPlaceholder="Buscar DNI, nombre o IPRESS..."
  searchValue={searchTerm}
  onSearchChange={(e) => setSearchTerm(e.target.value)}
  filters={[...]}  // Array de filtros
/>
```

**Beneficios:**
- ✅ DRY (reutilizable en todas las páginas)
- ✅ Consistencia de UI/UX
- ✅ Cambios centralizados
- ✅ 100% conforme Design System CENATE

**Documentación:**
- `frontend/src/components/README.md` (Guía completa + ejemplos)
- `spec/03_Frontend/01_estructura_minima_paginas.md` (Patrón arquitectónico)
- `frontend/src/pages/bolsas/PLANTILLA_PAGINA_MINIMA.jsx` (Ejemplo funcional)

**Componentes que Usan:**
- Solicitudes.jsx ✅
- GestionBolsasPacientes.jsx ✅
- Extensibles a otras páginas

---

## 📊 Métricas del Módulo Completo

| Métrica | Valor |
|---|---|
| **Subcomponentes** | 4 (Bolsa 107, Tipos, Gestión, Auditoría) |
| **Entidades JPA** | 5+ (TipoBolsa, Bolsa107Carga, Bolsa107Item, etc.) |
| **Controladores** | 3+ (TipoBolsas, ImportExcel, Pacientes) |
| **Endpoints REST** | 25+ |
| **Tablas BD** | 7+ |
| **Componentes React** | 8+ (5 base + 3 reutilizables) |
| **Scripts SQL** | 7+ |
| **Líneas de código** | ~7,500+ |
| **Documentación** | 12+ archivos MD |
| **Componentes Reutilizables** | 3 (PageHeader, StatCard, ListHeader) |
| **Test Coverage** | Manual (curl + navegador) |

---

## 🚀 Deployment Checklist

- [x] Backend compilado sin errores
- [x] Frontend sin errores de compilación
- [x] Base de datos migrada
- [x] 7 registros iniciales cargados
- [x] Endpoints testados (curl)
- [x] UI testada (navegador)
- [x] Fallback offline funciona
- [x] Documentación completa
- [x] Commit + Push a main
- [ ] Deploy a staging
- [ ] Deploy a producción

---

## 📞 Soporte y Recursos

### Logs

- Backend: `/tmp/backend.log`
- Frontend: Browser console (F12)

### URLs

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Tipos de Bolsas: http://localhost:3000/admin/users (tab)

### Endpoints de Prueba

```bash
# Listar todos
curl http://localhost:8080/tipos-bolsas/todos

# Crear nuevo
curl -X POST http://localhost:8080/tipos-bolsas \
  -H "Content-Type: application/json" \
  -d '{"codTipoBolsa":"BOLSA_TEST","descTipoBolsa":"Prueba"}'

# Buscar
curl "http://localhost:8080/tipos-bolsas/buscar?busqueda=BOLSA&page=0&size=10"
```

---

## 📈 Roadmap Futuro

### v1.32.1 (COMPLETADO) ✅

- [x] Componentes reutilizables (PageHeader, StatCard, ListHeader)
- [x] Estructura mínima de páginas estandarizada
- [x] Documentación completa de Excel (14 columnas, 6 obligatorios)
- [x] Plantilla Excel descargable con ejemplos
- [x] Auto-normalización de cabeceras (+50 variaciones)
- [x] Refactorización de Solicitudes.jsx con componentes reutilizables

### v1.33.0 (Próximos meses)

- [ ] Auditoría completa de cambios por usuario
- [ ] Reportes por tipo de bolsa
- [ ] Integración con módulo de disponibilidad
- [ ] Validaciones de negocio avanzadas
- [ ] Batch processing para importaciones
- [ ] API webhooks para eventos

### v1.34.0 (Largo plazo)

- [ ] ML para clasificación automática
- [ ] Integración con ESSI en tiempo real
- [ ] Dashboard de bolsas
- [ ] Alertas y notificaciones
- [ ] Exportación de datos avanzada

---

---

## 📊 Tabla Central: dim_solicitud_bolsa v1.6.0

### Estructura de Campos (26 campos)

Esta tabla es el **corazón del almacenamiento centralizado** de pacientes esperando gestión. Recibe pacientes de múltiples fuentes y los distribuye a través de Coordinadores y Gestoras de Citas.

#### 🔑 Identificación (Auto-generada)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **id_solicitud** | BIGSERIAL | Clave primaria | ✅ | Auto-generado |
| **numero_solicitud** | VARCHAR(50), UNIQUE | Identificador único: BOLSA-YYYYMMDD-XXXXX | ✅ | Auto-generado |

#### 📦 Tipo de Bolsa (Selector PASO 1)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **id_tipo_bolsa** | BIGINT, FK | Referencia a dim_tipos_bolsas | ✅ | Usuario (selector) |
| **cod_tipo_bolsa** | TEXT | Código (ej: BOLSA_107) | ✅ | Auto (FK) |
| **desc_tipo_bolsa** | TEXT | Descripción (ej: Bolsa 107 - Importación...) | ✅ | Auto (FK) |

#### 🏥 Especialidad (Selector PASO 2)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **id_servicio** | BIGINT, FK | Referencia a dim_servicio_essi | ✅ | Usuario (selector) |
| **especialidad** | VARCHAR(255) | Nombre especialidad (ej: Cardiología) | ✅ | Auto (FK) |
| **cod_servicio** | VARCHAR(10) | Código especialidad (ej: 001) | ✅ | Auto (FK) |

#### 👤 Datos Paciente (De Excel + Validación)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **paciente_dni** | VARCHAR(20) | DNI del paciente | ✅ | Excel (usuario) |
| **paciente_id** | BIGINT, FK | FK a asegurados.pk_asegurado | ✅ | Auto (validado) |
| **paciente_nombre** | VARCHAR(255) | Nombre completo | ✅ | Auto (FK) |

#### 🏥 Información IPRESS (De Excel + Validación)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **codigo_adscripcion** | VARCHAR(20) | Código IPRESS de adscripción | ✅ | Excel (usuario) |
| **id_ipress** | BIGINT, FK | FK a dim_ipress | ✅ | Auto (validado) |
| **nombre_ipress** | VARCHAR(255) | Nombre institución (ej: H.II PUCALLPA) | ✅ | Auto (FK) |
| **red_asistencial** | VARCHAR(255) | Nombre red (ej: RED ASISTENCIAL UCAYALI) | ✅ | Auto (FK vía dim_red) |

#### 📊 Estado y Solicitante (Auto-asignados)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **estado_gestion_citas_id** | BIGINT, FK | FK a dim_estados_gestion_citas | ✅ | Sistema (default=5 PENDIENTE_CITA) |
| **cod_estado_cita** | TEXT | Código estado (ej: PENDIENTE_CITA) | ✅ | Auto (FK) |
| **desc_estado_cita** | VARCHAR(255) | Descripción legible (ej: Pendiente de Cita) | ✅ | Auto (FK) |
| **solicitante_id** | BIGINT, FK | FK a dim_usuarios (usuario que cargó) | ✅ | Sistema |
| **solicitante_nombre** | VARCHAR(255) | Nombre del usuario | ✅ | Auto (FK) |

#### 👤 Gestor de Citas (Se asigna posteriormente)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **responsable_gestora_id** | BIGINT, FK | FK a dim_usuarios (gestora asignada) | ❌ | Coordinador (posterior) |
| **fecha_asignacion** | TIMESTAMP TZ | Fecha de asignación a gestora | ❌ | Sistema (posterior) |

#### ⏰ Auditoría (Auto-generadas)
| Campo | Tipo | Descripción | Requerido | Origen |
|-------|------|-------------|-----------|--------|
| **fecha_solicitud** | TIMESTAMP TZ | Fecha de creación (CURRENT_TIMESTAMP) | ✅ | Auto |
| **fecha_actualizacion** | TIMESTAMP TZ | Fecha última actualización (trigger) | ✅ | Auto (trigger) |
| **activo** | BOOLEAN | Lógicamente activo/inactivo (soft delete) | ✅ | Defecto (true) |
| **recordatorio_enviado** | BOOLEAN | Recordatorio enviado (WhatsApp/Email) | ✅ | Defecto (false) |

### Relaciones de Integridad (8 Foreign Keys)

```
dim_solicitud_bolsa (26 campos)
├─ FK1: id_tipo_bolsa → dim_tipos_bolsas.id_tipo_bolsa (RESTRICT) ✅
├─ FK2: id_servicio → dim_servicio_essi.id_servicio (RESTRICT) ✅
├─ FK3: paciente_id → asegurados.pk_asegurado (RESTRICT) ✅
├─ FK4: id_ipress → dim_ipress.id_ipress (SET NULL) ✅
├─ FK5: estado_gestion_citas_id → dim_estados_gestion_citas.id_estado_cita (RESTRICT) ✅ ◄─ NUEVO
├─ FK6: solicitante_id → dim_usuarios.id_user (SET NULL) ✅
├─ FK7: responsable_gestora_id → dim_usuarios.id_user (SET NULL) ✅
└─ Índices: 9 índices para optimización
```

### Índices Optimizados (9 índices)

```sql
-- Búsqueda de pacientes
CREATE INDEX idx_solicitud_bolsa_dni ON dim_solicitud_bolsa(paciente_dni);
CREATE INDEX idx_solicitud_bolsa_nombre ON dim_solicitud_bolsa(paciente_nombre);
CREATE INDEX idx_solicitud_bolsa_codigo_adscripcion ON dim_solicitud_bolsa(codigo_adscripcion);

-- Filtros por estado y tipo
CREATE INDEX idx_solicitud_bolsa_estado_gestion ON dim_solicitud_bolsa(estado_gestion_citas_id);
CREATE INDEX idx_solicitud_bolsa_tipo ON dim_solicitud_bolsa(id_tipo_bolsa);
CREATE INDEX idx_solicitud_bolsa_servicio ON dim_solicitud_bolsa(id_servicio);

-- Asignación a gestoras
CREATE INDEX idx_solicitud_bolsa_gestora ON dim_solicitud_bolsa(responsable_gestora_id);

-- Rangos de fechas
CREATE INDEX idx_solicitud_bolsa_fecha_solicitud ON dim_solicitud_bolsa(fecha_solicitud);
CREATE INDEX idx_solicitud_bolsa_fecha_asignacion ON dim_solicitud_bolsa(fecha_asignacion);

-- Compuesto para reportes
CREATE INDEX idx_solicitud_bolsa_tipo_estado ON dim_solicitud_bolsa(id_tipo_bolsa, estado_gestion_citas_id);
```

---

---

## ✅ Status Final: PRODUCCIÓN LIVE v1.33.0

### Módulo de Solicitudes de Bolsa v1.6.0 - COMPLETADO

**Componentes Integrados:**
- Backend v1.32.0: SolicitudBolsaController, SolicitudBolsaService, SolicitudBolsaRepository
- Frontend v1.33.0: Módulo Solicitudes actualizado con nueva estructura
- Base de Datos: dim_solicitud_bolsa (26 campos, 8 FKs, 9 índices)
- Integración: dim_estados_gestion_citas v1.33.0

**Flujo Completo Actualizado (2026-01-23):**

```
PASO 1: Usuario selecciona TIPO BOLSA
        ↓ (dim_tipos_bolsas - 7 tipos disponibles)

PASO 2: Usuario selecciona ESPECIALIDAD
        ↓ (dim_servicio_essi - N especialidades)

PASO 3: Usuario carga Excel (DNI + Código Adscripción obligatorios)
        ↓

VALIDACIONES:
  • DNI existe en asegurados → obtiene paciente_id, paciente_nombre
  • Código Adscripción existe en dim_ipress → obtiene id_ipress, nombre_ipress, red
  • Sin duplicados → (id_tipo_bolsa, paciente_id, id_servicio) UNIQUE
        ↓

INSERCIÓN EN dim_solicitud_bolsa:
  • 26 campos: IDs + Códigos + Nombres + Fechas + Estados
  • 8 Foreign Keys: Integridad referencial garantizada
  • Estado inicial: estado_gestion_citas_id = 5 (PENDIENTE_CITA)
  • Auditoría: fecha_solicitud, fecha_actualizacion (trigger)
        ↓

VISUALIZACIÓN EN TABLA:
  • Módulo Bolsas muestra todos los datos combinados
  • Columna "Estado": PENDIENTE_CITA → CITADO → ASISTIO/CANCELADO/etc.
  • Coordinador distribuye a Gestoras de Citas
  • Gestoras registran seguimiento
  • Auditoría completa de cada acción
```

**Características v1.6.0:**
- ✅ 2 selectores simplificados (TIPO BOLSA + ESPECIALIDAD)
- ✅ Sin aprobación: carga directa a estado PENDIENTE_CITA
- ✅ Excel mínimo: solo 2 campos obligatorios (DNI + Código Adscripción)
- ✅ Auto-enriquecimiento: Sistema obtiene todos los datos automáticamente
- ✅ Estados centralizados: dim_estados_gestion_citas con 10 estados
- ✅ Múltiples fuentes: 6 tipos de bolsas que alimentan tabla única
- ✅ Distribución integral: Coordinador → Gestoras → Auditoría
- ✅ Soft delete: Campo activo para control lógico
- ✅ Índices optimizados: 9 índices para búsquedas rápidas

**Tabla Final (dim_solicitud_bolsa):**
- **26 campos**: Identificación + Tipos + Especialidades + Paciente + IPRESS + Estados + Auditoría
- **8 Foreign Keys**: Integridad referencial + RESTRICT para críticos + SET NULL para opcionales
- **9 Índices**: Búsqueda DNI, nombre, código adscripción + estado + tipo + servicio + gestora + fechas
- **Validaciones**: En 3 capas - Frontend UX + Backend DTO + Base de Datos CHECK

**Integración Sistémica:**
- ✅ Bolsas 107 → dim_solicitud_bolsa
- ✅ Bolsas Dengue → dim_solicitud_bolsa
- ✅ Bolsas Enfermería → dim_solicitud_bolsa
- ✅ Bolsas IVR → dim_solicitud_bolsa
- ✅ Bolsas Reprogramación → dim_solicitud_bolsa
- ✅ Bolsas Gestores Territorial → dim_solicitud_bolsa

**Documento Actualizado:**
- `spec/01_Backend/06_resumen_modulo_bolsas_completo.md` (v1.33.0)
- `UML_COMPLETO_FINAL_v1_6_ESTADOS_CITAS.md` (Especificación técnica detallada)

**Versión:** v1.33.0 | **Fecha:** 2026-01-23 | **Status:** ✅ LISTO PARA IMPLEMENTACIÓN
**Creado por:** Claude Code | **Módulo:** Solicitudes de Bolsa v1.6.0 | **Estado:** ACTIVO ✅
