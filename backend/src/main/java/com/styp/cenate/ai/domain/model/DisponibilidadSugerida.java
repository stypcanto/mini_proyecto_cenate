package com.styp.cenate.ai.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Resultado de una búsqueda de disponibilidad médica asistida por IA.
 *
 * El LLM analiza la solicitud del paciente y devuelve sugerencias
 * basadas en disponibilidad real en dim_disponibilidad_medica.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DisponibilidadSugerida {

    /**
     * Especialidad médica sugerida.
     */
    private String especialidad;

    /**
     * Nombre del médico disponible.
     */
    private String nombreMedico;

    /**
     * ID del médico en dim_personal_cnt.
     */
    private Long medicoId;

    /**
     * IPRESS donde se encuentra el médico.
     */
    private String ipressNombre;

    /**
     * Código IPRESS.
     */
    private String ipressCodigo;

    /**
     * Fecha de disponibilidad.
     */
    private LocalDate fecha;

    /**
     * Hora de inicio del turno.
     */
    private LocalTime horaInicio;

    /**
     * Hora de fin del turno.
     */
    private LocalTime horaFin;

    /**
     * Tipo de atención (PRESENCIAL, TELECONSULTA, TELE_ECG).
     */
    private String tipoAtencion;

    /**
     * Confianza del LLM en la sugerencia (0.0 - 1.0).
     * Basada en qué tan bien coincide con la solicitud del paciente.
     */
    private Double confianza;

    /**
     * Explicación de por qué esta sugerencia es apropiada.
     */
    private String razonamiento;

    /**
     * Alternativas adicionales si esta no es aceptada.
     */
    private List<DisponibilidadSugerida> alternativas;
}
