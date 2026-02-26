package com.styp.cenate.api.enfermeria;

import com.styp.cenate.dto.enfermeria.EnfermeraSimpleDto;
import com.styp.cenate.dto.enfermeria.EnfermeraStatsDto;
import com.styp.cenate.dto.enfermeria.NursingAttendRequest;
import com.styp.cenate.dto.enfermeria.NursingWorklistDto;
import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.model.enfermeria.AtencionEnfermeria;
import com.styp.cenate.service.enfermeria.NursingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/enfermeria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Ajustar según seguridad
public class NursingController {

    private final NursingService nursingService;

    @GetMapping("/queue")
    public ResponseEntity<List<NursingWorklistDto>> getWorklist(@RequestParam(defaultValue = "TODOS") String estado) {
        log.info("📋 GET /api/enfermeria/queue - estado: {}", estado);
        List<NursingWorklistDto> worklist = nursingService.getWorklist(estado);
        log.info("✅ GET /api/enfermeria/queue - Retornando {} registros para estado: {}", worklist.size(), estado);
        return ResponseEntity.ok(worklist);
    }

    @PostMapping("/attend")
    public ResponseEntity<AtencionEnfermeria> attendPatient(@RequestBody NursingAttendRequest request) {
        return ResponseEntity.ok(nursingService.attendPatient(request));
    }

    // =========================================================================
    // 🆘 RESCATE DE PACIENTES — COORDINADORA ENFERMERÍA
    // =========================================================================

    /**
     * GET /api/enfermeria/pacientes/buscar?dni={dni}
     * Busca solicitudes de bolsa por DNI del paciente.
     */
    @GetMapping("/pacientes/buscar")
    public ResponseEntity<List<RescatarPacienteDto>> buscarPacientesPorDni(@RequestParam String dni) {
        log.info("🔍 GET /api/enfermeria/pacientes/buscar - DNI: {}", dni);
        List<RescatarPacienteDto> resultados = nursingService.buscarPacientesPorDni(dni);
        return ResponseEntity.ok(resultados);
    }

    /**
     * PUT /api/enfermeria/pacientes/{idSolicitud}/rescatar
     * Rescata un paciente: condicion_medica → "Pendiente", estado → "PENDIENTE", fecha_atencion_medica → null.
     * Body opcional: { "idPersonal": 123 }
     */
    @PutMapping("/pacientes/{idSolicitud}/rescatar")
    public ResponseEntity<RescatarPacienteDto> rescatarPaciente(
            @PathVariable Long idSolicitud,
            @RequestBody(required = false) Map<String, Object> body) {
        Long idPersonal = null;
        if (body != null && body.get("idPersonal") != null) {
            idPersonal = Long.valueOf(body.get("idPersonal").toString());
        }
        log.info("🆘 PUT /api/enfermeria/pacientes/{}/rescatar - idPersonal: {}", idSolicitud, idPersonal);
        RescatarPacienteDto resultado = nursingService.rescatarPaciente(idSolicitud, idPersonal);
        return ResponseEntity.ok(resultado);
    }

