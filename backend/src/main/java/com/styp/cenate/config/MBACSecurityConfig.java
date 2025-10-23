package com.styp.cenate.config;
import lombok.Data;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler;
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import com.styp.cenate.security.mbac.MBACPermissionEvaluator;

/**
 * Configuración de seguridad de métodos con soporte para MBAC.
 * 
 * Habilita:
 * - Spring Security Method Security con @PreAuthorize
 * - Evaluador de permisos personalizado (MBAC)
 * - Aspectos de Spring AOP para interceptar anotaciones personalizadas
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Configuration
@EnableMethodSecurity(prePostEnabled = true, securedEnabled = true)
@EnableAspectJAutoProxy
@RequiredArgsConstructor
@Data
public class MBACSecurityConfig {

    private final MBACPermissionEvaluator mbacPermissionEvaluator;

    /**
     * Configura el MethodSecurityExpressionHandler para usar
     * el evaluador de permisos MBAC personalizado.
     */
    @Bean
    public MethodSecurityExpressionHandler methodSecurityExpressionHandler() {
        DefaultMethodSecurityExpressionHandler expressionHandler = 
            new DefaultMethodSecurityExpressionHandler();
        
        expressionHandler.setPermissionEvaluator(mbacPermissionEvaluator);
        
        return expressionHandler;
    }
}
