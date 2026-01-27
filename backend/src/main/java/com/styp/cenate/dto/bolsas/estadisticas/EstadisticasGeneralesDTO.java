package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 🆕 v2.0.0: DTO con estadísticas generales del módulo Bolsas
 * Resumen ejecutivo para dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticasGeneralesDTO {
    private Long totalSolicitudes;
    private Long totalAtendidas;
    private Long totalPendientes;
    private Long totalCanceladas;
    private Long totalDerivadas;

    private BigDecimal tasaCompletacion;  // % atendidas/total
    private BigDecimal tasaAbandono;      // % canceladas/total
    private BigDecimal tasaPendiente;     // % pendientes/total

    private Integer horasPromedioGeneral;
    private Long pendientesVencidas;      // > 7 días sin atender

    private OffsetDateTime ultimaActualizacion;
    private String periodo;  // "Hoy", "Últimas 24h", "Últimos 7 días", etc.
}
