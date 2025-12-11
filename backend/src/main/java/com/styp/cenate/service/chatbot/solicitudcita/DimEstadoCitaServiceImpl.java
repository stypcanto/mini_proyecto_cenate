package com.styp.cenate.service.chatbot.solicitudcita;

import java.util.List;
import org.springframework.stereotype.Service;
import com.styp.cenate.dto.chatbot.DimEstadoCitaDTO;
import com.styp.cenate.repository.chatbot.DimEstadoCitaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DimEstadoCitaServiceImpl implements IDimEstadoCitaService {
	
	private final DimEstadoCitaRepository repoEstado;

	@Override
	public List<DimEstadoCitaDTO> listarTodo() {
		return repoEstado.findAll().stream().map( x-> {
			DimEstadoCitaDTO dto = new DimEstadoCitaDTO();
			dto.setCodEstadoCita(x.getCodEstadoCita());
			dto.setDescEstadoPaciente(x.getDescEstadoPaciente());
			dto.setIdEstadoCita(x.getIdEstadoCita());
			return dto;
		}).toList();
	}
	
	

}
