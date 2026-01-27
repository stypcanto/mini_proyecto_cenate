package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 🆕 v2.0.0: Estadísticas por especialidad médica
 * Incluye tasas de completación y tiempo promedio de atención
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPorEspecialidadDTO {
    private String especialidad;          // CARDIOLOGIA, PEDIATRIA, etc.
    private Long total;                   // Total solicitudes
    private Long atendidos;               // Solicitudes atendidas
    private Long pendientes;              // Solicitudes pendientes
    private Long cancelados;              // Solicitudes canceladas

    private BigDecimal tasaCompletacion;  // % (atendidos/total)
    private BigDecimal tasaCancelacion;   // % (cancelados/total)

    private Integer horasPromedio;        // Horas promedio de atención
    private Integer diasPromedio;         // Días promedio (horas/24)

    private String tendencia;             // "↑" (mejorando), "↓" (empeorando), "=" (estable)
    private Integer ranking;              // Posición entre especialidades (1º, 2º, 3º, etc.)
}
