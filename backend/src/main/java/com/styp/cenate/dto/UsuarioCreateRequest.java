package com.styp.cenate.dto;

import lombok.Data;

/**
 * DTO para creación completa de usuarios internos.
 * Incluye datos personales, laborales y de contacto.
 */
@Data
public class UsuarioCreateRequest {
    // Credenciales
    private String username;
    private String password;
    
    // Datos Personales
    private String nombres;
    private String apellido_paterno;
    private String apellido_materno;
    private String numero_documento;
    private String tipo_documento; // DNI, CE, PASAPORTE
    private String genero; // M, F
    private String fecha_nacimiento;
    
    // Datos de Contacto
    private String telefono;
    private String correo_personal;
    private String correo_corporativo;
    
    // Rol del Sistema
    private String rol; // MEDICO, ENFERMERO, ADMIN, SUPERADMIN, PERSONAL_CNT, PERSONAL_EXTERNO
    
    // Estado inicial
    private String estado = "ACTIVO"; // Por defecto ACTIVO
    
    // Datos Laborales Opcionales
    private String ipress;
    private String area;
    private String profesion;
    private String regimen_laboral;
    private String codigo_planilla;
}
