package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO de response para una disponibilidad médica completa.
 *
 * Incluye:
 * - Datos de la disponibilidad
 * - Información del médico
 * - Información de la especialidad
 * - Información del régimen laboral (para cálculo de horas en frontend)
 * - Lista de detalles de turnos
 * - Indicadores calculados (cumplimiento, porcentaje)
 *
 * @author Ing. Styp Canto Rondon
 * @version 1.0.0
 * @since 2025-12-27
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadResponse {

    // ==========================================================
    // DATOS DE LA DISPONIBILIDAD
    // ==========================================================
    private Long idDisponibilidad;
    private String periodo;
    private String estado;
    private BigDecimal totalHoras;
    private BigDecimal horasRequeridas;
    private String observaciones;
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaEnvio;
    private OffsetDateTime fechaRevision;

    // ==========================================================
    // DATOS DEL MÉDICO
    // ==========================================================
    private Long idPers;
    private String nombreCompleto;
    private String numDocumento;
    private String emailMedico;

    // ==========================================================
    // DATOS DE LA ESPECIALIDAD
    // ==========================================================
    private Long idEspecialidad;
    private String nombreEspecialidad;
    private String codigoEspecialidad;

    // ==========================================================
    // DATOS DEL RÉGIMEN LABORAL
    // ==========================================================
    private String regimenLaboral;
    private BigDecimal horasPorTurnoManana;
    private BigDecimal horasPorTurnoTarde;
    private BigDecimal horasPorTurnoCompleto;

    // ==========================================================
    // DETALLES DE TURNOS
    // ==========================================================
    private List<DetalleDisponibilidadResponse> detalles;

    // ==========================================================
    // INDICADORES CALCULADOS
    // ==========================================================
    private Integer totalDiasDisponibles;
    private Boolean cumpleMinimo;
    private BigDecimal porcentajeCumplimiento;

    // ==========================================================
    // MÉTODOS UTILITARIOS
    // ==========================================================

    /**
     * Verifica si está en estado BORRADOR
     */
    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    /**
     * Verifica si está en estado ENVIADO
     */
    public boolean isEnviado() {
        return "ENVIADO".equalsIgnoreCase(estado);
    }

    /**
     * Verifica si está en estado REVISADO
     */
    public boolean isRevisado() {
        return "REVISADO".equalsIgnoreCase(estado);
    }

    /**
     * Verifica si el médico puede editar (BORRADOR o ENVIADO)
     */
    public boolean puedeEditar() {
        return isBorrador() || isEnviado();
    }

    /**
     * Obtiene la descripción del estado en español
     */
    public String getEstadoDescripcion() {
        return switch (estado != null ? estado.toUpperCase() : "") {
            case "BORRADOR" -> "Borrador";
            case "ENVIADO" -> "Enviado";
            case "REVISADO" -> "Revisado";
            default -> estado;
        };
    }

    /**
     * Obtiene el color del badge según el estado
     */
    public String getEstadoColor() {
        return switch (estado != null ? estado.toUpperCase() : "") {
            case "BORRADOR" -> "gray";
            case "ENVIADO" -> "blue";
            case "REVISADO" -> "green";
            default -> "gray";
        };
    }

    /**
     * Obtiene el color del badge según el cumplimiento de horas
     */
    public String getCumplimientoColor() {
        if (Boolean.TRUE.equals(cumpleMinimo)) {
            return "green";
        } else if (totalHoras != null && horasRequeridas != null &&
                   totalHoras.compareTo(horasRequeridas.multiply(new BigDecimal("0.66"))) >= 0) {
            return "yellow";
        } else {
            return "red";
        }
    }
}
