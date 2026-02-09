package com.styp.cenate.dto.coordinador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

/**
 * DTO para evolución temporal de atenciones
 * Contiene datos diarios para gráficos de tendencia
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvolucionTemporalDTO {

    private LocalDate fecha;
    private Integer totalAtenciones;
    private Integer atendidos;
    private Integer pendientes;
    private Integer deserciones;
}
