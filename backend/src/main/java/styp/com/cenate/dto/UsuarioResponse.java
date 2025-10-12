package styp.com.cenate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

/**
 * DTO que representa la respuesta estándar de un usuario,
 * incluyendo información básica, roles, permisos y mensajes personalizados.
 */
@Data
@Builder
public class UsuarioResponse {

    private Long idUser;
    private String username;
    private String nameUser;
    private String estado;
    private String statUser;
    private Set<String> roles;
    private Set<String> permisos;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;
    private int failedAttempts;
    private boolean isLocked;

    // ✅ Nuevo campo para mensajes informativos (ej. “Usuario creado exitosamente”)
    private String message;
}