package com.styp.cenate.api;

import com.styp.cenate.dto.LineamientoRequest;
import com.styp.cenate.dto.LineamientoResponse;
import com.styp.cenate.security.mbac.CheckMBACPermission;
import com.styp.cenate.service.lineamiento.LineamientoService;
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
 * Controlador REST para gestión de Lineamientos
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@RestController
@RequestMapping("/api/lineamientos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LineamientoController {

    private final LineamientoService lineamientoService;

    /**
     * Crear nuevo lineamiento
     * POST /api/lineamientos
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "crear")
    @PostMapping
    public ResponseEntity<Map<String, Object>> crear(@Valid @RequestBody LineamientoRequest request) {
        try {
            log.info("📝 Creando nuevo lineamiento: {}", request.getCodigo());

            LineamientoResponse lineamiento = lineamientoService.crear(request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.CREATED.value());
            response.put("data", lineamiento);
            response.put("message", "Lineamiento creado exitosamente");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("❌ Error al crear lineamiento: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Actualizar lineamiento existente
     * PUT /api/lineamientos/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "editar")
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody LineamientoRequest request) {
        try {
            log.info("✏️ Actualizando lineamiento ID: {}", id);

            LineamientoResponse lineamiento = lineamientoService.actualizar(id, request);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamiento);
            response.put("message", "Lineamiento actualizado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al actualizar lineamiento: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Obtener lineamiento por ID
     * GET /api/lineamientos/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerPorId(@PathVariable Long id) {
        try {
            log.info("🔍 Obteniendo lineamiento ID: {}", id);

            LineamientoResponse lineamiento = lineamientoService.obtenerPorId(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamiento);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener lineamiento: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Obtener lineamiento por código
     * GET /api/lineamientos/codigo/{codigo}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Map<String, Object>> obtenerPorCodigo(@PathVariable String codigo) {
        try {
            log.info("🔍 Obteniendo lineamiento código: {}", codigo);

            LineamientoResponse lineamiento = lineamientoService.obtenerPorCodigo(codigo);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamiento);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al obtener lineamiento: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.NOT_FOUND.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorResponse);
        }
    }

    /**
     * Listar todos los lineamientos con paginación
     * GET /api/lineamientos?page=0&size=10
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("📋 Listando lineamientos - Page: {}, Size: {}", page, size);

            Pageable pageable = PageRequest.of(page, size);
            Page<LineamientoResponse> lineamientos = lineamientoService.listarTodos(pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamientos.getContent());
            response.put("totalElements", lineamientos.getTotalElements());
            response.put("totalPages", lineamientos.getTotalPages());
            response.put("currentPage", page);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al listar lineamientos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Listar lineamientos activos
     * GET /api/lineamientos/activos
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping("/activos")
    public ResponseEntity<Map<String, Object>> listarActivos() {
        try {
            log.info("✅ Listando lineamientos activos");

            List<LineamientoResponse> lineamientos = lineamientoService.listarActivos();

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamientos);
            response.put("total", lineamientos.size());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al listar lineamientos activos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Buscar lineamientos por categoría
     * GET /api/lineamientos/categoria/{categoria}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<Map<String, Object>> buscarPorCategoria(
            @PathVariable String categoria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("🔍 Buscando lineamientos por categoría: {}", categoria);

            Pageable pageable = PageRequest.of(page, size);
            Page<LineamientoResponse> lineamientos = lineamientoService.buscarPorCategoria(categoria, pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamientos.getContent());
            response.put("totalElements", lineamientos.getTotalElements());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al buscar lineamientos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Cambiar estado de lineamiento
     * PATCH /api/lineamientos/{id}/estado
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "editar")
    @PatchMapping("/{id}/estado")
    public ResponseEntity<Map<String, Object>> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        try {
            log.info("🔄 Cambiando estado del lineamiento ID: {} a: {}", id, nuevoEstado);

            LineamientoResponse lineamiento = lineamientoService.cambiarEstado(id, nuevoEstado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("data", lineamiento);
            response.put("message", "Estado actualizado exitosamente");

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
     * Eliminar lineamiento
     * DELETE /api/lineamientos/{id}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "eliminar")
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminar(@PathVariable Long id) {
        try {
            log.info("🗑️ Eliminando lineamiento ID: {}", id);

            lineamientoService.eliminar(id);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("message", "Lineamiento eliminado exitosamente");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al eliminar lineamiento: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Contar lineamientos por estado
     * GET /api/lineamientos/estadisticas/contar/{estado}
     */
    @CheckMBACPermission(pagina = "/modulos/lineamientos", accion = "ver")
    @GetMapping("/estadisticas/contar/{estado}")
    public ResponseEntity<Map<String, Object>> contarPorEstado(@PathVariable String estado) {
        try {
            Long cantidad = lineamientoService.contarPorEstado(estado);

            Map<String, Object> response = new HashMap<>();
            response.put("status", HttpStatus.OK.value());
            response.put("estado", estado);
            response.put("cantidad", cantidad);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("❌ Error al contar lineamientos: {}", e.getMessage());
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("status", HttpStatus.BAD_REQUEST.value());
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}
