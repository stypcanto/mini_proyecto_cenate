package com.styp.cenate.ai.application.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de request para interacciones con chatbots de IA.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Solicitud de conversación con chatbot")
public class ChatRequestDTO {

    @Schema(description = "DNI del paciente (8 dígitos)", example = "12345678")
    @Pattern(regexp = "^\\d{8}$", message = "DNI debe tener 8 dígitos")
    private String dniPaciente;

    @Schema(description = "Mensaje del usuario", example = "Necesito cardiólogo para esta semana")
    @NotBlank(message = "El mensaje no puede estar vacío")
    private String mensaje;
}
