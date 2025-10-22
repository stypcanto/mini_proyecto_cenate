package com.styp.cenate.dto.mbac;

import lombok.*;

/**
 * DTO de respuesta para verificación de permisos MBAC.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckPermisoResponseDTO {

    private Long userId;
    private String pagina;
    private String accion;
    private boolean permitido;
}