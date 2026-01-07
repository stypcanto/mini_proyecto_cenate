package com.styp.cenate.repository.horario;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
@RequiredArgsConstructor
public class HorarioMesFnDao {

  private final JdbcTemplate jdbcTemplate;

  public List<Map<String, Object>> consultarMes(Long idPers, String periodo) {
    String sql = "SELECT * FROM public.fn_ctr_horario_mes(?, ?)";
    return jdbcTemplate.queryForList(sql, idPers, periodo);
  }
}
