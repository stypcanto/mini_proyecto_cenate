package com.styp.cenate.mapper;

import java.util.List;

import com.styp.cenate.dto.DimOrigenPersonalDTO;
import com.styp.cenate.model.DimOrigenPersonal;

public class DimOrigenPersonalMapper {

    private DimOrigenPersonalMapper() {}

    public static DimOrigenPersonalDTO toDto(DimOrigenPersonal entity) {
        if (entity == null) return null;
        return DimOrigenPersonalDTO.builder()
                .idOrigen(entity.getIdOrigen())
                .descOrigen(entity.getDescOrigen())
                .estado(entity.getEstado())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static DimOrigenPersonal toEntity(DimOrigenPersonalDTO dto) {
        if (dto == null) return null;
        return DimOrigenPersonal.builder()
                .idOrigen(dto.getIdOrigen())
                .descOrigen(dto.getDescOrigen())
                .estado(dto.getEstado())
                .createdAt(dto.getCreatedAt())
                .updatedAt(dto.getUpdatedAt())
                .build();
    }

    public static List<DimOrigenPersonalDTO> toDtoList(List<DimOrigenPersonal> list) {
        return list.stream().map(DimOrigenPersonalMapper::toDto).toList();
    }
}
