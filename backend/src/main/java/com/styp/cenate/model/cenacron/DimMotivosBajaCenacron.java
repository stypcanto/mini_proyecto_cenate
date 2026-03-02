package com.styp.cenate.model.cenacron;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidad JPA — catálogo de motivos para dar de baja del programa CENACRON
 * Tabla: dim_motivos_baja_cenacron
 *
 * @version v1.83.0 - 2026-03-02
 */
@Entity
@Table(
    name = "dim_motivos_baja_cenacron",
    schema = "public",
    indexes = {
        @Index(name = "idx_motivos_baja_cenacron_activo", columnList = "activo"),
        @Index(name = "idx_motivos_baja_cenacron_orden",  columnList = "orden")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DimMotivosBajaCenacron {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 500)
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
        if (activo == null)        activo = true;
        if (orden == null)         orden  = 0;
    }
}
