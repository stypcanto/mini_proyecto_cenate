package com.styp.cenate.dto;

import java.time.OffsetDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DimOrigenPersonalDTO {

	private Long idOrigen;
	private String descOrigen;
	private String estado;
	private OffsetDateTime createdAt;
	private OffsetDateTime updatedAt;

}
