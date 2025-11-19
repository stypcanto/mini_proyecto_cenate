package com.styp.cenate.dto.segu;

import lombok.Data;

@Data
public class RolDTO {
    private Integer idRol;
    private String descRol;
    private String descripcion;
    private Integer idArea;
    private Integer nivelJerarquia;
    private Boolean activo;
}