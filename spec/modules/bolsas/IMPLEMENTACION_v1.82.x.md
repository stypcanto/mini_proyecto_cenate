# Implementación v1.82.x — Trazabilidad Completa + Auditoría + Badge CENACRON

> **Fecha:** 2026-03-02
> **Desarrollado por:** Ing. Styp Canto Rondón + Claude Sonnet 4.6

---

## Versiones implementadas

| Versión | Descripción |
|---------|-------------|
| v1.82.1 | Fix FK violation al enviar ticket a Bolsa de Reprogramación |
| v1.82.2 | Fix normalizar `condicion_medica` y `estado_bolsa` en BD y frontend |
| v1.82.3 | Flyway V6_10_0 — normalizar especialidades con paréntesis |
| v1.82.4 | IPRESS muestra nombre en lugar de código numérico |
| v1.82.5 | IPRESS ATENCIÓN muestra nombre (no código) en panel citas agendadas |
| v1.82.6 | Auditoría completa: quién ejecuta cada acción + trazabilidad + badge CENACRON |

---

## v1.82.6 — Trazabilidad completa de solicitudes de bolsa

### Problema resuelto

El historial de ciclo de vida de una solicitud (`HistorialBolsaTab`) mostraba qué ocurrió, pero no quién lo hizo. Además, la anulación masiva no registraba el usuario que la ejecutó, y el badge CENACRON faltaba en la bandeja de coordinador de enfermería.

---

### 1. Campo `usuario` en trazabilidad

**`dto/bolsas/TrazabilidadBolsaResponseDTO.java`** — `EventoTrazabilidadDTO`

```java
/** Nombre del usuario del sistema que ejecutó la acción */
private String usuario;
```

**`service/bolsas/TrazabilidadBolsaService.java`**

Nuevo helper para resolver el nombre completo del usuario del sistema por `idUser`:

```java
private String resolverNombreUsuario(Long idUsuario) {
    if (idUsuario == null) return null;
    try {
        return personalRepo.findByUsuario_IdUser(idUsuario)
                .map(PersonalCnt::getNombreCompleto)
                .orElse(null);
    } catch (Exception e) { return null; }
}
```

Resolución al inicio del método para reutilizar:

```java
String nombreGestora       = resolverNombreUsuario(s.getResponsableGestoraId());
String nombreUsuarioCambio = resolverNombreUsuario(s.getUsuarioCambioEstadoId());
```

Cada evento ahora incluye `.usuario(...)`:

| Evento | Campo `usuario` |
|--------|----------------|
| INGRESO | `responsableGestoraId` → nombre gestora |
| ASIGNACION_MEDICO | `responsableGestoraId` → nombre gestora |
| CITA_AGENDADA | `usuarioCambioEstadoId` o gestora como fallback |
| ATENCION | médico que atendió |
| CAMBIO_ESTADO | `usuarioCambioEstadoId` o gestora como fallback |
| ANULACION | `usuarioCambioEstadoId` o gestora como fallback |
| DEVOLUCION | `usuario_nombre` del historial permanente |

Fix clave: `ASIGNACION_MEDICO` ahora usa `fechaAsignacion` en lugar de `fechaActualizacion` para evitar timestamps incorrectos generados por otras operaciones (p. ej. `FixEstadosSolicitudesRechazadasInitializer`).

```java
// ANTES (incorrecto)
.fecha(s.getFechaAsignacion() != null ? s.getFechaAsignacion() : s.getFechaActualizacion())

// DESPUÉS (correcto)
.fecha(s.getFechaAsignacion() != null ? s.getFechaAsignacion() : s.getFechaSolicitud())
```

---

### 2. Fix auditoría en anulación masiva

**`repository/bolsas/SolicitudBolsaRepository.java`** — `cambiarEstadoMasivoConMotivo`

```java
@Query("UPDATE SolicitudBolsa s SET " +
    "s.estadoGestionCitasId = :idEstado, " +
    "s.fechaCambioEstado = CURRENT_TIMESTAMP, " +
    "s.motivoAnulacion = :motivo, " +
    "s.condicionMedica = 'Anulado', " +
    "s.estado = 'Observado', " +
    "s.usuarioCambioEstadoId = :idUsuario " +
    "WHERE s.idSolicitud IN :ids AND s.activo = true")
int cambiarEstadoMasivoConMotivo(List<Long> ids, Long idEstado, String motivo, Long idUsuario);
```

