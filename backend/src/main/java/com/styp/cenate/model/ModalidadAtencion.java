package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 🏥 Entidad que representa las Modalidades de Atención de una IPRESS
 * Opciones: TELECONSULTA, TELECONSULTORIO, AMBOS, NO SE BRINDA SERVICIO
 * Tabla: dim_modalidad_atencion
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_modalidad_atencion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModalidadAtencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_mod_aten")
    private Long idModAten;

    /**
     * Descripción de la modalidad de atención
     * Valores: TELECONSULTA, TELECONSULTORIO, AMBOS, NO SE BRINDA SERVICIO
     */
    @Column(name = "desc_mod_aten", nullable = false, unique = true)
    private String descModAten;

    /**
     * Estado (A=Activo, I=Inactivo)
     */
    @Column(name = "stat_mod_aten", nullable = false)
    private String statModAten;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Verifica si la modalidad está activa
     */
    public boolean isActiva() {
        return "A".equalsIgnoreCase(statModAten);
    }
}
