package com.styp.cenate.dto.segu;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class ModuloSistemaDTO {
	
	private Integer idModulo;
	private String nombreModulo;
	private String descripcion;
	private String rutaBase;
	private boolean activo;
	private Integer orden;
	
	
	
}
