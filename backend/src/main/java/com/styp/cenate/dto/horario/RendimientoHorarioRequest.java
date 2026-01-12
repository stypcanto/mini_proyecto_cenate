package com.styp.cenate.dto.horario;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "RendimientoHorarioRequest", description = "Request para crear un rendimiento horario")
public record RendimientoHorarioRequest(
		@Schema(description = "ID Área Hospitalaria", example = "1", requiredMode = Schema.RequiredMode.REQUIRED) Long idAreaHosp,
		@Schema(description = "ID Servicio", example = "13", requiredMode = Schema.RequiredMode.REQUIRED) Long idServicio,
		@Schema(description = "ID Actividad", example = "6", requiredMode = Schema.RequiredMode.REQUIRED) Long idActividad,
		@Schema(description = "ID de la Subactividad (opcional)", example = "3", nullable = true) Long idSubactividad,
		@Schema(description = "Pacientes por hora", example = "4", minimum = "0") Integer pacientesPorHora,
		@Schema(description = "Cantidad adicional de pacientes", example = "1", minimum = "0") Integer adicional,
		@Schema(description = "Estado", example = "A", allowableValues = {
				"A", "I" }) String estado){
}
