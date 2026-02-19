package com.styp.cenate.dto.disponibilidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta para periodos de control.
 * Tabla: ctr_periodo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtrPeriodoResponse {

    // Clave primaria compuesta
    private String periodo;
    private Long idArea;

    // Datos del área
    private String nombreArea;

    // Fechas del periodo
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    // Estado
    private String estado;

    // Coordinador
    private Long idCoordinador;
    private String nombreCoordinador;

    // Fechas de apertura/cierre
    private OffsetDateTime fechaApertura;
    private OffsetDateTime fechaCierre;

    // Usuario última acción
    private Long idUsuarioUltimaAccion;
    private String nombreUsuarioUltimaAccion;

    // Auditoría
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    // Campos calculados
    private Integer anio;
    private Integer mes;

    // ==========================================================
    // Métodos utilitarios
    // ==========================================================

    public boolean isAbierto() {
        return "ABIERTO".equalsIgnoreCase(estado);
    }

    public boolean isEnValidacion() {
        return "EN_VALIDACION".equalsIgnoreCase(estado);
    }

    public boolean isCerrado() {
        return "CERRADO".equalsIgnoreCase(estado);
    }

    public boolean isReabierto() {
        return "REABIERTO".equalsIgnoreCase(estado);
    }

    /**
     * Indica si el periodo está abierto para modificaciones.
     */
    public boolean isEditable() {
        return isAbierto() || isReabierto();
    }
}
