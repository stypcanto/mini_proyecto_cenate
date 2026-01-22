package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * ✅ v1.29.0: DTO para guardar evaluación ECG con datos COMPLETOS del Triaje Clínico
 * v3.0.0 - Dataset de entrenamiento para ML
 *
 * @author Styp Canto Rondón
 * @since 2026-01-20
 * @updated 2026-01-22 v1.29.0 - Extensión completa
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionECGDTO {

    /**
     * Evaluación Médica: Texto libre del análisis del ECG
     * v1.25.0: Ahora permite texto libre para evaluación completa del médico
     * Requerido: Sí
     */
    @NotNull(message = "Evaluación es requerida")
    @NotBlank(message = "Evaluación no puede estar vacía")
    @Size(min = 10, max = 5000, message = "Evaluación debe tener entre 10 y 5000 caracteres")
    private String evaluacion;

    /**
     * Descripción/justificación de la evaluación (OPCIONAL)
     * Ejemplo: "Normal: ritmo sinusal regular, sin arritmias"
     * Ejemplo: "Anormal: taquicardia sinusal, cambios isquémicos"
     *
     * ✅ v1.21.5: Ahora OPCIONAL - Si se proporciona, mínimo 10 caracteres
     * Requerido: No
     * Máximo: 1000 caracteres
     *
     * Validación: Permite cadena vacía O cadenas con 10-1000 caracteres
     */
    @Pattern(regexp = "^$|^.{10,1000}$", message = "Observaciones: déjelo vacío o proporcione entre 10 y 1000 caracteres")
    private String descripcion;

    // ════════════════════════════════════════════════════════════════
    // ✅ v1.29.0: CAMPOS ADICIONALES DEL TRIAJE CLÍNICO
    // ════════════════════════════════════════════════════════════════

    /**
     * ✅ v1.29.0: Urgencia del caso
     * BAJA, MEDIA, ALTA, MAXIMA
     * Requerido: No
     */
    @Pattern(regexp = "BAJA|MEDIA|ALTA|MAXIMA|^$", message = "Urgencia debe ser: BAJA, MEDIA, ALTA, MAXIMA o vacío")
    private String urgencia;

    /**
     * ✅ v1.29.0: Contexto clínico del paciente
     * JSON con: presentacionClinica, troponinaNegativa, antecedentesRelevantes, medicacionesActuales
     * Requerido: No
     */
    @JsonProperty("contextoClinico")
    private Map<String, Object> contextoClinico;

    /**
     * ✅ v1.29.0: Derivaciones ECG seleccionadas
     * Array de derivaciones que muestran alteraciones
     * Requerido: No
     */
    @JsonProperty("derivacionesSeleccionadas")
    private List<String> derivacionesSeleccionadas;

    /**
     * ✅ v1.29.0: Motivo "No Diagnóstico"
     * Solo se envía cuando evaluacion == "NO_DIAGNOSTICO"
     * Requerido: No
     */
    @Size(max = 500, message = "Motivo máximo 500 caracteres")
    private String motivoNoDiagnostico;

    /**
     * ✅ v1.29.0: Diagnóstico del RITMO cardíaco
     * Ejemplos: "Ritmo Sinusal Normal", "Fibrilación Auricular", "Taquicardia Sinusal"
     * Requerido: No
     */
    @Size(max = 200, message = "Diagnóstico ritmo máximo 200 caracteres")
    private String diagnosticoRitmo;

    /**
     * ✅ v1.29.0: Diagnóstico del INTERVALO PR
     * Ejemplos: "Normal (120-200 ms)", "Prolongado (>200 ms)", "Acortado (<120 ms)"
     * Requerido: No
     */
    @Size(max = 200, message = "Diagnóstico PR máximo 200 caracteres")
    private String diagnosticoPR;

    /**
     * ✅ v1.29.0: Diagnóstico del COMPLEJO QRS
     * Ejemplos: "Normal (<120 ms)", "Bloqueo Rama Derecha", "Bloqueo Rama Izquierda"
     * Requerido: No
     */
    @Size(max = 200, message = "Diagnóstico QRS máximo 200 caracteres")
    private String diagnosticoQRS;
}
