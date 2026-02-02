# 🏗️ ARQUITECTURA DE BOLSAS v1.42.0

> **Modelo de Dos Niveles: Universo General + Mini-Bolsas Especializadas**
> **Versión:** v1.42.0 | **Estado:** En Desarrollo | **Fecha:** 2026-02-01

---

## 📋 TABLA DE CONTENIDOS

1. [Visión General](#visión-general)
2. [Modelo Arquitectónico](#modelo-arquitectónico)
3. [Implementación Universo General](#implementación-universo-general)
4. [Implementación Mini-Bolsas](#implementación-mini-bolsas)
5. [Estructura de Carpetas](#estructura-de-carpetas)
6. [Guía de Implementación](#guía-de-implementación)
7. [Ejemplos Prácticos](#ejemplos-prácticos)
8. [Escalabilidad Futura](#escalabilidad-futura)

---

## VISIÓN GENERAL

### El Problema
Antes: Una tabla monolítica `/bolsas/solicitudes` que mostraba:
- ❌ 7,973 registros sin discriminación
- ❌ Campos genéricos para TODAS las bolsas
- ❌ Permisos únicos (todos ven todo)
- ❌ Imposible agregar campos específicos por tipo de bolsa

### La Solución: Arquitectura de 2 Niveles

```
NIVEL 1: UNIVERSO GENERAL
├─ Ruta: /bolsas/solicitudes
├─ Función: Consolidar TODOS los registros
├─ Usuarios: COORDINADORES (visión completa)
├─ Registros: 7,973 (todos los tipos)
└─ Propósito: Reportes ejecutivos, auditoría, estadísticas globales

NIVEL 2: MINI-BOLSAS (N variantes)
├─ Ruta: /bolsas/modulo107/*, /dengue/*, etc.
├─ Función: Interfaz especializada POR TIPO DE BOLSA
├─ Usuarios: Roles específicos (ven SOLO su bolsa)
├─ Registros: N (solo de su tipo)
├─ Propósito: Trabajo operacional, entrada de datos, gestión específica
└─ Escalable: Fácil agregar nuevas bolsas sin modificar el universo
```

---

## MODELO ARQUITECTÓNICO

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS (ÚNICA)                    │
│           dim_solicitud_bolsa (7,973 registros)             │
│                                                             │
│  ┌─────────────────┬──────────────┬──────────────────┐    │
│  │ id_bolsa = 1    │ id_bolsa = 2  │ id_bolsa = N    │    │
│  │ (Módulo 107)    │ (Dengue)      │ (Futuro)        │    │
│  │ 6,404 registros │ X registros   │ Y registros     │    │
│  └─────────────────┴──────────────┴──────────────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓

    Backend API (3 capas)
    ├─ Controllers
    │  ├─ SolicitudBolsaController (universo)
    │  ├─ Modulo107Controller (mini-bolsa)
    │  └─ DengueController (mini-bolsa)
    │
    ├─ Services
    │  ├─ SolicitudBolsaService (universo)
    │  ├─ Modulo107Service (mini-bolsa)
    │  └─ DengueService (mini-bolsa)
    │
    └─ Repositories
       ├─ SolicitudBolsaRepository (universo + todos)
       ├─ Modulo107Repository (mini-bolsa)
       └─ DengueRepository (mini-bolsa)

        ↓

    Frontend React (2 vistas)
    ├─ /bolsas/solicitudes
    │  └─ Componentes generales (Solicitudes.jsx, etc.)
    │
    ├─ /bolsas/modulo107/pacientes-de-107
    │  └─ Componentes específicos (Modulo107Pacientes.jsx)
    │
    └─ /dengue/buscar
       └─ Componentes específicos (DengueBuscar.jsx)
```

---

## IMPLEMENTACIÓN UNIVERSO GENERAL

### Endpoint Universo General
```java
// SolicitudBolsaController.java
@GetMapping("/solicitudes")
@PreAuthorize("hasRole('COORDINADOR') or hasRole('ADMIN')")
public ResponseEntity<Page<SolicitudBolsaDTO>> obtenerSolicitudes(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "25") int size,
    @RequestParam(required = false) Long idBolsa,
    @RequestParam(required = false) String macrorregion
) {
    // Retorna TODO (independiente del tipo de bolsa)
    Page<SolicitudBolsa> resultado = solicitudBolsaRepository.findAll(
        Specification.where(filterByBolsa(idBolsa)).and(filterByMacrorregion(macrorregion)),
        PageRequest.of(page, size)
    );
    return ResponseEntity.ok(mapToDTO(resultado));
}
```

### DTO Universo General (Campos Genéricos)
```java
@Data
public class SolicitudBolsaDTO {
    private Long idSolicitud;
    private String numeroSolicitud;
    private String pacienteDni;
    private String pacienteNombre;
    private String pacienteSexo;
    private String codigoAdscripcion;
    private String descIpress;
    private String descRed;
    private String estado;
    private String descEstadoCita;  // "Pendiente Citar", "Citado", etc.
    private Long responsableGestoraId;
    private LocalDateTime fechaAsignacion;
    // NO incluye campos específicos de Módulo 107 o Dengue
}
```

---

## IMPLEMENTACIÓN MINI-BOLSAS

### Patrón General (Template para Nuevas Bolsas)

Cada mini-bolsa sigue este patrón:

```
Controlador: /api/bolsas/[tipo]/*
├─ @GetMapping("") → Listado paginado
├─ @GetMapping("/buscar") → Búsqueda avanzada
├─ @GetMapping("/estadisticas") → KPIs específicos
└─ @PostMapping("") → Crear (si aplica)

Service: [Tipo]Service
├─ obtenerPacientes(page, size)
├─ buscar(filtros)
└─ obtenerEstadisticas()

DTO: [Tipo]PacienteDTO (campos ESPECÍFICOS)
└─ Solo los campos que necesita esta bolsa

Permisos MBAC:
└─ @CheckMBACPermission(pagina="/bolsas/[tipo]", accion="ver")
```

### EJEMPLO 1: Mini-Bolsa Módulo 107

#### Backend - Controller
```java
// Modulo107Controller.java
@RestController
@RequestMapping("/api/bolsas/modulo107")
public class Modulo107Controller {

    @GetMapping("/pacientes")
    @CheckMBACPermission(pagina = "/bolsas/modulo107/pacientes", accion = "ver")
    public ResponseEntity<Page<Modulo107PacienteDTO>> listarPacientes(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        Page<SolicitudBolsa> resultado = solicitudBolsaRepository
            .findAllModulo107Casos(PageRequest.of(page, size));
        return ResponseEntity.ok(mapToModulo107DTO(resultado));
    }

    @GetMapping("/pacientes/buscar")
    @CheckMBACPermission(pagina = "/bolsas/modulo107/pacientes", accion = "ver")
    public ResponseEntity<Page<Modulo107PacienteDTO>> buscar(
        @RequestParam(required = false) String dni,
        @RequestParam(required = false) String nombre,
        @RequestParam(required = false) String codigoIpress,
        @RequestParam(required = false) Long estadoId,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        Page<SolicitudBolsa> resultado = solicitudBolsaRepository
            .buscarModulo107Casos(dni, nombre, codigoIpress, estadoId,
                                   PageRequest.of(page, size));
        return ResponseEntity.ok(mapToModulo107DTO(resultado));
    }

    @GetMapping("/estadisticas")
    @CheckMBACPermission(pagina = "/bolsas/modulo107", accion = "ver")
    public ResponseEntity<Modulo107EstadisticasDTO> obtenerEstadisticas() {
        Map<String, Object> stats = solicitudBolsaRepository
            .kpisModulo107();
        return ResponseEntity.ok(new Modulo107EstadisticasDTO(stats));
    }
}
```

#### Backend - DTO (Campos Específicos del Módulo 107)
```java
@Data
public class Modulo107PacienteDTO {
    private Long idSolicitud;
    private String numeroSolicitud;
    private String pacienteDni;
    private String pacienteNombre;
    private String pacienteSexo;
    private LocalDate pacienteFechaNacimiento;
    private String pacienteTelefono;
    private String especialidad;              // ← ESPECÍFICO 107
    private String codigoAdscripcion;
    private String descIpress;
    private String tipoCita;
    private Long estadoGestionCitasId;        // ← ESPECÍFICO 107
    private String codEstadoCita;             // "ATENDIDO", "PENDIENTE", etc.
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaAsignacion;    // ← ESPECÍFICO 107
    private LocalDateTime fechaAtencion;      // ← ESPECÍFICO 107
    private Long responsableGestoraId;
    // NO incluye campos de Dengue (CIE-10, síntomas, etc.)
}

@Data
public class Modulo107EstadisticasDTO {
    private Integer totalPacientes;
    private Integer atendidos;                // ← ESPECÍFICO 107
    private Integer pendientes;
    private Integer enProceso;                // ← ESPECÍFICO 107
    private Integer cancelados;
    private Double tasaCompletacion;
    private List<EstadoDistribucionDTO> distribucionPorEstado;
    private List<EspecialidadStatsDTO> distribucionPorEspecialidad;
    // KPIs diferentes al universo general
}
```

#### Frontend - Página Módulo 107
```jsx
// pages/bolsas/Modulo107Pacientes.jsx
export default function Modulo107Pacientes() {
  const [pacientes, setPacientes] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  useEffect(() => {
    // Fetch SOLO de Módulo 107
    Promise.all([
      fetch('/api/bolsas/modulo107/pacientes'),
      fetch('/api/bolsas/modulo107/estadisticas')
    ]).then(([res1, res2]) => {
      setPacientes(res1.json());
      setEstadisticas(res2.json());
    });
  }, []);

  return (
    <div>
      <h1>👥 Pacientes del Módulo 107</h1>

      {/* KPIs ESPECÍFICOS: Atendidos, Pendientes, En Proceso, Cancelados */}
      <KpiCard label="Atendidos" value={estadisticas?.atendidos} icon="✓" />
      <KpiCard label="Pendientes" value={estadisticas?.pendientes} icon="⏳" />
      <KpiCard label="En Proceso" value={estadisticas?.enProceso} icon="🔄" />
      <KpiCard label="Cancelados" value={estadisticas?.cancelados} icon="✗" />

      {/* Tabla con CAMPOS ESPECÍFICOS */}
      <table>
        <thead>
          <tr>
            <th>Fecha Registro</th>
            <th>DNI</th>
            <th>Paciente</th>
            <th>Especialidad</th>          {/* ← ESPECÍFICO 107 */}
            <th>Estado Atención</th>       {/* ← ESPECÍFICO 107 */}
            <th>Fecha Atención</th>        {/* ← ESPECÍFICO 107 */}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map(p => (
            <tr key={p.idSolicitud}>
              <td>{p.fechaSolicitud}</td>
              <td>{p.pacienteDni}</td>
              <td>{p.pacienteNombre}</td>
              <td>{p.especialidad}</td>
              <td>{p.codEstadoCita}</td>
              <td>{p.fechaAtencion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### EJEMPLO 2: Mini-Bolsa Dengue

#### Backend - Controller (patrón similar pero específico)
```java
// DengueController.java
@RestController
@RequestMapping("/api/dengue")
public class DengueController {

    @GetMapping("/buscar")
    @CheckMBACPermission(pagina = "/dengue/buscar", accion = "ver")
    public ResponseEntity<Page<DengueCasoDTO>> buscar(
        @RequestParam(required = false) String dni,
        @RequestParam(required = false) String codioCie10,  // ← ESPECÍFICO Dengue
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "25") int size
    ) {
        // Lógica específica de Dengue
        Page<DengueCaso> resultado = dengueRepository
            .buscarPorDniYCie10(dni, codioCie10, PageRequest.of(page, size));
        return ResponseEntity.ok(mapToDengueDTO(resultado));
    }

    @GetMapping("/estadisticas")
    @CheckMBACPermission(pagina = "/dengue", accion = "ver")
    public ResponseEntity<DengueEstadisticasDTO> obtenerEstadisticas() {
        // Estadísticas DE DENGUE, no de todas las bolsas
        DengueEstadisticasDTO stats = dengueService.calcularEstadisticas();
        return ResponseEntity.ok(stats);
    }
}
```

#### Backend - DTO (Campos DIFERENTES a Módulo 107)
```java
@Data
public class DengueCasoDTO {
    private Long idCaso;
    private String pacienteDni;
    private String pacienteNombre;
    private String codigoCie10;                   // ← ESPECÍFICO Dengue
    private String codigoCie10Desc;               // ← ESPECÍFICO Dengue
    private LocalDate fechaDiagnostico;
    private String severidad;                     // "Leve", "Moderado", "Severo"
    private String estado;                        // "Activo", "Recuperado", "Fallecido"
    private LocalDateTime fechaRegistro;
    // NO incluye: especialidad, estado_atención (son de Módulo 107)
}

@Data
public class DengueEstadisticasDTO {
    private Integer casosRegistrados;
    private Integer casosPorSeveridad;           // ← ESPECÍFICO Dengue
    private List<SeveridadDistribucionDTO> distribucionSeveridad;
    private List<MunicipioDengueStatsDTO> casosPorMunicipio;
    // KPIs DIFERENTES a Módulo 107
}
```

#### Frontend - Página Dengue
```jsx
// pages/dengue/DengueBuscar.jsx
export default function DengueBuscar() {
  const [casos, setCasos] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);

  const handleBuscar = (dni, cie10) => {
    fetch(`/api/dengue/buscar?dni=${dni}&codigoCie10=${cie10}`)
      .then(res => res.json())
      .then(data => setCasos(data.content));
  };

  useEffect(() => {
    fetch('/api/dengue/estadisticas')
      .then(res => res.json())
      .then(data => setEstadisticas(data));
  }, []);

  return (
    <div>
      <h1>🦟 Búsqueda Dengue</h1>

      {/* Filtros ESPECÍFICOS Dengue: DNI + CIE-10 */}
      <input placeholder="DNI Paciente" onChange={(e) => setDni(e.target.value)} />
      <select onChange={(e) => setCie10(e.target.value)}>
        <option>Seleccionar CIE-10...</option>
        <option value="A90">A90 - Dengue</option>
        <option value="A91">A91 - Dengue Hemorrágico</option>
      </select>
      <button onClick={() => handleBuscar(dni, cie10)}>Buscar</button>

      {/* KPIs ESPECÍFICOS: Severidad */}
      <KpiCard label="Casos Registrados" value={estadisticas?.casosRegistrados} />
      <DoughnutChart data={estadisticas?.casosPorSeveridad} />

      {/* Tabla con CAMPOS ESPECÍFICOS Dengue */}
      <table>
        <thead>
          <tr>
            <th>DNI</th>
            <th>Paciente</th>
            <th>CIE-10</th>                {/* ← ESPECÍFICO Dengue */}
            <th>Severidad</th>             {/* ← ESPECÍFICO Dengue */}
            <th>Fecha Diagnóstico</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          {casos.map(c => (
            <tr key={c.idCaso}>
              <td>{c.pacienteDni}</td>
              <td>{c.pacienteNombre}</td>
              <td>{c.codigoCie10} - {c.codigoCie10Desc}</td>
              <td>{c.severidad}</td>
              <td>{c.fechaDiagnostico}</td>
              <td>{c.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## ESTRUCTURA DE CARPETAS

```
backend/
├─ api/
│  ├─ SolicitudBolsaController.java          (Universo General)
│  ├─ Modulo107Controller.java               (Mini-Bolsa)
│  ├─ DengueController.java                  (Mini-Bolsa)
│  └─ [TipoController].java                  (Futuras)
│
├─ service/
│  ├─ SolicitudBolsaServiceImpl.java          (Universo General)
│  ├─ Modulo107ServiceImpl.java               (Mini-Bolsa)
│  ├─ DengueServiceImpl.java                  (Mini-Bolsa)
│  └─ [Tipo]ServiceImpl.java                  (Futuras)
│
├─ repository/
│  ├─ SolicitudBolsaRepository.java          (Universo General + todos)
│  ├─ Modulo107Repository.java               (Mini-Bolsa, si necesita custom)
│  ├─ DengueRepository.java                  (Mini-Bolsa, si necesita custom)
│  └─ [Tipo]Repository.java                  (Futuras)
│
├─ dto/
│  ├─ SolicitudBolsaDTO.java                 (Universo General)
│  ├─ bolsas/modulo107/
│  │  ├─ Modulo107PacienteDTO.java           (Mini-Bolsa)
│  │  └─ Modulo107EstadisticasDTO.java       (Mini-Bolsa)
│  ├─ dengue/
│  │  ├─ DengueCasoDTO.java                  (Mini-Bolsa)
│  │  └─ DengueEstadisticasDTO.java          (Mini-Bolsa)
│  └─ [tipo]/                                (Futuras)
│
└─ entity/
   ├─ SolicitudBolsa.java                    (Tabla única)
   └─ [Si aplica, entidades específicas]

frontend/
├─ pages/
│  ├─ bolsas/
│  │  ├─ Solicitudes.jsx                     (Universo General)
│  │  └─ modulo107/
│  │     └─ Modulo107Pacientes.jsx           (Mini-Bolsa)
│  └─ dengue/
│     └─ DengueBuscar.jsx                    (Mini-Bolsa)
│
└─ components/
   ├─ bolsas/
   │  ├─ ListHeader.jsx                      (Universo General)
   │  └─ Modulo107Header.jsx                 (Mini-Bolsa)
   └─ dengue/
      └─ DengueFilters.jsx                   (Mini-Bolsa)
```

---

## GUÍA DE IMPLEMENTACIÓN

### Crear una Nueva Mini-Bolsa

Para agregar una nueva mini-bolsa (ej: PADOMI), sigue estos pasos:

#### 1. Backend - Entity & Repository
```java
// repository/SolicitudBolsaRepository.java (si necesita custom queries)
@Query("SELECT s FROM SolicitudBolsa s WHERE s.idBolsa = 3 AND s.activo = true")
Page<SolicitudBolsa> findAllPADOMICasos(Pageable pageable);

@Query("SELECT s FROM SolicitudBolsa s WHERE s.idBolsa = 3 " +
       "AND s.activo = true " +
       "AND (s.pacienteDni LIKE :dni OR s.pacienteNombre LIKE :nombre)")
Page<SolicitudBolsa> buscarPADOMICasos(@Param("dni") String dni,
                                       @Param("nombre") String nombre,
                                       Pageable pageable);
```

#### 2. Backend - DTO (Define campos ESPECÍFICOS)
```java
// dto/padomi/PADOMIPacienteDTO.java
@Data
public class PADOMIPacienteDTO {
    private Long idSolicitud;
    private String pacienteDni;
    private String pacienteNombre;
    private String direccionDomicilio;           // ← ESPECÍFICO PADOMI
    private String referenciaGeografica;         // ← ESPECÍFICO PADOMI
    private LocalDateTime fechaVisitaProgramada; // ← ESPECÍFICO PADOMI
    // ... otros campos PADOMI
}
```

#### 3. Backend - Service & Controller
```java
// api/PADOMIController.java
@RestController
@RequestMapping("/api/padomi")
public class PADOMIController {
    @GetMapping("/pacientes")
    @CheckMBACPermission(pagina = "/padomi/pacientes", accion = "ver")
    public ResponseEntity<Page<PADOMIPacienteDTO>> listarPacientes(...) {
        // Implementación específica
    }
}
```

#### 4. Frontend - Página Mini-Bolsa
```jsx
// pages/padomi/PADOMIPacientes.jsx
export default function PADOMIPacientes() {
  // Fetch SOLO de /api/padomi/*
  // Mostrar KPIs ESPECÍFICOS de PADOMI
  // Tabla con CAMPOS ESPECÍFICOS de PADOMI
}
```

#### 5. Actualizar Menú Lateral
```jsx
// Agregar en menu:
<Link to="/padomi/pacientes">
  <Icon name="Home" /> PADOMI
</Link>
```

---

## EJEMPLOS PRÁCTICOS

### Búsqueda Universo General
```bash
GET /api/bolsas/solicitudes?idBolsa=1&macrorregion=LIMA_ORIENTE&page=0&size=25
Response: Page<SolicitudBolsaDTO> (7,973 potenciales, filtrados)
```

### Búsqueda Mini-Bolsa Módulo 107
```bash
GET /api/bolsas/modulo107/pacientes/buscar?dni=08502338&page=0&size=25
Response: Page<Modulo107PacienteDTO> (SOLO 107, con campos específicos)
```

### Búsqueda Mini-Bolsa Dengue
```bash
GET /api/dengue/buscar?dni=08502338&codigoCie10=A90
Response: Page<DengueCasoDTO> (SOLO Dengue, con CIE-10)
```

---

## ESCALABILIDAD FUTURA

### Nuevas Bolsas Previstas

| Bolsa | Ruta | Campos Específicos | KPIs Específicos |
|-------|------|-------------------|-----------------|
| PADOMI | `/api/padomi/*` | Dirección, Ref. Geográfica | Visitas completadas |
| Referencia INTER | `/api/referencias/*` | Centro derivador, derivado | Derivaciones activas |
| Consulta Externa | `/api/consultaexterna/*` | Especialista, Consultorio | Citas por especialidad |
| [FUTURA] | `/api/[tipo]/*` | [A definir] | [A definir] |

### Checklist para Nueva Bolsa

- [ ] Entity: Confirmado que usa `dim_solicitud_bolsa` con `id_bolsa` único
- [ ] Repository: Query personalizada `findAll[Tipo]` y `buscar[Tipo]`
- [ ] DTO: Crear `[Tipo]PacienteDTO` y `[Tipo]EstadisticasDTO`
- [ ] Service: Crear `[Tipo]ServiceImpl.java`
- [ ] Controller: Crear `[Tipo]Controller.java` con `@CheckMBACPermission`
- [ ] Frontend: Crear `/pages/[tipo]/` con componentes
- [ ] Permisos: Agregar en BD tabla `permisos_mbac` para nueva bolsa
- [ ] Menu: Actualizar sidebar con link a mini-bolsa
- [ ] Tests: Unit tests para nuevos endpoints
- [ ] Documentación: Actualizar este archivo

---

## CONCLUSIÓN

Esta arquitectura permite:
✅ Universo único para auditoría y reportes ejecutivos
✅ Interfaces especializadas por rol y tipo de bolsa
✅ Escalabilidad sin modificar código existente
✅ Permisos granulares por bolsa
✅ Campos y KPIs optimizados por caso de uso

**Versión:** v1.42.0
**Autor:** Sistema CENATE
**Última actualización:** 2026-02-01
