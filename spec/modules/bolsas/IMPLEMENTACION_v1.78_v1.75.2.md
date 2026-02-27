# Implementación v1.75.2 / v1.78.x — Bolsa Reprogramación + Historial Trazabilidad

> **Fecha:** 2026-02-27
> **Desarrollado por:** Ing. Styp Canto Rondón + Claude Sonnet 4.6

---

## Versiones implementadas

| Versión | Descripción |
|---------|-------------|
| v1.78.4 | CENACRON: box de elegibilidad en modal + HistorialPacienteBtn en GestionAsegurado |
| v1.78.5 | Fix IPRESS ATENCIÓN vacía en Bolsa Reprogramación (COALESCE + resolución IPRESS en creación) |
| v1.78.6 | Unificación Bolsa Mesa de Ayuda (id=13) → Bolsa Reprogramación (id=6) |
| v1.75.2 | Botón "📋 Ver historial" bajo nombre del paciente en todos los módulos |

---

## v1.78.4 — CENACRON Elegibilidad + HistorialPacienteBtn en GestionAsegurado

### Cambios

**`frontend/src/pages/roles/citas/GestionAsegurado.jsx`**

1. **Box de elegibilidad CENACRON** — Aparece dentro del modal de inscripción, antes del footer. Muestra un rectángulo ámbar con las 6 enfermedades elegibles como badges:
   - HTA, Diabetes, EPOC, Asma, Insuf. Cardíaca, ERC

2. **HistorialPacienteBtn** — Agregado bajo el nombre del paciente en la tabla de solicitudes pendientes.

---

## v1.78.5 — Fix IPRESS ATENCIÓN vacía

### Problema
En `/bolsas/solicitudespendientes`, la columna **IPRESS ATENCIÓN** mostraba "Sin asignar" para todos los registros de la Bolsa de Reprogramación porque `id_ipress_atencion = NULL` en BD.

### Causa raíz
- Los registros creados vía `TicketMesaAyudaService.enviarABolsaReprogramacion()` no asignaban `id_ipress_atencion`
- Las queries en `SolicitudBolsaRepository` no tenían fallback cuando `id_ipress_atencion` era NULL

### Solución dual

#### Fix 1 — COALESCE en queries del repositorio

**Archivo:** `backend/.../repository/bolsas/SolicitudBolsaRepository.java`

Se modificaron las 4 queries nativas principales para agregar fallback:

```sql
-- Antes:
COALESCE(di2.cod_ipress, '') as cod_ipress_atencion,
COALESCE(di2.desc_ipress, '') as desc_ipress_atencion

-- Después:
COALESCE(di2.cod_ipress, di.cod_ipress, '') as cod_ipress_atencion,
COALESCE(di2.desc_ipress, di.desc_ipress, '') as desc_ipress_atencion
```

Donde:
- `di` = alias para IPRESS de adscripción (`id_ipress`)
- `di2` = alias para IPRESS de atención (`id_ipress_atencion`)

Si `id_ipress_atencion` es NULL, se muestra la IPRESS de adscripción como fallback.

#### Fix 2 — Resolución de IPRESS al crear registro

**Archivo:** `backend/.../service/mesaayuda/TicketMesaAyudaService.java`

Se agregaron dos dependencias nuevas:
```java
private final AseguradoRepository aseguradoRepository;
private final IpressRepository ipressRepository;
```

Lógica en `enviarABolsaReprogramacion()`:
```java
// 1. Buscar el asegurado por DNI
Optional<Asegurado> aseguradoOpt = aseguradoRepository.findByDocPaciente(dniPaciente);

// 2. Obtener cas_adscripcion → código IPRESS de adscripción
String casAdscripcion = aseguradoOpt.get().getCasAdscripcion();

// 3. Resolver la IPRESS en dim_ipress
Optional<Ipress> ipressOpt = ipressRepository.findByCodIpress(casAdscripcion);
Long idIpressResuelto = ipressOpt.get().getIdIpress();

// 4. Guardar en AMBAS columnas
SolicitudBolsa.builder()
    .codigoAdscripcion(codigoIpressResuelto)
    .idIpress(idIpressResuelto)         // IPRESS adscripción
    .idIpressAtencion(idIpressResuelto) // IPRESS atención = misma
    ...
```

---

## v1.78.6 — Unificación Bolsa Mesa de Ayuda → Bolsa Reprogramación

### Contexto
Existían dos bolsas para el mismo concepto:

| id | codigo | registros |
|----|--------|-----------|
| 13 | BOLSA_MESA_DE_AYUDA | 251 |
| 6 | BOLSAS_REPROGRAMACION | 1,325 |

### Migración aplicada en BD

```sql
-- Mover todos los registros de id=13 a id=6
UPDATE dim_solicitud_bolsa
SET id_bolsa = 6
WHERE id_bolsa = 13;

-- Inactivar la bolsa Mesa de Ayuda
UPDATE dim_tipos_bolsas
SET stat_tipo_bolsa = 'I'
WHERE id_tipo_bolsa = 13
  AND cod_tipo_bolsa = 'BOLSA_MESA_DE_AYUDA';
```

