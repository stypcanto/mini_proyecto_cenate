package com.styp.cenate.dto;

import java.time.OffsetDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    
    /* INICIO CAMPOS NUEVOS */
    private Boolean requiere;
    private Boolean mananaActiva;
    private List<String> diasManana;
    private Boolean tardeActiva;
    private List<String> diasTarde;
    /* FIN CAMPOS NUEVOS */
    
    

    // Metodo de conveniencia
    public boolean tieneTurnosSolicitados() {
        return turnosSolicitados != null && turnosSolicitados > 0;
    }
}
