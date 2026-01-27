package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 🆕 v2.0.0: Estadísticas por tipo de bolsa
 * Ejemplos: ORDINARIA, EXTRAORDINARIA, ESPECIAL, etc.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPorTipoBolsaDTO {
    private String tipoBolsa;                 // Nombre del tipo de bolsa
    private Long total;                       // Total solicitudes de esta bolsa
    private Long atendidos;                   // Atendidas
    private Long pendientes;                  // Pendientes
    private Long cancelados;                  // Canceladas

    private BigDecimal porcentaje;            // % del total de solicitudes
    private BigDecimal tasaCompletacion;      // % (atendidos/total)
    private BigDecimal tasaCancelacion;       // % (cancelados/total)

    private Integer horasPromedio;            // Horas promedio atención
    private String icono;                     // 📋, 🎯, ⭐, etc.
    private String color;                     // Color para gráficos
}
