package com.styp.cenate.dto.solicitudturno;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

public interface PeriodoSolicitudTurnoResumenView {
    Long getIdPeriodo();
    String getPeriodo();
    String getDescripcion();
    LocalDateTime getFechaInicio();
    LocalDateTime getFechaFin();
    String getEstado();
    OffsetDateTime getCreatedAt();
    OffsetDateTime getUpdatedAt();

    Long getTotalSolicitudes();
    Long getSolicitudesEnviadas();
    Long getSolicitudesIniciadas();
}
