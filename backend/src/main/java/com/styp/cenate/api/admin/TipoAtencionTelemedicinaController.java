package com.styp.cenate.api.admin;

import com.styp.cenate.dto.TipoAtencionTelemedicinaDTO;
import com.styp.cenate.service.tipoatencion.ITipoAtencionTelemedicinaService;
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
 * Controller REST para gestionar Tipos de Atención en Telemedicina
 * Base URL: /api/admin/tipos-atencion-telemedicina
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@RestController
@RequestMapping("/api/admin/tipos-atencion-telemedicina")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class TipoAtencionTelemedicinaController {

    private final ITipoAtencionTelemedicinaService service;

    /**
     * Obtiene todos los tipos de atención
     * GET /api/admin/tipos-atencion-telemedicina
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<List<TipoAtencionTelemedicinaDTO>> obtenerTodos() {
        log.info("📋 GET /api/admin/tipos-atencion-telemedicina - Obtener todos");
        List<TipoAtencionTelemedicinaDTO> tipos = service.obtenerTodos();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Obtiene solo los tipos de atención activos (público para dropdowns)
     * GET /api/admin/tipos-atencion-telemedicina/activos
     */
    @GetMapping("/activos")
    public ResponseEntity<List<TipoAtencionTelemedicinaDTO>> obtenerActivos() {
        log.info("📋 GET /api/admin/tipos-atencion-telemedicina/activos - Obtener activos");
        List<TipoAtencionTelemedicinaDTO> tipos = service.obtenerActivos();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Obtiene solo los tipos de atención activos que requieren profesional
     * GET /api/admin/tipos-atencion-telemedicina/activos-con-profesional
     */
    @GetMapping("/activos-con-profesional")
    public ResponseEntity<List<TipoAtencionTelemedicinaDTO>> obtenerActivosConProfesional() {
        log.info("📋 GET /api/admin/tipos-atencion-telemedicina/activos-con-profesional");
        List<TipoAtencionTelemedicinaDTO> tipos = service.obtenerActivosConProfesional();
        return ResponseEntity.ok(tipos);
    }

    /**
     * Obtiene un tipo de atención por ID
     * GET /api/admin/tipos-atencion-telemedicina/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<TipoAtencionTelemedicinaDTO> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 GET /api/admin/tipos-atencion-telemedicina/{}", id);
        TipoAtencionTelemedicinaDTO tipo = service.obtenerPorId(id);
        return ResponseEntity.ok(tipo);
    }

    /**
     * Crea un nuevo tipo de atención
     * POST /api/admin/tipos-atencion-telemedicina
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<TipoAtencionTelemedicinaDTO> crear(
            @Valid @RequestBody TipoAtencionTelemedicinaDTO dto) {
        log.info("➕ POST /api/admin/tipos-atencion-telemedicina - Crear: {}", dto.getDescTipoAtencion());
        TipoAtencionTelemedicinaDTO created = service.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Actualiza un tipo de atención existente
     * PUT /api/admin/tipos-atencion-telemedicina/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<TipoAtencionTelemedicinaDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody TipoAtencionTelemedicinaDTO dto) {
        log.info("✏️ PUT /api/admin/tipos-atencion-telemedicina/{} - Actualizar", id);
        TipoAtencionTelemedicinaDTO updated = service.actualizar(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Elimina un tipo de atención
     * DELETE /api/admin/tipos-atencion-telemedicina/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<Map<String, String>> eliminar(@PathVariable Long id) {
        log.info("🗑️ DELETE /api/admin/tipos-atencion-telemedicina/{}", id);
        service.eliminar(id);
        return ResponseEntity.ok(Map.of("message", "Tipo de atención eliminado exitosamente"));
    }

    /**
     * Activa un tipo de atención
     * PATCH /api/admin/tipos-atencion-telemedicina/{id}/activar
     */
    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<TipoAtencionTelemedicinaDTO> activar(@PathVariable Long id) {
        log.info("✔️ PATCH /api/admin/tipos-atencion-telemedicina/{}/activar", id);
        TipoAtencionTelemedicinaDTO activated = service.activar(id);
        return ResponseEntity.ok(activated);
    }

    /**
     * Inactiva un tipo de atención
     * PATCH /api/admin/tipos-atencion-telemedicina/{id}/inactivar
     */
    @PatchMapping("/{id}/inactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'SUPERADMIN')")
    public ResponseEntity<TipoAtencionTelemedicinaDTO> inactivar(@PathVariable Long id) {
        log.info("❌ PATCH /api/admin/tipos-atencion-telemedicina/{}/inactivar", id);
        TipoAtencionTelemedicinaDTO inactivated = service.inactivar(id);
        return ResponseEntity.ok(inactivated);
    }
}
