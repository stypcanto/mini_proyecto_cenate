package com.styp.cenate.ai.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Resultado del análisis de imagen Tele-ECG asistido por IA.
 *
 * El LLM (con visión) analiza la imagen ECG y proporciona un análisis
 * preliminar para asistir al médico, NO reemplaza la lectura profesional.
 *
 * DISCLAIMER: Este análisis es preliminar y debe ser validado por
 * un cardiólogo certificado antes de tomar decisiones clínicas.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResultadoAnalisisECG {

    /**
     * ID de la imagen Tele-ECG analizada (dim_teleekgs).
     */
    private Long teleecgId;

    /**
     * Análisis textual del ECG.
     */
    private String analisisDescriptivo;

    /**
     * Hallazgos principales identificados por el LLM.
     */
    private List<String> hallazgosPrincipales;

    /**
     * Ritmo cardíaco detectado (SINUSAL, FIBRILACION_AURICULAR, TAQUICARDIA, etc.).
     */
    private String ritmoCardiaco;

    /**
     * Frecuencia cardíaca estimada (lpm).
     */
    private Integer frecuenciaCardiaca;

    /**
     * Anomalías detectadas (ST elevado, onda Q patológica, bloqueo de rama, etc.).
     */
    private List<String> anomaliasDetectadas;

    /**
     * Nivel de severidad estimado (NORMAL, LEVE, MODERADO, SEVERO).
     */
    private NivelSeveridad severidad;

    /**
     * Confianza del LLM en el análisis (0.0 - 1.0).
     */
    private Double confianza;

    /**
     * Recomendaciones para el médico revisor.
     */
    private List<String> recomendacionesMedicas;

    /**
     * Diagnósticos diferenciales sugeridos.
     */
    private List<String> diagnosticosDiferenciales;

    /**
     * Indica si requiere revisión urgente por cardiólogo.
     */
    private Boolean requiereRevisionUrgente;

    /**
     * Razonamiento del análisis del LLM.
     */
    private String razonamiento;

    /**
     * Nivel de severidad.
     */
    public enum NivelSeveridad {
        NORMAL,       // Sin anomalías significativas
        LEVE,         // Anomalías menores, seguimiento rutinario
        MODERADO,     // Anomalías que requieren atención médica
        SEVERO,       // Anomalías graves, atención urgente
        CRITICO       // Emergencia cardiológica
    }
}
