package com.styp.cenate.dto.enfermeria;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

/**
 * DTO para resultados de búsqueda y rescate de pacientes en enfermería.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RescatarPacienteDto {

    private Long idSolicitud;
    private String pacienteNombre;
    private String pacienteDni;
    private String condicionMedica;
    private String estado;
    private Long idPersonal;
    private String nombreEnfermera;
    private OffsetDateTime fechaAtencionMedica;
    private String especialidad;
    private Long idBolsa;
    private String numeroSolicitud;
    /** Hora de cita formateada "HH:MM" (ej. "07:30"). Null si no tiene hora asignada. */
    private String horaCita;
}
