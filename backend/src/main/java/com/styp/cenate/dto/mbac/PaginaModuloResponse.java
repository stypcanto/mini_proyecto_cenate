package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para páginas accesibles dentro de un módulo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginaModuloResponse {
    private Integer idPagina;      // ID de la página
    private String nombrePagina;   // Nombre visible
    private String rutaPagina;     // Ruta frontend (ej: /admin/roles)
    private String descripcion;
    private Boolean activo;
    // 🔹 Permisos (usa nombres cortos, tal como el builder espera)
    private Boolean ver;
    private Boolean crear;
    private Boolean editar;
    private Boolean eliminar;
    private Boolean exportar;
    private Boolean aprobar;
}