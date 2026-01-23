# 📊 DIAGRAMA UML DEFINITIVO v1.5.0 - Módulo Solicitudes de Bolsa

## 🎯 FLUJO DE CARGA AUTOMÁTICA (SIN APROBACIÓN, SIN dim_bolsa)

```
┌──────────────────────────────────────────────────────────────────────┐
│                 FLUJO DE CARGA AUTOMÁTICA SIMPLIFICADO                │
│              (SIN APROBACIÓN, SOLO TIPO BOLSA + ESPECIALIDAD)         │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Usuario con acceso a módulo Bolsas                                   │
│         │                                                             │
│         ▼                                                             │
│  ┌────────────────────────────────────────┐                         │
│  │ PASO 1: Seleccionar TIPO DE BOLSA      │                         │
│  │                                        │                         │
│  │ Fuente: dim_tipos_bolsas (tabla        │                         │
│  │         de referencia)                 │                         │
│  │                                        │                         │
│  │ Opciones disponibles:                  │                         │
│  │  ✅ BOLSA_107                          │                         │
│  │  ✅ BOLSA_DENGUE                       │                         │
│  │  ✅ BOLSAS_ENFERMERIA                  │                         │
│  │  ✅ BOLSAS_EXPLOTADATOS                │                         │
│  │  ✅ BOLSAS_IVR                         │                         │
│  │  ✅ BOLSAS_REPROGRAMACION              │                         │
│  │  ✅ BOLSA_GESTORES_TERRITORIAL         │                         │
│  │                                        │                         │
│  │ Usuario SELECCIONA una opción          │                         │
│  └────────────────────────────────────────┘                         │
│         │                                                             │
│         ▼                                                             │
│  ┌────────────────────────────────────────┐                         │
│  │ PASO 2: Seleccionar ESPECIALIDAD       │                         │
│  │                                        │                         │
│  │ Fuente: dim_servicio_essi (tabla       │                         │
│  │         de especialidades activas)     │                         │
│  │                                        │                         │
│  │ Opciones disponibles:                  │                         │
│  │  ✅ Cardiología                        │                         │
│  │  ✅ Neurología                         │                         │
│  │  ✅ Oncología                          │                         │
│  │  ✅ Oftalmología                       │                         │
│  │  ✅ ...más especialidades...           │                         │
│  │                                        │                         │
│  │ Usuario SELECCIONA una especialidad    │                         │
│  └────────────────────────────────────────┘                         │
│         │                                                             │
│         ▼                                                             │
│  ┌────────────────────────────────────────┐                         │
│  │ PASO 3: Cargar Archivo Excel           │                         │
│  │                                        │                         │
│  │ Campos OBLIGATORIOS en Excel:          │                         │
│  │  ✅ DNI (búsqueda en asegurados)       │                         │
│  │  ✅ Código Adscripción (IPRESS)        │                         │
│  │                                        │                         │
│  │ Campos OPCIONALES en Excel:            │                         │
│  │  • Nombres (si no, de asegurados)      │                         │
│  │  • Teléfono (si no, de asegurados)     │                         │
│  │  • Email (si no, de asegurados)        │                         │
│  └────────────────────────────────────────┘                         │
│         │                                                             │
│         ▼                                                             │
│  ┌────────────────────────────────────────┐                         │
│  │ VALIDACIÓN AUTOMÁTICA (Backend)        │                         │
│  │                                        │                         │
│  │ Para CADA fila del Excel:              │                         │
│  │  1. ¿DNI existe en asegurados?         │                         │
│  │  2. ¿Código Adscripción en dim_ipress?│                         │
│  │  3. ¿Sin duplicados en tipo bolsa?     │                         │
│  └────────────────────────────────────────┘                         │
│         │                                                             │
│    ┌────┴────┐                                                       │
│    │         │                                                       │
│ ✅ OK     ❌ ERROR                                                   │
│    │         │                                                       │
│    ▼         ▼                                                       │
│  ┌───┐  ┌──────────────────┐                                        │
│  │INS│  │ ERROR en preview: │                                        │
│  │ERT│  │ • DNI no existe   │                                        │
│  │EST│  │ • IPRESS inválido │                                        │
│  │ATE│  │ • Duplicado       │                                        │
│  │PEN│  └──────────────────┘                                        │
│  │DI│                                                                │
│  │EN│                                                                │
│  │TE│                                                                │
│  └───┘                                                                │
│    │                                                                  │
│    ▼                                                                  │
│  ┌───────────────────────────────────────┐                          │
│  │ ✅ SOLICITUD CARGADA AUTOMÁTICAMENTE  │                          │
│  │                                       │                          │
│  │ Estado: PENDIENTE                     │                          │
│  │ Listo para asignar gestor de citas    │                          │
│  └───────────────────────────────────────┘                          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 📋 TABLA CENTRAL: dim_solicitud_bolsa (v1.5.0)

### Estructura Completa Detallada

```
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║     dim_solicitud_bolsa - Solicitudes de Bolsas (Carga Automática)    ║
║                      Versión 1.5.0 - DEFINITIVA                       ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────┐
│ 🔑 IDENTIFICACIÓN PRIMARIA                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  id_solicitud                                                           │
│  └─ Tipo: BIGSERIAL (Primary Key)                                       │
│  └─ Descripción: Identificador único de la solicitud                    │
│  └─ Ejemplo: 1, 2, 3, ...                                               │
│                                                                          │
│  numero_solicitud                                                       │
│  └─ Tipo: VARCHAR(50), UNIQUE, NOT NULL                                 │
│  └─ Descripción: Número único de referencia (generado)                  │
│  └─ Formato: BOLSA-YYYYMMDD-XXXXX                                       │
│  └─ Ejemplo: BOLSA-20260123-00001                                       │
│  └─ Generación: Automática en backend                                   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 🏥 INFORMACIÓN DE IPRESS (Datos del paciente - de dónde es)             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  codigo_adscripcion ◄─── CAMPO MÍNIMO OBLIGATORIO EN EXCEL              │
│  └─ Tipo: VARCHAR(20), NOT NULL                                         │
│  └─ Descripción: Código de adscripción del paciente                     │
│  └─ Origen: Excel (usuario proporciona)                                 │
│  └─ Validación: DEBE existir en dim_ipress.cod_ipress                  │
│  └─ Ejemplo: "349"                                                      │
│  └─ Propósito: Vincular a la IPRESS del paciente                        │
│                                                                          │
│  id_ipress                                                              │
│  └─ Tipo: BIGINT, Foreign Key                                           │
│  └─ Referencia: dim_ipress.id_ipress                                    │
│  └─ Descripción: ID de la IPRESS en la BD                               │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (Backend valida codigo_adscripcion en dim_ipress)                   │
│  └─ ON DELETE: SET NULL                                                 │
│                                                                          │
│  nombre_ipress                                                          │
│  └─ Tipo: VARCHAR(255)                                                  │
│  └─ Descripción: Nombre de la IPRESS (desnormalizado)                   │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_ipress.desc_ipress)                                         │
│  └─ Propósito: Caché para búsquedas rápidas                             │
│  └─ Ejemplo: "H.II PUCALLPA"                                            │
│                                                                          │
│  red_asistencial                                                        │
│  └─ Tipo: VARCHAR(255)                                                  │
│  └─ Descripción: Nombre de la Red Asistencial (desnormalizado)          │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_red.desc_red vía dim_ipress.id_red)                         │
│  └─ Propósito: Caché para búsquedas rápidas y display                   │
│  └─ Ejemplo: "RED ASISTENCIAL UCAYALI"                                  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 📦 TIPO DE BOLSA SELECCIONADA (PASO 1)                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  id_tipo_bolsa ◄─── CAMPO OBLIGATORIO SELECCIONADO EN PASO 1            │
│  └─ Tipo: BIGINT, Foreign Key, NOT NULL                                 │
│  └─ Referencia: dim_tipos_bolsas.id_tipo_bolsa                          │
│  └─ Origen: SELECTOR (Usuario selecciona en dropdown)                   │
│  └─ Validación: DEBE existir en dim_tipos_bolsas                        │
│                 DEBE estar activo (stat_tipo_bolsa = 'A')               │
│  └─ Propósito: Categorizar qué tipo de bolsa es                         │
│  └─ Ejemplo: 1 (BOLSA_107)                                              │
│  └─ ON DELETE: RESTRICT (no permitir eliminar tipo si hay solicitudes)  │
│                                                                          │
│  cod_tipo_bolsa (OPCIONAL - para display)                               │
│  └─ Tipo: TEXT                                                          │
│  └─ Descripción: Código del tipo de bolsa (desnormalizado)              │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_tipos_bolsas.cod_tipo_bolsa)                                │
│  └─ Ejemplo: "BOLSA_107"                                                │
│                                                                          │
│  desc_tipo_bolsa (OPCIONAL - para display)                              │
│  └─ Tipo: TEXT                                                          │
│  └─ Descripción: Descripción del tipo de bolsa (desnormalizado)         │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_tipos_bolsas.desc_tipo_bolsa)                               │
│  └─ Ejemplo: "Bolsa 107 - Importación de pacientes masiva"              │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 🏥 ESPECIALIDAD SELECCIONADA (PASO 2)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  id_servicio ◄─── CAMPO OBLIGATORIO SELECCIONADO EN PASO 2              │
│  └─ Tipo: BIGINT, Foreign Key, NOT NULL                                 │
│  └─ Referencia: dim_servicio_essi.id_servicio                           │
│  └─ Origen: SELECTOR (Usuario selecciona en dropdown)                   │
│  └─ Validación: DEBE existir en dim_servicio_essi                       │
│                 DEBE estar activo (estado = 'A')                        │
│  └─ Propósito: Especificar qué especialidad se requiere                 │
│  └─ Ejemplo: 1 (Cardiología)                                            │
│  └─ ON DELETE: RESTRICT (no permitir eliminar especialidad)             │
│                                                                          │
│  especialidad                                                           │
│  └─ Tipo: VARCHAR(255)                                                  │
│  └─ Descripción: Nombre de la especialidad (desnormalizado)             │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_servicio_essi.desc_servicio)                                │
│  └─ Propósito: Caché para búsquedas rápidas                             │
│  └─ Ejemplo: "Cardiología"                                              │
│                                                                          │
│  cod_servicio (OPCIONAL - para display)                                 │
│  └─ Tipo: VARCHAR(10)                                                   │
│  └─ Descripción: Código de la especialidad (desnormalizado)             │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_servicio_essi.cod_servicio)                                 │
│  └─ Ejemplo: "001"                                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 👤 DATOS DEL PACIENTE (Campos mínimos obligatorios del Excel)           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  paciente_dni ◄─── CAMPO MÍNIMO OBLIGATORIO EN EXCEL                    │
│  └─ Tipo: VARCHAR(20), NOT NULL                                         │
│  └─ Descripción: DNI del paciente                                       │
│  └─ Origen: Excel (usuario proporciona)                                 │
│  └─ Validación: DEBE existir en asegurados.doc_paciente                │
│  └─ Índice: Sí (para búsquedas rápidas)                                 │
│  └─ Ejemplo: "12345678"                                                 │
│  └─ Propósito: Vincular a datos del paciente en asegurados              │
│                                                                          │
│  paciente_id                                                            │
│  └─ Tipo: BIGINT, Foreign Key, NOT NULL                                 │
│  └─ Referencia: asegurados.pk_asegurado                                 │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (Backend busca el DNI en asegurados)                                │
│  └─ Propósito: Vincular a tabla principal de pacientes                  │
│                                                                          │
│  paciente_nombre                                                        │
│  └─ Tipo: VARCHAR(255), NOT NULL                                        │
│  └─ Descripción: Nombre completo del paciente (desnormalizado)          │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De asegurados.paciente)                                            │
│  └─ Propósito: Caché para búsquedas rápidas y display                   │
│  └─ Ejemplo: "Juan Pérez García"                                        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 📊 ESTADO Y SEGUIMIENTO (Simplificado - Sin aprobación)                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  estado                                                                 │
│  └─ Tipo: VARCHAR(20), NOT NULL, DEFAULT='PENDIENTE'                    │
│  └─ Valores permitidos:                                                 │
│     • PENDIENTE    ← Estado inicial (sin aprobación)                     │
│     • EN_GESTION   ← Gestor está coordinando cita                        │
│     • COMPLETADA   ← Cita realizada/completada                          │
│     • CANCELADA    ← Solicitud cancelada                                │
│  └─ Constraint: CHECK (estado IN (...))                                 │
│  └─ Índice: Sí (para filtrar por estado)                                │
│  └─ Descripción: ❌ NO hay aprobación. Se crea directamente en PENDIENTE │
│  └─ Cambios posteriores: Actualizado por gestor según progreso          │
│                                                                          │
│  solicitante_id                                                         │
│  └─ Tipo: BIGINT, Foreign Key                                           │
│  └─ Referencia: dim_usuarios.id_user                                    │
│  └─ Descripción: Usuario que CARGÓ la solicitud (subió Excel)           │
│  └─ Origen: REGISTRADO AUTOMÁTICAMENTE                                  │
│     (Usuario actual del sistema)                                        │
│  └─ Rol: Cualquiera con acceso a módulo Bolsas                          │
│  └─ ON DELETE: SET NULL                                                 │
│                                                                          │
│  solicitante_nombre                                                     │
│  └─ Tipo: VARCHAR(255)                                                  │
│  └─ Descripción: Nombre del usuario solicitante (desnormalizado)        │
│  └─ Origen: OBTENIDO AUTOMÁTICAMENTE                                    │
│     (De dim_usuarios.name_user)                                         │
│  └─ Propósito: Auditoría y display                                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 👤 GESTOR DE CITAS ASIGNADO (Posterior a la carga)                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  responsable_gestora_id                                                 │
│  └─ Tipo: BIGINT, Foreign Key                                           │
│  └─ Referencia: dim_usuarios.id_user                                    │
│  └─ Descripción: Usuario gestor de citas asignado                       │
│  └─ Restricción: Usuario debe tener rol "GESTOR DE CITAS"               │
│  └─ Origen: ASIGNADO POSTERIORMENTE                                     │
│     (Manual por admin O automático por sistema)                         │
│  └─ Cuándo: DESPUÉS de que la solicitud fue CARGADA                     │
│  └─ Valor inicial: NULL (sin asignar)                                   │
│  └─ Propósito: Coordinar cita del paciente                              │
│  └─ ON DELETE: SET NULL                                                 │
│  └─ Índice: Sí (para filtrar por gestor)                                │
│                                                                          │
│  fecha_asignacion                                                       │
│  └─ Tipo: TIMESTAMP WITH TIME ZONE                                      │
│  └─ Descripción: Fecha/hora cuando se asignó el gestor                  │
│  └─ Origen: REGISTRADA AUTOMÁTICAMENTE                                  │
│     (CURRENT_TIMESTAMP al asignar)                                      │
│  └─ Valor inicial: NULL (sin asignar)                                   │
│  └─ Propósito: Auditoría                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ 🔄 GESTIÓN DE CITAS (Seguimiento posterior)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  estado_gestion_citas_id                                                │
│  └─ Tipo: BIGINT, Foreign Key                                           │
│  └─ Referencia: dim_estados_gestion_citas.id_estado_cita                │
│  └─ Descripción: Estado actual del caso/cita                            │
│  └─ Estados posibles:                                                   │
│     • CITADO         - Paciente tiene cita agendada                      │
│     • NO_CONTESTA    - Paciente no contesta                             │
│     • CANCELADO      - Cita cancelada por paciente                       │
│     • ASISTIO        - Paciente asistió                                  │
│     • NO_ASISTIO     - Paciente no asistió                               │
│     • ... (más estados)                                                 │
│  └─ Valor inicial: NULL                                                 │
│  └─ Actualizado por: Gestor de citas según progreso                     │
│  └─ ON DELETE: SET NULL                                                 │
│  └─ Índice: Sí (para filtrar por estado de gestión)                     │
│                                                                          │
│  recordatorio_enviado                                                   │
│  └─ Tipo: BOOLEAN, DEFAULT=false                                        │
│  └─ Descripción: ¿Se envió recordatorio al paciente?                    │
│  └─ Propósito: Flag para evitar recordatorios duplicados                │
│  └─ Actualizado por: Sistema de notificaciones                          │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ ⏰ AUDITORÍA Y CONTROL                                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  fecha_solicitud                                                        │
│  └─ Tipo: TIMESTAMP WITH TIME ZONE, NOT NULL                            │
│  └─ Default: CURRENT_TIMESTAMP                                          │
│  └─ Descripción: Fecha/hora de creación de la solicitud                 │
│  └─ Origen: REGISTRADA AUTOMÁTICAMENTE                                  │
│     (Trigger automático de PostgreSQL)                                  │
│  └─ Propósito: Rastrear cuándo se cargó                                 │
│  └─ Índice: Sí (para ordenar por fecha)                                 │
│                                                                          │
│  fecha_actualizacion                                                    │
│  └─ Tipo: TIMESTAMP WITH TIME ZONE, NOT NULL                            │
│  └─ Default: CURRENT_TIMESTAMP                                          │
│  └─ Descripción: Última fecha de actualización                          │
│  └─ Origen: ACTUALIZADA AUTOMÁTICAMENTE                                 │
│     (Trigger: update_solicitud_actualizacion())                         │
│  └─ Propósito: Auditoría de cambios                                     │
│  └─ Se actualiza: En cada UPDATE a la solicitud                         │
│                                                                          │
│  activo                                                                 │
│  └─ Tipo: BOOLEAN, NOT NULL, DEFAULT=true                               │
│  └─ Descripción: Indicador de registro activo/eliminado                 │
│  └─ true = registro activo                                              │
│  └─ false = registro marcado como eliminado (soft delete)               │
│  └─ Propósito: Eliminación lógica sin perder auditoría                  │
│  └─ Índice: Sí (para filtrar activos/inactivos)                         │
│  └─ Nota: Nunca se elimina físicamente de la BD                         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 🔗 RELACIONES DE FOREIGN KEYS (Matriz de Integridad)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FOREIGN KEYS - v1.5.0                           │
├──────┬────────────────────────────┬──────────────────────────┬──────────┤
│ # │ De: Columna                │ Referencia: Tabla.Campo  │ Acción   │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 1    │ dim_solicitud_bolsa        │ dim_tipos_bolsas         │ RESTRICT │
│      │ .id_tipo_bolsa             │ .id_tipo_bolsa           │          │
│      │ (obligatorio)              │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 2    │ dim_solicitud_bolsa        │ dim_servicio_essi        │ RESTRICT │
│      │ .id_servicio               │ .id_servicio             │          │
│      │ (obligatorio)              │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 3    │ dim_solicitud_bolsa        │ dim_ipress               │ SET NULL │
│      │ .id_ipress                 │ .id_ipress               │          │
│      │ (opcional)                 │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 4    │ dim_solicitud_bolsa        │ dim_usuarios             │ SET NULL │
│      │ .solicitante_id            │ .id_user                 │          │
│      │ (auditoría)                │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 5    │ dim_solicitud_bolsa        │ dim_usuarios             │ SET NULL │
│      │ .responsable_gestora_id    │ .id_user                 │          │
│      │ (asignación)               │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 6    │ dim_solicitud_bolsa        │ dim_estados_gestion_citas│ SET NULL │
│      │ .estado_gestion_citas_id   │ .id_estado_cita          │          │
│      │ (gestión)                  │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 7    │ dim_tipos_bolsas           │ (ninguna)                │ N/A      │
│      │ (tabla independiente)      │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 8    │ dim_servicio_essi          │ (ninguna)                │ N/A      │
│      │ (tabla independiente)      │                          │          │
├──────┼────────────────────────────┼──────────────────────────┼──────────┤
│ 9    │ dim_ipress                 │ dim_red                  │ RESTRICT │
│      │ .id_red                    │ .id_red                  │          │
│      │ (información geografía)    │                          │          │
└──────┴────────────────────────────┴──────────────────────────┴──────────┘
```

---

## 📦 TABLAS DE REFERENCIA (Catálogos Existentes)

```
┌────────────────────────────────────┐
│     dim_tipos_bolsas               │  ◄─── TIPOS DE BOLSAS (PASO 1)
├────────────────────────────────────┤
│ PK: id_tipo_bolsa (BIGSERIAL)      │
│ • cod_tipo_bolsa (VARCHAR, UNQ)    │
│ • desc_tipo_bolsa (TEXT, NOT NULL) │
│ • stat_tipo_bolsa (TEXT, 'A'|'I')  │
│ • created_at (TIMESTAMP)           │
│ • updated_at (TIMESTAMP)           │
│                                    │
│ Datos iniciales (7 tipos):         │
│  1. BOLSA_107                      │
│  2. BOLSA_DENGUE                   │
│  3. BOLSAS_ENFERMERIA              │
│  4. BOLSAS_EXPLOTADATOS            │
│  5. BOLSAS_IVR                     │
│  6. BOLSAS_REPROGRAMACION          │
│  7. BOLSA_GESTORES_TERRITORIAL     │
└────────────────────────────────────┘


