package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para estadísticas generales del módulo de Enfermería
 * Usado por SUPERADMIN para ver datos agregados sin acceso a pacientes individuales
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EnfermeriaEstadisticasDTO {

    /**
     * Total de enfermeras activas en el sistema
     */
    private Long totalEnfermeras;

    /**
     * Total de pacientes únicos atendidos por enfermería
     */
    private Long totalPacientesAtendidos;

    /**
     * Total de atenciones de enfermería registradas
     */
    private Long totalAtenciones;

    /**
     * Total de pacientes que requieren telemonitoreo
     */
    private Long pacientesConTelemonitoreo;

    /**
     * Distribución de atenciones por IPRESS
     */
    private java.util.List<EstadisticaPorIpress> distribucionPorIpress;

    /**
     * Distribución de atenciones por mes (últimos 6 meses)
     */
    private java.util.List<EstadisticaPorMes> atencionesUltimos6Meses;

    /**
     * DTO interno para estadísticas por IPRESS
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticaPorIpress {
        private String codigoIpress;
        private String nombreIpress;
        private Long totalAtenciones;
        private Long pacientesUnicos;
    }

    /**
     * DTO interno para estadísticas por mes
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EstadisticaPorMes {
        private String mes; // "2026-01", "2026-02", etc.
        private Long totalAtenciones;
        private Long pacientesUnicos;
    }
}
