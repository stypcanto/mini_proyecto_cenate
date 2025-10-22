package com.styp.cenate.dto.mbac;

import lombok.*;

/**
 * DTO que representa un módulo del sistema accesible para un usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ModuloSistemaResponse {
    private Integer idModulo;
    private String nombreModulo;
}