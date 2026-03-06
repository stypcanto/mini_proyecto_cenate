package com.styp.cenate.api.teleurgencias;

import com.styp.cenate.dto.enfermeria.EnfermeraSimpleDto;
import com.styp.cenate.dto.enfermeria.RescatarPacienteDto;
import com.styp.cenate.dto.teleurgencias.MedicoTeleurgenciasStatsDto;
import com.styp.cenate.service.teleurgencias.TeleurgenciasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Endpoints para el módulo "Total Pacientes Teleurgencias".
 * Patrón idéntico al NursingController (enfermería) — v1.79.0.
 *
 * Base path: /api/gestion-pacientes/coordinador/teleurgencias
 */
@Slf4j
@RestController
@RequestMapping("/api/gestion-pacientes/coordinador/teleurgencias")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TeleurgenciasController {

    private final TeleurgenciasService teleurgenciasService;

    /**
     * GET /estadisticas/por-medico?fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Estadísticas agrupadas por médico de Teleurgencias.
     */
    @GetMapping("/estadisticas/por-medico")
    public ResponseEntity<List<MedicoTeleurgenciasStatsDto>> estadisticasPorMedico(
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📊 GET /coordinador/teleurgencias/estadisticas/por-medico - fecha: {}, turno: {}", fecha, turno);
        return ResponseEntity.ok(teleurgenciasService.obtenerEstadisticasPorMedico(fecha, turno));
    }

    /**
     * GET /pacientes/por-medico?idMedico=X&fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Pacientes de un médico específico de Teleurgencias.
     */
    @GetMapping("/pacientes/por-medico")
    public ResponseEntity<List<RescatarPacienteDto>> pacientesPorMedico(
            @RequestParam Long idMedico,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("📋 GET /coordinador/teleurgencias/pacientes/por-medico - idMedico: {}, fecha: {}, turno: {}", idMedico, fecha, turno);
        return ResponseEntity.ok(teleurgenciasService.obtenerPacientesPorMedico(idMedico, fecha, turno));
    }

    /**
     * GET /pacientes/buscar?q=...&fecha=YYYY-MM-DD&turno=MANANA|TARDE
     * Busca pacientes por nombre o DNI a través de todos los médicos de Teleurgencias.
     */
    @GetMapping("/pacientes/buscar")
    public ResponseEntity<List<RescatarPacienteDto>> buscarPacientes(
            @RequestParam String q,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String turno) {
        log.info("🔍 GET /coordinador/teleurgencias/pacientes/buscar - q: {}, fecha: {}, turno: {}", q, fecha, turno);
        return ResponseEntity.ok(teleurgenciasService.buscarPacientes(q, fecha, turno));
    }

    /**
     * GET /medicos
     * Lista de médicos de Teleurgencias (para selector de reasignación).
     */
    @GetMapping("/medicos")
    public ResponseEntity<List<EnfermeraSimpleDto>> listarMedicos() {
        log.info("📋 GET /coordinador/teleurgencias/medicos");
        return ResponseEntity.ok(teleurgenciasService.listarMedicos());
    }

    /**
     * GET /estadisticas/fechas-disponibles
     * Mapa {fecha → total} para el calendario global.
     */
    @GetMapping("/estadisticas/fechas-disponibles")
    public ResponseEntity<Map<String, Long>> fechasDisponibles() {
        log.info("📅 GET /coordinador/teleurgencias/estadisticas/fechas-disponibles");
        return ResponseEntity.ok(teleurgenciasService.obtenerFechasDisponibles());
    }

    /**
     * GET /estadisticas/fechas-por-medico?idMedico=X
     * Mapa {fecha → total} para el calendario del drawer de un médico.
     */
    @GetMapping("/estadisticas/fechas-por-medico")
    public ResponseEntity<Map<String, Long>> fechasPorMedico(@RequestParam Long idMedico) {
        log.info("📅 GET /coordinador/teleurgencias/estadisticas/fechas-por-medico - idMedico: {}", idMedico);
        return ResponseEntity.ok(teleurgenciasService.obtenerFechasPorMedico(idMedico));
    }

    /**
     * PUT /reasignar-masivo
     * Body: { "ids": [1,2,3], "idPersonal": 390, "fecha": "YYYY-MM-DD", "hora": "HH:MM" }
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

        log.info("🔄 PUT /coordinador/teleurgencias/reasignar-masivo - {} ids → médico {} fecha={} hora={}",
                ids.size(), idPersonal, fechaAtencion, horaAtencion);
        int actualizados = teleurgenciasService.reasignarMasivo(ids, idPersonal, fechaAtencion, horaAtencion);
        return ResponseEntity.ok(Map.of("actualizados", actualizados, "ids", ids.size()));
    }
}
