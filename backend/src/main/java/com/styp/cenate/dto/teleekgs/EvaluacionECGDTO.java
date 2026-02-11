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
     * Evaluación: NORMAL o ANORMAL
     * Requerido: Sí
     */
    @NotNull(message = "Evaluación es requerida")
    @NotBlank(message = "Evaluación no puede estar vacía")
    @Size(min = 1, max = 20, message = "Evaluación debe tener entre 1 y 20 caracteres")
    private String evaluacion;

    /**
     * Descripción/justificación de la evaluación (OPCIONAL)
     * Ejemplo: "Normal: ritmo sinusal regular, sin arritmias"
     * Ejemplo: "Anormal: taquicardia sinusal, cambios isquémicos"
     *
     * ✅ v1.21.5: Ahora OPCIONAL - Si se proporciona, mínimo 4 caracteres
     * ✅ v1.89.1: Permitir texto multilinea (con hallazgos + observaciones)
     * Requerido: No
     * Máximo: 5000 caracteres
     *
     * Validación: Permite cadena vacía O cadenas con 4-5000 caracteres (incluyendo saltos de línea)
     */
    @Pattern(regexp = "^$|^[\\s\\S]{4,5000}$", message = "Observaciones: déjelo vacío o proporcione entre 4 y 5000 caracteres")
    private String descripcion;
}
