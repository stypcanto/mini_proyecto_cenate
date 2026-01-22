package com.styp.cenate.mapper;

import com.styp.cenate.dto.bolsas.BolsaDTO;
import com.styp.cenate.dto.bolsas.BolsaRequestDTO;
import com.styp.cenate.model.DimBolsa;

import java.util.List;

/**
 * 📊 Mapper para conversión entre DimBolsa y BolsaDTO
 */
public class BolsaMapper {

    private BolsaMapper() {
    }

    // ============================================================
    // ENTITY → DTO
    // ============================================================
    public static BolsaDTO toDto(DimBolsa entity) {
        if (entity == null)
            return null;

        return BolsaDTO.builder()
                .idBolsa(entity.getIdBolsa())
                .nombreBolsa(entity.getNombreBolsa())
                .descripcion(entity.getDescripcion())
                .especialidadId(entity.getEspecialidadId())
                .especialidadNombre(entity.getEspecialidadNombre())
                .responsableId(entity.getResponsableId())
                .responsableNombre(entity.getResponsableNombre())
                .totalPacientes(entity.getTotalPacientes())
                .pacientesAsignados(entity.getPacientesAsignados())
                .porcentajeAsignacion(entity.getPorcentajeAsignacion())
                .estado(entity.getEstado())
                .fechaCreacion(entity.getFechaCreacion())
                .fechaActualizacion(entity.getFechaActualizacion())
                .activo(entity.getActivo())
                .build();
    }

    // ============================================================
    // DTO → ENTITY (para crear)
    // ============================================================
    public static DimBolsa toEntity(BolsaRequestDTO dto) {
        if (dto == null)
            return null;

        return DimBolsa.builder()
                .nombreBolsa(dto.getNombreBolsa())
                .descripcion(dto.getDescripcion())
                .especialidadId(dto.getEspecialidadId())
                .especialidadNombre(dto.getEspecialidadNombre())
                .responsableId(dto.getResponsableId())
                .responsableNombre(dto.getResponsableNombre())
                .totalPacientes(dto.getTotalPacientes() != null ? dto.getTotalPacientes() : 0)
                .pacientesAsignados(0)
                .estado("ACTIVA")
                .activo(true)
                .build();
    }

    // ============================================================
    // ACTUALIZAR ENTITY DESDE DTO (sin perder auditoría)
    // ============================================================
    public static void updateEntity(DimBolsa entity, BolsaRequestDTO dto) {
        entity.setNombreBolsa(dto.getNombreBolsa());
        entity.setDescripcion(dto.getDescripcion());
        entity.setEspecialidadId(dto.getEspecialidadId());
        entity.setEspecialidadNombre(dto.getEspecialidadNombre());
        entity.setResponsableId(dto.getResponsableId());
        entity.setResponsableNombre(dto.getResponsableNombre());
        if (dto.getTotalPacientes() != null) {
            entity.setTotalPacientes(dto.getTotalPacientes());
        }
        // Auditoría NO se toca
    }

    // ============================================================
    // LISTA ENTITY → LISTA DTO
    // ============================================================
    public static List<BolsaDTO> toDtoList(List<DimBolsa> list) {
        return list.stream().map(BolsaMapper::toDto).toList();
    }
}
