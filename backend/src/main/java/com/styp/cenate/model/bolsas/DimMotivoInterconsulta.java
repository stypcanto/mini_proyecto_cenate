package com.styp.cenate.model.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para motivos de interconsulta
 * Tabla: dim_motivo_interconsulta
 *
 * Motivos predefinidos para enfermería al derivar a interconsulta:
 * - SIN_ATENCION
 * - LABORATORIOS_COMPLETOS_SIN_ALTERACION
 * - SIN_LABORATORIOS
 * - SIN_TRATAMIENTO
 * - TRATAMIENTO_INCOMPLETO
 * - LABORATORIOS_ALTERADOS
 *
 * @version v1.0.0
 * @since 2026-02-23
 */
@Entity
@Table(
    name = "dim_motivo_interconsulta",
    schema = "public",
    indexes = {
        @Index(name = "idx_motivo_interconsulta_activo", columnList = "activo"),
        @Index(name = "idx_motivo_interconsulta_orden",  columnList = "orden")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimMotivoInterconsulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_motivo")
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "activo", nullable = false)
    private Boolean activo;

    @Column(name = "orden", nullable = false)
    private Integer orden;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @PrePersist
    protected void onCreate() {
        if (fechaCreacion == null) fechaCreacion = LocalDateTime.now();
        if (activo == null) activo = true;
        if (orden == null) orden = 0;
    }
}
