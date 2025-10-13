package styp.com.cenate.api.permiso;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.service.permiso.PermisoService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/permisos")
@RequiredArgsConstructor
@Slf4j
public class PermisoController {

    private final PermisoService permisoService;

    // 🔹 Obtener permisos por Rol
    @GetMapping("/rol/{idRol}")
    public ResponseEntity<List<Permiso>> getPermisosByRol(@PathVariable Integer idRol) {
        log.info("📜 Listando permisos del rol ID: {}", idRol);
        return ResponseEntity.ok(permisoService.getPermisosByRol(idRol));
    }

    // 🔹 Actualizar permiso (ej. cambiar puedeVer, puedeCrear, etc.)
    @PutMapping("/{id}")
    public ResponseEntity<Permiso> updatePermiso(
            @PathVariable Long id,
            @RequestBody Map<String, Object> cambios) {

        log.info("✏️ Actualizando permiso ID {} con datos: {}", id, cambios);
        return ResponseEntity.ok(permisoService.updateCamposPermiso(id, cambios));
    }
}