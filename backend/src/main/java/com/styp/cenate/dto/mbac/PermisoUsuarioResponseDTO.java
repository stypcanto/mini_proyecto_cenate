package com.styp.cenate.dto.mbac;

import lombok.*;

/**
 * 🎯 DTO: Representa los permisos activos de un usuario según la vista SQL vw_permisos_activos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoUsuarioResponseDTO {

    private Long idPermiso;
    private String nombreModulo;

    private Integer idPagina;
    private String nombrePagina;
    private String rutaPagina;

    private Boolean ver;
    private Boolean crear;
    private Boolean editar;
    private Boolean eliminar;
    private Boolean exportar;
    private Boolean aprobar;
}