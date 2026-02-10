package com.styp.cenate.dto;

import lombok.*;

/**
 * 📞 EstadisticasTipoCita107DTO - Estadísticas por tipo de cita
 * Propósito: Datos de atenciones agrupadas por tipo de cita
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasTipoCita107DTO {
    private String tipoCita;           // PRESENCIAL, TELECONSULTA, etc.
    private Long totalAtenciones;      // COUNT(id_solicitud)
    private Double porcentaje;         // Porcentaje del total
}