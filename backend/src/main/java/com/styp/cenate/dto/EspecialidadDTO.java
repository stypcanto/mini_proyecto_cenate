package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class EspecialidadDTO {
	
	
	private Long idEsp;
	
	private String descripcion;

}
