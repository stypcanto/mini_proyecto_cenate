# 🏥 Flujo Completo de Atenciones - Bolsas → Médico

> **Versión:** v1.45.2
> **Última actualización:** 2026-02-05
> **Estado:** ✅ Documentado Completamente

---

## 📊 Diagrama del Flujo Completo

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    FLUJO DE ATENCIONES CENATE                            │
│                 Paciente desde Bolsa hasta Médico                        │
└──────────────────────────────────────────────────────────────────────────┘

PASO 1: GENERACIÓN EN BOLSAS
┌─────────────────────────────────────┐
│  📦 Módulo 107 / Dengue / etc.      │
│  (dim_solicitud_bolsa)              │
│                                     │
│  Paciente creado en bolsa           │
│  Estado: Pendiente                  │
│  Rol: COORDINADOR                   │
└─────────────┬───────────────────────┘
              ↓

PASO 2: COORDINADOR GESTIÓN CITAS ASIGNA MÉDICO
┌─────────────────────────────────────┐
│  👤 Coordinador Gestión Citas       │
│  (dim_solicitud_bolsa.id_personal)  │
│                                     │
│  Asigna médico al paciente          │
│  Estado: Citado / Pendiente         │
│  Rol: COORDINADOR_GESTION_CITAS     │
└─────────────┬───────────────────────┘
              ↓

PASO 3: GESTIÓN DE CITAS MANEJA ESTADO
┌──────────────────────────────────────┐
│  📋 Módulo Gestión Citas             │
│  (solicitud_cita)                    │
│                                      │
│  Registra cita del paciente          │
│  Estados: CITADO, EN_PROCESO, etc.   │
│  Rol: COORDINADOR                    │
└─────────────┬──────────────────────┘
              ↓

PASO 4: MÉDICO ATIENDE PACIENTE
┌──────────────────────────────────────┐
│  👨‍⚕️ Médico                          │
│  (MisPacientes.jsx)                  │
│                                      │
│  Atiende paciente                    │
│  Acciones: Marcar Atendido,          │
│           Generar Receta,            │
│           Generar Interconsulta      │
│  Rol: MEDICO                         │
└──────────────────────────────────────┘
              ↓
        ✅ ATENDIDO
```

---

## 🔄 Etapas Detalladas del Flujo

### ETAPA 1: 📦 Generación en Bolsas (Módulo 107/Dengue/etc.)

**Tabla principal:** `dim_solicitud_bolsa`

**Documentación:**
- 📄 [`spec/backend/09_modules_bolsas/ARQUITECTURA_v1.42.0.md`](../backend/09_modules_bolsas/ARQUITECTURA_v1.42.0.md)
- 📊 [`spec/database/12_tabla_dim_solicitud_bolsa_estructura.md`](../database/12_tabla_dim_solicitud_bolsa_estructura.md)

**Campos clave:**
```sql
dim_solicitud_bolsa {
  id_solicitud_bolsa,           -- PK
  paciente_dni,                 -- Identificador paciente
  paciente_nombre,              -- Nombre completo
  estado,                       -- Pendiente, Citado, etc.
  id_personal,                  -- ⭐ ID MÉDICO ASIGNADO (null si no asignado)
  fecha_asignacion,             -- Cuándo se asignó médico
  codigo_ipress_adscripcion,    -- IPRESS (ej: "450")
  activo                        -- true=activo, false=inactivo
}
```

**Roles involucrados:** COORDINADOR (ve universal de bolsas)

**API endpoints:**
- `GET /api/bolsas/solicitudes` - Ver todas las bolsas
- `GET /api/bolsas/modulo107/pacientes` - Ver Módulo 107
- `GET /api/dengue/buscar` - Ver Dengue

**Usuario típico:**
- 👤 Coordinador de Bolsas
- Visualiza: 7,973 pacientes en universo general
- Acciones: Búsqueda, filtros, estadísticas

---

### ETAPA 2: 👤 Coordinador Gestión Citas Asigna Médico

**Tabla modificada:** `dim_solicitud_bolsa`

**Campo clave actualizado:**
```sql
-- ANTES (Etapa 1)
id_personal = NULL

-- DESPUÉS (Etapa 2)
id_personal = 123              -- ID del médico asignado
```

**Documentación:**
- 📋 [`spec/frontend/12_modulo_gestion_citas.md`](../frontend/12_modulo_gestion_citas.md)
- 🔧 [`spec/backend/13_gestion_citas_endpoints.md`](../backend/13_gestion_citas_endpoints.md)

**Campos clave en esta etapa:**
```java
dim_solicitud_bolsa {
  id_solicitud_bolsa,           -- Ya existe del Paso 1
  id_personal,                  -- ⭐ SE ASIGNA AQUÍ por Coordinador
  fecha_asignacion,             -- ⭐ SE ESTABLECE AQUÍ
  estado                        -- Pendiente → Citado (opcional)
}

