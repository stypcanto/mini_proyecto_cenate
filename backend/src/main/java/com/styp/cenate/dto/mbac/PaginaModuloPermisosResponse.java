package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 🧩 DTO que representa los permisos activos de un usuario o rol
 * sobre una página específica dentro de un módulo del sistema MBAC.
 *
 * 📦 Fuente: vista SQL → vw_permisos_usuario_activos
 * 🎯 Uso: API /api/mbac/permisos-activos/{idUser}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaginaModuloPermisosResponse {

    // 🔹 Identificadores
    private Integer idPagina;       // ID de la página
    private String nombrePagina;    // Nombre visible de la página
    private String rutaPagina;      // Ruta frontend (ej: /roles/medico/dashboard)
    private String modulo;          // Nombre del módulo al que pertenece

    // 🔹 Permisos específicos (MBAC)
    private Boolean puedeVer;       // Permiso de visualización
    private Boolean puedeCrear;     // Permiso de creación
    private Boolean puedeEditar;    // Permiso de edición
    private Boolean puedeEliminar;  // Permiso de eliminación
    private Boolean puedeExportar;  // Permiso de exportación
    private Boolean puedeAprobar;   // Permiso de aprobación
}