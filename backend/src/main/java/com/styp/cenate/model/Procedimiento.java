package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Entidad para la tabla dim_proced (Procedimientos CPT).
 */
@Entity
@Table(name = "dim_proced", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Procedimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proced")
    private Long idProced;

    @Column(name = "cod_proced", nullable = false)
    private String codProced;

    @Column(name = "desc_proced", nullable = false)
    private String descProced;

    @Column(name = "stat_proced", nullable = false)
    private String statProced;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}