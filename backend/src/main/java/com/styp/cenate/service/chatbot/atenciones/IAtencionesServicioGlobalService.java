package com.styp.cenate.service.chatbot.atenciones;

import java.util.List;

import com.styp.cenate.dto.AtencionesServicioGlobalDTO;

public interface IAtencionesServicioGlobalService {
	
	
    List<AtencionesServicioGlobalDTO> findByDocPaciente(String docPaciente); 
    List<AtencionesServicioGlobalDTO> findByDocPacienteAndCodServicio(String docPaciente, String codServicio);
    List<AtencionesServicioGlobalDTO> findByDocPacienteAndServicio(String docPaciente, String servicio);
    List<AtencionesServicioGlobalDTO> findByDocPacienteAndServicioContainingIgnoreCase(String docPaciente, String servicio);
    long countByDocPaciente(String documento);
}
