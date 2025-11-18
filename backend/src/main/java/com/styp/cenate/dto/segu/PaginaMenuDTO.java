package com.styp.cenate.dto.segu;

public record PaginaMenuDTO(
		
		String ruta,
		Integer orden,
		String nombre,
		Integer id_pagina,
		boolean puedeVer,
		boolean puedeCrear,
		boolean puedeEditar,
		boolean puedeEliminar,
		boolean puedeExportar
		) {
	
	
	

}
