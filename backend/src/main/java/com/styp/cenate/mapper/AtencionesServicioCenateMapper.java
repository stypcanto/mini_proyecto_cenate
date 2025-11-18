package com.styp.cenate.mapper;

import com.styp.cenate.dto.AtencionesServicioCenateDTO;
import com.styp.cenate.model.AtencionesServicioCenate;

public class AtencionesServicioCenateMapper {

	public static AtencionesServicioCenateDTO toDTO(AtencionesServicioCenate ate) {

		return new AtencionesServicioCenateDTO(ate.getPkUnica(), ate.getCodIpress(), ate.getCentro(),
				ate.getCodServicio(), ate.getServicio(), ate.getDocPaciente(), ate.getPaciente(),
				ate.getUltimaFechaCita()

		);

	}

}
