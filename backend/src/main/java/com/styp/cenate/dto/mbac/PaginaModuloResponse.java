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
    private Boolean ver;           // Permiso de lectura
    private Boolean crear;         // Permiso de creación
    private Boolean editar;        // Permiso de edición
    private Boolean eliminar;      // Permiso de eliminación
    private Boolean exportar;      // Permiso de exportación
    private Boolean aprobar;       // Permiso de aprobación
}