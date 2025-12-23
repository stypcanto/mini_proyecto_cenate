package com.styp.cenate.service.solicitudturno.impl;

import com.styp.cenate.dto.*;
import com.styp.cenate.model.*;
import com.styp.cenate.repository.*;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.solicitudturno.SolicitudTurnoIpressService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementacion del servicio de solicitudes de turnos de IPRESS.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SolicitudTurnoIpressServiceImpl implements SolicitudTurnoIpressService {

    private final SolicitudTurnoIpressRepository solicitudRepository;
    private final PeriodoSolicitudTurnoRepository periodoRepository;
    private final DetalleSolicitudTurnoRepository detalleRepository;
    private final PersonalCntRepository personalCntRepository;
    private final UsuarioRepository usuarioRepository;
    private final DimServicioEssiRepository servicioEssiRepository;
    private final AuditLogService auditLogService;

    // ========================================
    // Obtener datos del usuario actual
    // ========================================

    @Override
    public MiIpressResponse obtenerMiIpress() {
        PersonalCnt personal = obtenerPersonalActual();

        MiIpressResponse.MiIpressResponseBuilder builder = MiIpressResponse.builder()
                .idPers(personal.getIdPers())
                .dniUsuario(personal.getNumDocPers())
                .nombreCompleto(personal.getNombreCompleto())
                .emailContacto(personal.getEmailCorpPers() != null ?
                        personal.getEmailCorpPers() : personal.getEmailPers())
                .telefonoContacto(personal.getMovilPers());

        Ipress ipress = personal.getIpress();
        if (ipress != null) {
            builder.idIpress(ipress.getIdIpress())
                   .codIpress(ipress.getCodIpress())
                   .nombreIpress(ipress.getDescIpress());

            Red red = ipress.getRed();
            if (red != null) {
                builder.idRed(red.getId())
                       .nombreRed(red.getDescripcion());
            }
        }

        // Validar completitud de datos
        boolean datosCompletos = ipress != null &&
                                 personal.getEmailCorpPers() != null &&
                                 personal.getMovilPers() != null;

        String mensaje = datosCompletos ? "Datos completos" :
                "Faltan datos. Contacte al administrador para actualizar su perfil.";

        builder.datosCompletos(datosCompletos)
               .mensajeValidacion(mensaje);

        return builder.build();
    }

    // ========================================
    // Listar solicitudes
    // ========================================

    @Override
    public List<SolicitudTurnoIpressResponse> listarPorPeriodo(Long idPeriodo) {
        log.info("Listando solicitudes del periodo: {}", idPeriodo);
        return solicitudRepository.findByPeriodoWithIpress(idPeriodo)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SolicitudTurnoIpressResponse> listarPorPeriodoYRed(Long idPeriodo, Long idRed) {
        log.info("Listando solicitudes del periodo {} y red {}", idPeriodo, idRed);
        return solicitudRepository.findByPeriodoAndRed(idPeriodo, idRed)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SolicitudTurnoIpressResponse> listarPorIpress(Long idIpress) {
        log.info("Listando solicitudes de IPRESS: {}", idIpress);
        return solicitudRepository.findByIpress(idIpress)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<SolicitudTurnoIpressResponse> listarMisSolicitudes() {
        PersonalCnt personal = obtenerPersonalActual();
        log.info("Listando solicitudes del usuario: {}", personal.getIdPers());
        return solicitudRepository.findByPersonalIdPersOrderByCreatedAtDesc(personal.getIdPers())
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ========================================
    // Obtener solicitud
    // ========================================

    @Override
    public SolicitudTurnoIpressResponse obtenerPorId(Long id) {
        log.info("Obteniendo solicitud con ID: {}", id);
        SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));
        return convertToResponse(solicitud);
    }

    @Override
    public SolicitudTurnoIpressResponse obtenerPorIdConDetalles(Long id) {
        log.info("Obteniendo solicitud con detalles, ID: {}", id);
        SolicitudTurnoIpress solicitud = solicitudRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));
        return convertToResponseWithDetalles(solicitud);
    }

    @Override
    public SolicitudTurnoIpressResponse obtenerMiSolicitud(Long idPeriodo) {
        PersonalCnt personal = obtenerPersonalActual();
        log.info("Obteniendo solicitud del usuario {} para periodo {}", personal.getIdPers(), idPeriodo);

        return solicitudRepository.findByPeriodoIdPeriodoAndPersonalIdPers(idPeriodo, personal.getIdPers())
                .map(this::convertToResponseWithDetalles)
                .orElse(null);
    }

    @Override
    public boolean existeMiSolicitud(Long idPeriodo) {
        PersonalCnt personal = obtenerPersonalActual();
        return solicitudRepository.existsByPeriodoIdPeriodoAndPersonalIdPers(idPeriodo, personal.getIdPers());
    }

    // ========================================
    // Crear y actualizar
    // ========================================

    @Override
    @Transactional
    public SolicitudTurnoIpressResponse crear(SolicitudTurnoIpressRequest request) {
        PersonalCnt personal = obtenerPersonalActual();
        log.info("Creando solicitud para usuario {} en periodo {}", personal.getIdPers(), request.getIdPeriodo());

        // Validar que no exista solicitud previa
        if (solicitudRepository.existsByPeriodoIdPeriodoAndPersonalIdPers(request.getIdPeriodo(), personal.getIdPers())) {
            throw new RuntimeException("Ya existe una solicitud para este periodo. Use actualizar en su lugar.");
        }

        // Validar que el periodo existe y esta activo
        PeriodoSolicitudTurno periodo = periodoRepository.findById(request.getIdPeriodo())
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + request.getIdPeriodo()));

        if (!periodo.isActivo()) {
            throw new RuntimeException("El periodo no esta activo para recibir solicitudes");
        }

        // Crear solicitud
        SolicitudTurnoIpress solicitud = SolicitudTurnoIpress.builder()
                .periodo(periodo)
                .personal(personal)
                .estado("BORRADOR")
                .build();

        solicitud = solicitudRepository.save(solicitud);

        // Agregar detalles
        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            agregarDetalles(solicitud, request.getDetalles());
        }

        auditar("CREATE_SOLICITUD",
                String.format("Solicitud creada para IPRESS: %s, Periodo: %s",
                        personal.getIpress() != null ? personal.getIpress().getDescIpress() : "N/A",
                        periodo.getDescripcion()),
                "INFO", "SUCCESS");

        log.info("Solicitud creada exitosamente con ID: {}", solicitud.getIdSolicitud());
        return convertToResponseWithDetalles(solicitud);
    }

    @Override
    @Transactional
    public SolicitudTurnoIpressResponse actualizar(Long id, SolicitudTurnoIpressRequest request) {
        log.info("Actualizando solicitud con ID: {}", id);

        SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

        // Validar que la solicitud pertenece al usuario actual o es coordinador
        validarPropietarioOCoordinador(solicitud);

        // Solo se puede editar en borrador o enviado (no revisado)
        if (solicitud.isRevisado()) {
            throw new RuntimeException("No se puede modificar una solicitud ya revisada");
        }

        // Eliminar detalles anteriores y agregar nuevos
        detalleRepository.deleteBySolicitudIdSolicitud(id);
        solicitud.getDetalles().clear();

        if (request.getDetalles() != null && !request.getDetalles().isEmpty()) {
            agregarDetalles(solicitud, request.getDetalles());
        }

        solicitud = solicitudRepository.save(solicitud);

        auditar("UPDATE_SOLICITUD",
                String.format("Solicitud actualizada ID: %d, IPRESS: %s",
                        id, solicitud.getNombreIpress()),
                "INFO", "SUCCESS");

        log.info("Solicitud actualizada exitosamente");
        return convertToResponseWithDetalles(solicitud);
    }

    @Override
    @Transactional
    public SolicitudTurnoIpressResponse guardarBorrador(SolicitudTurnoIpressRequest request) {
        PersonalCnt personal = obtenerPersonalActual();

        // Verificar si ya existe una solicitud
        var existente = solicitudRepository.findByPeriodoIdPeriodoAndPersonalIdPers(
                request.getIdPeriodo(), personal.getIdPers());

        if (existente.isPresent()) {
            // Actualizar existente
            return actualizar(existente.get().getIdSolicitud(), request);
        } else {
            // Crear nueva
            return crear(request);
        }
    }

    // ========================================
    // Cambios de estado
    // ========================================

    @Override
    @Transactional
    public SolicitudTurnoIpressResponse enviar(Long id) {
        log.info("Enviando solicitud con ID: {}", id);

        SolicitudTurnoIpress solicitud = solicitudRepository.findByIdWithDetalles(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

        // Validar propietario
        validarPropietario(solicitud);

        // Validar que tenga al menos un detalle con turnos
        boolean tieneTurnos = solicitud.getDetalles().stream()
                .anyMatch(d -> d.getTurnosSolicitados() != null && d.getTurnosSolicitados() > 0);

        if (!tieneTurnos) {
            throw new RuntimeException("Debe solicitar al menos un turno antes de enviar");
        }

        // Validar que el periodo siga activo
        if (!solicitud.getPeriodo().isActivo()) {
            throw new RuntimeException("El periodo ya no esta activo");
        }

        solicitud.enviar();
        solicitud = solicitudRepository.save(solicitud);

        auditar("ENVIAR_SOLICITUD",
                String.format("Solicitud enviada ID: %d, IPRESS: %s, Periodo: %s",
                        id, solicitud.getNombreIpress(), solicitud.getPeriodo().getDescripcion()),
                "INFO", "SUCCESS");

        log.info("Solicitud enviada exitosamente");
        return convertToResponseWithDetalles(solicitud);
    }

    @Override
    @Transactional
    public SolicitudTurnoIpressResponse marcarRevisada(Long id) {
        log.info("Marcando solicitud como revisada, ID: {}", id);

        SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

        if (!solicitud.isEnviado()) {
            throw new RuntimeException("Solo se pueden revisar solicitudes enviadas");
        }

        solicitud.marcarRevisada();
        solicitud = solicitudRepository.save(solicitud);

        auditar("REVISAR_SOLICITUD",
                String.format("Solicitud marcada como revisada ID: %d, IPRESS: %s",
                        id, solicitud.getNombreIpress()),
                "INFO", "SUCCESS");

        log.info("Solicitud marcada como revisada");
        return convertToResponse(solicitud);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando solicitud con ID: {}", id);

        SolicitudTurnoIpress solicitud = solicitudRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + id));

        // Validar propietario
        validarPropietario(solicitud);

        // Solo se puede eliminar en borrador
        if (!solicitud.isBorrador()) {
            throw new RuntimeException("Solo se pueden eliminar solicitudes en estado BORRADOR");
        }

        String descripcion = String.format("IPRESS: %s, Periodo: %s",
                solicitud.getNombreIpress(), solicitud.getPeriodo().getDescripcion());

        solicitudRepository.delete(solicitud);

        auditar("DELETE_SOLICITUD", "Solicitud eliminada: " + descripcion, "WARNING", "SUCCESS");

        log.info("Solicitud eliminada exitosamente");
    }

    // ========================================
    // Metodos privados auxiliares
    // ========================================

    private PersonalCnt obtenerPersonalActual() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioRepository.findByNameUser(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username));

        return personalCntRepository.findByUsuario_IdUser(usuario.getIdUser())
                .orElseThrow(() -> new RuntimeException("Personal no encontrado para el usuario: " + username));
    }

    private void validarPropietario(SolicitudTurnoIpress solicitud) {
        PersonalCnt personal = obtenerPersonalActual();
        if (!solicitud.getPersonal().getIdPers().equals(personal.getIdPers())) {
            throw new RuntimeException("No tiene permisos para modificar esta solicitud");
        }
    }

    private void validarPropietarioOCoordinador(SolicitudTurnoIpress solicitud) {
        // Por ahora solo validamos propietario
        // TODO: Agregar validacion de rol COORDINADOR si es necesario
        validarPropietario(solicitud);
    }

    private void agregarDetalles(SolicitudTurnoIpress solicitud, List<DetalleSolicitudTurnoRequest> detallesRequest) {
        for (DetalleSolicitudTurnoRequest detalleReq : detallesRequest) {
            DimServicioEssi especialidad = servicioEssiRepository.findById(detalleReq.getIdServicio())
                    .orElseThrow(() -> new RuntimeException(
                            "Especialidad no encontrada con ID: " + detalleReq.getIdServicio()));

            DetalleSolicitudTurno detalle = DetalleSolicitudTurno.builder()
                    .solicitud(solicitud)
                    .especialidad(especialidad)
                    .turnosSolicitados(detalleReq.getTurnosSolicitados() != null ?
                            detalleReq.getTurnosSolicitados() : 0)
                    .turnoPreferente(detalleReq.getTurnoPreferente())
                    .diaPreferente(detalleReq.getDiaPreferente())
                    .observacion(detalleReq.getObservacion())
                    .build();

            solicitud.getDetalles().add(detalle);
        }
    }

    // ========================================
    // Conversores
    // ========================================

    private SolicitudTurnoIpressResponse convertToResponse(SolicitudTurnoIpress solicitud) {
        SolicitudTurnoIpressResponse.SolicitudTurnoIpressResponseBuilder builder =
                SolicitudTurnoIpressResponse.builder()
                        .idSolicitud(solicitud.getIdSolicitud())
                        .idPeriodo(solicitud.getPeriodo().getIdPeriodo())
                        .periodoDescripcion(solicitud.getPeriodo().getDescripcion())
                        .estado(solicitud.getEstado())
                        .fechaEnvio(solicitud.getFechaEnvio())
                        .createdAt(solicitud.getCreatedAt())
                        .updatedAt(solicitud.getUpdatedAt());

        // Datos del personal
        PersonalCnt personal = solicitud.getPersonal();
        if (personal != null) {
            builder.idPers(personal.getIdPers())
                   .dniUsuario(personal.getNumDocPers())
                   .nombreCompleto(personal.getNombreCompleto())
                   .emailContacto(personal.getEmailCorpPers() != null ?
                           personal.getEmailCorpPers() : personal.getEmailPers())
                   .telefonoContacto(personal.getMovilPers());

            // Datos IPRESS
            Ipress ipress = personal.getIpress();
            if (ipress != null) {
                builder.idIpress(ipress.getIdIpress())
                       .codIpress(ipress.getCodIpress())
                       .nombreIpress(ipress.getDescIpress());

                // Datos Red
                Red red = ipress.getRed();
                if (red != null) {
                    builder.idRed(red.getId())
                           .nombreRed(red.getDescripcion());
                }
            }
        }

        return builder.build();
    }

    private SolicitudTurnoIpressResponse convertToResponseWithDetalles(SolicitudTurnoIpress solicitud) {
        SolicitudTurnoIpressResponse response = convertToResponse(solicitud);

        // Cargar detalles
        List<DetalleSolicitudTurnoResponse> detalles = new ArrayList<>();
        int totalTurnos = 0;
        int especialidadesConTurnos = 0;

        for (DetalleSolicitudTurno detalle : solicitud.getDetalles()) {
            detalles.add(convertDetalleToResponse(detalle));

            if (detalle.getTurnosSolicitados() != null && detalle.getTurnosSolicitados() > 0) {
                totalTurnos += detalle.getTurnosSolicitados();
                especialidadesConTurnos++;
            }
        }

        response.setDetalles(detalles);
        response.setTotalTurnosSolicitados(totalTurnos);
        response.setTotalEspecialidades(especialidadesConTurnos);

        return response;
    }

    private DetalleSolicitudTurnoResponse convertDetalleToResponse(DetalleSolicitudTurno detalle) {
        return DetalleSolicitudTurnoResponse.builder()
                .idDetalle(detalle.getIdDetalle())
                .idSolicitud(detalle.getSolicitud().getIdSolicitud())
                .idServicio(detalle.getEspecialidad().getIdServicio())
                .codServicio(detalle.getEspecialidad().getCodServicio())
                .nombreEspecialidad(detalle.getEspecialidad().getDescServicio())
                .turnosSolicitados(detalle.getTurnosSolicitados())
                .turnoPreferente(detalle.getTurnoPreferente())
                .diaPreferente(detalle.getDiaPreferente())
                .observacion(detalle.getObservacion())
                .createdAt(detalle.getCreatedAt())
                .build();
    }

    private void auditar(String action, String detalle, String nivel, String estado) {
        try {
            String usuario = SecurityContextHolder.getContext().getAuthentication().getName();
            auditLogService.registrarEvento(usuario, action, "SOLICITUD_TURNOS", detalle, nivel, estado);
        } catch (Exception e) {
            log.warn("No se pudo registrar auditoria: {}", e.getMessage());
        }
    }
}
