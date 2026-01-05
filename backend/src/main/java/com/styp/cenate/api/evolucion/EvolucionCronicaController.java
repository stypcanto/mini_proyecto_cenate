package com.styp.cenate.api.evolucion;

import com.styp.cenate.dto.EvolucionCronicaDTO;
import com.styp.cenate.service.evolucion.EvolucionCronicaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller REST para dashboard de evolución de pacientes crónicos CENACRON
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/evolucion-cronica")
@RequiredArgsConstructor
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:3000}")
public class EvolucionCronicaController {

    private final EvolucionCronicaService evolucionService;

    /**
     * GET /api/evolucion-cronica/paciente/{pkAsegurado}
     * Obtener evolución de paciente crónico CENACRON
     *
     * @param pkAsegurado ID del paciente
     * @param meses       Meses hacia atrás para calcular (default: 6)
     * @return Dashboard completo de evolución
     */
    @GetMapping("/paciente/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> obtenerEvolucion(
            @PathVariable String pkAsegurado,
            @RequestParam(defaultValue = "6") Integer meses) {

        log.info("📊 GET /api/evolucion-cronica/paciente/{} - meses={}", pkAsegurado, meses);

        try {
            EvolucionCronicaDTO evolucion = evolucionService.obtenerEvolucion(pkAsegurado, meses);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", evolucion);
            response.put("message", "Evolución calculada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al calcular evolución del paciente {}: {}", pkAsegurado, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al calcular evolución");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/evolucion-cronica/verificar-elegibilidad/{pkAsegurado}
     * Verificar si el paciente es elegible para dashboard crónico
     *
     * @param pkAsegurado ID del paciente
     * @return true si es elegible (CENACRON + HTA/DM), false en caso contrario
     */
    @GetMapping("/verificar-elegibilidad/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> verificarElegibilidad(@PathVariable String pkAsegurado) {
        log.info("🔍 GET /api/evolucion-cronica/verificar-elegibilidad/{}", pkAsegurado);

        try {
            boolean elegible = evolucionService.esElegibleParaDashboard(pkAsegurado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", Map.of(
                    "pkAsegurado", pkAsegurado,
                    "elegible", elegible,
                    "razon", elegible ? "Paciente CENACRON con diagnóstico de HTA o DM"
                            : "No cumple criterios (requiere CENACRON + HTA/DM)"));
            response.put("message", "Elegibilidad verificada");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al verificar elegibilidad del paciente {}: {}", pkAsegurado, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al verificar elegibilidad");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
