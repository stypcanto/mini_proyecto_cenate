package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "dim_tipo_procedimiento")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class TipoProcedimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_procedimiento")
    private Long id;

    @Column(name = "cod_tipo_procedimiento", nullable = false)
    private String codigo;

    @Column(name = "desc_tipo_procedimiento", nullable = false)
    private String descripcion;

    @Column(name = "abr_tipo_procedimiento")
    private String abreviatura;

    @Column(name = "stat_tipo_procedimiento", nullable = false)
    private String estado;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime creado;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime actualizado;
}