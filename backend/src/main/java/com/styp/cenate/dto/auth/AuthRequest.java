package com.styp.cenate.dto.auth;

import lombok.Data;

/**
 * 📥 DTO de autenticación MBAC (solicitud de login)
 * Contiene las credenciales del usuario (username y password).
 */
@Data
public class AuthRequest {
    private String username;
    private String password;
}