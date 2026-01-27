package com.styp.cenate.dto.disponibilidad;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.OffsetDateTime;

/**
 * DTO de respuesta para periodos globales de disponibilidad médica.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeriodoMedicoDisponibilidadResponse {

    private Long idPeriodoRegDisp;
    private Integer anio;
    private String periodo;
    private String descripcion;
    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;
    private String estado;
    private String createdBy;
    private String updatedBy;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public boolean isActivo() {
        return "ACTIVO".equalsIgnoreCase(estado);
    }

    public boolean isCerrado() {
        return "CERRADO".equalsIgnoreCase(estado);
    }

    public boolean isBorrador() {
        return "BORRADOR".equalsIgnoreCase(estado);
    }

    public boolean isAnulado() {
        return "ANULADO".equalsIgnoreCase(estado);
    }
}

