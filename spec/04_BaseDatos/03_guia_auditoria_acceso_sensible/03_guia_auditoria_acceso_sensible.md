# Guía de Auditoría de Acceso a Datos Sensibles - CENATE

> Sistema automático de auditoría para acceso a información confidencial

**Versión:** 1.0.0
**Fecha:** 2025-12-29
**Responsable:** Ing. Styp Canto Rondón

---

## Índice

1. [Introducción](#introducción)
2. [Componentes del Sistema](#componentes-del-sistema)
3. [Cómo Usar la Anotación](#cómo-usar-la-anotación)
4. [Ejemplos de Implementación](#ejemplos-de-implementación)
5. [Acciones Sensibles Estandarizadas](#acciones-sensibles-estandarizadas)

---

## Introducción

El sistema de auditoría de acceso a datos sensibles utiliza **Aspect-Oriented Programming (AOP)** para registrar automáticamente todas las operaciones que involucran información confidencial de pacientes, historias clínicas y datos personales.

### Características

✅ **Automático** - Solo agrega la anotación `@AuditarAccesoSensible` al método
✅ **No invasivo** - No requiere cambios en la lógica del método
✅ **Captura de errores** - Registra tanto éxitos como fallos
✅ **Extracción automática de IDs** - Captura el ID del registro accedido
✅ **Contexto completo** - Incluye usuario, IP, user-agent, timestamp

---

## Componentes del Sistema

### 1. Anotación `@AuditarAccesoSensible`

**Ubicación:** `backend/src/main/java/com/styp/cenate/security/annotation/AuditarAccesoSensible.java`

```java
@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DETAILS",           // Código de acción
    descripcion = "Acceso a datos de paciente", // Descripción legible
    modulo = "PACIENTES",                       // Módulo del sistema
    nivel = "INFO",                             // INFO, WARNING, ERROR, CRITICAL
    incluirIdAfectado = true                    // ¿Capturar ID del registro?
)
```

### 2. Aspecto AOP `AuditoriaAccesoSensibleAspect`

**Ubicación:** `backend/src/main/java/com/styp/cenate/security/aspect/AuditoriaAccesoSensibleAspect.java`

Intercepta automáticamente todos los métodos anotados y:
1. Captura el usuario autenticado del `SecurityContext`
2. Extrae el ID del registro (primer parámetro Long/Integer/String)
3. Ejecuta el método original
4. Registra el evento en `audit_logs` con contexto completo (IP, user-agent)
5. Si hay error, registra como `FAILURE` con detalle del error

---

## Cómo Usar la Anotación

### Paso 1: Agregar la anotación al método del Controller

```java
@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
public class PacienteController {

    private final PacienteService pacienteService;

    /**
     * Obtener datos de un paciente por ID
     * 🔒 AUDITADO AUTOMÁTICAMENTE
     */
    @GetMapping("/{id}")
    @CheckMBACPermission(pagina = "/pacientes", accion = "ver")
    @AuditarAccesoSensible(
        accion = "VIEW_PATIENT_DETAILS",
        descripcion = "Acceso a datos completos de paciente",
        modulo = "PACIENTES",
        nivel = "INFO"
    )
    public ResponseEntity<PacienteDTO> obtenerPaciente(@PathVariable Long id) {
        PacienteDTO paciente = pacienteService.obtenerPorId(id);
        return ResponseEntity.ok(paciente);
    }

    /**
     * Buscar pacientes
     * 🔒 AUDITADO AUTOMÁTICAMENTE
     */
    @PostMapping("/buscar")
    @CheckMBACPermission(pagina = "/pacientes", accion = "ver")
    @AuditarAccesoSensible(
        accion = "SEARCH_PATIENTS",
        descripcion = "Búsqueda de pacientes en el sistema",
        modulo = "PACIENTES",
        nivel = "INFO",
        incluirIdAfectado = false // No hay ID específico en una búsqueda
    )
    public ResponseEntity<List<PacienteDTO>> buscarPacientes(
        @RequestBody BusquedaPacienteDTO busqueda
    ) {
        List<PacienteDTO> resultados = pacienteService.buscar(busqueda);
        return ResponseEntity.ok(resultados);
    }

    /**
     * Exportar datos de paciente
     * 🔒 AUDITADO AUTOMÁTICAMENTE (nivel WARNING por exportación)
     */
    @GetMapping("/{id}/export")
    @CheckMBACPermission(pagina = "/pacientes", accion = "exportar")
    @AuditarAccesoSensible(
        accion = "EXPORT_PATIENT_DATA",
        descripcion = "Exportación de datos de paciente a PDF",
        modulo = "PACIENTES",
        nivel = "WARNING" // Exportaciones son más sensibles
    )
    public ResponseEntity<byte[]> exportarPaciente(@PathVariable Long id) {
        byte[] pdf = pacienteService.exportarPDF(id);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=paciente.pdf")
            .body(pdf);
    }
}
```

### Paso 2: ¡Eso es todo!

No necesitas hacer nada más. El aspecto AOP:
- ✅ Captura el usuario del `SecurityContext`
- ✅ Extrae el `id` del primer parámetro
- ✅ Captura IP y User-Agent automáticamente
- ✅ Registra en `audit_logs`
- ✅ Maneja errores automáticamente

---

## Ejemplos de Implementación

### Ejemplo 1: Historias Clínicas

```java
@RestController
@RequestMapping("/api/historias-clinicas")
public class HistoriaClinicaController {

    @GetMapping("/{id}")
    @AuditarAccesoSensible(
        accion = "VIEW_CLINICAL_HISTORY",
        descripcion = "Visualización de historia clínica completa",
        modulo = "HISTORIA_CLINICA",
        nivel = "WARNING" // Datos muy sensibles
    )
    public ResponseEntity<HistoriaClinicaDTO> obtenerHistoria(@PathVariable Long id) {
        return ResponseEntity.ok(historiaService.obtenerPorId(id));
    }

    @PostMapping("/{id}/agregar-nota")
    @AuditarAccesoSensible(
        accion = "UPDATE_CLINICAL_HISTORY",
        descripcion = "Agregada nota médica a historia clínica",
        modulo = "HISTORIA_CLINICA",
        nivel = "INFO"
    )
    public ResponseEntity<Void> agregarNota(
        @PathVariable Long id,
        @RequestBody NotaMedicaDTO nota
    ) {
        historiaService.agregarNota(id, nota);
        return ResponseEntity.ok().build();
    }
}
```

### Ejemplo 2: Reportes y Exportaciones

```java
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @PostMapping("/auditoria/export")
    @AuditarAccesoSensible(
        accion = "EXPORT_CSV",
        descripcion = "Exportación de reporte de auditoría a CSV",
        modulo = "REPORTES",
        nivel = "WARNING",
        incluirIdAfectado = false
    )
    public ResponseEntity<byte[]> exportarAuditoria(
        @RequestBody FiltrosReporteDTO filtros
    ) {
        byte[] csv = reporteService.generarCSV(filtros);
        return ResponseEntity.ok()
            .header("Content-Disposition", "attachment; filename=auditoria.csv")
            .body(csv);
    }

    @GetMapping("/estadisticas")
    @AuditarAccesoSensible(
        accion = "VIEW_REPORT",
        descripcion = "Visualización de reporte estadístico",
        modulo = "REPORTES",
        nivel = "INFO",
        incluirIdAfectado = false
    )
    public ResponseEntity<EstadisticasDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(reporteService.obtenerEstadisticas());
    }
}
```

### Ejemplo 3: Búsquedas Avanzadas

```java
@RestController
@RequestMapping("/api/pacientes")
public class PacienteController {

    /**
     * Búsqueda avanzada con múltiples criterios
     * El aspecto registrará la búsqueda pero sin ID específico
     */
    @PostMapping("/busqueda-avanzada")
    @AuditarAccesoSensible(
        accion = "SEARCH_PATIENTS",
        descripcion = "Búsqueda avanzada de pacientes",
        modulo = "PACIENTES",
        nivel = "INFO",
        incluirIdAfectado = false
    )
    public ResponseEntity<Page<PacienteDTO>> busquedaAvanzada(
        @RequestBody BusquedaAvanzadaDTO criterios,
        Pageable pageable
    ) {
        // El aspecto agregará al detalle:
        // "Búsqueda avanzada de pacientes - Parámetros: 2"
        Page<PacienteDTO> resultados = pacienteService.busquedaAvanzada(criterios, pageable);
        return ResponseEntity.ok(resultados);
    }
}
```

---

## Acciones Sensibles Estandarizadas

### Módulo: PACIENTES

| Acción | Descripción | Nivel |
|--------|-------------|-------|
| `VIEW_PATIENT_DETAILS` | Visualización de datos completos de paciente | INFO |
| `VIEW_PATIENT_LIST` | Visualización de lista de pacientes | INFO |
| `SEARCH_PATIENTS` | Búsqueda de pacientes | INFO |
| `EXPORT_PATIENT_DATA` | Exportación de datos de paciente | WARNING |
| `UPDATE_PATIENT` | Actualización de datos de paciente | INFO |
| `DELETE_PATIENT` | Eliminación de paciente | CRITICAL |

### Módulo: HISTORIA_CLINICA

| Acción | Descripción | Nivel |
|--------|-------------|-------|
| `VIEW_CLINICAL_HISTORY` | Visualización de historia clínica | WARNING |
| `UPDATE_CLINICAL_HISTORY` | Actualización de historia clínica | INFO |
| `EXPORT_CLINICAL_HISTORY` | Exportación de historia clínica | WARNING |
| `ADD_MEDICAL_NOTE` | Agregar nota médica | INFO |
| `VIEW_LAB_RESULTS` | Visualizar resultados de laboratorio | INFO |

### Módulo: REPORTES

| Acción | Descripción | Nivel |
|--------|-------------|-------|
| `VIEW_REPORT` | Visualización de reporte | INFO |
| `EXPORT_CSV` | Exportación a CSV | WARNING |
| `EXPORT_PDF` | Exportación a PDF | WARNING |
| `EXPORT_EXCEL` | Exportación a Excel | WARNING |
| `VIEW_STATISTICS` | Visualización de estadísticas | INFO |

### Módulo: RECETAS

| Acción | Descripción | Nivel |
|--------|-------------|-------|
| `VIEW_PRESCRIPTION` | Visualización de receta médica | INFO |
| `CREATE_PRESCRIPTION` | Creación de receta médica | INFO |
| `UPDATE_PRESCRIPTION` | Actualización de receta | INFO |
| `CANCEL_PRESCRIPTION` | Cancelación de receta | WARNING |
| `EXPORT_PRESCRIPTION` | Exportación de receta | INFO |

---

## Queries SQL Útiles

### Ver accesos a datos sensibles en las últimas 24 horas

```sql
SELECT
    fecha_formateada,
    usuario_sesion,
    nombre_completo,
    tipo_evento,
    detalle,
    ip
FROM vw_auditoria_modular_detallada
WHERE accion IN (
    'VIEW_PATIENT_DETAILS',
    'VIEW_CLINICAL_HISTORY',
    'SEARCH_PATIENTS',
    'EXPORT_PATIENT_DATA',
    'EXPORT_CLINICAL_HISTORY'
)
  AND fecha_hora > NOW() - INTERVAL '24 hours'
ORDER BY fecha_hora DESC;
```

### Top 10 usuarios con más accesos a datos sensibles

```sql
SELECT
    usuario_sesion,
    nombre_completo,
    COUNT(*) as total_accesos,
    COUNT(DISTINCT accion) as acciones_distintas,
    MAX(fecha_hora) as ultimo_acceso
FROM vw_auditoria_modular_detallada
WHERE accion LIKE '%PATIENT%'
   OR accion LIKE '%CLINICAL%'
  AND fecha_hora > NOW() - INTERVAL '30 days'
GROUP BY usuario_sesion, nombre_completo
ORDER BY total_accesos DESC
LIMIT 10;
```

### Accesos fallidos a datos sensibles (intentos no autorizados)

```sql
SELECT
    fecha_formateada,
    usuario_sesion,
    nombre_completo,
    accion,
    detalle,
    ip
FROM vw_auditoria_modular_detallada
WHERE estado = 'FAILURE'
  AND (accion LIKE '%PATIENT%' OR accion LIKE '%CLINICAL%')
  AND fecha_hora > NOW() - INTERVAL '7 days'
ORDER BY fecha_hora DESC;
```

---

## Cumplimiento Normativo

### Ley N° 29733 - Ley de Protección de Datos Personales (LPDP)

**Artículo 18:** Toda entidad que maneje datos personales debe implementar medidas técnicas y organizativas para protegerlos.

✅ **Cumplido:** Auditoría completa de accesos
✅ **Cumplido:** Registro de quién, cuándo, desde dónde y qué datos accedió
✅ **Cumplido:** Retención de logs por 5 años

### Ley N° 26842 - Ley General de Salud

**Artículo 25:** La información sobre el acto médico es confidencial.

✅ **Cumplido:** Trazabilidad de accesos a historias clínicas
✅ **Cumplido:** Registro de exportaciones de datos médicos
✅ **Cumplido:** Auditoría de búsquedas en datos de pacientes

---

## Mejores Prácticas

### 1. Usar niveles de severidad apropiados

```java
// ✅ CORRECTO
@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DETAILS",
    nivel = "INFO"  // Lectura normal
)

@AuditarAccesoSensible(
    accion = "EXPORT_PATIENT_DATA",
    nivel = "WARNING"  // Exportación es más sensible
)

@AuditarAccesoSensible(
    accion = "DELETE_PATIENT",
    nivel = "CRITICAL"  // Eliminación es crítica
)
```

### 2. Descripciones claras

```java
// ❌ MAL
descripcion = "Acceso"

// ✅ BIEN
descripcion = "Visualización de historia clínica completa del paciente"
```

### 3. Módulos consistentes

```java
// ✅ CORRECTO - Usar constantes
public class AuditModules {
    public static final String PACIENTES = "PACIENTES";
    public static final String HISTORIA_CLINICA = "HISTORIA_CLINICA";
    public static final String REPORTES = "REPORTES";
}

@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DETAILS",
    modulo = AuditModules.PACIENTES
)
```

### 4. Capturar ID cuando sea relevante

```java
// ✅ Método con ID específico
@AuditarAccesoSensible(
    accion = "VIEW_PATIENT_DETAILS",
    incluirIdAfectado = true  // Capturará el ID del paciente
)
public PacienteDTO obtenerPaciente(@PathVariable Long id) { ... }

// ✅ Búsqueda sin ID específico
@AuditarAccesoSensible(
    accion = "SEARCH_PATIENTS",
    incluirIdAfectado = false  // No hay ID individual
)
public List<PacienteDTO> buscar(@RequestBody BusquedaDTO busqueda) { ... }
```

---

## Troubleshooting

### Problema: La anotación no funciona

**Causa:** Spring AOP no está habilitado.

**Solución:** Agregar a la clase de configuración:
```java
@Configuration
@EnableAspectJAutoProxy
public class AppConfig {
    // ...
}
```

### Problema: No se captura el ID afectado

**Causa:** El primer parámetro no es Long/Integer/String parseable.

**Solución:** Asegurar que el ID sea el primer parámetro o usar `incluirIdAfectado = false`.

### Problema: Usuario aparece como "SYSTEM"

**Causa:** El método se ejecuta fuera de un contexto de seguridad.

**Solución:** Asegurar que el método esté protegido por `@PreAuthorize` o `@CheckMBACPermission`.

---

**Responsable Técnico:** Ing. Styp Canto Rondón
**Email:** cenate.analista@essalud.gob.pe
**Sistema:** cenateinformatica@gmail.com

*EsSalud Perú - CENATE | Centro Nacional de Telemedicina*
