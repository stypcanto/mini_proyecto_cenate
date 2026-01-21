package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para rechazar imágenes ECG por problemas de calidad
 *
 * v3.1.0: Nuevo flujo de validación - Devolver imagen a IPRESS
 *
 * Utilizado por:
 * - Personal CENATE (MEDICO, COORDINADOR): Para rechazar ECGs antes de evaluar
 *
 * Flujo:
 * - El médico visualiza la imagen en el modal
 * - Si detecta mala calidad, marca como "NO VÁLIDA"
 * - Selecciona motivo (predefinido) y descripción
 * - El backend marca como RECHAZADA y envía notificación a IPRESS
 * - IPRESS debe cargar nuevamente la imagen
 *
 * Seguridad:
 * - Requiere autenticación JWT (usuario CENATE)
 * - Requiere permiso MBAC para /teleekgs/listar
 * - Se registra quién rechazó, cuándo, y por qué en auditoría
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-21
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RechazarImagenECGDTO {

    /**
     * MOTIVO DEL RECHAZO (predefinido)
     * Valores válidos:
     * - "MALA_CALIDAD": Imagen pixelada, borrosa, no se ve claramente
     * - "INCOMPLETA": Imagen cortada, falta parte del ECG
     * - "ARTEFACTO": Artefacto de movimiento, ruido, interferencia
     * - "CALIBRACION": Calibración incorrecta o no visible
     * - "NO_PACIENTE": ECG no corresponde al paciente
     * - "FORMATO_INVALIDO": Formato o tipo de archivo inválido
     * - "OTRO": Otro motivo (especificar en descripción)
     */
    @NotBlank(message = "El motivo es requerido")
    @Size(max = 50, message = "El motivo no puede exceder 50 caracteres")
    private String motivo;

    /**
     * DESCRIPCIÓN ADICIONAL
     * Campo de texto libre para el médico
     * Ejemplo: "La mitad inferior del ECG está cortada, necesita recaptura"
     * Máximo: 500 caracteres
     */
    @Size(max = 500, message = "La descripción no puede exceder 500 caracteres")
    private String descripcion;

    /**
     * Validar que el motivo sea uno de los predefinidos
     */
    public boolean esMotivoValido() {
        return motivo != null && (
            motivo.equals("MALA_CALIDAD") ||
            motivo.equals("INCOMPLETA") ||
            motivo.equals("ARTEFACTO") ||
            motivo.equals("CALIBRACION") ||
            motivo.equals("NO_PACIENTE") ||
            motivo.equals("FORMATO_INVALIDO") ||
            motivo.equals("OTRO")
        );
    }

    /**
     * Obtiene descripción legible del motivo
     */
    public String getMotivoDescripcion() {
        return switch (motivo) {
            case "MALA_CALIDAD" -> "Mala calidad de imagen";
            case "INCOMPLETA" -> "Imagen incompleta/cortada";
            case "ARTEFACTO" -> "Artefacto de movimiento";
            case "CALIBRACION" -> "Calibración incorrecta";
            case "NO_PACIENTE" -> "ECG no corresponde al paciente";
            case "FORMATO_INVALIDO" -> "Formato de archivo inválido";
            case "OTRO" -> "Otro motivo";
            default -> "Motivo desconocido";
        };
    }
}
