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
@Table(name = "dim_area", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString(exclude = {"personal", "roles"}) // 👈 evita recursion infinita en logs
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_area")
    @EqualsAndHashCode.Include
    private Long idArea;

    @Column(name = "desc_area", nullable = false, length = 255, unique = true)
    private String descArea;

    @Column(name = "stat_area", nullable = false, length = 1)
    @Builder.Default
    private String statArea = "A"; // 'A' = Activo, 'I' = Inactivo

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
    // 🔗 Relación con Rol (FK id_area en dim_roles)
    // ==========================================================
    @Builder.Default
    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    private Set<Rol> roles = new HashSet<>();

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