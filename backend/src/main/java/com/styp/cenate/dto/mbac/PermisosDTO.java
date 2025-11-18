package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO que encapsula los permisos CRUD de un usuario en una página específica.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisosDTO {
    
    private Boolean ver;
    private Boolean crear;
    private Boolean editar;
    private Boolean eliminar;
    private Boolean exportar;
    private Boolean aprobar;
}
