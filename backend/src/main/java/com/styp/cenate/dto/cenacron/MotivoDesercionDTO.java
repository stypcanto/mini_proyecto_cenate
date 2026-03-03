package com.styp.cenate.dto.cenacron;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO para Motivos de Deserción
 * @version v1.84.0 - 2026-03-02
 */
@Data
@Builder
public class MotivoDesercionDTO {
    private Long          id;
    private String        codigo;
    private String        descripcion;
    private String        categoria;
    private Boolean       activo;
    private Integer       orden;
    private LocalDateTime fechaCreacion;
}
