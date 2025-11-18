package com.styp.cenate.service.chatbot.atenciones;

import java.util.List;

import com.styp.cenate.dto.AtencionesServicioCenateDTO;

public interface IAtencionesServicioCenateService {

	List<AtencionesServicioCenateDTO> findByDocPaciente(String documento);
	List<AtencionesServicioCenateDTO> findByDocPacienteAndServicio(String documento, String servicio);
	long countByDocPaciente(String documento);
	boolean existsByDocPaciente(String docPaciente);
}
