package com.styp.cenate.dto;

import lombok.*;

/**
 * 🩺 EstadisticasEspecialidad107DTO - Estadísticas por especialidad
 * Propósito: Datos de atenciones agrupadas por derivación interna
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasEspecialidad107DTO {
    private String derivacionInterna;  // MEDICINA CENATE, NUTRICION CENATE, etc.
    private Long totalAtenciones;      // COUNT(id_solicitud)
    private Double porcentaje;         // Porcentaje del total
}