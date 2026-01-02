# Plan de Implementación: Módulo de Disponibilidad de Turnos Médicos

> **Sistema de Telemedicina - EsSalud | Módulo de Gestión de Disponibilidad de Turnos**
> **Versión:** 1.0.0
> **Fecha:** 2025-12-27
> **Autor:** Ing. Styp Canto Rondon

---

## 1. RESUMEN EJECUTIVO

### Objetivo
Implementar un módulo completo que permita a los médicos declarar su disponibilidad mensual mediante turnos (Mañana, Tarde, Turno Completo) con validación automática de 150 horas mínimas, y a los coordinadores médicos revisar y ajustar estas disponibilidades.

### Alcance
- **Usuarios afectados:** Rol MEDICO, Rol COORDINADOR
- **Módulos:** Backend (Spring Boot), Frontend (React)
- **Base de datos:** 2 nuevas tablas con relaciones
- **Impacto:** Alta - Nueva funcionalidad crítica para planificación de turnos

---

## 2. REQUISITOS FUNCIONALES

### 2.1 Requisitos de Negocio

#### RN-01: Horas por Turno según Régimen Laboral
- **Régimen 728/CAS:** Mañana=4h, Tarde=4h, Completo=8h
- **Régimen Locador:** Mañana=6h, Tarde=6h, Completo=12h
- Se obtiene consultando: `PersonalCnt.regimenLaboral.descRegLab`

#### RN-02: Validación Mínima de Horas
- Todo médico debe completar mínimo **150 horas/mes**
- El sistema debe calcular automáticamente el total de horas según los turnos marcados
- No se permite enviar si no cumple el mínimo

#### RN-03: Estados de la Disponibilidad
```
BORRADOR → ENVIADO → REVISADO
```
- **BORRADOR:** Médico puede editar libremente
- **ENVIADO:** Médico puede editar hasta que coordinador marque REVISADO (requiere >= 150 horas)
- **REVISADO:** Solo coordinador puede ajustar turnos

#### RN-04: Unicidad de Solicitudes
- Un médico solo puede tener **una solicitud por periodo y especialidad**
- Constraint: `UNIQUE(id_pers, periodo, id_servicio)`

#### RN-05: Especialidad por Periodo
- El médico selecciona una especialidad al crear su disponibilidad
- Solo una especialidad por periodo

---

## 3. ARQUITECTURA DE SOLUCIÓN

### 3.1 Modelo de Datos

#### Tabla: `disponibilidad_medica`
```sql
CREATE TABLE disponibilidad_medica (
    id_disponibilidad BIGSERIAL PRIMARY KEY,
    id_pers BIGINT NOT NULL REFERENCES dim_personal_cnt(id_pers),
    id_servicio BIGINT NOT NULL REFERENCES dim_servicio_essi(id_servicio),
    periodo VARCHAR(6) NOT NULL, -- YYYYMM
    estado VARCHAR(20) NOT NULL DEFAULT 'BORRADOR',
    total_horas DECIMAL(5,2) DEFAULT 0,
    horas_requeridas DECIMAL(5,2) DEFAULT 150.00,
    observaciones TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_revision TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT uq_disponibilidad UNIQUE(id_pers, periodo, id_servicio),
    CONSTRAINT ck_estado CHECK (estado IN ('BORRADOR', 'ENVIADO', 'REVISADO'))
);

CREATE INDEX idx_disponibilidad_periodo ON disponibilidad_medica(periodo);
CREATE INDEX idx_disponibilidad_estado ON disponibilidad_medica(estado);
CREATE INDEX idx_disponibilidad_pers ON disponibilidad_medica(id_pers);
```

#### Tabla: `detalle_disponibilidad`
```sql
CREATE TABLE detalle_disponibilidad (
    id_detalle BIGSERIAL PRIMARY KEY,
    id_disponibilidad BIGINT NOT NULL REFERENCES disponibilidad_medica(id_disponibilidad) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    turno VARCHAR(2) NOT NULL, -- M (Mañana), T (Tarde), MT (Completo)
    horas DECIMAL(4,2) NOT NULL,
    ajustado_por BIGINT REFERENCES dim_personal_cnt(id_pers),
    observacion_ajuste TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT ck_turno CHECK (turno IN ('M', 'T', 'MT')),
    CONSTRAINT uq_detalle_fecha UNIQUE(id_disponibilidad, fecha)
);

CREATE INDEX idx_detalle_disponibilidad ON detalle_disponibilidad(id_disponibilidad);
```

