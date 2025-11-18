package com.styp.cenate.mapper;

import java.util.List;
import com.styp.cenate.dto.DimServicioEssiDTO;
import com.styp.cenate.model.DimServicioEssi;

public class DimServicioEssiMapper {

	private DimServicioEssiMapper() {
	}

	public static DimServicioEssiDTO toDto(DimServicioEssi entity) {
		if (entity == null)
			return null;
		return DimServicioEssiDTO.builder().idServicio(entity.getIdServicio()).codServicio(entity.getCodServicio())
				.descServicio(entity.getDescServicio()).esCenate(entity.getEsCenate()).estado(entity.getEstado())
				.esAperturaNuevos(entity.getEsAperturaNuevos()).createdAt(entity.getCreatedAt())
				.updatedAt(entity.getUpdatedAt()).build();
	}

	public static DimServicioEssi toEntity(DimServicioEssiDTO dto) {
		if (dto == null)
			return null;
		return DimServicioEssi.builder().idServicio(dto.getIdServicio()).codServicio(dto.getCodServicio())
				.descServicio(dto.getDescServicio()).esCenate(dto.getEsCenate()).estado(dto.getEstado())
				.esAperturaNuevos(dto.getEsAperturaNuevos()).createdAt(dto.getCreatedAt()).updatedAt(dto.getUpdatedAt())
				.build();
	}

	public static List<DimServicioEssiDTO> toDtoList(List<DimServicioEssi> list) {
		return list.stream().map(DimServicioEssiMapper::toDto).toList();
	}
}
