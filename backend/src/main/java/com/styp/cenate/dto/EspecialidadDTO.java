package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecialidadDTO {

	private Long idServicio;
	private String codServicio;
	private String descripcion;
	private Boolean esCenate;
	private String estado;
	private Boolean esAperturaNuevos;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;
}
