package com.styp.cenate.service.view;

import com.styp.cenate.dto.mbac.PaginaModuloPermisosResponse;

import java.util.List;

/**
 * 🎯 Servicio para consultar la vista vw_permisos_activos.
 * Permite obtener los permisos activos de un usuario por ID.
 */
public interface PermisoActivoViewService {

    /**
     * Obtiene la lista de permisos activos (páginas y acciones permitidas)
     * según el ID del usuario autenticado.
     *
     * @param idUser ID del usuario
     * @return Lista de permisos activos del usuario
     */
    List<PaginaModuloPermisosResponse> obtenerPermisosActivosPorUsuario(Long idUser);
}