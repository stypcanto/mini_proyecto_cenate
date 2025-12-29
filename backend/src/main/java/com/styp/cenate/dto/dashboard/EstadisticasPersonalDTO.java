package com.styp.cenate.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para estadísticas de personal interno vs externo
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPersonalDTO {

    /**
     * Total de personal interno (CENATE)
     */
    private Long totalInterno;

    /**
     * Total de personal externo (Otras IPRESS)
     */
    private Long totalExterno;

    /**
     * Porcentaje de personal interno
     */
    private Double porcentajeInterno;

    /**
     * Porcentaje de personal externo
     */
    private Double porcentajeExterno;

    /**
     * Estadísticas por red (solo para personal externo)
     */
    private List<EstadisticaRedDTO> estadisticasPorRed;

    /**
     * Total de redes con usuarios externos
     */
    private Long totalRedesConExternos;
}
