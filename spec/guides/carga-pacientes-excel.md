# Carga de Pacientes desde Excel — Profesionales de Salud

> **Versión:** v1.0 (2026-02-24)
> **Módulo:** Panel Profesional de Salud → `/roles/profesionaldesalud/pacientes`
> **Tipo:** Operación de datos manual (SQL + Python)

---

## ¿Cuándo se usa?

Cuando un profesional de salud (enfermera, médico, etc.) tiene pacientes asignados
en un archivo Excel externo y necesita verlos en su panel `/roles/profesionaldesalud/pacientes`.

---

## Formato del Excel requerido

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `DNI_MEDICO` | int | DNI del profesional asignado |
| `PROFESIONAL` | str | Nombre del profesional (solo referencia) |
| `DOC_PACIENTE` | int | DNI del paciente |
| `PACIENTE` | str | Nombre completo del paciente |
| `SEXO` | str | `F` / `M` |
| `EDAD` | int | Edad del paciente |
| `TEL_FIJO` | float | Teléfono fijo (puede ser nulo) |
| `TEL_MOVIL` | int | Teléfono celular |
| `CAS_ADSCRIPCION` | int | Código CAS de adscripción |
| `IPRESS_ATENCION` | int | Código IPRESS de atención |
| `HORA_CITA` | str | Hora de cita `HH:MM:SS` |
| `TIPO_CITA` | str | `RECITA` / `TELECONSULTA` / `INTERCONSULTA` |

---

## Mapeo Excel → `dim_solicitud_bolsa`

| Campo Excel | Columna BD | Notas |
|-------------|-----------|-------|
| `DOC_PACIENTE` | `paciente_dni`, `paciente_id` | Ambas columnas reciben el mismo valor |
| `PACIENTE` | `paciente_nombre` | |
| `SEXO` | `paciente_sexo` | |
| `EDAD` | `paciente_edad` | Columna existe en la tabla |
| `TEL_MOVIL` | `paciente_telefono` | TEL_FIJO se ignora (suele ser nulo) |
| `CAS_ADSCRIPCION` | `codigo_adscripcion` | |
| `IPRESS_ATENCION` | `codigo_ipress` | Código como string |
| `HORA_CITA` | `hora_atencion` | Tipo `TIME` |
| `TIPO_CITA` | `tipo_cita` | |

### Valores fijos por defecto

| Columna | Valor | Razón |
|---------|-------|-------|
| `id_bolsa` | `10` | Bolsa de Enfermería/Telemedicina CENATE |
| `especialidad` | `'ENFERMERIA'` | Ajustar según especialidad real |
| `id_servicio` | `56` | `dim_servicio_essi` → ENFERMERÍA (cod F11) |
| `responsable_gestora_id` | `688` | Gestora: Claudia Lizbeth Valencia |
| `estado` | `'PENDIENTE'` | Estado inicial |
| `estado_gestion_citas_id` | `1` | Estado inicial de gestión |
| `activo` | `true` | |
| `fecha_atencion` | `CURRENT_DATE` | Fecha del día de carga |
| `fecha_solicitud` | `NOW()` | |
| `fecha_asignacion` | `NOW()` | |
| `fecha_solicitud_dia` | `CURRENT_DATE` | |
| `numero_solicitud` | `REC-{timestamp_ms}` | Único por milisegundo + índice |

---

## Paso a paso

### 1. Obtener `id_personal` del profesional

```sql
SELECT id_pers, num_doc_pers, nom_pers, ape_pater_pers
FROM dim_personal_cnt
WHERE num_doc_pers = '<DNI_DEL_PROFESIONAL>';
```

### 2. Verificar duplicados

```sql
SELECT COUNT(*) FROM dim_solicitud_bolsa
WHERE id_personal = <ID_PERSONAL>
  AND paciente_dni IN ('<DNI1>', '<DNI2>', ...)
  AND tipo_cita = '<TIPO_CITA>';
```

### 3. Generar el SQL con Python

