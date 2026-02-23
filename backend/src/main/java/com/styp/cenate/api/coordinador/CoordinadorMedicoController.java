package com.styp.cenate.api.coordinador;

import com.styp.cenate.dto.coordinador.EstadisticaMedicoDTO;
import com.styp.cenate.dto.coordinador.EvolucionTemporalDTO;
import com.styp.cenate.dto.coordinador.KpisAreaDTO;
import com.styp.cenate.dto.coordinador.ReasignarPacienteRequest;
import com.styp.cenate.service.coordinador.ICoordinadorMedicoService;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

/**
 * Controller para operaciones del coordinador médico
 * Proporciona endpoints para supervisión de médicos y gestión de pacientes
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@RestController
@RequestMapping("/api/coordinador-medico")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class CoordinadorMedicoController {

    private final ICoordinadorMedicoService coordinadorMedicoService;

    /**
     * GET /api/coordinador-medico/estadisticas/medicos
     * Obtiene estadísticas de todos los médicos del área del coordinador
     *
     * @param fechaDesde fecha inicio del rango (ISO-8601, opcional)
     * @param fechaHasta fecha fin del rango (ISO-8601, opcional)
     * @return lista de estadísticas por médico
     */
    @GetMapping("/estadisticas/medicos")
    @CheckMBACPermission(pagina = "/roles/coordinador/dashboard-medico", accion = "ver")
    public ResponseEntity<List<EstadisticaMedicoDTO>> obtenerEstadisticasMedicos(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaDesde,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaHasta) {

        log.info("GET /api/coordinador-medico/estadisticas/medicos - fechaDesde: {}, fechaHasta: {}",
            fechaDesde, fechaHasta);

        List<EstadisticaMedicoDTO> stats = coordinadorMedicoService
            .obtenerEstadisticasMedicos(fechaDesde, fechaHasta);

        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/coordinador-medico/kpis
     * Obtiene KPIs consolidados del área del coordinador
     *
     * @param fechaDesde fecha inicio del rango (ISO-8601, opcional)
     * @param fechaHasta fecha fin del rango (ISO-8601, opcional)
     * @return DTO con KPIs consolidados
     */
    @GetMapping("/kpis")
    @CheckMBACPermission(pagina = "/roles/coordinador/dashboard-medico", accion = "ver")
    public ResponseEntity<KpisAreaDTO> obtenerKpis(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaDesde,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaHasta) {

        log.info("GET /api/coordinador-medico/kpis - fechaDesde: {}, fechaHasta: {}",
            fechaDesde, fechaHasta);

        KpisAreaDTO kpis = coordinadorMedicoService.obtenerKpisArea(fechaDesde, fechaHasta);
        return ResponseEntity.ok(kpis);
    }

    /**
     * GET /api/coordinador-medico/evolucion-temporal
     * Obtiene evolución temporal de atenciones por día
     *
     * @param fechaDesde fecha inicio del rango (ISO-8601)
     * @param fechaHasta fecha fin del rango (ISO-8601)
     * @return lista de evolución temporal por día
     */
    @GetMapping("/evolucion-temporal")
    @CheckMBACPermission(pagina = "/roles/coordinador/dashboard-medico", accion = "ver")
    public ResponseEntity<List<EvolucionTemporalDTO>> obtenerEvolucion(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaDesde,

            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            OffsetDateTime fechaHasta) {

        log.info("GET /api/coordinador-medico/evolucion-temporal - fechaDesde: {}, fechaHasta: {}",
            fechaDesde, fechaHasta);

        List<EvolucionTemporalDTO> evolucion = coordinadorMedicoService
            .obtenerEvolucionTemporal(fechaDesde, fechaHasta);

        return ResponseEntity.ok(evolucion);
    }

    /**
     * POST /api/coordinador-medico/reasignar-paciente
     * Reasigna un paciente a otro médico del área
     *
     * @param request contiene idSolicitud y nuevoMedicoId
     * @return mensaje de confirmación
     */
    @PostMapping("/reasignar-paciente")
    @CheckMBACPermission(pagina = "/citas/gestion-asegurado", accion = "editar")
    public ResponseEntity<Map<String, String>> reasignarPaciente(
            @RequestBody ReasignarPacienteRequest request) {

        log.info("POST /api/coordinador-medico/reasignar-paciente - idSolicitud: {}, nuevoMedicoId: {}",
            request.getIdSolicitud(), request.getNuevoMedicoId());

        coordinadorMedicoService.reasignarPaciente(
            request.getIdSolicitud(),
            request.getNuevoMedicoId()
        );

        return ResponseEntity.ok(Map.of("mensaje", "Paciente reasignado correctamente"));
    }
}
