package com.styp.cenate.api.admin;

import com.styp.cenate.dto.EstrategiaInstitucionalDTO;
import com.styp.cenate.service.estrategia.IEstrategiaInstitucionalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para gestionar Estrategias Institucionales
 * Base URL: /api/admin/estrategias-institucionales
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@RestController
@RequestMapping("/api/admin/estrategias-institucionales")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class EstrategiaInstitucionalController {

    private final IEstrategiaInstitucionalService service;

    /**
     * Obtiene todas las estrategias institucionales
     * GET /api/admin/estrategias-institucionales
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<EstrategiaInstitucionalDTO>> obtenerTodas() {
        log.info("📋 GET /api/admin/estrategias-institucionales - Obtener todas");
        List<EstrategiaInstitucionalDTO> estrategias = service.obtenerTodas();
        return ResponseEntity.ok(estrategias);
    }

    /**
     * Obtiene solo las estrategias activas (público para dropdowns)
     * GET /api/admin/estrategias-institucionales/activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<EstrategiaInstitucionalDTO>> obtenerActivas() {
        log.info("📋 GET /api/admin/estrategias-institucionales/activas - Obtener activas");
        List<EstrategiaInstitucionalDTO> estrategias = service.obtenerActivas();
        return ResponseEntity.ok(estrategias);
    }

    /**
     * Obtiene una estrategia por ID
     * GET /api/admin/estrategias-institucionales/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<EstrategiaInstitucionalDTO> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 GET /api/admin/estrategias-institucionales/{}", id);
        EstrategiaInstitucionalDTO estrategia = service.obtenerPorId(id);
        return ResponseEntity.ok(estrategia);
    }

    /**
     * Crea una nueva estrategia institucional
     * POST /api/admin/estrategias-institucionales
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<EstrategiaInstitucionalDTO> crear(
            @Valid @RequestBody EstrategiaInstitucionalDTO dto) {
        log.info("➕ POST /api/admin/estrategias-institucionales - Crear: {}", dto.getDescEstrategia());
        EstrategiaInstitucionalDTO created = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Actualiza una estrategia existente
     * PUT /api/admin/estrategias-institucionales/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<EstrategiaInstitucionalDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody EstrategiaInstitucionalDTO dto) {
        log.info("✏️ PUT /api/admin/estrategias-institucionales/{} - Actualizar", id);
        EstrategiaInstitucionalDTO updated = service.actualizar(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Elimina una estrategia
     * DELETE /api/admin/estrategias-institucionales/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/admin/estrategias-institucionales/{}", id);
        service.eliminar(id);
        return ResponseEntity.ok(Map.of("message", "Estrategia eliminada exitosamente"));
    }

    /**
     * Activa una estrategia
     * PATCH /api/admin/estrategias-institucionales/{id}/activar
     */
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<EstrategiaInstitucionalDTO> activar(@PathVariable Long id) {
        log.info("✔️ PATCH /api/admin/estrategias-institucionales/{}/activar", id);
        EstrategiaInstitucionalDTO activated = service.activar(id);
        return ResponseEntity.ok(activated);
    }

    /**
     * Inactiva una estrategia
     * PATCH /api/admin/estrategias-institucionales/{id}/inactivar
     */
    @PatchMapping("/{id}/inactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<EstrategiaInstitucionalDTO> inactivar(@PathVariable Long id) {
        log.info("❌ PATCH /api/admin/estrategias-institucionales/{}/inactivar", id);
        EstrategiaInstitucionalDTO inactivated = service.inactivar(id);
        return ResponseEntity.ok(inactivated);
    }
}