**`service/bolsas/SolicitudBolsaServiceImpl.java`** — `rechazarMasivoConMotivo`

Captura del usuario autenticado antes de ejecutar la actualización:

```java
Long idUsuarioActual = null;
try {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth != null && auth.isAuthenticated()) {
        Usuario usuario = usuarioRepository.findByNameUser(auth.getName()).orElse(null);
        if (usuario != null) idUsuarioActual = usuario.getIdUser();
    }
} catch (Exception e) { log.warn(...); }
```

---

### 3. Fix normalización datos históricos

**`config/FixEstadosSolicitudesRechazadasInitializer.java`**

Corrección de nombres de columna en la subquery (causaba `bad SQL grammar`):

```sql
-- ANTES (incorrecto)
SELECT id_estado FROM dim_estados_gestion_citas WHERE codigo_estado = 'RECHAZADO'

-- DESPUÉS (correcto)
SELECT id_estado_cita FROM dim_estados_gestion_citas WHERE cod_estado_cita = 'RECHAZADO'
```

Ejecuta en startup y corrige registros históricos con `condicion_medica = 'RECHAZADO'` que no tenían el estado normalizado.

**Migración SQL manual ejecutada:**
```sql
-- Unificar "Anulada" → "Anulado" (12 registros)
UPDATE dim_solicitud_bolsa SET condicion_medica = 'Anulado' WHERE condicion_medica = 'Anulada';
```

---

### 4. Tabla `dim_historial_cambios_solicitud`

Tabla permanente para registrar devoluciones y anulaciones con auditoría completa.

```sql
CREATE TABLE dim_historial_cambios_solicitud (
    id_historial          BIGSERIAL PRIMARY KEY,
    id_solicitud          BIGINT NOT NULL REFERENCES dim_solicitud_bolsa(id_solicitud),
    tipo_cambio           VARCHAR(50) NOT NULL,  -- DEVOLUCION_A_PENDIENTE, ANULACION, etc.
    motivo                TEXT,
    estado_anterior_id    BIGINT,
    estado_anterior_desc  VARCHAR(200),
    medico_anterior_id    BIGINT,
    medico_anterior_nombre VARCHAR(300),
    fecha_cita_anterior   DATE,
    hora_cita_anterior    TIME,
    usuario_id            BIGINT REFERENCES dim_usuarios(id_user),
    usuario_nombre        VARCHAR(300),
    fecha_cambio          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

Índices: `idx_historial_cambios_id_solicitud`, `idx_historial_cambios_tipo`, `idx_historial_cambios_fecha`.

---

### 5. Badge CENACRON en citas agendadas y citas pendientes

**`frontend/src/pages/roles/citas/CitasAgendadas.jsx`** — línea ~1565

```jsx
{p.esCenacron && (
  <span style={{ padding: '1px 8px', borderRadius: '999px', fontSize: '10px',
    fontWeight: '700', background: '#f3e8ff', color: '#7e22ce',
    border: '1px solid #d8b4fe' }}>
    ♾ CENACRON
  </span>
)}
```

**`frontend/src/pages/roles/citas/GestionAsegurado.jsx`** — línea ~2639

```jsx
{paciente.esCenacron && (
  <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px]
    font-bold bg-purple-100 text-purple-700 border border-purple-300">
    ♾ CENACRON
  </span>
)}
```

**`service/bolsas/SolicitudBolsaServiceImpl.java`** — `obtenerBandejaEnfermeriaCoordinador`

Enriquecimiento CENACRON agregado al método (faltaba, ya existía en `obtenerSolicitudesAsignadasAGestora`):

```java
List<String> dnisCenacronQuery = resultado.stream()
    .map(SolicitudBolsaDTO::getPacienteDni)
    .filter(dni -> dni != null && !dni.isBlank())
    .distinct().collect(Collectors.toList());
