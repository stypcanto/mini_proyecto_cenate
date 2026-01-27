package com.styp.cenate.ai.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Sugerencia de diagnóstico generada por IA para personal externo.
 *
 * El LLM recolecta síntomas y genera un pre-diagnóstico sugerido
 * para orientar al personal de salud, NO reemplaza el diagnóstico médico.
 *
 * DISCLAIMER: Esta información es orientativa y debe ser validada
 * por un profesional médico certificado.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SugerenciaDiagnostico {

    /**
     * Síntomas reportados por el paciente.
     */
    private List<String> sintomas;

    /**
     * Pre-diagnóstico sugerido (CIE-10 si aplica).
     */
    private String diagnosticoSugerido;

    /**
     * Código CIE-10 (si el LLM lo identifica).
     */
    private String codigoCIE10;

    /**
     * Especialidad médica recomendada para atención.
     */
    private String especialidadRecomendada;

    /**
     * Nivel de urgencia (BAJA, MEDIA, ALTA, CRITICA).
     */
    private NivelUrgencia urgencia;

    /**
     * Confianza del LLM en el pre-diagnóstico (0.0 - 1.0).
     */
    private Double confianza;

    /**
     * Recomendaciones adicionales (exámenes, medidas preventivas).
     */
    private List<String> recomendaciones;

    /**
     * Razonamiento del LLM sobre el diagnóstico sugerido.
     */
    private String razonamiento;

    /**
     * Diagnósticos alternativos posibles.
     */
    private List<String> diagnosticosAlternativos;

    /**
     * Nivel de urgencia.
     */
    public enum NivelUrgencia {
        BAJA,      // Atención programada (7-14 días)
        MEDIA,     // Atención preferente (2-7 días)
        ALTA,      // Atención prioritaria (24-48 horas)
        CRITICA    // Atención inmediata (derivar a emergencia)
    }
}
