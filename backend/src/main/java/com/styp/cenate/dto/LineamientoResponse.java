package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para respuesta de Lineamientos
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LineamientoResponse {

    private Long idLineamiento;

    private String codigo;

    private String titulo;

    private String descripcion;

    private String categoria;

    private String version;

    private LocalDateTime fechaAprobacion;

    private String aprobadoPor;

    private String estado;

    private String urlDocumento;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean activo;
}