dim_solicitud_cita {
  id_solicitud_cita,
  id_personal,                  -- Referencia a médico
  doc_paciente,                 -- Ref a dim_solicitud_bolsa.paciente_dni
  id_estado_cita,               -- Estado (1=Pendiente, 2=Citado, 3=Atendido, etc.)
  fecha_cita,
  hora_cita
}
```

**Roles involucrados:**
- COORDINADOR_GESTION_CITAS (quien asigna el médico)
- COORDINADOR (ver en universal)

**API endpoints:**
- `GET /api/gestion-citas/estados` - Ver estados disponibles
- `POST /api/gestion-citas/{id}/actualizar-medico` - Asignar médico
- `GET /api/gestion-citas/pacientes-asignados` - Ver pacientes asignados a médicos

**Usuario típico:**
- 👤 Coordinador de Gestión de Citas
- Visualiza: Pacientes de bolsas (universo general)
- Acciones:
  - Seleccionar paciente
  - Buscar médico disponible
  - Asignar médico
  - Establecer fecha/hora cita

**Resultado tras esta etapa:**
- ✅ `dim_solicitud_bolsa.id_personal` ← tiene ID del médico
- ✅ `solicitud_cita` ← cita registrada
- ✅ Médico puede ver paciente en su dashboard

---

### ETAPA 3: 📋 Gestión de Citas Maneja Estados

**Tablas principales:**
- `solicitud_cita` (estados, fechas, horarios)
- `dim_estados_gestion_citas` (maestro de estados)

**Documentación:**
- 📊 [`spec/frontend/12_modulo_gestion_citas.md`](../frontend/12_modulo_gestion_citas.md)
- 🔧 [`spec/backend/13_gestion_citas_endpoints.md`](../backend/13_gestion_citas_endpoints.md)
- 📋 [`spec/troubleshooting/02_guia_estados_gestion_citas.md`](../troubleshooting/02_guia_estados_gestion_citas.md)

**Estados de cita (11 posibles):**
```
1. PENDIENTE_CITAR       → Aún no citado
2. CITADO                → Cita programada
3. EN_PROCESO            → Médico atendiendo
4. ATENDIDO              ✅ Médico marcó como atendido
5. NO_ASISTIO            ❌ Paciente no asistió
6. REPROGRAMACION        🔄 Reagendar
7. CANCELADO             ❌ Cancelado
... (4 más)
```

**Campos en esta etapa:**
```java
solicitud_cita {
  id_solicitud_cita,
  id_personal,                  -- Médico asignado
  doc_paciente,                 -- DNI del paciente
  id_estado_cita,               -- Estado actual (1-11)
  fecha_cita,                   -- Cuándo es la cita
  hora_cita,                    -- A qué hora
  fecha_cambio_estado,          -- Cuándo cambió estado
  usuario_cambio_estado_id      -- Quién cambió estado
}
```

**Roles involucrados:** COORDINADOR, MEDICO

**API endpoints:**
- `GET /api/gestion-citas/{id}/estados` - Ver estados disponibles
- `PUT /api/gestion-citas/{id}/estado` - Cambiar estado
- `GET /api/gestion-citas/pacientes-del-medico` - Ver citas del médico

**Usuario típico (en esta etapa):**
- 👤 Coordinador
- Visualiza: Estado de todas las citas
- Acciones: Cambiar estado, actualizar info

---

### ETAPA 4: 👨‍⚕️ Médico Atiende Paciente

**Tabla principal:** `dim_solicitud_bolsa` (lee desde aquí)

**Documentación:**
- ⭐ **[`spec/frontend/15_mis_pacientes_medico.md`](../frontend/15_mis_pacientes_medico.md)** ← 🆕 v1.45.2
- 🔗 [`spec/backend/14_gestion_pacientes_service.md`](../backend/14_gestion_pacientes_service.md)

**API usado:**
```
GET /api/gestion-pacientes/medico/asignados
```

**Respuesta contiene:**
```json
{
  "numDoc": "07888772",
  "apellidosNombres": "ARIAS CUBILLAS MARIA",
  "telefono": "962942164",
  "ipress": "CAP II LURIN",           -- ⭐ v1.45.2: Nombre en lugar de código
  "condicion": "Pendiente",
  "fechaAsignacion": "2026-02-05T07:09:54.096196Z",
  "sexo": "F",
  "edad": 90
}
```

**Componente:** `MisPacientes.jsx`

**Acciones del médico (3 opciones):**

1. **✅ Marcar Atendido**
   - Confirma que atendió al paciente
   - Modal con notas (opcional)
   - Estados: Pendiente → Atendido
   - Sincronización: solicitud_cita → ATENDIDO (v1.44.0+)

2. **📋 Generar Receta**
   - Crea receta para el paciente
   - Modal con descripción/diagnóstico
   - Guarda en sistema de recetas

3. **🔄 Generar Interconsulta**
   - Envía referencia a otro especialista
   - Modal con detalles de interconsulta
   - Queda registro para auditoría

**Rol involucrado:** MEDICO

**UI:**
- Tabla: 7 columnas (DNI, Paciente, Teléfono, IPRESS, Condición, Fecha Asignación, Acciones)
- Búsqueda: Por nombre o DNI
- Filtro: Por condición
- Estadísticas: Total, Filtrados, Atendidos
- Botones: 3 acciones por paciente

**Resultado tras esta etapa:**
- ✅ Paciente marcado como ATENDIDO
- ✅ Receta generada (si aplica)
- ✅ Interconsulta creada (si aplica)
- ✅ Estado sincronizado: solicitud_cita → ATENDIDO

---

## 🔗 Vinculaciones Entre Etapas

```
ETAPA 1 → ETAPA 2
Llave: dim_solicitud_bolsa.id_solicitud_bolsa → solicitud_cita.solicitud_bolsa_id
Tabla: dim_solicitud_bolsa.paciente_dni ← solicitud_cita.doc_paciente

