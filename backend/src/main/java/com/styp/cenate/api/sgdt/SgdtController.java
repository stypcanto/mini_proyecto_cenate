package com.styp.cenate.api.sgdt;

import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.dto.sgdt.MedicoSimpleDto;
import com.styp.cenate.dto.sgdt.MedicoStatsDto;
import com.styp.cenate.service.sgdt.SgdtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller REST para "Total Pacientes TeleCe" — SGDT Medicina Especializada.
 * Espeja el patrón de NursingController pero filtra por especialidades médicas
 * distintas de 'medicina general' y 'enfermeria'.
 *
 * Base URL: /api/sgdt
 *
 * @version v1.85.36
 */
@Slf4j
@RestController
@RequestMapping("/api/sgdt")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SgdtController {

    private final SgdtService sgdtService;

    /**
     * GET /api/sgdt/estadisticas/por-medico?fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Estadísticas de pacientes de Medicina Especializada agrupadas por médico.
     */
    @GetMapping("/estadisticas/por-medico")
    public ResponseEntity<List<MedicoStatsDto>> estadisticasPorMedico(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📊 GET /api/sgdt/estadisticas/por-medico - fecha: {}, turno: {}", fecha, turno);
        return ResponseEntity.ok(sgdtService.obtenerEstadisticasPorMedico(fecha, turno));
    }

    /**
     * GET /api/sgdt/pacientes/por-medico?idPersonal=&fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Pacientes de Medicina Especializada asignados a un médico específico.
     */
    @GetMapping("/pacientes/por-medico")
    public ResponseEntity<List<RescatarPacienteDto>> pacientesPorMedico(
            @RequestParam Long idPersonal,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📋 GET /api/sgdt/pacientes/por-medico - idPersonal: {}, fecha: {}, turno: {}", idPersonal, fecha, turno);
        return ResponseEntity.ok(sgdtService.obtenerPacientesPorMedico(idPersonal, fecha, turno));
    }

    /**
     * GET /api/sgdt/medicos
     * Lista médicos activos con pacientes en Medicina Especializada.
     */
    @GetMapping("/medicos")
    public ResponseEntity<List<MedicoSimpleDto>> listarMedicos() {
        log.info("📋 GET /api/sgdt/medicos");
        return ResponseEntity.ok(sgdtService.listarMedicos());
    }

    /**
     * GET /api/sgdt/pacientes/buscar-global?q=TEXTO
     * Búsqueda global de pacientes de Medicina Especializada.
     */
    @GetMapping("/pacientes/buscar-global")
    public ResponseEntity<List<RescatarPacienteDto>> buscarPacienteGlobal(@RequestParam String q) {
        if (q == null || q.trim().length() < 3) {
            return ResponseEntity.ok(List.of());
        }
        log.info("🔍 GET /api/sgdt/pacientes/buscar-global - q: {}", q);
        return ResponseEntity.ok(sgdtService.buscarPacienteGlobal(q));
    }

    /**
     * GET /api/sgdt/estadisticas/fechas-disponibles
     * Fechas con pacientes de Medicina Especializada para el calendario.
     */
    @GetMapping("/estadisticas/fechas-disponibles")
    public ResponseEntity<Map<String, Long>> fechasDisponibles() {
        log.info("📅 GET /api/sgdt/estadisticas/fechas-disponibles");
        return ResponseEntity.ok(sgdtService.obtenerFechasDisponibles());
    }

    /**
     * GET /api/sgdt/estadisticas/fechas-por-medico?idPersonal=X
     * Fechas con pacientes para un médico específico.
     */
    @GetMapping("/estadisticas/fechas-por-medico")
    public ResponseEntity<Map<String, Long>> fechasPorMedico(@RequestParam Long idPersonal) {
        log.info("📅 GET /api/sgdt/estadisticas/fechas-por-medico - idPersonal: {}", idPersonal);
        return ResponseEntity.ok(sgdtService.obtenerFechasPorMedico(idPersonal));
    }

    /**
     * PUT /api/sgdt/reasignar-masivo
     * Body: { "ids": [1,2,3], "idPersonal": 490, "fecha": "YYYY-MM-DD", "hora": "HH:MM" }
     * Reasigna un lote de solicitudes a otro médico.
     */
    @PutMapping("/reasignar-masivo")
    public ResponseEntity<Map<String, Object>> reasignarMasivo(@RequestBody Map<String, Object> body) {
        @SuppressWarnings("unchecked")
        List<Integer> idsRaw = (List<Integer>) body.get("ids");
        Long idPersonal = Long.valueOf(body.get("idPersonal").toString());
        List<Long> ids = idsRaw.stream().map(Integer::longValue).collect(Collectors.toList());

        java.time.LocalDate fechaAtencion = null;
        java.time.LocalTime horaAtencion  = null;
        if (body.get("fecha") != null) {
            fechaAtencion = java.time.LocalDate.parse(body.get("fecha").toString());
        }
        if (body.get("hora") != null) {
            horaAtencion = java.time.LocalTime.parse(body.get("hora").toString());
        }

        log.info("🔄 PUT /api/sgdt/reasignar-masivo - {} registros → medico {} fecha={} hora={}",
                 ids.size(), idPersonal, fechaAtencion, horaAtencion);
        int actualizados = sgdtService.reasignarPacientesMasivo(ids, idPersonal, fechaAtencion, horaAtencion);
        return ResponseEntity.ok(Map.of("actualizados", actualizados, "ids", ids.size()));
    }
}