┌────────────────────────────────────┐
│   dim_servicio_essi                │  ◄─── ESPECIALIDADES (PASO 2)
├────────────────────────────────────┤
│ PK: id_servicio (BIGSERIAL)        │
│ • cod_servicio (VARCHAR 10)        │
│ • desc_servicio (TEXT, NOT NULL)   │
│ • es_cenate (BOOLEAN)              │
│ • estado (CHAR 1, 'A'|'I')         │
│ • created_at (TIMESTAMP)           │
│ • updated_at (TIMESTAMP)           │
│                                    │
│ Ejemplo de especialidades:         │
│  • Cardiología                     │
│  • Neurología                      │
│  • Oncología                       │
│  • Oftalmología                    │
│  • ... (más servicios)             │
└────────────────────────────────────┘


┌────────────────────────────────────┐
│   dim_ipress                       │  ◄─── CENTROS IPRESS
├────────────────────────────────────┤
│ PK: id_ipress (BIGSERIAL)          │
│ • cod_ipress (VARCHAR)             │
│ • desc_ipress (VARCHAR, NOT NULL)  │
│ • id_red (BIGINT, FK)              │
│ • direc_ipress (VARCHAR)           │
│ • id_tip_ipress (BIGINT, FK)       │
│ • id_niv_aten (BIGINT, FK)         │
│ • stat_ipress (CHAR 1, 'A'|'I')    │
│                                    │
│ Ejemplo:                           │
│  • cod_ipress: 349                 │
│  • desc_ipress: H.II PUCALLPA      │
└────────────────────────────────────┘


