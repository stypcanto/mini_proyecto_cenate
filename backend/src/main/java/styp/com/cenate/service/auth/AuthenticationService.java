package styp.com.cenate.service.auth;

import styp.com.cenate.dto.*;

public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

    UsuarioResponse createUser(UsuarioCreateRequest request);

    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);
}