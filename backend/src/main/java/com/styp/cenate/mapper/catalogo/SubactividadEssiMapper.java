package com.styp.cenate.mapper.catalogo;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.styp.cenate.dto.catalogo.SubactividadEssiRequestDTO;
import com.styp.cenate.dto.catalogo.SubactividadEssiResponseDTO;
import com.styp.cenate.dto.catalogo.SubactividadEssiUpdateDTO;
import com.styp.cenate.model.SubactividadEssi;

public final class SubactividadEssiMapper {

	private SubactividadEssiMapper() {
	}

	public static SubactividadEssi toEntity(SubactividadEssiRequestDTO dto) {
		if (dto == null)
			return null;

		OffsetDateTime now = OffsetDateTime.now();

		return SubactividadEssi.builder().codSubactividad(dto.getCodSubactividad())
				.descSubactividad(dto.getDescSubactividad()).esCenate(Boolean.TRUE.equals(dto.getEsCenate()))
				.estado("A").createdAt(now).updatedAt(null).build();
	}

	public static SubactividadEssiResponseDTO toDto(SubactividadEssi entity) {
		if (entity == null)
			return null;

		SubactividadEssiResponseDTO dto = new SubactividadEssiResponseDTO();
		dto.setIdSubactividad(entity.getIdSubactividad());
		dto.setCodSubactividad(entity.getCodSubactividad());
		dto.setDescSubactividad(entity.getDescSubactividad());
		dto.setEstado(entity.getEstado());
		dto.setEsCenate(entity.isEsCenate());
		dto.setCreatedAt(entity.getCreatedAt());
		return dto;
	}

	public static List<SubactividadEssiResponseDTO> toDtoList(List<SubactividadEssi> entities) {
		if (entities == null || entities.isEmpty())
			return Collections.emptyList();
		return entities.stream().filter(Objects::nonNull).map(SubactividadEssiMapper::toDto)
				.collect(Collectors.toList());
	}

	// Actualizacion Parcial
	public static void applyUpdate(SubactividadEssi entity, SubactividadEssiUpdateDTO dto) {
		if (entity == null || dto == null)
			return;

		if (dto.getCodSubactividad() != null) {
			entity.setCodSubactividad(dto.getCodSubactividad());
		}
		if (dto.getDescSubactividad() != null) {
			entity.setDescSubactividad(dto.getDescSubactividad());
		}
		if (dto.getEsCenate() != null) {
			entity.setEsCenate(dto.getEsCenate());
		}

		if (dto.getEstado() != null) {
			entity.setEstado(dto.getEstado());
		}

		entity.setUpdatedAt(OffsetDateTime.now());
	}

	// Actualizacion Total
	public static void applyPut(SubactividadEssi entity, SubactividadEssiUpdateDTO dto) {
		if (entity == null || dto == null)
			return;

		entity.setCodSubactividad(dto.getCodSubactividad());
		entity.setDescSubactividad(dto.getDescSubactividad());
		entity.setEsCenate(Boolean.TRUE.equals(dto.getEsCenate()));
		entity.setEstado(dto.getEstado());
		entity.setUpdatedAt(OffsetDateTime.now());
	}
}