┌────────────────────────────────────┐
│   dim_red                          │  ◄─── RED ASISTENCIAL
├────────────────────────────────────┤
│ PK: id_red (BIGSERIAL)             │
│ • cod_red (TEXT)                   │
│ • desc_red (TEXT, NOT NULL)        │
│ • id_macro (BIGINT, FK)            │
│                                    │
│ Ejemplo:                           │
│  • desc_red: RED ASISTENCIAL UCAYALI
└────────────────────────────────────┘


┌──────────────────────────────────────────┐
│  dim_estados_gestion_citas               │  ◄─── ESTADOS DEL CASO
├──────────────────────────────────────────┤
│ PK: id_estado_cita (BIGSERIAL)           │
│ • cod_estado_cita (TEXT, UNQ)            │
│ • desc_estado_cita (TEXT, NOT NULL)      │
│ • stat_estado_cita (TEXT, 'A'|'I')       │
│ • created_at (TIMESTAMP)                 │
│ • updated_at (TIMESTAMP)                 │
│                                          │
│ Datos iniciales (10 estados):            │
│  CITADO, NO_CONTESTA, CANCELADO, etc.    │
└──────────────────────────────────────────┘


┌────────────────────────────────────┐
│   dim_usuarios                     │  ◄─── USUARIOS DEL SISTEMA
├────────────────────────────────────┤
│ PK: id_user (BIGSERIAL)            │
│ • name_user (VARCHAR, UNQ)         │
│ • pass_user (VARCHAR)              │
│ • stat_user (VARCHAR)              │
│ • ...otros campos...               │
└────────────────────────────────────┘


