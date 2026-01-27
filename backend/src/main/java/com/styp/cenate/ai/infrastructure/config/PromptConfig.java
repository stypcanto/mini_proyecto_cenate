package com.styp.cenate.ai.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Configuración de gestión de prompts para CENATE.
 *
 * Define la ubicación de los templates de prompts y las estrategias
 * de versionado y almacenamiento.
 *
 * Estrategias soportadas:
 * - FILESYSTEM: Prompts almacenados en archivos .txt en resources/prompts/
 * - DATABASE: Prompts almacenados en tabla dim_prompt_templates (para versionado)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
@Configuration
public class PromptConfig {

    /**
     * Directorio base para templates de prompts en filesystem.
     */
    @Bean
    public Path promptTemplatesPath() {
        // Carpeta: backend/src/main/resources/prompts/
        return Paths.get("src", "main", "resources", "prompts");
    }

    /**
     * TODO: Configurar estrategia de caché de prompts (Redis/Caffeine).
     */
}
