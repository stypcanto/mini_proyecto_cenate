package com.styp.cenate.dto.horario;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class HorarioMesDetalleDto {
  private LocalDate fechaDia;
  private Long idCtrHorarioDet;
  private Long idHorario;
  private String codHorario;   // dim_horario.cod_horario
  private String descHorario;  // dim_horario.desc_horario
  private Integer horas;       // int (ya casteado en función)
  private Long idTipTurno;
  private String notaDia;
}
