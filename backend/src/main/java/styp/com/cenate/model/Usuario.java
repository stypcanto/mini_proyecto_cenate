package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 👤 Entidad principal de usuarios del sistema CENATE.
 * Incluye seguridad, auditoría y relación con el personal CNT.
 */
@Entity
@Table(name = "dim_usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"roles", "personalCnt"})
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "name_user", nullable = false, unique = true)
    private String nameUser;

    @Column(name = "pass_user", nullable = false)
    private String passUser;

    @Column(name = "stat_user", length = 1)
    private String statUser; // 'A' = Activo, 'I' = Inactivo

    @Column(name = "create_at")
    private LocalDateTime createAt;

    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Builder.Default
    @Column(name = "failed_attempts")
    private Integer failedAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    // ======================================================
    // 🔗 Relaciones
    // ======================================================

    @Builder.Default
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "rel_user_roles",
            joinColumns = @JoinColumn(name = "id_user"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Rol> roles = new HashSet<>();

    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY)
    private PersonalCnt personalCnt;

    // ======================================================
    // 🧩 Métodos utilitarios
    // ======================================================

    /** Verifica si el usuario está activo */
    public boolean isActive() {
        return "A".equalsIgnoreCase(this.statUser);
    }

    /** Verifica si la cuenta está temporalmente bloqueada */
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    /** Incrementa los intentos fallidos */
    public void increaseFailedAttempts() {
        if (failedAttempts == null) failedAttempts = 0;
        failedAttempts++;
        if (failedAttempts >= 3) {
            lockedUntil = LocalDateTime.now().plusMinutes(10);
        }
    }

    /** Reinicia los intentos fallidos */
    public void resetFailedAttempts() {
        failedAttempts = 0;
        lockedUntil = null;
    }

    /** Nombre completo derivado de PersonalCnt (si existe) */
    public String getNombreCompleto() {
        if (personalCnt != null) {
            return personalCnt.getNombreCompleto();
        }
        return this.nameUser; // fallback
    }

    /** Actualiza timestamps automáticamente */
    @PrePersist
    public void prePersist() {
        createAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updateAt = LocalDateTime.now();
    }
}