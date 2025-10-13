package styp.com.cenate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 👤 Entidad principal de usuarios del sistema CENATE.
 * Representa credenciales, auditoría, estado y vínculo con personal CNT.
 */
@Entity
@Table(name = "dim_usuarios")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"roles", "personalCnt", "passUser"})
public class Usuario implements UserDetails {

    // ======================================================
    // 🧩 Campos base
    // ======================================================

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_user")
    private Long idUser;

    @Column(name = "name_user", nullable = false, unique = true, length = 100)
    private String nameUser; // Nombre de usuario (login)

    @JsonIgnore
    @Column(name = "pass_user", nullable = false, length = 200)
    private String passUser; // Contraseña (hash)

    @Column(name = "stat_user", length = 1, nullable = false)
    @Builder.Default
    private String statUser = "A"; // A = Activo, I = Inactivo

    @CreatedDate
    @Column(name = "create_at", updatable = false)
    private LocalDateTime createAt;

    @LastModifiedDate
    @Column(name = "update_at")
    private LocalDateTime updateAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Builder.Default
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    // ======================================================
    // 🔗 Relaciones
    // ======================================================

    /** Roles asignados al usuario (N:N) */
    @Builder.Default
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "rel_user_roles",
            joinColumns = @JoinColumn(name = "id_user"),
            inverseJoinColumns = @JoinColumn(name = "id_rol")
    )
    private Set<Rol> roles = new HashSet<>();

    /** Relación 1:1 con los datos del personal CNT */
    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private PersonalCnt personalCnt;

    // ======================================================
    // 🧠 Métodos utilitarios
    // ======================================================

    /** Verifica si el usuario está activo */
    public boolean isActive() {
        return "A".equalsIgnoreCase(this.statUser);
    }

    /** Verifica si la cuenta está bloqueada temporalmente */
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    /** Incrementa los intentos fallidos de inicio de sesión */
    public void increaseFailedAttempts() {
        if (failedAttempts == null) failedAttempts = 0;
        failedAttempts++;
        if (failedAttempts >= 3) {
            lockedUntil = LocalDateTime.now().plusMinutes(10);
        }
    }

    /** Reinicia el contador de intentos fallidos */
    public void resetFailedAttempts() {
        failedAttempts = 0;
        lockedUntil = null;
    }

    /** Nombre completo (si está vinculado a PersonalCnt) */
    public String getNombreCompleto() {
        if (personalCnt == null) return nameUser;
        return personalCnt.getNombreCompleto();
    }

    /** Foto del usuario (si tiene PersonalCnt con foto) */
    public String getFotoUrl() {
        if (personalCnt != null && personalCnt.getFotoPers() != null && !personalCnt.getFotoPers().isBlank()) {
            return personalCnt.getFotoPers();
        }
        return "/images/default-profile.png";
    }

    /** Estado legible para UI */
    public String getEstadoLegible() {
        return "A".equalsIgnoreCase(statUser) ? "Activo" : "Inactivo";
    }

    /** Roles como texto */
    public String getRolesAsString() {
        return roles.stream()
                .map(Rol::getDescRol)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Sin rol");
    }

    // ======================================================
    // ⚙️ Auditoría (fallback manual)
    // ======================================================
    @PrePersist
    public void prePersist() {
        createAt = LocalDateTime.now();
        updateAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updateAt = LocalDateTime.now();
    }

    // ======================================================
    // 🔐 SPRING SECURITY - UserDetails
    // ======================================================

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(r -> new SimpleGrantedAuthority("ROLE_" + r.getDescRol().toUpperCase()))
                .toList();
    }

    @Override
    @JsonIgnore
    public String getPassword() {
        return passUser;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return nameUser;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return !isAccountLocked();
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return isActive();
    }
}