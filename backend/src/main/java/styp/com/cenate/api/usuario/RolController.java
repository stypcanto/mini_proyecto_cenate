package styp.com.cenate.api.usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.model.Rol;
import styp.com.cenate.repository.RolRepository;

import java.util.List;

@RestController
@RequestMapping("/api/admin/roles")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class RolController {

    private final RolRepository rolRepository;

    // =====================================================
    // 🔹 OBTENER TODOS LOS ROLES
    // =====================================================
    @GetMapping
    public ResponseEntity<List<Rol>> obtenerTodosLosRoles() {
        try {
            List<Rol> roles = rolRepository.findAll();
            return ResponseEntity.ok(roles);
        } catch (Exception e) {
            log.error("❌ Error al obtener roles: {}", e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // 🔹 OBTENER ROL POR ID
    // =====================================================
    @GetMapping("/{id}")
    public ResponseEntity<Rol> obtenerRolPorId(@PathVariable Integer id) {
        try {
            return rolRepository.findById(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("❌ Error al obtener rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    // =====================================================
    // 🔹 CREAR NUEVO ROL
    // =====================================================
    @PostMapping
    public ResponseEntity<?> crearRol(@RequestBody Rol rol) {
        try {
            if (rolRepository.existsByDescRol(rol.getDescRol())) {
                return ResponseEntity.badRequest()
                        .body("⚠️ Ya existe un rol con ese nombre");
            }

            Rol nuevoRol = rolRepository.save(rol);
            log.info("✅ Rol creado exitosamente: {}", nuevoRol.getDescRol());
            return ResponseEntity.ok(nuevoRol);
        } catch (Exception e) {
            log.error("💥 Error al crear rol: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error al crear el rol");
        }
    }

    // =====================================================
    // 🔹 ACTUALIZAR ROL EXISTENTE
    // =====================================================
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizarRol(@PathVariable Integer id, @RequestBody Rol rolActualizado) {
        try {
            return rolRepository.findById(id)
                    .map(rol -> {
                        rol.setDescRol(rolActualizado.getDescRol());
                        if (rolActualizado.getPermisos() != null) {
                            rol.setPermisos(rolActualizado.getPermisos());
                        }
                        Rol rolGuardado = rolRepository.save(rol);
                        log.info("✏️ Rol actualizado: {}", rolGuardado.getDescRol());
                        return ResponseEntity.ok(rolGuardado);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("💥 Error al actualizar rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error al actualizar el rol");
        }
    }

    // =====================================================
    // 🔹 ELIMINAR ROL
    // =====================================================
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarRol(@PathVariable Integer id) {
        try {
            if (!rolRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            Rol rol = rolRepository.findById(id).orElse(null);
            if (rol != null && rol.getUsuarios() != null && !rol.getUsuarios().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body("🚫 No se puede eliminar el rol porque tiene usuarios asignados");
            }

            rolRepository.deleteById(id);
            log.info("🗑️ Rol eliminado: ID {}", id);
            return ResponseEntity.ok("Rol eliminado exitosamente");
        } catch (Exception e) {
            log.error("💥 Error al eliminar rol {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body("Error al eliminar el rol");
        }
    }
}