package com.styp.cenate.dto.segu;

import java.util.List;

public record MenuUsuarioDTO(
		
		Integer idModulo,
		String nombreModulo,
		String descripcion,
		String icono,
		String rutaBase,
		Integer orden,
		List<PaginaMenuDTO> paginas
		) {

}
