package com.styp.cenate.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta para periodo de solicitud de turnos.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoSolicitudTurnoResponse {

    private Long idPeriodo;
    private String periodo;
    private String descripcion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String estado;
    private String instrucciones;
    private String createdBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Estadisticas (opcionales, se llenan en el service)
    private Long totalSolicitudes;
    private Long solicitudesEnviadas;
    private Long ipressRespondieron;

    // Metodos de conveniencia
    public boolean isActivo() {
        return "ACTIVO".equalsIgnoreCase(estado);
    }

    public boolean isCerrado() {
        return "CERRADO".equalsIgnoreCase(estado);
    }

    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    public boolean isVigente() {
        if (!isActivo()) return false;
        LocalDateTime ahora = LocalDateTime.now();
        return (ahora.isAfter(fechaInicio) || ahora.isEqual(fechaInicio))
               && (ahora.isBefore(fechaFin) || ahora.isEqual(fechaFin));
    }
}
