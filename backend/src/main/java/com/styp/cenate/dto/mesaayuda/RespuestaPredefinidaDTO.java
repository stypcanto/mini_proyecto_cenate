package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para respuestas predefinidas de Mesa de Ayuda
 *
 * @version v1.65.10 (2026-02-19)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaPredefinidaDTO {
    private Long id;
    private String codigo;
    private String descripcion;
    private Boolean esOtros;
    private Integer orden;
}
