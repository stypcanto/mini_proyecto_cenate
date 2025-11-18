package com.styp.cenate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true) // Se usa para comparar igualdad en un campo que usa
													// @EqualsAndHashCode.Include
public class ChatBotServicioDTO {

	@EqualsAndHashCode.Include
	private String idServicio;
	private String nomServicio;

}