### 3.2 Diagrama Entidad-Relación

```
PersonalCnt (médico)
    ↓ (M:1)
DisponibilidadMedica ← (M:1) → DimServicioEssi (especialidad)
    ↓ (1:N)
DetalleDisponibilidad
    ↓ (M:1) [opcional]
PersonalCnt (coordinador que ajustó)
```

---

## 4. COMPONENTES BACKEND

### 4.1 Entidades JPA

#### DisponibilidadMedica.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/DisponibilidadMedica.java`

**Responsabilidades:**
- Representa la disponibilidad mensual de un médico
- Gestiona estados (BORRADOR, ENVIADO, REVISADO)
- Calcula total de horas
- Relaciones con PersonalCnt y DimServicioEssi

**Métodos clave:**
- `isBorrador()`, `isEnviado()`, `isRevisado()`
- `enviar()`: Cambia estado a ENVIADO
- `marcarRevisado()`: Cambia estado a REVISADO
- `getNombreCompleto()`, `getNombreEspecialidad()`

#### DetalleDisponibilidad.java
**Ruta:** `/backend/src/main/java/com/styp/cenate/model/DetalleDisponibilidad.java`

**Responsabilidades:**
- Representa un turno específico en una fecha
- Almacena horas calculadas según régimen
- Registra ajustes del coordinador

**Métodos clave:**
- `fueAjustado()`: Verifica si coordinador modificó el turno
- `getNombreTurno()`: Retorna "Mañana", "Tarde" o "Turno Completo"

### 4.2 DTOs (Data Transfer Objects)

#### DisponibilidadCreateRequest.java
```java
@Data @Builder
public class DisponibilidadCreateRequest {
    @NotNull @Pattern(regexp = "^\\d{6}$")
    private String periodo; // YYYYMM

    @NotNull
    private Long idEspecialidad;

    private String observaciones;

    @Valid
    private List<DetalleDisponibilidadRequest> detalles;
}
```

#### DisponibilidadResponse.java
```java
@Data @Builder
public class DisponibilidadResponse {
    private Long idDisponibilidad;
    private String periodo;
    private String estado;
    private BigDecimal totalHoras;
    private BigDecimal horasRequeridas;

    // Médico
    private Long idPers;
    private String nombreCompleto;
    private String numDocumento;

    // Especialidad
    private Long idEspecialidad;
    private String nombreEspecialidad;

    // Régimen laboral
    private String regimenLaboral;
    private BigDecimal horasPorTurnoManana;
    private BigDecimal horasPorTurnoTarde;
    private BigDecimal horasPorTurnoCompleto;

    // Detalles
    private List<DetalleDisponibilidadResponse> detalles;

    // Indicadores
    private Integer totalDiasDisponibles;
    private Boolean cumpleMinimo;
    private BigDecimal porcentajeCumplimiento;
}
```

### 4.3 Repositories

#### DisponibilidadMedicaRepository.java
**Métodos principales:**
```java
// Búsqueda por médico
List<DisponibilidadMedica> findByPersonalIdPersOrderByPeriodoDesc(Long idPers);

// Búsqueda específica
Optional<DisponibilidadMedica> findByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
    Long idPers, String periodo, Long idServicio);

// Existencia
boolean existsByPersonalIdPersAndPeriodoAndEspecialidadIdServicio(
    Long idPers, String periodo, Long idServicio);

// Query optimizada con JOIN FETCH
@Query("SELECT d FROM DisponibilidadMedica d " +
       "JOIN FETCH d.personal p " +
       "JOIN FETCH d.especialidad e " +
       "LEFT JOIN FETCH p.regimenLaboral " +
       "WHERE d.idDisponibilidad = :id")
Optional<DisponibilidadMedica> findByIdWithDetails(@Param("id") Long id);

// Solicitudes enviadas por periodo
@Query("SELECT d FROM DisponibilidadMedica d " +
       "JOIN FETCH d.personal p " +
       "JOIN FETCH d.especialidad e " +
       "WHERE d.periodo = :periodo AND d.estado = 'ENVIADO' " +
       "ORDER BY d.fechaEnvio ASC")
List<DisponibilidadMedica> findEnviadasByPeriodo(@Param("periodo") String periodo);
```

