package com.styp.cenate.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estadísticas de usuarios por red
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaRedDTO {

    /**
     * ID de la red
     */
    private Long idRed;

    /**
     * Nombre de la red
     */
    private String nombreRed;

    /**
     * Total de usuarios en esta red
     */
    private Long totalUsuarios;

    /**
     * Porcentaje respecto al total de usuarios externos
     */
    private Double porcentaje;
}
