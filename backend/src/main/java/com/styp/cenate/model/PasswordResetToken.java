package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entidad para persistir tokens de recuperación de contraseña.
 * Almacena tokens en base de datos para que sobrevivan reinicios del servidor.
 */
@Entity
@Table(name = "segu_password_reset_tokens", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_token")
    private Long id;

    @Column(name = "token", nullable = false, unique = true, length = 100)
    private String token;

    @Column(name = "id_usuario", nullable = false)
    private Long idUsuario;

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "fecha_expiracion", nullable = false)
    private LocalDateTime fechaExpiracion;

    @Column(name = "tipo_accion", length = 50)
    private String tipoAccion;

    @Column(name = "usado", nullable = false)
    private Boolean usado = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.usado == null) {
            this.usado = false;
        }
    }

    public boolean isExpirado() {
        return LocalDateTime.now().isAfter(this.fechaExpiracion);
    }

    public boolean isValido() {
        return !this.usado && !this.isExpirado();
    }
}
