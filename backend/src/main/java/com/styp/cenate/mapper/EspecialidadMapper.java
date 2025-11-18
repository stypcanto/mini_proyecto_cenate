package com.styp.cenate.mapper;

import com.styp.cenate.dto.EspecialidadDTO;
import com.styp.cenate.model.Especialidad;

public class EspecialidadMapper {

	public static EspecialidadDTO toDto(Especialidad esp) {
		if (esp == null) return null;
		return EspecialidadDTO.builder()
				.idEsp(esp.getIdEsp())
				.descripcion(esp.getDescEsp())
				.build();
	}
}
