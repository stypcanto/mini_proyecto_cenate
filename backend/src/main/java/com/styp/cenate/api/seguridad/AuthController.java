package com.styp.cenate.api.seguridad;

import com.styp.cenate.dto.ChangePasswordRequest;
import com.styp.cenate.dto.auth.AuthRequest;
import com.styp.cenate.dto.auth.AuthResponse;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.security.service.JwtUtil;
import com.styp.cenate.service.auth.AuthenticationService;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.security.TokenBlacklistService;
import com.styp.cenate.service.usuario.UsuarioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

/**
 * 🔐 Controlador de autenticación MBAC – CENATE 2025
 * Gestiona:
 *  - Login con JWT + MBAC (roles y permisos reales)
 *  - Cambio de contraseña
 *  - Verificación de sesión (/me)
 */
@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationService authenticationService;
    private final UsuarioService usuarioService;
    private final TokenBlacklistService tokenBlacklistService;
    private final JwtUtil jwtUtil;
    private final AuditLogService auditLogService;

    // ============================================================
    // 🔑 LOGIN (Autenticación principal MBAC)
    // ============================================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            log.info("🔐 Intentando autenticación MBAC para usuario: {}", request.getUsername());
            AuthResponse response = authenticationService.authenticate(request);
            log.info("✅ Login exitoso → {}", request.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("❌ Error en login: {}", e.getMessage());

            String mensaje;
            String errorMsg = e.getMessage() != null ? e.getMessage().toLowerCase() : "";

            if (errorMsg.contains("bloqueada") || errorMsg.contains("locked")) {
                // SEC-002: Cuenta bloqueada por intentos fallidos
                mensaje = "Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intente nuevamente en 10 minutos.";
            } else if (errorMsg.contains("inactiva") || errorMsg.contains("disabled")) {
                mensaje = "La cuenta está inactiva. Contacte al administrador.";
            } else if (errorMsg.contains("usuario no encontrado") || errorMsg.contains("not found")) {
                mensaje = "Usuario no encontrado";
            } else {
                mensaje = "Credenciales inválidas";
            }

            return ResponseEntity.status(401).body(Map.of("error", mensaje));
        }
    }

    // ============================================================
    // 🆕 COMPLETAR PRIMER ACCESO (contraseña + datos personales)
    // ============================================================
    @PostMapping("/completar-primer-acceso")
    public ResponseEntity<?> completarPrimerAcceso(
            @RequestBody com.styp.cenate.dto.CompletarPrimerAccesoRequest request,
            Authentication auth
    ) {
        String username = auth != null ? auth.getName() : null;
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }

        log.info("🆕 Solicitud de completar primer acceso para: {}", username);

        try {
            usuarioService.completarPrimerAcceso(username, request);
            log.info("✅ Primer acceso completado exitosamente para {}", username);
            return ResponseEntity.ok(Map.of(
                "message", "✅ Primer acceso completado exitosamente",
                "requiereCambioPassword", false
            ));
        } catch (IllegalArgumentException e) {
            log.error("❌ Error de validación para {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("❌ Error al completar primer acceso de {}: {}", username, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno del servidor"));
        }
    }

    // ============================================================
    // 🔐 CAMBIO DE CONTRASEÑA (usuario autenticado)
    // ============================================================
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody ChangePasswordRequest request,
            Authentication auth
    ) {
        String username = auth != null ? auth.getName() : null;
        if (username == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Usuario no autenticado"));
        }

        log.info("🧩 Solicitud de cambio de contraseña para: {}", username);

        if (request.getCurrentPassword() == null || request.getNewPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Campos de contraseña incompletos"));
        }

        if (!Objects.equals(request.getNewPassword(), request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Las contraseñas nuevas no coinciden"));
        }

        try {
            usuarioService.changePassword(username, request.getCurrentPassword(), request.getNewPassword());
            log.info("🔑 Contraseña actualizada correctamente para {}", username);
            return ResponseEntity.ok(Map.of("message", "✅ Contraseña actualizada correctamente"));
        } catch (RuntimeException e) {
            log.error("❌ Error al cambiar contraseña de {}: {}", username, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ============================================================
    // 🧭 USUARIO AUTENTICADO (verificación de token)
    // ============================================================
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication auth) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        String username = auth.getName();
        Usuario usuario = usuarioService.findByUsername(username);

        Map<String, Object> data = new HashMap<>();
        data.put("id_user", usuario.getIdUser());
        data.put("username", usuario.getNameUser());
        data.put("nombreCompleto", usuario.getNombreCompleto());
        data.put("roles", usuario.getRoles().stream()
                .map(r -> r.getDescRol().toUpperCase())
                .toList());
        data.put("estado", usuario.getStatUser());
        data.put("activo", usuario.isActive());

        log.info("Usuario autenticado: {}", username);
        return ResponseEntity.ok(data);
    }

    // ============================================================
    // SEC-003: LOGOUT (Invalidar token JWT)
    // ============================================================
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            @RequestHeader("Authorization") String authHeader,
            Authentication auth
    ) {
        if (auth == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No autenticado"));
        }

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Token no proporcionado"));
        }

        try {
            String token = authHeader.substring(7);
            String username = auth.getName();

            // Obtener fecha de expiracion del token
            LocalDateTime expiration = jwtUtil.extractAllClaims(token)
                    .getExpiration()
                    .toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDateTime();

            // Agregar token a blacklist
            tokenBlacklistService.invalidateToken(token, username, expiration, "LOGOUT");

            // Registrar en auditoria
            try {
                auditLogService.registrarEvento(
                        username,
                        "LOGOUT",
                        "AUTH",
                        "Cierre de sesion",
                        "INFO",
                        "SUCCESS"
                );
            } catch (Exception e) {
                log.warn("No se pudo registrar logout en auditoria: {}", e.getMessage());
            }

            log.info("Logout exitoso para: {}", username);
            return ResponseEntity.ok(Map.of("message", "Sesion cerrada correctamente"));

        } catch (Exception e) {
            log.error("Error en logout: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al cerrar sesion"));
        }
    }

    /**
     * 🔐 DEBUG - Generar hash BCrypt para una contraseña
     * USAR PARA RESETEAR CONTRASEÑA DEL USUARIO 84151616
     * Endpoint: GET /api/auth/debug/hash-password?password=MiContraseña
     */
    @GetMapping("/debug/hash-password")
    public ResponseEntity<?> debugHashPassword(@RequestParam String password) {
        try {
            String hashedPassword = new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder(12).encode(password);
            log.info("🔐 Hash BCrypt generado para password de {} caracteres", password.length());
            return ResponseEntity.ok(Map.of(
                "password", password,
                "hash", hashedPassword,
                "instrucciones", "Copiar el hash y ejecutar UPDATE en BD: UPDATE dim_usuarios SET pass_user = 'HASH_AQUI' WHERE name_user = '84151616';"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}