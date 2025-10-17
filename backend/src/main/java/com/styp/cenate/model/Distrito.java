package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Tabla: dim_distrito
 * Columns (según tu BD): id_dist (PK), desc_dist, stat_dist, id_prov, created_at, updated_at
 */
@Entity
@Table(name = "dim_distrito")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Distrito {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_dist")
    private Long id;

    @Column(name = "desc_dist", nullable = false)
    private String descripcion;

    @Column(name = "stat_dist", nullable = false)
    private String estado;  // 'A' | 'I'

    // FK a provincia (aún sin modelo Provincia; puedes mapearla luego)
    @Column(name = "id_prov", nullable = false)
    private Long idProvincia;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false, nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}