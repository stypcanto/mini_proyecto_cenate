package com.styp.cenate.dto.coordinador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para KPIs consolidados del área
 * Contiene estadísticas agregadas de toda el área de trabajo
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class KpisAreaDTO {

    // Conteos pacientes
    private Integer totalPacientes;
    private Integer totalAtendidos;
    private Integer totalPendientes;
    private Integer totalDeserciones;

    // Métricas especiales
    private Integer totalCronicos;
    private Integer totalRecitas;
    private Integer totalInterconsultas;

    // Información de médicos
    private Integer totalMedicosActivos;

    // Ratios y promedios
    private Double horasPromedio;
    private Double tasaCompletacion;
    private Double tasaDesercion;
}
