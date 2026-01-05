package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Entidad que representa las estrategias institucionales de EsSalud
 * (CENATE, CENACRON, CENAPSI, CENASMI, PDIAH, PADOMI, PROSAM)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_estrategia_institucional")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstrategiaInstitucional {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_estrategia")
    private Long idEstrategia;

    @Column(name = "cod_estrategia", nullable = false, unique = true, length = 20)
    private String codEstrategia;

    @Column(name = "desc_estrategia", nullable = false, length = 100)
    private String descEstrategia;

    @Column(name = "sigla", nullable = false, unique = true, length = 20)
    private String sigla;

    @Column(name = "estado", nullable = false, length = 1)
    private String estado; // 'A' = Activo, 'I' = Inactivo

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Método ejecutado antes de persistir la entidad
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.estado == null) {
            this.estado = "A";
        }
    }

    /**
     * Método ejecutado antes de actualizar la entidad
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    /**
     * Verifica si la estrategia está activa
     *
     * @return true si estado = 'A', false en caso contrario
     */
    public boolean isActiva() {
        return "A".equals(this.estado);
    }

    /**
     * Activa la estrategia
     */
    public void activar() {
        this.estado = "A";
    }

    /**
     * Inactiva la estrategia
     */
    public void inactivar() {
        this.estado = "I";
    }
}
