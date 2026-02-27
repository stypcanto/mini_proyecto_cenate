# Reglas de Validación: Cita Adicional (v1.67.x)

**Endpoint:** `POST /api/bolsas/solicitudes/crear-adicional`
**Componente Frontend:** `GestionAsegurado.jsx` → modal "Registrar cita adicional"
**Versión:** v1.67.x (2026-02-25)

---

## Regla de Negocio: Un paciente, múltiples especialidades

Un paciente puede tener **múltiples citas activas simultáneas** siempre que sean de **especialidades diferentes**.
El bloqueo solo aplica cuando ya existe una cita activa en la **misma especialidad**.

### Tabla de escenarios

| Cita existente | Especialidad nueva | Estado existente | ¿Permitido? | Motivo |
|---|---|---|---|---|
| CARDIOLOGIA / CITADO | ENFERMERIA | activo | ✅ Sí | Diferente especialidad |
| CARDIOLOGIA / CITADO | NEUROLOGIA | activo | ✅ Sí | Diferente especialidad |
| CARDIOLOGIA / ATENDIDO | CARDIOLOGIA | terminal | ✅ Sí | Estado terminal permite nueva cita |
| CARDIOLOGIA / CITADO | CARDIOLOGIA | activo | ❌ No | Misma especialidad, cita activa |
| CARDIOLOGIA / EN PROCESO | CARDIOLOGIA | activo | ❌ No | Misma especialidad, cita activa |

### Estados terminales (no bloquean)

```
ATENDIDO | CANCELADO | DESERTOR | RESCATADO | RECHAZADO | NO ASISTIO
```

### Estados activos (bloquean si misma especialidad)

Cualquier estado que **no sea terminal**, por ejemplo:
`CITADO`, `PENDIENTE`, `EN PROCESO`, `CONFIRMADO`, etc.

---

## Implementación Backend

### Controller: `SolicitudBolsaController.java`

```java
// POST /crear-adicional
List<SolicitudBolsaDTO> existentes = solicitudBolsaService.buscarAsignacionesPorDni(request.getPacienteDni());

Set<String> estadosTerminales = Set.of("ATENDIDO","CANCELADO","DESERTOR","RESCATADO","RECHAZADO","NO ASISTIO");
String especialidadNueva = request.getEspecialidad().trim().toUpperCase();

existentes.stream()
    .filter(e -> e.getIdPersonal() != null)                         // tiene médico asignado
    .filter(e -> !estadosTerminales.contains(e.getEstado().toUpperCase()))  // no es terminal
    .filter(e -> especialidadNueva.isEmpty() || especialidadNueva.equals(e.getEspecialidad().trim().toUpperCase()))  // misma esp.
    .findFirst()
    .ifPresent(existente -> { throw new PacienteDuplicadoException(existente); });
```

### Service: `SolicitudBolsaService` + `SolicitudBolsaServiceImpl`

```java
// Nuevo método (v1.67.x)
List<SolicitudBolsaDTO> buscarAsignacionesPorDni(String pacienteDni);

// Implementación: enriquece nombre del médico
return solicitudRepository.findByPacienteDniAndActivoTrue(pacienteDni)
    .stream()
    .map(sol -> {
        SolicitudBolsaDTO dto = SolicitudBolsaMapper.toDTO(sol);
        if (sol.getIdPersonal() != null) dto.setNombreMedicoAsignado(obtenerNombreMedico(sol.getIdPersonal()));
        return dto;
    }).collect(Collectors.toList());
```

### Repository: `SolicitudBolsaRepository`

Reutiliza el método existente:
```java
List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);  // línea 372
```

### Excepción: `PacienteDuplicadoException` → `GlobalExceptionHandler`

Retorna HTTP 409 con estructura:
```json
{
  "status": 409,
  "error": "paciente_duplicado",
  "message": "El paciente ya tiene una asignación activa en el sistema.",
  "asignacionExistente": {
    "especialidad": "CARDIOLOGIA",
    "nombreMedicoAsignado": "Apellido, Nombres",
    "fechaAtencion": "2026-02-25",
    "horaAtencion": "08:00:00",
    "estado": "CITADO",
    "descEstadoCita": "Citado - Paciente agendado para atención"
  }
}
```

---

## Implementación Frontend (`GestionAsegurado.jsx`)

### Captura del 409

```javascript
if (createBolsaRes.status === 409 && errorData.error === "paciente_duplicado") {
  setDuplicadoInfo({ paciente, dni, asignacion: errorData.asignacionExistente });
  setModalDuplicado(true);
  return;
}
```

### Modal informativo (estado duplicado)

Muestra:
- **Título:** "Cita duplicada en la misma especialidad"
- **Motivo claro:** Qué especialidad está activa, con qué estado
- **Regla recordatorio:** "Puedes citar al paciente en una especialidad diferente sin restricciones"
- **Detalles de cita existente:** Profesional, Especialidad, Fecha, Hora, Estado

---

## Endpoint de horas ocupadas (v1.67.0)

`GET /api/bolsas/solicitudes/horas-ocupadas?idPersonal={id}&fecha={yyyy-MM-dd}`

Consulta ambas tablas (`dim_solicitud_bolsa` + `solicitud_cita`) y retorna:
```json
{ "horasOcupadas": ["08:00", "08:05", "09:30"] }
```

**Regla URL importante:** El `API_BASE` ya incluye `/api`, por lo que el fetch desde frontend es:
```javascript
fetch(`${API_BASE}/bolsas/solicitudes/horas-ocupadas?idPersonal=...`)
// NO: `${API_BASE}/api/bolsas/...`  ← duplica /api
```

---

## Drum Picker de Horario (v1.67.1)

El selector de hora fue reemplazado de `<select>` nativo (204 opciones) a un **drum/wheel picker**:

- Dos columnas: **Hora** (07 a.m. → 11 p.m.) y **Minutos** (:00, :05, ... :55)
- `scroll-snap-type: y mandatory` para snap nativo
- Slots ocupados: texto en rojo + ícono `✕`, no clickeables
- Implementado con `useRef` + `useCallback` (`hourDrumRef`, `minuteDrumRef`)
- Sincronización bidireccional vía `useEffect` cuando cambia `fechaHoraCitaSeleccionada`

**Refs requeridos en el componente:**
```javascript
const hourDrumRef = useRef(null);
const minuteDrumRef = useRef(null);
const DRUM_HOURS = Array.from({ length: 17 }, (_, i) => i + 7);   // 07..23
const DRUM_MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];
const DRUM_ITEM_H = 40; // px por ítem
```
