package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

/**
 * Entidad que representa los servicios/especialidades médicas (ESSI).
 * Tabla: dim_servicio_essi
 */
@Entity
@Table(name = "dim_servicio_essi", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Especialidad {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    @Column(name = "id_servicio")
    private Long idServicio;

    @Column(name = "cod_servicio", length = 10)
    private String codServicio;

    @Column(name = "desc_servicio", nullable = false, columnDefinition = "TEXT")
    private String descServicio;

    @Builder.Default
    @Column(name = "es_cenate")
    private Boolean esCenate = false;

    @Builder.Default
    @Column(name = "estado", length = 1)
    private String estado = "A";

    @Builder.Default
    @Column(name = "es_apertura_nuevos")
    private Boolean esAperturaNuevos = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    public boolean isActivo() {
        return "A".equalsIgnoreCase(estado);
    }
}
