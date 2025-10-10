package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "dim_usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_user")
    @EqualsAndHashCode.Include
    private Long idUser;

    @Column(name = "name_user", unique = true, nullable = false, length = 100)
    private String nameUser;

    @Column(name = "pass_user", nullable = false, length = 255)
    private String passUser;

    @Builder.Default
    @Column(name = "stat_user", length = 20)
    private String statUser = "ACTIVO";

    @Column(name = "create_at")
    private LocalDateTime createAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "password_changed_at")
    private LocalDateTime passwordChangedAt;

    @Builder.Default
    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "reset_token_hash", length = 255)
    private String resetTokenHash;

    @Column(name = "reset_token_expires_at")
    private LocalDateTime resetTokenExpiresAt;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "id_user"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    @Builder.Default
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private Set<Rol> roles = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createAt = now;
        updateAt = now;
        passwordChangedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updateAt = LocalDateTime.now();
    }

    public boolean isAccountLocked() {
        return lockedUntil != null && LocalDateTime.now().isBefore(lockedUntil);
    }

    public boolean isActive() {
        return "ACTIVO".equalsIgnoreCase(statUser);
    }

    public boolean isEnabled() {
        return isActive() && !isAccountLocked();
    }

    @Transient
    public String getNombreCompleto() {
        // si en un futuro quieres usarlo
        return this.nameUser;
    }
}
