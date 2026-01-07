package com.styp.cenate.api;

import com.styp.cenate.dto.InformacionIpressRequest;
import com.styp.cenate.dto.InformacionIpressResponse;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.lineamiento.InformacionIpressService;
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
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para gestión de Información IPRESS
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@RestController
@RequestMapping("/api/informacion-ipress")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class InformacionIpressController {

    private final InformacionIpressService informacionIpressService;

    /**
     * Crear nueva información IPRESS
     * POST /api/informacion-ipress
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "crear")
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@Valid @RequestBody InformacionIpressRequest request) {
        try {
            log.info("📝 Creando información IPRESS - Lineamiento: {}, IPRESS: {}",
                    request.getIdLineamiento(), request.getIdIpress());

            InformacionIpressResponse informacion = informacionIpressService.crear(request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.CREATED.value());
            response.put("data", informacion);
            response.put("message", "Información IPRESS creada exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("❌ Error al crear información IPRESS: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Actualizar información IPRESS
     * PUT /api/informacion-ipress/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "editar")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody InformacionIpressRequest request) {
        try {
            log.info("✏️ Actualizando información IPRESS ID: {}", id);

            InformacionIpressResponse informacion = informacionIpressService.actualizar(id, request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informacion);
            response.put("message", "Información IPRESS actualizada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al actualizar información IPRESS: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener información IPRESS por ID
     * GET /api/informacion-ipress/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Long id) {
        try {
            log.info("🔍 Obteniendo información IPRESS ID: {}", id);

            InformacionIpressResponse informacion = informacionIpressService.obtenerPorId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informacion);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener información IPRESS: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtener informaciones por lineamiento
     * GET /api/informacion-ipress/lineamiento/{idLineamiento}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping("/lineamiento/{idLineamiento}")
    public ResponseEntity<Map<String, Object>> obtenerPorLineamiento(@PathVariable Long idLineamiento) {
        try {
            log.info("🔍 Obteniendo informaciones del lineamiento ID: {}", idLineamiento);

            List<InformacionIpressResponse> informaciones = informacionIpressService.obtenerPorLineamiento(idLineamiento);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informaciones);
            response.put("total", informaciones.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener informaciones: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener informaciones por IPRESS
     * GET /api/informacion-ipress/ipress/{idIpress}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping("/ipress/{idIpress}")
    public ResponseEntity<Map<String, Object>> obtenerPorIpress(@PathVariable Long idIpress) {
        try {
            log.info("🔍 Obteniendo informaciones de la IPRESS ID: {}", idIpress);

            List<InformacionIpressResponse> informaciones = informacionIpressService.obtenerPorIpress(idIpress);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informaciones);
            response.put("total", informaciones.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener informaciones: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Listar todas con paginación
     * GET /api/informacion-ipress?page=0&size=10
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarTodas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📋 Listando informaciones IPRESS - Page: {}, Size: {}", page, size);

            Pageable pageable = PageRequest.of(page, size);
            Page<InformacionIpressResponse> informaciones = informacionIpressService.listarTodas(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informaciones.getContent());
            response.put("totalElements", informaciones.getTotalElements());
            response.put("totalPages", informaciones.getTotalPages());
            response.put("currentPage", page);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al listar informaciones: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Cambiar estado de cumplimiento
     * PATCH /api/informacion-ipress/{id}/cumplimiento
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "editar")
    @PatchMapping("/{id}/cumplimiento")
    public ResponseEntity<Map<String, Object>> cambiarEstadoCumplimiento(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        try {
            log.info("🔄 Cambiando estado de cumplimiento ID: {} a: {}", id, nuevoEstado);

            InformacionIpressResponse informacion = informacionIpressService.cambiarEstadoCumplimiento(id, nuevoEstado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", informacion);
            response.put("message", "Estado de cumplimiento actualizado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al cambiar estado: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Eliminar información IPRESS
     * DELETE /api/informacion-ipress/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "eliminar")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        try {
            log.info("🗑️ Eliminando información IPRESS ID: {}", id);

            informacionIpressService.eliminar(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Información IPRESS eliminada exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al eliminar información: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Estadísticas - Contar informaciones que cumplen
     * GET /api/informacion-ipress/estadisticas/cumple
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping("/estadisticas/cumple")
    public ResponseEntity<Map<String, Object>> contarCumple() {
        try {
            Long cantidad = informacionIpressService.contarCumple();

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("cumpleCount", cantidad);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al contar cumplimientos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Estadísticas - Contar informaciones de una IPRESS que cumplen
     * GET /api/informacion-ipress/estadisticas/cumple/{idIpress}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos/informacion-ipress", accion = "ver")
    @GetMapping("/estadisticas/cumple/{idIpress}")
    public ResponseEntity<Map<String, Object>> contarCumpleByIpress(@PathVariable Long idIpress) {
        try {
            Long cantidad = informacionIpressService.contarCumpleByIpress(idIpress);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("idIpress", idIpress);
            response.put("cumpleCount", cantidad);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al contar cumplimientos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
