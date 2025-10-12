package styp.com.cenate.api;

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
import styp.com.cenate.service.AuthenticationService;
import styp.com.cenate.service.AuditLogService;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

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

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("Intento de login para usuario: {}", request.getUsername());
            LoginResponse response = authenticationService.login(request);

            if (response == null) {
                log.warn("Login fallido: respuesta nula para usuario {}", request.getUsername());
                auditLogService.registrarError("LOGIN_FAILED", "AUTH",
                        "Login fallido para usuario: " + request.getUsername(), httpRequest);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Credenciales inválidas"));
            }

            auditLogService.registrarLogin(request.getUsername(), httpRequest);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Credenciales incorrectas para usuario: {}", request.getUsername());
            auditLogService.registrarError("LOGIN_FAILED", "AUTH",
                    "Credenciales incorrectas para usuario: " + request.getUsername(), httpRequest);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Usuario o contraseña incorrectos"));
        } catch (Exception e) {
            log.error("Error inesperado en login para usuario {}: {}", request.getUsername(), e.toString(), e);
            auditLogService.registrarError("LOGIN_ERROR", "AUTH",
                    "Error inesperado: " + e.getMessage(), httpRequest);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Error interno del servidor"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UsuarioCreateRequest request, HttpServletRequest httpRequest) {
        try {
            log.info("Registro de nuevo usuario: {}", request.getUsername());
            UsuarioResponse response = authenticationService.createUser(request);

            auditLogService.registrarAccion("REGISTER", "AUTH",
                    "Nuevo usuario registrado: " + request.getUsername(), "INFO", httpRequest);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error en registro de usuario {}: {}", request.getUsername(), e.getMessage());
            auditLogService.registrarError("REGISTER_FAILED", "AUTH",
                    "Error en registro: " + e.getMessage(), httpRequest);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("service", "Authentication Service");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        try {
            String username = authentication.getName();
            log.info("Cambio de contraseña solicitado por usuario: {}", username);

            authenticationService.changePassword(
                    username,
                    request.getCurrentPassword(),
                    request.getNewPassword(),
                    request.getConfirmPassword()
            );

            auditLogService.registrarAccion("CHANGE_PASSWORD", "AUTH",
                    "Cambio de contraseña exitoso", "INFO", httpRequest);

            return ResponseEntity.ok(Collections.singletonMap("message", "Contraseña actualizada exitosamente"));
        } catch (RuntimeException e) {
            log.error("Error al cambiar contraseña para {}: {}", authentication.getName(), e.getMessage());
            auditLogService.registrarError("CHANGE_PASSWORD_FAILED", "AUTH",
                    "Error al cambiar contraseña: " + e.getMessage(), httpRequest);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        try {
            String username = authentication != null ? authentication.getName() : "UNKNOWN";
            log.info("Logout de usuario: {}", username);
            auditLogService.registrarLogout(username, httpRequest);
            return ResponseEntity.ok(Collections.singletonMap("message", "Logout exitoso"));
        } catch (Exception e) {
            log.error("Error en logout: {}", e.getMessage());
            return ResponseEntity.ok(Collections.singletonMap("message", "Logout procesado"));
        }
    }
}
