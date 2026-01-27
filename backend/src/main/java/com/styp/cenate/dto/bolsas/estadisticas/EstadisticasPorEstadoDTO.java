package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 🆕 v2.0.0: Estadísticas agrupadas por estado de gestión de citas
 * Estados: PENDIENTE, CITADO, ATENDIDO, CANCELADO, DERIVADO, OBSERVADO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPorEstadoDTO {
    private String estado;           // PENDIENTE, ATENDIDO, CANCELADO, etc.
    private Long cantidad;           // Cantidad de solicitudes en este estado
    private BigDecimal porcentaje;   // % del total
    private String color;            // Color para UI: #FF0000, #00FF00, #FFA500, #0066CC, #9900FF, #FFAA00
    private String emoji;            // 📋, ✅, ❌, 🚀, etc.
}
