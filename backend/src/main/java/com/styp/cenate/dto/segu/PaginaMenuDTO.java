package com.styp.cenate.dto.segu;

import java.util.List;

public record PaginaMenuDTO(

	String ruta,
	Integer orden,
	String nombre,
	Integer id_pagina,
	boolean puedeVer,
	boolean puedeCrear,
	boolean puedeEditar,
	boolean puedeEliminar,
	boolean puedeExportar,
	List<PaginaMenuDTO> subpaginas
	) {

	// Constructor auxiliar sin subpáginas (para compatibilidad hacia atrás)
	public PaginaMenuDTO(String ruta, Integer orden, String nombre, Integer id_pagina,
			boolean puedeVer, boolean puedeCrear, boolean puedeEditar, boolean puedeEliminar, boolean puedeExportar) {
		this(ruta, orden, nombre, id_pagina, puedeVer, puedeCrear, puedeEditar, puedeEliminar, puedeExportar, null);
	}

}