```python
import pandas as pd
import time
import math

df = pd.read_excel('/ruta/al/archivo.xlsx')
ID_PERSONAL = 412   # <- id_pers del profesional
ESPECIALIDAD = 'ENFERMERIA'
ID_SERVICIO  = 56
RESPONSABLE  = 688
ID_BOLSA     = 10

lines = ['BEGIN;']
base_ts = int(time.time() * 1000)

for i, row in df.iterrows():
    doc  = str(int(row['DOC_PACIENTE']))
    nombre = str(row['PACIENTE']).replace("'", "''")
    sexo = str(row['SEXO'])
    edad = int(row['EDAD']) if not math.isnan(float(row['EDAD'])) else 'NULL'
    tel  = f"'{int(row['TEL_MOVIL'])}'" if not math.isnan(float(row['TEL_MOVIL'])) else 'NULL'
    cas  = str(int(row['CAS_ADSCRIPCION']))
    ipress = str(int(row['IPRESS_ATENCION']))
    hora = str(row['HORA_CITA'])[:8]
    tipo = str(row['TIPO_CITA'])
    num_sol = f"REC-{base_ts + i}"

    lines.append(f"""INSERT INTO dim_solicitud_bolsa (
    numero_solicitud, id_bolsa, id_personal, paciente_dni, paciente_id, paciente_nombre,
    paciente_sexo, paciente_telefono, codigo_adscripcion, codigo_ipress,
    hora_atencion, tipo_cita, especialidad, id_servicio, responsable_gestora_id,
    estado, estado_gestion_citas_id, activo, paciente_edad,
    fecha_atencion, fecha_solicitud, fecha_asignacion, fecha_solicitud_dia
) VALUES (
    '{num_sol}', {ID_BOLSA}, {ID_PERSONAL}, '{doc}', '{doc}', '{nombre}',
    '{sexo}', {tel}, '{cas}', '{ipress}',
    '{hora}', '{tipo}', '{ESPECIALIDAD}', {ID_SERVICIO}, {RESPONSABLE},
    'PENDIENTE', 1, true, {edad},
    CURRENT_DATE, NOW(), NOW(), CURRENT_DATE
);""")

lines.append('COMMIT;')

with open('/tmp/carga_pacientes.sql', 'w') as f:
    f.write('\n'.join(lines))
print(f"SQL generado: {len(df)} registros")
```

### 4. Manejar FK de `asegurados`

Si hay error de FK (`fk_solicitud_asegurado`), pre-insertar los DNIs faltantes:

```sql
-- Buscar cuáles faltan:
SELECT doc FROM (VALUES ('<DNI1>'),('<DNI2>')) AS t(doc)
WHERE doc NOT IN (SELECT pk_asegurado FROM asegurados);

-- Insertar los faltantes (ajustar columnas según estructura real):
INSERT INTO asegurados (pk_asegurado) VALUES ('<DNI_FALTANTE>')
ON CONFLICT DO NOTHING;
```

### 5. Ejecutar el SQL

```bash
PGPASSWORD='<password>' psql -h <host> -p 5432 -U postgres -d maestro_cenate \
  -f /tmp/carga_pacientes.sql
```

### 6. Verificar

```sql
SELECT COUNT(*), tipo_cita, estado
FROM dim_solicitud_bolsa
WHERE id_personal = <ID_PERSONAL>
GROUP BY tipo_cita, estado;
```

---

## Consideraciones importantes

### ¿Qué muestra el panel `/roles/profesionaldesalud/pacientes`?

| Columna frontend | Campo BD | Se muestra cuando |
|---|---|---|
| **Fecha y Hora Cita** | `fecha_atencion + hora_atencion` | Siempre (si no es NULL) |
| **Fecha Atención** | `fecha_atencion_medica` | Solo cuando el médico atiende (ATENDIDO) |
| **Condición** | `condicion_medica` | Estado de atención |

### Sobre `fecha_atencion`

El Excel normalmente NO incluye fecha de cita (solo hora). Se debe establecer `fecha_atencion = CURRENT_DATE`.
Si el Excel trae una fecha explícita, usarla en lugar de `CURRENT_DATE`.

### Sobre RECITA vs TELECONSULTA

- **RECITA**: pacientes que necesitan nueva cita de seguimiento
- **TELECONSULTA**: atención por videollamada coordinada
- **INTERCONSULTA**: referencia a otra especialidad

Ajustar `especialidad`, `id_servicio` y `responsable_gestora_id` según el profesional.

---

## Cargas realizadas

| Fecha | Profesional | DNI | Excel | Registros | Tipo |
|-------|-------------|-----|-------|-----------|------|
| 2026-02-24 | Enf. Javier Willy Marreros Lara | 46621574 | MARREROS.xlsx | 44 | RECITA |
| 2026-02-24 | Enf. Jennifer Karla Díaz Moreno | 48416486 | DIAZ.xlsx | 44 | RECITA |
| 2026-02-24 | Enf. Tania Baquero Rodriguez | — | BAQUERO.xlsx | 40 | RECITA (20 nuevos + 8 convertidos de TELECONSULTA) |
| 2026-02-24 | Enf. Vanessa Katherin Córdova Fuentes | 45124049 | CORDOVA.xlsx | 44 | RECITA |

---

## Referencias

- Tabla principal: `dim_solicitud_bolsa` (50 columnas)
- Panel frontend: `MisPacientes.jsx` → `/roles/profesionaldesalud/pacientes`
- API: `GET /api/gestion-pacientes/medico/asignados`
- DTO: `GestionPacienteDTO.java`
- Service: `GestionPacienteServiceImpl.java` → `construirGestionPacienteDTO()`
