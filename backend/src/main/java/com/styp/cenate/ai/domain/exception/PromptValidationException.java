package com.styp.cenate.ai.domain.exception;

/**
 * Excepción lanzada cuando hay error en la validación de prompts.
 *
 * Puede ocurrir por:
 * - Template no encontrado
 * - Variables faltantes en el template
 * - Formato inválido del prompt
 * - Prompt excede longitud máxima
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public class PromptValidationException extends RuntimeException {

    private final String templateId;

    public PromptValidationException(String mensaje) {
        super(mensaje);
        this.templateId = null;
    }

    public PromptValidationException(String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.templateId = null;
    }

    public PromptValidationException(String mensaje, String templateId) {
        super(mensaje);
        this.templateId = templateId;
    }

    public String getTemplateId() {
        return templateId;
    }
}
