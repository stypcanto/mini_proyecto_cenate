package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO para datos de evolución de pacientes crónicos CENACRON
 * Contiene series temporales y métricas calculadas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvolucionCronicaDTO {

    // === INFORMACIÓN GENERAL ===
    private String pkAsegurado;
    private String nombrePaciente;
    private String estadoGeneral; // CONTROL_OPTIMO | CONTROL_REGULAR | DESCONTROL
    private Integer diasDesdeUltimaAtencion;
    private Integer totalAtenciones;

    // === SERIES TEMPORALES ===
    private List<PuntoPresionArterial> seriePresionArterial;
    private List<PuntoPesoIMC> seriePesoIMC;

    // === MÉTRICAS CALCULADAS ===
    private MetricasControl metricas;

    // === ALERTAS ===
    private List<AlertaRiesgo> alertas;

    // === ATENCIONES (para timeline) ===
    private List<AtencionResumen> atenciones;

    // =====================================================================
    // CLASES INTERNAS
    // =====================================================================

    /**
     * Punto de la serie temporal de presión arterial
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PuntoPresionArterial {
        private OffsetDateTime fecha;
        private Integer sistolica;
        private Integer diastolica;
        private Boolean enObjetivo; // < 130/80
        private String clasificacion; // NORMAL | ELEVADO | HTA_GRADO_1 | HTA_GRADO_2 | CRISIS
    }

    /**
     * Punto de la serie temporal de peso e IMC
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PuntoPesoIMC {
        private OffsetDateTime fecha;
        private Double peso;
        private Double imc;
        private Boolean pesoEstable; // Variación < 2kg respecto al anterior
        private String clasificacionIMC; // BAJO_PESO | NORMAL | SOBREPESO | OBESIDAD_I | OBESIDAD_II | OBESIDAD_III
    }

    /**
     * Métricas de control calculadas
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class MetricasControl {
        private Double porcentajePAEnObjetivo; // % de atenciones con PA < 130/80
        private Double porcentajePesoEstable; // % de atenciones con variación < 2kg
        private Double porcentajeAdherencia; // % de adherencia al tratamiento
        private Double porcentajeAsistencia; // % de asistencia a citas programadas

        // Valores actuales
        private String presionActual;
        private Double pesoActual;
        private Double imcActual;

        // Promedios del período
        private Double promedioSistolica;
        private Double promedioDiastolica;
        private Double promedioIMC;
    }

    /**
     * Alerta de riesgo
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AlertaRiesgo {
        private String nivel; // ALTA | MEDIA | BAJA
        private String tipo; // PA_DESCONTROLADA | IMC_AUMENTANDO | BAJA_ADHERENCIA | FALTAS_CONTROL
        private String mensaje;
        private String icono; // 🔴 | 🟡 | 🟢
    }

    /**
     * Resumen de atención para timeline
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AtencionResumen {
        private Long idAtencion;
        private OffsetDateTime fecha;
        private String presionArterial;
        private Double peso;
        private Double imc;
        private Boolean paEnObjetivo;
        private String profesional;
        private String estadoControl; // BUENO | REGULAR | MALO
    }
}