#### DetalleDisponibilidadRepository.java
**Métodos principales:**
```java
void deleteByDisponibilidadIdDisponibilidad(Long idDisponibilidad);

List<DetalleDisponibilidad> findByDisponibilidadIdDisponibilidadOrderByFechaAsc(Long idDisponibilidad);

@Query("SELECT COALESCE(SUM(d.horas), 0) FROM DetalleDisponibilidad d " +
       "WHERE d.disponibilidad.idDisponibilidad = :idDisponibilidad")
BigDecimal sumHorasByDisponibilidad(@Param("idDisponibilidad") Long idDisponibilidad);
```

### 4.4 Services

#### IDisponibilidadService.java
**Métodos para MÉDICO:**
- `crear(DisponibilidadCreateRequest)` - Crear nueva disponibilidad
- `actualizar(Long id, DisponibilidadUpdateRequest)` - Actualizar borrador
- `guardarBorrador(DisponibilidadCreateRequest)` - Guardar/actualizar borrador
- `enviar(Long id)` - Enviar disponibilidad (valida >= 150 horas)
- `listarMisDisponibilidades()` - Listar todas del médico autenticado
- `obtenerMiDisponibilidad(String periodo, Long idEspecialidad)` - Obtener específica
- `validarHoras(Long id)` - Validar cumplimiento de horas
- `eliminar(Long id)` - Eliminar borrador

**Métodos para COORDINADOR:**
- `listarPorPeriodo(String periodo)` - Todas del periodo
- `listarEnviadasPorPeriodo(String periodo)` - Solo ENVIADAS
- `marcarRevisado(Long id)` - Cambiar estado a REVISADO
- `ajustarTurno(Long idDisponibilidad, AjusteTurnoRequest)` - Ajustar turno individual

#### DisponibilidadServiceImpl.java
**Método CRÍTICO - Cálculo de horas:**
```java
private BigDecimal calcularHorasPorTurno(PersonalCnt personal, String turno) {
    RegimenLaboral regimen = personal.getRegimenLaboral();
    if (regimen == null) {
        throw new RuntimeException("El médico no tiene régimen laboral asignado");
    }

    String descRegimen = regimen.getDescRegLab().toUpperCase();

    // Régimen 728 o CAS: M=4h, T=4h, MT=8h
    if (descRegimen.contains("728") || descRegimen.contains("CAS")) {
        return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
    }

    // Régimen Locador: M=6h, T=6h, MT=12h
    if (descRegimen.contains("LOCADOR")) {
        return "MT".equals(turno) ? new BigDecimal("12.00") : new BigDecimal("6.00");
    }

    // Default: 728
    log.warn("Régimen desconocido: {}, usando valores por defecto", descRegimen);
    return "MT".equals(turno) ? new BigDecimal("8.00") : new BigDecimal("4.00");
}
```

**Auditoría:**
```java
private void auditar(String action, String detalle, String nivel, String estado) {
    try {
        String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
        auditLogService.registrarEvento(usuario, action, "DISPONIBILIDAD", detalle, nivel, estado);
    } catch (Exception e) {
        log.warn("No se pudo registrar auditoría: {}", e.getMessage());
    }
}
```

**Acciones auditadas:**
- `CREATE_DISPONIBILIDAD` - Médico crea nueva disponibilidad
- `UPDATE_DISPONIBILIDAD` - Médico actualiza borrador
- `SUBMIT_DISPONIBILIDAD` - Médico envía disponibilidad
- `DELETE_DISPONIBILIDAD` - Médico elimina borrador
- `REVIEW_DISPONIBILIDAD` - Coordinador marca como revisado
- `ADJUST_DISPONIBILIDAD` - Coordinador ajusta turno

### 4.5 Controller

#### DisponibilidadController.java
**Ruta:** `/api/disponibilidad`

