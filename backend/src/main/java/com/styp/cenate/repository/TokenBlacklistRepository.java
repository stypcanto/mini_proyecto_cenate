package com.styp.cenate.repository;

import com.styp.cenate.model.TokenBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * SEC-003: Repositorio para tokens invalidados.
 */
@Repository
public interface TokenBlacklistRepository extends JpaRepository<TokenBlacklist, Long> {

    /**
     * Verifica si un token esta en la blacklist
     */
    boolean existsByTokenHash(String tokenHash);

    /**
     * Elimina tokens cuya fecha de expiracion ya paso.
     * Se ejecuta periodicamente para limpiar la tabla.
     */
    @Modifying
    @Query("DELETE FROM TokenBlacklist t WHERE t.fechaExpiracion < :now")
    int deleteExpiredTokens(LocalDateTime now);

    /**
     * Cuenta tokens en blacklist (para monitoreo)
     */
    long count();
}
