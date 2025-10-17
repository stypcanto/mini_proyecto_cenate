package com.styp.cenate.exception;

/**
 * Excepción lanzada cuando falla la validación de datos
 */
public class ValidationException extends RuntimeException {
    
    public ValidationException(String message) {
        super(message);
    }
    
    public ValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
