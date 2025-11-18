package com.styp.cenate.service.chatbot.disponibilidad;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.AtencionDisponibilidadDTO;
import com.styp.cenate.mapper.AtencionDisponibilidadMapper;
import com.styp.cenate.repository.VwAtencionDisponibilidadRepository;

@Service
public class VWDisponibilidadAtencionesServiceImpl implements IVwAtencionDisponibilidadService {

	private final VwAtencionDisponibilidadRepository repo;

	public VWDisponibilidadAtencionesServiceImpl(VwAtencionDisponibilidadRepository repo) {
		this.repo = repo;
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtencionDisponibilidadDTO> listarPorServicio(String servicio) {
		if (servicio == null || servicio.isBlank()) {
			return List.of();
		}
		return repo.findByServicio(servicio.trim()).stream().map(AtencionDisponibilidadMapper::toDTO).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtencionDisponibilidadDTO> listarPorServicioIgnoreCase(String servicio) {
		if (servicio == null || servicio.isBlank()) {
			return List.of();
		}
		return repo.findByServicioIgnoreCase(servicio.trim()).stream().map(AtencionDisponibilidadMapper::toDTO)
				.toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtencionDisponibilidadDTO> listarPorServicioLike(String servicio) {
		if (servicio == null || servicio.isBlank()) {
			return List.of();
		}
		return repo.findByServicioContainingIgnoreCase(servicio.trim()).stream()
				.map(AtencionDisponibilidadMapper::toDTO).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtencionDisponibilidadDTO> listarPorIdServicio(Long idServicio) {
		if (idServicio == null) {
			return List.of();
		}
		return repo.findByIdServicio(idServicio).stream().map(AtencionDisponibilidadMapper::toDTO).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<AtencionDisponibilidadDTO> listarPorServicioYNumDocPers(String servicio, String numDocPers) {
		if ((servicio == null || servicio.isBlank()) || (numDocPers == null || numDocPers.isBlank())) {
			return List.of();
		}
		return repo.findByServicioContainingIgnoreCaseAndNumDocPers(servicio.trim(), numDocPers.trim()).stream()
				.map(AtencionDisponibilidadMapper::toDTO).toList();
	}

	@Override
	public List<AtencionDisponibilidadDTO> findByIdServicioAndNumDocPers(Long idServicio, String numDocPers) {
		return repo.findByIdServicioAndNumDocPers(idServicio, numDocPers).stream()
				.map(AtencionDisponibilidadMapper::toDTO).toList();
	}
}
