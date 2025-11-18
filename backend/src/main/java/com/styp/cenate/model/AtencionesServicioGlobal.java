package com.styp.cenate.model;

import java.time.LocalDate;
import java.time.LocalTime;
import org.hibernate.annotations.Immutable;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "vw_ultima_atencion_6m_nacional", schema = "public")
@Immutable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AtencionesServicioGlobal {

	@Id
	@Column(name = "pk_unica", nullable = false)
	private String pkUnica;

	@Column(name = "centro_archivo")
	private String centroArchivo;

	@Column(name = "centro")
	private String centro;

	@Column(name = "cod_servicio")
	private String codServicio;

	@Column(name = "servicio")
	private String servicio;

	@Column(name = "doc_paciente")
	private String docPaciente;

	@Column(name = "paciente")
	private String paciente;

	@Column(name = "ultima_fecha_cita")
	private LocalDate ultimaFechaCita;

	@Column(name = "ultima_hora_cita")
	private LocalTime ultimaHoraCita;

}
