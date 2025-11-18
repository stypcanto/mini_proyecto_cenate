package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.Builder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidad que representa una Institución Prestadora de Servicios de Salud (IPRESS)
 * Tabla: dim_ipress
 * 
 * ⚠️ MODELO ACTUALIZADO para coincidir con la estructura REAL de la base de datos
 */
@Entity
@Table(name = "dim_ipress")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ipress {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ipress")
    private Long idIpress;
    
    /**
     * Código único de la IPRESS (RENIPRESS)
     */
    @Column(name = "cod_ipress")
    private String codIpress;
    
    /**
     * Descripción/Nombre de la IPRESS
     */
    @Column(name = "desc_ipress", nullable = false)
    private String descIpress;
    
    /**
     * Red de salud a la que pertenece
     */
    @Column(name = "id_red", nullable = false)
    private Long idRed;
    
    /**
     * Nivel de atención (I, II, III)
     */
    @Column(name = "id_niv_aten", nullable = false)
    private Long idNivAten;
    
    /**
     * Modalidad de atención
     */
    @Column(name = "id_mod_aten")
    private Long idModAten;
    
    /**
     * Dirección de la IPRESS
     */
    @Column(name = "direc_ipress", nullable = false)
    private String direcIpress;
    
    /**
     * Tipo de IPRESS (Hospital, Centro de Salud, Puesto, etc.)
     */
    @Column(name = "id_tip_ipress", nullable = false)
    private Long idTipIpress;
    
    /**
     * Distrito donde se ubica
     */
    @Column(name = "id_dist", nullable = false)
    private Long idDist;
    
    /**
     * Latitud (coordenada GPS)
     */
    @Column(name = "lat_ipress", precision = 10, scale = 7)
    private BigDecimal latIpress;
    
    /**
     * Longitud (coordenada GPS)
     */
    @Column(name = "long_ipress", precision = 10, scale = 7)
    private BigDecimal longIpress;
    
    /**
     * URL de Google Maps
     */
    @Column(name = "gmaps_url_ipress")
    private String gmapsUrlIpress;
    
    /**
     * Estado de la IPRESS (A=Activo, I=Inactivo)
     */
    @Column(name = "stat_ipress", nullable = false)
    private String statIpress;
    
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createAt;
    
    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updateAt;


    public String getDescIpress() {
        return this.descIpress;
    }

    /**
     * Verifica si la IPRESS está activa
     */
    public boolean isActiva() {
        return "A".equalsIgnoreCase(statIpress);
    }
}
