package com.styp.cenate.mapper;

import java.util.List;

import com.styp.cenate.dto.DimTipoPersonalDTO;
import com.styp.cenate.model.DimTipoPersonal;

public class DimTipoPersonalMapper {

	private DimTipoPersonalMapper() {
	}

	// ============================================================
	// ENTITY → DTO
	// ============================================================
	public static DimTipoPersonalDTO toDto(DimTipoPersonal entity) {
		if (entity == null)
			return null;

		return DimTipoPersonalDTO.builder().idTipPers(entity.getIdTipPers()).descTipPers(entity.getDescTipPers())
				.statTipPers(entity.getStatTipPers()).createAt(entity.getCreateAt()).updateAt(entity.getUpdateAt())
				.build();
	}

	// ============================================================
	// DTO → ENTITY (solo para crear)
	// ============================================================
	public static DimTipoPersonal toEntity(DimTipoPersonalDTO dto) {
		if (dto == null)
			return null;

		return DimTipoPersonal.builder().idTipPers(dto.getIdTipPers()) // puede venir null
				.descTipPers(dto.getDescTipPers()).statTipPers(dto.getStatTipPers())
				// Auditoría NO SE SETEA (Spring la maneja)
				.build();
	}

	// ============================================================
	// ACTUALIZAR ENTITY DESDE DTO (sin perder auditoría)
	// ============================================================
	public static void updateEntity(DimTipoPersonal entity, DimTipoPersonalDTO dto) {

		entity.setDescTipPers(dto.getDescTipPers());
		entity.setStatTipPers(dto.getStatTipPers());
		// Auditoría NO se toca
	}

	// ============================================================
	// LISTA ENTITY → LISTA DTO
	// ============================================================
	public static List<DimTipoPersonalDTO> toDtoList(List<DimTipoPersonal> list) {
		return list.stream().map(DimTipoPersonalMapper::toDto).toList();
	}
}
