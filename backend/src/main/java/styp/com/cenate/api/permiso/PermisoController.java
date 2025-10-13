package styp.com.cenate.api.permiso;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.model.Permiso;
import styp.com.cenate.service.permiso.PermisoService;

import java.util.List;

@RestController
@RequestMapping("/api/permisos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PermisoController {

    private final PermisoService permisoService;

    @GetMapping("/rol/{idRol}")
    public ResponseEntity<List<Permiso>> listarPorRol(@PathVariable Integer idRol) {
        return ResponseEntity.ok(permisoService.getPermisosByRol(idRol));
    }

    @PostMapping
    public ResponseEntity<Permiso> crear(@RequestBody Permiso permiso) {
        return ResponseEntity.ok(permisoService.createPermiso(permiso));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Permiso> actualizar(@PathVariable Long id, @RequestBody Permiso permiso) {
        return ResponseEntity.ok(permisoService.updatePermiso(id, permiso));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        permisoService.deletePermiso(id);
        return ResponseEntity.noContent().build();
    }
}