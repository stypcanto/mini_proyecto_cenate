package com.styp.cenate.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de request para actualizar una disponibilidad médica existente.
 *
 * Solo se pueden actualizar:
 * - Observaciones
 * - Detalles de turnos (añadir, modificar, eliminar)
 *
 * No se pueden cambiar: periodo, especialidad (deben crear una nueva disponibilidad)
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadUpdateRequest {

    /**
     * Observaciones generales del médico
     */
    private String observaciones;

    /**
     * Lista actualizada de detalles de turnos por día
     * Los existentes se eliminan y se reemplazan por estos
     */
    @Valid
    private List<DetalleDisponibilidadRequest> detalles;
}
