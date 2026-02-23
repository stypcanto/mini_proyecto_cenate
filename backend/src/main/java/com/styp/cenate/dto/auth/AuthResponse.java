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
    private List<MappingRolDTO> mappingRoles;  // 🆕 Mapeo codigo-descripcion de roles
    private Boolean requiereCambioPassword; // 🔑 Debe cambiar contraseña y actualizar datos
    private String sessionId;  // 🆕 ID de la sesión activa
    private String message;
    private String especialidad;  // ✅ v1.77.0: Especialidad del médico (Cardiología, etc.)
    private String nombreIpress;  // 🏥 Nombre de la IPRESS (solo usuarios externos)
    
    // 🆕 v1.78.0: Información del personal desde dim_personal_cnt
    private Long idPers;           // ID del personal (id_pers)
    private String descRegLab;     // Descripción del régimen laboral (dim_regimen_laboral)
    private Long idRegLab;         // ID del régimen laboral
    private String descArea;       // Descripción del área (dim_area)
    private Long idArea;           // ID del área
    private String descIpress;     // Descripción del IPRESS (dim_ipress)
    private Long idIpress;         // ID del IPRESS
    private String descServicio;   // Descripción del servicio (dim_servicio_essi)
    private Long idServicio;       // ID del servicio
}