package com.styp.cenate.service.solicitudturno.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;
import com.styp.cenate.model.PeriodoSolicitudTurno;
import com.styp.cenate.repository.PeriodoSolicitudTurnoRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.service.solicitudturno.PeriodoSolicitudTurnoService;
import com.styp.cenate.utils.DateTimeUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Implementacion del servicio de periodos de solicitud de turnos.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PeriodoSolicitudTurnoServiceImpl implements PeriodoSolicitudTurnoService {

    private final PeriodoSolicitudTurnoRepository periodoRepository;
    private final AuditLogService auditLogService;

    @Override
    public List<PeriodoSolicitudTurnoResponse> listarTodos() {
        log.info("Listando todos los periodos de solicitud");
        return periodoRepository.findAllByOrderByPeriodoDesc()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PeriodoSolicitudTurnoResponse> listarActivos() {
        log.info("Listando periodos activos");
        return periodoRepository.findActivos()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PeriodoSolicitudTurnoResponse> listarVigentes() {
        log.info("Listando periodos vigentes");
        return periodoRepository.findVigentes()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PeriodoSolicitudTurnoResponse obtenerPorId(Long id) {
        log.info("Obteniendo periodo con ID: {}", id);
        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));
        return convertToResponse(periodo);
    }

    @Override
    @Transactional
    public PeriodoSolicitudTurnoResponse crear(PeriodoSolicitudTurnoRequest request, String createdBy) {
        log.info("Creando nuevo periodo: {}", request.getPeriodo());

        // Validar que no exista un periodo con el mismo codigo
        if (periodoRepository.existsByPeriodo(request.getPeriodo())) {
            throw new RuntimeException("Ya existe un periodo con el codigo: " + request.getPeriodo());
        }

        // Validar fechas
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        PeriodoSolicitudTurno periodo = PeriodoSolicitudTurno.builder()
                .periodo(request.getPeriodo())
                .descripcion(request.getDescripcion())
                .fechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()))
                .fechaFin(DateTimeUtils.endOfDay(request.getFechaFin()))
                .instrucciones(request.getInstrucciones())
                .estado("BORRADOR")
                .createdBy(createdBy)
                .build();

        periodo = periodoRepository.save(periodo);

        auditar("CREATE_PERIODO", "Periodo creado: " + periodo.getDescripcion(), "INFO", "SUCCESS");

        log.info("Periodo creado exitosamente con ID: {}", periodo.getIdPeriodo());
        return convertToResponse(periodo);
    }

    @Override
    @Transactional
    public PeriodoSolicitudTurnoResponse actualizar(Long id, PeriodoSolicitudTurnoRequest request) {
        log.info("Actualizando periodo con ID: {}", id);

        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

        // Solo se puede editar si esta en BORRADOR
        if (!periodo.isBorrador()) {
            throw new RuntimeException("Solo se pueden editar periodos en estado BORRADOR");
        }

        // Validar fechas
        if (request.getFechaFin().isBefore(request.getFechaInicio())) {
            throw new RuntimeException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        periodo.setDescripcion(request.getDescripcion());
        periodo.setFechaInicio(DateTimeUtils.startOfDay(request.getFechaInicio()));
        periodo.setFechaFin(DateTimeUtils.endOfDay(request.getFechaFin()));
        periodo.setInstrucciones(request.getInstrucciones());

        periodo = periodoRepository.save(periodo);

        auditar("UPDATE_PERIODO", "Periodo actualizado: " + periodo.getDescripcion(), "INFO", "SUCCESS");

        log.info("Periodo actualizado exitosamente");
        return convertToResponse(periodo);
    }

    @Override
    @Transactional
    public PeriodoSolicitudTurnoResponse cambiarEstado(Long id, String nuevoEstado) {
        log.info("Cambiando estado del periodo {} a {}", id, nuevoEstado);

        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

        String estadoAnterior = periodo.getEstado();

        // Validar transiciones de estado validas
        validarTransicionEstado(estadoAnterior, nuevoEstado);

        periodo.setEstado(nuevoEstado);
        periodo = periodoRepository.save(periodo);

        auditar("CAMBIO_ESTADO_PERIODO",
                String.format("Periodo %s: %s -> %s", periodo.getDescripcion(), estadoAnterior, nuevoEstado),
                "INFO", "SUCCESS");

        log.info("Estado del periodo cambiado exitosamente");
        return convertToResponse(periodo);
    }

    @Override
    @Transactional
    public void eliminar(Long id) {
        log.info("Eliminando periodo con ID: {}", id);

        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

        // Solo se puede eliminar si esta en BORRADOR
        if (!periodo.isBorrador()) {
            throw new RuntimeException("Solo se pueden eliminar periodos en estado BORRADOR");
        }

        String descripcion = periodo.getDescripcion();
        periodoRepository.delete(periodo);

        auditar("DELETE_PERIODO", "Periodo eliminado: " + descripcion, "WARNING", "SUCCESS");

        log.info("Periodo eliminado exitosamente");
    }

    @Override
    public PeriodoSolicitudTurnoResponse obtenerConEstadisticas(Long id) {
        log.info("Obteniendo periodo con estadisticas, ID: {}", id);

        PeriodoSolicitudTurno periodo = periodoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Periodo no encontrado con ID: " + id));

        PeriodoSolicitudTurnoResponse response = convertToResponse(periodo);

        // Agregar estadisticas
        response.setTotalSolicitudes(periodoRepository.countSolicitudesByPeriodo(id));
        response.setSolicitudesEnviadas(periodoRepository.countSolicitudesEnviadasByPeriodo(id));

        return response;
    }

    // ========================================
    // Metodos privados
    // ========================================

    private void validarTransicionEstado(String estadoActual, String nuevoEstado) {
        // Transiciones validas:
        // BORRADOR -> ACTIVO
        // ACTIVO -> CERRADO
        // CERRADO -> ACTIVO (reactivar)

        if ("BORRADOR".equals(estadoActual) && !"ACTIVO".equals(nuevoEstado)) {
            throw new RuntimeException("Un periodo en BORRADOR solo puede pasar a ACTIVO");
        }

        if ("ACTIVO".equals(estadoActual) && !"CERRADO".equals(nuevoEstado)) {
            throw new RuntimeException("Un periodo ACTIVO solo puede pasar a CERRADO");
        }

        if ("CERRADO".equals(estadoActual) && !"ACTIVO".equals(nuevoEstado)) {
            throw new RuntimeException("Un periodo CERRADO solo puede reactivarse a ACTIVO");
        }
    }

    private PeriodoSolicitudTurnoResponse convertToResponse(PeriodoSolicitudTurno periodo) {
        return PeriodoSolicitudTurnoResponse.builder()
                .idPeriodo(periodo.getIdPeriodo())
                .periodo(periodo.getPeriodo())
                .descripcion(periodo.getDescripcion())
                .fechaInicio(periodo.getFechaInicio())
                .fechaFin(periodo.getFechaFin())
                .estado(periodo.getEstado())
                .instrucciones(periodo.getInstrucciones())
                .createdBy(periodo.getCreatedBy())
                .createdAt(periodo.getCreatedAt())
                .updatedAt(periodo.getUpdatedAt())
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
