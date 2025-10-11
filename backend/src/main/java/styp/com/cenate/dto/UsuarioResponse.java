package styp.com.cenate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

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

    // Constructor necesario para Lombok Builder
    public UsuarioResponse(Long idUser, String username, String nameUser, String estado,
                           String statUser, Set<String> roles, Set<String> permisos,
                           LocalDateTime lastLoginAt, LocalDateTime createAt,
                           LocalDateTime updateAt, int failedAttempts, boolean isLocked) {
        this.idUser = idUser;
        this.username = username;
        this.nameUser = nameUser;
        this.estado = estado;
        this.statUser = statUser;
        this.roles = roles;
        this.permisos = permisos;
        this.lastLoginAt = lastLoginAt;
        this.createAt = createAt;
        this.updateAt = updateAt;
        this.failedAttempts = failedAttempts;
        this.isLocked = isLocked;
    }

    // Constructor vacío
    public UsuarioResponse() {
    }
}