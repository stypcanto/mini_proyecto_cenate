package com.styp.cenate.dto.chatbot;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO de respuesta para el Chatbot de Trazabilidad CENATE (v1.70.0).
 */
@Data
@AllArgsConstructor
public class ChatbotTrazabilidadResponse {

    private String respuesta;
    private LocalDateTime timestamp;
}
