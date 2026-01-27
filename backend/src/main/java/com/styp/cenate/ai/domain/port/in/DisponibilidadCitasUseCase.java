package com.styp.cenate.ai.domain.port.in;

import com.styp.cenate.ai.domain.model.DisponibilidadSugerida;

import java.util.List;

/**
 * Puerto de entrada para el caso de uso: Chatbot de Disponibilidad de Citas.
 *
 * El paciente consulta disponibilidad de citas médicas usando lenguaje natural,
 * y el LLM asiste en la búsqueda de turnos disponibles en dim_disponibilidad_medica.
 *
 * Ejemplo de interacción:
 * - Usuario: "Necesito cardiólogo para la próxima semana en Rebagliati"
 * - LLM: Busca en disponibilidad médica + Devuelve sugerencias
 * - Usuario: "¿Hay algo más temprano?"
 * - LLM: Refina búsqueda con contexto previo
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public interface DisponibilidadCitasUseCase {

    /**
     * Inicia una nueva conversación de búsqueda de disponibilidad.
     *
     * @param dniPaciente DNI del paciente que busca cita
     * @param mensajeInicial Mensaje inicial del paciente
     * @param usuarioId ID del usuario autenticado (para auditoría)
     * @return Session ID de la conversación + respuesta inicial del LLM
     */
    ConversacionDisponibilidadDTO iniciarConversacion(
        String dniPaciente,
        String mensajeInicial,
        Long usuarioId
    );

    /**
     * Continúa una conversación existente.
     *
     * @param sessionId ID de sesión de la conversación
     * @param mensaje Nuevo mensaje del paciente
     * @return Respuesta del LLM con sugerencias actualizadas
     */
    RespuestaDisponibilidadDTO continuarConversacion(
        String sessionId,
        String mensaje
    );

    /**
     * Confirma una cita sugerida por el LLM.
     *
     * @param sessionId ID de sesión
     * @param disponibilidadId ID de la disponibilidad seleccionada
     * @return Confirmación de la reserva + instrucciones siguientes pasos
     */
    ConfirmacionCitaDTO confirmarCita(
        String sessionId,
        Long disponibilidadId
    );

    /**
     * Obtiene el historial completo de una conversación.
     *
     * @param sessionId ID de sesión
     * @return Historial de mensajes
     */
    List<com.styp.cenate.ai.domain.model.MensajeLLM> obtenerHistorial(String sessionId);

    /**
     * Finaliza una conversación (limpieza de recursos).
     *
     * @param sessionId ID de sesión
     */
    void finalizarConversacion(String sessionId);

    /**
     * DTO de respuesta al iniciar conversación.
     */
    record ConversacionDisponibilidadDTO(
        String sessionId,
        String respuestaInicial,
        List<DisponibilidadSugerida> sugerenciasIniciales
    ) {}

    /**
     * DTO de respuesta durante la conversación.
     */
    record RespuestaDisponibilidadDTO(
        String respuesta,
        List<DisponibilidadSugerida> sugerencias,
        Boolean requiereAccionUsuario
    ) {}

    /**
     * DTO de confirmación de cita.
     */
    record ConfirmacionCitaDTO(
        Long citaId,
        String confirmacion,
        String proximosPasos
    ) {}
}
