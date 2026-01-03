package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * 👔 Representa un tipo de personal en el sistema CENATE.
 * Ejemplos: ADMINISTRATIVO, ASISTENCIAL, PRACTICANTE, etc.
 * Tabla: dim_tipo_personal
 */
@Entity
@Table(name = "dim_tipo_personal", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class TipoProfesional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_pers")
    @EqualsAndHashCode.Include
    private Long idTipPers;

    @Column(name = "desc_tip_pers", nullable = false, unique = true)
    private String descTipPers;

    // ==========================================================
    // 🔖 Estado del tipo profesional (A = Activo, I = Inactivo)
    // ==========================================================
    @Column(name = "stat_tip_pers", nullable = false, length = 1)
    @Builder.Default
    private String statTipPers = "A";

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
    // 🧩 Métodos utilitarios
    // ==========================================================
    /** Retorna el nombre del tipo profesional en mayúsculas */
    public String getNombreTipoProfesional() {
        return descTipPers != null ? descTipPers.trim().toUpperCase() : "";
    }

    /** Indica si el tipo profesional está activo */
    public boolean isActivo() {
        return "A".equalsIgnoreCase(statTipPers);
    }
}
