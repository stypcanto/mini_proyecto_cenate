package com.styp.cenate.service.especialidad;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.styp.cenate.dto.EspecialidadDTO;
import com.styp.cenate.mapper.EspecialidadMapper;
import com.styp.cenate.repository.EspecialidadRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class EspecialidadServiceImpl implements IEspecialidadService {

	private final EspecialidadRepository repositorioEspecialidad;

	@Override
	public List<EspecialidadDTO> listar() {
		log.info("📋 Obteniendo todas las especialidades");
		List<EspecialidadDTO> especialidades = repositorioEspecialidad.findAll()
				.stream()
				.filter(esp -> "A".equalsIgnoreCase(esp.getStatEsp())) // Solo activas
				.map(EspecialidadMapper::toDto)
				.collect(Collectors.toList());
		log.info("✅ Se encontraron {} especialidades activas", especialidades.size());
		return especialidades;
	}

}
