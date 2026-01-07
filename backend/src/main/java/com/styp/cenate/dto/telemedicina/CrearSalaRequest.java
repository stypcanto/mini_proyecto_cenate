package com.styp.cenate.dto.telemedicina;

import lombok.Data;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * DTO para crear una sala de videollamada Jitsi
 */
@Data
public class CrearSalaRequest {
    
    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String nombrePaciente;
    
    @NotBlank(message = "El DNI del paciente es obligatorio")
    private String dniPaciente;
    
    @NotNull(message = "El ID del usuario médico es obligatorio")
    private Long idUsuarioMedico;
    
    private String nombreMedico;
    
    // ID de la cita o atención relacionada (opcional)
    private Long idCita;
    
    private String motivoConsulta;
}
