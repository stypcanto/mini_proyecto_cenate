# Flujo de Anulación y Nueva Cita desde Registro Anulado

**Versión:** v1.85.40 (2026-03-06)
**Módulo:** Mesa de Ayuda / Bolsas
**Regla clave:** El registro anulado es **inmutable**. Nunca se reactiva. Una nueva cita es un registro independiente.

---

## Regla de Negocio

Una vez que un registro en `dim_solicitud_bolsa` es anulado (`activo=false`), permanece así permanentemente para garantizar la trazabilidad y auditoría. Si el paciente requiere una nueva atención, se crea un **nuevo registro** vinculado al origen.

---

## Flujo Completo

### Paso 1 — Paciente activo en bolsa

El coordinador trabaja con el paciente en `/bolsas/solicitudes`.

```
dim_solicitud_bolsa:
  activo                = true
  estado                = PENDIENTE / CITADO / etc.
  estado_gestion_citas  = PENDIENTE_CITA / CITADO_IPRESS / etc.
```

---

### Paso 2 — Surge un problema → Ticket de Mesa de Ayuda

Desde `/mesa-ayuda/tickets-pendientes`, el agente responde el ticket vía `ResponderTicketModal`. Puede:
- Cambiar el estado del ticket (En Proceso / Resuelto)
- Enviar al paciente a la Bolsa de Reprogramación (opcional o requerido según motivo)
- **Anular la cita** (sub-modal con motivo obligatorio)

---

### Paso 3 — Anulación (`anularCita`)

**Servicio:** `TicketMesaAyudaService.anularCita(ticketId, motivoAnulacion)`

```sql
-- dim_solicitud_bolsa (registro existente):
activo           = false         -- nunca cambia después de este punto
motivo_anulacion = 'texto del motivo ingresado'
-- estado_gestion_citas_id NO cambia (queda como estaba)

-- dim_historial_cambios_solicitud (nuevo registro):
tipo_cambio    = 'ANULACION'
motivo         = texto ingresado
usuario_nombre = quien ejecutó la anulación
fecha_cambio   = timestamp exacto
```

El registro queda **invisible** para todas las queries de bolsas (que filtran `WHERE activo = true`).

---

### Paso 4 — El paciente requiere nueva cita

El coordinador va a `/mesa-ayuda/pacientes-anulados`, busca al paciente por DNI o nombre y presiona **"Nueva Cita"**.

El modal muestra:
- Datos del paciente (nombre, DNI, especialidad)
- El motivo de anulación original (contexto para el coordinador)
- Aviso explícito: *"El registro anulado no se modifica"*
- Campo obligatorio: motivo de la nueva solicitud

---

### Paso 5 — Creación de nueva cita (`nuevaCitaDesdeAnulacion`)

**Endpoint:** `POST /api/bolsas/solicitudes/{id}/nueva-cita-desde-anulacion`
**Servicio:** `SolicitudBolsaServiceImpl.nuevaCitaDesdeAnulacion(idSolicitudAnulada, motivo, usuarioNombre)`

```sql
-- dim_solicitud_bolsa (NUEVO registro):
activo                  = true
estado                  = 'PENDIENTE'
estado_gestion_citas_id = 11  -- PENDIENTE_CITA
idsolicitudgeneracion   = ID del registro anulado  -- vínculo permanente al origen
motivo_anulacion        = null
id_personal             = null  -- sin médico asignado
responsable_gestora_id  = null  -- sin gestora asignada
fecha_atencion          = null  -- sin fecha de cita
-- Datos del paciente: copiados exactos del origen (DNI, nombre, IPRESS, especialidad, etc.)

-- dim_historial_cambios_solicitud (en el NUEVO registro):
tipo_cambio    = 'CREADO_DESDE_ANULACION'
motivo         = 'texto ingresado (origen: solicitud #ID_ORIGEN)'
usuario_nombre = quien solicitó la nueva cita
fecha_cambio   = timestamp
```

