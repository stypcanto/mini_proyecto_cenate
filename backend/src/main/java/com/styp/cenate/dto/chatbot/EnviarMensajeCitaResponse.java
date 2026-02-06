package com.styp.cenate.dto.chatbot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para envío de mensaje de cita
 * Confirma que el mensaje fue procesado/enviado correctamente
 *
 * @version v1.0.0 (2026-02-06)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EnviarMensajeCitaResponse {

    /**
     * ID de la solicitud procesada
     */
    private Long idSolicitud;

    /**
     * Indicador de éxito
     * true = mensaje generado y enviado correctamente
     * false = error en el proceso
     */
    private Boolean exitoso;

    /**
     * Mensaje de confirmación o error
     */
    private String mensaje;

    /**
     * Identificador del envío (para tracking)
     * Puede ser ID de WhatsApp, SMS, email, etc.
     */
    private String idEnvio;

    /**
     * Canal utilizado para el envío
     * ("WHATSAPP", "SMS", "EMAIL")
     */
    private String canal;

    /**
     * Destinatario principal (teléfono o email del paciente)
     */
    private String destinatario;

    /**
     * Indicador si se envió al coordinador también
     */
    private Boolean enviadoAlCoordinador;

    /**
     * Timestamp del envío (ISO 8601)
     */
    private String timestamp;

    /**
     * Contenido del mensaje enviado (para referencia/auditoría)
     */
    private String contenidoMensaje;

    /**
     * Construye respuesta de éxito
     */
    public static EnviarMensajeCitaResponse exitoso(
            Long idSolicitud,
            String idEnvio,
            String canal,
            String destinatario,
            String contenido) {
        return EnviarMensajeCitaResponse.builder()
            .idSolicitud(idSolicitud)
            .exitoso(true)
            .mensaje("Mensaje enviado correctamente")
            .idEnvio(idEnvio)
            .canal(canal)
            .destinatario(destinatario)
            .timestamp(java.time.OffsetDateTime.now().toString())
            .contenidoMensaje(contenido)
            .build();
    }

    /**
     * Construye respuesta de error
     */
    public static EnviarMensajeCitaResponse error(
            Long idSolicitud,
            String mensajeError) {
        return EnviarMensajeCitaResponse.builder()
            .idSolicitud(idSolicitud)
            .exitoso(false)
            .mensaje(mensajeError)
            .timestamp(java.time.OffsetDateTime.now().toString())
            .build();
    }
}
