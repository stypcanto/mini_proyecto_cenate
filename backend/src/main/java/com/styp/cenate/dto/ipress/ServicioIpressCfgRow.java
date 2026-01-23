package com.styp.cenate.dto.ipress;
public record ServicioIpressCfgRow(
        Long idServicio,
        String descServicio,
        Boolean teleconsulta,
        Boolean teleconsultorio
) {}
