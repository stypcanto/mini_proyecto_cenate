package com.styp.cenate.dto.solicitudturno;
public record FormServicioRow(
        Long idServicio,
        String descServicio,
        Boolean teleconsultaActivo,
        Boolean teleconsultorioActivo
) {}
