package com.styp.cenate.mapper;

import java.util.List;

import com.styp.cenate.dto.DimPersonalTipoDTO;
import com.styp.cenate.model.DimPersonalTipo;
import com.styp.cenate.model.DimPersonalTipoId;

public class DimPersonalTipoMapper {

    private DimPersonalTipoMapper() {}

    public static DimPersonalTipoDTO toDto(DimPersonalTipo entity) {
        if (entity == null) return null;
        DimPersonalTipoId id = entity.getId();
        return DimPersonalTipoDTO.builder()
                .idPers(id.getIdPers())
                .idTipoPers(id.getIdTipoPers())
                .build();
    }

    public static List<DimPersonalTipoDTO> toDtoList(List<DimPersonalTipo> list) {
        return list.stream().map(DimPersonalTipoMapper::toDto).toList();
    }
}