**Endpoints MÉDICO:**
```java
GET    /api/disponibilidad/mis-disponibilidades
GET    /api/disponibilidad/mi-disponibilidad?periodo={periodo}&idEspecialidad={id}
POST   /api/disponibilidad
POST   /api/disponibilidad/borrador
PUT    /api/disponibilidad/{id}
PUT    /api/disponibilidad/{id}/enviar
GET    /api/disponibilidad/{id}/validar-horas
DELETE /api/disponibilidad/{id}
```
**Protección:** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'MEDICO')")`

**Endpoints COORDINADOR:**
```java
GET    /api/disponibilidad/periodo/{periodo}
GET    /api/disponibilidad/periodo/{periodo}/enviadas
GET    /api/disponibilidad/{id}
PUT    /api/disponibilidad/{id}/revisar
PUT    /api/disponibilidad/{id}/ajustar-turno
```
**Protección:** `@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN', 'COORDINADOR')")`

---

## 5. COMPONENTES FRONTEND

### 5.1 Panel Médico

#### CalendarioDisponibilidad.jsx
**Ruta:** `/frontend/src/pages/roles/medico/CalendarioDisponibilidad.jsx`

**Funcionalidades:**
1. **Selector de periodo** (mes/año)
2. **Selector de especialidad** (dropdown con especialidades del médico)
3. **Calendario mensual interactivo:**
   - Grid de 7 columnas (Lu-Do) × 5-6 filas
   - Cada día muestra:
     - Número del día
     - Turno seleccionado (M, T, MT)
     - Color según turno:
       - M (Mañana): Verde claro `#D1FAE5`
       - T (Tarde): Azul claro `#DBEAFE`
       - MT (Completo): Morado `#E9D5FF`
       - Vacío: Blanco
4. **Interacción por clic:**
   - Clic 1: M (Mañana)
   - Clic 2: T (Tarde)
   - Clic 3: MT (Completo)
   - Clic 4: Vacío (borrar)
5. **Contador de horas en tiempo real:**
   - Total horas acumuladas
   - Horas requeridas (150)
   - Porcentaje de cumplimiento
6. **Barra de progreso visual:**
   - Verde si cumple >= 150 horas
   - Amarillo si está entre 100-149 horas
   - Rojo si < 100 horas
7. **Botones de acción:**
   - "Guardar Borrador" (siempre disponible)
   - "Enviar" (solo si totalHoras >= 150)
8. **Estados visuales:**
   - BORRADOR: Editable
   - ENVIADO: Editable con advertencia
   - REVISADO: Solo lectura

**Estados React:**
```javascript
const [periodo, setPeriodo] = useState('202601'); // YYYYMM
const [especialidad, setEspecialidad] = useState('');
const [especialidades, setEspecialidades] = useState([]);
const [turnos, setTurnos] = useState({}); // { '2026-01-15': 'M', '2026-01-16': 'T' }
const [totalHoras, setTotalHoras] = useState(0);
const [horasRequeridas] = useState(150);
const [regimenLaboral, setRegimenLaboral] = useState(null);
const [disponibilidad, setDisponibilidad] = useState(null);
const [loading, setLoading] = useState(false);
```

### 5.2 Panel Coordinador

#### RevisionDisponibilidad.jsx
**Ruta:** `/frontend/src/pages/roles/coordinador/RevisionDisponibilidad.jsx`

**Funcionalidades:**
1. **Selector de periodo**
2. **Filtros:**
   - Por especialidad
   - Búsqueda por nombre de médico
   - Estado (ENVIADO)
3. **Tabla de solicitudes:**
   - Columnas:
     - Médico (nombre + documento)
     - Especialidad
     - Total Horas
     - Horas Requeridas
     - Cumple Mínimo (badge verde/rojo)
     - Fecha Envío
     - Acciones (Ver/Revisar)
4. **Modal de revisión:**
   - Calendario del médico (vista resumida)
   - Lista de detalles por día (fecha, turno, horas)
   - Opciones por detalle:
     - Cambiar turno (M → T → MT → eliminar)
     - Agregar observación al ajuste
   - Indicadores:
     - Total horas actuales
     - Horas después de ajustes
   - Botón "Marcar como Revisado" (confirmación)
5. **Funciones:**
   - Ver disponibilidad completa
   - Ajustar turnos individuales
   - Agregar observaciones
   - Marcar como REVISADO

