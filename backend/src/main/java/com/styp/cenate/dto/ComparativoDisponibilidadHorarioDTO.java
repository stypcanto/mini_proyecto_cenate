package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * 🔍 DTO con comparativo entre disponibilidad y horario actual.
 *
 * Permite visualizar diferencias antes de sincronizar:
 * - Turnos que se agregarán
 * - Turnos que se modificarán
 * - Turnos que se eliminarán
 * - Resumen de horas antes/después
 *
 * Útil para que coordinadores verifiquen cambios
 * antes de ejecutar la sincronización.
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComparativoDisponibilidadHorarioDTO {

    /**
     * ID de la disponibilidad comparada
     */
    private Long idDisponibilidad;

    /**
     * ID del horario actual (null si no existe)
     */
    private Long idHorarioActual;

    /**
     * Indica si el horario ya existe
     */
    private Boolean horarioExiste;

    /**
     * Tipo de operación que se realizaría: CREACION o ACTUALIZACION
     */
    private String tipoOperacion;

    /**
     * Periodo del horario
     */
    private String periodo;

    /**
     * Nombre del personal
     */
    private String nombrePersonal;

    /**
     * Área donde se sincronizaría
     */
    private String nombreArea;

    /**
     * Detalles de turnos a agregar
     */
    private List<DetalleTurnoComparativoDTO> turnosAAgregar;

    /**
     * Detalles de turnos a modificar
     */
    private List<DetalleTurnoComparativoDTO> turnosAModificar;

    /**
     * Detalles de turnos a eliminar
     */
    private List<DetalleTurnoComparativoDTO> turnosAEliminar;

    /**
     * Total de horas actuales (0 si no existe horario)
     */
    private BigDecimal horasActuales;

    /**
     * Total de horas después de sincronizar
     */
    private BigDecimal horasNuevas;

    /**
     * Diferencia de horas (nuevas - actuales)
     */
    private BigDecimal diferenciaHoras;

    /**
     * Total de turnos actuales
     */
    private Integer turnosActuales;

    /**
     * Total de turnos después de sincronizar
     */
    private Integer turnosNuevos;

    /**
     * DTO anidado para detalles de cada turno
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleTurnoComparativoDTO {

        /**
         * Fecha del turno
         */
        private LocalDate fecha;

        /**
         * Código de turno actual (null si no existe)
         */
        private String turnoActual;

        /**
         * Código de turno nuevo desde disponibilidad
         */
        private String turnoNuevo;

        /**
         * Horas actuales (null si no existe)
         */
        private BigDecimal horasActuales;

        /**
         * Horas nuevas desde disponibilidad
         */
        private BigDecimal horasNuevas;

        /**
         * Tipo de cambio: AGREGAR, MODIFICAR, ELIMINAR
         */
        private String tipoCambio;
    }
}
