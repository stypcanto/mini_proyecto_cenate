package com.styp.cenate.service.usuario;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.SolicitudContrasenaDTO;
import com.styp.cenate.mapper.SolicitudContrasenaMapper;
import com.styp.cenate.model.SolicitudContrasena;
import com.styp.cenate.repository.SolicitudContrasenaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SolicitudContrasenaServiceImpl implements SolicitudContrasenaService {

	private final SolicitudContrasenaRepository repository;

	@Override
	@Transactional
	public SolicitudContrasenaDTO guardar(SolicitudContrasenaDTO dto) {
		// Idempotencia (opcional): si llega una clave y ya existe, devolver el
		// existente
		if (dto.getIdempotencia() != null && !dto.getIdempotencia().isBlank()) {
			Optional<SolicitudContrasena> existente = repository.findByIdempotencia(dto.getIdempotencia());
			if (existente.isPresent()) {
				return SolicitudContrasenaMapper.toDTO(existente.get());
			}
		}

		if (dto.getEstado() == null || dto.getEstado().isBlank()) {
			dto.setEstado("PENDIENTE");
		}
		if (dto.getFechaRegistro() == null) {
			dto.setFechaRegistro(LocalDateTime.now());
		}
		if (dto.getIntentosEnvio() < 0) {
			dto.setIntentosEnvio(0);
		}

		SolicitudContrasena entity = SolicitudContrasenaMapper.toEntity(dto);
		
		if (entity.getFecha_registro() == null) {
			entity.setFecha_registro(LocalDateTime.now());
		}
		SolicitudContrasena saved = repository.save(entity);
		return SolicitudContrasenaMapper.toDTO(saved);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<SolicitudContrasenaDTO> buscarPorId(Long id) {
		return repository.findById(id).map(SolicitudContrasenaMapper::toDTO);
	}

	@Override
	@Transactional(readOnly = true)
	public Optional<SolicitudContrasenaDTO> buscarPorIdempotencia(String idempotencia) {
		if (idempotencia == null || idempotencia.isBlank()) {
			return Optional.empty();
		}
		return repository.findByIdempotencia(idempotencia).map(SolicitudContrasenaMapper::toDTO);
	}

	@Override
	@Transactional
	public Optional<SolicitudContrasenaDTO> actualizarEstado(Long id, String nuevoEstado) {
		return repository.findById(id).map(entity -> {
			entity.setEstado(nuevoEstado);
			return SolicitudContrasenaMapper.toDTO(repository.save(entity));
		});
	}

	@Override
	@Transactional
	public Optional<SolicitudContrasenaDTO> incrementarIntentos(Long id) {
		return repository.findById(id).map(entity -> {
			entity.setIntentosEnvio(entity.getIntentosEnvio() + 1);
			return SolicitudContrasenaMapper.toDTO(repository.save(entity));
		});
	}

	@Override
	@Transactional
	public Optional<SolicitudContrasenaDTO> registrarError(Long id, String error) {
		return repository.findById(id).map(entity -> {
			entity.setUltimoError(error);
			entity.setEstado("ERROR");
			return SolicitudContrasenaMapper.toDTO(repository.save(entity));
		});
	}
}
