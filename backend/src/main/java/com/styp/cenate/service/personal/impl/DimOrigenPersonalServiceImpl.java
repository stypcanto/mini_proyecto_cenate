package com.styp.cenate.service.personal.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.DimOrigenPersonalDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.mapper.DimOrigenPersonalMapper;
import com.styp.cenate.model.DimOrigenPersonal;
import com.styp.cenate.repository.DimOrigenPersonalRepository;
import com.styp.cenate.service.personal.DimOrigenPersonalService;

@Service
public class DimOrigenPersonalServiceImpl implements DimOrigenPersonalService {

	private final DimOrigenPersonalRepository repositorioOrigen;

	public DimOrigenPersonalServiceImpl(DimOrigenPersonalRepository repositorioOrigen) {
		this.repositorioOrigen = repositorioOrigen;
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimOrigenPersonalDTO> listarTodos() {
		return DimOrigenPersonalMapper.toDtoList(repositorioOrigen.findAll());
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimOrigenPersonalDTO> listarActivos() {
		return DimOrigenPersonalMapper.toDtoList(repositorioOrigen.findByEstado("A"));
	}

	@Override
	@Transactional(readOnly = true)
	public DimOrigenPersonalDTO buscarPorId(Long idOrigen) {
		DimOrigenPersonal entity = repositorioOrigen.findById(idOrigen)
				.orElseThrow(() -> new ResourceNotFoundException("Origen no encontrado"));
		return DimOrigenPersonalMapper.toDto(entity);
	}

	@Override
	public DimOrigenPersonalDTO crear(DimOrigenPersonalDTO dto) {
		DimOrigenPersonal entity = DimOrigenPersonalMapper.toEntity(dto);
		entity.setIdOrigen(null);
		DimOrigenPersonal guardado = repositorioOrigen.save(entity);
		return DimOrigenPersonalMapper.toDto(guardado);
	}

	@Override
	public DimOrigenPersonalDTO actualizar(Long idOrigen, DimOrigenPersonalDTO dto) {
		DimOrigenPersonal entity = repositorioOrigen.findById(idOrigen)
				.orElseThrow(() -> new ResourceNotFoundException("Origen no encontrado"));

		entity.setDescOrigen(dto.getDescOrigen());
		entity.setEstado(dto.getEstado());

		DimOrigenPersonal actualizado = repositorioOrigen.save(entity);
		return DimOrigenPersonalMapper.toDto(actualizado);
	}

	@Override
	public void eliminar(Long idOrigen) {
		if (!repositorioOrigen.existsById(idOrigen)) {
			throw new ResourceNotFoundException("Origen no encontrado");
		}
		repositorioOrigen.deleteById(idOrigen);
	}

}
