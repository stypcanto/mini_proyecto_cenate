package com.styp.cenate.service.horario;

import org.springframework.data.domain.Page;

import com.styp.cenate.dto.horario.RendimientoHorarioListadoRow;
import com.styp.cenate.dto.horario.RendimientoHorarioRequest;
import com.styp.cenate.dto.horario.RendimientoHorarioResponse;

public interface RendimientoHorarioService {

	Page<RendimientoHorarioResponse> buscar(String q, Long idAreaHosp, Long idServicio, Long idActividad, String estado,
			Integer pacMin, Integer pacMax, int page, int size);

	Page<RendimientoHorarioListadoRow> listar(String q, Long idAreaHosp, Long idServicio, Long idActividad,
			String estado, Integer pacMin, Integer pacMax, int page, int size);

	RendimientoHorarioResponse obtenerPorId(Long id);

	RendimientoHorarioResponse crear(RendimientoHorarioRequest req);

	RendimientoHorarioResponse actualizar(Long id, RendimientoHorarioRequest req);

	void eliminar(Long id);
}
