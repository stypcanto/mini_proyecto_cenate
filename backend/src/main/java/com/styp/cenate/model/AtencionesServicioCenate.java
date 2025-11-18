package com.styp.cenate.model;

import java.time.LocalDate;
import java.time.OffsetDateTime;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "vw_ultima_atencion_6m_cnt", schema = "public")
@Immutable
@Data
public class AtencionesServicioCenate {

	@Id
	@Column(name = "pk_unica")
	private String pkUnica;

	@Column(name = "cod_ipress")
	private String codIpress;

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

}
