package com.styp.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;

/**
 * DTO de request para crear/actualizar un periodo de solicitud de turnos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoSolicitudTurnoRequest {

    @NotBlank(message = "El periodo es obligatorio")
    @Size(min = 6, max = 6, message = "El periodo debe tener formato YYYYMM")
    private String periodo;

    @NotBlank(message = "La descripcion es obligatoria")
    @Size(max = 100, message = "La descripcion no puede superar 100 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private OffsetDateTime fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private OffsetDateTime fechaFin;

    private String instrucciones;
}
