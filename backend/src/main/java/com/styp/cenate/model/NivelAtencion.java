package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dim_nivel_atencion")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NivelAtencion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_niv_aten")
    private Long id;

    @Column(name = "desc_niv_aten", nullable = false)
    private String descripcion;

    @Column(name = "stat_niv_aten", nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}