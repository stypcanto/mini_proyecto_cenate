package com.styp.cenate.ai.infrastructure.config;

import org.springframework.ai.anthropic.AnthropicChatModel;
import org.springframework.ai.anthropic.api.AnthropicApi;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de Spring AI para CENATE.
 *
 * Configura los beans necesarios para integración con LLMs:
 * - Anthropic Claude (principal)
 * - OpenAI GPT (fallback)
 * - Ollama (desarrollo local)
 *
 * Variables de entorno requeridas:
 * - ANTHROPIC_API_KEY: Clave API de Anthropic
 * - OPENAI_API_KEY: Clave API de OpenAI (opcional)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Configuration
public class SpringAIConfig {

    /**
     * Configura el cliente de Anthropic Claude.
     *
     * Activo cuando: cenate.ai.provider=anthropic
     */
    @Bean
    @ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "anthropic")
    public AnthropicChatModel anthropicChatModel(
        @Value("${spring.ai.anthropic.api-key}") String apiKey,
        @Value("${spring.ai.anthropic.chat.options.model:claude-3-5-sonnet-20241022}") String model
    ) {
        AnthropicApi anthropicApi = new AnthropicApi(apiKey);
        return new AnthropicChatModel(anthropicApi);
    }

    /**
     * TODO: Configurar OpenAI como proveedor alternativo.
     *
     * @Bean
     * @ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "openai")
     * public OpenAiChatModel openAiChatModel(...) { ... }
     */

    /**
     * TODO: Configurar Ollama para desarrollo local.
     *
     * @Bean
     * @ConditionalOnProperty(name = "cenate.ai.provider", havingValue = "ollama")
     * public OllamaChatModel ollamaChatModel(...) { ... }
     */
}