┌────────────────────────────────────┐
│   asegurados                       │  ◄─── INFORMACIÓN DE PACIENTES
├────────────────────────────────────┤
│ PK: pk_asegurado (INTEGER)         │
│ • doc_paciente (VARCHAR)           │
│ • paciente (VARCHAR)               │
│ • tel_fijo (VARCHAR)               │
│ • tel_celular (VARCHAR)            │
│ • correo_electronico (VARCHAR)     │
│ • cas_adscripcion (VARCHAR)        │
│ • ...otros campos...               │
└────────────────────────────────────┘
```

---

## ✅ CAMPOS MÍNIMOS OBLIGATORIOS

```
┌──────────────────────────────────────────────────────────────────┐
│             PARA QUE LA SOLICITUD CARGUE EXITOSAMENTE             │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│ 📋 EN EL EXCEL (Usuario PROPORCIONA):                             │
│   ✅ paciente_dni                                                │
│      └─ Obligatorio, usado para buscar en asegurados             │
│      └─ Ejemplo: "12345678"                                      │
│                                                                   │
│   ✅ codigo_adscripcion                                          │
│      └─ Obligatorio, usado para buscar en dim_ipress             │
│      └─ Ejemplo: "349"                                           │
│                                                                   │
│ 🎯 EN EL SELECTOR (Usuario SELECCIONA):                           │
│   ✅ id_tipo_bolsa (PASO 1)                                      │
│      └─ Obligatorio, de dim_tipos_bolsas                         │
│      └─ Ejemplo: 1 (BOLSA_107)                                   │
│                                                                   │
│   ✅ id_servicio (PASO 2)                                        │
│      └─ Obligatorio, de dim_servicio_essi                        │
│      └─ Ejemplo: 1 (Cardiología)                                 │
│                                                                   │
│ 🤖 SISTEMA COMPLETA AUTOMÁTICAMENTE:                              │
│   • paciente_id ← busca en asegurados por DNI                    │
│   • paciente_nombre ← obtiene de asegurados.paciente             │
│   • id_ipress ← busca en dim_ipress por codigo_adscripcion       │
│   • nombre_ipress ← obtiene de dim_ipress.desc_ipress            │
│   • red_asistencial ← obtiene de dim_red vía dim_ipress.id_red   │
│   • especialidad ← obtiene de dim_servicio_essi.desc_servicio    │
│   • solicitante_id ← usuario actual del sistema                  │
│   • solicitante_nombre ← obtiene de dim_usuarios                 │
│   • estado ← 'PENDIENTE' (default)                               │
│   • fecha_solicitud ← CURRENT_TIMESTAMP                          │
│   • activo ← true                                                │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 LISTA COMPLETA DE COLUMNAS v1.5.0

