package com.styp.cenate.service.horario;

import com.styp.cenate.dto.horario.HorarioMesDetalleDto;
import com.styp.cenate.dto.horario.HorarioMesResponse;
import com.styp.cenate.repository.horario.HorarioMesFnDao;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.Date;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class HorarioMesService {

  private final HorarioMesFnDao dao;

  public HorarioMesResponse consultarMes(Long idPers, String periodo) {
    if (idPers == null || idPers <= 0) {
      throw new IllegalArgumentException("idPers es obligatorio y debe ser mayor a 0");
    }
    if (periodo == null || !periodo.matches("\\d{6}")) {
      throw new IllegalArgumentException("periodo inválido. Use formato YYYYMM");
    }

    List<Map<String, Object>> rows = dao.consultarMes(idPers, periodo);

    // La función siempre devuelve filas del mes (aunque no exista cabecera)
    if (rows.isEmpty()) {
      return HorarioMesResponse.builder()
          .idCtrHorario(null)
          .periodo(periodo)
          .idPers(idPers)
          .idRegLab(null)
          .turnosTotales(0)
          .horasTotales(BigDecimal.ZERO)
          .detalle(List.of())
          .build();
    }

    Map<String, Object> first = rows.get(0);

    Long idCtrHorario = toLong(first.get("id_ctr_horario"));
    Long idRegLab = toLong(first.get("id_reg_lab"));
    Integer turnosTotales = toInt(first.get("turnos_totales"));
    BigDecimal horasTotales = toBigDecimal(first.get("horas_totales"));

    List<HorarioMesDetalleDto> detalle = new ArrayList<>();
    for (Map<String, Object> r : rows) {
      LocalDate fechaDia = toLocalDate(r.get("fecha_dia"));

      detalle.add(HorarioMesDetalleDto.builder()
          .fechaDia(fechaDia)
          .idCtrHorarioDet(toLong(r.get("id_ctr_horario_det")))
          .idHorario(toLong(r.get("id_horario")))
          .codHorario(toStr(r.get("cod_horario")))
          .descHorario(toStr(r.get("desc_horario")))
          .horas(toInt(r.get("horas")))
          .idTipTurno(toLong(r.get("id_tip_turno")))
          .notaDia(toStr(r.get("nota_dia")))
          .build());
    }

    return HorarioMesResponse.builder()
        .idCtrHorario(idCtrHorario)
        .periodo(periodo)
        .idPers(idPers)
        .idRegLab(idRegLab)
        .turnosTotales(turnosTotales)
        .horasTotales(horasTotales)
        .detalle(detalle)
        .build();
  }

  private static Long toLong(Object v) {
    if (v == null) return null;
    if (v instanceof Number n) return n.longValue();
    return Long.parseLong(v.toString());
  }

  private static Integer toInt(Object v) {
    if (v == null) return 0;
    if (v instanceof Number n) return n.intValue();
    return Integer.parseInt(v.toString());
  }

  private static BigDecimal toBigDecimal(Object v) {
    if (v == null) return BigDecimal.ZERO;
    if (v instanceof BigDecimal bd) return bd;
    if (v instanceof Number n) return BigDecimal.valueOf(n.doubleValue());
    return new BigDecimal(v.toString());
  }

  private static String toStr(Object v) {
    return v == null ? null : v.toString();
  }

  private static LocalDate toLocalDate(Object v) {
    if (v == null) return null;
    if (v instanceof LocalDate ld) return ld;
    if (v instanceof Date d) return d.toLocalDate();
    return LocalDate.parse(v.toString());
  }
}
