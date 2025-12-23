package com.styp.cenate.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.*;

/**
 * 👤 Entidad principal de usuarios del sistema CENATE (MBAC 2025)
 * Representa credenciales, auditoría, estado y vínculo con personal CNT.
 */
@Entity
@Table(name = "dim_usuarios", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"roles", "personalCnt", "passUser"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
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
    private String nameUser;

    @JsonIgnore
    @Column(name = "pass_user", nullable = false, length = 200)
    private String passUser;

    @Column(name = "stat_user", length = 20, nullable = false)
    @Builder.Default
    private String statUser = "A"; // A = Activo, I = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updateAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @Builder.Default
    @Column(name = "failed_attempts", nullable = false)
    private Integer failedAttempts = 0;

    @Column(name = "locked_until")
    private LocalDateTime lockedUntil;

    /**
     * 🔑 Indica si el usuario debe cambiar su contraseña en el próximo login.
     * Se activa cuando:
     * - Se crea un usuario nuevo
     * - Un admin resetea la contraseña
     */
    @Builder.Default
    @Column(name = "requiere_cambio_password", nullable = false)
    private Boolean requiereCambioPassword = true;

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
    @JsonIgnore
    private Set<Rol> roles = new HashSet<>();

    /** Relación 1:1 con los datos del personal CNT */
    @OneToOne(mappedBy = "usuario", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JsonIgnore
    private PersonalCnt personalCnt;

    /** Relación 1:1 con los datos del personal externo */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_user", referencedColumnName = "id_user", insertable = false, updatable = false)
    @JsonIgnore
    private PersonalExterno personalExterno;

    /** Red asignada al usuario (para COORDINADOR_RED) */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_red")
    @JsonIgnore
    private Red red;

    // ======================================================
    // 🧠 Métodos utilitarios
    // ======================================================

    /** Obtiene el ID de la red asignada */
    public Long getIdRed() {
        return red != null ? red.getId() : null;
    }

    /** Determina si el usuario está activo */
    public boolean isActive() {
        return statUser != null && (statUser.equalsIgnoreCase("A") || statUser.equalsIgnoreCase("ACTIVO"));
    }

    /** Determina si la cuenta está bloqueada temporalmente */
    public boolean isAccountLocked() {
        return lockedUntil != null && lockedUntil.isAfter(LocalDateTime.now());
    }

    /** Incrementa los intentos fallidos y bloquea si excede el límite */
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

    /** Nombre completo (si está vinculado a PersonalCnt) */
    public String getNombreCompleto() {
        return (personalCnt != null && personalCnt.getNombreCompleto() != null)
                ? personalCnt.getNombreCompleto()
                : nameUser;
    }

    /** Foto del usuario (si tiene PersonalCnt con foto) */
    public String getFotoUrl() {
        if (personalCnt != null && personalCnt.getFotoPers() != null && !personalCnt.getFotoPers().isBlank()) {
            return personalCnt.getFotoPers();
        }
        return "/images/default-profile.png";
    }

    /** Devuelve el estado legible del usuario */
    public String getEstadoLegible() {
        return isActive() ? "Activo" : "Inactivo";
    }

    /** Devuelve los roles como texto */
    public String getRolesAsString() {
        return roles.stream()
                .map(Rol::getDescRol)
                .reduce((a, b) -> a + ", " + b)
                .orElse("Sin rol");
    }

    // ======================================================
    // 🔐 SPRING SECURITY - UserDetails
    // ======================================================

    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();

        // Añadir roles
        roles.forEach(r -> authorities.add(new SimpleGrantedAuthority("ROLE_" + r.getDescRol().toUpperCase())));

        // Añadir permisos si existen
        roles.stream()
                .filter(r -> r.getPermisos() != null)
                .flatMap(r -> r.getPermisos().stream())
                .forEach(p -> authorities.add(new SimpleGrantedAuthority(p.getDescPermiso().toUpperCase())));

        return authorities;
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