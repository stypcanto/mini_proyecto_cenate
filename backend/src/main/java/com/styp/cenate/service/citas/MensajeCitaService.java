package com.styp.cenate.service.citas;

import com.styp.cenate.dto.chatbot.EnviarMensajeCitaRequest;
import com.styp.cenate.dto.chatbot.EnviarMensajeCitaResponse;

/**
 * Interfaz para envío de mensajes de cita a pacientes
 * Soporta múltiples canales: WhatsApp, SMS, Email
 *
 * @version v1.0.0 (2026-02-06)
 */
public interface MensajeCitaService {

    /**
     * Envía un mensaje de cita al paciente a través del canal especificado
     *
     * @param request Datos de la cita y destino
     * @return Respuesta con confirmación o error
     */
    EnviarMensajeCitaResponse enviarMensajeCita(EnviarMensajeCitaRequest request);

    /**
     * Envía por WhatsApp específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    EnviarMensajeCitaResponse enviarPorWhatsApp(EnviarMensajeCitaRequest request);

    /**
     * Envía por SMS específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    EnviarMensajeCitaResponse enviarPorSMS(EnviarMensajeCitaRequest request);

    /**
     * Envía por Email específicamente
     *
     * @param request Datos de la cita
     * @return Respuesta con confirmación
     */
    EnviarMensajeCitaResponse enviarPorEmail(EnviarMensajeCitaRequest request);
}