if (!dnisCenacronQuery.isEmpty()) {
    Set<String> setCenacron = new HashSet<>(
        pacienteEstrategiaRepository.findDnisPertenecentesAEstrategia(dnisCenacronQuery, "CENACRON")
    );
    resultado.forEach(dto -> dto.setEsCenacron(setCenacron.contains(dto.getPacienteDni())));
}
```

El campo `es_cenacron` NO es una columna de BD — se calcula en tiempo de ejecución consultando `paciente_estrategia` (249 pacientes activos).

---

### 6. Mejoras en `HistorialBolsaTab.jsx`

- Evento `DEVOLUCION` agregado al mapa de colores/iconos (ícono `RotateCcw`, color ámbar)
- Formato de fechas sin puntos, en 24h: `02 mar 2026, 14:35`
- Etiquetas dinámicas por tipo de evento (`LABEL_USUARIO`, `LABEL_MEDICO`)
- Columna separada para "Gestionado por" (usuario del sistema) vs "Profesional" (médico)

---

### 7. Auto-navegación a fecha de cita en TotalPacientesEnfermeria

Al buscar un paciente por DNI y hacer clic en el resultado, el panel salta automáticamente a la fecha en que está citado ese paciente.

**`dto/enfermeria/RescatarPacienteDto.java`** — campo agregado:
```java
private LocalDate fechaAtencion;
```

**`service/enfermeria/NursingService.java`** — mapeo del campo `r[4]`:
```java
.fechaAtencion(r[4] != null ? ((java.sql.Date) r[4]).toLocalDate() : null)
```

**`frontend/src/pages/enfermeria/TotalPacientesEnfermeria.jsx`**:
```jsx
const fechaCita = resultado.fechaAtencion || resultado.fecha_atencion || null;
if (fechaCita && fechaCita !== fecha) {
    setFecha(fechaCita);
    cargar(fechaCita, turno);
}
```

También se agregó el color `'Anulado'` (rojo) a las funciones `condicionColor()` y `estadoColor()`.

---

## Archivos modificados (v1.82.x)

### Backend
| Archivo | Cambio |
|---------|--------|
| `config/FixEstadosSolicitudesRechazadasInitializer.java` | Fix SQL column names + CommandLineRunner |
| `dto/bolsas/TrazabilidadBolsaResponseDTO.java` | Campo `usuario` en `EventoTrazabilidadDTO` |
| `dto/enfermeria/RescatarPacienteDto.java` | Campo `fechaAtencion` |
| `repository/bolsas/SolicitudBolsaRepository.java` | JPQL `cambiarEstadoMasivoConMotivo` + param `:idUsuario` |
| `service/bolsas/SolicitudBolsaServiceImpl.java` | Captura usuario en anulación masiva + CENACRON en bandeja enfermería |
| `service/bolsas/TrazabilidadBolsaService.java` | `resolverNombreUsuario()` + usuario en todos los eventos + fix fecha asignación |
| `service/enfermeria/NursingService.java` | Mapeo `fechaAtencion` en `buscarPacienteGlobal()` |
| `resources/db/migration/V6_9_0__fix_estados_solicitudes_rechazadas.sql` | Fix column names |

### Frontend
| Archivo | Cambio |
|---------|--------|
| `components/trazabilidad/HistorialBolsaTab.jsx` | DEVOLUCION event + formato fechas + LABEL_USUARIO/MEDICO |
| `pages/enfermeria/TotalPacientesEnfermeria.jsx` | Auto-navegación a fecha cita + color Anulado |
| `pages/roles/citas/CitasAgendadas.jsx` | Badge CENACRON (ya estaba, confirmado operativo) |
| `pages/roles/citas/GestionAsegurado.jsx` | Badge CENACRON (ya estaba, confirmado operativo) |

### BD (ejecuciones manuales)
```sql
-- Unificar Anulada → Anulado (12 registros)
UPDATE dim_solicitud_bolsa SET condicion_medica = 'Anulado' WHERE condicion_medica = 'Anulada';

-- Fix auditoría anulación masiva para paciente específico
UPDATE dim_solicitud_bolsa SET usuario_cambio_estado_id = 291
WHERE paciente_dni = '07337227' AND usuario_cambio_estado_id IS NULL AND motivo_anulacion IS NOT NULL;
```
