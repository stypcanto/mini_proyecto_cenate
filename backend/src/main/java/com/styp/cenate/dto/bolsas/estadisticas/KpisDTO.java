package com.styp.cenate.dto.bolsas.estadisticas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * 🆕 v2.0.0: KPIs detallados del módulo Bolsas
 * Indicadores clave de rendimiento y alertas
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpisDTO {
    // Conteos básicos
    private Long totalSolicitudes;
    private Long totalAtendidas;
    private Long totalPendientes;
    private Long totalCanceladas;
    private Long totalDerivadas;

    // Tasas de rendimiento
    private BigDecimal tasaCompletacion;    // % (atendidas/total)
    private BigDecimal tasaAbandono;        // % (canceladas/total)
    private BigDecimal tasaPendiente;       // % (pendientes/total)
    private BigDecimal tasaDerivacion;      // % (derivadas/total)

    // Métricas temporales
    private Integer horasPromedioGeneral;   // Promedio total
    private Integer horasPromedioPendientes; // Promedio de pendientes
    private Integer diasPromedioResolucion; // Días promedio atención

    // Alertas
    private Long pendientesVencidas;        // Solicitudes pendientes > 7 días
    private Long pendientesVencidasCriticas; // Solicitudes pendientes > 14 días (crítico)
    private Long solicitadasHoy;            // Solicitudes creadas en las últimas 24h
    private Long atendidosHoy;              // Solicitudes atendidas en las últimas 24h

    // Indicadores de salud
    private String saludGeneral;            // "🟢 Normal", "🟡 Alerta", "🔴 Crítico"
    private String indicadorCapacidad;      // "🟢 Baja carga", "🟡 Carga normal", "🔴 Sobrecarga"

    // Metadata
    private OffsetDateTime ultimaActualizacion;
    private String periodoAnalisis;         // "Últimos 7 días", "Últimos 30 días", etc.
}
