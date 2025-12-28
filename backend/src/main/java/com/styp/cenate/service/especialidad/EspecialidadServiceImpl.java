package com.styp.cenate.service.especialidad;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.EspecialidadDTO;
import com.styp.cenate.model.Especialidad;
import com.styp.cenate.repository.EspecialidadRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EspecialidadServiceImpl implements IEspecialidadService {

	private final EspecialidadRepository repository;

	@Override
	@Transactional(readOnly = true)
	public List<EspecialidadDTO> listar() {
		log.info("Obteniendo todas las especialidades/servicios activos");
		List<EspecialidadDTO> especialidades = repository.findByEstadoOrderByDescServicioAsc("A")
				.stream()
				.map(this::toDto)
				.collect(Collectors.toList());
		log.info("Se encontraron {} especialidades activas", especialidades.size());
		return especialidades;
	}

	@Override
	@Transactional(readOnly = true)
	public List<EspecialidadDTO> listarTodas() {
		log.info("Obteniendo todas las especialidades/servicios");
		List<EspecialidadDTO> especialidades = repository.findAll()
				.stream()
				.map(this::toDto)
				.collect(Collectors.toList());
		log.info("Se encontraron {} especialidades", especialidades.size());
		return especialidades;
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<EspecialidadDTO> buscarPorId(Long id) {
		log.info("Buscando especialidad por ID: {}", id);
		return repository.findById(id).map(this::toDto);
	}

	@Override
	@Transactional
	public EspecialidadDTO crear(EspecialidadDTO dto) {
		log.info("Creando especialidad: {}", dto.getDescripcion());

		Especialidad especialidad = Especialidad.builder()
				.codServicio(dto.getCodServicio())
				.descServicio(dto.getDescripcion())
				.esCenate(dto.getEsCenate() != null ? dto.getEsCenate() : false)
				.estado(dto.getEstado() != null ? dto.getEstado() : "A")
				.esAperturaNuevos(dto.getEsAperturaNuevos() != null ? dto.getEsAperturaNuevos() : false)
				.build();

		Especialidad saved = repository.save(especialidad);
		log.info("Especialidad creada con ID: {}", saved.getIdServicio());
		return toDto(saved);
	}

	@Override
	@Transactional
	public EspecialidadDTO actualizar(Long id, EspecialidadDTO dto) {
		log.info("Actualizando especialidad ID: {}", id);

		Especialidad existing = repository.findById(id)
				.orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + id));

		existing.setCodServicio(dto.getCodServicio());
		existing.setDescServicio(dto.getDescripcion());
		existing.setEsCenate(dto.getEsCenate() != null ? dto.getEsCenate() : existing.getEsCenate());
		existing.setEstado(dto.getEstado() != null ? dto.getEstado() : existing.getEstado());
		existing.setEsAperturaNuevos(dto.getEsAperturaNuevos() != null ? dto.getEsAperturaNuevos() : existing.getEsAperturaNuevos());

		Especialidad updated = repository.save(existing);
		log.info("Especialidad actualizada: {}", updated.getIdServicio());
		return toDto(updated);
	}

	@Override
	@Transactional
	public void eliminar(Long id) {
		log.info("Eliminando especialidad ID: {}", id);

		if (!repository.existsById(id)) {
			throw new RuntimeException("Especialidad no encontrada: " + id);
		}

		repository.deleteById(id);
		log.info("Especialidad eliminada: {}", id);
	}

	@Override
	@Transactional(readOnly = true)
	public List<EspecialidadDTO> listarConMedicosActivos() {
		log.info("Obteniendo especialidades con médicos activos en CENATE");
		List<EspecialidadDTO> especialidades = repository.findEspecialidadesConMedicosActivos()
				.stream()
				.map(this::toDto)
				.collect(Collectors.toList());
		log.info("Se encontraron {} especialidades con médicos activos", especialidades.size());
		return especialidades;
	}

	private EspecialidadDTO toDto(Especialidad esp) {
		return EspecialidadDTO.builder()
				.idServicio(esp.getIdServicio())
				.codServicio(esp.getCodServicio())
				.descripcion(esp.getDescServicio())
				.esCenate(esp.getEsCenate())
				.estado(esp.getEstado())
				.esAperturaNuevos(esp.getEsAperturaNuevos())
				.createdAt(esp.getCreatedAt())
				.updatedAt(esp.getUpdatedAt())
				.build();
	}
}
