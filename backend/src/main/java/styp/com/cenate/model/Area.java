package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
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
public class Area {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_area")
    private Long idArea;

    @Column(name = "desc_area", nullable = false, length = 255)
    private String descArea;

    @Column(name = "stat_area", nullable = false, length = 1)
    private String statArea; // 'A' = Activo, 'I' = Inactivo

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
    @OneToMany(mappedBy = "area", fetch = FetchType.LAZY)
    private Set<PersonalCnt> personal = new HashSet<>();

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================
    /** Devuelve si el área está activa */
    public boolean isActiva() {
        return "A".equalsIgnoreCase(this.statArea);
    }

    /** Devuelve nombre en mayúsculas limpias */
    public String getNombreLimpio() {
        return descArea != null ? descArea.trim().toUpperCase() : "";
    }
}