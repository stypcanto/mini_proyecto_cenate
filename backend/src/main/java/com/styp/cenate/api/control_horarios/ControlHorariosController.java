package com.styp.cenate.api.control_horarios;

import com.styp.cenate.dto.control_horarios.CtrHorarioDTO;
import com.styp.cenate.dto.control_horarios.CreateCtrHorarioRequest;
import com.styp.cenate.dto.control_horarios.DimHorarioDTO;
import com.styp.cenate.dto.control_horarios.PeriodoDisponibleDTO;
import com.styp.cenate.service.control_horarios.ControlHorariosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * 🕐 Controlador de Control de Horarios
 * v1.79.0 - Gestión de solicitudes de horarios por período
 */
@RestController
@RequestMapping("/api/control-horarios")
@RequiredArgsConstructor
@Slf4j
public class ControlHorariosController {

    private final ControlHorariosService controlHorariosService;

    /**
     * GET /api/control-horarios/periodos
     * Obtener períodos disponibles (ABIERTO, REABIERTO, CERRADO)
     * Incluye la solicitud del médico autenticado (si existe)
     * 
     * @param estados Estados permitidos separados por coma (ej: "ABIERTO,REABIERTO,CERRADO")
     * @param authorization Token JWT en header Authorization
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/periodos")
    public ResponseEntity<List<PeriodoDisponibleDTO>> obtenerPeriodos(
            @RequestParam(required = false) String estados,
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        log.info("GET /periodos - Estados: {}", estados);

        List<String> estadosList;
        if (estados != null && !estados.isEmpty()) {
            estadosList = Arrays.asList(estados.split(","));
        } else {
            estadosList = List.of("ABIERTO", "REABIERTO", "CERRADO");
        }

        String token = extractTokenFromHeader(authorization);
        List<PeriodoDisponibleDTO> resultado = controlHorariosService.obtenerPeriodosDisponibles(estadosList, token);
        return ResponseEntity.ok(resultado);
    }
    
    /**
     * Extrae el token JWT del header Authorization (Bearer token)
     */
    private String extractTokenFromHeader(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }


