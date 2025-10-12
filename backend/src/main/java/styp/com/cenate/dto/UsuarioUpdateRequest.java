package styp.com.cenate.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UsuarioUpdateRequest {
    private String nameUser;      // Nombre completo o visible
    private String estado;        // ACTIVO / INACTIVO
    private Set<String> roles;    // Lista de roles
}
