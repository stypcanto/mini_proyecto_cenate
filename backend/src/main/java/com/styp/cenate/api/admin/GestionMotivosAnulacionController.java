package com.styp.cenate.api.admin;

import com.styp.cenate.dto.mesaayuda.MotivoAnulacionDTO;
import com.styp.cenate.service.mesaayuda.MotivoAnulacionAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller CRUD para Motivos de Anulación de Citas
 * @version v1.85.27 - 2026-03-06
 */
@RestController
@RequestMapping("/api/admin/motivos-anulacion")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GestionMotivosAnulacionController {

    private final MotivoAnulacionAdminService service;

    @GetMapping("/activos")
    public ResponseEntity<List<MotivoAnulacionDTO>> obtenerActivos() {
        return ResponseEntity.ok(service.obtenerActivos());
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Page<MotivoAnulacionDTO>> buscar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        return ResponseEntity.ok(service.buscar(busqueda, estado, pageable));
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoAnulacionAdminService.EstadisticasDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(service.obtenerEstadisticas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoAnulacionDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoAnulacionDTO> crear(
            @RequestBody MotivoAnulacionAdminService.MotivoRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
        } catch (RuntimeException e) {
            log.warn("Error creando motivo anulación: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoAnulacionDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MotivoAnulacionAdminService.MotivoRequest request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoAnulacionDTO> cambiarEstado(
            @PathVariable Long id,
            @RequestParam Boolean nuevoEstado) {
        return ResponseEntity.ok(service.cambiarEstado(id, nuevoEstado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
