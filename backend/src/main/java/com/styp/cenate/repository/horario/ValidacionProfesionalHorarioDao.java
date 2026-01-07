package com.styp.cenate.repository.horario;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import com.styp.cenate.dto.horario.ValidacionProfesionalHorarioResult;
import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class ValidacionProfesionalHorarioDao {

	private final JdbcTemplate jdbcTemplate;



	private static final RowMapper<ValidacionProfesionalHorarioResult> MAPPER = (rs, rowNum) -> {
		ValidacionProfesionalHorarioResult r = new ValidacionProfesionalHorarioResult();
		r.setOk(rs.getObject("ok", Boolean.class));
		r.setMotivo(rs.getString("motivo"));
		r.setIdArea(rs.getObject("id_area", Long.class));
		r.setIdRegLab(rs.getObject("id_reg_lab", Long.class));
		r.setIdServicio(rs.getObject("id_servicio", Long.class));
		return r;
	};

	public Optional<ValidacionProfesionalHorarioResult> validar(long idPers) {
		final String sql = """
				  select *
				  from public.fn_validar_profesional_horario(?)
				""";

		List<ValidacionProfesionalHorarioResult> rows = jdbcTemplate.query(sql, MAPPER, idPers);
		return rows.stream().findFirst();
	}
}
