package styp.com.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {

    @NotBlank(message = "El nombre de usuario es requerido")
    private String username;

    @NotBlank(message = "La contraseña es requerida")
    private String password;
}
