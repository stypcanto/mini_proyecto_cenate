package com.styp.cenate.dto.teleekgs;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

/**
 * 📊 DTO para Analytics de TeleECG (v1.73.0)
 * 
 * Datos analíticos filtrados por fecha, IPRESS, evaluación, urgencia
 * Incluye comparativas con período anterior
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeleECGAnalyticsDTO {
    
    // === KPIs PRINCIPALES ===
    private Integer totalEcgs;
    private Integer ecgsNormales;
    private Integer ecgsAnormales;
    private Integer ecgsSinEvaluar;
    private Double tatPromedioMinutos;
    private Double slaCumplimientoPorcentaje;
    private Double tasaRechazoPorcentaje;
    
    // === DISTRIBUCIÓN ===
    private Map<String, Integer> distribucionPorGenero;  // M, F, Otro
    private Map<String, Integer> distribucionPorRangoEdad; // 0-30, 31-50, 51-70, 71+
    private Map<String, Integer> distribucionPorEstado;  // ENVIADA, OBSERVADA, ATENDIDA
    private Map<String, Integer> distribucionPorEvaluacion; // NORMAL, ANORMAL, SIN_EVALUAR
    
    // === COMPARATIVA CON PERÍODO ANTERIOR ===
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ComparativaDTO {
        private Double cambioVolumenPorcentaje;
        private Double cambioTatPorcentaje;
        private Double cambioRechazosPorcentaje;
    }
    
    private ComparativaDTO comparacion;
    
    // === METADATOS ===
    private String fechaDesde;
    private String fechaHasta;
    private Long idIpress;
    private String evaluacionFiltro;
    private Boolean esUrgenteFiltro;
}
