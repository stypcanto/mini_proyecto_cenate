package styp.com.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

/**
 * 📦 DTO de respuesta al iniciar sesión
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String type;              // ✅ Ej: "Bearer"
    private String token;             // 🔑 Token JWT
    private Long userId;              // 🆔 ID del usuario
    private String username;          // 👤 Nombre de usuario (login)
    private String nombreCompleto;    // 🧾 Nombre completo para mostrar en el frontend
    private String rolPrincipal;      // 🏷️ Rol principal (ej: ADMIN)
    private List<String> roles;       // 📜 Lista de roles
    private List<String> permisos;    // 🔐 Lista de permisos
    private String message;           // 📨 Mensaje de éxito o error
}