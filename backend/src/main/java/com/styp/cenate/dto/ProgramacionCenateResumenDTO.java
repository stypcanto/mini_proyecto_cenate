package com.styp.cenate.dto;

import lombok.*;

import java.util.List;

/**
 * DTO de resumen para el modulo de Programacion CENATE.
 * Contiene estadisticas consolidadas de un periodo.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProgramacionCenateResumenDTO {

    // Datos del periodo
    private Long idPeriodo;
    private String periodo;
    private String descripcion;
    private String estado;

    // Totales generales
    private Long totalSolicitudes;
    private Long solicitudesEnviadas;
    private Long solicitudesRevisadas;
    private Long ipressRespondieron;
    private Long totalTurnosSolicitados;
    private Long especialidadesSolicitadas;

    // Resumen por especialidad
    private List<ResumenEspecialidad> resumenPorEspecialidad;

    // Resumen por Red
    private List<ResumenRed> resumenPorRed;

    // Resumen por IPRESS
    private List<ResumenIpress> resumenPorIpress;

    /**
     * Resumen de turnos por especialidad
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumenEspecialidad {
        private Long idServicio;
        private String nombreEspecialidad;
        private Long totalTurnos;
        private Long ipressSolicitaron;
    }

    /**
     * Resumen de turnos por Red
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumenRed {
        private Long idRed;
        private String nombreRed;
        private Long totalTurnos;
        private Long ipressRespondieron;
    }

    /**
     * Resumen de turnos por IPRESS
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ResumenIpress {
        private Long idIpress;
        private String codIpress;
        private String nombreIpress;
        private String nombreRed;
        private Long totalTurnos;
        private String estado;
    }
}
