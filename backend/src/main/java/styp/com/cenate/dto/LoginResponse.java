package styp.com.cenate.dto;

import lombok.*;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    @Builder.Default
    private String type = "Bearer";

    private String token;
    private Long userId;
    private String username;
    private Set<String> roles;
    private Set<String> permisos;
    private String message;
}
