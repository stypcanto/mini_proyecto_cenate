package com.styp.cenate.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Excepción personalizada con código de estado HTTP
 */
@Getter
public class CustomException extends RuntimeException {
    
    private final HttpStatus status;
    
    public CustomException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }
    
    public CustomException(String message, HttpStatus status, Throwable cause) {
        super(message, cause);
        this.status = status;
    }
}
