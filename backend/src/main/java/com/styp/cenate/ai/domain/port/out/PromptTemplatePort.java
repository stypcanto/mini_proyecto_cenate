package com.styp.cenate.ai.domain.port.out;

import java.util.Map;

/**
 * Puerto de salida para gestión de templates de prompts.
 *
 * Centraliza la gestión de prompts para diferentes casos de uso,
 * permitiendo versionar, externalizar y parametrizar instrucciones al LLM.
 *
 * Implementaciones: FileSystemPromptTemplateAdapter, DatabasePromptTemplateAdapter
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public interface PromptTemplatePort {

    /**
     * Obtiene un template de prompt por su identificador.
     *
     * @param templateId Identificador del template (ej: "chatbot-disponibilidad-v1")
     * @return Contenido del template
     * @throws com.styp.cenate.ai.domain.exception.PromptValidationException Si no existe
     */
    String getTemplate(String templateId);

    /**
     * Obtiene un template de prompt y lo rellena con variables.
     *
     * Ejemplo:
     * Template: "Busca disponibilidad para especialidad {especialidad} en IPRESS {ipress}"
     * Variables: {"especialidad": "Cardiología", "ipress": "Hospital Rebagliati"}
     * Resultado: "Busca disponibilidad para especialidad Cardiología en IPRESS Hospital Rebagliati"
     *
     * @param templateId Identificador del template
     * @param variables Mapa de variables a reemplazar
     * @return Prompt completo con variables reemplazadas
     * @throws com.styp.cenate.ai.domain.exception.PromptValidationException Si falta alguna variable
     */
    String fillTemplate(String templateId, Map<String, String> variables);

    /**
     * Guarda o actualiza un template de prompt.
     *
     * @param templateId Identificador único del template
     * @param contenido Contenido del prompt
     * @param version Versión del template (para control de cambios)
     * @throws com.styp.cenate.ai.domain.exception.PromptValidationException Si ya existe con otra versión
     */
    void saveTemplate(String templateId, String contenido, String version);

    /**
     * Lista todos los templates disponibles.
     *
     * @return Mapa de templateId → versión
     */
    Map<String, String> listTemplates();
}
