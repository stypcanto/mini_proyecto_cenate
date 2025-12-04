package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 🎓 Entidad que representa las profesiones registradas en el sistema CENATE.
 * Tabla: dim_profesiones
 * Relaciona Especialidades y Personal (PersonalProf).
 */
@Entity
@Table(name = "dim_profesiones", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"personales"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Profesion {

    // ==========================================================
    // 🆔 Identificador principal
    // ==========================================================
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_prof")
    private Long idProf;

    // ==========================================================
    // 🎓 Datos base
    // ==========================================================
    @Column(name = "desc_prof", nullable = false, length = 150)
    private String descProf;

    @Builder.Default
    @Column(name = "stat_prof", nullable = false, length = 1)
    private String statProf = "A"; // A = Activo, I = Inactivo

    // ==========================================================
    // 🕓 Auditoría
    // ==========================================================
    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 Relaciones
    // ==========================================================

    /** Profesionales con esta profesión (tabla intermedia dim_personal_prof) */
    @Builder.Default
    @OneToMany(mappedBy = "profesion", cascade = CascadeType.ALL, orphanRemoval = false, fetch = FetchType.LAZY)
    private Set<PersonalProf> personales = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public boolean isActivo() {
        return "A".equalsIgnoreCase(statProf);
    }

    public String getDescripcionCompleta() {
        return descProf + (isActivo() ? " (Activo)" : " (Inactivo)");
    }
}