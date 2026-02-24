package com.styp.cenate.api.admin;

import com.styp.cenate.dto.bolsas.MotivoInterconsultaDTO;
import com.styp.cenate.service.bolsas.MotivoInterconsultaAdminService;
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
 * Controller CRUD para Motivos de Interconsulta
 * Solo accesible por SUPERADMIN
 *
 * @version v1.0.0 - 2026-02-23
 */
@RestController
@RequestMapping("/api/admin/motivos-interconsulta")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class GestionMotivosInterconsultaController {

    private final MotivoInterconsultaAdminService service;

    @GetMapping("/todos")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<List<MotivoInterconsultaDTO>> obtenerTodos() {
        return ResponseEntity.ok(service.obtenerTodos());
    }

    @GetMapping("/buscar")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Page<MotivoInterconsultaDTO>> buscar(
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String estado,
            Pageable pageable) {
        return ResponseEntity.ok(service.buscar(busqueda, estado, pageable));
    }

    @GetMapping("/estadisticas")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoInterconsultaAdminService.EstadisticasDTO> obtenerEstadisticas() {
        return ResponseEntity.ok(service.obtenerEstadisticas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoInterconsultaDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoInterconsultaDTO> crear(
            @RequestBody MotivoInterconsultaAdminService.MotivoRequest request) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(service.crear(request));
        } catch (RuntimeException e) {
            log.warn("Error creando motivo: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoInterconsultaDTO> actualizar(
            @PathVariable Long id,
            @RequestBody MotivoInterconsultaAdminService.MotivoRequest request) {
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<MotivoInterconsultaDTO> cambiarEstado(
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
