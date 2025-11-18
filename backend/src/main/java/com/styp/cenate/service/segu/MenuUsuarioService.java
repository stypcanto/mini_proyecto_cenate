package com.styp.cenate.service.segu;

import java.util.List;

import com.styp.cenate.dto.segu.MenuUsuarioDTO;
import com.styp.cenate.dto.segu.PaginaMenuDTO;

public interface MenuUsuarioService {
	
	
	List<MenuUsuarioDTO> obtenerMenuUsuario(Long idUser);
	List<PaginaMenuDTO> parsePaginas(String json);	
	

}
