package com.styp.cenate.security.mbac;

import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.lang.reflect.Method;
import java.util.Optional;

/**
 * 🧩 Aspecto de seguridad MBAC para verificar permisos dinámicamente.
 * -----------------------------------------------------------------
 * Intercepta métodos anotados con @CheckMBACPermission
 * y valida si el usuario autenticado tiene acceso al recurso
 * (página, acción o módulo) solicitado.
 *
 * 🔒 Integración: vista PostgreSQL `vw_permisos_activos`
 * 🧠 Paquete: com.styp.cenate.security.mbac
 * 📦 Versión: 1.2 — CENATE MBAC 2025
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class MBACPermissionAspect {

    private final PermisosService permisosService;
    private final UsuarioRepository usuarioRepository;

    /**
     * Intercepta cualquier método anotado con @CheckMBACPermission
     * y verifica si el usuario tiene el permiso correspondiente.
     */
    @Around("@annotation(com.styp.cenate.security.mbac.CheckMBACPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // Obtener metadatos del método interceptado
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        CheckMBACPermission annotation = method.getAnnotation(CheckMBACPermission.class);

        if (annotation == null) {
            log.warn("⚠️ No se encontró la anotación @CheckMBACPermission en el método {}", method.getName());
            return joinPoint.proceed();
        }

        // Obtener usuario autenticado del contexto de Spring Security
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("🚫 Usuario no autenticado intentando acceder a {}", method.getName());
            throw new AccessDeniedException("Usuario no autenticado");
        }

        String username = authentication.getName();
        String pagina = annotation.pagina();
        String accion = annotation.accion();

        log.debug("🔍 Verificando permiso MBAC → Usuario: {}, Página: {}, Acción: {}", username, pagina, accion);

        // Buscar usuario en BD
        Optional<Usuario> usuarioOpt = usuarioRepository.findByNameUser(username);
        if (usuarioOpt.isEmpty()) {
            log.error("❌ Usuario no encontrado en la base de datos: {}", username);
            throw new AccessDeniedException("Usuario no encontrado");
        }

        Long userId = usuarioOpt.get().getIdUser();

        // Verificar permiso activo
        boolean tienePermiso = permisosService.validarPermiso(userId, pagina, accion);

        if (!tienePermiso) {
            log.warn("🚫 Acceso denegado → Usuario: {}, Página: {}, Acción: {}", username, pagina, accion);
            throw new AccessDeniedException(annotation.mensajeDenegado());
        }

        log.info("✅ Acceso concedido → Usuario: {}, Página: {}, Acción: {}", username, pagina, accion);

        // Permitir la ejecución del método original
        return joinPoint.proceed();
    }
}