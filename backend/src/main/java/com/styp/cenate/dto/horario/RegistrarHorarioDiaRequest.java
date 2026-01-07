package com.styp.cenate.dto.horario;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;


@Getter
@Setter
@ToString
public class RegistrarHorarioDiaRequest {

  private Long idPers;              // 172
  private LocalDate fecha;          // 2025-12-19
  private String codHorarioVisual;  // "158"
  private String usuario;           // "usuario_pruebas"

 
}
