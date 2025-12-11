package com.styp.cenate.dto.chatbot;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SolicitudCitaResponseDTO {

	private Long idSolicitud;
	private String periodo;

	// Datos del paciente
	private String docPaciente;	
	private String nombresPaciente;
	private String sexo;
	private Integer edad;
	private String telefono;

	// Datos de la cita
	private LocalDate fechaCita;
	private LocalTime horaCita;
//	private OffsetDateTime fechaSolicitud;
//	private OffsetDateTime fechaActualiza;
//	private String estadoSolicitud;
	private String observacion;

	// Relaciones
	private Long idPersonal; // PersonalCnt
	private String nombrePersonal;
	private Long idAreaHospitalaria; // AreaHospitalaria
	private String descAreaHospitalaria;
	private Long idServicio; // ServicioEssi
	private String descServicio;
	private Long idActividad; // ActividadEssi
	private String descActividad;
	private Long idSubactividad; // SubactividadEssi
	private String descSubactividad;
	
	
	
}
