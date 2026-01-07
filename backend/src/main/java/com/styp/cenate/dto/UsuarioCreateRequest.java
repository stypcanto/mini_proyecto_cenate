package com.styp.cenate.dto;

import lombok.Data;
import java.util.List;

/**
 * DTO para creación completa de usuarios internos.
 * Incluye datos personales, laborales y de contacto.
 *
 * 🆕 v1.18.0 - Password es OPCIONAL:
 * - Si NO se proporciona → sistema genera password aleatorio + envía email con token
 * - Si se proporciona → se usa directamente (para compatibilidad/importación masiva)
 */
@Data
public class UsuarioCreateRequest {
    // Credenciales
    private String username;
    private String password; // 🆕 OPCIONAL - Si es null, se genera automáticamente
    
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
    
    // Rol del Sistema (LEGACY - mantener compatibilidad)
    private String rol; // MEDICO, ENFERMERO, ADMIN, SUPERADMIN, PERSONAL_CNT, PERSONAL_EXTERNO
    
    // 🆕 ROLES MÚLTIPLES (Sistema MBAC) - Lista de roles para asignar
    // Solo puede ser usado por usuarios con rol SUPERADMIN
    private List<String> roles;
    
    // Estado inicial
    private String estado = "ACTIVO"; // Por defecto ACTIVO
    
    // Tipo de Personal (INTERNO/EXTERNO)
    private String tipo_personal; // Interno, Externo, CENATE, EXTERNO
    
    // ID de la IPRESS
    private Long idIpress; // ID de la institución (IPRESS)
    
    // Datos Laborales Opcionales (LEGACY - mantener compatibilidad)
    private String ipress;
    private String area;
    private String profesion;
    private String regimen_laboral;
    private String codigo_planilla;
    
    private Long id_origen;
    
    // 🆕 DATOS PROFESIONALES
    private Long id_profesion;
    private String desc_prof_otro; // Campo para especificar cuando selecciona OTRO
    private String colegiatura;
    private Long id_especialidad; // ID de servicio ESSI (especialidad)
    private String rne; // Registro Nacional de Especialidad
    
    // 🆕 DATOS LABORALES
    private Long id_regimen_laboral;
    private Long id_tip_pers; // Tipo de profesional (dim_tipo_personal)
    private String codigo_planilla_alt; // Campo alternativo para código de planilla
    private String periodo_ingreso; // Formato YYYYMM
    private Long id_area;

    // 🆕 FIRMA DIGITAL (v1.14.0)
    private FirmaDigitalRequest firmaDigital; // Datos de firma digital del personal
}