ETAPA 2 → ETAPA 3
Llave: dim_solicitud_bolsa.id_personal ← solicitud_cita.id_personal
Cambio: id_personal se establece aquí

ETAPA 3 → ETAPA 4
Llave: dim_solicitud_bolsa.id_personal ← solicitud_cita.id_personal
Query: SELECT * FROM dim_solicitud_bolsa WHERE id_personal = :medicoId

ETAPA 4 (Sincronización v1.44.0+)
Cuando: Médico marca "Atendido"
Efecto: solicitud_cita.id_estado_cita = 4 (ATENDIDO)
        dim_solicitud_bolsa.estado → ATENDIDO_IPRESS
```

---

## 👥 Roles y Responsabilidades

| Rol | Etapa | Acción | Tabla Modifica |
|-----|-------|--------|-----------------|
| COORDINADOR | 1 | Ver universal bolsas | - (solo lectura) |
| COORDINADOR_GESTION_CITAS | 2 | Asignar médico | dim_solicitud_bolsa (id_personal) |
| COORDINADOR | 3 | Ver/cambiar estado citas | solicitud_cita (estado) |
| MEDICO | 4 | Atender paciente | solicitud_cita (estado), dim_solicitud_bolsa (referencia) |

---

## 📊 Estados del Paciente por Etapa

```
ETAPA 1: Estado en dim_solicitud_bolsa
└─ Pendiente (inicial)

ETAPA 2: Médico asignado
├─ id_personal = NULL → id_personal = 123
├─ fecha_asignacion = establecida
└─ Estado: Pendiente (sigue igual)

ETAPA 3: Gestión de Citas
├─ Pendiente → Citado (en solicitud_cita)
└─ Solicitud_cita.estado = 2 (CITADO)

ETAPA 4: Médico atiende
├─ Solicitud_cita.estado = 4 (ATENDIDO)
├─ dim_solicitud_bolsa.estado → ATENDIDO_IPRESS
└─ Sínc automática (v1.44.0+)
```

---

## 🔄 Flujo de Sincronización (v1.44.0+)

**Problema inicial:** Dos sistemas paralelos sin sincronización
- solicitud_cita (chatbot/citas)
- dim_solicitud_bolsa (bolsas)

**Solución v1.44.0:** Auto-sincronización cuando médico marca ATENDIDO

```
MÉDICO MARCA ATENDIDO
        ↓
SolicitudCitaServiceImpl.actualizarEstado()
        ↓
SincronizacionBolsaService.sincronizar()
        ↓
Buscar SolicitudBolsa por paciente_dni
        ↓
Actualizar estado → ATENDIDO_IPRESS
        ↓
Guardar en BD (1 transacción, all-or-nothing)
        ↓
