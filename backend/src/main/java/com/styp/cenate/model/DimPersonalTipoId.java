package com.styp.cenate.model;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DimPersonalTipoId {
	

	// FK a dim_personal_cnt
	private Long idPers;

	// FK a dim_tipo_personal
	private Long idTipoPers;

}
