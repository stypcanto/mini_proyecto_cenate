package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para mapear permisos del usuario desde la vista vw_permisos_activos.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermisoUsuarioResponseDTO {

    private Long idPermiso;        // id_permiso
    private String rutaPagina;     // ruta_pagina
    private String nombrePagina;   // pagina
    private String nombreModulo;   // modulo
    private Boolean ver;           // puede_ver
    private Boolean crear;         // puede_crear
    private Boolean editar;        // puede_actualizar
    private Boolean eliminar;      // puede_eliminar
    private Boolean exportar;      // puede_exportar
    private Boolean aprobar;       // puede_aprobar
}