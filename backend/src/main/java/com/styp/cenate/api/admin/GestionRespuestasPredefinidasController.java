package com.styp.cenate.api.admin;

import com.styp.cenate.dto.mesaayuda.RespuestaPredefinidaAdminDTO;
import com.styp.cenate.service.mesaayuda.RespuestasPredefinidasAdminService;
import com.styp.cenate.service.mesaayuda.RespuestasPredefinidasAdminService.RespuestaPredefinidaRequest;
import com.styp.cenate.service.mesaayuda.RespuestasPredefinidasAdminService.EstadisticasRespuestasDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para Gestión de Respuestas Predefinidas de Mesa de Ayuda
 * v1.65.10 - API REST para CRUD de respuestas predefinidas
 *
 * Endpoints:
 * - GET    /api/admin/respuestas-mesa-ayuda/todos          → Listar todos activos
 * - GET    /api/admin/respuestas-mesa-ayuda/{id}           → Obtener por ID
 * - GET    /api/admin/respuestas-mesa-ayuda/buscar         → Buscar con filtros
 * - GET    /api/admin/respuestas-mesa-ayuda/estadisticas   → Estadísticas
 * - POST   /api/admin/respuestas-mesa-ayuda                → Crear nuevo
 * - PUT    /api/admin/respuestas-mesa-ayuda/{id}           → Actualizar
 * - PATCH  /api/admin/respuestas-mesa-ayuda/{id}/estado    → Cambiar estado
 * - DELETE /api/admin/respuestas-mesa-ayuda/{id}           → Eliminar
 */
@RestController
@RequestMapping("/api/admin/respuestas-mesa-ayuda")
@RequiredArgsConstructor
@Slf4j
public class GestionRespuestasPredefinidasController {

    private final RespuestasPredefinidasAdminService respuestaService;

    @GetMapping("/todos")
    public ResponseEntity<List<RespuestaPredefinidaAdminDTO>> obtenerTodos() {
        log.info("GET /api/admin/respuestas-mesa-ayuda/todos");
        return ResponseEntity.ok(respuestaService.obtenerTodos());
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<RespuestaPredefinidaAdminDTO>> buscar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        log.info("GET /api/admin/respuestas-mesa-ayuda/buscar - busqueda={}, estado={}", busqueda, estado);
        return ResponseEntity.ok(respuestaService.buscar(busqueda, estado, pageable));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasRespuestasDTO> obtenerEstadisticas() {
        log.info("GET /api/admin/respuestas-mesa-ayuda/estadisticas");
        return ResponseEntity.ok(respuestaService.obtenerEstadisticas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<RespuestaPredefinidaAdminDTO> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/admin/respuestas-mesa-ayuda/{}", id);
        return ResponseEntity.ok(respuestaService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<RespuestaPredefinidaAdminDTO> crear(@RequestBody RespuestaPredefinidaRequest request) {
        log.info("POST /api/admin/respuestas-mesa-ayuda - codigo={}", request.codigo());
        return ResponseEntity.ok(respuestaService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RespuestaPredefinidaAdminDTO> actualizar(
            @PathVariable Long id,
            @RequestBody RespuestaPredefinidaRequest request) {
        log.info("PUT /api/admin/respuestas-mesa-ayuda/{} - codigo={}", id, request.codigo());
        return ResponseEntity.ok(respuestaService.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<RespuestaPredefinidaAdminDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean nuevoEstado) {
        log.info("PATCH /api/admin/respuestas-mesa-ayuda/{}/estado - nuevoEstado={}", id, nuevoEstado);
        return ResponseEntity.ok(respuestaService.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("DELETE /api/admin/respuestas-mesa-ayuda/{}", id);
        respuestaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
