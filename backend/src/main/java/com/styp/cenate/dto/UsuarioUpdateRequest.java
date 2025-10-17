package com.styp.cenate.dto;

import lombok.Data;

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
}