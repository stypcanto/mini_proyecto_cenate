package com.styp.cenate.mapper;

import com.styp.cenate.dto.AtencionesServicioGlobalDTO;
import com.styp.cenate.model.AtencionesServicioGlobal;

public class AtencionesServicioGlobalMapper {

	public static final AtencionesServicioGlobalDTO toDTO(AtencionesServicioGlobal ate) {
		return new AtencionesServicioGlobalDTO(
					ate.getPkUnica(),
					ate.getCentroArchivo(),
					ate.getCentro(),
					ate.getCodServicio(),
					ate.getServicio(),
					ate.getDocPaciente(),
					ate.getPaciente(),
					ate.getUltimaFechaCita(),
					ate.getUltimaHoraCita()
				);
	}
	
	
}
