package com.styp.cenate.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record AtencionesServicioGlobalDTO(

		/** Identificador único de la vista (clave compuesta o hash único). */
		String pkUnica,

		/** Nombre del centro o establecimiento de archivo. */
		String centroArchivo,

		/** Descripción del centro de atención. */
		String centro,

		/** Código del servicio de atención. */
		String codServicio,

		/** Nombre o descripción del servicio o especialidad. */
		String servicio,

		/** Documento del paciente (DNI, CE, etc.). */
		String docPaciente,

		/** Nombre completo del paciente. */
		String paciente,

		/** Fecha de la última cita registrada. */
		LocalDate ultimaFechaCita,

		/** Hora de la última cita registrada. */
		LocalTime ultimaHoraCita

) {

}
