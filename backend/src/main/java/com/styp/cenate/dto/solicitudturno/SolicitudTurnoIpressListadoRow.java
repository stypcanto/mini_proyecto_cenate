package com.styp.cenate.dto.solicitudturno;

import java.time.OffsetDateTime;

public record SolicitudTurnoIpressListadoRow(
		Long idSolicitud,
        Long idPeriodo,
        String estado,
        OffsetDateTime fechaEnvio,
        OffsetDateTime fechaCreacion,
        OffsetDateTime fechaActualizacion,
        String nombreIpress
) {}
