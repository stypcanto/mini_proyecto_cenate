package com.styp.cenate.service.solicitudturnos.impl;

import com.styp.cenate.dto.SolicitudTurnosRequest;
import com.styp.cenate.dto.SolicitudTurnosResponse;
import com.styp.cenate.model.Especialidad;
import com.styp.cenate.model.SolicitudTurnosDetalle;
import com.styp.cenate.model.SolicitudTurnosMensual;
import com.styp.cenate.repository.EspecialidadRepository;
import com.styp.cenate.repository.SolicitudTurnosDetalleRepository;
import com.styp.cenate.repository.SolicitudTurnosMensualRepository;
import com.styp.cenate.service.solicitudturnos.ISolicitudTurnosService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudTurnosServiceImpl implements ISolicitudTurnosService {

    private final SolicitudTurnosMensualRepository solicitudRepository;
    private final SolicitudTurnosDetalleRepository detalleRepository;
    private final EspecialidadRepository especialidadRepository;

    @Override
    @Transactional
    public SolicitudTurnosResponse guardarSolicitud(SolicitudTurnosRequest request) {
        log.info("Guardando solicitud para periodo {} e IPRESS {}", request.getPeriodo(), request.getIdIpress());

        // Buscar si ya existe
        Optional<SolicitudTurnosMensual> existente = solicitudRepository.findByPeriodoAndIdIpress(
                request.getPeriodo(), request.getIdIpress());

        SolicitudTurnosMensual solicitud;

        if (existente.isPresent()) {
            // Actualizar existente
            solicitud = existente.get();

            // Solo se puede actualizar si está en BORRADOR
            if (!"BORRADOR".equals(solicitud.getEstado())) {
                throw new RuntimeException("Solo se pueden modificar solicitudes en estado BORRADOR");
            }

            solicitud.setObservacionesGenerales(request.getObservacionesGenerales());

            // Limpiar detalles anteriores
            solicitud.getDetalles().clear();

        } else {
            // Crear nueva
            solicitud = SolicitudTurnosMensual.builder()
                    .periodo(request.getPeriodo())
                    .idIpress(request.getIdIpress())
                    .estado("BORRADOR")
                    .observacionesGenerales(request.getObservacionesGenerales())
                    .build();
        }

        // Agregar nuevos detalles
        if (request.getDetalles() != null) {
            for (SolicitudTurnosRequest.DetalleEspecialidadRequest detalleReq : request.getDetalles()) {
                if (detalleReq.getCantidadTurnos() > 0) {
                    SolicitudTurnosDetalle detalle = SolicitudTurnosDetalle.builder()
                            .idServicio(detalleReq.getIdServicio())
                            .cantidadTurnos(detalleReq.getCantidadTurnos())
                            .observaciones(detalleReq.getObservaciones())
                            .horarioPreferido(detalleReq.getHorarioPreferido())
                            .build();
                    solicitud.addDetalle(detalle);
                }
            }
        }

        SolicitudTurnosMensual saved = solicitudRepository.save(solicitud);
        log.info("Solicitud guardada con ID: {}", saved.getIdSolicitud());

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SolicitudTurnosResponse> obtenerPorId(Long idSolicitud) {
        log.info("Obteniendo solicitud por ID: {}", idSolicitud);
        return solicitudRepository.findById(idSolicitud).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SolicitudTurnosResponse> obtenerPorPeriodoYIpress(String periodo, Long idIpress) {
        log.info("Obteniendo solicitud para periodo {} e IPRESS {}", periodo, idIpress);
        return solicitudRepository.findByPeriodoAndIdIpress(periodo, idIpress).map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudTurnosResponse> listarPorIpress(Long idIpress) {
        log.info("Listando solicitudes de IPRESS: {}", idIpress);
        return solicitudRepository.findByIdIpressOrderByPeriodoDesc(idIpress)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudTurnosResponse> listarPorPeriodo(String periodo) {
        log.info("Listando solicitudes del periodo: {}", periodo);
        return solicitudRepository.findByPeriodoOrderByIdIpressAsc(periodo)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudTurnosResponse> listarPorEstado(String estado) {
        log.info("Listando solicitudes con estado: {}", estado);
        return solicitudRepository.findByEstadoOrderByPeriodoDesc(estado)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public SolicitudTurnosResponse enviarSolicitud(Long idSolicitud) {
        log.info("Enviando solicitud ID: {}", idSolicitud);

        SolicitudTurnosMensual solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        if (!"BORRADOR".equals(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden enviar solicitudes en estado BORRADOR");
        }

        if (solicitud.getDetalles().isEmpty()) {
            throw new RuntimeException("No se puede enviar una solicitud sin especialidades");
        }

        solicitud.setEstado("ENVIADO");
        solicitud.setFechaEnvio(LocalDateTime.now());

        SolicitudTurnosMensual saved = solicitudRepository.save(solicitud);
        log.info("Solicitud enviada exitosamente");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public SolicitudTurnosResponse aprobarSolicitud(Long idSolicitud) {
        log.info("Aprobando solicitud ID: {}", idSolicitud);

        SolicitudTurnosMensual solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        if (!"ENVIADO".equals(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden aprobar solicitudes en estado ENVIADO");
        }

        solicitud.setEstado("APROBADO");
        SolicitudTurnosMensual saved = solicitudRepository.save(solicitud);
        log.info("Solicitud aprobada exitosamente");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public SolicitudTurnosResponse rechazarSolicitud(Long idSolicitud, String motivo) {
        log.info("Rechazando solicitud ID: {} - Motivo: {}", idSolicitud, motivo);

        SolicitudTurnosMensual solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        if (!"ENVIADO".equals(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes en estado ENVIADO");
        }

        solicitud.setEstado("RECHAZADO");
        solicitud.setObservacionesGenerales(
                (solicitud.getObservacionesGenerales() != null ? solicitud.getObservacionesGenerales() + "\n\n" : "") +
                "MOTIVO DE RECHAZO: " + motivo
        );

        SolicitudTurnosMensual saved = solicitudRepository.save(solicitud);
        log.info("Solicitud rechazada exitosamente");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public void eliminarSolicitud(Long idSolicitud) {
        log.info("Eliminando solicitud ID: {}", idSolicitud);

        SolicitudTurnosMensual solicitud = solicitudRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + idSolicitud));

        if (!"BORRADOR".equals(solicitud.getEstado())) {
            throw new RuntimeException("Solo se pueden eliminar solicitudes en estado BORRADOR");
        }

        solicitudRepository.delete(solicitud);
        log.info("Solicitud eliminada exitosamente");
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existeSolicitud(String periodo, Long idIpress) {
        return solicitudRepository.existsByPeriodoAndIdIpress(periodo, idIpress);
    }

    // =========================================================================
    // Mappers
    // =========================================================================

    private SolicitudTurnosResponse toResponse(SolicitudTurnosMensual solicitud) {
        List<SolicitudTurnosResponse.DetalleEspecialidadResponse> detalles = solicitud.getDetalles()
                .stream()
                .map(this::toDetalleResponse)
                .collect(Collectors.toList());

        int totalTurnos = detalles.stream()
                .mapToInt(SolicitudTurnosResponse.DetalleEspecialidadResponse::getCantidadTurnos)
                .sum();

        return SolicitudTurnosResponse.builder()
                .idSolicitud(solicitud.getIdSolicitud())
                .periodo(solicitud.getPeriodo())
                .idIpress(solicitud.getIdIpress())
                .nombreIpress("") // Se completará en el controller con datos de IPRESS
                .codigoIpress("")
                .estado(solicitud.getEstado())
                .fechaEnvio(solicitud.getFechaEnvio())
                .observacionesGenerales(solicitud.getObservacionesGenerales())
                .totalEspecialidades(detalles.size())
                .totalTurnos(totalTurnos)
                .detalles(detalles)
                .createdAt(solicitud.getCreatedAt())
                .updatedAt(solicitud.getUpdatedAt())
                .build();
    }

    private SolicitudTurnosResponse.DetalleEspecialidadResponse toDetalleResponse(SolicitudTurnosDetalle detalle) {
        // Obtener nombre de especialidad
        String nombreEspecialidad = especialidadRepository.findById(detalle.getIdServicio().longValue())
                .map(Especialidad::getDescServicio)
                .orElse("Especialidad no encontrada");

        return SolicitudTurnosResponse.DetalleEspecialidadResponse.builder()
                .idDetalle(detalle.getIdDetalle())
                .idServicio(detalle.getIdServicio())
                .nombreEspecialidad(nombreEspecialidad)
                .cantidadTurnos(detalle.getCantidadTurnos())
                .observaciones(detalle.getObservaciones())
                .horarioPreferido(detalle.getHorarioPreferido())
                .build();
    }
}
