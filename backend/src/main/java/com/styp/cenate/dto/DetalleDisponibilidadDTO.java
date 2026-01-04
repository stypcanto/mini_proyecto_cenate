package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * DTO para los detalles de turnos diarios de disponibilidad.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDisponibilidadDTO {

    private Long idDetalle;
    private Long idDisponibilidad;

    private LocalDate fecha;
    private String turno;  // M, T, MT
    private String nombreTurno;  // Mañana, Tarde, Completo
    private BigDecimal horas;

    // Auditoría de ajustes
    private Long ajustadoPor;
    private String nombreAjustador;
    private String observacionAjuste;
    private Boolean fueAjustado;

    private OffsetDateTime createdAt;
}
