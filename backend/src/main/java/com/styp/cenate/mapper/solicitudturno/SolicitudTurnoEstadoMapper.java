package com.styp.cenate.mapper.solicitudturno;


import com.styp.cenate.dto.solicitudturno.SolicitudTurnoEstadoResponse;
import com.styp.cenate.model.SolicitudTurnoIpress;


public class SolicitudTurnoEstadoMapper {

    public static SolicitudTurnoEstadoResponse toResponse(SolicitudTurnoIpress s) {
        if (s == null) return null;

        return new SolicitudTurnoEstadoResponse(
                s.getIdSolicitud(),
                s.getEstado(),
                s.getFechaEnvio(),
                s.getUpdatedAt(),
                s.getMotivoRechazo()
        );
    }
}
