# Estado de Bolsas — Lógica y Mapeo

> **Última actualización:** 2026-02-23
> **Campo en BD:** `dim_solicitud_bolsa.estado`

---

## Descripción

El **Estado de Bolsa** (`sb.estado`) es un campo de texto en la tabla `dim_solicitud_bolsa` que representa el estado de alto nivel de un paciente dentro del sistema de bolsas. Se actualiza automáticamente según el **Estado de Gestión de Citas** (`deg.cod_estado_cita`) y el **Estado de Médico** (`sb.condicion_medica`).

**Solo existen 3 valores posibles:** `PENDIENTE`, `OBSERVADO`, `ATENDIDO`

> ⚠️ La columna "PENDIENTE (DEFAULT)" que aparece en la documentación de referencia **no es un estado diferente**. Simplemente indica que `PENDIENTE` es el valor por defecto al crear una bolsa nueva. En BD siempre se almacena como `'PENDIENTE'`.

---

## Tabla de Mapeo Completa

| ID | Estado de Bolsa | Estado de Gestión de Citas                    | Estado de Médico |
|----|-----------------|-----------------------------------------------|------------------|
| 1  | PENDIENTE       | PENDIENTE CITA *(valor por defecto al crear)* | —                |
| 2  | PENDIENTE       | CITADO                                        | PENDIENTE        |
| 3  | PENDIENTE       | APAGADO                                       | —                |
| 4  | OBSERVADO       | ATENDIDO POR IPRESS (ATENDIDO_IPRESS)         | —                |
| 5  | OBSERVADO       | HISTORIA CLINICA BLOQUEADA (HC_BLOQUEADA)     | —                |
| 6  | PENDIENTE       | NO CONTESTA (NO_CONTESTA)                     | —                |
| 7  | OBSERVADO       | NO DESEA (NO_DESEA)                           | —                |
| 8  | PENDIENTE       | NO PERTENECE AL GRUPO ETARIO (NO_GRUPO_ETARIO)| —                |
| 9  | OBSERVADO       | NO TIENE ESSALUD (SIN_VIGENCIA)               | —                |
| 10 | OBSERVADO       | NUMERO NO EXISTE (NUM_NO_EXISTE)              | —                |
| 11 | OBSERVADO       | PERTENECE A OTRA IPRESS (NO_IPRESS_CENATE)    | —                |
| 13 | OBSERVADO       | SIN VIGENCIA DE SEGURO (SIN_VIGENCIA)         | —                |
| 14 | OBSERVADO       | TELEFONO SIN SERVICIO (TEL_SIN_SERVICIO)      | —                |
| 15 | OBSERVADO       | YA NO QUIERE ATENCION (YA_NO_REQUIERE)        | —                |
| 16 | ATENDIDO        | CITADO                                        | ATENDIDO         |
| 17 | ATENDIDO        | CITADO                                        | DESERCION        |
| 21 | OBSERVADO       | REPROGRAMACION FALLIDA (REPROG_FALLIDA)       | —                |

---

## Resumen por Valor

### `PENDIENTE`
- Valor por defecto al crear una bolsa nueva (`estado_gestion_citas_id` = NULL → PENDIENTE_CITA).
- También aplica mientras la gestora está trabajando activamente en el caso.
- Estados de Gestión que lo mantienen:
  - `PENDIENTE_CITA` (inicial, sin acción)
  - `CITADO` (con condicion_medica = Pendiente)
  - `APAGADO`
  - `NO_CONTESTA`
  - `NO_GRUPO_ETARIO`

### `OBSERVADO`
- El caso tiene una observación que impide el avance normal.
- Estados de Gestión que lo generan:
  - `ATENDIDO_IPRESS`
  - `HC_BLOQUEADA`
  - `NO_DESEA`
  - `SIN_VIGENCIA`
  - `NUM_NO_EXISTE`
  - `NO_IPRESS_CENATE`
  - `TEL_SIN_SERVICIO`
  - `YA_NO_REQUIERE`
  - `REPROG_FALLIDA`
  - `HOSPITALIZADO`
  - `PARTICULAR`

### `ATENDIDO`
- El médico ya atendió al paciente.
- Condición: Estado de Gestión = `CITADO` **Y** condicion_medica = `Atendido` o `Deserción`
- Otros estados que también lo generan: `FALLECIDO`, `DESERCION`, `ANULADO`, `ANULADA`

---

## Uso en el Frontend

### SolicitudesAtendidas (`/bolsas/solicitudesatendidas`)
- Muestra registros con `estado_gestion_citas_id IS NOT NULL` y `cod_estado_cita NOT IN ('PENDIENTE_CITA', 'NO_CONTESTA')`
- Los valores de `sb.estado` que aparecen en esta vista son: `PENDIENTE`, `OBSERVADO`, `ATENDIDO`
- El filtro **"Estado de Bolsa"** se envía al backend como parámetro `estadoBolsa`.

### SolicitudesPendientes (`/bolsas/solicitudespendientes`)
- Muestra registros con `cod_estado_cita IN ('PENDIENTE_CITA', 'NO_CONTESTA')`
- El valor de `sb.estado` es siempre `PENDIENTE`

---

## Campo en Base de Datos

```sql
-- Tabla: dim_solicitud_bolsa
-- Campo: estado (VARCHAR)
-- Valores posibles (solo 3):
--   'PENDIENTE'  → valor por defecto al crear + en proceso de gestión
--   'OBSERVADO'  → tiene observación, no avanza normalmente
--   'ATENDIDO'   → médico atendió / deserción / fallecido
```

---

## Relación con cod_estado_cita (dim_estados_gestion_citas)

```
sb.estado_gestion_citas_id → deg.id_estado_cita → deg.cod_estado_cita
```

El `cod_estado_cita` es el estado **granular** (CITADO, ATENDIDO_IPRESS, HC_BLOQUEADA, etc.).
El `sb.estado` es el estado **agrupado** de alto nivel (PENDIENTE, OBSERVADO, ATENDIDO).

---

## Integración en la API

### Parámetro `estadoBolsa` (v1.79.x)

El filtro por Estado de Bolsa se implementó como parámetro server-side en el endpoint principal:

**Frontend — `bolsasService.js`**
```js
obtenerSolicitudesPaginado(page, size, ..., estadoBolsa)
// estadoBolsa: 'PENDIENTE' | 'OBSERVADO' | 'ATENDIDO' | null
// Si null o 'todos' → no se aplica el filtro
```

**Backend — `SolicitudBolsaController.java`**
```java
@GetMapping
public ResponseEntity<Page<SolicitudBolsaDTO>> listarTodas(
    ...
    @RequestParam(required = false) String estadoBolsa,  // nuevo v1.79.x
    Pageable pageable)
// Se pasa a: solicitudBolsaService.listarConFiltros(..., estadoBolsa, pageable)
```

---

## Notas

- El campo `sb.estado` se actualiza en el endpoint `PATCH /api/bolsas/solicitudes/{id}/estado-y-cita` (`SolicitudBolsaController.java`).
- Para SolicitudesAtendidas, el endpoint optimizado es `GET /api/bolsas/solicitudes/gestionados` (v1.79.1), sin subconsultas correlacionadas → carga ~10x más rápida.
- El filtro `estadoBolsa` en el endpoint principal (`GET /api/bolsas/solicitudes`) permite filtrar por el estado agrupado desde cualquier vista que use `obtenerSolicitudesPaginado`.
