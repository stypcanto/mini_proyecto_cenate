package styp.com.cenate.service.auth;

import styp.com.cenate.dto.LoginRequest;
import styp.com.cenate.dto.LoginResponse;
import styp.com.cenate.dto.UsuarioCreateRequest;
import styp.com.cenate.dto.UsuarioResponse;

/**
 * 🧩 Servicio encargado de manejar la autenticación de usuarios,
 * incluyendo login, registro y cambio de contraseña.
 */
public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

    UsuarioResponse createUser(UsuarioCreateRequest request);

    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);
}