    /**
     * GET /api/control-horarios/horarios/codigos
     * Obtener códigos de horario por área y grupo de programación.
     * Los parámetros idArea e idGrupoProg vienen del JWT claims del frontend.
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/horarios/codigos")
    public ResponseEntity<List<DimHorarioDTO>> obtenerCodigosHorario(
            @RequestParam Long idArea,
            @RequestParam Long idGrupoProg
    ) {
        log.info("GET /horarios/codigos - idArea={}, idGrupoProg={}", idArea, idGrupoProg);
        List<DimHorarioDTO> horarios = controlHorariosService.obtenerHorariosPorAreaYGrupo(idArea, idGrupoProg);
        return ResponseEntity.ok(horarios);
    }

    /**
     * POST /api/control-horarios/horarios
     * Crear nueva solicitud de horario
     */
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/horarios")
    public ResponseEntity<?> crearSolicitud(
            @RequestBody CreateCtrHorarioRequest request
    ) {
        log.info("POST /horarios - Crear solicitud para período: {}", request.getPeriodo());

        try {
            CtrHorarioDTO resultado = controlHorariosService.crearSolicitud(request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Solicitud creada exitosamente",
                    "data", resultado
            ));
        } catch (Exception e) {
            log.error("Error creando solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/control-horarios/horarios/{id}
     * Obtener detalle de una solicitud
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/horarios/{id}")
    public ResponseEntity<?> obtenerDetalle(
            @PathVariable Long id
    ) {
        log.info("GET /horarios/{} - Obtener detalle", id);

        CtrHorarioDTO horario = controlHorariosService.obtenerDetalle(id);
        if (horario == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(horario);
    }

    /**
     * PUT /api/control-horarios/horarios/{id}
     * Actualizar solicitud de horario
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/horarios/{id}")
    public ResponseEntity<?> actualizarSolicitud(
            @PathVariable Long id,
            @RequestBody CreateCtrHorarioRequest request
    ) {
        log.info("PUT /horarios/{} - Actualizar solicitud", id);

        try {
            CtrHorarioDTO resultado = controlHorariosService.actualizarSolicitud(id, request);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Solicitud actualizada exitosamente",
                    "data", resultado
            ));
        } catch (Exception e) {
            log.error("Error actualizando solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * DELETE /api/control-horarios/horarios/{id}
     * Eliminar solicitud
     */
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/horarios/{id}")
    public ResponseEntity<?> eliminarSolicitud(
            @PathVariable Long id
    ) {
        log.info("DELETE /horarios/{} - Eliminar solicitud", id);

        try {
            controlHorariosService.eliminarSolicitud(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Solicitud eliminada exitosamente"
            ));
        } catch (Exception e) {
            log.error("Error eliminando solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/control-horarios/crear
     * Crear un nuevo registro de horario (solicitud)
     */
    @PreAuthorize("hasAnyRole('MEDICO', 'COORDINADOR')")
    @PostMapping("/crear")
    public ResponseEntity<?> crearHorario(@RequestBody CreateCtrHorarioRequest request) {
        log.info("POST /crear - Crear nuevo horario para período: {}", request.getPeriodo());
        // Implementación...
        return ResponseEntity.ok("OK");
    }

    /**
     * PUT /api/control-horarios/horarios/{id}/detalles
     * Guardar turnos por día (ctr_horario_det)
     * Body: { "turnosPorDia": { "2026-02-01": "29", "2026-02-02": "131", ... } }
     */
    @PreAuthorize("isAuthenticated()")
    @PutMapping("/horarios/{id}/detalles")
    public ResponseEntity<?> guardarDetalles(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body
    ) {
        log.info("PUT /horarios/{}/detalles - Guardar turnos por día", id);

        try {
            @SuppressWarnings("unchecked")
            Map<String, String> turnosPorDia = (Map<String, String>) body.get("turnosPorDia");
            if (turnosPorDia == null || turnosPorDia.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "No se recibieron turnos para guardar"
                ));
            }

            controlHorariosService.guardarDetalles(id, turnosPorDia);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Detalles guardados exitosamente (" + turnosPorDia.size() + " días)"
            ));
        } catch (Exception e) {
            log.error("Error guardando detalles: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/control-horarios/horarios/{id}/detalles
     * Obtener turnos guardados por día
     */
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/horarios/{id}/detalles")
    public ResponseEntity<?> obtenerDetalles(@PathVariable Long id) {
        log.info("GET /horarios/{}/detalles - Obtener turnos por día", id);

        Map<String, String> detalles = controlHorariosService.obtenerDetalles(id);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "data", detalles
        ));
    }

    /**
     * PATCH /api/control-horarios/horarios/{id}/observaciones
     * Actualizar solo las observaciones
     * Body: { "observaciones": "texto" }
     */
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/horarios/{id}/observaciones")
    public ResponseEntity<?> actualizarObservaciones(
            @PathVariable Long id,
            @RequestBody Map<String, String> body
    ) {
        log.info("PATCH /horarios/{}/observaciones - Actualizar observaciones", id);
        try {
            String observaciones = body.getOrDefault("observaciones", "");
            controlHorariosService.actualizarObservaciones(id, observaciones);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Observaciones actualizadas exitosamente"
            ));
        } catch (Exception e) {
            log.error("Error actualizando observaciones: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "error", e.getMessage()
            ));
        }
    }

    /**
     * PATCH /api/control-horarios/horarios/{id}/finalizar
     * Finalizar solicitud (cambiar estado a TERMINADO = 4)
     */
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/horarios/{id}/finalizar")
    public ResponseEntity<?> finalizarSolicitud(@PathVariable Long id) {
        log.info("PATCH /horarios/{}/finalizar - Finalizar solicitud", id);

        try {
            CtrHorarioDTO resultado = controlHorariosService.finalizarSolicitud(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Solicitud finalizada exitosamente (estado: TERMINADO)",
                    "data", resultado
            ));
        } catch (Exception e) {
            log.error("Error finalizando solicitud: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));
        }
    }
}
