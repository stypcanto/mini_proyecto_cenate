package com.styp.cenate.dto;

import lombok.*;

/**
 * 📊 EstadisticasAtencion107DTO - Estadísticas de atenciones
 * Propósito: Enviar métricas globales al frontend
 * Módulo: 107
 * 
 * Estados principales (estado_gestion_citas_id):
 *   - 1: CITADO (Para atender - prioritario)
 *   - 2: ATENDIDO_IPRESS (Completados)
 *   - 11: PENDIENTE_CITA (Nuevos en bolsa)
 *   - Otros: Resto de estados (problemas, rechazos, etc.)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EstadisticasAtencion107DTO {
    private Long total;              // Total de atenciones
    private Long citado;             // Estado 1: CITADO (Para atender)
    private Long atendidoIpress;     // Estado 2: ATENDIDO_IPRESS (Completados)
    private Long pendienteCita;      // Estado 11: PENDIENTE_CITA (Nuevos)
    private Long otros;              // Resto de estados
}
