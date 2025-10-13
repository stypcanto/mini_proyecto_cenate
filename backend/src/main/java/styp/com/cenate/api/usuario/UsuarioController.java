package styp.com.cenate.api.usuario;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.dto.UsuarioUpdateRequest;
import styp.com.cenate.service.usuario.UsuarioService;

import java.util.List;
import java.util.Map;

/**
 * 🎯 Controlador para la gestión interna de usuarios.
 * Los usuarios solo pueden ser creados a través de solicitudes (AccountRequest).
 * Este controlador se usa por administradores para gestionar cuentas existentes.
 */
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

    // ============================================================
    // 📋 CONSULTAS GENERALES
    // ============================================================

    /** Obtener todos los usuarios */
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> getAllUsers() {
        log.info("📋 Consultando todos los usuarios registrados");
        return ResponseEntity.ok(usuarioService.getAllUsers());
    }

    /** Obtener un usuario por ID */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> getUserById(@PathVariable Long id) {
        log.info("🔎 Consultando usuario por ID: {}", id);
        return ResponseEntity.ok(usuarioService.getUserById(id));
    }

    /** Obtener el usuario autenticado actual */
    @GetMapping("/me")
    public ResponseEntity<UsuarioResponse> getCurrentUser(Authentication authentication) {
        String username = authentication.getName();
        log.info("👤 Consultando información del usuario autenticado: {}", username);
        return ResponseEntity.ok(usuarioService.getUserByUsername(username));
    }

    // ============================================================
    // 🧭 CONSULTAS POR TIPO DE USUARIO
    // ============================================================

    /**
     * 🌐 Obtener usuarios EXTERNOS (INSTITUCION_EX, ASEGURADORA, REGULADOR)
     */
    @GetMapping("/externos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> getExternalUsers() {
        log.info("🌍 Consultando usuarios EXTERNOS (INSTITUCION_EX, ASEGURADORA, REGULADOR)");
        return ResponseEntity.ok(
                usuarioService.getUsuariosByRoles(List.of("INSTITUCION_EX", "ASEGURADORA", "REGULADOR"))
        );
    }

    /**
     * 🏥 Obtener usuarios INTERNOS (personal de CENATE, médicos, coordinadores, etc.)
     */
    @GetMapping("/internos")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> getInternalUsers() {
        log.info("🏥 Consultando usuarios INTERNOS (excluyendo externos)");
        return ResponseEntity.ok(
                usuarioService.getUsuariosExcluyendoRoles(List.of("INSTITUCION_EX", "ASEGURADORA", "REGULADOR"))
        );
    }

    // ============================================================
    // ⚙️ GESTIÓN ADMINISTRATIVA
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UsuarioUpdateRequest request
    ) {
        log.info("✏️ Actualizando usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.updateUser(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long id) {
        usuarioService.deleteUser(id);
        return ResponseEntity.ok(Map.of("message", "✅ Usuario eliminado exitosamente"));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> activateUser(@PathVariable Long id) {
        log.info("🟢 Activando usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.activateUser(id));
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> deactivateUser(@PathVariable Long id) {
        log.info("🔴 Desactivando usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.deactivateUser(id));
    }

    @PutMapping("/{id}/unlock")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> unlockUser(@PathVariable Long id) {
        log.info("🔓 Desbloqueando usuario con ID: {}", id);
        return ResponseEntity.ok(usuarioService.unlockUser(id));
    }

    // ============================================================
    // 🔍 CONSULTA DETALLADA
    // ============================================================
    @GetMapping("/detalle/{username}")
    @PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
    public ResponseEntity<?> obtenerDetalleUsuario(@PathVariable String username) {
        try {
            log.info("🔍 Consultando detalle extendido del usuario: {}", username);
            List<Map<String, Object>> result = usuarioService.obtenerDetalleUsuario(username);
            if (result.isEmpty()) {
                return ResponseEntity.status(404).body(Map.of("message", "Usuario no encontrado"));
            }
            return ResponseEntity.ok(result.get(0));
        } catch (Exception e) {
            log.error("❌ Error al obtener detalle del usuario {}: {}", username, e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor", "error", e.getMessage()));
        }
    }

    // ============================================================
    // 🚫 CREACIÓN DIRECTA BLOQUEADA
    // ============================================================
    @PostMapping
    public ResponseEntity<Map<String, String>> createUserDisabled() {
        return ResponseEntity.status(403)
                .body(Map.of("message",
                        "❌ La creación directa de usuarios está deshabilitada. " +
                                "Las cuentas deben ser aprobadas por el SUPERADMIN mediante solicitud."));
    }
}