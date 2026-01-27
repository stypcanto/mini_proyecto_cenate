package com.styp.cenate.ai.domain.port.out;

import com.styp.cenate.ai.domain.model.MensajeLLM;
import java.util.List;
import java.util.Map;

/**
 * Puerto de salida para servicios LLM (Anthropic Claude, OpenAI, Ollama).
 *
 * Esta interfaz abstrae la comunicación con diferentes proveedores de LLM,
 * permitiendo cambiar entre ellos sin modificar la lógica de negocio.
 *
 * Implementaciones: AnthropicClaudeAdapter, OpenAIAdapter, OllamaAdapter
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public interface LLMServicePort {

    /**
     * Envía un mensaje al LLM y obtiene una respuesta.
     *
     * @param mensajes Lista de mensajes del historial de conversación
     * @param systemPrompt Prompt del sistema con contexto e instrucciones
     * @param temperature Temperatura de generación (0.0-1.0, por defecto 0.7)
     * @param maxTokens Máximo de tokens en la respuesta
     * @return Respuesta del LLM
     * @throws com.styp.cenate.ai.domain.exception.LLMServiceException Si hay error en la comunicación
     */
    String chat(
        List<MensajeLLM> mensajes,
        String systemPrompt,
        Double temperature,
        Integer maxTokens
    );

    /**
     * Envía un mensaje con soporte para Function Calling.
     *
     * Permite al LLM invocar funciones del sistema (buscar disponibilidad,
     * obtener datos de paciente, registrar cita, etc.)
     *
     * @param mensajes Lista de mensajes del historial
     * @param systemPrompt Prompt del sistema
     * @param functions Definiciones de funciones disponibles
     * @param temperature Temperatura de generación
     * @param maxTokens Máximo de tokens
     * @return Respuesta del LLM (texto o invocación de función)
     * @throws com.styp.cenate.ai.domain.exception.LLMServiceException Si hay error
     */
    String chatWithFunctions(
        List<MensajeLLM> mensajes,
        String systemPrompt,
        List<FunctionDefinition> functions,
        Double temperature,
        Integer maxTokens
    );

    /**
     * Analiza una imagen (para Tele-ECG u otras imágenes médicas).
     *
     * @param imagenBase64 Imagen codificada en base64
     * @param prompt Pregunta o instrucción sobre la imagen
     * @param maxTokens Máximo de tokens en la respuesta
     * @return Análisis de la imagen
     * @throws com.styp.cenate.ai.domain.exception.LLMServiceException Si hay error
     */
    String analyzeImage(String imagenBase64, String prompt, Integer maxTokens);

    /**
     * Verifica si el servicio LLM está disponible.
     *
     * @return true si el servicio está accesible
     */
    boolean isAvailable();

    /**
     * Obtiene el modelo LLM utilizado (claude-3-5-sonnet, gpt-4, etc.).
     *
     * @return Nombre del modelo
     */
    String getModelName();

    /**
     * Definición de función para Function Calling.
     */
    record FunctionDefinition(
        String name,
        String description,
        Map<String, Object> parameters
    ) {}
}
