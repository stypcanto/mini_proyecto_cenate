package com.styp.cenate.mapper;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import com.styp.cenate.dto.disponibilidad.DetalleSolicitudDisponibilidadResponse;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadResponse;
import com.styp.cenate.model.PeriodoMedicoDisponibilidad;
import com.styp.cenate.model.PersonalCnt;
import com.styp.cenate.model.SolicitudDisponibilidadMedico;
import com.styp.cenate.model.SolicitudDisponibilidadMedicoDet;
import com.styp.cenate.repository.DimHorarioRepository;
import com.styp.cenate.repository.PersonalCntRepository;
import com.styp.cenate.repository.disponibilidad.PeriodoMedicoDisponibilidadRepository;

import lombok.RequiredArgsConstructor;

/**
 * Mapper para convertir entre entidades de SolicitudDisponibilidad y sus DTOs
 */
@Component
@RequiredArgsConstructor
public class SolicitudDisponibilidadMapper {

    private final PersonalCntRepository personalRepository;
    private final PeriodoMedicoDisponibilidadRepository periodoRepository;
    private final DimHorarioRepository horarioRepository;

    /**
     * Convierte un Request DTO a una entidad SolicitudDisponibilidadMedico
     */
    public SolicitudDisponibilidadMedico toEntity(
            SolicitudDisponibilidadRequest request,
            Long idPersonal,
            String usuarioRegistro) {
        
        PersonalCnt personal = personalRepository.findById(idPersonal)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Personal no encontrado con ID: " + idPersonal));
        
        PeriodoMedicoDisponibilidad periodo = periodoRepository.findById(request.getIdPeriodo())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, 
                "Período no encontrado con ID: " + request.getIdPeriodo()));
        
        SolicitudDisponibilidadMedico entity = SolicitudDisponibilidadMedico.builder()
                .personal(personal)
                .periodo(periodo)
                .estado(request.getEstado() != null ? request.getEstado() : "BORRADOR")
                .observacionMedico(request.getObservaciones())
                .createdBy(usuarioRegistro)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        
        return entity;
    }

    /**
     * Convierte una entidad SolicitudDisponibilidadMedico a Response DTO
     */
    public SolicitudDisponibilidadResponse toResponse(SolicitudDisponibilidadMedico entity) {
        if (entity == null) {
            return null;
        }

        // Extraer año y mes del período
        Integer anio = null;
        Integer mes = null;
        Long idPeriodo = null;
        
        if (entity.getPeriodo() != null) {
            idPeriodo = entity.getPeriodo().getIdPeriodoRegDisp();
            anio = entity.getPeriodo().getAnio();
            String periodoStr = entity.getPeriodo().getPeriodo();
            if (periodoStr != null && periodoStr.length() >= 6) {
                // Formato esperado: "202601" (YYYYMM)
                try {
                    mes = Integer.parseInt(periodoStr.substring(4, 6));
                } catch (Exception e) {
                    // Ignorar error de parseo
                }
            }
        }

        SolicitudDisponibilidadResponse.SolicitudDisponibilidadResponseBuilder builder = 
            SolicitudDisponibilidadResponse.builder()
                .idSolicitud(entity.getIdSolicitud())
                .idPeriodo(idPeriodo)
                .anio(anio)
                .mes(mes)
                .estado(entity.getEstado())
                .observaciones(entity.getObservacionMedico())
                .createdAt(entity.getCreatedAt());
        
        // Agregar observación de validador si existe
        if (entity.getObservacionValidador() != null) {
            builder.observacionValidador(entity.getObservacionValidador());
        }
        
        // Agregar detalles si existen
        if (entity.getDetalles() != null && !entity.getDetalles().isEmpty()) {
            builder.detalles(mapDetalles(entity.getDetalles()));
        }
        
        return builder.build();
    }

    /**
     * Convierte una lista de entidades a Response DTOs
     */
    public List<SolicitudDisponibilidadResponse> toResponseList(List<SolicitudDisponibilidadMedico> entities) {
        if (entities == null) {
            return null;
        }
        return entities.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Convierte los detalles de la entidad a Response DTOs
     */
    private List<DetalleSolicitudDisponibilidadResponse> mapDetalles(
            List<SolicitudDisponibilidadMedicoDet> detalles) {
        if (detalles == null) {
            return null;
        }
        return detalles.stream()
                .map(this::mapDetalle)
                .collect(Collectors.toList());
    }

    /**
     * Convierte un detalle de entidad a Response DTO
     */
    private DetalleSolicitudDisponibilidadResponse mapDetalle(
            SolicitudDisponibilidadMedicoDet detalle) {
        
        String turnoDescripcion = detalle.getTurno(); // 'M', 'T', 'N'
        if (detalle.getHorario() != null) {
            turnoDescripcion = detalle.getHorario().getDescHorario();
        }
        
        return DetalleSolicitudDisponibilidadResponse.builder()
                .idDetalle(detalle.getIdDetalle())
                .fecha(detalle.getFecha())
                .turno(detalle.getTurno())
                .turnoDescripcion(turnoDescripcion)
                .estado(detalle.getEstado())
                .build();
    }

    /**
     * Convierte un Request DTO para detalle a entidad
     */
    public SolicitudDisponibilidadMedicoDet toDetailEntity(
            SolicitudDisponibilidadRequest.DetalleSolicitudDisponibilidadRequest detailRequest,
            SolicitudDisponibilidadMedico solicitud) {
        
        SolicitudDisponibilidadMedicoDet.SolicitudDisponibilidadMedicoDetBuilder builder = 
            SolicitudDisponibilidadMedicoDet.builder()
                .solicitud(solicitud)
                .fecha(detailRequest.getFecha())
                .turno(detailRequest.getTurno())
                .estado("PROPUESTO")
                .createdAt(LocalDateTime.now());
        
        // Agregar horario si se proporciona ID
        if (detailRequest.getIdHorario() != null) {
            horarioRepository.findById(detailRequest.getIdHorario())
                .ifPresent(builder::horario);
        }
        
        return builder.build();
    }
}