**Estados React:**
```javascript
const [periodo, setPeriodo] = useState('202601');
const [solicitudes, setSolicitudes] = useState([]);
const [selectedSolicitud, setSelectedSolicitud] = useState(null);
const [showModal, setShowModal] = useState(false);
const [filtroEspecialidad, setFiltroEspecialidad] = useState('');
const [busqueda, setBusqueda] = useState('');
```

### 5.3 Servicio API

#### disponibilidadService.js
**Ruta:** `/frontend/src/services/disponibilidadService.js`

```javascript
import api from './apiClient';

export const disponibilidadService = {
  // MÉDICO
  listarMisDisponibilidades: () =>
    api.get('/disponibilidad/mis-disponibilidades'),

  obtenerMiDisponibilidad: (periodo, idEspecialidad) =>
    api.get(`/disponibilidad/mi-disponibilidad?periodo=${periodo}&idEspecialidad=${idEspecialidad}`),

  crear: (request) => api.post('/disponibilidad', request),

  guardarBorrador: (request) => api.post('/disponibilidad/borrador', request),

  actualizar: (id, request) => api.put(`/disponibilidad/${id}`, request),

  enviar: (id) => api.put(`/disponibilidad/${id}/enviar`),

  validarHoras: (id) => api.get(`/disponibilidad/${id}/validar-horas`),

  eliminar: (id) => api.delete(`/disponibilidad/${id}`),

  // COORDINADOR
  listarPorPeriodo: (periodo) => api.get(`/disponibilidad/periodo/${periodo}`),

  listarEnviadas: (periodo) => api.get(`/disponibilidad/periodo/${periodo}/enviadas`),

  obtenerPorId: (id) => api.get(`/disponibilidad/${id}`),

  marcarRevisado: (id) => api.put(`/disponibilidad/${id}/revisar`),

  ajustarTurno: (id, request) => api.put(`/disponibilidad/${id}/ajustar-turno`, request),
};
```

---

## 6. PLAN DE IMPLEMENTACIÓN

### Fase 1: Backend Base (Días 1-2)
**Objetivo:** Crear estructura de base de datos y entidades JPA

1. ✅ Crear script SQL `/spec/scripts/005_disponibilidad_medica.sql`
2. ✅ Ejecutar script en PostgreSQL
3. ✅ Crear `DisponibilidadMedica.java`
4. ✅ Crear `DetalleDisponibilidad.java`
5. ✅ Crear 6 DTOs
6. ✅ Crear `DisponibilidadMedicaRepository.java`
7. ✅ Crear `DetalleDisponibilidadRepository.java`

**Verificación:**
- Tablas creadas en BD
- Entidades compilan sin errores
- Repositories detectados por Spring

### Fase 2: Backend Lógica (Días 3-4)
**Objetivo:** Implementar lógica de negocio completa

8. ✅ Crear `IDisponibilidadService.java`
9. ✅ Implementar `DisponibilidadServiceImpl.java`
   - **CRÍTICO:** Método `calcularHorasPorTurno()`
   - Validaciones de estado
   - Auditoría completa
10. ✅ Crear `DisponibilidadController.java`
11. ✅ Probar endpoints con Postman/cURL

**Verificación:**
- Todos los endpoints responden correctamente
- Validación de 150 horas funciona
- Auditoría registra correctamente
- Estados cambian correctamente

### Fase 3: Frontend Médico (Días 5-6)
**Objetivo:** Interfaz de calendario para médicos

12. ✅ Crear `disponibilidadService.js`
13. ✅ Crear `CalendarioDisponibilidad.jsx`
    - Calendario interactivo
    - Cálculo de horas en tiempo real
    - Validación visual de 150 horas
14. ✅ Integrar con backend
15. ✅ Agregar ruta en `App.js`
16. ✅ Agregar card en `DashboardMedico.jsx`

**Verificación:**
- Calendario se renderiza correctamente
- Turnos se marcan/desmarcan
- Horas calculan en tiempo real
- Envío funciona correctamente

### Fase 4: Frontend Coordinador (Días 7-8)
**Objetivo:** Panel de revisión para coordinadores

