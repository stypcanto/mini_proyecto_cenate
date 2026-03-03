package com.styp.cenate.model.cenacron;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entidad JPA para el catálogo de Motivos de Deserción
 * @version v1.84.0 - 2026-03-02
 */
@Entity
@Table(name = "dim_motivos_desercion")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DimMotivosDesercion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String codigo;

    @Column(nullable = false, length = 500)
    private String descripcion;

    @Column(nullable = false, length = 100)
    private String categoria;

    @Column(nullable = false)
    private Boolean activo;

    @Column(nullable = false)
    private Integer orden;

    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
}
