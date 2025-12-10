package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

/**
 * 🗺️ Entidad que representa una Macroregión de salud.
 * Tabla: dim_macroregion
 */
@Entity
@Table(name = "dim_macroregion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Macroregion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_macro")
    private Long idMacro;

    @Column(name = "desc_macro", nullable = false)
    private String descMacro;

    @Column(name = "stat_macro", length = 1)
    private String statMacro;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    /**
     * Verifica si la macroregión está activa
     */
    public boolean isActiva() {
        return "A".equalsIgnoreCase(statMacro);
    }
}
