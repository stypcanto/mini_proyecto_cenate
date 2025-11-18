package com.styp.cenate.service.chatbot.atenciones;

import java.util.List;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.AtencionesServicioCenateDTO;
import com.styp.cenate.mapper.AtencionesServicioCenateMapper;
import com.styp.cenate.repository.AtencionesServicioCenateRepository;

@Service
public class AtencionesServicioCenateServiceImpl implements IAtencionesServicioCenateService {

	private final AtencionesServicioCenateRepository repositorioServicio;

	public AtencionesServicioCenateServiceImpl(AtencionesServicioCenateRepository repositorioServicio) {
		this.repositorioServicio = repositorioServicio;
	}

	@Override
	public List<AtencionesServicioCenateDTO> findByDocPaciente(String documento) {
		return repositorioServicio.findByDocPaciente(documento).stream().map(AtencionesServicioCenateMapper::toDTO).toList();
	}

	@Override
	public List<AtencionesServicioCenateDTO> findByDocPacienteAndServicio(String documento, String servicio) {
		return repositorioServicio.findByDocPacienteAndServicio(documento, servicio) 
				.stream().map(AtencionesServicioCenateMapper::toDTO).toList();
	}

	@Override
	public long countByDocPaciente(String documento) {
		return repositorioServicio.countByDocPaciente(documento);
	}

	@Override
	public boolean existsByDocPaciente(String docPaciente) {
		return repositorioServicio.existsByDocPaciente(docPaciente);
	}

}
