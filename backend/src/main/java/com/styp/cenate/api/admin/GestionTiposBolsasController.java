package com.styp.cenate.api.admin;

import com.styp.cenate.dto.TipoBolsaResponse;
import com.styp.cenate.service.tipos_bolsas.TipoBolsaService;
import com.styp.cenate.service.tipos_bolsas.TipoBolsaService.TipoBolsaRequest;
import com.styp.cenate.service.tipos_bolsas.TipoBolsaService.EstadisticasTiposBolsasDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 📋 Controller REST para Gestión de Tipos de Bolsas
 * Endpoints para CRUD y administración de tipos de bolsas
 */
@RestController
@RequestMapping("/tipos-bolsas")
@RequiredArgsConstructor
@Slf4j
public class GestionTiposBolsasController {

    private final TipoBolsaService tipoBolsaService;

    /**
     * Obtiene todos los tipos de bolsas activos
     * GET /api/admin/tipos-bolsas/todos
     */
    @GetMapping("/todos")
    public ResponseEntity<List<TipoBolsaResponse>> obtenerTodosTiposBolsas() {
        log.info("📋 GET /api/admin/tipos-bolsas/todos");
        return ResponseEntity.ok(tipoBolsaService.obtenerTodosTiposBolsasActivos());
    }

    /**
     * Obtiene un tipo de bolsa por ID
     * GET /api/admin/tipos-bolsas/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TipoBolsaResponse> obtenerTipoBolsaPorId(@PathVariable Long id) {
        log.info("🔍 GET /api/admin/tipos-bolsas/{}", id);
        return ResponseEntity.ok(tipoBolsaService.obtenerTipoBolsaPorId(id));
    }

    /**
     * Búsqueda paginada de tipos de bolsas
     * GET /api/admin/tipos-bolsas/buscar?busqueda=...&estado=...
     */
    @GetMapping("/buscar")
    public ResponseEntity<Page<TipoBolsaResponse>> buscarTiposBolsas(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        log.info("🔎 GET /api/admin/tipos-bolsas/buscar - busqueda={}, estado={}", busqueda, estado);
        return ResponseEntity.ok(tipoBolsaService.buscarTiposBolsas(busqueda, estado, pageable));
    }

    /**
     * Obtiene estadísticas de tipos de bolsas
     * GET /api/admin/tipos-bolsas/estadisticas
     */
    @GetMapping("/estadisticas")
    public ResponseEntity<EstadisticasTiposBolsasDTO> obtenerEstadisticas() {
        log.info("📊 GET /api/admin/tipos-bolsas/estadisticas");
        return ResponseEntity.ok(tipoBolsaService.obtenerEstadisticas());
    }

    /**
     * Crea un nuevo tipo de bolsa
     * POST /api/admin/tipos-bolsas
     */
    @PostMapping
    public ResponseEntity<TipoBolsaResponse> crearTipoBolsa(@RequestBody TipoBolsaRequest request) {
        log.info("✏️ POST /api/admin/tipos-bolsas - codigo={}", request.codTipoBolsa());
        return ResponseEntity.ok(tipoBolsaService.crearTipoBolsa(request));
    }

    /**
     * Actualiza un tipo de bolsa existente
     * PUT /api/admin/tipos-bolsas/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<TipoBolsaResponse> actualizarTipoBolsa(
            @PathVariable Long id,
            @RequestBody TipoBolsaRequest request) {
        log.info("✏️ PUT /api/admin/tipos-bolsas/{} - codigo={}", id, request.codTipoBolsa());
        return ResponseEntity.ok(tipoBolsaService.actualizarTipoBolsa(id, request));
    }

    /**
     * Cambia el estado de un tipo de bolsa
     * PATCH /api/admin/tipos-bolsas/{id}/estado
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<TipoBolsaResponse> cambiarEstado(
            @PathVariable Long id,
            @RequestParam String nuevoEstado) {
        log.info("🔄 PATCH /api/admin/tipos-bolsas/{}/estado - nuevoEstado={}", id, nuevoEstado);
        return ResponseEntity.ok(tipoBolsaService.cambiarEstadoTipoBolsa(id, nuevoEstado));
    }

    /**
     * Elimina (inactiva) un tipo de bolsa
     * DELETE /api/admin/tipos-bolsas/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarTipoBolsa(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/admin/tipos-bolsas/{}", id);
        tipoBolsaService.eliminarTipoBolsa(id);
        return ResponseEntity.noContent().build();
    }
}
