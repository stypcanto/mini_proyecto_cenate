package com.styp.cenate.dto.mbac;

import lombok.*;

/**
 * DTO que representa una fila de la vista vw_permisos_activos.
 * Contiene todos los datos de permisos activos por usuario.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermisoUsuarioResponseDTO {
    private Long idUser;
    private String usuario;
    private Integer idRol;
    private String rol;
    private Integer idModulo;
    private String modulo;
    private Integer idPagina;
    private String pagina;
    private String rutaPagina;
    private Long idPermiso;
    private String descPermiso;
    private Boolean puedeVer;
    private Boolean puedeCrear;
    private Boolean puedeActualizar;
    private Boolean puedeEliminar;
    private Boolean puedeEditar;
    private Boolean puedeExportar;
    private Boolean puedeAprobar;
}