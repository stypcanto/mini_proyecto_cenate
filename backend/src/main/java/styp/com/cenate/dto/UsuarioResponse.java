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
}
