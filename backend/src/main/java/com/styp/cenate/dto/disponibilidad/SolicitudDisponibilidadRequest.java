package com.styp.cenate.dto.disponibilidad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO para la solicitud de disponibilidad médica
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SolicitudDisponibilidadRequest {

    /**
     * ID del período de disponibilidad al que pertenece la solicitud
     */
    @NotNull(message = "El ID del período es obligatorio")
    private Long idPeriodo;

    /**
     * Estado actual de la solicitud (BORRADOR, ENVIADO, OBSERVADO, APROBADO, RECHAZADO, ANULADO)
     */
    @NotBlank(message = "El estado de la solicitud es obligatorio")
    @Size(max = 20, message = "El estado no puede tener más de 20 caracteres")
    private String estado;

    /**
     * Observaciones de la solicitud (opcional)
     */
    @Size(max = 1000, message = "Las observaciones no pueden tener más de 1000 caracteres")
    private String observaciones;

    /**
     * Detalles de la disponibilidad solicitada
     */
    @NotNull(message = "Debe incluir al menos un detalle de disponibilidad")
    private List<DetalleSolicitudDisponibilidadRequest> detalles;

    /**
     * DTO para el detalle de la solicitud de disponibilidad
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleSolicitudDisponibilidadRequest {
        
        /**
         * Fecha para la que se solicita la disponibilidad
         */
        @NotNull(message = "La fecha es obligatoria")
        private LocalDate fecha;
        
        /**
         * Turno solicitado (M: Mañana, T: Tarde, N: Noche)
         */
        @NotBlank(message = "El turno es obligatorio")
        @Size(max = 1, message = "El turno debe ser un solo carácter (M, T o N)")
        private String turno;
        
        /**
         * ID del horario específico (opcional, referencia a dim_horario)
         */
        private Long idHorario;
    }
}
