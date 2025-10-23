package com.styp.cenate.security.mbac;
import lombok.Data;

import com.styp.cenate.service.mbac.PermisosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.PermissionEvaluator;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.io.Serializable;

/**
 * 🔐 Evaluador de permisos MBAC para Spring Security.
 * --------------------------------------------------
 * Valida dinámicamente los permisos del usuario actual contra la vista vw_permisos_activos.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Data
public class MBACPermissionEvaluator implements PermissionEvaluator {

    private final PermisosService permisosService;

    @Override
    public boolean hasPermission(Authentication authentication, Object targetDomainObject, Object permission) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        try {
            String username = authentication.getName();
            String rutaPagina = (targetDomainObject != null) ? targetDomainObject.toString() : null;
            String accion = (permission != null) ? permission.toString() : null;

            Long userId = permisosService.obtenerUserIdPorUsername(username);
            if (userId == null || rutaPagina == null || accion == null) {
                log.warn("⚠️ Parámetros inválidos para evaluación MBAC: userId={}, ruta={}, acción={}", userId, rutaPagina, accion);
                return false;
            }

            boolean tienePermiso = permisosService.validarPermiso(userId, rutaPagina, accion);

            log.debug("🔐 Evaluando permiso [{}] para [{}] en [{}]: {}", accion, username, rutaPagina, tienePermiso);
            return tienePermiso;
        } catch (Exception e) {
            log.error("⚠️ Error al evaluar permiso MBAC: {}", e.getMessage(), e);
            return false;
        }
    }

    @Override
    public boolean hasPermission(Authentication authentication, Serializable targetId, String targetType, Object permission) {
        return false;
    }
}