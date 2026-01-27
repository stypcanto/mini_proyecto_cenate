package com.styp.cenate.mapper.disponibilidad;

import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.PeriodoMedicoDisponibilidadResponse;
import com.styp.cenate.model.PeriodoMedicoDisponibilidad;
import com.styp.cenate.utils.DateTimeUtils;

/**
 * Mapper manual para convertir entre entidad y DTOs de
 * {@link PeriodoMedicoDisponibilidad}.
 */
public class PeriodoMedicoDisponibilidadMapper {

    private PeriodoMedicoDisponibilidadMapper() {
        // util
    }

    public static PeriodoMedicoDisponibilidad toEntity(
            PeriodoMedicoDisponibilidadRequest request,
            String createdBy
    ) {
        if (request == null) {
            return null;
        }

        return PeriodoMedicoDisponibilidad.builder()
                .anio(request.getAnio())
                .periodo(request.getPeriodo())
                .descripcion(request.getDescripcion())
                .fechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()))
                .fechaFin(DateTimeUtils.endOfDay(request.getFechaFin()))
                .estado("BORRADOR")
                .createdBy(createdBy)
                .build();
    }

    public static void updateEntity(
            PeriodoMedicoDisponibilidad entity,
            PeriodoMedicoDisponibilidadRequest request,
            String updatedBy
    ) {
        if (entity == null || request == null) {
            return;
        }

        entity.setAnio(request.getAnio());
        entity.setPeriodo(request.getPeriodo());
        entity.setDescripcion(request.getDescripcion());
        entity.setFechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()));
        entity.setFechaFin(DateTimeUtils.endOfDay(request.getFechaFin()));
        entity.setUpdatedBy(updatedBy);
    }

    public static PeriodoMedicoDisponibilidadResponse toResponse(PeriodoMedicoDisponibilidad entity) {
        if (entity == null) {
            return null;
        }

        return PeriodoMedicoDisponibilidadResponse.builder()
                .idPeriodoRegDisp(entity.getIdPeriodoRegDisp())
                .anio(entity.getAnio())
                .periodo(entity.getPeriodo())
                .descripcion(entity.getDescripcion())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .estado(entity.getEstado())
                .createdBy(entity.getCreatedBy())
                .updatedBy(entity.getUpdatedBy())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}

