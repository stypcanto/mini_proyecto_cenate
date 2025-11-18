// ============================================================================
// 🎯 RolResponse.java – DTO de respuesta para roles de usuario (CENATE 2025)
// ----------------------------------------------------------------------------
// Se utiliza en los controladores MBAC y UsuarioController para devolver
// los roles, áreas y estado asociados a un usuario.
// ============================================================================
package com.styp.cenate.dto.mbac;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolResponse {
    private Integer idRol;
    private String nombreRol;
    private String areaTrabajo;
    private String estado;
}