✅ Ambas tablas sincronizadas automáticamente
```

**Documentación sincronización:**
- 📊 [`spec/backend/14_sincronizacion_atendido/README.md`](../backend/14_sincronizacion_atendido/README.md)
- 📋 [`checklist/01_Historial/SINCRONIZACION_v1.43.0-44.0.md`](../../checklist/01_Historial/SINCRONIZACION_v1.43.0-44.0.md)

---

## 📈 KPIs por Etapa

| Etapa | KPI | Valor Actual |
|-------|-----|--------------|
| 1: Bolsas | Total pacientes | 7,973 |
| 1: Bolsas | Módulo 107 | 6,404 |
| 2: Asignación | Médicos activos | N (variable) |
| 2: Asignación | Pacientes con médico | N (variable) |
| 3: Citas | Estados disponibles | 11 |
| 3: Citas | Citas activas | N (variable) |
| 4: Médico | Mis Pacientes | 2 (test) |
| 4: Médico | Atendidos | N (variable) |

---

## 🔐 Seguridad por Etapa

| Etapa | Validación | Detalles |
|-------|-----------|----------|
| 1: Bolsas | MBAC | `/roles/coordinador/*` |
| 2: Asignación | MBAC | `/citas/gestion-asegurado:editar` |
| 3: Citas | MBAC | `/citas/gestion-citas:ver` |
| 4: Médico | MBAC | `/roles/medico/pacientes:ver` |

**Anotación Spring:**
```java
@CheckMBACPermission(
  pagina = "/ruta",
  accion = "ver|crear|editar|eliminar",
  mensajeDenegado = "..."
)
```

---

## 🚀 APIs por Etapa

### Etapa 1: Bolsas
```bash
GET /api/bolsas/solicitudes               # Universal
GET /api/bolsas/modulo107/pacientes       # Módulo 107
GET /api/dengue/buscar?dni=...            # Dengue
```

### Etapa 2: Asignación Médico
```bash
GET /api/gestion-citas/estados            # Ver estados
PUT /api/gestion-citas/{id}/estado        # Cambiar estado
GET /api/gestion-citas/pacientes          # Ver todos
```

### Etapa 3: Gestión Citas
```bash
GET /api/gestion-citas/{id}               # Detalle cita
PUT /api/gestion-citas/{id}/estado        # Cambiar estado
GET /api/gestion-citas/pacientes-medico   # Ver citas médico
```

### Etapa 4: Médico
```bash
GET /api/gestion-pacientes/medico/asignados    # ⭐ v1.45.2
POST /api/gestion-pacientes/{id}/acciones      # Ejecutar acción
```

---

## 📚 Documentación Completa por Etapa

| Etapa | Spec Frontend | Backend | Database | Troubleshooting |
|-------|---------------|---------|----------|-----------------|
| 1: Bolsas | `09_modulo_bolsas/...` | `09_modules_bolsas/` | `12_tabla_dim_...` | - |
| 2: Asignación | `12_gestion_citas.md` | `13_gestion_citas_...` | `dim_solicitud_*` | - |
| 3: Citas | `12_gestion_citas.md` | `13_gestion_citas_...` | `solicitud_cita` | `02_guia_estados...` |
| 4: Médico | `15_mis_pacientes_medico.md` ⭐ | `14_gestion_pacientes...` | `dim_solicitud_bolsa` | - |

---

## ✅ Checklist de Implementación

- [x] Etapa 1: Bolsas generan pacientes (v1.42.0+)
- [x] Etapa 2: Coordinador asigna médico (v1.41.0+)
- [x] Etapa 3: Gestión de Citas maneja estados (v1.41.0+)
- [x] Etapa 4: Médico atiende pacientes (v1.45.1+)
- [x] Sincronización automática (v1.44.0+)
- [x] IPRESS names display (v1.45.2+)
- [ ] Persistencia de acciones médicas (v1.45.3)
- [ ] Historial de atenciones por paciente (v1.46.0)
- [ ] Notificaciones estado cita (v1.47.0)

---

## 🎯 Próximos Pasos

### v1.45.3 (Próxima)
- Persistencia de acciones (Marcar Atendido, Receta, Interconsulta)
- Guardar en tablas de auditoría

### v1.46.0
- Módulo de Recetas integrado
- Módulo de Interconsultas integrado
- Historial completo de paciente

### v1.47.0
- Teleconsulta en tiempo real
- Adjuntar documentos
- Seguimiento post-atención

---

## 📖 Cómo Usar Este Documento

1. **Para entender el flujo completo:** Lee de arriba a abajo
2. **Para implementar etapa X:** Salta a "Etapa X" + lee "Documentación completa"
3. **Para debugging:** Usa sección "Vinculaciones entre etapas"
4. **Para seguridad:** Revisa "Seguridad por etapa"
5. **Para APIs:** Consulta "APIs por etapa"

---

**Documento maestro:** Flujo Completo de Atenciones
**Versión:** v1.45.2
**Creado:** 2026-02-05 ✅
**Mantenido por:** Equipo CENATE
