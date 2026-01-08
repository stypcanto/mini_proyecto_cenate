package com.styp.cenate.mapper.catalogo;

import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

import com.styp.cenate.dto.catalogo.ActividadEssiResponseDTO;
import com.styp.cenate.model.ActividadEssi;

public final class ActividadEssiMapper {

    private ActividadEssiMapper() {
    }

    public static ActividadEssiResponseDTO toDto(ActividadEssi entity) {
        if (entity == null) return null;

        ActividadEssiResponseDTO dto = new ActividadEssiResponseDTO();
        dto.setIdActividad(entity.getIdActividad());
        dto.setCodActividad(entity.getCodActividad());
        dto.setDescActividad(entity.getDescActividad());
        dto.setEstado(entity.getEstado());
        dto.setEsCenate(entity.isEsCenate());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }

    public static List<ActividadEssiResponseDTO> toDtoList(List<ActividadEssi> entities) {
        if (entities == null || entities.isEmpty()) {
            return Collections.emptyList();
        }

        return entities.stream()
            .filter(Objects::nonNull)
            .map(ActividadEssiMapper::toDto)
            .collect(Collectors.toList());
    }
}
