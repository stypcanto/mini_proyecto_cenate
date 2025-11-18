package com.styp.cenate.model;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "dim_servicio_essi", schema = "public")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimServicioEssi {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "id_servicio")
	private Long idServicio;

	@Column(name = "cod_servicio", length = 10, nullable = false)
	private String codServicio;

	@Column(name = "desc_servicio", columnDefinition = "text", nullable = false)
	private String descServicio;

	@Column(name = "es_cenate", nullable = false)
	private Boolean esCenate = false;

	@Column(name = "estado", columnDefinition = "bpchar(1)", nullable = false)
	private String estado = "A";

	@Column(name = "created_at", columnDefinition = "timestamptz", updatable = false)
	private OffsetDateTime createdAt;

	@Column(name = "updated_at", columnDefinition = "timestamptz")
	private OffsetDateTime updatedAt;
	
	@Column(name = "es_apertura_nuevos", nullable = false)
	private Boolean esAperturaNuevos=false;

	@PrePersist
	protected void onCreate() {
		this.createdAt = OffsetDateTime.now();
		this.updatedAt = OffsetDateTime.now();
	}

	@PreUpdate
	protected void onUpdate() {
		this.updatedAt = OffsetDateTime.now();
	}
	
	@OneToMany(mappedBy = "servicioEssi", fetch = FetchType.LAZY)
	private Set<PersonalCnt> personal = new HashSet<>();
	
	
	

}
