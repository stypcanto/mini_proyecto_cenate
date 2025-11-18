package com.styp.cenate.dto;

import java.time.LocalDate;
import java.time.OffsetDateTime;

public record AtencionesServicioCenateDTO(
		String pkUnica,
		String codIpress,
		String centro,
		String codServicio,
		String servicio,
		String docPaciente,
		String paciente,
		LocalDate ultimaFechaCita
		
		) {

}
