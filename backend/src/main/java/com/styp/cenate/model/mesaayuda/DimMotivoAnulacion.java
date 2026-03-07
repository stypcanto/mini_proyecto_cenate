package com.styp.cenate.model.mesaayuda;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para motivos de anulación de citas (Mesa de Ayuda).
 * Tabla: dim_motivo_anulacion
 *
 * @version v1.85.27
 * @since 2026-03-06
 */
@Entity
@Table(
    name = "dim_motivo_anulacion",
    schema = "public",
    indexes = {
        @Index(name = "idx_motivo_anulacion_activo", columnList = "activo"),
        @Index(name = "idx_motivo_anulacion_orden",  columnList = "orden")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DimMotivoAnulacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
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
        if (activo == null) activo = true;
        if (orden == null) orden = 0;
    }
}
