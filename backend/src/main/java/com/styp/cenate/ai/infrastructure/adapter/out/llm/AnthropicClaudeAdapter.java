package com.styp.cenate.ai.infrastructure.adapter.out.llm;

import com.styp.cenate.ai.domain.exception.LLMServiceException;
import com.styp.cenate.ai.domain.model.MensajeLLM;
import com.styp.cenate.ai.domain.port.out.LLMServicePort;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.AnthropicChatOptions;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.model.function.FunctionCallback;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Adaptador para Anthropic Claude API (Spring AI).
 *
 * Implementa la comunicación con Claude 3.5 Sonnet/Opus para:
 * - Chat conversacional
 * - Function Calling
 * - Análisis de imágenes (visión)
 *
 * Configuración requerida en application.properties:
 * spring.ai.anthropic.api-key=${ANTHROPIC_API_KEY}
 * spring.ai.anthropic.chat.options.model=claude-3-5-sonnet-20241022
 * spring.ai.anthropic.chat.options.max-tokens=4096
 * cenate.ai.provider=anthropic
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Slf4j
@Component
@ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "anthropic")
public class AnthropicClaudeAdapter implements LLMServicePort {

    private final AnthropicChatModel chatModel;
    private final String modelName;

    public AnthropicClaudeAdapter(
        AnthropicChatModel chatModel,
        @Value("${spring.ai.anthropic.chat.options.model:claude-3-5-sonnet-20241022}") String modelName
    ) {
        this.chatModel = chatModel;
        this.modelName = modelName;
        log.info("Inicializado AnthropicClaudeAdapter con modelo: {}", modelName);
    }

    @Override
    public String chat(
        List<MensajeLLM> mensajes,
        String systemPrompt,
        Double temperature,
        Integer maxTokens
    ) {
        log.debug("Invocando Claude. Mensajes: {}, Temperature: {}, MaxTokens: {}",
            mensajes.size(), temperature, maxTokens);

        try {
            // 1. Convertir mensajes del dominio a Spring AI Messages
            List<Message> aiMessages = convertirMensajes(mensajes);

            // 2. Agregar system prompt
            if (systemPrompt != null && !systemPrompt.isBlank()) {
                aiMessages.add(0, new SystemMessage(systemPrompt));
            }

            // 3. Configurar opciones de chat
            AnthropicChatOptions options = AnthropicChatOptions.builder()
                .withModel(modelName)
                .withTemperature(temperature != null ? temperature : 0.7)
                .withMaxTokens(maxTokens != null ? maxTokens : 4096)
                .build();

            // 4. Crear prompt y ejecutar
            Prompt prompt = new Prompt(aiMessages, options);
            ChatResponse response = chatModel.call(prompt);

            // 5. Extraer respuesta
            String respuesta = response.getResult().getOutput().getContent();
            log.debug("Respuesta de Claude recibida. Tokens usados: {}",
                response.getMetadata().getUsage().getTotalTokens());

            return respuesta;

        } catch (Exception e) {
            log.error("Error al invocar Claude API", e);
            throw new LLMServiceException(
                "Error en comunicación con Anthropic Claude: " + e.getMessage(),
                e,
                "anthropic",
                null
            );
        }
    }

