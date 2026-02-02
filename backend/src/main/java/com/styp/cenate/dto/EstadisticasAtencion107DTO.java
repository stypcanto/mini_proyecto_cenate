package com.styp.cenate.dto;

import lombok.*;

/**
 * 📊 EstadisticasAtencion107DTO - Estadísticas de atenciones
 * Propósito: Enviar métricas globales al frontend
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasAtencion107DTO {
    private Long total;
    private Long pendientes;
    private Long atendidos;
}
