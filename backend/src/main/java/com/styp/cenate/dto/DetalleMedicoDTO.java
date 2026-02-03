package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que contiene la información del médico asociado a un servicio (especialidad)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleMedicoDTO {

    // Datos del personal médico
    private Long idPers;
    private String nombre; // Nombre completo (nom_pers + ape_pater_pers + ape_mater_pers)
    private String numDocPers;
    private String emailPers;
    private String emailCorpPers;
    private String movilPers;
    private String genPers; // M/F
    
    // Datos del área
    private Long idArea;
    private String descArea;
    
    // Datos del régimen laboral
    private Long idRegimenLaboral;
    private String descRegimenLaboral;
    
    // Estado del personal
    private String statPers; // A (Activo) / I (Inactivo)
    
    // Datos profesionales
    private String colegPers; // Colegiatura
    private String perPers; // Especialidad/Perito
}
