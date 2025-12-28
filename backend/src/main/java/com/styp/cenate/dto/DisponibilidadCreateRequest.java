package com.styp.cenate.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de request para crear una nueva disponibilidad médica.
 *
 * El médico selecciona:
 * - Periodo (YYYYMM)
 * - Especialidad
 * - Lista de turnos por día
 *
 * El sistema calculará automáticamente las horas según el régimen laboral.
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadCreateRequest {

    /**
     * Periodo en formato YYYYMM (ejemplo: 202601 = Enero 2026)
     */
    @NotNull(message = "El periodo es obligatorio")
    @Pattern(regexp = "^\\d{6}$", message = "El formato del periodo debe ser YYYYMM (ejemplo: 202601)")
    private String periodo;

    /**
     * ID de la especialidad médica
     */
    @NotNull(message = "La especialidad es obligatoria")
    private Long idEspecialidad;

    /**
     * Observaciones generales del médico
     */
    private String observaciones;

    /**
     * Lista de detalles de turnos por día
     */
    @Valid
    private List<DetalleDisponibilidadRequest> detalles;
}
