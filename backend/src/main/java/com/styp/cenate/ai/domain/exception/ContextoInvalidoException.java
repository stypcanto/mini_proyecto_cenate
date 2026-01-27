package com.styp.cenate.ai.domain.exception;

/**
 * Excepción lanzada cuando el contexto de conversación es inválido.
 *
 * Puede ocurrir por:
 * - Sesión no encontrada o expirada
 * - Límite de mensajes excedido
 * - Datos de contexto inconsistentes
 * - Intento de acceso a sesión de otro usuario
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.35.0
 * @since 2026-01-26
 */
public class ContextoInvalidoException extends RuntimeException {

    private final String sessionId;

    public ContextoInvalidoException(String mensaje) {
        super(mensaje);
        this.sessionId = null;
    }

    public ContextoInvalidoException(String mensaje, Throwable causa) {
        super(mensaje, causa);
        this.sessionId = null;
    }

    public ContextoInvalidoException(String mensaje, String sessionId) {
        super(mensaje);
        this.sessionId = sessionId;
    }

    public String getSessionId() {
        return sessionId;
    }
}
