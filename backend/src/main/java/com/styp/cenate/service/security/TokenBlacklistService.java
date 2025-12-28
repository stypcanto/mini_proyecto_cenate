package com.styp.cenate.service.security;

import com.styp.cenate.model.TokenBlacklist;
import com.styp.cenate.repository.TokenBlacklistRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;

/**
 * SEC-003: Servicio para gestionar tokens JWT invalidados.
 * Permite invalidar tokens en logout y verificar si un token
 * esta en la blacklist.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TokenBlacklistService {

    private final TokenBlacklistRepository repository;

    /**
     * Invalida un token agregandolo a la blacklist.
     *
     * @param token Token JWT a invalidar
     * @param username Usuario propietario del token
     * @param expiration Fecha de expiracion del token
     * @param motivo Razon de invalidacion (LOGOUT, PASSWORD_CHANGE, ADMIN_REVOKE)
     */
    @Transactional
    public void invalidateToken(String token, String username,
                                LocalDateTime expiration, String motivo) {
        String hash = hashToken(token);

        if (!repository.existsByTokenHash(hash)) {
            TokenBlacklist blacklist = TokenBlacklist.builder()
                    .tokenHash(hash)
                    .username(username)
                    .fechaExpiracion(expiration)
                    .motivo(motivo)
                    .build();
            repository.save(blacklist);
            log.info("Token invalidado para usuario: {} - Motivo: {}", username, motivo);
        } else {
            log.debug("Token ya estaba en blacklist para: {}", username);
        }
    }

    /**
     * Verifica si un token esta en la blacklist.
     *
     * @param token Token JWT a verificar
     * @return true si el token esta invalidado
     */
    public boolean isBlacklisted(String token) {
        return repository.existsByTokenHash(hashToken(token));
    }

    /**
     * Genera hash SHA-256 del token.
     * No almacenamos el token completo por seguridad.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) {
                    hexString.append('0');
                }
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            log.error("Error generando hash de token: {}", e.getMessage());
            throw new RuntimeException("Error hashing token", e);
        }
    }

    /**
     * Limpia tokens expirados cada hora.
     * Los tokens expirados ya no son validos de todas formas,
     * pero mantenerlos ocupa espacio en BD.
     */
    @Scheduled(fixedRate = 3600000) // Cada hora
    @Transactional
    public void cleanupExpiredTokens() {
        int deleted = repository.deleteExpiredTokens(LocalDateTime.now());
        if (deleted > 0) {
            log.info("Limpiados {} tokens expirados del blacklist", deleted);
        }
    }

    /**
     * Obtiene cantidad de tokens en blacklist (para monitoreo)
     */
    public long getBlacklistSize() {
        return repository.count();
    }
}
