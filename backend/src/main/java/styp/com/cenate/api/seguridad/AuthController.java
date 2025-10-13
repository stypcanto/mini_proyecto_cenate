package styp.com.cenate.api.seguridad;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.*;
import styp.com.cenate.service.auth.AuthenticationService;
import styp.com.cenate.service.auditlog.AuditLogService;
import styp.com.cenate.repository.UsuarioRepository;

import java.util.*;

/**
 * 🌐 Controlador para autenticación, solicitudes de cuenta y gestión de contraseñas.
 * Todo el flujo está auditado y preparado para entorno institucional.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class AuthController {

    private final AuthenticationService authenticationService;
    private final AuditLogService auditLogService;
    private final UsuarioRepository usuarioRepository;

    // ======================================================
    // ✅ LOGIN
    // ======================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("🔑 Intento de login para usuario: {}", request.getUsername());
            LoginResponse response = authenticationService.login(request);

            if (response == null) {
                log.warn("⚠️ Login fallido (respuesta nula) para usuario {}", request.getUsername());
                auditLogService.registrarError("LOGIN_FAILED", "AUTH", "Login fallido: respuesta nula", httpRequest);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Credenciales inválidas o cuenta pendiente de aprobación."));
            }

            auditLogService.registrarLogin(request.getUsername(), httpRequest);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("🚫 Credenciales incorrectas para usuario: {}", request.getUsername());
            auditLogService.registrarError("LOGIN_FAILED", "AUTH", "Credenciales incorrectas", httpRequest);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuario o contraseña incorrectos."));

        } catch (RuntimeException e) {
            log.warn("⚠️ Error controlado en login: {}", e.getMessage());
            auditLogService.registrarError("LOGIN_ERROR", "AUTH", e.getMessage(), httpRequest);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("💥 Error inesperado en login de {}: {}", request.getUsername(), e.getMessage(), e);
            auditLogService.registrarError("LOGIN_ERROR", "AUTH", e.getMessage(), httpRequest);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor"));
        }
    }

    // ======================================================
    // 🚫 REGISTRO DIRECTO DESHABILITADO
    // ======================================================
    @PostMapping("/register")
    public ResponseEntity<?> registerDisabled() {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message",
                        "El registro directo está deshabilitado. " +
                                "Debe solicitar la creación de cuenta al área administrativa o al SUPERADMIN."));
    }

    // ======================================================
    // ✅ CAMBIO DE CONTRASEÑA
    // ======================================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Token inválido o expirado"));
            }

            String username = authentication.getName();
            log.info("🔄 Cambio de contraseña solicitado por: {}", username);

            authenticationService.changePassword(
                    username,
                    request.getCurrentPassword(),
                    request.getNewPassword(),
                    request.getConfirmPassword()
            );

            auditLogService.registrarAccion("CHANGE_PASSWORD", "AUTH", "Cambio de contraseña exitoso", "INFO", httpRequest);
            return ResponseEntity.ok(Map.of("message", "Contraseña actualizada exitosamente."));

        } catch (RuntimeException e) {
            auditLogService.registrarError("CHANGE_PASSWORD_FAILED", "AUTH", e.getMessage(), httpRequest);
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));

        } catch (Exception e) {
            log.error("💥 Error inesperado al cambiar contraseña: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor"));
        }
    }

    // ======================================================
    // ✅ RECUPERACIÓN DE CONTRASEÑA (simulada)
    // ======================================================
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "El correo electrónico es obligatorio."));
        }

        log.info("📩 Solicitud de recuperación de contraseña para: {}", email);
        // 🔸 Aquí se puede agregar en el futuro un MailService real
        return ResponseEntity.ok(Map.of("message", "Se ha enviado un enlace de recuperación (simulado) al correo: " + email));
    }

    // ======================================================
    // ✅ PERFIL DEL USUARIO AUTENTICADO
    // ======================================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "No hay un usuario autenticado"));
            }

            String username = authentication.getName();
            log.info("🔎 Consultando perfil del usuario autenticado: {}", username);

            var usuario = usuarioRepository.findByNameUser(username)
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            Map<String, Object> response = new HashMap<>();
            response.put("idUser", usuario.getIdUser());
            response.put("username", usuario.getNameUser());
            response.put("estado", usuario.getStatUser());
            response.put("roles", usuario.getRoles().stream().map(r -> r.getDescRol()).toList());
            response.put("permisos", usuario.getRoles().stream()
                    .flatMap(r -> r.getPermisos().stream().map(p -> p.getDescPermiso()))
                    .collect(java.util.stream.Collectors.toSet()));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("💥 Error al obtener el usuario autenticado: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor"));
        }
    }

    // ======================================================
    // ✅ LOGOUT
    // ======================================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication, HttpServletRequest httpRequest) {
        String username = (authentication != null) ? authentication.getName() : "UNKNOWN";
        log.info("👋 Logout de usuario: {}", username);
        auditLogService.registrarLogout(username, httpRequest);
        return ResponseEntity.ok(Map.of("message", "Logout exitoso."));
    }

    // ======================================================
    // ✅ HEALTHCHECK
    // ======================================================
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        return ResponseEntity.ok(Map.of("status", "OK", "service", "Authentication Service"));
    }
}