    /**
     * PUT /api/enfermeria/pacientes/{idSolicitud}/reasignar
     * Reasigna un paciente PENDIENTE a otro profesional.
     * Body requerido: { "idPersonal": 123 }
     * Retorna 400 si el paciente ya está ATENDIDO o no está en PENDIENTE.
     */
    @PutMapping("/pacientes/{idSolicitud}/reasignar")
    public ResponseEntity<?> reasignarPaciente(
            @PathVariable Long idSolicitud,
            @RequestBody Map<String, Object> body) {
        Long idPersonal = null;
        if (body != null && body.get("idPersonal") != null) {
            idPersonal = Long.valueOf(body.get("idPersonal").toString());
        }
        if (idPersonal == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Debe seleccionar un profesional para reasignar."));
        }
        log.info("🔄 PUT /api/enfermeria/pacientes/{}/reasignar - idPersonal: {}", idSolicitud, idPersonal);
        try {
            RescatarPacienteDto resultado = nursingService.reasignarPaciente(idSolicitud, idPersonal);
            return ResponseEntity.ok(resultado);
        } catch (IllegalStateException e) {
            log.warn("⚠️ Reasignación rechazada para solicitud {}: {}", idSolicitud, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/enfermeria/enfermeras
     * Lista el personal activo con profesión de enfermería.
     */
    @GetMapping("/enfermeras")
    public ResponseEntity<List<EnfermeraSimpleDto>> listarEnfermeras() {
        log.info("📋 GET /api/enfermeria/enfermeras");
        return ResponseEntity.ok(nursingService.listarEnfermeras());
    }

    // =========================================================================
    // 📊 v1.65.0: TOTAL PACIENTES ENFERMERÍA
    // =========================================================================

    /**
     * GET /api/enfermeria/estadisticas/por-enfermera?fecha=YYYY-MM-DD
     * Estadísticas de pacientes (bolsa 3) agrupadas por enfermera.
     * El parámetro fecha es opcional; si se omite, devuelve todos los registros.
     */
    @GetMapping("/estadisticas/por-enfermera")
    public ResponseEntity<List<EnfermeraStatsDto>> estadisticasPorEnfermera(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📊 GET /api/enfermeria/estadisticas/por-enfermera - fecha: {}, turno: {}", fecha, turno);
        return ResponseEntity.ok(nursingService.obtenerEstadisticasPorEnfermera(fecha, turno));
    }

    /**
     * GET /api/enfermeria/pacientes/por-enfermera?idPersonal=&fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Pacientes de enfermería asignados a una enfermera específica.
     */
    @GetMapping("/pacientes/por-enfermera")
    public ResponseEntity<List<RescatarPacienteDto>> pacientesPorEnfermera(
            @RequestParam Long idPersonal,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📋 GET /api/enfermeria/pacientes/por-enfermera - idPersonal: {}, fecha: {}, turno: {}", idPersonal, fecha, turno);
        return ResponseEntity.ok(nursingService.obtenerPacientesPorEnfermera(idPersonal, fecha, turno));
    }

    /**
     * GET /api/enfermeria/estadisticas/fechas-disponibles
     * Retorna mapa {fecha → total} con todas las fechas que tienen pacientes de enfermería asignados.
     * Usado por el calendario para pintar los días con datos.
     */
    @GetMapping("/estadisticas/fechas-disponibles")
    public ResponseEntity<Map<String, Long>> fechasDisponibles() {
        log.info("📅 GET /api/enfermeria/estadisticas/fechas-disponibles");
        return ResponseEntity.ok(nursingService.obtenerFechasDisponibles());
    }

    /**
     * GET /api/enfermeria/estadisticas/fechas-por-enfermera?idPersonal=X
     * Retorna mapa {fecha → total} con las fechas que tiene asignadas una enfermera específica.
     * Usado por el calendario del drawer para pintar días con datos.
     */
    @GetMapping("/estadisticas/fechas-por-enfermera")
    public ResponseEntity<Map<String, Long>> fechasPorEnfermera(@RequestParam Long idPersonal) {
        log.info("📅 GET /api/enfermeria/estadisticas/fechas-por-enfermera - idPersonal: {}", idPersonal);
        return ResponseEntity.ok(nursingService.obtenerFechasPorEnfermera(idPersonal));
    }

    /**
     * PUT /api/enfermeria/reasignar-masivo
     * Body: { "ids": [1,2,3], "idPersonal": 490 }
     * Reasigna un lote de solicitudes a otra enfermera.
     */
    @PutMapping("/reasignar-masivo")
    public ResponseEntity<Map<String, Object>> reasignarMasivo(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> idsRaw = (List<Integer>) body.get("ids");
        Long idPersonal = Long.valueOf(body.get("idPersonal").toString());
        List<Long> ids = idsRaw.stream().map(Integer::longValue).collect(Collectors.toList());
        log.info("🔄 PUT /api/enfermeria/reasignar-masivo - {} registros → enfermera {}", ids.size(), idPersonal);
        int actualizados = nursingService.reasignarPacientesMasivo(ids, idPersonal);
        return ResponseEntity.ok(Map.of("actualizados", actualizados, "ids", ids.size()));
    }
}
