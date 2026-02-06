package com.styp.cenate.dto.bolsas;

import java.time.OffsetDateTime;
import lombok.*;
import jakarta.validation.constraints.*;

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

    // ✅ v1.46.9 - Campos para asignar médico y fecha de cita en importación
    private Long idPersonal; // ID del médico a asignar (opcional, puede ser null para asignar después)

    private OffsetDateTime fechaAsignacion; // Fecha de asignación/cita programada
}
