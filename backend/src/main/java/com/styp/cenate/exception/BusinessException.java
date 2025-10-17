package com.styp.cenate.exception;

/**
 * Excepción lanzada cuando ocurre un error de lógica de negocio
 */
public class BusinessException extends RuntimeException {
    
    public BusinessException(String message) {
        super(message);
    }
    
    public BusinessException(String message, Throwable cause) {
        super(message, cause);
    }
}
