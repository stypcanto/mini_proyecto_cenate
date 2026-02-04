# 📖 GUÍA COMPLETA: Gestión de Citas - GestionAsegurado

**Última actualización:** 2026-02-03  
**Versión:** v3.5.1  
**Estado:** ✅ Completamente Implementado

---

## 📑 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Características Implementadas](#características-implementadas)
3. [Flujo Completo de Uso](#flujo-completo-de-uso)
4. [Cambios Backend](#cambios-backend)
5. [Cambios Frontend](#cambios-frontend)
6. [Interfaz de Usuario](#interfaz-de-usuario)
7. [Validaciones](#validaciones)
8. [Diagnostico y Troubleshooting](#diagnostico-y-troubleshooting)
9. [Base de Datos](#base-de-datos)
10. [Próximas Mejoras](#próximas-mejoras)

---

## 🎯 Descripción General

El módulo **Gestión de Citas** en GestionAsegurado permite a los gestores:
- ✅ Asignar especialistas (médicos) a pacientes
- ✅ Programar fecha y hora de cita
- ✅ Cambiar estado de la solicitud
- ✅ Guardar todo en una sola operación
- ✅ Ver datos persistidos al recargar

### Endpoints Principales

```
GET    /api/bolsas/solicitudes/mi-bandeja              Obtener pacientes asignados
PATCH  /api/bolsas/solicitudes/{id}/estado-y-cita     Guardar estado + cita + médico
GET    /api/detalle-medico/{idServicio}               Obtener médicos por servicio
```

---

## ✨ Características Implementadas

### 1. Obtención Dinámica de Médicos ✅
- **Trigger:** Cuando `id_servicio` tiene valor numérico
- **Endpoint:** `GET /api/detalle-medico/{idServicio}`
- **Caching:** Se cachean por servicio para mejor performance
- **Respuesta:** Incluye nombre, teléfono, email, colegiado
- **🆕 Carga Automática:** Al abrir el formulario, se cargan automáticamente los médicos de pacientes que tienen `idPersonal` guardado

### 1.1 Flujo de Carga Automática (NEW v3.5.0)

```
┌─────────────────────────────────────────────────┐
│ 1. Usuario abre GestionAsegurado                │
│    GET /mi-bandeja                              │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 2. Se cargan pacientes en pacientesAsignados    │
│    Algunos tienen:                              │
│    ├─ idPersonal: 190                           │
│    ├─ idServicio: 3                             │
│    └─ fechaAtencion: "2026-02-07"               │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 3. useEffect detecta pacientes con idPersonal   │
│    Recolecta servicios únicos: [3, 5, 7]        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 4. Para cada servicio sin cache:                │
│    GET /detalle-medico/3                        │
│    GET /detalle-medico/5                        │
│    GET /detalle-medico/7                        │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 5. Médicos se cargan en medicosPorServicio      │
│    {                                            │
│      3: [medicos...],                           │
│      5: [medicos...],                           │
│      7: [medicos...]                            │
│    }                                            │
└─────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────┐
│ 6. Tabla re-renderiza y muestra especialista    │
│    ✅ "Dra. Patricia Julia..."                  │
│    📱 985778281                                 │
│    (Sin necesidad de editar)                    │
└─────────────────────────────────────────────────┘
```

### 2. Entrada Combinada de Fecha/Hora ✅
- **Tipo:** Input `datetime-local` (calendario + reloj)
- **Formato interno:** "YYYY-MM-DDTHH:mm"
- **Almacenamiento:** Separado en `fecha_atencion` (DATE) y `hora_atencion` (TIME)
- **Validación:** Obligatoria antes de guardar

### 3. Edición Condicional ✅
- **Modo Normal:** Solo lectura (texto)
- **Modo Edición:** Campos editables (verde)
- **Transición:** Al presionar "✏️ Editar"
- **Persistencia:** Al presionar "💾 Guardar"

### 4. Columna Acciones Inteligente ✅
- **Modo Normal:** Botón "✏️ Editar" + "📱 Teléfono"
- **Modo Edición:** Botones "💾 Guardar" + "✕ Cancelar"
- **Validación:** Requiere datos antes de guardar

### 5. Nuevo Endpoint Mejorado ✅
- **Anterior:** `PATCH /estado?nuevoEstadoCodigo=...` (solo estado)
- **Nuevo:** `PATCH /estado-y-cita` (estado + fecha + hora + médico)
- **Ventajas:** Una sola petición, transacción atómica
- **Respuesta:** Incluye confirmación de guardado

### 6. Persistencia de Datos ✅
- **Carga al Abrir:** Automáticamente carga datos guardados
- **Conversión:** Combina fecha_atencion + hora_atencion en datetime-local
- **Estado:** Especialista y fecha se muestran en modo lectura

---

## 🔄 Flujo Completo de Uso

### Escenario: Actualizar Cita de Paciente

```
┌─────────────────────────────────────────────────────┐
│ 1. USUARIO ABRE GestionAsegurado                    │
├─────────────────────────────────────────────────────┤
│ GET /api/bolsas/solicitudes/mi-bandeja              │
│ ├─ Retorna solicitudes con campos:                  │
│ │  • id_solicitud, numero_solicitud                 │
│ │  • paciente_nombre, paciente_dni                  │
│ │  • especialidad, id_servicio                      │
│ │  • estado, cod_estado_cita                        │
│ │  ✨ fecha_atencion: "2026-02-07"                  │
│ │  ✨ hora_atencion: "13:15"                        │
│ │  ✨ id_personal: 190                              │
│ └─ Frontend carga datos en estado citasAgendadas    │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. TABLA MUESTRA PACIENTES CON DATOS (LECTURA)      │
├─────────────────────────────────────────────────────┤
│ Fila: Juan Pérez (4683586)                          │
│ ├─ Especialista: "Patricia Julia..." (texto)        │
│ │                📱 985778281, 📧 N/A              │
│ ├─ Fecha/Hora: "07/02/2026 13:15" (texto)          │
│ ├─ Estado: 🟦 CITADO (badge)                        │
│ └─ Acciones: ✏️ Editar │ 📱                         │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 3. USUARIO PRESIONA "✏️ Editar"                     │
├─────────────────────────────────────────────────────┤
│ Fila se activa para edición (resaltada)             │
│ ├─ Especialista: [▼ Dropdown editable] (verde)      │
│ │                Muestra médicos de NEUROLOGÍA      │
│ ├─ Fecha/Hora: [Input datetime editable] (verde)    │
│ ├─ Estado: [▼ Dropdown] (naranja)                   │
│ └─ Acciones: 💾 Guardar │ ✕ Cancelar              │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 4. USUARIO EDITA CAMPOS (OPCIONAL)                  │
├─────────────────────────────────────────────────────┤
│ Puede cambiar:                                      │
│ ├─ Especialista: Dra. Patricia → Dr. Carlos         │
│ ├─ Fecha/Hora: 07/02 13:15 → 08/02 14:30            │
│ └─ Estado: PENDIENTE → CITADO                       │
│                                                     │
│ Los datos se guardan en estado citasAgendadas:      │
│ {                                                   │
│   5: {                                              │
│     fecha: "2026-02-08T14:30",                      │
│     especialista: 191                               │
│   }                                                 │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 5. USUARIO PRESIONA "💾 Guardar"                    │
├─────────────────────────────────────────────────────┤
│ Validaciones:                                       │
│ ✅ Estado seleccionado                              │
│ ✅ Fecha/Hora completados                           │
│ ✅ Especialista seleccionado                        │
│                                                     │
│ Si falta algo:                                      │
│ ❌ Toast: "Por favor completa fecha y hora"         │
│ └─ Edición continúa                                 │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 6. FRONTEND ENVÍA AL BACKEND                        │
├─────────────────────────────────────────────────────┤
│ PATCH /api/bolsas/solicitudes/5/estado-y-cita      │
│ Content-Type: application/json                      │
│                                                     │
│ Body:                                               │
│ {                                                   │
│   "nuevoEstadoCodigo": "CITADO",                   │
│   "fechaAtencion": "2026-02-08",                   │
│   "horaAtencion": "14:30",                         │
│   "idPersonal": 191                                │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 7. BACKEND PROCESA (TRANSACCIONAL)                  │
├─────────────────────────────────────────────────────┤
│ @Transactional - Garantiza atomicidad               │
│                                                     │
│ 1. Valida nuevoEstadoCodigo                         │
│ 2. Busca DimEstadosGestionCitas por código          │
│ 3. Obtiene SolicitudBolsa por ID                    │
│ 4. Actualiza campos:                                │
│    ├─ estadoGestionCitasId = estado.getIdEstado()   │
│    ├─ fechaCambioEstado = OffsetDateTime.now()      │
│    ├─ fechaAtencion = "2026-02-08"                  │
│    ├─ horaAtencion = "14:30"                        │
│    └─ idPersonal = 191                              │
│ 5. Guarda en BD: solicitudRepository.save()         │
│ 6. Construye response segura (HashMap)              │
│ 7. Retorna 200 OK con confirmación                  │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 8. FRONTEND RECIBE RESPUESTA                        │
├─────────────────────────────────────────────────────┤
│ Response 200 OK:                                    │
│ {                                                   │
│   "mensaje": "Estado y cita actualizados...",      │
│   "idSolicitud": 5,                                 │
│   "numeroSolicitud": "BOLSA-20260129-00213",       │
│   "nuevoEstadoCodigo": "CITADO",                   │
│   "fechaAtencion": "2026-02-08",                   │
│   "horaAtencion": "14:30",                         │
│   "idPersonal": 191                                │
│ }                                                   │
│                                                     │
│ Toast: "✅ Estado actualizado"                      │
│ Botón Deshacer aparece (5 segundos)                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 9. FRONTEND RECARGA DATOS (Después de 5 segundos)   │
├─────────────────────────────────────────────────────┤
│ GET /api/bolsas/solicitudes/mi-bandeja              │
│ └─ Obtiene datos frescos del backend                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 10. TABLA SE ACTUALIZA (MODO LECTURA)               │
├─────────────────────────────────────────────────────┤
│ Fila vuelve a modo normal:                          │
│ ├─ Especialista: "Dr. Carlos..." (NEW)              │
│ ├─ Fecha/Hora: "08/02/2026 14:30" (NEW)             │
│ ├─ Estado: 🟦 CITADO (actualizado)                  │
│ └─ Acciones: ✏️ Editar │ 📱                         │
│                                                     │
│ ✅ TODO GUARDADO Y PERSISTIDO                       │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Cambios Backend

### 1. Nueva Entidad: Campos Agregados a `SolicitudBolsa.java`

```java
// 📅 DETALLES DE CITA AGENDADA (NEW v3.4.0)
@Column(name = "fecha_atencion")
private java.time.LocalDate fechaAtencion;

@Column(name = "hora_atencion")
private java.time.LocalTime horaAtencion;

@Column(name = "id_personal")
private Long idPersonal;
```

**Ubicación:** `backend/src/main/java/com/styp/cenate/model/bolsas/SolicitudBolsa.java`  
**Líneas:** ~177-191

### 2. DTO: `ActualizarEstadoCitaDTO.java`

```java
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActualizarEstadoCitaDTO {
    private String nuevoEstadoCodigo;      // PENDIENTE, CITADO, etc.
    private LocalDate fechaAtencion;       // YYYY-MM-DD
    private LocalTime horaAtencion;        // HH:mm
    private Long idPersonal;               // ID del médico
    private String notas;                  // Observaciones
}
```

**Ubicación:** `backend/src/main/java/com/styp/cenate/dto/bolsas/ActualizarEstadoCitaDTO.java`

### 3. DTO: `SolicitudBolsaDTO.java` - Campos Agregados

```java
@JsonProperty("fecha_atencion")
private java.time.LocalDate fechaAtencion;

@JsonProperty("hora_atencion")
private java.time.LocalTime horaAtencion;

@JsonProperty("id_personal")
private Long idPersonal;
```

**Ubicación:** `backend/src/main/java/com/styp/cenate/dto/bolsas/SolicitudBolsaDTO.java`  
**Propósito:** Serializar datos cuando se obtienen en `/mi-bandeja`

### 4. Servicio: `SolicitudBolsaServiceImpl.java` - Mapeo Actualizado

```java
// En método mapSolicitudBolsaToDTO()
.fechaAtencion(solicitud.getFechaAtencion())
.horaAtencion(solicitud.getHoraAtencion())
.idPersonal(solicitud.getIdPersonal())
.build();
```

**Ubicación:** `backend/src/main/java/com/styp/cenate/service/bolsas/SolicitudBolsaServiceImpl.java`  
**Líneas:** ~2358-2396

### 5. Endpoint: `SolicitudBolsaController.java`

```java
@PatchMapping("/{id}/estado-y-cita")
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR GESTION DE CITAS', 'GESTOR DE CITAS')")
@Transactional  // ⭐ CRÍTICO: Garantiza persistencia
public ResponseEntity<?> cambiarEstadoYCita(
        @PathVariable Long id,
        @RequestBody ActualizarEstadoCitaDTO dto) {
    
    // 1. Validar estado
    // 2. Buscar estado en BD
    // 3. Obtener solicitud
    // 4. Actualizar campos (estado, fecha, hora, médico)
    // 5. Guardar: solicitudRepository.save()
    // 6. Retornar 200 OK con HashMap (maneja nulls)
}
```

**Ubicación:** `backend/src/main/java/com/styp/cenate/api/bolsas/SolicitudBolsaController.java`  
**Líneas:** ~469-565

**Cambios Recientes:**
- ✅ Agregado `@Transactional` para garantizar persistencia
- ✅ Cambio de `Map.of()` a `HashMap` para manejar nulls
- ✅ Agregado import: `import org.springframework.transaction.annotation.Transactional;`
- ✅ Agregado import: `import java.util.HashMap;`

---

## 🎨 Cambios Frontend

### 1. Estructura General

**Archivo:** `frontend/src/pages/roles/citas/GestionAsegurado.jsx` (1473 líneas)

### 2. Estados Principales

```javascript
const [citasAgendadas, setCitasAgendadas] = useState({});
// {
//   pacienteId: {
//     fecha: "2026-02-08T14:30",
//     especialista: idPersonal
//   }
// }

const [pacienteEditandoEstado, setPacienteEditandoEstado] = useState(null);
const [nuevoEstadoSeleccionado, setNuevoEstadoSeleccionado] = useState("");
const [medicosPorServicio, setMedicosPorServicio] = useState({});
const [cargandoMedicos, setCargandoMedicos] = useState(false);
```

### 3. Función: Obtener Médicos por Servicio

```javascript
const obtenerMedicosPorServicio = async (idServicio) => {
  if (!idServicio || isNaN(idServicio)) return;
  if (medicosPorServicio[idServicio]) return; // Cache
  
  setCargandoMedicos(true);
  try {
    const response = await fetch(
      `${API_BASE}/detalle-medico/${idServicio}`,
      { headers: { "Authorization": `Bearer ${getToken()}` } }
    );
    const data = await response.json();
    setMedicosPorServicio(prev => ({
      ...prev,
      [idServicio]: data
    }));
  } finally {
    setCargandoMedicos(false);
  }
};
```

**Propósito:** Cargar dinámicamente médicos cuando `id_servicio` es válido

### 3b. Cargar Médicos Automáticamente al Abrir (NEW v3.5.0)

```javascript
// Cargar automáticamente médicos de pacientes que ya tienen idPersonal
useEffect(() => {
  if (pacientesAsignados.length === 0) return;

  const serviciosConMedicos = new Set();
  
  // Recolectar servicios que tienen idPersonal guardado
  pacientesAsignados.forEach(paciente => {
    if (paciente.idPersonal && paciente.idServicio && 
        !serviciosConMedicos.has(paciente.idServicio)) {
      serviciosConMedicos.add(paciente.idServicio);
      console.log(`👨‍⚕️ Paciente ${paciente.pacienteNombre} 
                      tiene idPersonal ${paciente.idPersonal}`);
    }
  });

  // Cargar médicos para cada servicio
  serviciosConMedicos.forEach(idServicio => {
    if (!medicosPorServicio[idServicio]) {
      obtenerMedicosPorServicio(idServicio);
    }
  });
}, [pacientesAsignados, medicosPorServicio]);
```

**Beneficio:** ✅ El especialista guardado se muestra automáticamente al abrir

### 4. Hook: Cambio de Estado

```javascript
const { changeStatus } = useStatusChange(
  // Callback 1: Actualizar UI (optimistic)
  (pacienteId, newStatus) => {
    setPacientesAsignados(prev =>
      prev.map(p =>
        p.id === pacienteId ? { ...p, descEstadoCita: newStatus } : p
      )
    );
  },
  
  // Callback 2: API call (después de 5s si no deshace)
  async (pacienteId, newStatus) => {
    const citaAgendada = citasAgendadas[pacienteId] || {};
    
    // Extraer fecha y hora del datetime-local
    let fechaAtencion = null, horaAtencion = null;
    if (citaAgendada.fecha) {
      const [fecha, hora] = citaAgendada.fecha.split('T');
      fechaAtencion = fecha;
      horaAtencion = hora;
    }
    
    // Preparar body
    const bodyData = {
      nuevoEstadoCodigo: newStatus,
      fechaAtencion, horaAtencion,
      idPersonal: citaAgendada.especialista || null
    };
    
    // Enviar al nuevo endpoint
    const response = await fetch(
      `${API_BASE}/bolsas/solicitudes/${pacienteId}/estado-y-cita`,
      { method: "PATCH", body: JSON.stringify(bodyData), ... }
    );
    
    // Recargar datos desde backend
    await fetchPacientesAsignados();
  }
);
```

### 5. Columna: Especialista (Condicional)

```javascript
{pacienteEditandoEstado === paciente.id ? (
  // MODO EDICIÓN: Dropdown editable
  <select>
    {/* Opciones de médicos disponibles */}
  </select>
) : (
  // MODO NORMAL: Solo lectura
  <div className="text-xs">
    {medicoSeleccionado.nombre}
    <div className="text-blue-700">📱 {tel} | 📧 {email}</div>
  </div>
)}
```

### 6. Columna: Fecha/Hora (Condicional)

```javascript
{pacienteEditandoEstado === paciente.id ? (
  // MODO EDICIÓN: Input editable
  <input type="datetime-local" value={...} onChange={...} />
) : (
  // MODO NORMAL: Formato DD/MM/YYYY HH:mm
  <div className="text-xs font-semibold">
    {día}/{mes}/{año} {hora}
  </div>
)}
```

### 7. Columna: Estado (Condicional)

```javascript
{pacienteEditandoEstado === paciente.id ? (
  // MODO EDICIÓN: Dropdown
  <select>
    {estadosDisponibles.map(est => <option>{est.codigo}</option>)}
  </select>
) : (
  // MODO NORMAL: Badge
  <span className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-800">
    {paciente.descEstadoCita}
  </span>
)}
```

### 8. Columna: Acciones (Inteligente)

```javascript
{pacienteEditandoEstado === paciente.id ? (
  // MODO EDICIÓN
  <div className="flex gap-2">
    <button onClick={handleGuardarEstado}>💾 Guardar</button>
    <button onClick={handleCancelarEstado}>✕ Cancelar</button>
  </div>
) : (
  // MODO NORMAL
  <div className="flex gap-2">
    <button onClick={() => setPacienteEditandoEstado(paciente.id)}>
      ✏️ Editar
    </button>
    <button onClick={() => abrirModalTelefono(paciente)}>📱</button>
  </div>
)}
```

### 9. Validación: Guardar Estado

```javascript
const handleGuardarEstado = async () => {
  if (!pacienteEditandoEstado || !nuevoEstadoSeleccionado) {
    toast.error("Por favor selecciona un estado válido");
    return;
  }

  // ⭐ VALIDACIÓN CRÍTICA
  const citaAgendada = citasAgendadas[pacienteEditandoEstado] || {};
  if (!citaAgendada.fecha) {
    toast.error("⚠️ Por favor selecciona la fecha y hora de la cita");
    return;
  }

  // Proceder con guardado
  changeStatus(...);
};
```

### 10. Carga de Datos Guardados

```javascript
// Al cargar pacientes, procesar datos guardados
const citasGuardadas = {};
pacientes.forEach(paciente => {
  if (paciente.fechaAtencion || paciente.horaAtencion || paciente.idPersonal) {
    let datetimeValue = "";
    if (paciente.fechaAtencion) {
      datetimeValue = paciente.fechaAtencion;
      if (paciente.horaAtencion) {
        datetimeValue += `T${paciente.horaAtencion}`;
      }
    }
    citasGuardadas[paciente.id] = {
      fecha: datetimeValue,
      especialista: paciente.idPersonal
    };
  }
});

if (Object.keys(citasGuardadas).length > 0) {
  setCitasAgendadas(prev => ({ ...prev, ...citasGuardadas }));
}
```

---

## 🖥️ Interfaz de Usuario

### Tabla GestionAsegurado - Estructura

```
┌──────────────────────────────────────────────────────────────────┐
│ TABLA: Gestión de Pacientes Asignados                            │
├──────────────────────────────────────────────────────────────────┤
│ ☐ │Fecha  │ DNI   │ Nombre    │ Ed │ Gén │ Espec │ Especialista│
│   │Asign. │       │ Paciente  │ ad │ ero │ idad  │ (Dropdown)  │
├──────────────────────────────────────────────────────────────────┤
│ ☐ │Fecha/Hora │ IPRESS │ Tipo  │ Tel1  │ Tel2  │ Estado │Acciones│
│   │ de Cita   │        │ Cita  │       │       │ (Badge)│        │
├──────────────────────────────────────────────────────────────────┤
│ ... Fecha Cambio Estado │ Usuario Cambio Estado                   │
└──────────────────────────────────────────────────────────────────┘
```

### Modo Normal (Lectura)

```
┌─────────────────────────────────────────────────────────────┐
│ Fila: Paciente Normal (NO EDITANDO)                         │
├─────────────────────────────────────────────────────────────┤
│ Especialista:                                               │
│   Patricia Julia Barzola                                    │
│   📱 985778281                                              │
│   📧 N/A                                                    │
│                                                             │
│ Fecha/Hora: 07/02/2026 13:15                                │
│                                                             │
│ Estado: 🟦 CITADO (badge azul)                              │
│                                                             │
│ Acciones: [✏️ Editar] [📱]                                  │
└─────────────────────────────────────────────────────────────┘
```

### Modo Edición

```
┌─────────────────────────────────────────────────────────────┐
│ Fila: Paciente Editando (RESALTADA)                         │
├─────────────────────────────────────────────────────────────┤
│ Especialista:                                               │
│   ┌─────────────────────────────────────────────┐           │
│   │ ▼ Seleccionar médico...                     │ (verde)   │
│   │  Patricia Julia Barzola Zacarias            │           │
│   │  Dr. Ivette Stephanie León Jiménez         │           │
│   │  POL. APP - GUILLERMO KAELÍN DE LA F.      │           │
│   └─────────────────────────────────────────────┘           │
│   ✅ Patricia Julia Barzola (info debajo)                   │
│      📱 985778281, 📧 N/A                                   │
│                                                             │
│ Fecha/Hora:                                                 │
│   ┌────────────────────────┐                                │
│   │ 🟩 07/02/2026 13:15    │ (verde, editable)             │
│   └────────────────────────┘                                │
│                                                             │
│ Estado:                                                     │
│   ┌────────────────────────┐                                │
│   │ ▼ CITADO              │ (naranja, editable)            │
│   │  PENDIENTE            │                                │
│   │  CITADO               │                                │
│   │  ATENDIDO_IPRESS      │                                │
│   └────────────────────────┘                                │
│                                                             │
│ Acciones: [💾 Guardar] [✕ Cancelar]                        │
└─────────────────────────────────────────────────────────────┘
```

### Colores por Estado

| Estado | Color | Clase CSS |
|--------|-------|-----------|
| ATENDIDO_IPRESS | Verde | `bg-green-100 text-green-800` |
| PENDIENTE | Azul | `bg-blue-100 text-blue-800` |
| CITADO | Púrpura | `bg-purple-100 text-purple-800` |
| Otros | Gris | `bg-gray-100 text-gray-800` |

### Edición Condicional

| Elemento | Modo Normal | Modo Edición |
|----------|-------------|--------------|
| **Especialista** | Texto (gris) | Dropdown (VERDE) |
| **Fecha/Hora** | Texto "DD/MM/YYYY HH:mm" | Input (VERDE) |
| **Estado** | Badge de color | Dropdown (NARANJA) |
| **Acciones** | ✏️ Editar + 📱 | 💾 Guardar + ✕ Cancelar |

---

## ✅ Validaciones

### 1. Frontend

```javascript
// Antes de guardar
if (!pacienteEditandoEstado || !nuevoEstadoSeleccionado) {
  toast.error("Por favor selecciona un estado válido");
  return;
}

const citaAgendada = citasAgendadas[pacienteEditandoEstado] || {};
if (!citaAgendada.fecha) {
  toast.error("⚠️ Por favor selecciona la fecha y hora de la cita");
  return;
}
```

**Validaciones:**
- ✅ Estado debe estar seleccionado
- ✅ Fecha y hora deben estar completos
- ✅ Formato datetime válido (YYYY-MM-DDTHH:mm)

### 2. Backend

```java
// Validar estado
if (dto.getNuevoEstadoCodigo() == null || 
    dto.getNuevoEstadoCodigo().trim().isEmpty()) {
  return ResponseEntity.status(400).body(
    Map.of("error", "nuevoEstadoCodigo es obligatorio")
  );
}

// Buscar estado en BD
DimEstadosGestionCitas estado = estadosRepository
  .findByCodigoEstado(dto.getNuevoEstadoCodigo())
  .orElseThrow(() -> new ResourceNotFoundException(...));

// Buscar solicitud
SolicitudBolsa solicitud = solicitudRepository.findById(id)
  .orElseThrow(() -> new ResourceNotFoundException(...));

// Validar médico si se proporciona
if (dto.getIdPersonal() != null && dto.getIdPersonal() > 0) {
  // Se guarda sin validación (asume que existe)
}
```

---

## 🔍 Diagnostico y Troubleshooting

### Problema: No se guardan datos (v3.5.1 fix)

**Síntomas:**
- Tras hacer clic en "💾 Guardar", el toast dice "✅ Estado actualizado"
- Pero al recargar la página, los datos no están guardados

**Causas y Soluciones:**

1. **El botón "Editar" no pre-selecciona el estado actual**
   - **Fixed en v3.5.1:** Ahora usa `paciente.codigoEstado` en lugar de buscar por descripción
   - **Cambio:** `setNuevoEstadoSeleccionado(paciente.codigoEstado || "")`

2. **Los médicos no se cargan automáticamente**
   - **Fixed en v3.5.1:** Nuevo useEffect carga médicos al abrir el formulario
   - **Si aún no funciona:** Abre console (F12) y busca:
     ```
     👨‍⚕️ Paciente ... tiene idPersonal ..., cargando médicos del servicio ...
     ```

3. **Los datos de la cita no se envían correctamente al backend**
   - **Fixed en v3.5.1:** Se pasa el código de estado correctamente
   - **Verificación:** En console ver:
     ```
     📤 Enviando a nuevo endpoint: { 
       nuevoEstadoCodigo: "CITADO",
       fechaAtencion: "2026-02-07",
       horaAtencion: "13:15",
       idPersonal: 190 
     }
     ```

### Verificación Paso a Paso

**1. Abre console (F12)**

**2. Refresca la página**
- Debes ver: `👨‍⚕️ Paciente ... cargando médicos...`

**3. Haz clic en "✏️ Editar"**
- Esperado: El especialista se muestra (ej: "Dra. Patricia...")

**4. Verifica que el estado esté pre-seleccionado**
- Espera: El dropdown de estado tiene un valor

**5. Cambia el estado y selecciona especialista + fecha**
- Esperado: Los campos se actualizan

**6. Haz clic en "💾 Guardar"**
- Expected logs:
  ```
  📝 Paciente a guardar: {...}
  📝 Especialista: 190
  📝 Fecha/Hora: 2026-02-07T13:15
  📝 Estado: CITADO
  📊 Objeto estado encontrado: { codigo: "CITADO", ... }
  📤 Enviando a nuevo endpoint: {...}
  ✅ Backend response OK: {...}
  ```

**7. Si ves ❌ Error response from backend**
- Copia el error exacto
- Verifica que el código de estado sea válido (CITADO, PENDIENTE, etc.)
- Verifica que la fecha sea YYYY-MM-DD
- Verifica que la hora sea HH:mm

**8. Recarga la página**
- Verifica que los datos permanecen (en lectura)

---

### Problema: Especialista No Se Carga Dinámicamente

**Síntomas:**
- Dropdown de especialista vacío
- O muestra "Sin médicos" o "Cargando..."

**Causas:**

1. **idServicio no es válido**
   - **Verificación:** `console.log("idServicio:", paciente.idServicio)`
   - **Debe ser:** Número > 0 (ejemplo: 3, 5, 7)

2. **Endpoint `/detalle-medico/{idServicio}` falla**
   - **Verificación:** Abre en navegador: `http://localhost:8080/api/detalle-medico/3`
   - **Debe retornar:** Array JSON con médicos
   - **Si 401:** Token JWT expirado → reloguea
   - **Si 404:** Servicio no existe → verifica ID

3. **JWT token no es válido**
   - **Solución:** Reloguea

### Problema: Fecha/Hora No Se Guarda

**Síntomas:**
- Campo muestra valor (ej: "07/02/2026 13:15")
- Pero BD queda vacío (NULL)

**Causas:**

1. **Frontend no extrae hora correctamente**
   - **Debug:** Console ver: `🔍 DEBUG - hora después split: 14:30`
   - **Debe ser:** Formato HH:mm

2. **Backend recibe null**
   - **Debug:** Log backend: `📤 Enviando: { fechaAtencion: null, horaAtencion: null }`
   - **Solución:** Verifica que el input datetime-local tenga un valor

3. **Tipo de dato en BD es incorrecto**
   - **Verificación:** SQL: `DESCRIBE dim_solicitud_bolsa;`
   - **Debe ser:** 
     - `fecha_atencion`: DATE
     - `hora_atencion`: TIME

---

## 🗄️ Base de Datos

### Tabla: `dim_solicitud_bolsa`

#### Nuevas Columnas (Agregadas en v3.4.0)

```sql
ALTER TABLE dim_solicitud_bolsa ADD COLUMN fecha_atencion DATE;
ALTER TABLE dim_solicitud_bolsa ADD COLUMN hora_atencion TIME;
ALTER TABLE dim_solicitud_bolsa ADD COLUMN id_personal BIGINT;
```

#### Campos Relacionados

```sql
SELECT 
  id_solicitud,
  numero_solicitud,
  paciente_nombre,
  especialidad,
  id_servicio,
  cod_estado_cita,
  fecha_atencion,      -- NEW
  hora_atencion,       -- NEW
  id_personal,         -- NEW
  fecha_cambio_estado,
  usuario_cambio_estado_id
FROM dim_solicitud_bolsa
WHERE id_solicitud = 5;
```

#### Validación Post-Guardado

```sql
-- Verificar que se guardó correctamente
SELECT 
  id_solicitud,
  numero_solicitud,
  fecha_atencion,
  hora_atencion,
  id_personal,
  fecha_cambio_estado
FROM dim_solicitud_bolsa
WHERE id_solicitud = 5
ORDER BY fecha_cambio_estado DESC
LIMIT 1;

-- Resultado esperado:
-- id_solicitud: 5
-- numero_solicitud: BOLSA-20260129-00213
-- fecha_atencion: 2026-02-07
-- hora_atencion: 13:15:00
-- id_personal: 190
-- fecha_cambio_estado: 2026-02-03 10:14:34+00
```

---

## 🚀 Próximas Mejoras

### 1. Validación de Médico en Backend
```java
// Verificar que idPersonal existe en BD
if (dto.getIdPersonal() != null && dto.getIdPersonal() > 0) {
  dimPersonalRepository.findById(dto.getIdPersonal())
    .orElseThrow(() -> new ResourceNotFoundException(
      "Personal/Médico no encontrado: " + dto.getIdPersonal()
    ));
}
```

### 2. Notas/Observaciones
- Agregar campo `notas` a DTO (ya existe, falta implementar en UI)
- Permitir que gestor agregue observaciones sobre la cita

### 3. Mostrar Nombre del Médico en Tabla
- Actual: Solo muestra info si está en modo edición
- Mejora: Mostrar nombre del médico también en modo lectura

### 4. Sincronización en Tiempo Real
- Usar WebSocket para actualizar tabla cuando otro gestor modifica
- Notificación: "El paciente XYZ fue actualizado por otro usuario"

### 5. Exportación de Datos
- Botón para exportar tabla con todos los datos a Excel
- Incluir: Médico asignado, fecha/hora programada, estado

### 6. Recordatorios de Citas
- Sistema de notificaciones 24h antes de la cita
- SMS/Email a paciente y médico

### 7. Historial de Cambios
- Mostrar quién cambió qué y cuándo
- Comparar versión anterior vs actual

---

## 📚 Referencia Rápida

### Endpoints Principales

| Método | URL | Propósito |
|--------|-----|----------|
| GET | `/api/bolsas/solicitudes/mi-bandeja` | Obtener pacientes asignados |
| PATCH | `/api/bolsas/solicitudes/{id}/estado-y-cita` | Guardar estado+cita+médico |
| GET | `/api/detalle-medico/{idServicio}` | Obtener médicos del servicio |

### Variables de Estado (Frontend)

```javascript
citasAgendadas          // { pacienteId: { fecha, especialista } }
pacienteEditandoEstado  // ID del paciente en edición
nuevoEstadoSeleccionado // Código de estado seleccionado
medicosPorServicio      // { idServicio: [medicos] } (cache)
cargandoMedicos         // boolean
```

### Archivos Clave

| Ruta | Descripción |
|------|-------------|
| `backend/src/main/java/.../SolicitudBolsaController.java` | Endpoints REST |
| `backend/src/main/java/.../SolicitudBolsa.java` | Entidad JPA |
| `backend/src/main/java/.../ActualizarEstadoCitaDTO.java` | DTO de entrada |
| `backend/src/main/java/.../SolicitudBolsaDTO.java` | DTO de respuesta |
| `frontend/src/pages/roles/citas/GestionAsegurado.jsx` | Componente principal |

---

## ✨ Resumen de Features

✅ Obtener pacientes asignados desde `/mi-bandeja`  
✅ Cargar dinámicamente médicos por servicio  
✅ **NEW v3.5.0:** Cargar automáticamente especialistas guardados al abrir  
✅ Input datetime-local para fecha+hora combinadas  
✅ Edición condicional (solo en modo edición)  
✅ Validación obligatoria de fecha/hora  
✅ Nuevo endpoint mejorado `/estado-y-cita`  
✅ Guardado transaccional (atomicidad garantizada)  
✅ Persistencia de datos (carga al abrir)  
✅ Toast con patrón Undo (5 segundos)  
✅ Respuesta con confirmación desde backend  

---

## 🆕 Fixes Aplicados en v3.5.1

### Fix 1: Pre-seleccionar Estado al Editar

```javascript
// ANTES (incorrecto)
setNuevoEstadoSeleccionado(
  estadosDisponibles.find(e => e.descripcion === paciente.descEstadoCita)?.codigo || ""
);

// DESPUÉS (correcto)
setNuevoEstadoSeleccionado(paciente.codigoEstado || "");
```

**Beneficio:** El estado actual se pre-selecciona correctamente cuando haces clic en "Editar"

### Fix 2: Cargar Especialistas Automáticamente

Nuevo useEffect que detecta pacientes con `idPersonal` al cargar y automáticamente obtiene los médicos:

```javascript
useEffect(() => {
  if (pacientesAsignados.length === 0) return;

  const serviciosConMedicos = new Set();
  
  pacientesAsignados.forEach(paciente => {
    if (paciente.idPersonal && paciente.idServicio) {
      serviciosConMedicos.add(paciente.idServicio);
      console.log(`👨‍⚕️ Paciente ${paciente.pacienteNombre} cargando médicos...`);
    }
  });

  serviciosConMedicos.forEach(idServicio => {
    if (!medicosPorServicio[idServicio]) {
      obtenerMedicosPorServicio(idServicio);
    }
  });
}, [pacientesAsignados, medicosPorServicio]);
```

**Beneficio:** ✅ El especialista se muestra al abrir el formulario (sin hacer clic en Editar)

### Fix 3: Pasar Código de Estado Correctamente al Backend

```javascript
// Extraer el código de estado de su descripción en el callback
const estadoObj = estadosDisponibles.find(e => e.descripcion === newStatus);
const nuevoEstadoCodigo = estadoObj?.codigo || newStatus;

// Enviar el código al backend
const bodyData = {
  nuevoEstadoCodigo: nuevoEstadoCodigo,  // Ahora es el código correcto
  fechaAtencion: fechaAtencion,
  horaAtencion: horaAtencion,
  idPersonal: idPersonal
};
```

**Beneficio:** ✅ El backend recibe el código de estado válido ("CITADO", "PENDIENTE", etc.)

### Fix 4: Agregados Logs Detallados para Debugging

Se agregaron logs en `handleGuardarEstado`:

```javascript
console.log("📝 Paciente a guardar:", paciente);
console.log("📝 Especialista:", citaAgendada.especialista);
console.log("📝 Fecha/Hora:", citaAgendada.fecha);
console.log("📝 Estado:", nuevoEstadoSeleccionado);
```

**Beneficio:** Facilita debugging cuando algo falla

---

**Última revisión:** 2026-02-03  
**Versión:** v3.5.1  
**Estado:** ✅ Producción
