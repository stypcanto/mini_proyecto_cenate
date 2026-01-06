package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

/**
 * Entidad para la tabla dim_medicamento (Petitorio Nacional de Medicamentos).
 */
@Entity
@Table(name = "dim_medicamento", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Medicamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicamento")
    private Long idMedicamento;

    @Column(name = "cod_medicamento", nullable = false, unique = true)
    private String codMedicamento;

    @Column(name = "desc_medicamento", nullable = false)
    private String descMedicamento;

    @Column(name = "stat_medicamento", nullable = false)
    private String statMedicamento;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
