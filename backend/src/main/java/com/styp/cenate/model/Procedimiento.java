package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.OffsetDateTime;

@Entity
@Table(name = "dim_proced")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Procedimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_proced")
    private Long id;

    @Column(name = "cod_proced", nullable = false)
    private String codigo;

    @Column(name = "desc_proced", nullable = false)
    private String descripcion;

    @Column(name = "stat_proced", nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime actualizado;
}