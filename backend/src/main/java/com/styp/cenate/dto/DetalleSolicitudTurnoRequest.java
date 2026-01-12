package com.styp.cenate.dto;

import java.util.List;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO de request para detalle de turno por especialidad.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DetalleSolicitudTurnoRequest {

	/*
	 * @NotNull(message = "El id de la especialidad es obligatorio") private Long
	 * idServicio;
	 * 
	 * @Min(value = 0, message = "Los turnos solicitados no pueden ser negativos")
	 * private Integer turnosSolicitados;
	 * 
	 * @Size(max = 100, message =
	 * "El turno preferente no puede superar 100 caracteres") private String
	 * turnoPreferente;
	 * 
	 * @Size(max = 200, message =
	 * "El dia preferente no puede superar 200 caracteres") private String
	 * diaPreferente; private String observacion;
	 */

	@NotNull(message = "El id de la especialidad es obligatorio")
	private Long idServicio;

	@NotNull(message = "El número de turnos es obligatorio")
	@Min(value = 0, message = "Los turnos no pueden ser negativos")
	private Integer turnos;

	// Mañana
	@NotNull(message = "El indicador de mañana es obligatorio")
	private Boolean mananaActiva;

	private List<String> diasManana;

	// Tarde
	@NotNull(message = "El indicador de tarde es obligatorio")
	private Boolean tardeActiva;

	private List<String> diasTarde;

	@NotNull(message = "El campo requiere es obligatorio")
	private Boolean requiere;

	@AssertTrue(message = "Si mañana está activa, debe seleccionar al menos un día")
	public boolean isDiasMananaValidos() {
		if (Boolean.TRUE.equals(mananaActiva)) {
			return diasManana != null && !diasManana.isEmpty();
		}
		return true;
	}

	@AssertTrue(message = "Si tarde está activa, debe seleccionar al menos un día")
	public boolean isDiasTardeValidos() {
		if (Boolean.TRUE.equals(tardeActiva)) {
			return diasTarde != null && !diasTarde.isEmpty();
		}
		return true;
	}

	@AssertTrue(message = "Debe seleccionar al menos un turno (mañana o tarde)")
	public boolean isAlMenosUnTurnoSeleccionado() {
		return Boolean.TRUE.equals(mananaActiva) || Boolean.TRUE.equals(tardeActiva);
	}

}
