package com.styp.cenate.dto.bolsas;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO para Motivos de Deserción
 * @version v1.0.0 - 2026-03-02
 */
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class MotivoDesercionDTO {
    private Long          id;
    private String        codigo;
    private String        descripcion;
    private String        categoria;
    private Boolean       activo;
    private Integer       orden;
    private LocalDateTime fechaCreacion;
}
