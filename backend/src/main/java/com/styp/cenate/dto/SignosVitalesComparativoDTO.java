package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO para comparación de signos vitales entre dos atenciones
 * Permite mostrar tendencias (mejorando/empeorando)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignosVitalesComparativoDTO {

    // Valores actuales
    private String presionArterialActual;
    private BigDecimal temperaturaActual;
    private Integer saturacionO2Actual;
    private Integer frecuenciaCardiacaActual;

    // Valores anteriores (si existen)
    private String presionArterialAnterior;
    private BigDecimal temperaturaAnterior;
    private Integer saturacionO2Anterior;
    private Integer frecuenciaCardiacaAnterior;

    // Tendencias calculadas
    private TendenciaSignoVital tendenciaPresionArterial;
    private TendenciaSignoVital tendenciaSaturacionO2;
    private TendenciaSignoVital tendenciaTemperatura;
    private TendenciaSignoVital tendenciaFrecuenciaCardiaca;

    // Indicador general
    private boolean hayAtencionAnterior;
    private Long diasDesdeUltimaAtencion;

    /**
     * Enum para indicar la tendencia de un signo vital
     */
    public enum TendenciaSignoVital {
        MEJORANDO, // ✓ Valor mejoró (ej: PA bajó de 150/95 a 130/85)
        EMPEORANDO, // ✗ Valor empeoró (ej: PA subió de 130/85 a 150/95)
        ESTABLE, // → Sin cambio significativo
        SIN_DATOS // — No hay dato anterior para comparar
    }
}
