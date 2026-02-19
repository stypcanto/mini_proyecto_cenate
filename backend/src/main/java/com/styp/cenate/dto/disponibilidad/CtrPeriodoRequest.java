package com.styp.cenate.dto.disponibilidad;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * DTO de request para crear/actualizar periodos de control.
 * Tabla: ctr_periodo
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CtrPeriodoRequest {

    @NotBlank(message = "El periodo es obligatorio")
    @Pattern(regexp = "^[0-9]{6}$", message = "El periodo debe tener formato YYYYMM (6 dígitos)")
    private String periodo;

    // idArea se obtiene automáticamente del backend usando dim_personal_cnt
    // No se requiere enviar desde el frontend

    @NotNull(message = "La fecha de inicio es obligatoria")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es obligatoria")
    private LocalDate fechaFin;

    /**
     * Estado inicial del periodo. Si no se especifica, será ABIERTO.
     * Valores válidos: ABIERTO, EN_VALIDACION, CERRADO, REABIERTO
     */
    private String estado;
}