17. ✅ Crear `RevisionDisponibilidad.jsx`
    - Lista de solicitudes
    - Modal de revisión
    - Ajuste de turnos
18. ✅ Integrar con backend
19. ✅ Agregar ruta en `App.js`
20. ✅ Agregar opción en `DashboardCoordinador.jsx`

**Verificación:**
- Lista carga correctamente
- Modal muestra disponibilidad
- Ajustes se guardan
- Marcar como REVISADO funciona

### Fase 5: Pruebas y Ajustes (Día 9)
**Objetivo:** Validar funcionamiento completo

21. ✅ Pruebas end-to-end completas
22. ✅ Validación de cálculo de horas según régimen
23. ✅ Validación de permisos y estados
24. ✅ Ajustes de UI/UX

**Escenarios de prueba:**
- Médico 728 crea disponibilidad (4h/turno)
- Médico Locador crea disponibilidad (6h/turno)
- Intentar enviar sin 150 horas (debe fallar)
- Coordinador revisa y ajusta
- Médico no puede editar después de REVISADO

### Fase 6: Documentación (Día 10)
**Objetivo:** Actualizar documentación del sistema

25. ✅ Actualizar `CLAUDE.md`
26. ✅ Actualizar `003_api_endpoints.md`
27. ✅ Crear manual de usuario (opcional)

---

## 7. VALIDACIONES CRÍTICAS

### 7.1 Backend
- ✅ `totalHoras >= 150` antes de permitir cambiar a ENVIADO
- ✅ Médico solo puede editar estados BORRADOR o ENVIADO
- ✅ REVISADO no es editable por médico
- ✅ Coordinador puede ajustar cualquier estado
- ✅ Una solicitud por (médico, periodo, especialidad)
- ✅ Validar que `PersonalCnt` tenga `RegimenLaboral` asignado
- ✅ Auditar todas las operaciones críticas

### 7.2 Frontend
- ✅ Calcular horas en tiempo real según régimen
- ✅ Deshabilitar "Enviar" si no cumple 150 horas
- ✅ Alertas visuales (barra de progreso, colores)
- ✅ Confirmación antes de marcar como REVISADO
- ✅ Mostrar indicador de estado (BORRADOR/ENVIADO/REVISADO)
- ✅ Bloquear edición en estado REVISADO

---

## 8. CONSIDERACIONES TÉCNICAS

### 8.1 Performance
- Usar `JOIN FETCH` en queries para evitar N+1
- Cargar `regimenLaboral` con el `PersonalCnt`
- Usar `cascade = CascadeType.ALL` para eliminar detalles automáticamente
- Índices en: `periodo`, `estado`, `id_pers`

### 8.2 Seguridad
- Validar que médico solo edite sus propias disponibilidades
- Validar que coordinador tenga permisos adecuados
- Proteger endpoints con `@PreAuthorize`
- Validar inputs con `@Valid` y `@NotNull`

### 8.3 Auditoría
- Registrar todas las operaciones: CREATE, UPDATE, SUBMIT, DELETE, REVIEW, ADJUST
- Incluir detalles: usuario, acción, médico afectado, periodo, horas

---

## 9. INTEGRACIÓN CON SISTEMA EXISTENTE

### 9.1 Menú de Navegación

**DashboardMedico.jsx** - Agregar card:
```javascript
{
  titulo: "Mi Disponibilidad",
  descripcion: "Gestiona tus turnos mensuales",
  link: "/medico/disponibilidad",
  icono: "Calendar",
  color: "#10B981",
  activo: true
}
```

**DashboardCoordinador.jsx** - Agregar opción:
```javascript
{
  titulo: "Revisión de Disponibilidad",
  descripcion: "Revisar y ajustar turnos de médicos",
  link: "/coordinador/revision-disponibilidad",
  icono: "ClipboardCheck"
}
```

### 9.2 Rutas (App.js)

```javascript
// Ruta médico
<Route path="/medico/disponibilidad" element={
  <ProtectedRoute requiredPath="/medico/disponibilidad" requiredAction="ver">
    <CalendarioDisponibilidad />
  </ProtectedRoute>
} />

// Ruta coordinador
<Route path="/coordinador/revision-disponibilidad" element={
  <ProtectedRoute requiredPath="/coordinador/revision" requiredAction="ver">
    <RevisionDisponibilidad />
  </ProtectedRoute>
} />
```

