package com.styp.cenate.service.especialidad;

import java.util.List;
import java.util.Optional;

import com.styp.cenate.dto.EspecialidadDTO;

public interface IEspecialidadService {

	List<EspecialidadDTO> listar();

	List<EspecialidadDTO> listarTodas();

	Optional<EspecialidadDTO> buscarPorId(Long id);

	EspecialidadDTO crear(EspecialidadDTO dto);

	EspecialidadDTO actualizar(Long id, EspecialidadDTO dto);

	void eliminar(Long id);
}
