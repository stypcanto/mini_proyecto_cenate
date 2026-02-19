package com.styp.cenate.mapper.disponibilidad;

import com.styp.cenate.dto.disponibilidad.CtrPeriodoRequest;
import com.styp.cenate.dto.disponibilidad.CtrPeriodoResponse;
import com.styp.cenate.model.Area;
import com.styp.cenate.model.CtrPeriodo;
import com.styp.cenate.model.CtrPeriodoId;
import com.styp.cenate.model.Usuario;

import java.time.OffsetDateTime;

/**
 * Mapper para conversión entre Entity y DTOs de CtrPeriodo.
 */
public final class CtrPeriodoMapper {

    private CtrPeriodoMapper() {
        // Utility class
    }

    /**
     * Convierte un CtrPeriodo entity a CtrPeriodoResponse DTO.
     */
    public static CtrPeriodoResponse toResponse(CtrPeriodo entity) {
        if (entity == null) {
            return null;
        }

        CtrPeriodoResponse.CtrPeriodoResponseBuilder builder = CtrPeriodoResponse.builder()
                .periodo(entity.getPeriodo())
                .idArea(entity.getIdArea())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .estado(entity.getEstado())
                .idCoordinador(entity.getIdCoordinador())
                .fechaApertura(entity.getFechaApertura())
                .fechaCierre(entity.getFechaCierre())
                .idUsuarioUltimaAccion(entity.getIdUsuarioUltimaAccion())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .anio(entity.getAnio())
                .mes(entity.getMes());

        // Nombre del área
        if (entity.getArea() != null) {
            builder.nombreArea(entity.getArea().getDescArea());
        }

        // Nombre del coordinador (usa getNombreCompleto que obtiene de PersonalCnt)
        if (entity.getCoordinador() != null) {
            builder.nombreCoordinador(entity.getCoordinador().getNombreCompleto());
        }

        // Nombre del usuario última acción
        if (entity.getUsuarioUltimaAccion() != null) {
            builder.nombreUsuarioUltimaAccion(entity.getUsuarioUltimaAccion().getNombreCompleto());
        }

        return builder.build();
    }

    /**
     * Convierte un CtrPeriodoRequest a CtrPeriodo entity.
     * 
     * @param request DTO de request
     * @param area Área asociada al periodo
     * @param idArea ID del área (obtenido del backend)
     * @param coordinadorId ID del coordinador
     * @return Entity CtrPeriodo
     */
    public static CtrPeriodo toEntity(CtrPeriodoRequest request, Area area, Long idArea, Long coordinadorId) {
        if (request == null) {
            return null;
        }

        CtrPeriodoId id = CtrPeriodoId.builder()
                .periodo(request.getPeriodo())
                .idArea(idArea)
                .build();

        String estado = request.getEstado();
        if (estado == null || estado.isBlank()) {
            estado = "ABIERTO";
        }

        return CtrPeriodo.builder()
                .id(id)
                .area(area)
                .fechaInicio(request.getFechaInicio())
                .fechaFin(request.getFechaFin())
                .estado(estado)
                .idCoordinador(coordinadorId)
                .fechaApertura(OffsetDateTime.now())
                .build();
    }

    /**
     * Actualiza un entity existente con datos del request.
     * 
     * @param entity Entity a actualizar
     * @param request DTO con los nuevos datos
     * @param usuarioId ID del usuario que realiza la acción
     */
    public static void updateEntity(CtrPeriodo entity, CtrPeriodoRequest request, Long usuarioId) {
        if (entity == null || request == null) {
            return;
        }

        entity.setFechaInicio(request.getFechaInicio());
        entity.setFechaFin(request.getFechaFin());
        entity.setIdUsuarioUltimaAccion(usuarioId);
    }
}
