package com.styp.cenate.dto.segu;

import lombok.Data;

@Data
public class PermisoRolModuloDTO {
    private Integer idPermiso;
    private Integer idRol;
    private Integer idModulo;
    private Boolean puedeAcceder;
    private Boolean puedeVer;
    private Boolean puedeCrear;
    private Boolean puedeEditar;
    private Boolean puedeEliminar;
    private Boolean puedeExportar;
    private Boolean puedeImportar;
    private Boolean puedeAprobar;
    private Boolean activo;
    private String autorizadoPor;
}