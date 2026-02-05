package com.styp.cenate.repository;

import com.styp.cenate.model.PasswordResetToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Repositorio para gestión de tokens de recuperación de contraseña.
 */
@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {

    /**
     * Busca un token por su valor
     */
    Optional<PasswordResetToken> findByToken(String token);

    /**
     * Busca un token válido (no usado y no expirado)
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.token = :token AND t.usado = false AND t.fechaExpiracion > :ahora")
    Optional<PasswordResetToken> findValidToken(@Param("token") String token, @Param("ahora") LocalDateTime ahora);

    /**
     * Invalida todos los tokens anteriores de un usuario
     */
    @Modifying
    @Query("UPDATE PasswordResetToken t SET t.usado = true WHERE t.idUsuario = :idUsuario AND t.usado = false")
    void invalidarTokensAnteriores(@Param("idUsuario") Long idUsuario);

    /**
     * Elimina tokens expirados (limpieza)
     */
    @Modifying
    @Query("DELETE FROM PasswordResetToken t WHERE t.fechaExpiracion < :fecha OR t.usado = true")
    int eliminarTokensExpiradosOUsados(@Param("fecha") LocalDateTime fecha);

    /**
     * Cuenta tokens válidos de un usuario
     */
    @Query("SELECT COUNT(t) FROM PasswordResetToken t WHERE t.idUsuario = :idUsuario AND t.usado = false AND t.fechaExpiracion > :ahora")
    long contarTokensValidos(@Param("idUsuario") Long idUsuario, @Param("ahora") LocalDateTime ahora);

    /**
     * Busca el token válido más reciente de un usuario (para reutilizar si es reciente)
     */
    @Query("SELECT t FROM PasswordResetToken t WHERE t.idUsuario = :idUsuario AND t.usado = false AND t.fechaExpiracion > :ahora ORDER BY t.createdAt DESC")
    Optional<PasswordResetToken> findTokenValidoMasReciente(@Param("idUsuario") Long idUsuario, @Param("ahora") LocalDateTime ahora);
}
