package com.styp.cenate.dto.bolsas;

import lombok.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalTime;

/**
 * 📋 DTO para crear solicitud adicional desde importación manual
 * v1.46.0 - Importación de pacientes desde base de asegurados
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class CrearSolicitudAdicionalRequest {

    @NotBlank(message = "DNI del paciente es requerido")
    @Size(min = 8, max = 8, message = "DNI debe tener 8 dígitos")
    private String pacienteDni;

    @NotBlank(message = "Nombre del paciente es requerido")
    private String pacienteNombre;

    private Integer pacienteEdad;

    private String pacienteSexo;

    private String pacienteTelefono;

    private String pacienteTelefonoAlterno;

    private String descIpress;

    @NotBlank(message = "Tipo de cita es requerido")
    private String tipoCita; // TELECONSULTA o PRESENCIAL

    private String origen; // "Importación Manual"

    @NotBlank(message = "Estado inicial es requerido")
    private String codEstadoCita; // "01" = PENDIENTE CITAR

    private Long usuarioCreacion;

    @NotBlank(message = "Especialidad es requerida")
    private String especialidad; // v1.46.5 - Especialidad del médico

    private Long idServicio; // v1.47.0 - ID del servicio/especialidad (opcional, si se envía se usa directo)

    private Long idPersonal; // v1.47.1 - ID del médico especialista (opcional)

    private LocalDate fechaAtencion; // v1.47.2 - Fecha de atención (opcional)

    private LocalTime horaAtencion; // v1.47.2 - Hora de atención (opcional)
}
