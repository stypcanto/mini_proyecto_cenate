package com.styp.cenate.service.personal.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.DimTipoPersonalDTO;
import com.styp.cenate.exception.ResourceNotFoundException;
import com.styp.cenate.mapper.DimTipoPersonalMapper;
import com.styp.cenate.model.DimTipoPersonal;
import com.styp.cenate.repository.DimTipoPersonalRepository;
import com.styp.cenate.service.personal.DimTipoPersonalService;

import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@Slf4j
public class DimTipoPersonalServiceImpl implements DimTipoPersonalService {

	private final DimTipoPersonalRepository repositorio;

	public DimTipoPersonalServiceImpl(DimTipoPersonalRepository repositorio) {
		this.repositorio = repositorio;
	}

	// ============================================================
	// MÉTODOS ORIGINALES
	// ============================================================

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> listarTodos() {
		return repositorio.findAll().stream().map(DimTipoPersonalMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> listarActivos() {
		return repositorio.findByStatTipPers("A").stream().map(DimTipoPersonalMapper::toDto).toList();
	}

	@Override
	@Transactional(readOnly = true)
	public DimTipoPersonalDTO buscarPorId(Long idTipPers) {
		DimTipoPersonal entity = repositorio.findById(idTipPers).orElseThrow(
				() -> new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + idTipPers));

		return DimTipoPersonalMapper.toDto(entity);
	}

	@Override
	public DimTipoPersonalDTO crear(DimTipoPersonalDTO dto) {
		DimTipoPersonal entity = DimTipoPersonalMapper.toEntity(dto);
		entity.setIdTipPers(null); // Asegurar que Spring genere el ID
		DimTipoPersonal guardado = repositorio.save(entity);
		return DimTipoPersonalMapper.toDto(guardado);
	}

	@Override
	public DimTipoPersonalDTO actualizar(Long idTipPers, DimTipoPersonalDTO dto) {
		DimTipoPersonal entity = repositorio.findById(idTipPers).orElseThrow(
				() -> new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + idTipPers));

		DimTipoPersonalMapper.updateEntity(entity, dto);
		DimTipoPersonal actualizado = repositorio.save(entity);
		return DimTipoPersonalMapper.toDto(actualizado);
	}

	@Override
	public void eliminar(Long idTipPers) {
		if (!repositorio.existsById(idTipPers)) {
			throw new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + idTipPers);
		}
		repositorio.deleteById(idTipPers);
	}

	// ============================================================
	// 🆕 MÉTODOS NUEVOS AGREGADOS
	// ============================================================

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> findAll() {
		return listarTodos();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> findAllActivos() {
		return listarActivos();
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> findAllInactivos() {
		log.info("Obteniendo tipos de personal inactivos");
		return repositorio.findByStatTipPers("I")
				.stream()
				.map(DimTipoPersonalMapper::toDto)
				.collect(Collectors.toList());
	}

	@Override
	@Transactional(readOnly = true)
	public DimTipoPersonalDTO findById(Long id) {
		return buscarPorId(id);
	}

	@Override
	@Transactional(readOnly = true)
	public List<DimTipoPersonalDTO> searchByDescripcion(String keyword) {
		log.info("Buscando tipos de personal con keyword: {}", keyword);
		return repositorio.findByDescTipPersContainingIgnoreCase(keyword)
				.stream()
				.map(DimTipoPersonalMapper::toDto)
				.collect(Collectors.toList());
	}

	@Override
	public DimTipoPersonalDTO create(DimTipoPersonalDTO.CreateRequest request) {
		log.info("Creando nuevo tipo de personal: {}", request.getDescTipPers());

		// Validar que no exista un tipo con la misma descripción
		if (repositorio.existsByDescTipPers(request.getDescTipPers())) {
			throw new RuntimeException("Ya existe un tipo de personal con la descripción: " + request.getDescTipPers());
		}

		DimTipoPersonalDTO dto = DimTipoPersonalDTO.builder()
				.descTipPers(request.getDescTipPers())
				.statTipPers(request.getStatTipPers() != null ? request.getStatTipPers() : "A")
				.build();

		return crear(dto);
	}

	@Override
	public DimTipoPersonalDTO update(Long id, DimTipoPersonalDTO.UpdateRequest request) {
		log.info("Actualizando tipo de personal con ID: {}", id);

		DimTipoPersonal entity = repositorio.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + id));

		// Si se actualiza la descripción, validar que no exista otra con el mismo nombre
		if (request.getDescTipPers() != null && !request.getDescTipPers().equals(entity.getDescTipPers())) {
			if (repositorio.existsByDescTipPersAndIdNot(request.getDescTipPers(), id)) {
				throw new RuntimeException("Ya existe otro tipo de personal con la descripción: " + request.getDescTipPers());
			}
			entity.setDescTipPers(request.getDescTipPers());
		}

		if (request.getStatTipPers() != null) {
			entity.setStatTipPers(request.getStatTipPers());
		}

		DimTipoPersonal guardado = repositorio.save(entity);
		return DimTipoPersonalMapper.toDto(guardado);
	}

	@Override
	public void delete(Long id) {
		eliminar(id);
	}

	@Override
	public DimTipoPersonalDTO activar(Long id) {
		log.info("Activando tipo de personal con ID: {}", id);

		DimTipoPersonal entity = repositorio.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + id));

		entity.setStatTipPers("A");
		DimTipoPersonal guardado = repositorio.save(entity);

		log.info("Tipo de personal activado exitosamente");
		return DimTipoPersonalMapper.toDto(guardado);
	}

	@Override
	public DimTipoPersonalDTO inactivar(Long id) {
		log.info("Inactivando tipo de personal con ID: {}", id);

		DimTipoPersonal entity = repositorio.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Tipo de personal no encontrado con ID: " + id));

		entity.setStatTipPers("I");
		DimTipoPersonal guardado = repositorio.save(entity);

		log.info("Tipo de personal inactivado exitosamente");
		return DimTipoPersonalMapper.toDto(guardado);
	}

	@Override
	@Transactional(readOnly = true)
	public long countByEstado(String estado) {
		return repositorio.countByStatTipPers(estado);
	}
}
