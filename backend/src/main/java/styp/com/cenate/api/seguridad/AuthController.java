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
import styp.com.cenate.dto.ChangePasswordRequest;
import styp.com.cenate.dto.LoginRequest;
import styp.com.cenate.dto.LoginResponse;
import styp.com.cenate.model.RecuperacionCuenta;
import styp.com.cenate.repository.RecuperacionCuentaRepository;
import styp.com.cenate.repository.UsuarioRepository;
import styp.com.cenate.service.auth.AuthenticationService;
import styp.com.cenate.service.auditlog.AuditLogService;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 🌐 Controlador REST encargado de:
 * - Autenticación y login
 * - Cambio y recuperación de contraseñas
 * - Consultas administrativas de solicitudes
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
    private final RecuperacionCuentaRepository recuperacionCuentaRepository;

    // ======================================================
    // 🔐 LOGIN
    // ======================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        log.info("🔑 Intento de login - usuario: {}", request.getUsername());
        try {
            LoginResponse response = authenticationService.login(request);

            if (response == null) {
                auditLogService.registrarError("LOGIN_FAILED", "AUTH", "Respuesta nula en login", httpRequest);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Credenciales inválidas o cuenta pendiente de aprobación."));
            }

            auditLogService.registrarLogin(request.getUsername(), httpRequest);
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            auditLogService.registrarError("LOGIN_FAILED", "AUTH", "Credenciales incorrectas", httpRequest);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Usuario o contraseña incorrectos."));

        } catch (Exception e) {
            log.error("💥 Error inesperado en login [{}]: {}", request.getUsername(), e.getMessage());
            auditLogService.registrarError("LOGIN_ERROR", "AUTH", e.getMessage(), httpRequest);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor."));
        }
    }

    // ======================================================
    // 🔄 CAMBIO DE CONTRASEÑA
    // ======================================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Token inválido o expirado."));
        }

        try {
            String username = authentication.getName();
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
            log.error("💥 Error inesperado al cambiar contraseña: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error interno del servidor."));
        }
    }

    // ======================================================
    // 📩 SOLICITUD DE RECUPERACIÓN DE CONTRASEÑA
    // ======================================================
    @PostMapping("/forgot-password")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody Map<String, String> request) {
        String email = Optional.ofNullable(request.get("email"))
                .map(String::trim)
                .orElse("");

        if (email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "El correo electrónico es obligatorio."
            ));
        }

        log.info("📨 Solicitud de recuperación de contraseña recibida para: {}", email);

        try {
            // 🔍 Verificar existencia del correo en usuarios internos/externos
            boolean existe = usuarioRepository.existsByAnyEmail(email);

            if (!existe) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "No existe ninguna cuenta registrada con ese correo."
                ));
            }

            // 💾 Registrar solicitud
            RecuperacionCuenta solicitud = RecuperacionCuenta.builder()
                    .email(email)
                    .fechaSolicitud(LocalDateTime.now())
                    .estado("PENDIENTE")
                    .observacion("Solicitud pendiente de revisión por el administrador")
                    .build();

            recuperacionCuentaRepository.save(solicitud);

            log.info("✅ Solicitud de recuperación registrada correctamente en BD ({})", email);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Tu solicitud ha sido registrada. Un administrador revisará tu cuenta."
            ));

        } catch (Exception e) {
            log.error("❌ Error al procesar solicitud de recuperación [{}]: {}", email, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Error interno del servidor. Inténtalo más tarde."
            ));
        }
    }

    // ======================================================
    // 🧾 ENDPOINTS ADMINISTRATIVOS
    // ======================================================

    /**
     * 📋 Lista completa de solicitudes de recuperación
     */
    @GetMapping("/recoveries")
    public ResponseEntity<?> getAllRecoveries() {
        try {
            List<RecuperacionCuenta> solicitudes = recuperacionCuentaRepository.findAll();
            log.info("📋 {} solicitudes de recuperación encontradas", solicitudes.size());
            return ResponseEntity.ok(solicitudes);
        } catch (Exception e) {
            log.error("❌ Error al obtener solicitudes de recuperación: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error al obtener solicitudes de recuperación."));
        }
    }

    /**
     * 🔢 Contador de solicitudes pendientes
     */
    @GetMapping("/recoveries/pending-count")
    public ResponseEntity<?> getPendingRecoveriesCount() {
        try {
            long count = recuperacionCuentaRepository.countByEstado("PENDIENTE");
            log.info("📊 {} solicitudes de recuperación pendientes", count);
            return ResponseEntity.ok(Map.of("pendingRecoveries", count));
        } catch (Exception e) {
            log.error("❌ Error al contar solicitudes pendientes: {}", e.getMessage());
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Error al contar solicitudes pendientes."));
        }
    }
}