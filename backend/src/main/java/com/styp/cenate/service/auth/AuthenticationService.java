package com.styp.cenate.service.auth;

import com.styp.cenate.dto.*;

public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

    UsuarioResponse createUser(UsuarioCreateRequest request);

    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);
}