package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * DTO de response para un detalle de disponibilidad (turno).
 *
 * Incluye información completa del turno:
 * - Fecha y tipo de turno
 * - Horas calculadas
 * - Información de ajustes (si fue modificado por coordinador)
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDisponibilidadResponse {

    /**
     * ID del detalle
     */
    private Long idDetalle;

    /**
     * Fecha del turno
     */
    private LocalDate fecha;

    /**
     * Tipo de turno (M, T, MT)
     */
    private String turno;

    /**
     * Nombre legible del turno ("Mañana", "Tarde", "Turno Completo")
     */
    private String turnoNombre;

    /**
     * Día de la semana ("Lunes", "Martes", etc.)
     */
    private String diaSemana;

    /**
     * Horas del turno
     */
    private BigDecimal horas;

    /**
     * Indica si fue ajustado por un coordinador
     */
    private Boolean fueAjustado;

    /**
     * Nombre completo del coordinador que ajustó (si aplica)
     */
    private String ajustadoPor;

    /**
     * Número de documento del coordinador que ajustó (si aplica)
     */
    private String numDocCoordinador;

    /**
     * Observación del ajuste (si aplica)
     */
    private String observacionAjuste;

    /**
     * Fecha de creación del detalle
     */
    private OffsetDateTime createdAt;
}
