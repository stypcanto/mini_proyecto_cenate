package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para recortar imagen EKG de forma PERMANENTE (v1.0.0)
 *
 * Este DTO recibe la imagen recortada desde el frontend (canvas.toDataURL())
 * y la guarda PERMANENTEMENTE en la base de datos, reemplazando la imagen original.
 *
 * ADVERTENCIA: Esta operación es IRREVERSIBLE.
 * - Modifica el contenido binario en PostgreSQL
 * - Recalcula SHA256 para integridad
 * - Registra la acción en auditoría
 * - La imagen original NO se puede recuperar a menos que haya respaldo
 *
 * Casos de uso:
 * - El ECG fue escaneado mal, con partes cortadas o no relevantes
 * - Se necesita eliminar márgenes innecesarios para mejor análisis
 * - La imagen contiene datos de otros pacientes (privacidad)
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RecortarImagenDTO {

    /**
     * Imagen recortada codificada en BASE64 desde el frontend
     * Formato esperado: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAA..."
     *
     * Requerido: SÍ
     * Máximo: 5MB (después de decodificación)
     * Formatos soportados: PNG, JPEG
     *
     * El frontend genera este valor usando:
     * ```javascript
     * const croppedBase64 = canvas.toDataURL("image/png", 1.0);
     * ```
     *
     * En el backend, se extrae la parte base64 (después del "base64,") y se decodifica.
     */
    @NotBlank(message = "La imagen base64 es requerida")
    private String imagenBase64;

    /**
     * MIME Type de la imagen
     * Opcional: Se usa para validar y preservar formato original
     * Valores esperados: "image/png", "image/jpeg"
     * Default: "image/png" (recomendado para imágenes médicas - lossless)
     *
     * Si no se proporciona, el backend asume PNG (lossless).
     * IMPORTANTE: JPEG es con pérdida de calidad, NO recomendado para imágenes médicas.
     */
    private String mimeType = "image/png";

}
