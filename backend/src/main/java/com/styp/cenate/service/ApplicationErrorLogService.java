package com.styp.cenate.service;

import com.styp.cenate.model.ApplicationErrorLog;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.ApplicationErrorLogRepository;
import com.styp.cenate.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletRequest;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map;

/**
 * Servicio para registro centralizado de errores
 * 
 * Proporciona métodos para registrar errores de diferentes categorías
 * con contexto completo (HTTP, usuario, excepción, etc.)
 * 
 * Usa REQUIRES_NEW para asegurar que los logs se persistan
 * incluso si la transacción principal falla.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationErrorLogService {

    private final ApplicationErrorLogRepository errorLogRepository;
    private final UsuarioRepository usuarioRepository;
    private final ObjectMapper objectMapper;

    /**
     * Registra un error de base de datos
     * 
     * @param exception Excepción SQL
     * @param request Request HTTP (puede ser null)
     * @param userName Nombre del usuario (puede ser null)
     * @param additionalContext Contexto adicional
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logDatabaseError(
        SQLException exception,
        HttpServletRequest request,
        String userName,
        Map<String, Object> additionalContext
    ) {
        try {
            // Buscar usuario por nombre y extraer ID
            Long userId = null;
            if (userName != null && !userName.isEmpty()) {
                var usuarioOpt = usuarioRepository.findByNameUser(userName);
                if (usuarioOpt.isPresent()) {
                    userId = usuarioOpt.get().getIdUser();
                }
            }

            ApplicationErrorLog errorLog = ApplicationErrorLog.builder()
                .errorCategory("DATABASE")
                .errorCode(exception.getSQLState())
                .exceptionClass(exception.getClass().getName())
                .message(exception.getMessage())
                .rootCauseMessage(getRootCauseMessage(exception))
                .stackTrace(getStackTrace(exception))
                .sqlState(exception.getSQLState())
                .userId(userId)
                .userName(userName)
                .additionalData(toJson(additionalContext))
                .build();

            if (request != null) {
                populateHttpContext(errorLog, request);
            }

            errorLogRepository.save(errorLog);
            log.info("✅ Error de BD registrado: ID={}, SQLState={}", errorLog.getId(), exception.getSQLState());

        } catch (Exception e) {
            log.error("❌ Error al registrar error de BD en BD: {}", e.getMessage(), e);
            // Fallback: escribir registro en archivo para no perder la información
            try {
                writeFallbackLog("DATABASE", exception, request, userName, additionalContext);
            } catch (Exception fwEx) {
                log.error("❌ No se pudo escribir fallback log: {}", fwEx.getMessage(), fwEx);
            }
        }
    }

    /**
     * Registra un error genérico de aplicación
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logError(
        String category,
        String errorCode,
        Exception exception,
        HttpServletRequest request,
        String userName,
        Map<String, Object> additionalContext
    ) {
        try {
            // Buscar usuario por nombre y extraer ID
            Long userId = null;
            if (userName != null && !userName.isEmpty()) {
                var usuarioOpt = usuarioRepository.findByNameUser(userName);
                if (usuarioOpt.isPresent()) {
                    userId = usuarioOpt.get().getIdUser();
                }
            }

            ApplicationErrorLog errorLog = ApplicationErrorLog.builder()
                .errorCategory(category)
                .errorCode(errorCode)
                .exceptionClass(exception.getClass().getName())
                .message(exception.getMessage())
                .rootCauseMessage(getRootCauseMessage(exception))
                .stackTrace(getStackTrace(exception))
                .userId(userId)
                .userName(userName)
                .additionalData(toJson(additionalContext))
                .build();

            if (request != null) {
                populateHttpContext(errorLog, request);
            }

            errorLogRepository.save(errorLog);
            log.info("✅ Error registrado: ID={}, Category={}, Code={}", 
                errorLog.getId(), category, errorCode);

        } catch (Exception e) {
            log.error("❌ Error al registrar error de aplicación en BD: {}", e.getMessage(), e);
            try {
                writeFallbackLog(category, exception, request, userName, additionalContext);
            } catch (Exception fwEx) {
                log.error("❌ No se pudo escribir fallback log: {}", fwEx.getMessage(), fwEx);
            }
        }
    }

    /**
     * Registra un error de violación de constraint FK
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logForeignKeyViolation(
        String constraintName,
        String tableName,
        String message,
        Exception exception,
        HttpServletRequest request,
        String userName,
        Map<String, Object> additionalContext
    ) {
        try {
            // Buscar usuario por nombre y extraer ID
            Long userId = null;
            if (userName != null && !userName.isEmpty()) {
                var usuarioOpt = usuarioRepository.findByNameUser(userName);
                if (usuarioOpt.isPresent()) {
                    userId = usuarioOpt.get().getIdUser();
                }
            }

            ApplicationErrorLog errorLog = ApplicationErrorLog.builder()
                .errorCategory("DATABASE")
                .errorCode("FOREIGN_KEY_VIOLATION")
                .exceptionClass(exception.getClass().getName())
                .message(message)
                .rootCauseMessage(getRootCauseMessage(exception))
                .stackTrace(getStackTrace(exception))
                .constraintName(constraintName)
                .tableName(tableName)
                .sqlState("23503")
                .userId(userId)
                .userName(userName)
                .additionalData(toJson(additionalContext))
                .build();

            if (request != null) {
                populateHttpContext(errorLog, request);
            }

            errorLogRepository.save(errorLog);
            log.info("✅ FK violation registrado: ID={}, Constraint={}, Table={}", 
                errorLog.getId(), constraintName, tableName);

        } catch (Exception e) {
            log.error("❌ Error al registrar FK violation en BD: {}", e.getMessage(), e);
            try {
                writeFallbackLog("DATABASE", exception, request, userName, additionalContext);
            } catch (Exception fwEx) {
                log.error("❌ No se pudo escribir fallback log: {}", fwEx.getMessage(), fwEx);
            }
        }
    }

    /**
     * Marca un error como resuelto
     */
    @Transactional
    public void markAsResolved(Long errorId) {
        errorLogRepository.findById(errorId).ifPresent(error -> {
            error.markAsResolved();
            errorLogRepository.save(error);
            log.info("✅ Error {} marcado como resuelto", errorId);
        });
    }

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================

    private void populateHttpContext(ApplicationErrorLog errorLog, HttpServletRequest request) {
        errorLog.setHttpMethod(request.getMethod());
        errorLog.setEndpoint(request.getRequestURI());
        errorLog.setIpAddress(getClientIpAddress(request));
    }

    private String getClientIpAddress(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("X-Real-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }

    private String getRootCauseMessage(Throwable throwable) {
        Throwable rootCause = throwable;
        while (rootCause.getCause() != null && rootCause.getCause() != rootCause) {
            rootCause = rootCause.getCause();
        }
        return rootCause.getMessage();
    }

    private String getStackTrace(Throwable throwable) {
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        throwable.printStackTrace(pw);
        String stackTrace = sw.toString();
        
        // Limitar a 10000 caracteres para evitar textos gigantes
        return stackTrace.length() > 10000 ? stackTrace.substring(0, 10000) + "..." : stackTrace;
    }

    private String toJson(Map<String, Object> context) {
        if (context == null || context.isEmpty()) {
            return null;
        }
        try {
            // Usar ObjectMapper para serializar a JSON string
            return objectMapper.writeValueAsString(context);
        } catch (Exception e) {
            return "{\"error\": \"Failed to serialize context\"}";
        }
    }

    // Fallback: escribir registro en archivo local en caso de que la DB no acepte la inserción
    private void writeFallbackLog(String category, Throwable ex, HttpServletRequest request, String userId, Map<String, Object> context) {
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("timestamp", java.time.OffsetDateTime.now().toString());
            payload.put("category", category);
            payload.put("exception", ex.getClass().getName());
            payload.put("message", ex.getMessage());
            payload.put("rootCause", getRootCauseMessage(ex));
            payload.put("stack", getStackTrace(ex));
            payload.put("userId", userId);
            if (request != null) {
                payload.put("method", request.getMethod());
                payload.put("endpoint", request.getRequestURI());
                payload.put("ip", getClientIpAddress(request));
            }
            if (context != null) payload.put("context", context);

            String text = objectMapper.writeValueAsString(payload) + System.lineSeparator();
            java.nio.file.Path logPath = java.nio.file.Paths.get("logs", "application_error_fallback.log");
            java.nio.file.Files.createDirectories(logPath.getParent());
            java.nio.file.Files.writeString(logPath, text, java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
            log.info("✅ Fallback log escrito en {}", logPath.toString());
        } catch (Exception e) {
            log.error("❌ Error writing fallback log: {}", e.getMessage(), e);
        }
    }
}
