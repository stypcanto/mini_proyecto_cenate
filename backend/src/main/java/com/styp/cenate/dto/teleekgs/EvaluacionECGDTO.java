package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para guardar evaluación de una imagen ECG
 * v3.0.0 - Nuevo - Dataset de entrenamiento para ML
 *
 * @author Styp Canto Rondón
 * @since 2026-01-20
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
}
