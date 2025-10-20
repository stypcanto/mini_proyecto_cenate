package com.styp.cenate.service.auth;

import com.styp.cenate.dto.LoginRequest;
import com.styp.cenate.dto.LoginResponse;
import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;

public interface AuthenticationService {

    // Login principal
    LoginResponse login(LoginRequest request);

    // Crear usuario
    UsuarioResponse createUser(UsuarioCreateRequest request);

    // Cambio de contraseña
    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);
}
