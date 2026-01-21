package com.styp.cenate.api.adherencia;

import com.styp.cenate.dto.AdherenciaEstadoDTO;
import com.styp.cenate.service.adherencia.AdherenciaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller REST para gestión de adherencia al tratamiento
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/adherencia")
@RequiredArgsConstructor
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:3000}")
public class AdherenciaController {

    private final AdherenciaService adherenciaService;

    /**
     * GET /api/adherencia/paciente/{pkAsegurado}
     * Obtener estado de adherencia de un paciente
     *
     * @param pkAsegurado ID del paciente
     * @param dias        Días hacia atrás para calcular (default: 30)
     * @return Estado de adherencia con porcentaje y clasificación
     */
    @GetMapping("/paciente/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> obtenerAdherenciaPaciente(
            @PathVariable("pkAsegurado") String pkAsegurado,
            @RequestParam(defaultValue = "30", name="dias") Integer dias) {

        log.info("📊 GET /api/adherencia/paciente/{} - dias={}", pkAsegurado, dias);

        try {
            AdherenciaEstadoDTO estado = adherenciaService.calcularAdherenciaPaciente(pkAsegurado, dias);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", estado);
            response.put("message", "Adherencia calculada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al calcular adherencia del paciente {}: {}", pkAsegurado, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al calcular adherencia");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * GET /api/adherencia/atencion/{idAtencion}
     * Obtener estado de adherencia para una atención específica
     *
     * @param idAtencion ID de la atención
     * @return Estado de adherencia
     */
    @GetMapping("/atencion/{idAtencion}")
    public ResponseEntity<Map<String, Object>> obtenerAdherenciaPorAtencion(@PathVariable Long idAtencion) {
        log.info("📊 GET /api/adherencia/atencion/{}", idAtencion);

        try {
            AdherenciaEstadoDTO estado = adherenciaService.calcularAdherenciaPorAtencion(idAtencion);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", estado);
            response.put("message", "Adherencia calculada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al calcular adherencia para atención {}: {}", idAtencion, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al calcular adherencia");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
