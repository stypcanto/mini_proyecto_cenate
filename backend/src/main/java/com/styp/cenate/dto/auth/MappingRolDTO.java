package com.styp.cenate.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 🎭 DTO para mapeo de roles (codigo + descripcion)
 * Enviado en la respuesta de login junto con la lista de roles del usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MappingRolDTO {
    private Integer codigo;          // ID del rol (idRol)
    private String descripcion;      // Descripción del rol (descRol)
    private String codigoNormalizado; // Código normalizado (ej: COORDINADOR_ESPECIALIDADES)
}
