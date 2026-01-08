package com.styp.cenate.service.catalogo;

import java.time.OffsetDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.catalogo.SubactividadEssiResponseDTO;
import com.styp.cenate.mapper.catalogo.SubactividadEssiMapper;
import com.styp.cenate.model.SubactividadEssi;
import com.styp.cenate.repository.SubactividadEssiRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubactividadEssiServiceImpl implements ISubactividadEssiService {

	private final SubactividadEssiRepository subactividadRepo;

	@Override
	@Transactional(readOnly = true)
	public SubactividadEssiResponseDTO obtenerPorId(Long idSubactividad) {
		SubactividadEssi entity = subactividadRepo.findById(idSubactividad)
				.orElseThrow(() -> new IllegalArgumentException("Subactividad no existe: " + idSubactividad));
		return SubactividadEssiMapper.toDto(entity);
	}

	@Override
	@Transactional(readOnly = true)
	public boolean existePorId(Long idSubactividad) {
		return subactividadRepo.existsById(idSubactividad);
	}

	@Override
	@Transactional(readOnly = true)
	public List<SubactividadEssiResponseDTO> listar() {
		return SubactividadEssiMapper.toDtoList(subactividadRepo.findAll());
	}

	@Override
	@Transactional
	public void eliminarLogico(Long idSubactividad) {
		SubactividadEssi entity = subactividadRepo.findById(idSubactividad)
				.orElseThrow(() -> new IllegalArgumentException("Subactividad no existe: " + idSubactividad));
		entity.setEstado("I");
		entity.setUpdatedAt(OffsetDateTime.now());
		subactividadRepo.save(entity);
	}

}
