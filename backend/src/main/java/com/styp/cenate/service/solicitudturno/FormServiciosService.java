package com.styp.cenate.service.solicitudturno;

import java.util.List;

import com.styp.cenate.dto.solicitudturno.FormServicioRow;

public interface FormServiciosService {
	
	 List<FormServicioRow> cargarFormulario(String codIpress, Integer idSolicitud);

}
