package com.styp.cenate.security.aspect;

import com.styp.cenate.security.annotation.AuditarAccesoSensible;
import com.styp.cenate.service.auditlog.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;

/**
 * Aspecto AOP para auditar automáticamente el acceso a datos sensibles
 *
 * Intercepta métodos anotados con @AuditarAccesoSensible y registra
 * la acción en el sistema de auditoría
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class AuditoriaAccesoSensibleAspect {

    private final AuditLogService auditLogService;

    /**
     * Intercepta métodos anotados con @AuditarAccesoSensible
     */
    @Around("@annotation(com.styp.cenate.security.annotation.AuditarAccesoSensible)")
    public Object auditarAccesoSensible(ProceedingJoinPoint joinPoint) throws Throwable {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();

        // Obtener la anotación
        AuditarAccesoSensible auditAnnotation = method.getAnnotation(AuditarAccesoSensible.class);

        // Obtener usuario autenticado
        String usuario = obtenerUsuarioAutenticado();

        // Obtener parámetros del método (para extraer ID si es necesario)
        Object[] args = joinPoint.getArgs();
        Long idAfectado = null;

        if (auditAnnotation.incluirIdAfectado() && args.length > 0) {
            // Intentar extraer ID del primer parámetro (asumiendo que es Long o puede convertirse)
            try {
                if (args[0] instanceof Long) {
                    idAfectado = (Long) args[0];
                } else if (args[0] instanceof Integer) {
                    idAfectado = ((Integer) args[0]).longValue();
                } else if (args[0] instanceof String) {
                    idAfectado = Long.parseLong((String) args[0]);
                }
            } catch (Exception e) {
                log.debug("No se pudo extraer ID afectado del primer parámetro: {}", e.getMessage());
            }
        }

        // Construir detalle de auditoría
        String detalle = construirDetalle(auditAnnotation, method.getName(), args, idAfectado);

        // Estado inicial
        String estado = "SUCCESS";
        Throwable exception = null;

        try {
            // Ejecutar el método original
            Object result = joinPoint.proceed();

            // 🔒 AUDITORÍA EXITOSA
            auditLogService.registrarEvento(
                usuario,
                auditAnnotation.accion(),
                auditAnnotation.modulo(),
                detalle,
                auditAnnotation.nivel(),
                estado
            );

            log.info("📝 [SENSIBLE] [{}] {} - Usuario: {}",
                auditAnnotation.modulo(),
                auditAnnotation.accion(),
                usuario
            );

            return result;

        } catch (Throwable t) {
            exception = t;
            estado = "FAILURE";

            // 🔒 AUDITORÍA DE ERROR
            auditLogService.registrarEvento(
                usuario,
                auditAnnotation.accion(),
                auditAnnotation.modulo(),
                detalle + " - ERROR: " + t.getMessage(),
                "ERROR",
                estado
            );

            log.error("❌ [SENSIBLE] [{}] {} - Usuario: {} - Error: {}",
                auditAnnotation.modulo(),
                auditAnnotation.accion(),
                usuario,
                t.getMessage()
            );

            throw t; // Relanzar la excepción
        }
    }

    /**
     * Obtiene el nombre del usuario autenticado
     */
    private String obtenerUsuarioAutenticado() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener usuario autenticado: {}", e.getMessage());
        }
        return "SYSTEM";
    }

    /**
     * Construye el detalle de la auditoría
     */
    private String construirDetalle(
        AuditarAccesoSensible annotation,
        String methodName,
        Object[] args,
        Long idAfectado
    ) {
        StringBuilder sb = new StringBuilder();

        // Descripción base
        if (annotation.descripcion() != null && !annotation.descripcion().isEmpty()) {
            sb.append(annotation.descripcion());
        } else {
            sb.append("Acceso a datos sensibles - Método: ").append(methodName);
        }

        // Agregar ID si está disponible
        if (idAfectado != null) {
            sb.append(" (ID: ").append(idAfectado).append(")");
        }

        // Información adicional de parámetros (opcional)
        if (args.length > 0) {
            sb.append(" - Parámetros: ").append(args.length);
        }

        return sb.toString();
    }
}
