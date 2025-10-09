package styp.com.cenate.api;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;
import styp.com.cenate.dto.LoginRequest;
import styp.com.cenate.dto.LoginResponse;
import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;
import styp.com.cenate.service.AuthenticationService;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://10.0.89.13:3000",
        "http://10.0.89.13:5173"
})
public class AuthController {

    private final AuthenticationService authenticationService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            log.info("Intento de login para usuario: {}", request.getUsername());
            LoginResponse response = authenticationService.login(request);

            if (response == null) {
                log.warn("Login fallido: respuesta nula para usuario {}", request.getUsername());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Collections.singletonMap("message", "Credenciales inválidas"));
            }

            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            log.warn("Credenciales incorrectas para usuario: {}", request.getUsername());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Usuario o contraseña incorrectos"));
        } catch (java.util.ConcurrentModificationException e) {
            log.error("Error de concurrencia durante login para {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message",
                            "Error interno: acceso concurrente detectado. Contacta al administrador."));
        } catch (Exception e) {
            log.error("Error inesperado en login para usuario {}: {}", request.getUsername(), e.toString(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Error interno del servidor"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody UsuarioCreateRequest request) {
        try {
            log.info("Registro de nuevo usuario: {}", request.getUsername());
            UsuarioResponse response = authenticationService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            log.error("Error en registro de usuario {}: {}", request.getUsername(), e.getMessage());
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
            @Valid @RequestBody styp.com.cenate.dto.ChangePasswordRequest request,
            org.springframework.security.core.Authentication authentication
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

            return ResponseEntity.ok(Collections.singletonMap("message", "Contraseña actualizada exitosamente"));
        } catch (RuntimeException e) {
            log.error("Error al cambiar contraseña para {}: {}", authentication.getName(), e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", e.getMessage()));
        }
    }
}
