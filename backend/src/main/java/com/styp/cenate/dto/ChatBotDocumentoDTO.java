package com.styp.cenate.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatBotDocumentoDTO {
	
	private String docPaciente;
	private String paciente;
	private String sexo;
	private LocalDate fechaNacimiento;
	private String telefono;
	
	
	

}
