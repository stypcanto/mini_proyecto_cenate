package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO de respuesta para páginas de módulo.
 * 
 * @author CENATE Development Team
 * @version 1.1
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginaModuloResponse {
    private Integer idPagina;
    private String nombrePagina;
    private String rutaPagina;
    private String descripcion;
    private Boolean activo;
    private List<PermisoModularResponse> permisos;
}
