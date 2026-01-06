package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Entidad para la tabla dim_tip_proced (Tipos de Procedimiento - CPMS)
 */
@Entity
@Table(name = "dim_tip_proced", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoProcedimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tip_proced")
    private Long idTipProced;

    @Column(name = "cod_tip_proced", nullable = false, unique = true)
    private String codTipProced;

    @Column(name = "desc_tip_proced", nullable = false)
    private String descTipProced;

    @Column(name = "stat_tip_proced", nullable = false)
    private String statTipProced;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}