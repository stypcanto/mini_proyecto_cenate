package com.styp.cenate.security.mbac;

import java.lang.annotation.*;

/**
 * Anotación para verificar permisos MBAC en métodos de controladores.
 * 
 * Esta anotación permite especificar la página y acción requeridas
 * para ejecutar un endpoint específico.
 * 
 * Ejemplo de uso:
 * <pre>
 * {@code @CheckMBACPermission(pagina = "/roles/medico/pacientes", accion = "ver")}
 * public ResponseEntity<?> listarPacientes() { ... }
 * </pre>
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CheckMBACPermission {
    
    /**
     * Ruta de la página del sistema.
     * Debe coincidir con la ruta almacenada en dim_paginas_modulo.
     */
    String pagina();
    
    /**
     * Acción requerida (ver, crear, editar, eliminar, exportar, aprobar).
     */
    String accion();
    
    /**
     * Mensaje a mostrar cuando el permiso es denegado.
     */
    String mensajeDenegado() default "No tiene permisos para realizar esta acción";
}
