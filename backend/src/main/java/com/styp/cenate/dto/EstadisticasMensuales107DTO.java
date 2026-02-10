package com.styp.cenate.dto;

import lombok.*;

/**
 * 📅 EstadisticasMensuales107DTO - Estadísticas por mes
 * Propósito: Datos de atenciones agrupadas por mes/año
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasMensuales107DTO {
    private Integer mes;               // 1-12
    private Integer anio;              // YYYY
    private String periodo;            // "Enero 2026"
    private Long totalAtenciones;      // COUNT(id_solicitud)
}