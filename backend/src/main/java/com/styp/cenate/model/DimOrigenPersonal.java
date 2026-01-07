package com.styp.cenate.model;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dim_origen_personal")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimOrigenPersonal {

	    @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    @Column(name = "id_origen")
	    private Long idOrigen;

	    @Column(name = "desc_origen", nullable = false)
	    private String descOrigen;

	    @Column(name = "estado", nullable = false, length = 1)
	    private String estado;

	    @CreationTimestamp
	    @Column(name = "created_at", updatable = false)
	    private OffsetDateTime createdAt;

	    @UpdateTimestamp
	    @Column(name = "updated_at")
	    private OffsetDateTime updatedAt;
	    
	    @OneToMany(fetch = FetchType.LAZY, mappedBy = "origenPersonal")
	    @Builder.Default
	    private Set<PersonalCnt> personal = new HashSet<>();
	    
	    
	 
}
