package com.styp.cenate.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.styp.cenate.exception.WeakPasswordException;
import java.util.HashMap;
import java.util.Map;

/**
 * 🌐 GlobalExceptionHandler
 * Centraliza el manejo de excepciones para toda la aplicación.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ======================================================
    // 1️⃣ Errores de validación
    // ======================================================
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            fieldErrors.put(fieldName, errorMessage);
        });

        log.warn("⚠️ Error de validación: {}", fieldErrors);
        Map<String, Object> response = new HashMap<>();
        response.put("status", HttpStatus.BAD_REQUEST.value());
        response.put("error", "Error de validación");
        response.put("validationErrors", fieldErrors);

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ======================================================
    // 2️⃣ Contraseñas débiles
    // ======================================================
    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<Map<String, String>> handleWeakPasswordException(WeakPasswordException ex) {
        log.warn("⚠️ Contraseña débil: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ======================================================
    // 3️⃣ Excepciones personalizadas de negocio
    // ======================================================
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Map<String, String>> handleBusinessException(BusinessException ex) {
        log.warn("⚠️ Excepción de negocio: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
    }

    // ======================================================
    // 4️⃣ Excepciones de validación lógicas
    // ======================================================
    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<Map<String, String>> handleValidationException(ValidationException ex) {
        log.warn("⚠️ Excepción de validación: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ======================================================
    // 5️⃣ RuntimeException (errores esperados)
    // ======================================================
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException ex) {
        log.error("❌ Error controlado: {}", ex.getMessage());
        Map<String, String> response = new HashMap<>();
        response.put("message", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // ======================================================
    // 6️⃣ Errores generales
    // ======================================================
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneralException(Exception ex) {
        log.error("💥 Error inesperado en el servidor: {}", ex.getMessage(), ex);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Ha ocurrido un error interno en el servidor");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}