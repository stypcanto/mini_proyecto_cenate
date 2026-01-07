package com.styp.cenate.api.atencion;

import com.styp.cenate.dto.EnfermeriaPacienteDTO;
import com.styp.cenate.dto.EnfermeriaPacienteDetalleDTO;
import com.styp.cenate.dto.EnfermeriaEstadisticasDTO;
import com.styp.cenate.service.atencion.EnfermeriaPacientesService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller REST para módulo de Enfermería - Mis Pacientes
 * Permite a las enfermeras ver los pacientes que han atendido
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/enfermeria")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class EnfermeriaPacientesController {

    private final EnfermeriaPacientesService enfermeriaService;

    /**
     * OPTIONS /api/enfermeria/mis-pacientes
     * Maneja las solicitudes preflight de CORS
     */
    @RequestMapping(value = "/mis-pacientes", method = RequestMethod.OPTIONS)
    public ResponseEntity<?> handleOptions() {
        return ResponseEntity.ok().build();
    }

    /**
     * 1️⃣ GET /api/enfermeria/mis-pacientes
     * Obtener todos los pacientes atendidos por la enfermera logueada (paginado)
     *
     * @param page Número de página (default: 0)
     * @param size Tamaño de página (default: 10)
     * @return Page de pacientes con su última atención
     */
    @GetMapping("/mis-pacientes")
    @PreAuthorize("hasRole('ENFERMERIA')")
    public ResponseEntity<Map<String, Object>> obtenerMisPacientes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("📋 GET /api/enfermeria/mis-pacientes - page={}, size={}", page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<EnfermeriaPacienteDTO> pacientes = enfermeriaService.obtenerMisPacientes(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", pacientes);
            response.put("message", "Pacientes obtenidos exitosamente");

            log.info("✅ {} pacientes encontrados (página {}/{})",
                    pacientes.getTotalElements(), page + 1, pacientes.getTotalPages());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener pacientes de enfermería: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener lista de pacientes");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 2️⃣ GET /api/enfermeria/paciente/{pkAsegurado}
     * Obtener detalle completo de un paciente con su historial de atenciones
     *
     * @param pkAsegurado PK del asegurado
     * @return Detalle completo del paciente con todas sus atenciones
     */
    @GetMapping("/paciente/{pkAsegurado}")
    @PreAuthorize("hasRole('ENFERMERIA')")
    public ResponseEntity<Map<String, Object>> obtenerDetallePaciente(
            @PathVariable String pkAsegurado) {

        log.info("📄 GET /api/enfermeria/paciente/{}", pkAsegurado);

        try {
            EnfermeriaPacienteDetalleDTO detalle = enfermeriaService.obtenerDetallePaciente(pkAsegurado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", detalle);
            response.put("message", "Detalle del paciente obtenido exitosamente");

            log.info("✅ Detalle del paciente {} obtenido - {} atenciones totales",
                    pkAsegurado, detalle.getTotalAtenciones());

            return ResponseEntity.ok(response);

        } catch (com.styp.cenate.exception.ResourceNotFoundException e) {
            log.warn("⚠️  Paciente no encontrado: {}", pkAsegurado);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Paciente no encontrado o sin atenciones de enfermería");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error al obtener detalle del paciente {}: {}", pkAsegurado, e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener detalle del paciente");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 3️⃣ GET /api/enfermeria/estadisticas
     * Obtener estadísticas generales del módulo de Enfermería
     * Este endpoint es para SUPERADMIN - muestra datos agregados sin información de pacientes individuales
     *
     * @return Estadísticas generales (total enfermeras, atenciones, distribución, etc.)
     */
    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasGenerales() {

        log.info("📊 GET /api/enfermeria/estadisticas");

        try {
            EnfermeriaEstadisticasDTO estadisticas = enfermeriaService.obtenerEstadisticasGenerales();

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", estadisticas);
            response.put("message", "Estadísticas obtenidas exitosamente");

            log.info("✅ Estadísticas generadas: {} enfermeras, {} pacientes, {} atenciones",
                    estadisticas.getTotalEnfermeras(),
                    estadisticas.getTotalPacientesAtendidos(),
                    estadisticas.getTotalAtenciones());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener estadísticas del módulo de enfermería");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
