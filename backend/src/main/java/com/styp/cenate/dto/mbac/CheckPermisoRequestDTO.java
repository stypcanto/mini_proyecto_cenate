package com.styp.cenate.dto.mbac;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para verificar permisos en una página específica.
 * Utilizado por el endpoint POST /api/permisos/check
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckPermisoRequestDTO {
    
    @JsonProperty("userId")
    private Long userId;
    
    @JsonProperty("rutaPagina")
    private String rutaPagina;
    
    @JsonProperty("accion")
    private String accion; // ver, crear, editar, eliminar, exportar, aprobar
}
