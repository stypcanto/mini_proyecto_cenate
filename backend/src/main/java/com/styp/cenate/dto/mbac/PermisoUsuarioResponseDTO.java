package com.styp.cenate.dto.mbac;

/**
 * 🎯 Proyección (interface) para mapear la vista SQL vw_permisos_activos.
 * Compatible con consultas nativas en Spring Data JPA.
 *
 * Cada método corresponde a una columna de la vista:
 *  - id_permiso → getIdPermiso()
 *  - ruta_pagina → getRutaPagina()
 *  - pagina → getNombrePagina()
 *  - modulo → getNombreModulo()
 *  - puede_ver → getVer()
 *  - puede_crear → getCrear()
 *  - puede_actualizar → getEditar()
 *  - puede_eliminar → getEliminar()
 *  - puede_exportar → getExportar()
 *  - puede_aprobar → getAprobar()
 */
public interface PermisoUsuarioResponseDTO {

    Long getIdPermiso();
    String getRutaPagina();
    String getNombrePagina();
    String getNombreModulo();

    Boolean getVer();
    Boolean getCrear();
    Boolean getEditar();
    Boolean getEliminar();
    Boolean getExportar();
    Boolean getAprobar();
}