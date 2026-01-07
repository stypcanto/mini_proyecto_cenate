package com.styp.cenate.service.horario;

import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.dto.horario.HorarioDiaResult;
import com.styp.cenate.repository.horario.HorarioDao;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HorarioService {

	private final HorarioDao horarioDao;

	@Transactional
	public HorarioDiaResult registrarDia(long idPers, LocalDate fecha, String codHorarioVisual, String usuario) {
		List<HorarioDiaResult> rows = horarioDao.registrarHorarioDia(idPers, fecha, codHorarioVisual, usuario);
		return rows.isEmpty() ? null : rows.get(0); 
	}
}
