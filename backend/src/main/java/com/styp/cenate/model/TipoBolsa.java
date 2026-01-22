package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * 📋 Entidad para Tipos de Bolsas
 * v1.0.0 - Gestión centralizada de categorías de bolsas
 */
@Entity
@Table(name = "dim_tipos_bolsas", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoBolsa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_tipo_bolsa")
    private Long idTipoBolsa;

    @Column(name = "cod_tipo_bolsa", nullable = false, unique = true)
    private String codTipoBolsa;

    @Column(name = "desc_tipo_bolsa", nullable = false)
    private String descTipoBolsa;

    @Column(name = "stat_tipo_bolsa", nullable = false)
    private String statTipoBolsa;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
