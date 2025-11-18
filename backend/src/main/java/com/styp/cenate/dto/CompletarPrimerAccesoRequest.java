package com.styp.cenate.dto;

import lombok.*;

/**
 * 🔑 DTO para completar el primer acceso del usuario
 * Usado cuando un usuario inicia sesión por primera vez o después de un reseteo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompletarPrimerAccesoRequest {
    
    // ============================================================
    // 🔐 Cambio de contraseña
    // ============================================================
    private String passwordActual;
    private String passwordNueva;
    private String passwordConfirmacion;
    
    // ============================================================
    // 👤 Datos personales obligatorios
    // ============================================================
    private String correoPersonal;
    private String telefono;
    
    // ============================================================
    // 📧 Datos opcionales
    // ============================================================
    private String correoSecundario;
    private String telefonoSecundario;
}
