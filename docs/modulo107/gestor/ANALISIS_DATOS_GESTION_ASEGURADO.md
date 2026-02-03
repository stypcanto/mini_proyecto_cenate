# 📊 DATOS QUE TRAE GestionAsegurado.jsx

## 🔌 Endpoint Consultado
```
GET /api/bolsas/solicitudes/mi-bandeja
```

---

## 📋 Estructura de la Respuesta

**Formato:** `{ total, solicitudes, mensaje }`

La respuesta trae un array de solicitudes bajo la clave `solicitudes`.

---

## 🗂️ Campos que Trae la API (Datos Crudos)

### Del SolicitudBolsa DTO:

| Campo (snake_case) | Campo (camelCase) | Tipo | Ejemplo |
|-------------------|------------------|------|---------|
| `id_solicitud` | `idSolicitud` | Long | 1 |
| `numero_solicitud` | `numeroSolicitud` | String | "SOL-2026-001" |
| `paciente_dni` | `pacienteDni` | String | "12345678" |
| `paciente_nombre` | `pacienteNombre` | String | "Juan Pérez García" |
| `paciente_edad` | `pacienteEdad` | Integer | 45 |
| `paciente_sexo` | `pacienteSexo` | String | "M" / "F" |
| `paciente_telefono` | `pacienteTelefono` | String | "987654321" |
| `paciente_telefono_alterno` | `pacienteTelefonoAlterno` | String | "987654322" |
| `especialidad` | `especialidad` | String | "Medicina General" |
| `tipo_cita` | `tipoCita` | String | "Presencial" / "Telemedicina" |
| `desc_ipress` | `descIpress` | String | "CENATE Lima" |
| `cod_estado_cita` | `codEstadoCita` | String | "PENDIENTE" |
| `fecha_solicitud` | `fechaSolicitud` | DateTime | "2026-02-03T10:30:00" |
| `fecha_asignacion` | `fechaAsignacion` | DateTime | "2026-02-03T11:00:00" |
| `fecha_cambio_estado` | `fechaCambioEstado` | DateTime | "2026-02-03T12:00:00" |
| `nombre_usuario_cambio_estado` | `nombreUsuarioCambioEstado` | String | "Admin User" |

---

## 📊 Datos Transformados para la Tabla

En el componente, los datos se transforman a esta estructura:

```javascript
{
  id: Long,                          // id_solicitud
  numeroSolicitud: String,           // numero_solicitud
  pacienteDni: String,               // paciente_dni
  pacienteNombre: String,            // paciente_nombre
  pacienteEdad: Integer,             // paciente_edad
  pacienteSexo: String,              // paciente_sexo (M/F)
  pacienteTelefono: String,          // paciente_telefono
  pacienteTelefonoAlterno: String,   // paciente_telefono_alterno
  especialidad: String,              // especialidad
  tipoCita: String,                  // tipo_cita
  descIpress: String,                // desc_ipress
  descEstadoCita: String,            // Mapeo de cod_estado_cita a descripción
  codigoEstado: String,              // cod_estado_cita (para comparaciones)
  fechaSolicitud: DateTime,          // fecha_solicitud (ordenado DESC)
  fechaAsignacion: DateTime,         // fecha_asignacion
  fechaCambioEstado: DateTime,       // fecha_cambio_estado
  usuarioCambioEstado: String        // nombre_usuario_cambio_estado
}
```

---

## 📈 Ejemplo de Respuesta Completa

```json
{
  "total": 25,
  "solicitudes": [
    {
      "id_solicitud": 1,
      "numero_solicitud": "SOL-2026-001",
      "paciente_dni": "12345678",
      "paciente_nombre": "Juan Carlos Pérez García",
      "paciente_edad": 45,
      "paciente_sexo": "M",
      "paciente_telefono": "987654321",
      "paciente_telefono_alterno": "987654322",
      "especialidad": "Medicina General",
      "tipo_cita": "Presencial",
      "desc_ipress": "CENATE Lima",
      "cod_estado_cita": "PENDIENTE",
      "fecha_solicitud": "2026-02-03T10:30:00",
      "fecha_asignacion": "2026-02-03T11:00:00",
      "fecha_cambio_estado": "2026-02-03T12:00:00",
      "nombre_usuario_cambio_estado": "Admin User"
    },
    {
      "id_solicitud": 2,
      "numero_solicitud": "SOL-2026-002",
      "paciente_dni": "87654321",
      "paciente_nombre": "María Rosa López Martínez",
      "paciente_edad": 38,
      "paciente_sexo": "F",
      "paciente_telefono": "987654323",
      "paciente_telefono_alterno": "987654324",
      "especialidad": "Pediatría",
      "tipo_cita": "Telemedicina",
      "desc_ipress": "CENATE Arequipa",
      "cod_estado_cita": "CITADO",
      "fecha_solicitud": "2026-02-02T09:15:00",
      "fecha_asignacion": "2026-02-02T14:30:00",
      "fecha_cambio_estado": "2026-02-02T15:00:00",
      "nombre_usuario_cambio_estado": "Gestor Citas"
    }
  ],
  "mensaje": "Bandeja obtenida correctamente"
}
```

