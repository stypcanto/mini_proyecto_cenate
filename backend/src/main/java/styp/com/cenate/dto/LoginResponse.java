package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    
    private String token;
    private String type = "Bearer";
    private Long userId;  // ✅ Cambiado de Integer a Long
    private String username;
    private Set<String> roles;
    private Set<String> permisos;
    private String message;
}
