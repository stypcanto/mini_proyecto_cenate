package com.styp.cenate.dto.segu;

import lombok.Data;

@Data
public class PaginaDTO {
    private Integer idPagina;
    private Integer idModulo;
    private String nombrePagina;
    private String rutaPagina;
    private String descripcion;
    private Integer orden;
    private Boolean activo;
}