package com.styp.cenate.service.horario;

import org.springframework.stereotype.Service;
import com.styp.cenate.dto.horario.ValidacionProfesionalHorarioResult;
import com.styp.cenate.repository.horario.ValidacionProfesionalHorarioDao;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ValidacionProfesionalHorarioService {

	private final ValidacionProfesionalHorarioDao dao;

	public ValidacionProfesionalHorarioResult validarOrThrow(long idPers) {
		return dao.validar(idPers).orElseThrow(() -> new IllegalStateException("La función no devolvió resultados."));
	}

	public ValidacionProfesionalHorarioResult validar(long idPers) {
		return dao.validar(idPers).orElse(null);
	}
}
