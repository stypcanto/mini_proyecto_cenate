package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de respuesta para los permisos modulares.
 * Representa los permisos CRUD de un rol en una página específica.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoModularResponse {
    private Integer idPermisoMod;
    private String nombreRol;
    private Boolean puedeVer;
    private Boolean puedeCrear;
    private Boolean puedeEditar;
    private Boolean puedeEliminar;
    private Boolean puedeExportar;
    private Boolean puedeAprobar;
    private Boolean activo;
}
