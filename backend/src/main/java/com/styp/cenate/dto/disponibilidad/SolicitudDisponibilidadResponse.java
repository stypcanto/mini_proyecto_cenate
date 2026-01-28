package com.styp.cenate.dto.disponibilidad;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para la respuesta de la solicitud de disponibilidad médica
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SolicitudDisponibilidadResponse {

    /**
     * ID de la solicitud de disponibilidad
     */
    private Long idSolicitud;

    /**
     * ID del período de disponibilidad
     */
    private Long idPeriodo;

    /**
     * Año del período
     */
    private Integer anio;

    /**
     * Mes del período (1-12)
     */
    private Integer mes;

    /**
     * Estado actual de la solicitud
     */
    private String estado;

    /**
     * Observaciones del médico
     */
    private String observaciones;

    /**
     * Observaciones del validador/aprobador
     */
    private String observacionValidador;

    /**
     * Fecha de creación de la solicitud
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    /**
     * Detalles de la solicitud
     */
    private List<DetalleSolicitudDisponibilidadResponse> detalles;
}
