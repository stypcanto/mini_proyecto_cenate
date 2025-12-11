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
public class SolicitudCitaRequestDTO {

	private Long idSolicitud;

	@NotNull(message = "El periodo es obligatorio")
	@NotBlank(message = "El periodo tiene que tener valor")
	private String periodo;

	// Datos del paciente
	@Size(min = 8, max = 12, message = "El documento debe tener entre 8 y 12 caracteres")
	@NotNull(message = "El documento de paciente es obligatorio")
	@Pattern(regexp = "^[0-9]+$", message = "El documento solo debe contener números")
	private String docPaciente;
//	@NotBlank(message = "El nombre del paciente es obligatorio")
//	private String nombresPaciente;

//	@Pattern(regexp = "^[MFfm]$", message="Ingrese el sexo de manera correcta")
//	private String sexo;

//	@PositiveOrZero(message = "La edad debe ser 0 o un número positivo")
//	private Integer edad;
	
	@Size(min = 9, max = 12, message = "El telefono debe tener entre 9 y 12 caracteres")
	private String telefono;

	// Datos de la cita
	@NotNull(message = "La fecha de solicitud es obligatoria")
	@JsonFormat(pattern = "yyyy-MM-dd")
	private LocalDate fechaCita;
	@NotNull(message = "La hora de solicitud es obligatoria")
	@JsonFormat(pattern = "HH:mm:ss")
	private LocalTime horaCita;
//	private OffsetDateTime fechaSolicitud;
//	private OffsetDateTime fechaActualiza;
//	private String estadoSolicitud;
	private String observacion;

	// Relaciones
	@NotNull(message = "El idPersonal es obligatorio")
	@Positive(message = "El idPersonal debe ser un número positivo")
	private Long idPersonal; // PersonalCnt
	private String nombrePersonal;
	@NotNull(message = "El idAreaHospitalaria es obligatorio")
	@Positive(message = "El idAreaHospitalaria debe ser un número positivo")
	private Long idAreaHospitalaria; // AreaHospitalaria
	private String descAreaHospitalaria;
	@NotNull(message = "El idServicio es obligatorio")
	@Positive(message = "El idServicio debe ser un número positivo")
	private Long idServicio; // ServicioEssi
	private String descServicio;
	@NotNull(message = "El idActividad es obligatorio")
	@Positive(message = "El idActividad debe ser un número positivo")
	private Long idActividad; // ActividadEssi
	private String descActividad;
	@NotNull(message = "El idSubactividad es obligatorio")
	@Positive(message = "El idSubactividad debe ser un número positivo")
	private Long idSubactividad; // SubactividadEssi
	private String descSubactividad;

}
