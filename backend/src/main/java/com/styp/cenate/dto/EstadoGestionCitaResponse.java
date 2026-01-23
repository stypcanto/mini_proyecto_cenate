package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 📋 DTO para respuestas de Estados de Gestión de Citas
 * v1.33.0 - Data Transfer Object para API REST
 *
 * Se usa para devolver estados en respuestas HTTP
 * sin exponer la estructura interna de la BD
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadoGestionCitaResponse {

    /**
     * Identificador único del estado de cita
     */
    private Long idEstadoCita;

    /**
     * Código único del estado (ej: CITADO, NO_CONTESTA)
     */
    private String codEstadoCita;

    /**
     * Descripción detallada del estado de la cita
     */
    private String descEstadoCita;

    /**
     * Estado del registro: 'A' = Activo, 'I' = Inactivo
     */
    private String statEstadoCita;

    /**
     * Fecha de creación del registro
     */
    private LocalDateTime createdAt;

    /**
     * Fecha de última actualización
     */
    private LocalDateTime updatedAt;
}
