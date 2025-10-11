package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Usuario {

    public String getNameUser() {
        return this.nameUser;
    }

    public String getPassUser() {
        return this.passUser;
    }

    public Long getIdUser() {
        return this.idUser;
    }

    public Set<Rol> getRoles() {
        return this.roles;
    }

    public String getStatUser() {
        return this.statUser;
    }

    public LocalDateTime getLastLoginAt() {
        return this.lastLoginAt;
    }

    public LocalDateTime getCreateAt() {
        return this.createAt;
    }

    public LocalDateTime getUpdateAt() {
        return this.updateAt;
    }

    public Integer getFailedAttempts() {
        return this.failedAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return this.lockedUntil;
    }

    // Setters
    public void setStatUser(String statUser) {
        this.statUser = statUser;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public void setLockedUntil(LocalDateTime lockedUntil) {
        this.lockedUntil = lockedUntil;
    }


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long idUser;

    @Column(name = "name_user", unique = true, nullable = false, length = 50)
    private String nameUser;

    @Column(name = "pass_user", nullable = false)
    private String passUser;

    @Column(name = "stat_user", nullable = false, length = 10)
    private String statUser;

    @Column(name = "created_at")
    private LocalDateTime createAt;

    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Column(name = "failed_attempts")
    private int failedAttempts;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "usuarios_roles",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )


    @Builder.Default
    private Set<Rol> roles = new HashSet<>();

    // Método de utilidad
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    public boolean isActive() {
        return "ACTIVO".equalsIgnoreCase(statUser);
    }
}
