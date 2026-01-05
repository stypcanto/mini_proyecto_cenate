package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta simplificado para listados de disponibilidad.
 * Sin detalles de turnos diarios.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadResponseDTO {

    private Long idDisponibilidad;

    // Información del médico
    private Long idPers;
    private String nombreMedico;
    private String dniMedico;

    // Información del servicio
    private Long idServicio;
    private String nombreServicio;

    // Periodo y estado
    private String periodo;
    private String estado;
    private String estadoDescripcion;

    // Cálculo de horas (v2.0.0)
    private BigDecimal horasAsistenciales;
    private BigDecimal horasSanitarias;
    private BigDecimal totalHoras;
    private BigDecimal horasRequeridas;

    // Indicadores
    private Boolean cumpleHorasRequeridas;
    private BigDecimal porcentajeCumplimiento;
    private Integer totalDiasTrabajados;

    // Fechas relevantes
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaEnvio;
    private OffsetDateTime fechaRevision;
    private OffsetDateTime fechaSincronizacion;

    // Integración chatbot
    private Boolean sincronizadoConChatbot;
    private Long idCtrHorarioGenerado;

    /**
     * Calcula el porcentaje de cumplimiento basado en horas requeridas
     */
    public void calcularPorcentajeCumplimiento() {
        if (totalHoras != null && horasRequeridas != null && horasRequeridas.compareTo(BigDecimal.ZERO) > 0) {
            this.porcentajeCumplimiento = totalHoras
                .multiply(BigDecimal.valueOf(100))
                .divide(horasRequeridas, 2, java.math.RoundingMode.HALF_UP);
        } else {
            this.porcentajeCumplimiento = BigDecimal.ZERO;
        }
    }

    /**
     * Obtiene descripción legible del estado
     */
    public void setEstadoDescripcion() {
        this.estadoDescripcion = switch (this.estado) {
            case "BORRADOR" -> "Borrador";
            case "ENVIADO" -> "Enviado a revisión";
            case "REVISADO" -> "Revisado y aprobado";
            case "SINCRONIZADO" -> "Sincronizado con chatbot";
            default -> this.estado;
        };
    }
}
