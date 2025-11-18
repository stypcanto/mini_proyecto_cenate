package com.styp.cenate.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatBotPacienteDTO {

	private String documento;
	private String nombre;
	private String sexo;
	private String telefono;
	private LocalDate fechaNacimiento;
	private Integer edad;
	
	
	private boolean tieneCobertura;
	private boolean esPacienteCenate;
	//private boolean esPacienteGlobal;
	private boolean esPacienteNuevo = true;
	private List<ChatBotServicioDTO> listaAtencionesCenate;
	//private List<ChatBotServicioDTO> listaAtencionesGlobales;
	private List<ChatBotServicioDTO> listarServiciosDefecto;
	private Set<ChatBotServicioDTO> listarServiciosDisponibles;
	

}
