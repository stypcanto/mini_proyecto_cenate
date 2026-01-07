package com.styp.cenate.repository.horario;

import java.sql.Date;
import java.time.LocalDate;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;
import com.styp.cenate.dto.horario.HorarioDiaResult;

import lombok.RequiredArgsConstructor;

@Repository
@RequiredArgsConstructor
public class HorarioDao {

	private final JdbcTemplate jdbcTemplate;

	private static final RowMapper<HorarioDiaResult> MAPPER = (rs, rowNum) -> {
		HorarioDiaResult r = new HorarioDiaResult();

		r.setIdCtrHorario(rs.getObject("id_ctr_horario", Long.class));
		r.setPeriodo(rs.getString("periodo"));

		Date fecha = rs.getDate("fecha_dia");
		r.setFechaDia(fecha != null ? fecha.toLocalDate() : null);

		Object oldVal = rs.getObject("id_horario_old");
		r.setIdHorarioOld(oldVal != null ? ((Number) oldVal).longValue() : null);

		Object newVal = rs.getObject("id_horario_new");
		r.setIdHorarioNew(newVal != null ? ((Number) newVal).longValue() : null);

		Object tt = rs.getObject("turnos_totales");
		r.setTurnosTotales(tt != null ? ((Number) tt).intValue() : null);
		r.setHorasTotales(rs.getBigDecimal("horas_totales"));

		return r;
	};

	public List<HorarioDiaResult> registrarHorarioDia(long idPers, LocalDate fecha, String codHorarioVisual,
			String usuario) {

		final String sql = """
				  select *
				  from public.sp_registrar_horario_dia(?, ?, ?, ?)
				""";

		return jdbcTemplate.query(sql, MAPPER, idPers, Date.valueOf(fecha), codHorarioVisual, usuario);
	}
}
