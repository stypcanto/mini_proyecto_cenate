package com.styp.cenate.service.chatbot.atenciones;

import java.util.List;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.AtencionesServicioGlobalDTO;
import com.styp.cenate.mapper.AtencionesServicioGlobalMapper;
import com.styp.cenate.repository.AtencionesServicioGlobalRepository;

@Service
public class AtencionesServicioGlobalServiceImpl implements IAtencionesServicioGlobalService {

	private final AtencionesServicioGlobalRepository repositorioGlobal;

	public AtencionesServicioGlobalServiceImpl(AtencionesServicioGlobalRepository repositorioGlobal) {
		this.repositorioGlobal = repositorioGlobal;
	}

	@Override
	public List<AtencionesServicioGlobalDTO> findByDocPaciente(String docPaciente) {
		return repositorioGlobal.findByDocPaciente(docPaciente).stream().map(AtencionesServicioGlobalMapper::toDTO)
				.toList();
	}

	@Override
	public List<AtencionesServicioGlobalDTO> findByDocPacienteAndCodServicio(String docPaciente, String codServicio) {

		return repositorioGlobal.findByDocPacienteAndCodServicio(docPaciente, codServicio).stream()
				.map(AtencionesServicioGlobalMapper::toDTO).toList();
	}

	@Override
	public List<AtencionesServicioGlobalDTO> findByDocPacienteAndServicio(String docPaciente, String servicio) {

		return repositorioGlobal.findByDocPacienteAndServicio(docPaciente, servicio).stream()
				.map(AtencionesServicioGlobalMapper::toDTO).toList();
	}

	@Override
	public List<AtencionesServicioGlobalDTO> findByDocPacienteAndServicioContainingIgnoreCase(String docPaciente,
			String servicio) {
		return repositorioGlobal.findByDocPacienteAndServicioContainingIgnoreCase(docPaciente, servicio).stream()
				.map(AtencionesServicioGlobalMapper::toDTO).toList();
	}

	@Override
	public long countByDocPaciente(String documento) {
		return repositorioGlobal.countByDocPaciente(documento);
	}

}
