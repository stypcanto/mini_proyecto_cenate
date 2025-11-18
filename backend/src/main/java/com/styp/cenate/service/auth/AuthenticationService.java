package com.styp.cenate.service.auth;

import com.styp.cenate.dto.UsuarioCreateRequest;
import com.styp.cenate.dto.UsuarioResponse;
import com.styp.cenate.dto.auth.AuthRequest;
import com.styp.cenate.dto.auth.AuthResponse;

/**
 * 🔐 Interfaz de servicio de autenticación MBAC (CENATE 2025)
 * Gestiona:
 *   - Autenticación (JWT)
 *   - Creación de usuarios
 *   - Cambio de contraseñas
 */
public interface AuthenticationService {

    /** Autenticación principal MBAC (retorna token JWT + roles/permisos) */
    AuthResponse authenticate(AuthRequest request);

    /** Creación de un nuevo usuario MBAC */
    UsuarioResponse createUser(UsuarioCreateRequest request);

    /** Cambio de contraseña con validación y seguridad */
    void changePassword(String username, String currentPassword, String newPassword, String confirmPassword);
}