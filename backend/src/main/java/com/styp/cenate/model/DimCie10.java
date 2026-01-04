package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * Entidad que representa un código CIE-10 (Clasificación Internacional de Enfermedades)
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Entity
@Table(name = "dim_cie10")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimCie10 {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_cie10")
    private Long idCie10;

    @Column(name = "codigo", nullable = false, unique = true, length = 20)
    private String codigo;

    @Column(name = "codigo_padre_0", length = 20)
    private String codigoPadre0;

    @Column(name = "codigo_padre_1", length = 20)
    private String codigoPadre1;

    @Column(name = "codigo_padre_2", length = 20)
    private String codigoPadre2;

    @Column(name = "codigo_padre_3", length = 20)
    private String codigoPadre3;

    @Column(name = "codigo_padre_4", length = 20)
    private String codigoPadre4;

    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    @Column(name = "nivel", nullable = false)
    private Integer nivel;

    @Column(name = "fuente", length = 50)
    private String fuente;

    @Column(name = "activo")
    private Boolean activo;

    @Column(name = "created_at")
    private OffsetDateTime createdAt;
}