| # | Columna | Tipo | Obligatorio | FK | Índice | Origen |
|----|---------|------|:-----------:|:-:|:------:|--------|
| 1 | `id_solicitud` | BIGSERIAL | ✅ | PK | ✅ | Auto (Secuencia) |
| 2 | `numero_solicitud` | VARCHAR(50) | ✅ | UNQ | ✅ | Auto (Backend) |
| 3 | `codigo_adscripcion` | VARCHAR(20) | ✅ | - | - | Excel |
| 4 | `id_tipo_bolsa` | BIGINT | ✅ | FK | ✅ | Selector (PASO 1) |
| 5 | `cod_tipo_bolsa` | TEXT | - | - | - | Auto (FK) |
| 6 | `desc_tipo_bolsa` | TEXT | - | - | - | Auto (FK) |
| 7 | `id_servicio` | BIGINT | ✅ | FK | ✅ | Selector (PASO 2) |
| 8 | `especialidad` | VARCHAR(255) | - | - | - | Auto (FK) |
| 9 | `cod_servicio` | VARCHAR(10) | - | - | - | Auto (FK) |
| 10 | `paciente_dni` | VARCHAR(20) | ✅ | - | ✅ | Excel |
| 11 | `paciente_id` | BIGINT | ✅ | FK | - | Auto (Excel→Validación) |
| 12 | `paciente_nombre` | VARCHAR(255) | ✅ | - | - | Auto (FK) |
| 13 | `id_ipress` | BIGINT | - | FK | ✅ | Auto (Excel→Validación) |
| 14 | `nombre_ipress` | VARCHAR(255) | - | - | - | Auto (FK) |
| 15 | `red_asistencial` | VARCHAR(255) | - | - | - | Auto (FK) |
| 16 | `estado` | VARCHAR(20) | ✅ | - | ✅ | Auto (Default='PENDIENTE') |
| 17 | `solicitante_id` | BIGINT | - | FK | ✅ | Auto (Usuario actual) |
| 18 | `solicitante_nombre` | VARCHAR(255) | - | - | - | Auto (FK) |
| 19 | `responsable_gestora_id` | BIGINT | - | FK | ✅ | Manual (Posterior) |
| 20 | `fecha_asignacion` | TIMESTAMP TZ | - | - | - | Auto (Al asignar) |
| 21 | `estado_gestion_citas_id` | BIGINT | - | FK | ✅ | Manual (Gestor) |
| 22 | `recordatorio_enviado` | BOOLEAN | - | - | - | Auto (Sistema) |
| 23 | `fecha_solicitud` | TIMESTAMP TZ | ✅ | - | ✅ | Auto (CURRENT_TIMESTAMP) |
| 24 | `fecha_actualizacion` | TIMESTAMP TZ | ✅ | - | - | Auto (Trigger) |
| 25 | `activo` | BOOLEAN | ✅ | - | ✅ | Auto (Default=true) |

