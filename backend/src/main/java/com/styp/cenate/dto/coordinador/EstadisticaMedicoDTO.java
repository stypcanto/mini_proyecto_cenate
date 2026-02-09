package com.styp.cenate.dto.coordinador;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estadísticas individuales de médicos
 * Contiene métricas de desempeño de cada médico en el área
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EstadisticaMedicoDTO {

    private Long idPers;
    private String nombreMedico;
    private String email;

    // Conteos básicos
    private Integer totalAsignados;
    private Integer totalAtendidos;
    private Integer totalPendientes;
    private Integer totalDeserciones;

    // Métricas especiales
    private Integer totalCronicos;
    private Integer totalRecitas;
    private Integer totalInterconsultas;

    // Ratios y promedios
    private Double horasPromedioAtencion;
    private Double porcentajeAtencion;
    private Double tasaDesercion;
}
