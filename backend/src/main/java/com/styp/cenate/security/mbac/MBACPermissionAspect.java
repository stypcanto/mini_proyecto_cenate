package com.styp.cenate.security.mbac;
import lombok.extern.slf4j.Slf4j;

import lombok.RequiredArgsConstructor;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import com.styp.cenate.model.Usuario;
import com.styp.cenate.repository.UsuarioRepository;
import com.styp.cenate.service.mbac.PermisosService;

import java.lang.reflect.Method;
import java.util.Optional;

/**
 * Aspecto de Spring AOP para interceptar métodos anotados con @CheckMBACPermission.
 * 
 * Este aspecto verifica automáticamente que el usuario actual tenga
 * los permisos necesarios antes de ejecutar el método.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class MBACPermissionAspect {

    private final PermisosService permisosService;
    private final UsuarioRepository usuarioRepository;

    /**
     * Intercepta todos los métodos anotados con @CheckMBACPermission.
     */
    @Around("@annotation(com.styp.cenate.security.mbac.CheckMBACPermission)")
    public Object checkPermission(ProceedingJoinPoint joinPoint) throws Throwable {
        // Obtener el método y la anotación
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        Method method = signature.getMethod();
        CheckMBACPermission annotation = method.getAnnotation(CheckMBACPermission.class);

        if (annotation == null) {
            log.warn("No se encontró la anotación @CheckMBACPermission en el método: {}", method.getName());
            return joinPoint.proceed();
        }

        // Obtener la autenticación actual
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Usuario no autenticado intentando acceder a: {}", method.getName());
            throw new AccessDeniedException("Usuario no autenticado");
        }

        String username = authentication.getName();
        String pagina = annotation.pagina();
        String accion = annotation.accion();

        log.debug("Verificando permiso MBAC - Usuario: {}, Página: {}, Acción: {}", 
                  username, pagina, accion);

        // Obtener el ID del usuario
        Optional<Usuario> usuarioOpt = usuarioRepository.findByNameUser(username);
        
        if (usuarioOpt.isEmpty()) {
            log.error("Usuario no encontrado en la base de datos: {}", username);
            throw new AccessDeniedException("Usuario no encontrado");
        }

        Long userId = usuarioOpt.get().getIdUser();

        // Verificar el permiso
        boolean tienePermiso = permisosService.tienePermiso(userId, pagina, accion);

        if (!tienePermiso) {
            log.warn("Permiso denegado - Usuario: {}, Página: {}, Acción: {}", 
                     username, pagina, accion);
            throw new AccessDeniedException(annotation.mensajeDenegado());
        }

        log.debug("Permiso concedido - Usuario: {}, Página: {}, Acción: {}", 
                  username, pagina, accion);

        // Proceder con la ejecución del método
        return joinPoint.proceed();
    }
}