El registro anulado **no se modifica en ningún campo**.

---

### Paso 6 — Ciclo normal continúa

El nuevo registro aparece en `/bolsas/solicitudes` con estado **Pendiente de Citar**. El coordinador asigna médico, agenda fecha y el flujo estándar continúa.

---

## Trazabilidad Completa

| Pregunta | Tabla | Campo |
|----------|-------|-------|
| ¿Cuándo fue anulado? | `dim_historial_cambios_solicitud` | `fecha_cambio` donde `tipo_cambio='ANULACION'` |
| ¿Quién anuló? | `dim_historial_cambios_solicitud` | `usuario_nombre` donde `tipo_cambio='ANULACION'` |
| ¿Por qué fue anulado? | `dim_solicitud_bolsa` + historial | `motivo_anulacion` / `motivo` |
| ¿Quién pidió nueva cita? | `dim_historial_cambios_solicitud` | `usuario_nombre` donde `tipo_cambio='CREADO_DESDE_ANULACION'` |
| ¿Cuándo se creó la nueva? | `dim_historial_cambios_solicitud` | `fecha_cambio` donde `tipo_cambio='CREADO_DESDE_ANULACION'` |
| ¿Cuál es el origen? | `dim_solicitud_bolsa` | `idsolicitudgeneracion` |

---

## Diagrama de Estado

```
[PENDIENTE_CITA]
      |
      v
[CITADO_IPRESS]
      |
      v  (problema detectado → ticket)
[ANULADO: activo=false]  ← PERMANENTE, nunca cambia
      |
      | (nueva solicitud desde /mesa-ayuda/pacientes-anulados)
      v
[NUEVO REGISTRO: PENDIENTE_CITA, activo=true]
  idsolicitudgeneracion = ID del anulado
      |
      v
[CITADO_IPRESS] → [ATENDIDO_IPRESS]  (flujo normal)
```

---

## Archivos Involucrados

### Backend
| Archivo | Responsabilidad |
|---------|----------------|
| `service/mesaayuda/TicketMesaAyudaService.java` | `anularCita()` — marca `activo=false`, guarda historial |
| `service/bolsas/SolicitudBolsaService.java` | Interfaz `nuevaCitaDesdeAnulacion()` |
| `service/bolsas/SolicitudBolsaServiceImpl.java` | Implementación — clona registro, guarda historial `CREADO_DESDE_ANULACION` |
| `api/bolsas/SolicitudBolsaController.java` | `POST /{id}/nueva-cita-desde-anulacion` |

### Frontend
| Archivo | Responsabilidad |
|---------|----------------|
| `pages/mesa-ayuda/components/ResponderTicketModal.jsx` | Botón "Anular Cita" + sub-modal con motivo |
| `pages/mesa-ayuda/PacientesAnulados.jsx` | Listado de anulados + botón "Nueva Cita" + modal de creación |

---

## Tipos de Cambio en Historial

| `tipo_cambio` | Cuándo se genera | En qué registro |
|---------------|-----------------|----------------|
| `ANULACION` | Al anular la cita desde Mesa de Ayuda | En el registro anulado |
| `CREADO_DESDE_ANULACION` | Al crear nueva cita desde pacientes anulados | En el nuevo registro |
| `DEVOLUCION_A_PENDIENTE` | Al devolver masivamente a pendientes | En el registro activo |

---

## Restricciones de Negocio

1. Solo se puede crear nueva cita desde un registro con `activo=false` (si `activo=true` retorna HTTP 409 Conflict).
2. El motivo de la nueva cita es **obligatorio** (campo de texto en el modal).
3. El campo `idsolicitudgeneracion` es el único vínculo entre ambos registros — no se puede romper.
4. La nueva solicitud inicia **sin médico, sin gestora y sin fecha de cita** — el coordinador debe asignarlos desde la bolsa.
