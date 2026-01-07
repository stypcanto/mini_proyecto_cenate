package com.styp.cenate.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para crear/actualizar Lineamientos
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineamientoRequest {

    @NotBlank(message = "El código es requerido")
    private String codigo;

    @NotBlank(message = "El título es requerido")
    private String titulo;

    private String descripcion;

    @NotBlank(message = "La categoría es requerida")
    private String categoria;

    private String version;

    private LocalDateTime fechaAprobacion;

    private String aprobadoPor;

    @NotNull(message = "El estado es requerido")
    private String estado;

    private String urlDocumento;
}
