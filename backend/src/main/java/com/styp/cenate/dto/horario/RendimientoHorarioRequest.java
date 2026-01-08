package com.styp.cenate.dto.horario;
public record RendimientoHorarioRequest(
    Long idAreaHosp,
    Long idServicio,
    Long idActividad,
    Long idSubactividad,
    Integer pacientesPorHora,
    Integer adicional,
    String estado
) {}
