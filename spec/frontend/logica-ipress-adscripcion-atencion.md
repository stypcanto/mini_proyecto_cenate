# Lógica IPRESS: Adscripción vs Atención

> **Implementado:** v1.65.x (2026-02-24)
> **Archivo principal:** `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
> **Tabla BD:** `dim_solicitud_bolsa`

---

## Descripción

El sistema muestra en la columna **IPRESS** de la tabla de pacientes el lugar donde el paciente será **atendido**, no necesariamente donde está inscrito. Para ello aplica una cascada de prioridades.

---

## Cascada de Prioridades (función `getIpress`)

```
¿Es especialidad paramédica (enfermería/nutrición/psicología/fisioterapia)
Y el paciente es CENACRON?
        ↓ SÍ                             ↓ NO
→ CENATE (forzado)                        │
  label: "CENACRON"                       │
                           ¿Tiene ipressAtencion?
                             ↓ SÍ              ↓ NO
                     → IPRESS Atención    ¿Tiene ipress?
                       label: "Atención"   ↓ SÍ      ↓ NO
                                      → Adscripción   → "-"
                                        label: "Adscripción"
```

### Código fuente (MisPacientes.jsx ~línea 246)

```javascript
function getIpress(paciente) {
  // Prioridad 1: Paraclínicas + CENACRON → siempre CENATE
  if (esCenacronCenate && paciente?.esCenacron)
    return { nombre: IPRESS_CENATE, tipo: 'cenacron' };

  // Prioridad 2: Tiene IPRESS de Atención registrada
  if (paciente?.ipressAtencion)
    return { nombre: paciente.ipressAtencion, tipo: 'atencion' };

  // Fallback: IPRESS de Adscripción (donde está inscrito el asegurado)
  if (paciente?.ipress)
    return { nombre: paciente.ipress, tipo: 'adscripcion' };

  return { nombre: '-', tipo: 'adscripcion' };
}
```

---

## Campos en Base de Datos

Tabla: `dim_solicitud_bolsa`

| Columna | Tipo | Descripción | Modificable |
|---------|------|-------------|-------------|
| `ipress` | `varchar` | Nombre IPRESS de adscripción (texto) | No (dato de origen) |
| `codigo_ipress` | `varchar` | Código IPRESS adscripción | No |
| `id_ipress` | `bigint FK` | ID IPRESS adscripción → `dim_ipress` | No |
| `id_ipress_atencion` | `bigint FK` | ID IPRESS de atención → `dim_ipress` | **Sí** (se gestiona) |

El campo `ipressAtencion` que recibe el frontend es el **JOIN resuelto** de `id_ipress_atencion → dim_ipress.desc_ipress`.

---

## Regla de Negocio: Enfermería → CENATE

**Todos los pacientes de especialidad ENFERMERÍA** deben tener como IPRESS de Atención el **CENTRO NACIONAL DE TELEMEDICINA** (CENATE, código 739, `id_ipress = 2`).

### SQL de mantenimiento

```sql
-- Aplicar CENATE como IPRESS de Atención para pacientes de enfermería
UPDATE dim_solicitud_bolsa
SET id_ipress_atencion = 2  -- CENTRO NACIONAL DE TELEMEDICINA (cod. 739)
WHERE activo = true
  AND UPPER(especialidad) = 'ENFERMERIA'
  AND id_personal IS NOT NULL
  AND (id_ipress_atencion IS NULL OR id_ipress_atencion != 2);
```

> Este UPDATE se ejecutó el 2026-02-24 cubriendo **1,042 registros** de todas las fechas disponibles.

---

## Comportamiento Visual en la Tabla

| Situación | IPRESS mostrada | Label |
|-----------|----------------|-------|
| Paciente CENACRON + especialidad paramédica | CENTRO NACIONAL DE TELEMEDICINA | `CENACRON` |
| Tiene `id_ipress_atencion` en BD | Nombre de IPRESS de atención | `Atención` |
| Solo tiene `ipress` (sin cita registrada) | IPRESS de adscripción del asegurado | `Adscripción` |

---

## Especialidades Paramédicas (CENACRON_CENATE_IPRESS)

Las siguientes especialidades siempre fuerzan CENATE para pacientes CENACRON:

- `ENFERMERIA`
- `NUTRICION`
- `PSICOLOGIA`
- `TERAPIA_FISICA`
- `TERAPIA_LENGUAJE`

Definidas en `SPECIALTY_FEATURES` (MisPacientes.jsx, ~línea 52).

---

## Notas Importantes

- El dato de **adscripción siempre se conserva** en BD (`ipress`, `id_ipress`). Solo se gestiona `id_ipress_atencion`.
- El UPDATE de BD no afecta registros históricos ni datos de adscripción.
- El detalle del paciente (modal) sigue mostrando ambas IPRESS (adscripción y atención).
- Para futuros imports masivos de enfermería, agregar `id_ipress_atencion = 2` por defecto en el proceso de carga.
