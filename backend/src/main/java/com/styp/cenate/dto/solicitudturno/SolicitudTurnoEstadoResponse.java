package com.styp.cenate.dto.solicitudturno;

import java.time.OffsetDateTime;

public record SolicitudTurnoEstadoResponse(
        Long idSolicitud,
        String estado,
        OffsetDateTime fechaEnvio,
        OffsetDateTime updatedAt,
        String motivoRechazo
) {}
