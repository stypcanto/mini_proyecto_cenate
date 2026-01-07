package com.styp.cenate.dto.horario;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class ValidacionProfesionalHorarioResult {

  private Boolean ok;
  private String motivo;
  private Long idArea;
  private Long idRegLab;
  private Long idServicio;

}
