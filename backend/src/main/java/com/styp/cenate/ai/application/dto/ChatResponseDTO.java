package com.styp.cenate.ai.application.dto;

import com.styp.cenate.ai.domain.model.DisponibilidadSugerida;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de respuesta de chatbot de disponibilidad.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Respuesta del chatbot de disponibilidad")
public class ChatResponseDTO {

    @Schema(description = "ID de sesión de conversación", example = "550e8400-e29b-41d4-a716-446655440000")
    private String sessionId;

    @Schema(description = "Respuesta textual del chatbot")
    private String respuesta;

    @Schema(description = "Sugerencias de disponibilidad encontradas")
    private List<DisponibilidadSugerida> sugerencias;

    @Schema(description = "Estado de la conversación", example = "ACTIVA")
    private String estado;

    @Schema(description = "Indica si requiere acción del usuario", example = "false")
    private Boolean requiereAccion;
}
