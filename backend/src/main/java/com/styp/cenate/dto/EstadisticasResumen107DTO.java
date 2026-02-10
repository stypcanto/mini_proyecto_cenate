package com.styp.cenate.dto;

import lombok.*;

/**
 * 📊 EstadisticasResumen107DTO - Estadísticas de resumen general
 * Propósito: Dashboard principal con métricas clave
 * Módulo: 107
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasResumen107DTO {
    private Long totalAtenciones;          // Total general
    private Long totalAtendidos;           // condicion_medica = 'Atendido'
    private Long totalPendientes;          // condicion_medica = 'Pendiente' o NULL
    private Long totalDeserciones;         // condicion_medica = 'Deserción'
    private Double tasaCumplimiento;       // (atendidos / total) * 100
    private Double tasaDesercion;          // (deserciones / total) * 100
}