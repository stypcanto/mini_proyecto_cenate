package com.styp.cenate.dto.trazabilidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para transferencia de signos vitales
 *
 * @author Claude Code
 * @version 1.81.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignosVitalesDTO {

    private String presionArterial;
    private Integer presionArterialSistolica;
    private Integer presionArterialDiastolica;
    private BigDecimal temperatura;
    private Integer frecuenciaCardiaca;
    private Integer saturacionO2;
    private BigDecimal pesoKg;
    private Integer tallaM;
    private BigDecimal imcKgM2;
}
