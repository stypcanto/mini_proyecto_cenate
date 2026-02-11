package com.styp.cenate.dto.auth;

import lombok.Builder;
import lombok.Data;
import java.util.List;

/**
 * 📤 DTO de autenticación MBAC (respuesta de login)
 * Devuelve el token JWT, roles, permisos y otros datos de sesión.
 */
@Data
@Builder
public class AuthResponse {
    private String token;
    private Long id_user;  // 🆕 ID del usuario para el frontend
    private String username;
    private String nombreCompleto;
    private String foto;  // 📷 URL completa de la foto del usuario
    private List<String> roles;
    private List<String> permisos;
    private Boolean requiereCambioPassword; // 🔑 Debe cambiar contraseña y actualizar datos
    private String sessionId;  // 🆕 ID de la sesión activa
    private String message;
    private String especialidad;  // ✅ v1.77.0: Especialidad del médico (Cardiología, etc.)
}