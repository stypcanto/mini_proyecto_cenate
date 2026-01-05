package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * DTO completo de disponibilidad médica con todos los detalles.
 * Usado para respuestas que requieren información completa.
 *
 * @author Ing. Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DisponibilidadMedicaDTO {

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

    // Cálculo de horas (v2.0.0)
    private BigDecimal horasAsistenciales;
    private BigDecimal horasSanitarias;
    private BigDecimal totalHoras;
    private BigDecimal horasRequeridas;

    private String observaciones;

    // Fechas de workflow
    private OffsetDateTime fechaCreacion;
    private OffsetDateTime fechaEnvio;
    private OffsetDateTime fechaRevision;

    // Integración chatbot
    private OffsetDateTime fechaSincronizacion;
    private Long idCtrHorarioGenerado;

    // Detalles de turnos diarios
    private List<DetalleDisponibilidadDTO> detalles;

    // Indicadores calculados
    private Boolean cumpleHorasRequeridas;
    private Integer totalDiasTrabajados;

    // Auditoría
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
