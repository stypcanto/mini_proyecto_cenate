package com.styp.cenate.dto.horario;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class HorarioDiaResult {

  private Long idCtrHorario;
  private String periodo;
  private LocalDate fechaDia;
  private Long idHorarioOld;
  private Long idHorarioNew;
  private Integer turnosTotales;
  private BigDecimal horasTotales;

}