---

## 🔧 FLUJO DE DATOS (De dónde vienen los datos)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         ORIGEN DE DATOS                                 │
└─────────────────────────────────────────────────────────────────────────┘

ENTRADA EXCEL (Usuario proporciona):
  📝 paciente_dni ────────────┐
  📝 codigo_adscripcion ─────┐│
                             ││
VALIDACIÓN BACKEND:          ││
  ├─ Busca DNI en asegurados:││
  │  ├─ ¿Existe?             ││
  │  │ ✅ Sí → obtiene paciente_id, paciente_nombre ││
  │  └─ ❌ No → ERROR         ││
  │                          ││
  └─ Busca codigo_adscripcion en dim_ipress: ││
     ├─ ¿Existe?             ││
     │ ✅ Sí → obtiene id_ipress, nombre_ipress ││
     │       → obtiene id_red vía dim_ipress ││
     │       → obtiene red_asistencial de dim_red
     │ ❌ No → ERROR         ││
     └─                      ││
                             ││
ENTRADA SELECTOR (Usuario selecciona):
  🎯 id_tipo_bolsa (PASO 1) ─┘│
  │                           │
  └─ Obtiene automáticamente: │
     • cod_tipo_bolsa         │
     • desc_tipo_bolsa        │
                              │
  🏥 id_servicio (PASO 2) ────┘
     │
     └─ Obtiene automáticamente:
        • especialidad
        • cod_servicio

