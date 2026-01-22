package com.styp.cenate.dto.solicitudturno;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoSolicitudTurnoRow {

    private Long idPeriodo;
    private String periodo;
    private String descripcion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String estado;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // ✅ NUEVO: cantidad de solicitudes asociadas
    private long cantidadSolicitudes;
}
