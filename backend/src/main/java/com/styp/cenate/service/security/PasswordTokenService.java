package com.styp.cenate.service.security;

import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Servicio para gestión segura de tokens de recuperación/cambio de contraseña.
 * Utiliza tokens temporales en memoria con expiración.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordTokenService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    // Almacén temporal de tokens (en producción usar Redis o base de datos)
    private final Map<String, TokenInfo> tokenStore = new ConcurrentHashMap<>();

    // Configuración de tokens
    private static final int TOKEN_EXPIRATION_HOURS = 24;
    private static final int TOKEN_LENGTH = 32;
    private static final int TEMP_PASSWORD_LENGTH = 12;

    // Caracteres para generación de contraseñas
    private static final String UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String SPECIAL = "@#$%&*!?";
    private static final String ALL_CHARS = UPPERCASE + LOWERCASE + DIGITS + SPECIAL;

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Genera una contraseña temporal segura y aleatoria
     */
    public String generarPasswordTemporal() {
        StringBuilder password = new StringBuilder(TEMP_PASSWORD_LENGTH);

        // Asegurar al menos un carácter de cada tipo
        password.append(UPPERCASE.charAt(secureRandom.nextInt(UPPERCASE.length())));
        password.append(LOWERCASE.charAt(secureRandom.nextInt(LOWERCASE.length())));
        password.append(DIGITS.charAt(secureRandom.nextInt(DIGITS.length())));
        password.append(SPECIAL.charAt(secureRandom.nextInt(SPECIAL.length())));

        // Completar el resto con caracteres aleatorios
        for (int i = 4; i < TEMP_PASSWORD_LENGTH; i++) {
            password.append(ALL_CHARS.charAt(secureRandom.nextInt(ALL_CHARS.length())));
        }

        // Mezclar los caracteres para que no siempre empiecen igual
        char[] chars = password.toString().toCharArray();
        for (int i = chars.length - 1; i > 0; i--) {
            int j = secureRandom.nextInt(i + 1);
            char temp = chars[i];
            chars[i] = chars[j];
            chars[j] = temp;
        }

        return new String(chars);
    }

    /**
     * Genera un token seguro para recuperación de contraseña
     */
    public String generarToken() {
        byte[] randomBytes = new byte[TOKEN_LENGTH];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    /**
     * Crea un token de cambio de contraseña para un usuario y envía email con enlace
     */
    @Transactional
    public boolean crearTokenYEnviarEmail(Long idUsuario, String tipoAccion) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            log.warn("Usuario no encontrado para crear token: {}", idUsuario);
            return false;
        }

        return crearTokenYEnviarEmail(usuario, tipoAccion);
    }

    /**
     * Crea un token de cambio de contraseña para un usuario y envía email con enlace
     */
    @Transactional
    public boolean crearTokenYEnviarEmail(Usuario usuario, String tipoAccion) {
        String email = obtenerEmailUsuario(usuario);
        if (email == null || email.isBlank()) {
            log.warn("Usuario {} no tiene email registrado", usuario.getNameUser());
            return false;
        }
        return crearTokenYEnviarEmailDirecto(usuario, email, tipoAccion);
    }

    /**
     * Crea un token de cambio de contraseña y envía email a una dirección específica
     * (evita problemas de lazy loading cuando el email viene de otra fuente)
     */
    @Transactional
    public boolean crearTokenYEnviarEmailDirecto(Usuario usuario, String email, String tipoAccion) {
        if (email == null || email.isBlank()) {
            log.warn("Email vacío para usuario {}", usuario.getNameUser());
            return false;
        }

        // Invalidar tokens anteriores del mismo usuario
        tokenStore.entrySet().removeIf(entry ->
            entry.getValue().idUsuario.equals(usuario.getIdUser()));

        // Generar nuevo token
        String token = generarToken();
        LocalDateTime expiracion = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        // Almacenar token
        tokenStore.put(token, new TokenInfo(
            usuario.getIdUser(),
            usuario.getNameUser(),
            email,
            expiracion,
            tipoAccion
        ));

        // Enviar email con enlace
        String enlace = frontendUrl + "/cambiar-contrasena?token=" + token;
        emailService.enviarCorreoCambioContrasena(
            email,
            usuario.getNombreCompleto(),
            usuario.getNameUser(),
            enlace,
            TOKEN_EXPIRATION_HOURS,
            tipoAccion
        );

        log.info("Token de {} creado y enviado a {} para usuario {}",
            tipoAccion, email, usuario.getNameUser());
        return true;
    }

    /**
     * Valida un token y devuelve la información del usuario
     */
    public TokenValidationResult validarToken(String token) {
        if (token == null || token.isBlank()) {
            return new TokenValidationResult(false, "Token no proporcionado", null);
        }

        TokenInfo info = tokenStore.get(token);
        if (info == null) {
            return new TokenValidationResult(false, "Token inválido o ya utilizado", null);
        }

        if (LocalDateTime.now().isAfter(info.expiracion)) {
            tokenStore.remove(token);
            return new TokenValidationResult(false, "Token expirado", null);
        }

        return new TokenValidationResult(true, "Token válido", info);
    }

    /**
     * Cambia la contraseña usando un token válido
     */
    @Transactional
    public CambioContrasenaResult cambiarContrasenaConToken(String token, String nuevaContrasena) {
        TokenValidationResult validacion = validarToken(token);
        if (!validacion.valido) {
            return new CambioContrasenaResult(false, validacion.mensaje);
        }

        // Validar nueva contraseña
        if (nuevaContrasena == null || nuevaContrasena.length() < 8) {
            return new CambioContrasenaResult(false, "La contraseña debe tener al menos 8 caracteres");
        }

        TokenInfo info = validacion.info;
        Usuario usuario = usuarioRepository.findById(info.idUsuario).orElse(null);
        if (usuario == null) {
            return new CambioContrasenaResult(false, "Usuario no encontrado");
        }

        // Cambiar contraseña
        usuario.setPassUser(passwordEncoder.encode(nuevaContrasena));
        usuario.setRequiereCambioPassword(false);
        usuario.setUpdateAt(LocalDateTime.now());
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);
        usuarioRepository.save(usuario);

        // Invalidar token usado
        tokenStore.remove(token);

        log.info("Contraseña cambiada exitosamente para usuario: {}", usuario.getNameUser());
        return new CambioContrasenaResult(true, "Contraseña cambiada exitosamente");
    }

    /**
     * Obtiene el email del usuario desde PersonalCnt o PersonalExterno
     */
    private String obtenerEmailUsuario(Usuario usuario) {
        if (usuario.getPersonalCnt() != null) {
            var personal = usuario.getPersonalCnt();
            if (personal.getEmailPers() != null && !personal.getEmailPers().isBlank()) {
                return personal.getEmailPers();
            }
            if (personal.getEmailCorpPers() != null && !personal.getEmailCorpPers().isBlank()) {
                return personal.getEmailCorpPers();
            }
        }

        if (usuario.getPersonalExterno() != null) {
            var personalExt = usuario.getPersonalExterno();
            if (personalExt.getEmailPersExt() != null && !personalExt.getEmailPersExt().isBlank()) {
                return personalExt.getEmailPersExt();
            }
            if (personalExt.getEmailCorpExt() != null && !personalExt.getEmailCorpExt().isBlank()) {
                return personalExt.getEmailCorpExt();
            }
        }

        return null;
    }

    /**
     * Limpia tokens expirados (llamar periódicamente)
     */
    public void limpiarTokensExpirados() {
        int antes = tokenStore.size();
        tokenStore.entrySet().removeIf(entry ->
            LocalDateTime.now().isAfter(entry.getValue().expiracion));
        int despues = tokenStore.size();
        if (antes != despues) {
            log.info("Limpiados {} tokens expirados", antes - despues);
        }
    }

    // Clases internas para resultados
    public record TokenInfo(
        Long idUsuario,
        String username,
        String email,
        LocalDateTime expiracion,
        String tipoAccion
    ) {}

    public record TokenValidationResult(
        boolean valido,
        String mensaje,
        TokenInfo info
    ) {}

    public record CambioContrasenaResult(
        boolean exitoso,
        String mensaje
    ) {}
}
