package styp.com.cenate.api.usuario;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.service.usuario.UsuarioService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        log.info("Consultando todos los usuarios con roles, permisos y datos personales");
        return ResponseEntity.ok(usuarioService.getAllUsers());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Long id) {
        log.info("Consultando usuario por ID: {}", id);
        return ResponseEntity.ok(usuarioService.getUserById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        log.info("Consultando información del usuario actual: {}", username);
        return ResponseEntity.ok(usuarioService.getUserByUsername(username));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "✅ Usuario eliminado exitosamente");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> activateUser(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.activateUser(id));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> deactivateUser(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.deactivateUser(id));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> unlockUser(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.unlockUser(id));
    }
}
