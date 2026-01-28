package com.styp.cenate.dto.disponibilidad;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para el detalle de la respuesta de la solicitud de disponibilidad
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DetalleSolicitudDisponibilidadResponse {
    
    /**
     * ID del detalle de la solicitud
     */
    private Long idDetalle;
    
    /**
     * Fecha de la disponibilidad
     */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fecha;
    
    /**
     * Turno solicitado (M: Mañana, T: Tarde, N: Noche)
     */
    private String turno;
    
    /**
     * Descripción del turno
     */
    private String turnoDescripcion;
    
    /**
     * Estado del detalle (PROPUESTO, APROBADO, RECHAZADO)
     */
    private String estado;
}