---

## 🎯 Columnas Mostradas en la Tabla

**Orden actual (17 columnas):**

1. ✅ **Checkbox** - Para seleccionar múltiples pacientes
2. ✅ **Fecha Asignación** - `fechaAsignacion`
3. ✅ **DNI Paciente** - `pacienteDni`
4. ✅ **Nombre Paciente** - `pacienteNombre`
5. ✅ **Edad** - `pacienteEdad`
6. ✅ **Género** - `pacienteSexo` (M/F)
7. ✅ **Especialidad** - `especialidad`
8. ✅ **Especialista** - (selector vacío - `citasAgendadas[paciente.id].especialista`)
9. ✅ **Fecha y Hora de Cita** - (input datetime vacío - `citasAgendadas[paciente.id].fecha`)
10. ✅ **IPRESS** - `descIpress` (badge azul)
11. ✅ **Tipo de Cita** - `tipoCita`
12. ✅ **Teléfono 1** - `pacienteTelefono`
13. ✅ **Teléfono 2** - `pacienteTelefonoAlterno`
14. ✅ **Estado** - `descEstadoCita` (con botón editar)
15. ✅ **Fecha Cambio Estado** - `fechaCambioEstado` (auditoría)
16. ✅ **Usuario Cambio Estado** - `usuarioCambioEstado` (auditoría)
17. ✅ **Acciones** - Botón "📱 Teléfono"

---

## 🔄 Estados Disponibles (Mapeados)

| Código | Descripción |
|--------|------------|
| PENDIENTE | Pendiente Citar - Paciente nuevo que ingresó a la bolsa |
| CITADO | Citado - Paciente agendado para atención |
| ATENDIDO_IPRESS | Atendido por IPRESS - Paciente recibió atención en institución |
| NO_CONTESTA | No contesta - Paciente no responde a las llamadas |
| NO_DESEA | No desea - Paciente rechaza la atención |
| APAGADO | Apagado - Teléfono del paciente apagado |
| TEL_SIN_SERVICIO | Teléfono sin servicio - Línea telefónica sin servicio |
| NUM_NO_EXISTE | Número no existe - Teléfono registrado no existe |
| SIN_VIGENCIA | Sin vigencia de Seguro - Seguro del paciente no vigente |
| HC_BLOQUEADA | Historia clínica bloqueada - HC del paciente bloqueada en sistema |
| REPROG_FALLIDA | Reprogramación Fallida - No se pudo reprogramar la cita |

---

## 📊 Métricas Calculadas

```javascript
{
  totalPacientes: number,      // Total de solicitudes
  pacientesAtendidos: number,  // Conteo donde codigoEstado === "ATENDIDO_IPRESS"
  pacientesPendientes: number, // Conteo donde codigoEstado === "PENDIENTE"
  solicitudesPendientes: number // Igual a pacientesPendientes
}
```

---

## 🔍 Filtros Disponibles

- **searchTerm** - Búsqueda por nombre, DNI o número de solicitud
- **filtroMacrorregion** - "todas" o ID de macrorregión
- **filtroRed** - "todas" o ID de red
- **filtroIpress** - "todas" o descripción IPRESS
- **filtroEspecialidad** - "todas" o especialidad
- **filtroTipoCita** - "todas" o tipo cita
- **filtroEstado** - "todos" o código estado (PENDIENTE, CITADO, etc.)

---

## 📈 Transformación de Datos

**En `fetchPacientesAsignados()`:**

1. ✅ Obtiene array `solicitudes` de la respuesta
2. ✅ Mapea cada solicitud a objeto con campos transformados
3. ✅ Mapea `cod_estado_cita` a descripción completa usando `estadosDisponibles`
4. ✅ **Ordena DESC por `fechaSolicitud`** (más nuevas primero)
5. ✅ Guarda en estado `pacientesAsignados`

---

## 💾 Estados del Componente

```javascript
const [pacientesAsignados, setPacientesAsignados] = useState([]);    // Array de pacientes
const [metrics, setMetrics] = useState({...});                       // Métricas
const [citasAgendadas, setCitasAgendadas] = useState({});            // { pacienteId: { fecha, especialista } }
const [especialistasDisponibles] = useState([...]);                  // Array hardcodeado
```

---

## 🔌 Relación con DetalleMedicoController

**NUEVA POSIBILIDAD:**

El `especialista` en la columna 8 actualmente es:
- ❌ Array hardcodeado de 6 médicos

**PODRÍA SER:**

- ✅ Obtener médicos reales del backend usando:
  - Endpoint: `GET /api/atenciones-clinicas/detalle-medico/por-servicio/{idServicio}`
  - Usar `especialidad` como `idServicio`
  - Llenar dinámicamente el selector

---

## 📝 Nota sobre `citasAgendadas`

Los campos **"Especialista"** y **"Fecha y Hora de Cita"** son:
- ✅ Inputs locales (no persistidos)
- ❌ Se guardan en estado pero **NO se envían a BD**
- 📌 Necesitaría nuevo endpoint para persistir

