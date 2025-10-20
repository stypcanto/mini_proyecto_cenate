package com.styp.cenate.api.admin;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.service.permiso.PermisoService;

import java.util.List;
import java.util.Map;

/**
 * 🎯 Controlador REST para la administración de permisos del sistema.
 * Gestiona la tabla {@code dim_permisos} desde roles con privilegios elevados (SUPERADMIN, ADMIN).
 *
 * Endpoints principales:
 *  - GET /api/admin/permisos → Lista todos los permisos.
 *  - GET /api/admin/permisos/rol/{idRol} → Lista permisos por rol.
 *  - PUT /api/admin/permisos/{id} → Actualiza permisos específicos (por campos).
 *
 * @author CENATE
 */
@RestController
@RequestMapping("/api/admin/permisos")
@RequiredArgsConstructor
@Slf4j
public class PermisoController {

    private final PermisoService permisoService;

    // ===========================================================
    // 📋 Obtener todos los permisos
    // ===========================================================
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<Permiso>> getAllPermisos() {
        log.info("📋 Solicitando todos los permisos del sistema (admin)");

        List<Permiso> permisos = permisoService.getAllPermisos();

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos registrados en el sistema.");
            return ResponseEntity.noContent().build();
        }

        log.info("✅ {} permisos encontrados.", permisos.size());
        return ResponseEntity.ok(permisos);
    }

    // ===========================================================
    // 🧩 Obtener permisos por Rol
    // ===========================================================
    @GetMapping("/rol/{idRol}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<Permiso>> getPermisosByRol(@PathVariable Integer idRol) {
        log.info("📜 Solicitando permisos del rol con ID: {}", idRol);

        List<Permiso> permisos = permisoService.getPermisosByRol(idRol);

        if (permisos.isEmpty()) {
            log.warn("⚠️ No se encontraron permisos para el rol ID: {}", idRol);
            return ResponseEntity.noContent().build();
        }

        log.info("✅ {} permisos encontrados para el rol ID: {}", permisos.size(), idRol);
        return ResponseEntity.ok(permisos);
    }

    // ===========================================================
    // ✏️ Actualizar campos específicos de un permiso
    // ===========================================================
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<Permiso> updatePermiso(
            @PathVariable Long id,
            @RequestBody Map<String, Object> cambios) {

        log.info("✏️ Actualizando permiso ID {} con cambios: {}", id, cambios);

        try {
            Permiso actualizado = permisoService.updateCamposPermiso(id, cambios);
            log.info("✅ Permiso ID {} actualizado correctamente.", id);
            return ResponseEntity.ok(actualizado);
        } catch (IllegalArgumentException e) {
            log.warn("⚠️ Permiso no encontrado: {}", id);
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("❌ Error al actualizar permiso ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}