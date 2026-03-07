package com.styp.cenate.dto.mesaayuda;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO para Motivos de Anulación de Citas
 * @version v1.85.27 - 2026-03-06
 */
@Data
@Builder
public class MotivoAnulacionDTO {
    private Long          id;
    private String        codigo;
    private String        descripcion;
    private Boolean       activo;
    private Integer       orden;
    private LocalDateTime fechaCreacion;
}
