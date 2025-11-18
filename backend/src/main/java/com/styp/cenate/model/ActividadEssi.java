package com.styp.cenate.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Table(name = "dim_actividad_essi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActividadEssi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_actividad")
    private Long idActividad;

    @Column(name = "cod_actividad", length = 10, nullable = false)
    private String codActividad;

    @Column(name = "desc_actividad", columnDefinition = "text")
    private String descActividad;

    @Column(name = "estado", columnDefinition = "bpchar(1)")
    private String estado;

    @Column(name = "created_at", columnDefinition = "timestamptz")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "timestamptz")
    private OffsetDateTime updatedAt;

    @Column(name = "es_cenate", nullable = false)
    private boolean esCenate;
}
