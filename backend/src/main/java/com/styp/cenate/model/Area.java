package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * 🏢 Entidad que representa las áreas internas del sistema CENATE.
 * Tabla: dim_area
 */
@Entity
@Table(name = "dim_area")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = "personal")
@Slf4j
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_area")
    private Long idArea;

    @Column(name = "desc_area", nullable = false, length = 255, unique = true)
    private String descArea;

    @Column(name = "stat_area", nullable = false, length = 1)
    private String statArea; // 'A' = Activo, 'I' = Inactivo

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    // ==========================================================
    // 🔗 Relación con PersonalCnt
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    private Set<PersonalCnt> personal = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    public boolean isActiva() {
        return "A".equalsIgnoreCase(this.statArea);
    }

    public String getNombreLimpio() {
        return descArea != null ? descArea.trim().toUpperCase() : "";
    }

    public void registrarCreacion() {
        log.info("🧩 Nueva área registrada: {}", this.descArea);
    }
}