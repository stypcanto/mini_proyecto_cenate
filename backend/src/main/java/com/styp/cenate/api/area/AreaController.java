package com.styp.cenate.api.area;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.dto.AreaRequest;
import com.styp.cenate.dto.AreaResponse;
import com.styp.cenate.service.area.AreaService;
import com.styp.cenate.security.mbac.CheckMBACPermission;

import java.util.List;

/**
 * 🌐 Controlador REST para la gestión de áreas internas.
 * Endpoint base: /api/admin/areas
 */
@RestController
@RequestMapping("/api/admin/areas")  // ✅ NUEVA RUTA
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
@Data
public class AreaController {

    private final AreaService areaService;

    // ============================================================
    // 🔹 CONSULTAS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<AreaResponse>> getAllAreas() {
        log.info("📋 Consultando todas las áreas registradas...");
        return ResponseEntity.ok(areaService.getAllAreas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<AreaResponse>> getAreasActivas() {
        log.info("📋 Consultando áreas activas...");
        return ResponseEntity.ok(areaService.getAreasActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AreaResponse> getAreaById(@PathVariable Long id) {
        log.info("🔍 Consultando área por ID: {}", id);
        return ResponseEntity.ok(areaService.getAreaById(id));
    }

    // ============================================================
    // 🔹 CREACIÓN
    // ============================================================

    @PostMapping
    @PreAuthorize("hasRole('SUPERADMIN')")
    @CheckMBACPermission(pagina = "/admin/mbac", accion = "crear", mensajeDenegado = "No tiene permiso para crear áreas")
    public ResponseEntity<AreaResponse> createArea(@RequestBody AreaRequest request) {
        log.info("Creando nueva área: {} (estado={})", request.getDescArea(), request.getStatArea());
        AreaResponse nuevaArea = areaService.createArea(request.getDescArea(), request.getStatArea());
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaArea);
    }

    // ============================================================
    // 🔹 ACTUALIZACIÓN
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @CheckMBACPermission(pagina = "/admin/mbac", accion = "editar", mensajeDenegado = "No tiene permiso para editar áreas")
    public ResponseEntity<AreaResponse> updateArea(@PathVariable Long id, @RequestBody AreaRequest request) {
        log.info("Actualizando área (ID: {}) -> Nueva descripción: '{}', Estado: {}", id, request.getDescArea(), request.getStatArea());
        AreaResponse actualizada = areaService.updateArea(id, request.getDescArea(), request.getStatArea());
        return ResponseEntity.ok(actualizada);
    }

    // ============================================================
    // 🔹 ELIMINACIÓN
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    @CheckMBACPermission(pagina = "/admin/mbac", accion = "eliminar", mensajeDenegado = "No tiene permiso para eliminar áreas")
    public ResponseEntity<Void> deleteArea(@PathVariable Long id) {
        log.warn("Eliminando área con ID: {}", id);
        areaService.deleteArea(id);
        return ResponseEntity.noContent().build();
    }
}
