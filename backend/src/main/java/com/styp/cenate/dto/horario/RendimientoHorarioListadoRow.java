package com.styp.cenate.dto.horario;

import java.time.OffsetDateTime;

public record RendimientoHorarioListadoRow(
    Long id,
    Long idAreaHosp,
    String descAreaHosp,
    Long idServicio,
    String descServicio,
    Long idActividad,
    String descActividad,
    Long idSubactividad,
    String descSubactividad,
    Integer pacientesPorHora,
    Integer adicional,
    String estado,
    OffsetDateTime fechaRegistro
) {}
