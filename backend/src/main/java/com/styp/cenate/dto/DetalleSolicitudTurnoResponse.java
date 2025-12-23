package com.styp.cenate.dto;

import lombok.*;

import java.time.OffsetDateTime;

/**
 * DTO de respuesta para detalle de turno por especialidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoResponse {

    private Long idDetalle;
    private Long idSolicitud;

    // Especialidad
    private Long idServicio;
    private String codServicio;
    private String nombreEspecialidad;

    // Datos del turno
    private Integer turnosSolicitados;
    private String turnoPreferente;
    private String diaPreferente;
    private String observacion;

    private OffsetDateTime createdAt;

    // Metodo de conveniencia
    public boolean tieneTurnosSolicitados() {
        return turnosSolicitados != null && turnosSolicitados > 0;
    }
}
