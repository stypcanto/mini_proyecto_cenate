package com.styp.cenate.service.bolsas.impl;

import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaRequestDTO;
import com.styp.cenate.mapper.SolicitudBolsaMapper;
import com.styp.cenate.model.SolicitudBolsa;
import com.styp.cenate.repository.SolicitudBolsaRepository;
import com.styp.cenate.service.bolsas.SolicitudBolsasService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * 📋 Servicio de Solicitudes de Bolsas - Implementación
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class SolicitudBolsasServiceImpl implements SolicitudBolsasService {

    private final SolicitudBolsaRepository solicitudBolsaRepository;

    // ========================================================================
    // 🔍 CONSULTAS
    // ========================================================================

    @Override
    public List<SolicitudBolsaDTO> obtenerTodasLasSolicitudes() {
        log.info("📋 Obteniendo todas las solicitudes");
        return SolicitudBolsaMapper.toDtoList(
                solicitudBolsaRepository.findByActivoOrderByFechaSolicitudDesc(true)
        );
    }

    @Override
    public SolicitudBolsaDTO obtenerSolicitudPorId(Long idSolicitud) {
        log.info("🔍 Obteniendo solicitud ID: {}", idSolicitud);
        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));
        return SolicitudBolsaMapper.toDto(solicitud);
    }

    @Override
    public SolicitudBolsaDTO obtenerSolicitudPorNumero(String numeroSolicitud) {
        log.info("🔍 Obteniendo solicitud: {}", numeroSolicitud);
        SolicitudBolsa solicitud = solicitudBolsaRepository.findByNumeroSolicitud(numeroSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + numeroSolicitud));
        return SolicitudBolsaMapper.toDto(solicitud);
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorBolsa(Long idBolsa) {
        log.info("📋 Obteniendo solicitudes de bolsa: {}", idBolsa);
        return SolicitudBolsaMapper.toDtoList(
                solicitudBolsaRepository.findByIdBolsaAndActivo(idBolsa, true)
        );
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorPaciente(String dni) {
        log.info("📋 Obteniendo solicitudes de paciente: {}", dni);
        return SolicitudBolsaMapper.toDtoList(
                solicitudBolsaRepository.findByPacienteDniAndActivo(dni, true)
        );
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorEstado(String estado) {
        log.info("📋 Obteniendo solicitudes por estado: {}", estado);
        return SolicitudBolsaMapper.toDtoList(
                solicitudBolsaRepository.findByEstadoAndActivo(estado, true)
        );
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPendientes() {
        log.info("📋 Obteniendo solicitudes pendientes");
        return SolicitudBolsaMapper.toDtoList(
                solicitudBolsaRepository.findByEstadoAndActivoOrderByFechaSolicitudAsc("PENDIENTE", true)
        );
    }

    @Override
    public Page<SolicitudBolsaDTO> buscarSolicitudes(
            String nombrePaciente, String dni, String estado, String numeroSolicitud, Pageable pageable) {
        log.info("🔎 Buscando solicitudes: paciente={}, dni={}, estado={}", nombrePaciente, dni, estado);
        return solicitudBolsaRepository.buscarSolicitudes(nombrePaciente, dni, estado, numeroSolicitud, true, pageable)
                .map(SolicitudBolsaMapper::toDto);
    }

    @Override
    public EstadisticasSolicitudesDTO obtenerEstadisticas() {
        log.info("📊 Calculando estadísticas de solicitudes");

        long totalSolicitudes = solicitudBolsaRepository.countByActivo(true);
        long solicitudesPendientes = solicitudBolsaRepository.countByEstadoAndActivo("PENDIENTE", true);
        long solicitudesAprobadas = solicitudBolsaRepository.countByEstadoAndActivo("APROBADA", true);
        long solicitudesRechazadas = solicitudBolsaRepository.countByEstadoAndActivo("RECHAZADA", true);

        double porcentajeAprobadas = totalSolicitudes > 0
                ? (double) solicitudesAprobadas / totalSolicitudes * 100
                : 0.0;

        // Solicitudes antiguas (más de 30 días pendientes)
        OffsetDateTime hace30Dias = OffsetDateTime.now().minusDays(30);
        long solicitudesAntiguas = solicitudBolsaRepository
                .findSolicitudesPendientesAntiguasDias(30)
                .size();

        return new EstadisticasSolicitudesDTO(
                totalSolicitudes,
                solicitudesPendientes,
                solicitudesAprobadas,
                solicitudesRechazadas,
                porcentajeAprobadas,
                solicitudesAntiguas
        );
    }

    // ========================================================================
    // ✏️ CREACIÓN Y ACTUALIZACIÓN
    // ========================================================================

    @Override
    @Transactional
    public SolicitudBolsaDTO crearSolicitud(SolicitudBolsaRequestDTO request) {
        log.info("✏️ Creando nueva solicitud para paciente: {}", request.getPacienteDni());

        SolicitudBolsa solicitud = SolicitudBolsaMapper.toEntity(request);
        SolicitudBolsa solicitudGuardada = solicitudBolsaRepository.save(solicitud);


        return SolicitudBolsaMapper.toDto(solicitudGuardada);
    }

    @Override
    @Transactional
    public SolicitudBolsaDTO actualizarSolicitud(Long idSolicitud, SolicitudBolsaRequestDTO request) {
        log.info("✏️ Actualizando solicitud ID: {}", idSolicitud);

        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

        if (!solicitud.getEstado().equals("PENDIENTE")) {
            throw new RuntimeException("Solo se pueden actualizar solicitudes pendientes");
        }

        SolicitudBolsaMapper.updateEntity(solicitud, request);
        SolicitudBolsa solicitudActualizada = solicitudBolsaRepository.save(solicitud);


        return SolicitudBolsaMapper.toDto(solicitudActualizada);
    }

    // ========================================================================
    // ✅ APROBACIÓN Y RECHAZO
    // ========================================================================

    @Override
    @Transactional
    public SolicitudBolsaDTO aprobarSolicitud(Long idSolicitud, Long responsableId, String responsableNombre, String notas) {
        log.info("✅ Aprobando solicitud ID: {}", idSolicitud);

        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

        if (!solicitud.getEstado().equals("PENDIENTE")) {
            throw new RuntimeException("Solo se pueden aprobar solicitudes pendientes");
        }

        solicitud.setEstado("APROBADA");
        solicitud.setResponsableAprobacionId(responsableId);
        solicitud.setResponsableAprobacionNombre(responsableNombre);
        solicitud.setNotasAprobacion(notas);
        solicitud.setFechaAprobacion(java.time.OffsetDateTime.now());

        SolicitudBolsa solicitudAprobada = solicitudBolsaRepository.save(solicitud);


        return SolicitudBolsaMapper.toDto(solicitudAprobada);
    }

    @Override
    @Transactional
    public SolicitudBolsaDTO rechazarSolicitud(Long idSolicitud, Long responsableId, String responsableNombre, String razon) {
        log.info("❌ Rechazando solicitud ID: {}", idSolicitud);

        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

        if (!solicitud.getEstado().equals("PENDIENTE")) {
            throw new RuntimeException("Solo se pueden rechazar solicitudes pendientes");
        }

        solicitud.setEstado("RECHAZADA");
        solicitud.setResponsableAprobacionId(responsableId);
        solicitud.setResponsableAprobacionNombre(responsableNombre);
        solicitud.setRazonRechazo(razon);
        solicitud.setFechaAprobacion(java.time.OffsetDateTime.now());

        SolicitudBolsa solicitudRechazada = solicitudBolsaRepository.save(solicitud);


        return SolicitudBolsaMapper.toDto(solicitudRechazada);
    }

    // ========================================================================
    // 🗑️ ELIMINACIÓN
    // ========================================================================

    @Override
    @Transactional
    public void eliminarSolicitud(Long idSolicitud) {
        log.warn("🗑️ Eliminando solicitud ID: {}", idSolicitud);

        SolicitudBolsa solicitud = solicitudBolsaRepository.findById(idSolicitud)
                .orElseThrow(() -> new RuntimeException("Solicitud no encontrada con ID: " + idSolicitud));

        if (!solicitud.getEstado().equals("PENDIENTE")) {
            throw new RuntimeException("Solo se pueden eliminar solicitudes pendientes");
        }

        solicitud.setActivo(false);
        solicitudBolsaRepository.save(solicitud);

    }
}
