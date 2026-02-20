package com.styp.cenate.dto.mesaayuda;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO admin para respuestas predefinidas de Mesa de Ayuda
 * Incluye todos los campos para gestión CRUD en panel admin
 *
 * @author Styp Canto Rondón
 * @version v1.65.10 (2026-02-19)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RespuestaPredefinidaAdminDTO {

    private Long id;
    private String codigo;
    private String descripcion;
    private Boolean esOtros;
    private Boolean activo;
    private Integer orden;
    private LocalDateTime fechaCreacion;

}
