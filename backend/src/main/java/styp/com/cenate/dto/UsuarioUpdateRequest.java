package styp.com.cenate.dto;

import lombok.Data;

/**
 * DTO para actualizar los datos básicos de un usuario.
 */
@Data
public class UsuarioUpdateRequest {
    private String username;  // Nuevo nombre de usuario (opcional)
    private String estado;    // ACTIVO / INACTIVO
}