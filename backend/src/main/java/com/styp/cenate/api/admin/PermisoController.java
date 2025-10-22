package com.styp.cenate.api.admin;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.dto.mbac.PermisoUsuarioResponseDTO;
import com.styp.cenate.model.Permiso;
import com.styp.cenate.service.permiso.PermisoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 🎯 Controlador REST – Gestión de permisos MBAC/RBAC en el sistema CENATE
 * ------------------------------------------------------------------------
 * Incluye:
 *  - Consultar permisos por usuario (username)
 *  - Consultar permisos por rol
 *  - Actualizar campos específicos de permisos
 */
@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class PermisoController {

    private final PermisoService permisoService;

    // ============================================================
    // 🔹 Obtener permisos por USERNAME (para el frontend actual)
    // ============================================================
    @GetMapping("/usuario/{username}")
    public ResponseEntity<List<PermisoUsuarioResponseDTO>> getPermisosPorUsuario(
            @PathVariable String username) {
        log.info("🔎 Consultando permisos del usuario '{}'", username);
        List<PermisoUsuarioResponseDTO> permisos = permisoService.obtenerPermisosPorUsername(username);
        return ResponseEntity.ok(permisos);
    }

    // ============================================================
    // 🧩 Obtener permisos por Rol
    // ============================================================
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

    // ============================================================
    // ✏️ Actualizar campos específicos de un permiso
    // ============================================================
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
