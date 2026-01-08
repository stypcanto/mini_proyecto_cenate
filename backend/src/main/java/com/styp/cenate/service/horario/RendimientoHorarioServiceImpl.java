package com.styp.cenate.service.horario;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.styp.cenate.dto.horario.RendimientoHorarioListadoRow;
import com.styp.cenate.dto.horario.RendimientoHorarioRequest;
import com.styp.cenate.dto.horario.RendimientoHorarioResponse;
import com.styp.cenate.model.horario.RendimientoHorario;
import com.styp.cenate.repository.horario.RendimientoHorarioRepo;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RendimientoHorarioServiceImpl implements RendimientoHorarioService {

	private final RendimientoHorarioRepo repo;

	@Override
	public Page<RendimientoHorarioResponse> buscar(String q, Long idAreaHosp, Long idServicio, Long idActividad,
			String estado, Integer pacMin, Integer pacMax, int page, int size) {
		Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1),
				Sort.by(Sort.Direction.DESC, "id_rendimiento"));

		return repo.buscar(nullIfBlank(q), idAreaHosp, idServicio, idActividad, normalizeEstado(estado), pacMin, pacMax,
				pageable).map(this::toDto);
	}

	@Override
	public Page<RendimientoHorarioListadoRow> listar(String q, Long idAreaHosp, Long idServicio, Long idActividad,
			String estado, Integer pacMin, Integer pacMax, int page, int size) {
		q = (q == null) ? "" : q.trim();
		Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1));
		return repo.buscarConDescripciones(q, idAreaHosp, idServicio, idActividad, estado, pacMin, pacMax, pageable);
	}

	@Override
	public RendimientoHorarioResponse obtenerPorId(Long id) {
		RendimientoHorario e = repo.findById(id)
				.orElseThrow(() -> new RuntimeException("No existe id_rendimiento=" + id));
		return toDto(e);
	}

	@Override
	public RendimientoHorarioResponse crear(RendimientoHorarioRequest req) {
		validar(req);

		RendimientoHorario e = new RendimientoHorario();
		apply(e, req);

		if (e.getAdicional() == null)
			e.setAdicional(0);
		if (e.getEstado() == null)
			e.setEstado("A");

		return toDto(repo.save(e));
	}

	@Override
	public RendimientoHorarioResponse actualizar(Long id, RendimientoHorarioRequest req) {
		validar(req);

		RendimientoHorario e = repo.findById(id)
				.orElseThrow(() -> new RuntimeException("No existe id_rendimiento=" + id));

		apply(e, req);

		if (e.getAdicional() == null)
			e.setAdicional(0);

		return toDto(repo.save(e));
	}

	@Override
	public void eliminar(Long id) {
		if (!repo.existsById(id)) {
			throw new RuntimeException("No existe id_rendimiento=" + id);
		}
		repo.deleteById(id);
	}

	private void apply(RendimientoHorario e, RendimientoHorarioRequest req) {
		e.setIdAreaHosp(req.idAreaHosp());
		e.setIdServicio(req.idServicio());
		e.setIdActividad(req.idActividad());
		e.setIdSubactividad(req.idSubactividad());
		e.setPacientesPorHora(req.pacientesPorHora());
		e.setAdicional(req.adicional() == null ? 0 : req.adicional());
		e.setEstado(normalizeEstado(req.estado()));
	}

	private RendimientoHorarioResponse toDto(RendimientoHorario e) {
		return new RendimientoHorarioResponse(e.getIdRendimiento(), e.getIdAreaHosp(), e.getIdServicio(),
				e.getIdActividad(), e.getIdSubactividad(), e.getPacientesPorHora(), e.getAdicional(), e.getEstado(),
				e.getFechaRegistro());
	}

	private void validar(RendimientoHorarioRequest req) {
		if (req == null)
			throw new RuntimeException("Body requerido");

		if (req.idAreaHosp() == null)
			throw new RuntimeException("idAreaHosp es obligatorio");
		if (req.idServicio() == null)
			throw new RuntimeException("idServicio es obligatorio");
		if (req.idActividad() == null)
			throw new RuntimeException("idActividad es obligatorio");
		if (req.idSubactividad() == null)
			throw new RuntimeException("idSubactividad es obligatorio");

		if (req.pacientesPorHora() == null)
			throw new RuntimeException("pacientesPorHora es obligatorio");
		if (req.pacientesPorHora() < 0)
			throw new RuntimeException("pacientesPorHora no puede ser negativo");

		if (req.adicional() != null && req.adicional() < 0)
			throw new RuntimeException("adicional no puede ser negativo");

		String est = normalizeEstado(req.estado());
		if (est == null)
			throw new RuntimeException("estado es obligatorio (A/I)");
		if (!est.equals("A") && !est.equals("I"))
			throw new RuntimeException("estado inválido (solo A o I)");
	}

	private static String nullIfBlank(String s) {
		return (s == null || s.trim().isEmpty()) ? null : s.trim();
	}

	private static String normalizeEstado(String estado) {
		if (estado == null)
			return null;
		String x = estado.trim().toUpperCase();
		return x.isEmpty() ? null : x;
	}
}
