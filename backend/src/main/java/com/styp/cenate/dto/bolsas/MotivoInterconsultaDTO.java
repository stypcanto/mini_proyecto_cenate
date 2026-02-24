package com.styp.cenate.dto.bolsas;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para Motivos de Interconsulta
 * @version v1.0.0 - 2026-02-23
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotivoInterconsultaDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Boolean activo;
    private Integer orden;
    private LocalDateTime fechaCreacion;
}
