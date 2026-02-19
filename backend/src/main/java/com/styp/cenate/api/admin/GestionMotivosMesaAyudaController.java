package com.styp.cenate.api.admin;

import com.styp.cenate.dto.mesaayuda.MotivoMesaAyudaAdminDTO;
import com.styp.cenate.service.mesaayuda.MotivosMesaAyudaAdminService;
import com.styp.cenate.service.mesaayuda.MotivosMesaAyudaAdminService.MotivoMesaAyudaRequest;
import com.styp.cenate.service.mesaayuda.MotivosMesaAyudaAdminService.EstadisticasMotivosDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller REST para Gestión de Motivos de Mesa de Ayuda
 * v1.65.0 - API REST para CRUD de motivos mesa de ayuda
 *
 * Endpoints:
 * - GET    /api/admin/motivos-mesa-ayuda/todos          → Listar todos activos
 * - GET    /api/admin/motivos-mesa-ayuda/{id}           → Obtener por ID
 * - GET    /api/admin/motivos-mesa-ayuda/buscar         → Buscar con filtros
 * - GET    /api/admin/motivos-mesa-ayuda/estadisticas   → Estadísticas
 * - POST   /api/admin/motivos-mesa-ayuda                → Crear nuevo
 * - PUT    /api/admin/motivos-mesa-ayuda/{id}           → Actualizar
 * - PATCH  /api/admin/motivos-mesa-ayuda/{id}/estado    → Cambiar estado
 * - DELETE /api/admin/motivos-mesa-ayuda/{id}           → Eliminar
 */
@RestController
@RequestMapping("/api/admin/motivos-mesa-ayuda")
@RequiredArgsConstructor
@Slf4j
public class GestionMotivosMesaAyudaController {

    private final MotivosMesaAyudaAdminService motivoService;

    @GetMapping("/todos")
    public ResponseEntity<List<MotivoMesaAyudaAdminDTO>> obtenerTodos() {
        log.info("GET /api/admin/motivos-mesa-ayuda/todos");
        return ResponseEntity.ok(motivoService.obtenerTodos());
    }

    @GetMapping("/buscar")
    public ResponseEntity<Page<MotivoMesaAyudaAdminDTO>> buscar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        log.info("GET /api/admin/motivos-mesa-ayuda/buscar - busqueda={}, estado={}", busqueda, estado);
        return ResponseEntity.ok(motivoService.buscar(busqueda, estado, pageable));
    }

    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasMotivosDTO> obtenerEstadisticas() {
        log.info("GET /api/admin/motivos-mesa-ayuda/estadisticas");
        return ResponseEntity.ok(motivoService.obtenerEstadisticas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MotivoMesaAyudaAdminDTO> obtenerPorId(@PathVariable Long id) {
        log.info("GET /api/admin/motivos-mesa-ayuda/{}", id);
        return ResponseEntity.ok(motivoService.obtenerPorId(id));
    }

    @PostMapping
    public ResponseEntity<MotivoMesaAyudaAdminDTO> crear(@RequestBody MotivoMesaAyudaRequest request) {
        log.info("POST /api/admin/motivos-mesa-ayuda - codigo={}", request.codigo());
        return ResponseEntity.ok(motivoService.crear(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MotivoMesaAyudaAdminDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MotivoMesaAyudaRequest request) {
        log.info("PUT /api/admin/motivos-mesa-ayuda/{} - codigo={}", id, request.codigo());
        return ResponseEntity.ok(motivoService.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<MotivoMesaAyudaAdminDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean nuevoEstado) {
        log.info("PATCH /api/admin/motivos-mesa-ayuda/{}/estado - nuevoEstado={}", id, nuevoEstado);
        return ResponseEntity.ok(motivoService.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("DELETE /api/admin/motivos-mesa-ayuda/{}", id);
        motivoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
