package com.styp.cenate.dto;

import lombok.Data;

/**
 * DTO para actualizar información completa del personal.
 * Incluye datos personales, profesionales y laborales.
 */
@Data
public class PersonalUpdateRequest {
    
    // === Datos personales ===
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String numeroDocumento;
    private String tipoDocumento;
    private String genero;
    private String fechaNacimiento;
    private String telefono;
    private String correoPersonal;
    private String correoInstitucional;
    private String direccion;
    
    // === Datos profesionales ===
    private Long idProfesion;
    private String descProfOtro;  // Descripción cuando selecciona "OTRO"
    private String colegiatura;
    private Long idEspecialidad;
    private String rne;
    
    // === Datos laborales ===
    private Long idRegimenLaboral;
    private String codigoPlanilla;
    private String periodoIngreso;
    private Long idIpress;
    private Long idArea;
    private Long idTipPers; // Tipo de profesional (dim_tipo_personal)
    private String estado; // A = Activo, I = Inactivo
}
