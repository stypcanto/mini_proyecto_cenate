package styp.com.cenate.api;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.service.UsuarioService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173", "http://10.0.89.13:3000", "http://10.0.89.13:5173"})
public class UsuarioController {
    
    private final UsuarioService usuarioService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        log.info("Consultando todos los usuarios");
        List<UsuarioResponse> users = usuarioService.getAllUsers();
        return ResponseEntity.ok(users);
    }
    
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Integer id) {
        log.info("Consultando usuario por ID: {}", id);
        UsuarioResponse user = usuarioService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getCurrentUser(Authentication authentication) {
        log.info("Consultando información del usuario actual");
        String username = authentication.getName();
        UsuarioResponse user = usuarioService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable Integer id) {
        log.info("Eliminando usuario con ID: {}", id);
        usuarioService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Usuario eliminado exitosamente");
        return ResponseEntity.ok(response);
    }
    
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> activateUser(@PathVariable Integer id) {
        log.info("Activando usuario con ID: {}", id);
        UsuarioResponse user = usuarioService.activateUser(id);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> deactivateUser(@PathVariable Integer id) {
        log.info("Desactivando usuario con ID: {}", id);
        UsuarioResponse user = usuarioService.deactivateUser(id);
        return ResponseEntity.ok(user);
    }
    
    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> unlockUser(@PathVariable Integer id) {
        log.info("Desbloqueando usuario con ID: {}", id);
        UsuarioResponse user = usuarioService.unlockUser(id);
        return ResponseEntity.ok(user);
    }
}