---

## 10. ARCHIVOS A CREAR/MODIFICAR

### Backend (14 archivos nuevos)
```
✅ /spec/scripts/005_disponibilidad_medica.sql
✅ /backend/src/main/java/com/styp/cenate/model/DisponibilidadMedica.java
✅ /backend/src/main/java/com/styp/cenate/model/DetalleDisponibilidad.java
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadCreateRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadUpdateRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DisponibilidadResponse.java
✅ /backend/src/main/java/com/styp/cenate/dto/DetalleDisponibilidadRequest.java
✅ /backend/src/main/java/com/styp/cenate/dto/DetalleDisponibilidadResponse.java
✅ /backend/src/main/java/com/styp/cenate/dto/AjusteTurnoRequest.java
✅ /backend/src/main/java/com/styp/cenate/repository/DisponibilidadMedicaRepository.java
✅ /backend/src/main/java/com/styp/cenate/repository/DetalleDisponibilidadRepository.java
✅ /backend/src/main/java/com/styp/cenate/service/disponibilidad/IDisponibilidadService.java
✅ /backend/src/main/java/com/styp/cenate/service/disponibilidad/impl/DisponibilidadServiceImpl.java
✅ /backend/src/main/java/com/styp/cenate/api/disponibilidad/DisponibilidadController.java
```

### Frontend (3 archivos nuevos)
```
✅ /frontend/src/services/disponibilidadService.js
✅ /frontend/src/pages/roles/medico/CalendarioDisponibilidad.jsx
✅ /frontend/src/pages/roles/coordinador/RevisionDisponibilidad.jsx
```

### Modificaciones (2 archivos)
```
✅ /frontend/src/App.js
✅ /frontend/src/pages/roles/medico/DashboardMedico.jsx
```

---

## 11. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Médicos no tienen `RegimenLaboral` asignado | Media | Alto | Validar en service y mostrar error claro |
| Cálculo incorrecto de horas | Baja | Crítico | Tests unitarios exhaustivos + validación manual |
| Conflictos de concurrencia (2 coordinadores ajustan a la vez) | Baja | Medio | Usar `@Version` en entidad para optimistic locking |
| Performance en queries con muchos detalles | Media | Medio | JOIN FETCH + paginación si es necesario |

---

## 12. CRITERIOS DE ACEPTACIÓN

### CA-01: Médico puede crear disponibilidad
- ✅ Selecciona periodo y especialidad
- ✅ Marca turnos en calendario
- ✅ Horas se calculan automáticamente
- ✅ Puede guardar borrador en cualquier momento
- ✅ Solo puede enviar si totalHoras >= 150

### CA-02: Cálculo correcto de horas
- ✅ Médico régimen 728: M=4h, T=4h, MT=8h
- ✅ Médico régimen Locador: M=6h, T=6h, MT=12h
- ✅ Total se actualiza en tiempo real

### CA-03: Coordinador puede revisar
- ✅ Ve lista de solicitudes ENVIADAS
- ✅ Puede abrir modal de revisión
- ✅ Puede ajustar turnos individuales
- ✅ Ajustes quedan registrados con su usuario
- ✅ Puede marcar como REVISADO

### CA-04: Estados funcionan correctamente
- ✅ BORRADOR: Médico edita libremente
- ✅ ENVIADO: Médico puede editar, coordinador puede revisar
- ✅ REVISADO: Solo coordinador puede ajustar

### CA-05: Validaciones funcionan
- ✅ No permite enviar sin 150 horas
- ✅ No permite duplicados (mismo médico, periodo, especialidad)
- ✅ Valida permisos en endpoints

### CA-06: Auditoría completa
- ✅ Todas las operaciones se registran en `audit_logs`
- ✅ Incluye: usuario, acción, módulo, detalle, nivel, estado

---

## 13. CHANGELOG

| Versión | Fecha | Cambios |
|---------|-------|---------|
| 1.0.0 | 2025-12-27 | Especificación inicial completa |

---

**Ing. Styp Canto Rondon**
EsSalud Perú - CENATE
2025-12-27
