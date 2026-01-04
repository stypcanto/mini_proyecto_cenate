package com.styp.cenate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO para que el coordinador ajuste turnos de una disponibilidad.
 * Permite cambiar tipos de turnos y agregar observaciones.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AjusteDisponibilidadDTO {

    /**
     * ID de la disponibilidad a ajustar
     */
    @NotNull(message = "El ID de disponibilidad es obligatorio")
    private Long idDisponibilidad;

    /**
     * Lista de ajustes de turnos individuales
     */
    @NotNull(message = "Debe especificar al menos un ajuste")
    private List<AjusteTurnoDTO> ajustes;

    /**
     * Observaciones generales del ajuste
     */
    @Size(max = 1000, message = "Las observaciones no pueden exceder 1000 caracteres")
    private String observacionesGenerales;

    /**
     * DTO para ajuste de turno individual
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AjusteTurnoDTO {

        /**
         * Fecha del turno a ajustar
         */
        @NotNull(message = "La fecha del turno es obligatoria")
        private LocalDate fecha;

        /**
         * Nuevo tipo de turno: M (Mañana), T (Tarde), MT (Completo)
         */
        @NotNull(message = "El nuevo turno es obligatorio")
        @Pattern(regexp = "^(M|T|MT)$", message = "El turno debe ser M (Mañana), T (Tarde) o MT (Completo)")
        private String nuevoTurno;

        /**
         * Observación específica del ajuste
         */
        @Size(max = 500, message = "La observación no puede exceder 500 caracteres")
        private String observacion;
    }
}
