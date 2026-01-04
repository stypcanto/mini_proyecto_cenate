package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.Map;

/**
 * DTO de resumen estadístico de disponibilidad médica.
 * Usado para dashboards y reportes.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumenDisponibilidadDTO {

    private String periodo;

    // Totales generales
    private Integer totalMedicos;
    private Integer totalDisponibilidades;

    // Distribución por estado
    private Integer totalBorrador;
    private Integer totalEnviado;
    private Integer totalRevisado;
    private Integer totalSincronizado;

    // Estadísticas de horas
    private BigDecimal totalHorasAsistenciales;
    private BigDecimal totalHorasSanitarias;
    private BigDecimal totalHorasDeclaradas;
    private BigDecimal promedioHorasPorMedico;

    // Cumplimiento
    private Integer medicosQueCumplenHoras;
    private Integer medicosQueNoCumplenHoras;
    private BigDecimal porcentajeCumplimiento;

    // Distribución de turnos
    private Integer totalTurnosManana;
    private Integer totalTurnosTarde;
    private Integer totalTurnosCompletos;
    private Integer totalDiasTrabajados;

    // Sincronización con chatbot
    private Integer disponibilidadesSincronizadas;
    private Integer disponibilidadesPendientesSincronizacion;

    // Por servicio/especialidad
    private Map<String, EstadisticaServicioDTO> estadisticasPorServicio;

    /**
     * DTO para estadísticas por servicio
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class EstadisticaServicioDTO {
        private Long idServicio;
        private String nombreServicio;
        private Integer totalMedicos;
        private BigDecimal totalHoras;
        private Integer totalDisponibilidades;
    }

    /**
     * Calcula el porcentaje de cumplimiento general
     */
    public void calcularPorcentajeCumplimiento() {
        if (medicosQueCumplenHoras != null && totalMedicos != null && totalMedicos > 0) {
            this.porcentajeCumplimiento = BigDecimal.valueOf(medicosQueCumplenHoras)
                .multiply(BigDecimal.valueOf(100))
                .divide(BigDecimal.valueOf(totalMedicos), 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.porcentajeCumplimiento = BigDecimal.ZERO;
        }
    }
}
