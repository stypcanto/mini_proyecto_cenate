package com.styp.cenate.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Table(name = "solicitud_contrasena_temporal")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SolicitudContrasena {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="id_usuario")
	@ToString.Exclude
	@EqualsAndHashCode.Exclude
	private Usuario usuario;

	@Column(name = "contrasena_hash", nullable = false, length = 255)
	private String contrasenaHash;

	@Column(name = "fecha_emision", nullable = true)
	private LocalDateTime fechaEmision;
	
	@Column(name = "fecha_registro", nullable = false)
	private LocalDateTime fecha_registro;

	@Column(name = "estado", nullable = false, length = 20)
	private String estado;

	@Column(name = "intentos_envio", nullable = false)
	private int intentosEnvio;

	@Column(name = "ultimo_error")
	private String ultimoError;

	@Column(name = "ip_solicitante", length = 45)
	private String ipSolicitante;
	
	@Column(name= "idempotencia")
	private String idempotencia;
	
	@Column(name= "correo_destino")
	private String correoDestino;
	

	@PrePersist
	public void prePersist() {
		this.fecha_registro = LocalDateTime.now();
		this.estado = (this.estado == null) ? "PENDIENTE" : this.estado;
		this.intentosEnvio = 0;
	}

}
