package com.styp.cenate.api.atencion;

import com.styp.cenate.dto.AtencionClinicaCreateDTO;
import com.styp.cenate.dto.AtencionClinicaResponseDTO;
import com.styp.cenate.dto.AtencionClinicaUpdateDTO;
import com.styp.cenate.service.atencion.IAtencionClinicaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller REST para gestionar atenciones clínicas
 * Módulo de Trazabilidad Clínica
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Slf4j
@RestController
@RequestMapping("/api/atenciones-clinicas")
@RequiredArgsConstructor
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:3000}")
public class AtencionClinicaController {

    private final IAtencionClinicaService atencionService;

    /**
     * 1️⃣ GET /api/atenciones-clinicas/asegurado/{pkAsegurado}
     * Obtener todas las atenciones de un asegurado específico (paginado)
     *
     * @param pkAsegurado ID del asegurado
     * @param page        Número de página (default: 0)
     * @param size        Tamaño de página (default: 10)
     * @return Page de atenciones del asegurado
     */
    @GetMapping("/asegurado/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> obtenerAtencionesAsegurado(
            @PathVariable String pkAsegurado,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("📋 GET /api/atenciones-clinicas/asegurado/{} - page={}, size={}", pkAsegurado, page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AtencionClinicaResponseDTO> atenciones = atencionService.obtenerPorAsegurado(pkAsegurado, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", atenciones);
            response.put("message", "Atenciones obtenidas exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener atenciones del asegurado {}: {}", pkAsegurado, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener atenciones del asegurado");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 2️⃣ GET /api/atenciones-clinicas/{id}
     * Obtener detalle completo de una atención específica
     *
     * @param id ID de la atención
     * @return DTO con detalle completo de la atención
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerAtencionPorId(@PathVariable Long id) {
        log.info("🔍 GET /api/atenciones-clinicas/{}", id);

        try {
            AtencionClinicaResponseDTO atencion = atencionService.obtenerPorId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", atencion);
            response.put("message", "Atención obtenida exitosamente");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Error al obtener atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Atención no encontrada");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error inesperado al obtener atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener atención");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 3️⃣ GET /api/atenciones-clinicas/mis-atenciones
     * Obtener atenciones creadas por el profesional logueado (paginado)
     *
     * @param page Número de página (default: 0)
     * @param size Tamaño de página (default: 10)
     * @return Page de atenciones creadas por el profesional
     */
    @GetMapping("/mis-atenciones")
    public ResponseEntity<Map<String, Object>> obtenerMisAtenciones(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        log.info("👨‍⚕️ GET /api/atenciones-clinicas/mis-atenciones - page={}, size={}", page, size);

        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<AtencionClinicaResponseDTO> atenciones = atencionService.obtenerMisAtenciones(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", atenciones);
            response.put("message", "Mis atenciones obtenidas exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener mis atenciones: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener atenciones");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 4️⃣ POST /api/atenciones-clinicas
     * Crear una nueva atención clínica
     *
     * @param dto Datos de la atención a crear
     * @return DTO de la atención creada
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearAtencion(@Valid @RequestBody AtencionClinicaCreateDTO dto) {
        log.info("✅ POST /api/atenciones-clinicas - Creando atención para asegurado: {}", dto.getPkAsegurado());

        try {
            AtencionClinicaResponseDTO atencionCreada = atencionService.crear(dto);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.CREATED.value());
            response.put("data", atencionCreada);
            response.put("message", "Atención clínica creada exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (RuntimeException e) {
            log.error("❌ Error de validación al crear atención: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error de validación al crear atención");

            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error inesperado al crear atención: {}", e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al crear atención");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 5️⃣ PUT /api/atenciones-clinicas/{id}
     * Actualizar una atención clínica existente
     *
     * @param id  ID de la atención a actualizar
     * @param dto Datos actualizados
     * @return DTO de la atención actualizada
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarAtencion(
            @PathVariable Long id,
            @Valid @RequestBody AtencionClinicaUpdateDTO dto) {

        log.info("🔄 PUT /api/atenciones-clinicas/{}", id);

        try {
            AtencionClinicaResponseDTO atencionActualizada = atencionService.actualizar(id, dto);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", atencionActualizada);
            response.put("message", "Atención clínica actualizada exitosamente");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Error al actualizar atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Atención no encontrada");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error inesperado al actualizar atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al actualizar atención");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 6️⃣ DELETE /api/atenciones-clinicas/{id}
     * Eliminar una atención clínica
     *
     * @param id ID de la atención a eliminar
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarAtencion(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/atenciones-clinicas/{}", id);

        try {
            atencionService.eliminar(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Atención clínica eliminada exitosamente");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Error al eliminar atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Atención no encontrada");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error inesperado al eliminar atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al eliminar atención");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 7️⃣ GET /api/atenciones-clinicas/estadisticas/asegurado/{pkAsegurado}
     * Obtener estadísticas de atenciones de un asegurado
     *
     * @param pkAsegurado ID del asegurado
     * @return Map con estadísticas (total, última atención, etc.)
     */
    @GetMapping("/estadisticas/asegurado/{pkAsegurado}")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasAsegurado(@PathVariable String pkAsegurado) {
        log.info("📊 GET /api/atenciones-clinicas/estadisticas/asegurado/{}", pkAsegurado);

        try {
            Map<String, Object> estadisticas = atencionService.obtenerEstadisticasAsegurado(pkAsegurado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", estadisticas);
            response.put("message", "Estadísticas obtenidas exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas del asegurado {}: {}", pkAsegurado, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener estadísticas");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 8️⃣ GET /api/atenciones-clinicas/{id}/comparativo-signos-vitales
     * Obtener comparación de signos vitales con la atención anterior
     * Permite visualizar tendencias (mejorando/empeorando/estable)
     *
     * @param id ID de la atención actual
     * @return DTO con comparación y tendencias
     */
    @GetMapping("/{id}/comparativo-signos-vitales")
    public ResponseEntity<Map<String, Object>> obtenerComparativoSignosVitales(@PathVariable Long id) {
        log.info("📊 GET /api/atenciones-clinicas/{}/comparativo-signos-vitales", id);

        try {
            com.styp.cenate.dto.SignosVitalesComparativoDTO comparativo = atencionService
                    .obtenerComparativoSignosVitales(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", comparativo);
            response.put("message", "Comparativo de signos vitales obtenido exitosamente");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("❌ Error al obtener comparativo para atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Atención no encontrada");

            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);

        } catch (Exception e) {
            log.error("❌ Error inesperado al obtener comparativo para atención {}: {}", id, e.getMessage());

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
            errorResponse.put("error", e.getMessage());
            errorResponse.put("message", "Error al obtener comparativo de signos vitales");

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
