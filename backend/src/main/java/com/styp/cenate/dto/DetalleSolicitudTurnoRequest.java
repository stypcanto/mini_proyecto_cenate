package com.styp.cenate.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * DTO de request para detalle de turno por especialidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoRequest {

    @NotNull(message = "El id de la especialidad es obligatorio")
    private Long idServicio;

    @Min(value = 0, message = "Los turnos solicitados no pueden ser negativos")
    private Integer turnosSolicitados;

    @Size(max = 100, message = "El turno preferente no puede superar 100 caracteres")
    private String turnoPreferente;

    @Size(max = 200, message = "El dia preferente no puede superar 200 caracteres")
    private String diaPreferente;

    private String observacion;
}
