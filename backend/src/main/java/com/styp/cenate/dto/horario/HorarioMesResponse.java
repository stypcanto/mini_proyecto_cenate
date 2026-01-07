package com.styp.cenate.dto.horario;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HorarioMesResponse {
	private Long idCtrHorario;
	private String periodo;
	private Long idPers;
	private Long idRegLab;
	private Integer turnosTotales;
	private BigDecimal horasTotales;
	private List<HorarioMesDetalleDto> detalle;
}
