package com.styp.cenate.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO de respuesta para IPRESS (Instituciones Prestadoras de Servicios de Salud)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IpressResponse {

    private Long idIpress;
    private String codIpress;
    private String descIpress;

    // Relaciones (IDs)
    private Long idRed;
    private Long idNivAten;
    private Long idModAten;
    private Long idTipIpress;
    private Long idDist;

    // Información geográfica
    private String direcIpress;
    private BigDecimal latIpress;
    private BigDecimal longIpress;
    private String gmapsUrlIpress;

    // Estado y auditoría
    private String statIpress;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    // ===========================
    // MÉTODOS DE CONVENIENCIA
    // ===========================
    public boolean isActiva() {
        return "A".equalsIgnoreCase(statIpress);
    }
}
