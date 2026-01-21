package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
     * Evaluación: NORMAL o ANORMAL
     * Requerido: Sí
     */
    @NotNull(message = "Evaluación es requerida")
    @NotBlank(message = "Evaluación no puede estar vacía")
    @Size(min = 1, max = 20, message = "Evaluación debe tener entre 1 y 20 caracteres")
    private String evaluacion;

    /**
     * Descripción/justificación de la evaluación
     * Ejemplo: "Normal: ritmo sinusal regular, sin arritmias"
     * Ejemplo: "Anormal: taquicardia sinusal, cambios isquémicos"
     *
     * Requerido: Sí
     * Máximo: 1000 caracteres
     */
    @NotNull(message = "Descripción es requerida")
    @NotBlank(message = "Descripción no puede estar vacía")
    @Size(min = 10, max = 1000, message = "Descripción debe tener entre 10 y 1000 caracteres")
    private String descripcion;
}
