package com.styp.cenate.dto.chatbot;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO de entrada para el Chatbot de Trazabilidad CENATE (v1.70.0).
 */
@Data
public class ChatbotTrazabilidadRequest {

    @NotBlank(message = "El mensaje no puede estar vacío")
    @Size(max = 500, message = "El mensaje no puede superar los 500 caracteres")
    private String mensaje;
}
