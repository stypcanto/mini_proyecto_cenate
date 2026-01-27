package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

/**
 * 🆕 v2.0.0: Estadísticas por IPRESS (institución solicitante)
 * Permite evaluar carga de trabajo y desempeño por IPRESS
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasPorIpressDTO {
    private String codigoIpress;          // 021, 067, 112, etc.
    private String nombreIpress;          // Nombre completo de IPRESS
    private String redAsistencial;        // Red a la que pertenece

    private Long total;                   // Total solicitudes
    private Long atendidos;               // Atendidas
    private Long pendientes;              // Pendientes
    private Long cancelados;              // Canceladas
    private Long derivados;               // Derivadas

    private BigDecimal tasaCompletacion;  // % (atendidos/total)
    private BigDecimal tasaCancelacion;   // % (cancelados/total)

    private Integer horasPromedio;        // Horas promedio atención

    private Integer ranking;              // Ranking por volumen (1º IPRESS, 2º, etc.)
    private String indicador;             // 🔴 (crítico), 🟡 (alerta), 🟢 (normal)
}
