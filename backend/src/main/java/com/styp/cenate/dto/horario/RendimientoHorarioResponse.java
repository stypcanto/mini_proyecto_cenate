package com.styp.cenate.dto.horario;

import java.time.OffsetDateTime;

public record RendimientoHorarioResponse(
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