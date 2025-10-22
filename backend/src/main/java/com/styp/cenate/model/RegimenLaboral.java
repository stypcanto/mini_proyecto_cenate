package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * ⚖️ Entidad que representa los regímenes laborales del personal CNT.
 * Tabla: dim_regimen_laboral
 */
@Entity
@Table(name = "dim_regimen_laboral")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "personal")
@Data
public class RegimenLaboral {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_reg_lab")
    private Long idRegLab;

    @Column(name = "desc_reg_lab", nullable = false, length = 100)
    private String descRegLab;

    @Column(name = "stat_reg_lab", nullable = false, length = 1)
    private String statRegLab; // 'A' = Activo, 'I' = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updateAt;

    // ==========================================================
    // 🔗 Relación con PersonalCnt
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "regimenLaboral", fetch = FetchType.LAZY)
    private Set<PersonalCnt> personal = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    /** Devuelve si el régimen está activo */
    public boolean isActivo() {
        return "A".equalsIgnoreCase(this.statRegLab);
    }

    /** Devuelve el nombre formateado limpio */
    public String getNombreLimpio() {
        return descRegLab != null ? descRegLab.trim().toUpperCase() : "";
    }
}
