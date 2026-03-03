package com.styp.cenate.dto.cenacron;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO para Motivos de Baja CENACRON
 * @version v1.83.0 - 2026-03-02
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MotivoBajaCenacronDTO {
    private Long          id;
    private String        codigo;
    private String        descripcion;
    private Boolean       activo;
    private Integer       orden;
    private LocalDateTime fechaCreacion;
}
