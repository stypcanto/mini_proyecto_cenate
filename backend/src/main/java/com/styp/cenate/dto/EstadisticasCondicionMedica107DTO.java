package com.styp.cenate.dto;

import lombok.*;

/**
 * 📊 EstadisticasCondicionMedica107DTO - Estadísticas basadas en condición médica
 * Propósito: Enviar métricas basadas en condicion_medica al frontend
 * Módulo: 107
 * 
 * Estados de condición médica:
 *   - Pendiente: Pacientes que aún no han sido atendidos (incluye NULL)
 *   - Atendido: Pacientes que ya fueron atendidos
 *   - Deserción: Pacientes que no asistieron a la cita
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasCondicionMedica107DTO {
    private Long total;              // Total de atenciones
    private Long pendiente;          // Condición = 'Pendiente' o NULL
    private Long atendido;           // Condición = 'Atendido'
    private Long desercion;          // Condición = 'Deserción'
}