Resultado: **1,576 registros** en `BOLSAS_REPROGRAMACION` (id=6).

### Script de migración Flyway

**Archivo:** `backend/src/main/resources/db/migration/V6_5_0__unificar_bolsa_mesa_ayuda_a_reprogramacion.sql`

Documenta la migración para aplicar en otros entornos (staging, producción).

### Cambio en código

**Archivo:** `backend/.../service/mesaayuda/TicketMesaAyudaService.java`

```java
// Antes (v1.78.5):
final Long ID_BOLSA_MESA_DE_AYUDA = 13L;

// Después (v1.78.6):
final Long ID_BOLSA_REPROGRAMACION = 6L;
```

---

## v1.75.2 — Botón "📋 Ver historial" en todos los módulos

### Infraestructura reutilizada (ya existía)

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Endpoint por DNI | `GET /bolsas/solicitudes/trazabilidad/por-dni/{dni}` | Busca última solicitud activa del paciente |
| Servicio frontend | `services/trazabilidadBolsaService.js` → `obtenerTrazabilidadPorDni()` | Llama al endpoint |
| Componente | `components/trazabilidad/HistorialPacienteBtn.jsx` | Botón + lógica de apertura del modal |
| Modal | `components/trazabilidad/DetallesPacienteModal.jsx` + `HistorialBolsaTab.jsx` | Muestra el timeline |

### Uso del componente

```jsx
<HistorialPacienteBtn
  dni="12345678"              // requerido — DNI del paciente
  nombrePaciente="Juan Pérez" // opcional — para el header del modal
/>
```

### Módulos actualizados

| Archivo | Prop dni | Prop nombre |
|---------|----------|-------------|
| `roles/citas/CitasAgendadas.jsx` | `p.pacienteDni` | `p.pacienteNombre` |
| `roles/medico/pacientes/MisPacientes.jsx` | `paciente.numDoc` | `paciente.apellidosNombres` |
| `bolsas/SolicitudesAtendidas.jsx` | `solicitud.dni` | — |
| `roles/citas/GestionAsegurado.jsx` | `paciente.pacienteDni` | `paciente.pacienteNombre` |
| `roles/citas/BolsaPacientesAsignados.jsx` | `solicitud.paciente_dni` | `solicitud.paciente_nombre` |
| `bolsas/MiBandeja.jsx` | `solicitud.pacienteDni` | `solicitud.pacienteNombre` |
| `bolsas/BolsaXGestor.jsx` | `p.paciente_dni` | `p.paciente_nombre` |
| `roles/coordcitas/Modulo107PacientesList.jsx` | `paciente.pacienteDni` | `paciente.pacienteNombre` |
| `roles/coordcitas/ListadoPacientes.jsx` | `paciente.paciente_dni` | `paciente.paciente_nombre` |

### Comportamiento

- **Con historial:** Abre `DetallesPacienteModal` directamente en la pestaña "Historial" mostrando el timeline de la solicitud en bolsa.
- **Sin historial (404):** Muestra toast: "Sin historial de bolsa registrado".
- **Error de red:** Muestra toast rojo de error.
- **Cargando:** Spinner en el botón mientras espera respuesta.

---

## Commits de esta sesión

| Hash | Versión | Descripción |
|------|---------|-------------|
| `(ver git log)` | v1.78.4 | CENACRON elegibilidad + HistorialPacienteBtn GestionAsegurado |
| `(ver git log)` | v1.78.5 | Fix IPRESS ATENCIÓN vacía en Bolsa Reprogramación |
| `(ver git log)` | v1.78.6 | Unificación Bolsa Mesa de Ayuda → Bolsa Reprogramación |
| `b32c58d4` | v1.75.2 | Botón Ver historial en todos los módulos |

---

## Diagrama de datos — Bolsa Reprogramación (post v1.78.6)

```
ticket_mesa_ayuda (operador crea ticket)
        ↓  [botón "Enviar a Bolsa"]
        ↓  POST /api/mesa-ayuda/tickets/{id}/enviar-bolsa
        ↓
dim_solicitud_bolsa
  id_bolsa           = 6  (BOLSAS_REPROGRAMACION)
  paciente_dni       = ticket.dniPaciente
  id_ipress          = dim_ipress.id_ipress (via asegurado.cas_adscripcion)
  id_ipress_atencion = dim_ipress.id_ipress (mismo — misma IPRESS)
  estado             = PENDIENTE
  activo             = true
        ↓
/bolsas/solicitudespendientes  (Coordinador ve el registro)
  IPRESS ADSCRIPCIÓN ✅ poblada
  IPRESS ATENCIÓN    ✅ poblada (mismo valor)
        ↓
Gestora asigna → contacta paciente → reprograma cita
```
