package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para responder un ticket de Mesa de Ayuda
 * Utilizado por personal de Mesa de Ayuda cuando responden a un ticket
 *
 * @author Styp Canto Rondón
 * @version v1.64.0 (2026-02-18)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResponderTicketDTO {

    /**
     * Respuesta del personal de Mesa de Ayuda (requerido)
     * Texto libre con la solución o acción realizada
     */
    @NotBlank(message = "La respuesta es requerida")
    private String respuesta;

    /**
     * Nuevo estado del ticket (requerido)
     * Valores válidos: EN_PROCESO, RESUELTO, CERRADO
     * ABIERTO no es válido en respuesta (es estado inicial)
     */
    @NotBlank(message = "El estado es requerido")
    private String estado; // EN_PROCESO, RESUELTO, CERRADO

    /**
     * ID del personal de Mesa de Ayuda que responde (requerido)
     * Se obtiene de la sesión actual
     */
    @NotNull(message = "El ID del personal es requerido")
    private Long idPersonalMesa;

    /**
     * Nombre del personal que responde (se completa automáticamente)
     */
    private String nombrePersonalMesa;
}
