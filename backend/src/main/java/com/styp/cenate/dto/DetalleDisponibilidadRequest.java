package com.styp.cenate.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO de request para crear/actualizar un detalle de disponibilidad (turno).
 *
 * Las horas se calculan automáticamente en el backend según el régimen laboral del médico:
 * - Régimen 728/CAS: M=4h, T=4h, MT=8h
 * - Régimen Locador: M=6h, T=6h, MT=12h
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleDisponibilidadRequest {

    /**
     * Fecha del turno
     */
    @NotNull(message = "La fecha es obligatoria")
    private LocalDate fecha;

    /**
     * Tipo de turno:
     * - M: Mañana
     * - T: Tarde
     * - MT: Turno Completo
     */
    @NotNull(message = "El turno es obligatorio")
    @Pattern(regexp = "^(M|T|MT)$", message = "El turno debe ser M (Mañana), T (Tarde) o MT (Completo)")
    private String turno;

    // Nota: El campo 'horas' se calcula automáticamente en el backend
    // según el régimen laboral del médico, por lo que no se incluye aquí
}
