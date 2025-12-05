package com.styp.cenate.service.segu;

import java.util.List;

import com.styp.cenate.dto.segu.MenuUsuarioDTO;
import com.styp.cenate.dto.segu.PaginaMenuDTO;

public interface MenuUsuarioService {


	List<MenuUsuarioDTO> obtenerMenuUsuario(Long idUser);
	List<PaginaMenuDTO> parsePaginas(String json);

	/**
	 * Obtiene el menú del usuario basándose en los permisos individuales
	 * de la tabla permiso_modular (asignados desde el panel de admin).
	 */
	List<MenuUsuarioDTO> obtenerMenuDesdePermisosModulares(Long idUser);

}
