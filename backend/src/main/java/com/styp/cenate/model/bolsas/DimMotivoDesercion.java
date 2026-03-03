package com.styp.cenate.model.bolsas;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entidad JPA para motivos de deserción de pacientes.
 * Tabla: dim_motivo_desercion
 *
 * Categorías:
 *   Contacto       — No contactado, No contesta, Número apagado, etc.
 *   Rechazo        — Paciente rechazó, No desea atención
 *   Condición Médica — Paciente internado, Paciente fallecido, Examen pendiente
 *   Otro           — Otro
 *
 * @version v1.0.0
 * @since 2026-03-02
 */
@Entity
@Table(
    name = "dim_motivo_desercion",
    schema = "public",
    indexes = {
        @Index(name = "idx_motivo_desercion_activo",    columnList = "activo"),
        @Index(name = "idx_motivo_desercion_categoria", columnList = "categoria"),
        @Index(name = "idx_motivo_desercion_orden",     columnList = "orden")
    }
)
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class DimMotivoDesercion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "codigo", nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "categoria", nullable = false, length = 100)
    private String categoria;

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
        if (categoria == null) categoria = "Otro";
    }
}
