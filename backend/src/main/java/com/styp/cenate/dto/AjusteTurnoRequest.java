package com.styp.cenate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de request para que el coordinador ajuste un turno individual.
 *
 * Permite cambiar el tipo de turno de un detalle específico y agregar
 * una observación explicando el motivo del ajuste.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AjusteTurnoRequest {

    /**
     * ID del detalle de disponibilidad a ajustar
     */
    @NotNull(message = "El ID del detalle es obligatorio")
    private Long idDetalle;

    /**
     * Nuevo tipo de turno:
     * - M: Mañana
     * - T: Tarde
     * - MT: Turno Completo
     */
    @NotNull(message = "El nuevo turno es obligatorio")
    @Pattern(regexp = "^(M|T|MT)$", message = "El turno debe ser M (Mañana), T (Tarde) o MT (Completo)")
    private String nuevoTurno;

    /**
     * Observación del coordinador explicando el motivo del ajuste
     */
    private String observacion;
}
