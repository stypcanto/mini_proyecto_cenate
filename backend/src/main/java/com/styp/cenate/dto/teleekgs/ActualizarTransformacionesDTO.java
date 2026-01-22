package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para actualizar transformaciones de imagen EKG (v1.0.0)
 *
 * Permite actualizar:
 * - Rotación (0°, 90°, 180°, 270°)
 * - Flip Horizontal (espejo)
 * - Flip Vertical (de cabeza)
 *
 * Estas son transformaciones PERSISTENTES guardadas en BD.
 * Se aplican visualmente cuando se visualiza la imagen, sin modificar el contenido binario.
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActualizarTransformacionesDTO {

    /**
     * Rotación aplicada a la imagen en grados
     * Valores permitidos: 0, 90, 180, 270
     * Requerido: SÍ
     * Default en BD: 0
     *
     * Ejemplos:
     * - 0: Sin rotación (normal)
     * - 90: Rotación 90° a la izquierda
     * - 180: Rotación 180° (invertida)
     * - 270: Rotación 90° a la derecha
     */
    @NotNull(message = "La rotación es requerida (0, 90, 180 o 270)")
    private Integer rotacion;

    /**
     * Flip horizontal (voltear de izquierda a derecha, como un espejo)
     * TRUE: Imagen volteada horizontalmente
     * FALSE: Imagen normal (sin flip horizontal)
     * Requerido: SÍ
     * Default en BD: false
     *
     * Útil cuando:
     * - Se escanea el papel ECG de lado
     * - Se necesita corregir orientación incorrecta del escáner
     */
    @NotNull(message = "Flip horizontal es requerido (true/false)")
    private Boolean flipHorizontal;

    /**
     * Flip vertical (voltear de arriba a abajo, de cabeza)
     * TRUE: Imagen volteada verticalmente (de cabeza)
     * FALSE: Imagen normal (sin flip vertical)
     * Requerido: SÍ
     * Default en BD: false
     *
     * Útil cuando:
     * - Se escanea el papel ECG boca abajo
     * - Se necesita corregir orientación incorrecta del escáner
     */
    @NotNull(message = "Flip vertical es requerido (true/false)")
    private Boolean flipVertical;

}
