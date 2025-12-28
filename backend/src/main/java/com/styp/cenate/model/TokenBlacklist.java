package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * SEC-003: Entidad para almacenar tokens JWT invalidados.
 * Los tokens se invalidan al hacer logout, cambiar contrasena
 * o cuando un admin revoca el acceso.
 */
@Entity
@Table(name = "segu_token_blacklist", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TokenBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Hash SHA-256 del token (no almacenamos el token completo por seguridad)
     */
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    /**
     * Usuario al que pertenecia el token
     */
    @Column(nullable = false, length = 100)
    private String username;

    /**
     * Fecha de expiracion original del token.
     * Se usa para limpiar tokens expirados automaticamente.
     */
    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    /**
     * Motivo de invalidacion: LOGOUT, PASSWORD_CHANGE, ADMIN_REVOKE
     */
    @Column(nullable = false, length = 50)
    private String motivo;

    /**
     * Fecha de creacion del registro
     */
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
