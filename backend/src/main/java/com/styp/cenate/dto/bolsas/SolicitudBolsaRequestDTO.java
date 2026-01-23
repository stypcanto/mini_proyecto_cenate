package com.styp.cenate.dto.bolsas;

import lombok.*;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * 📋 DTO de Request para crear/actualizar Solicitudes de Bolsa
 * v1.0.0 - Validación de entrada de datos para solicitudes
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class SolicitudBolsaRequestDTO {

    @NotNull(message = "El ID del asegurado es obligatorio")
    private Long aseguradoId;

    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String pacienteNombre;

    @NotBlank(message = "El DNI del paciente es obligatorio")
    private String pacienteDni;

    private String pacienteTelefono;

    private String pacienteEmail;

    private String especialidad;

    @NotNull(message = "El ID de la bolsa es obligatorio")
    private Long idBolsa;

    @NotNull(message = "El ID del solicitante es obligatorio")
    private Long solicitanteId;

    private String solicitanteNombre;
}
