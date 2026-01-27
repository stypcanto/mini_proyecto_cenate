package com.styp.cenate.service.personal.impl;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.DimServicioEssiDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.mapper.DimServicioEssiMapper;
import com.styp.cenate.model.DimServicioEssi;
import com.styp.cenate.repository.DimServicioEssiRepository;
import com.styp.cenate.service.personal.DimServicioEssiService;

@Service
@Transactional
public class DimServicioEssiServiceImpl implements DimServicioEssiService {

	private final DimServicioEssiRepository repositorio;

	public DimServicioEssiServiceImpl(DimServicioEssiRepository repositorio) {
		this.repositorio = repositorio;
	}

	// ============================================================
	// LISTAR
	// ============================================================

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarTodos() {
		return repositorio.findAll().stream().map(DimServicioEssiMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarTodo() {
		return listarTodos();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarActivos() {
		return repositorio.findByEstado("A").stream().map(DimServicioEssiMapper::toDto).toList();
	}

	// ============================================================
	// CONSULTAS PERSONALIZADAS
	// ============================================================

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarPorEstado(String estado) {
		return repositorio.findByEstado(estado).stream().map(DimServicioEssiMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarPorCenate(Boolean esCenate) {
		return repositorio.findByEsCenate(esCenate).stream().map(DimServicioEssiMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> listarActivosCenate() {
		return repositorio.findByEstadoAndEsCenate("A", true).stream().map(DimServicioEssiMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimServicioEssiDTO> findByEstadoAndEsCenateAndEsAperturaNuevos() {
		return repositorio.findByEstadoAndEsCenateAndEsAperturaNuevos("A", true, true).stream()
				.map(DimServicioEssiMapper::toDto).toList();
	}

	// ============================================================
	// BUSQUEDA POR COD SERVICIO
	// ============================================================
	@Override
	@Transactional(readOnly = true)
	public DimServicioEssiDTO findByCodServicio(String codigoServicio) {
		DimServicioEssi entity = repositorio.findByCodServicio(codigoServicio)
				.orElseThrow(() -> new ResourceNotFoundException("No existe servicio con código: " + codigoServicio));

		return DimServicioEssiMapper.toDto(entity);
	}
	// ============================================================
	// CRUD BÁSICO
	// ============================================================
	@Override
	@Transactional(readOnly = true)
	public DimServicioEssiDTO buscarPorId(Long id) {
		DimServicioEssi entity = repositorio.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Servicio ESSI no encontrado"));
		return DimServicioEssiMapper.toDto(entity);
	}

	@Override
	public DimServicioEssiDTO crear(DimServicioEssiDTO dto) {
		DimServicioEssi entity = DimServicioEssiMapper.toEntity(dto);
		entity.setIdServicio(null); // Auto-generado

		DimServicioEssi guardado = repositorio.save(entity);
		return DimServicioEssiMapper.toDto(guardado);
	}

	@Override
	public DimServicioEssiDTO actualizar(Long id, DimServicioEssiDTO dto) {

		DimServicioEssi entity = repositorio.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Servicio ESSI no encontrado"));

		entity.setCodServicio(dto.getCodServicio());
		entity.setDescServicio(dto.getDescServicio());
		entity.setEstado(dto.getEstado());
		entity.setEsCenate(dto.getEsCenate());
		entity.setEsAperturaNuevos(dto.getEsAperturaNuevos());

		DimServicioEssi actualizado = repositorio.save(entity);
		return DimServicioEssiMapper.toDto(actualizado);
	}

	@Override
	public void eliminar(Long id) {
		if (!repositorio.existsById(id)) {
			throw new ResourceNotFoundException("Servicio ESSI no encontrado");
		}
		repositorio.deleteById(id);
	}

	@Override
	public List<DimServicioEssiDTO> listarActivosCenateAndSolicitudIpress() {
		var orden = Sort.by(Sort.Direction.ASC, "descServicio");
		
		var listado =repositorio.findByEstadoAndEsCenateAndEsRequerimientoIpress("A", true, true, orden)
				.stream().map(DimServicioEssiMapper::toDto).toList();
		
		return listado;
	}
}