    @Override
    public String chatWithFunctions(
        List<MensajeLLM> mensajes,
        String systemPrompt,
        List<FunctionDefinition> functions,
        Double temperature,
        Integer maxTokens
    ) {
        log.debug("Invocando Claude con Function Calling. Funciones: {}", functions.size());

        try {
            // 1. Convertir mensajes
            List<Message> aiMessages = convertirMensajes(mensajes);

            if (systemPrompt != null && !systemPrompt.isBlank()) {
                aiMessages.add(0, new SystemMessage(systemPrompt));
            }

            // 2. Convertir function definitions a FunctionCallbacks
            // NOTA: Spring AI maneja automáticamente el ciclo de Function Calling
            // (invocación → ejecución → respuesta al LLM)
            List<FunctionCallback> callbacks = functions.stream()
                .map(this::convertirAFunctionCallback)
                .collect(Collectors.toList());

            // 3. Configurar opciones con funciones
            AnthropicChatOptions options = AnthropicChatOptions.builder()
                .withModel(modelName)
                .withTemperature(temperature != null ? temperature : 0.7)
                .withMaxTokens(maxTokens != null ? maxTokens : 4096)
                .withFunctions(callbacks.toArray(new FunctionCallback[0]))
                .build();

            // 4. Ejecutar
            Prompt prompt = new Prompt(aiMessages, options);
            ChatResponse response = chatModel.call(prompt);

            String respuesta = response.getResult().getOutput().getContent();
            log.debug("Respuesta de Claude (con functions) recibida");

            return respuesta;

        } catch (Exception e) {
            log.error("Error al invocar Claude API con funciones", e);
            throw new LLMServiceException(
                "Error en Function Calling con Claude: " + e.getMessage(),
                e,
                "anthropic",
                null
            );
        }
    }

    @Override
    public String analyzeImage(String imagenBase64, String prompt, Integer maxTokens) {
        log.debug("Analizando imagen con Claude Vision");

        try {
            // Claude 3.5 Sonnet soporta visión
            UserMessage userMessage = new UserMessage(
                prompt,
                List.of(new org.springframework.ai.chat.messages.Media(
                    org.springframework.ai.model.Media.Type.IMAGE,
                    "data:image/png;base64," + imagenBase64
                ))
            );

            AnthropicChatOptions options = AnthropicChatOptions.builder()
                .withModel(modelName)
                .withTemperature(0.3) // Temperatura baja para análisis técnico
                .withMaxTokens(maxTokens != null ? maxTokens : 4096)
                .build();

            Prompt promptObj = new Prompt(List.of(userMessage), options);
            ChatResponse response = chatModel.call(promptObj);

            String analisis = response.getResult().getOutput().getContent();
            log.debug("Análisis de imagen completado");

            return analisis;

        } catch (Exception e) {
            log.error("Error al analizar imagen con Claude", e);
            throw new LLMServiceException(
                "Error en análisis de imagen: " + e.getMessage(),
                e,
                "anthropic",
                null
            );
        }
    }

    @Override
    public boolean isAvailable() {
        try {
            // Verificar disponibilidad con un mensaje simple
            List<Message> testMessage = List.of(new UserMessage("ping"));
            Prompt prompt = new Prompt(testMessage);
            chatModel.call(prompt);
            return true;
        } catch (Exception e) {
            log.warn("Claude API no disponible: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getModelName() {
        return modelName;
    }

    /**
     * Convierte mensajes del dominio a Spring AI Messages.
     */
    private List<Message> convertirMensajes(List<MensajeLLM> mensajes) {
        return mensajes.stream()
            .filter(m -> m.getRol() != MensajeLLM.RolMensaje.SYSTEM) // System va aparte
            .map(m -> {
                if (m.getRol() == MensajeLLM.RolMensaje.USER) {
                    return new UserMessage(m.getContenido());
                } else {
                    return new org.springframework.ai.chat.messages.AssistantMessage(m.getContenido());
                }
            })
            .collect(Collectors.toList());
    }

    /**
     * Convierte una FunctionDefinition del dominio a FunctionCallback de Spring AI.
     *
     * IMPORTANTE: Esto requiere que el FunctionCallingPort esté inyectado
     * para ejecutar las funciones reales del sistema.
     */
    private FunctionCallback convertirAFunctionCallback(FunctionDefinition def) {
        // TODO: Implementar conversión real usando el FunctionCallingPort
        // Por ahora, retornamos un stub
        log.warn("Function Callback stub para función: {}", def.name());
        return null; // Implementar en siguiente fase
    }
}
