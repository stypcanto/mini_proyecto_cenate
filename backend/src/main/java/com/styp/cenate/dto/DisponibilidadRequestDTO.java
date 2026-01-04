package com.styp.cenate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO de request para crear o actualizar disponibilidad médica.
 * Incluye validaciones de negocio.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadRequestDTO {

    /**
     * ID del médico que declara disponibilidad (solo para coordinadores)
     * Si es null, se toma del usuario autenticado
     */
    private Long idPers;

    /**
     * ID del servicio/especialidad
     */
    @NotNull(message = "El servicio es obligatorio")
    private Long idServicio;

    /**
     * Periodo en formato YYYYMM (ej: 202601)
     */
    @NotBlank(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{6}$", message = "El periodo debe tener formato YYYYMM")
    private String periodo;

    /**
     * Horas requeridas para este mes (default: 150)
     */
    @DecimalMin(value = "0.0", message = "Las horas requeridas deben ser positivas")
    @DecimalMax(value = "744.0", message = "Las horas requeridas no pueden exceder 744 (máx horas en un mes)")
    private BigDecimal horasRequeridas;

    /**
     * Observaciones generales
     */
    @Size(max = 5000, message = "Las observaciones no pueden exceder 5000 caracteres")
    private String observaciones;

    /**
     * Lista de turnos diarios a declarar
     */
    @NotEmpty(message = "Debe declarar al menos un turno")
    @Valid
    private List<TurnoRequestDTO> turnos;

    /**
     * DTO para cada turno diario
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TurnoRequestDTO {

        @NotNull(message = "La fecha del turno es obligatoria")
        private LocalDate fecha;

        @NotBlank(message = "El tipo de turno es obligatorio")
        @Pattern(regexp = "^(M|T|MT)$", message = "El turno debe ser M (Mañana), T (Tarde) o MT (Completo)")
        private String turno;

        /**
         * Horas del turno (opcional, se calcula automáticamente si es null)
         */
        @DecimalMin(value = "0.01", message = "Las horas deben ser mayores a 0")
        @DecimalMax(value = "24.0", message = "Las horas no pueden exceder 24")
        private BigDecimal horas;
    }
}
