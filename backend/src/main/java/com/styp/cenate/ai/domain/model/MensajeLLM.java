package com.styp.cenate.ai.domain.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Representa un mensaje en una conversación con el LLM.
 *
 * Puede ser de tipo USER (mensaje del usuario) o ASSISTANT (respuesta del LLM).
 * Se utiliza para construir el historial de conversación.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MensajeLLM {

    /**
     * Rol del mensaje (USER o ASSISTANT).
     */
    private RolMensaje rol;

    /**
     * Contenido del mensaje.
     */
    private String contenido;

    /**
     * Timestamp de creación del mensaje.
     */
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

    /**
     * Metadatos adicionales (opcional).
     * Puede contener: tokensUsados, latenciaMs, modeloUtilizado, etc.
     */
    private java.util.Map<String, Object> metadatos;

    /**
     * Rol del mensaje en la conversación.
     */
    public enum RolMensaje {
        USER,      // Mensaje del usuario
        ASSISTANT, // Respuesta del LLM
        SYSTEM     // Instrucciones del sistema (no visible al usuario)
    }
}
