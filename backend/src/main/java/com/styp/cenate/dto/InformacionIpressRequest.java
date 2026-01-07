package com.styp.cenate.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para crear/actualizar Información IPRESS
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InformacionIpressRequest {

    @NotNull(message = "El ID del lineamiento es requerido")
    private Long idLineamiento;

    @NotNull(message = "El ID de la IPRESS es requerido")
    private Long idIpress;

    private String contenido;

    private String requisitos;

    private LocalDateTime fechaImplementacion;

    private String estadoCumplimiento;

    private String observaciones;

    private String responsable;
}
