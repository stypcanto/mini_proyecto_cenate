package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 🆕 v2.0.0: Evolución temporal de solicitudes (últimos 30 días)
 * Usado para gráficos de línea en dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvolutionTemporalDTO {
    private LocalDate fecha;              // Fecha del registro
    private Long nuevasSolicitudes;       // Solicitudes creadas ese día
    private Long completadas;             // Solicitudes atendidas ese día
    private Long pendientes;              // Solicitudes pendientes ese día

    private Long cumulativoTotal;         // Total acumulado hasta esa fecha
    private Long cumulativoCompletado;    // Total completado acumulado

    private BigDecimal tasaDiaCompletacion; // % de completación ese día (completadas/nuevas)
    private String tendencia;              // "↑" (aumento), "↓" (disminución), "=" (estable)
}
