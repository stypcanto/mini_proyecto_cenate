package styp.com.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioCreateRequest {
    
    @NotBlank(message = "El nombre de usuario es requerido")
    private String username;
    
    @NotBlank(message = "La contraseña es requerida")
    private String password;
    
    @NotNull(message = "Se debe asignar al menos un rol")
    private Set<Integer> roleIds;
    
    @Builder.Default
    private String estado = "ACTIVO";
}
