package com.styp.cenate.ai.domain.port.out;

import com.styp.cenate.ai.domain.model.ConversacionContext;
import com.styp.cenate.ai.domain.model.MensajeLLM;

import java.util.List;
import java.util.Optional;

/**
 * Puerto de salida para gestión de memoria de conversaciones.
 *
 * Permite mantener el contexto de conversaciones multi-turno con pacientes,
 * médicos o personal administrativo. Implementa estrategias de retención
 * (últimos N mensajes, ventana deslizante, resumen de contexto).
 *
 * Implementaciones: RedisConversacionMemoryAdapter, InMemoryConversacionMemoryAdapter
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public interface ConversacionMemoryPort {

    /**
     * Guarda el contexto completo de una conversación.
     *
     * @param sessionId Identificador único de sesión (UUID)
     * @param context Contexto completo de la conversación
     * @throws com.styp.cenate.ai.domain.exception.ContextoInvalidoException Si el contexto es inválido
     */
    void saveContext(String sessionId, ConversacionContext context);

    /**
     * Obtiene el contexto de una conversación existente.
     *
     * @param sessionId Identificador de sesión
     * @return Contexto si existe, vacío si no
     */
    Optional<ConversacionContext> getContext(String sessionId);

    /**
     * Agrega un mensaje al historial de la conversación.
     *
     * @param sessionId Identificador de sesión
     * @param mensaje Mensaje a agregar (usuario o asistente)
     * @throws com.styp.cenate.ai.domain.exception.ContextoInvalidoException Si la sesión no existe
     */
    void addMessage(String sessionId, MensajeLLM mensaje);

    /**
     * Obtiene los últimos N mensajes de una conversación.
     *
     * Útil para limitar el contexto enviado al LLM y reducir costos.
     *
     * @param sessionId Identificador de sesión
     * @param limit Cantidad de mensajes a retornar
     * @return Lista de mensajes (ordenados del más antiguo al más reciente)
     */
    List<MensajeLLM> getRecentMessages(String sessionId, int limit);

    /**
     * Elimina una conversación completa (limpieza de memoria).
     *
     * @param sessionId Identificador de sesión
     */
    void clearContext(String sessionId);

    /**
     * Actualiza el TTL (Time To Live) de una sesión.
     *
     * Por ejemplo, extender 30 minutos después de cada interacción.
     *
     * @param sessionId Identificador de sesión
     * @param ttlSeconds Tiempo de vida en segundos
     */
    void updateTTL(String sessionId, long ttlSeconds);

    /**
     * Verifica si una sesión existe y está activa.
     *
     * @param sessionId Identificador de sesión
     * @return true si la sesión existe
     */
    boolean exists(String sessionId);
}
