package com.styp.cenate.api.admin;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.ProcedimientoResponse;
import com.styp.cenate.service.proced.ProcedimientoService;

import java.util.List;

/**
 * Controlador REST para gestionar Procedimientos CPT.
 * Replaces ProcedimientoAdminController. Uses Service returning DTOs.
 */
@RestController
@RequestMapping("/api/admin/procedimientos")
@Slf4j
public class GestionProcedimientosController {

    private final ProcedimientoService service;

    public GestionProcedimientosController(ProcedimientoService service) {
        this.service = service;
        System.out.println(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION PROCEDIMIENTOS CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
        log.info(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>> GESTION PROCEDIMIENTOS CONTROLLER LOADED (FULL DEPS) <<<<<<<<<<<<<<<<<<<<<<<<<<<<");
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<ProcedimientoResponse>> listar() {
        log.info("📋 Listando todos los procedimientos");
        List<ProcedimientoResponse> lista = service.listar();
        log.info("📋 Controller encontró {} registros", lista.size());
        return ResponseEntity.ok(lista);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<ProcedimientoResponse> obtenerPorId(@PathVariable Long id) {
        log.info("🔍 Obteniendo procedimiento ID: {}", id);
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<ProcedimientoResponse> crear(@RequestBody ProcedimientoResponse request) {
        log.info("➕ Creando procedimiento: {}", request.getCodProced());
        return ResponseEntity.ok(service.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<ProcedimientoResponse> actualizar(@PathVariable Long id,
            @RequestBody ProcedimientoResponse request) {
        log.info("✏️ Actualizando procedimiento ID: {}", id);
        return ResponseEntity.ok(service.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        log.info("🗑️ Eliminando procedimiento ID: {}", id);
        service.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
