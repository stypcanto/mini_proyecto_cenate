package com.styp.cenate.model;

import jakarta.persistence.*;
import java.time.OffsetDateTime;
import lombok.*;

@Entity
@Table(name = "dim_subactividad_essi")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubactividadEssi {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_subactividad")
    private Long idSubactividad;

    @Column(name = "cod_subactividad", length = 10, nullable = false)
    private String codSubactividad;

    @Column(name = "desc_subactividad", columnDefinition = "text")
    private String descSubactividad;

    @Column(name = "estado", columnDefinition = "bpchar(1)")
    private String estado;

    @Column(name = "created_at", columnDefinition = "timestamptz")
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", columnDefinition = "timestamptz")
    private OffsetDateTime updatedAt;

    @Column(name = "es_cenate", nullable = false)
    private boolean esCenate;
}
