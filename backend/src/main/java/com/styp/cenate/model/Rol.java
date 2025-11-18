package com.styp.cenate.model;

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
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"permisos", "usuarios"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    @EqualsAndHashCode.Include
    private Integer idRol;

    @Column(name = "desc_rol", nullable = false, unique = true, length = 50)
    private String descRol;

    // ==========================================================
    // 🔗 Relación con Área (FK: id_area)
    // ==========================================================
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_area")
    @JsonIgnore
    private Area area;

    // ==========================================================
    // 🔖 Estado del rol (A = Activo, I = Inactivo)
    // ==========================================================
    @Column(name = "stat_rol", nullable = false, length = 1)
    @Builder.Default
    private String statRol = "A";

    // ==========================================================
    // 🔗 Relación con Permisos (MBAC)
    // ==========================================================
    @OneToMany(mappedBy = "rol", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Permiso> permisos = new HashSet<>();

    // ==========================================================
    // 🔗 Relación con Usuarios
    // ==========================================================
    @ManyToMany(mappedBy = "roles", fetch = FetchType.LAZY)
    @JsonIgnore
    @Builder.Default
    private Set<Usuario> usuarios = new HashSet<>();

    // ==========================================================
    // 🕓 Auditoría
    // ==========================================================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    /** Añadir permiso de forma segura */
    public void addPermiso(Permiso permiso) {
        permisos.add(permiso);
        permiso.setRol(this);
    }

    /** Remover permiso de forma segura */
    public void removePermiso(Permiso permiso) {
        permisos.remove(permiso);
        permiso.setRol(null);
    }
}