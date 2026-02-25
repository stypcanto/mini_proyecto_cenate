package com.styp.cenate.api.control_horarios;

import com.styp.cenate.dto.control_horarios.CtrHorarioDTO;
import com.styp.cenate.dto.control_horarios.CreateCtrHorarioRequest;
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
}
