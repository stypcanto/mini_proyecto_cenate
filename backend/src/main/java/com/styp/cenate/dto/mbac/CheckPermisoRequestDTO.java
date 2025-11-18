package com.styp.cenate.dto.mbac;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Solicitud para verificar un permiso de usuario (MBAC)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckPermisoRequestDTO {
    private Long idUser;         // ID del usuario
    private String rutaPagina;   // Ruta de la página (ej: /admin/usuarios)
    private String accion;       // Acción (ver, crear, editar, eliminar, exportar, aprobar)
}