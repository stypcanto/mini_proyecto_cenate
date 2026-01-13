package com.styp.cenate.dto.teleekgs;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitud de procesamiento (aceptar o rechazar) de imágenes ECG
 *
 * Utilizado por:
 * - Personal CENATE (MEDICO, COORDINADOR, ADMIN): para procesar ECGs pendientes
 *
 * Operaciones:
 * - ACEPTAR: Imagen es válida, se marca como PROCESADA
 * - RECHAZAR: Imagen tiene problemas, se especifica el motivo
 *
 * Seguridad:
 * - Requiere autenticación JWT (usuario CENATE)
 * - Requiere permiso MBAC para /teleekgs/listar
 * - Se registra toda acción en auditoría
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-13
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProcesarImagenECGDTO {

    /**
     * ACCIÓN a realizar
     * Valores válidos:
     * - "PROCESAR" o "ACEPTAR": Imagen válida, cambiar estado a PROCESADA
     * - "RECHAZAR": Imagen rechazada, especificar motivo
     * - "VINCULAR": Vincular imagen a usuario asegurado
     */
    @NotBlank(message = "La acción es requerida")
    @Size(max = 50, message = "La acción no puede exceder 50 caracteres")
    private String accion;

    /**
     * Motivo del rechazo (si acción = RECHAZAR)
     * Requerido cuando acción es RECHAZAR
     * Ejemplos:
     * - "Imagen borrosa, no se ve claramente el ECG"
     * - "Formato inválido, no es JPEG ni PNG"
     * - "Archivo corrupto, no se puede procesar"
     * - "Imagen de baja calidad, < 70% de legibilidad"
     * - "DNI no válido"
     * - "Paciente no encontrado"
     */
    @Size(max = 500, message = "El motivo no puede exceder 500 caracteres")
    private String motivo;

    /**
     * Observaciones adicionales
     * Campo libre para notas del procesador
     * Ejemplos:
     * - "Requiere nueva carga desde IPRESS"
     * - "Se sugiere revisión médica completa"
     * - "Posible paciente duplicado"
     */
    @Size(max = 500, message = "Las observaciones no pueden exceder 500 caracteres")
    private String observaciones;

    /**
     * ID del usuario asegurado a vincular
     * Requerido cuando acción = "VINCULAR"
     * Si NO existe, se puede crear nuevo asegurado
     */
    private Long idUsuarioVincular;

    /**
     * Validación de campos según la acción
     */
    public boolean esValido() {
        if (accion == null || accion.isEmpty()) {
            return false;
        }

        switch (accion.toUpperCase()) {
            case "PROCESAR":
            case "ACEPTAR":
                // Solo necesita acción
                return true;

            case "RECHAZAR":
                // Requiere motivo
                return motivo != null && !motivo.trim().isEmpty();

            case "VINCULAR":
                // Requiere ID de usuario a vincular
                return idUsuarioVincular != null && idUsuarioVincular > 0;

            default:
                return false;
        }
    }

    /**
     * Obtiene descripción de la acción en formato legible
     */
    public String getAccionDescripcion() {
        return switch (accion.toUpperCase()) {
            case "PROCESAR", "ACEPTAR" -> "Aceptar imagen (cambiar estado a PROCESADA)";
            case "RECHAZAR" -> "Rechazar imagen (cambiar estado a RECHAZADA)";
            case "VINCULAR" -> "Vincular imagen a usuario asegurado";
            default -> "Acción desconocida";
        };
    }

    /**
     * Valida que si es rechazo, el motivo no esté vacío
     */
    public boolean esRechazoValido() {
        if (!accion.equalsIgnoreCase("RECHAZAR")) {
            return true;
        }
        return motivo != null && !motivo.trim().isEmpty();
    }

    /**
     * Valida que si es vinculación, el ID de usuario sea válido
     */
    public boolean esVinculacionValida() {
        if (!accion.equalsIgnoreCase("VINCULAR")) {
            return true;
        }
        return idUsuarioVincular != null && idUsuarioVincular > 0;
    }
}
