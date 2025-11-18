package com.styp.cenate.mapper.segu;

import java.util.List;
import java.util.stream.Collectors;

import com.styp.cenate.dto.segu.ModuloSistemaDTO;
import com.styp.cenate.model.ModuloSistema;

public class ModuloSistemaMapper {

	public static ModuloSistemaDTO toDTO(ModuloSistema entity) {
		ModuloSistemaDTO dto = new ModuloSistemaDTO(entity.getIdModulo(), entity.getNombreModulo(),
				entity.getDescripcion(), entity.getRutaBase(), entity.getActivo(), entity.getOrden());
		return dto;
	}

	public static ModuloSistema toEntity(ModuloSistemaDTO dto) {
		if (dto == null) {
			return null;
		}
		return ModuloSistema.builder().idModulo(dto.getIdModulo()).nombreModulo(dto.getNombreModulo())
				.descripcion(dto.getDescripcion()).rutaBase(dto.getRutaBase()).activo(dto.isActivo())
				.orden(dto.getOrden())
				.build();
		// Otros campos no se actualizan.
	}

	public static void updateEntityFromDto(ModuloSistemaDTO dto, ModuloSistema entity) {
		if (dto == null || entity == null) {
			return;
		}
		entity.setNombreModulo(dto.getNombreModulo());
		entity.setDescripcion(dto.getDescripcion());
		entity.setRutaBase(dto.getRutaBase());
		entity.setActivo(dto.isActivo());
		entity.setOrden(dto.getOrden());
		// Otros campos no se actualizan.
	}

	public static List<ModuloSistemaDTO> toDtoList(List<ModuloSistema> entities) {
		return entities.stream().map(ModuloSistemaMapper::toDTO).collect(Collectors.toList());
	}

	public static List<ModuloSistema> toEntityList(List<ModuloSistemaDTO> dtos) {
		return dtos.stream().map(ModuloSistemaMapper::toEntity).collect(Collectors.toList());
	}

}
