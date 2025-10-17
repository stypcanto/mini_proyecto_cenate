package com.styp.cenate.security.mbac;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import com.styp.cenate.service.mbac.PermisosService;

import java.io.Serializable;

/**
 * Evaluador de permisos personalizado para el modelo MBAC.
 * 
 * Se integra con Spring Security para evaluar permisos dinámicamente
 * basados en la base de datos en lugar de anotaciones estáticas.
 * 
 * Uso en controladores:
 * <pre>
 * {@code @PreAuthorize("hasPermission(#request, 'ver')")}
 * public ResponseEntity<?> obtenerDatos(CheckPermisoRequestDTO request) { ... }
 * </pre>
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class MBACPermissionEvaluator implements PermissionEvaluator {

    private final PermisosService permisosService;

    /**
     * Evalúa si el usuario autenticado tiene permiso sobre un objeto específico.
     * 
     * @param authentication La autenticación del usuario actual
     * @param targetDomainObject El objeto de dominio objetivo (puede ser una ruta de página)
     * @param permission El permiso a verificar (ver, crear, editar, eliminar, exportar, aprobar)
     * @return true si el usuario tiene el permiso, false en caso contrario
     */
    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Usuario no autenticado intentando acceder a recurso");
            return false;
        }

        if (targetDomainObject == null || permission == null) {
            log.warn("Objeto de dominio o permiso es nulo");
            return false;
        }

        String username = getUsername(authentication);
        String rutaPagina = targetDomainObject.toString();
        String accion = permission.toString();

        log.debug("Evaluando permiso - Usuario: {}, Página: {}, Acción: {}", 
                  username, rutaPagina, accion);

        try {
            // Aquí necesitamos obtener el ID del usuario desde el username
            // Por ahora, verificaremos directamente con el username
            Long userId = getUserIdFromAuthentication(authentication);
            
            if (userId == null) {
                log.error("No se pudo obtener el ID del usuario para: {}", username);
                return false;
            }

            boolean tienePermiso = permisosService.tienePermiso(userId, rutaPagina, accion);
            log.debug("Resultado de evaluación de permiso: {}", tienePermiso);
            
            return tienePermiso;
            
        } catch (Exception e) {
            log.error("Error al evaluar permiso para usuario {}: {}", username, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Evalúa si el usuario autenticado tiene permiso sobre un objeto identificado por su ID.
     * 
     * @param authentication La autenticación del usuario actual
     * @param targetId El ID del objeto objetivo
     * @param targetType El tipo del objeto objetivo
     * @param permission El permiso a verificar
     * @return true si el usuario tiene el permiso, false en caso contrario
     */
    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, 
                                String targetType, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        log.debug("Evaluando permiso por ID - Usuario: {}, TargetId: {}, TargetType: {}, Permission: {}", 
                  getUsername(authentication), targetId, targetType, permission);

        // Implementación específica según el tipo de objeto
        // Por ahora, delegamos a la implementación basada en objeto
        return hasPermission(authentication, targetType, permission);
    }

    /**
     * Extrae el nombre de usuario de la autenticación.
     */
    private String getUsername(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            return ((UserDetails) principal).getUsername();
        }
        
        return principal.toString();
    }

    /**
     * Extrae el ID del usuario desde el objeto de autenticación.
     * Esto asume que el UserDetails personalizado tiene un método para obtener el ID.
     */
    private Long getUserIdFromAuthentication(Authentication authentication) {
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof UserDetails) {
            // Aquí intentamos extraer el ID del usuario
            // Esto depende de cómo esté implementado tu UserDetails
            try {
                // Si tu UserDetailsServiceImpl retorna un User con el ID como parte del objeto
                // necesitarás ajustar esto según tu implementación
                String username = ((UserDetails) principal).getUsername();
                
                // Por ahora, retornamos null y el servicio debe manejar esto
                // Idealmente, deberías tener una manera de obtener el userId desde el UserDetails
                log.warn("No se pudo extraer userId desde UserDetails para username: {}", username);
                return null;
                
            } catch (Exception e) {
                log.error("Error al extraer userId: {}", e.getMessage());
                return null;
            }
        }
        
        return null;
    }
}
