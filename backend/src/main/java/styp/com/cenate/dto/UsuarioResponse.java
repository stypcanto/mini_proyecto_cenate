package styp.com.cenate.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO que representa la respuesta estándar de un usuario del sistema,
 * incluyendo información básica, roles, permisos y estado de cuenta.
 */
@Data
@Builder
public class UsuarioResponse {

    private Long idUser;
    private String username;
    private String estado;
    private Set<String> roles;
    private Set<String> permisos;

    private LocalDateTime lastLoginAt;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    private Integer failedAttempts;
    private boolean isLocked;

    // ✅ Campo opcional para mensajes informativos (ej. “Usuario creado exitosamente”)
    private String message;
}