package com.styp.cenate.api.seguridad;

import com.styp.cenate.service.security.PasswordTokenService;
import com.styp.cenate.service.security.PasswordTokenService.CambioContrasenaResult;
import com.styp.cenate.service.security.PasswordTokenService.TokenValidationResult;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller para gestión de cambio/recuperación de contraseñas mediante tokens seguros.
 * Endpoints públicos (no requieren autenticación).
 */
@RestController
@RequestMapping("/api/auth/password")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PasswordResetController {

    private final PasswordTokenService passwordTokenService;

    /**
     * Valida si un token es válido (para mostrar el formulario de cambio)
     */
    @GetMapping("/validar-token")
    public ResponseEntity<?> validarToken(@RequestParam String token) {
        log.info("Validando token de cambio de contraseña");

        TokenValidationResult resultado = passwordTokenService.validarToken(token);

        if (resultado.valido()) {
            return ResponseEntity.ok(Map.of(
                "valido", true,
                "mensaje", "Token válido",
                "usuario", resultado.info().username()
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "valido", false,
                "mensaje", resultado.mensaje()
            ));
        }
    }

    /**
     * Cambia la contraseña usando un token válido
     */
    @PostMapping("/cambiar")
    public ResponseEntity<?> cambiarContrasena(@RequestBody CambioContrasenaRequest request) {
        log.info("Solicitud de cambio de contraseña con token");

        if (request.token() == null || request.token().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "Token no proporcionado"
            ));
        }

        if (request.nuevaContrasena() == null || request.nuevaContrasena().length() < 8) {
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "La contraseña debe tener al menos 8 caracteres"
            ));
        }

        if (!request.nuevaContrasena().equals(request.confirmarContrasena())) {
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "Las contraseñas no coinciden"
            ));
        }

        CambioContrasenaResult resultado = passwordTokenService.cambiarContrasenaConToken(
            request.token(),
            request.nuevaContrasena()
        );

        if (resultado.exitoso()) {
            return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "mensaje", resultado.mensaje()
            ));
        } else {
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", resultado.mensaje()
            ));
        }
    }

    /**
     * DTO para solicitud de cambio de contraseña
     */
    public record CambioContrasenaRequest(
        String token,
        String nuevaContrasena,
        String confirmarContrasena
    ) {}
}
