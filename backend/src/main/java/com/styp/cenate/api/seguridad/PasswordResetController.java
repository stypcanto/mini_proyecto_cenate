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
        log.info("🔐 === SOLICITUD DE CAMBIO DE CONTRASEÑA ===");
        log.info("Token: {}...", request.token().substring(0, Math.min(10, request.token().length())));
        log.info("Nueva contraseña: {} caracteres", request.nuevaContrasena().length());

        if (request.token() == null || request.token().isBlank()) {
            log.error("❌ Token no proporcionado");
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "Token no proporcionado"
            ));
        }

        if (request.nuevaContrasena() == null || request.nuevaContrasena().length() < 8) {
            log.error("❌ Contraseña muy corta: {} caracteres", request.nuevaContrasena().length());
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "La contraseña debe tener al menos 8 caracteres"
            ));
        }

        if (!request.nuevaContrasena().equals(request.confirmarContrasena())) {
            log.error("❌ Las contraseñas no coinciden");
            return ResponseEntity.badRequest().body(Map.of(
                "exitoso", false,
                "mensaje", "Las contraseñas no coinciden"
            ));
        }

        log.info("✅ Validaciones pasadas, llamando al servicio...");
        CambioContrasenaResult resultado = passwordTokenService.cambiarContrasenaConToken(
            request.token(),
            request.nuevaContrasena()
        );

        if (resultado.exitoso()) {
            log.info("✅ CONTRASEÑA CAMBIADA EXITOSAMENTE");
            return ResponseEntity.ok(Map.of(
                "exitoso", true,
                "mensaje", resultado.mensaje()
            ));
        } else {
            log.error("❌ Error al cambiar contraseña: {}", resultado.mensaje());
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