USUARIO DEL SISTEMA:
  👤 solicitante_id (usuario actual)
     └─ Obtiene automáticamente: solicitante_nombre

POSTERIOR (Manual):
  👤 responsable_gestora_id (asignación manual posterior)
  🔄 estado_gestion_citas_id (actualización por gestor)

AUTOMÁTICO (Sistema):
  ⏰ fecha_solicitud (CURRENT_TIMESTAMP)
  ⏰ fecha_actualizacion (Trigger)
  📊 estado (Default='PENDIENTE')
  ✅ activo (Default=true)
```

---

## 🎯 RESTRICCIONES Y VALIDACIONES

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    VALIDACIONES EN CARGA                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│ 1️⃣ VALIDACIÓN DNI:                                                     │
│    └─ ¿paciente_dni EXISTS en asegurados.doc_paciente?                 │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → Mostrar en preview                                     │
│                                                                          │
│ 2️⃣ VALIDACIÓN CÓDIGO ADSCRIPCIÓN:                                      │
│    └─ ¿codigo_adscripcion EXISTS en dim_ipress.cod_ipress?             │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → Mostrar en preview                                     │
│                                                                          │
│ 3️⃣ VALIDACIÓN TIPO BOLSA:                                              │
│    └─ ¿id_tipo_bolsa EXISTS en dim_tipos_bolsas?                       │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → No permitir subir                                      │
│                                                                          │
│ 4️⃣ VALIDACIÓN ESPECIALIDAD:                                            │
│    └─ ¿id_servicio EXISTS en dim_servicio_essi?                        │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → No permitir subir                                      │
│                                                                          │
│ 5️⃣ VALIDACIÓN DUPLICADOS:                                              │
│    └─ ¿UNIQUE(id_tipo_bolsa, paciente_id, id_servicio)?                │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → Mostrar en preview (paciente ya en bolsa)              │
│                                                                          │
│ 6️⃣ VALIDACIÓN ESTADO ACTIVO:                                           │
│    └─ ¿dim_tipos_bolsas.stat_tipo_bolsa = 'A'?                         │
│    └─ ¿dim_servicio_essi.estado = 'A'?                                 │
│       ✅ OK → Continúa                                                  │
│       ❌ ERROR → No permitir                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 SQL DDL FINAL (Estructura de la tabla)

```sql
CREATE TABLE IF NOT EXISTS public.dim_solicitud_bolsa (
    -- 🔑 IDENTIFICACIÓN
    id_solicitud BIGSERIAL PRIMARY KEY,
    numero_solicitud VARCHAR(50) NOT NULL UNIQUE,

    -- 📦 TIPO DE BOLSA (PASO 1)
    id_tipo_bolsa BIGINT NOT NULL,
    cod_tipo_bolsa TEXT,
    desc_tipo_bolsa TEXT,

    -- 🏥 ESPECIALIDAD (PASO 2)
    id_servicio BIGINT NOT NULL,
    especialidad VARCHAR(255),
    cod_servicio VARCHAR(10),

    -- 👤 DATOS DEL PACIENTE
    paciente_dni VARCHAR(20) NOT NULL,
    paciente_id BIGINT NOT NULL,
    paciente_nombre VARCHAR(255) NOT NULL,

    -- 🏥 INFORMACIÓN IPRESS
    codigo_adscripcion VARCHAR(20) NOT NULL,
    id_ipress BIGINT,
    nombre_ipress VARCHAR(255),
    red_asistencial VARCHAR(255),

    -- 📊 ESTADO Y SOLICITANTE
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE'
        CHECK (estado IN ('PENDIENTE', 'EN_GESTION', 'COMPLETADA', 'CANCELADA')),
    solicitante_id BIGINT,
    solicitante_nombre VARCHAR(255),

    -- 👤 GESTOR DE CITAS
    responsable_gestora_id BIGINT,
    fecha_asignacion TIMESTAMP WITH TIME ZONE,

    -- 🔄 GESTIÓN DE CITAS
    estado_gestion_citas_id BIGINT,
    recordatorio_enviado BOOLEAN DEFAULT false,

    -- ⏰ AUDITORÍA
    fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT true,

    -- 🔗 FOREIGN KEYS
    CONSTRAINT fk_solicitud_tipo_bolsa FOREIGN KEY (id_tipo_bolsa)
        REFERENCES public.dim_tipos_bolsas(id_tipo_bolsa) ON DELETE RESTRICT,

    CONSTRAINT fk_solicitud_servicio FOREIGN KEY (id_servicio)
        REFERENCES public.dim_servicio_essi(id_servicio) ON DELETE RESTRICT,

    CONSTRAINT fk_solicitud_paciente FOREIGN KEY (paciente_id)
        REFERENCES public.asegurados(pk_asegurado) ON DELETE RESTRICT,

    CONSTRAINT fk_solicitud_ipress FOREIGN KEY (id_ipress)
        REFERENCES public.dim_ipress(id_ipress) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_solicitud_solicitante FOREIGN KEY (solicitante_id)
        REFERENCES public.dim_usuarios(id_user) ON DELETE SET NULL,

    CONSTRAINT fk_solicitud_gestor FOREIGN KEY (responsable_gestora_id)
        REFERENCES public.dim_usuarios(id_user) ON UPDATE CASCADE ON DELETE SET NULL,

    CONSTRAINT fk_solicitud_estado_gestion FOREIGN KEY (estado_gestion_citas_id)
        REFERENCES public.dim_estados_gestion_citas(id_estado_cita) ON DELETE SET NULL,

    -- 🔐 CONSTRAINT ÚNICA
    CONSTRAINT solicitud_tipo_paciente_servicio_unique
        UNIQUE (id_tipo_bolsa, paciente_id, id_servicio)
);

