package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 🎭 Representa un rol dentro del sistema (ej: ADMIN, MÉDICO, SUPERVISOR).
 * Tabla: dim_roles
 */
@Entity
@Table(name = "dim_roles", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"permisos", "usuarios"}) // Evita recursión infinita al imprimir
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Data
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    @EqualsAndHashCode.Include
    private Integer idRol;

    @Column(name = "desc_rol", nullable = false, unique = true, length = 50)
    private String descRol;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ==========================================================
    // 🔗 Relación con permisos
    // ==========================================================
    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Permiso> permisos = new HashSet<>();

    // ==========================================================
    // 🔗 Relación con usuarios
    // ==========================================================
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Usuario> usuarios = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    /** Retorna el nombre del rol en mayúsculas */
    public String getNombreRol() {
        return descRol != null ? descRol.trim().toUpperCase() : "";
    }

    /** Indica si el rol es de tipo administrador */
    public boolean isAdmin() {
        return getNombreRol().contains("ADMIN");
    }
}
