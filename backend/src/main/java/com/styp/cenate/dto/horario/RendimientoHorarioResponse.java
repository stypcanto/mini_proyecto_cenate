package com.styp.cenate.dto.horario;

import java.time.OffsetDateTime;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Rendimiento Horario Response")
public record RendimientoHorarioResponse(
	@Schema(example = "1", description = "Identificador de rendimiento horario")
    Long id,
    Long idAreaHosp,
    Long idServicio,
    Long idActividad,
    Long idSubactividad,
    Integer pacientesPorHora,
    Integer adicional,
    String estado, 
    OffsetDateTime fechaRegistro
) {}