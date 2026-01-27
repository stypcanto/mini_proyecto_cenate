package com.styp.cenate.dto.disponibilidad;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO de request para crear/actualizar periodos globales
 * de disponibilidad médica.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoMedicoDisponibilidadRequest {

    @NotNull(message = "El año es obligatorio")
    @Min(value = 2020, message = "El año debe ser mayor o igual a 2020")
    @Max(value = 2100, message = "El año debe ser menor o igual a 2100")
    private Integer anio;

    @NotBlank(message = "El periodo es obligatorio")
    @Size(min = 6, max = 6, message = "El periodo debe tener formato YYYYMM")
    private String periodo;

    @NotBlank(message = "La descripción es obligatoria")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;
}