-- 📊 ÍNDICES
CREATE INDEX idx_solicitud_tipo_bolsa ON public.dim_solicitud_bolsa(id_tipo_bolsa);
CREATE INDEX idx_solicitud_servicio ON public.dim_solicitud_bolsa(id_servicio);
CREATE INDEX idx_solicitud_paciente_dni ON public.dim_solicitud_bolsa(paciente_dni);
CREATE INDEX idx_solicitud_ipress ON public.dim_solicitud_bolsa(id_ipress);
CREATE INDEX idx_solicitud_estado ON public.dim_solicitud_bolsa(estado);
CREATE INDEX idx_solicitud_gestor ON public.dim_solicitud_bolsa(responsable_gestora_id);
CREATE INDEX idx_solicitud_estado_gestion ON public.dim_solicitud_bolsa(estado_gestion_citas_id);
CREATE INDEX idx_solicitud_fecha ON public.dim_solicitud_bolsa(fecha_solicitud);
CREATE INDEX idx_solicitud_activo ON public.dim_solicitud_bolsa(activo);
```

---

## 📝 EJEMPLO PRÁCTICO (Solicitud Cargada)

```
SOLICITUD CREADA AUTOMÁTICAMENTE:

┌─────────────────────────────────────────┐
│ id_solicitud: 1                         │
│ numero_solicitud: BOLSA-20260123-00001  │
├─────────────────────────────────────────┤
│ 📦 TIPO DE BOLSA (Usuario selecciona):  │
│   id_tipo_bolsa: 1                      │
│   cod_tipo_bolsa: BOLSA_107             │
│   desc_tipo_bolsa: Bolsa 107 - Importac...
├─────────────────────────────────────────┤
│ 🏥 ESPECIALIDAD (Usuario selecciona):   │
│   id_servicio: 1                        │
│   especialidad: Cardiología             │
│   cod_servicio: 001                     │
├─────────────────────────────────────────┤
│ 👤 PACIENTE (Del Excel):                │
│   paciente_dni: 12345678 ◄─── Excel     │
│   paciente_id: 456 ◄─── Auto (búsqueda) │
│   paciente_nombre: Juan Pérez García    │
├─────────────────────────────────────────┤
│ 🏥 IPRESS (Del Excel):                  │
│   codigo_adscripcion: 349 ◄─── Excel    │
│   id_ipress: 5 ◄─── Auto (búsqueda)     │
│   nombre_ipress: H.II PUCALLPA          │
│   red_asistencial: RED ASISTENCIAL UCAYALI
├─────────────────────────────────────────┤
│ 📊 ESTADO (Sistema):                    │
│   estado: PENDIENTE (sin aprobación)    │
│   solicitante_id: 1                     │
│   solicitante_nombre: Carlos Admin      │
├─────────────────────────────────────────┤
│ ⏳ PENDIENTE DE ASIGNACIÓN:              │
│   responsable_gestora_id: NULL          │
│   fecha_asignacion: NULL                │
│   estado_gestion_citas_id: NULL         │
├─────────────────────────────────────────┤
│ ⏰ AUDITORÍA:                            │
│   fecha_solicitud: 2026-01-23 10:30:00  │
│   fecha_actualizacion: 2026-01-23...    │
│   activo: true                          │
└─────────────────────────────────────────┘
```

---

## ✅ RESUMEN v1.5.0 DEFINITIVO

```
✅ Carga automática SIN aprobación
✅ Selecciones: TIPO BOLSA (dim_tipos_bolsas) + ESPECIALIDAD (dim_servicio_essi)
✅ Campos mínimos Excel: DNI + Código Adscripción
✅ Tablas usadas: 7 tablas de referencia + 1 tabla central
✅ Foreign Keys: 7 relaciones de integridad
✅ Índices: 9 índices para optimizar búsquedas
✅ Estado inicial: PENDIENTE (sin validadores)
✅ Flujo simplificado: Seleccionar tipo/especialidad → Cargar Excel → Insertar
✅ Sin dim_bolsa: Tabla rechazada, no se usa
✅ Único archivo UML: Este documento (v1.5.0 DEFINITIVO)
```

---

**Versión:** 1.5.0 DEFINITIVO | **Fecha:** 2026-01-23 | **Status:** ✅ APROBADO PARA IMPLEMENTACIÓN

---

¿**ESTÁ CORRECTO ESTE UML v1.5.0?** ¿Puedo proceder con la implementación?
