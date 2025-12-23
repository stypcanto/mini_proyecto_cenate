package com.styp.cenate.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO para actualizar los datos básicos de un usuario del sistema.
 * Utilizado por administradores o procesos internos de mantenimiento.
 */
@Data
public class UsuarioUpdateRequest {

    /**
     * Nuevo nombre de usuario (opcional).
     * Si se envía vacío o nulo, no se actualiza.
     */
    private String username;

    /**
     * Estado del usuario.
     * Valores esperados: "ACTIVO" o "INACTIVO".
     */
    private String estado;
    
    /**
     * Lista de roles a asignar al usuario (opcional).
     * Si se envía, reemplaza todos los roles actuales del usuario.
     * Si es null o vacío, no se modifican los roles.
     */
    private List<String> roles;

    /**
     * ID de la Red asignada al usuario (para COORDINADOR_RED).
     * Si se envía, asocia la red al usuario.
     * Si es null, no se modifica la red actual.
     */
    private Long idRed;
}