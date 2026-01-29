package com.styp.cenate.service.security;

import com.styp.cenate.model.PasswordResetToken;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.PasswordResetTokenRepository;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Servicio para gestión segura de tokens de recuperación/cambio de contraseña.
 * Los tokens se persisten en base de datos para sobrevivir reinicios del servidor.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordTokenService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

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
     * Crea un token de cambio de contraseña para un usuario y envía email a un correo específico
     */
    @Transactional
    public boolean crearTokenYEnviarEmail(Long idUsuario, String email, String tipoAccion) {
        Usuario usuario = usuarioRepository.findById(idUsuario).orElse(null);
        if (usuario == null) {
            log.warn("Usuario no encontrado para crear token: {}", idUsuario);
            return false;
        }

        if (email == null || email.isBlank()) {
            log.warn("Email vacío especificado para usuario ID: {}", idUsuario);
            return false;
        }

        return crearTokenYEnviarEmailDirecto(usuario, email, tipoAccion);
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
     */
    @Transactional
    public boolean crearTokenYEnviarEmailDirecto(Usuario usuario, String email, String tipoAccion) {
        String nombreCompleto = usuario.getNameUser();
        try {
            if (usuario.getPersonalCnt() != null && usuario.getPersonalCnt().getNombreCompleto() != null) {
                nombreCompleto = usuario.getPersonalCnt().getNombreCompleto();
            }
        } catch (Exception e) {
            log.warn("No se pudo obtener nombre completo, usando username: {}", usuario.getNameUser());
        }
        return crearTokenYEnviarEmailDirecto(usuario, email, nombreCompleto, tipoAccion);
    }

    /**
     * Crea un token de cambio de contraseña y envía email con nombre completo explícito
     */
    @Transactional
    public boolean crearTokenYEnviarEmailDirecto(Usuario usuario, String email, String nombreCompleto, String tipoAccion) {
        if (email == null || email.isBlank()) {
            log.warn("Email vacío para usuario {}", usuario.getNameUser());
            return false;
        }

        // Invalidar tokens anteriores del mismo usuario
        tokenRepository.invalidarTokensAnteriores(usuario.getIdUser());

        // Generar nuevo token
        String tokenValue = generarToken();
        LocalDateTime expiracion = LocalDateTime.now().plusHours(TOKEN_EXPIRATION_HOURS);

        // Crear y guardar el token en base de datos
        PasswordResetToken token = PasswordResetToken.builder()
            .token(tokenValue)
            .idUsuario(usuario.getIdUser())
            .username(usuario.getNameUser())
            .email(email)
            .fechaExpiracion(expiracion)
            .tipoAccion(tipoAccion)
            .usado(false)
            .build();

        // ⚠️ IMPORTANTE: Usar saveAndFlush para persistir inmediatamente y evitar race condition
        // Si el usuario hace clic muy rápido en el enlace del correo, el token debe existir en BD
        tokenRepository.saveAndFlush(token);
        log.info("Token guardado y persistido en BD para usuario: {}", usuario.getNameUser());

        // Enviar email con enlace
        String enlace = frontendUrl + "/cambiar-contrasena?token=" + tokenValue;
        log.info("Enviando correo de {} a {} con enlace: {}", tipoAccion, email, enlace);

        emailService.enviarCorreoCambioContrasena(
            email,
            nombreCompleto != null ? nombreCompleto : usuario.getNameUser(),
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
    @Transactional(readOnly = true)
    public TokenValidationResult validarToken(String token) {
        if (token == null || token.isBlank()) {
            log.warn("❌ Token no proporcionado");
            return new TokenValidationResult(false, "Token no proporcionado", null);
        }

        var tokenEntity = tokenRepository.findByToken(token).orElse(null);

        if (tokenEntity == null) {
            log.warn("❌ Token no encontrado en BD: {}", token.substring(0, Math.min(10, token.length())) + "...");
            return new TokenValidationResult(false, "Token inválido o no encontrado", null);
        }

        if (tokenEntity.getUsado()) {
            log.warn("❌ Token ya fue usado por: {}", tokenEntity.getUsername());
            return new TokenValidationResult(false, "Token ya fue utilizado. Por favor, solicita uno nuevo.", null);
        }

        if (tokenEntity.isExpirado()) {
            log.warn("❌ Token expirado para usuario: {} (expiró a las {})", tokenEntity.getUsername(), tokenEntity.getFechaExpiracion());
            return new TokenValidationResult(false, "Token expirado. Solicita uno nuevo.", null);
        }

        log.info("✅ Token válido para usuario: {}", tokenEntity.getUsername());

        // Crear TokenInfo para compatibilidad
        TokenInfo info = new TokenInfo(
            tokenEntity.getIdUsuario(),
            tokenEntity.getUsername(),
            tokenEntity.getEmail(),
            tokenEntity.getFechaExpiracion(),
            tokenEntity.getTipoAccion()
        );

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
            log.error("❌ Usuario no encontrado con ID: {}", info.idUsuario);
            return new CambioContrasenaResult(false, "Usuario no encontrado");
        }

        log.info("🔄 Iniciando cambio de contraseña para usuario: {} (ID: {})", usuario.getNameUser(), usuario.getIdUser());

        // Cambiar contraseña
        String passwordEncriptada = passwordEncoder.encode(nuevaContrasena);
        log.info("🔐 Contraseña original: {} caracteres", nuevaContrasena.length());
        log.info("🔐 Contraseña encriptada: {}", passwordEncriptada.substring(0, Math.min(20, passwordEncriptada.length())) + "...");

        usuario.setPassUser(passwordEncriptada);
        usuario.setRequiereCambioPassword(false);
        usuario.setUpdateAt(LocalDateTime.now());
        usuario.setFailedAttempts(0);
        usuario.setLockedUntil(null);

        // ⚠️ IMPORTANTE: Usar saveAndFlush para asegurar persistencia inmediata
        usuarioRepository.saveAndFlush(usuario);
        log.info("✅ Contraseña GUARDADA EN BD para usuario: {}", usuario.getNameUser());
        log.info("✅ RequiereCambioPassword actualizado a: {}", usuario.getRequiereCambioPassword());

        // Marcar token como usado
        var tokenEntity = tokenRepository.findByToken(token).orElse(null);
        if (tokenEntity != null) {
            tokenEntity.setUsado(true);
            // ⚠️ IMPORTANTE: Usar saveAndFlush para asegurar persistencia inmediata
            tokenRepository.saveAndFlush(tokenEntity);
            log.info("✅ Token marcado como usado");
        }

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
     * Limpia tokens expirados (se ejecuta automáticamente cada hora)
     */
    @Scheduled(fixedRate = 3600000) // Cada hora
    @Transactional
    public void limpiarTokensExpirados() {
        int eliminados = tokenRepository.eliminarTokensExpiradosOUsados(LocalDateTime.now());
        if (eliminados > 0) {
            log.info("Limpiados {} tokens expirados o usados de la BD", eliminados);
        }
    }

    // Clases internas para resultados (mantener compatibilidad)
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
