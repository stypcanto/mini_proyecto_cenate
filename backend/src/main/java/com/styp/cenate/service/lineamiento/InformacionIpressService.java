package com.styp.cenate.service.lineamiento;

import com.styp.cenate.dto.InformacionIpressRequest;
import com.styp.cenate.dto.InformacionIpressResponse;
import com.styp.cenate.model.InformacionIpress;
import com.styp.cenate.model.Ipress;
import com.styp.cenate.model.Lineamiento;
import com.styp.cenate.repository.InformacionIpressRepository;
import com.styp.cenate.repository.IpressRepository;
import com.styp.cenate.repository.LineamientoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Servicio para gestionar Información IPRESS
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InformacionIpressService {

    private final InformacionIpressRepository informacionIpressRepository;
    private final LineamientoRepository lineamientoRepository;
    private final IpressRepository ipressRepository;

    /**
     * Crear nueva información IPRESS
     */
    public InformacionIpressResponse crear(InformacionIpressRequest request) {
        log.info("📝 Creando información IPRESS - Lineamiento: {}, IPRESS: {}",
                request.getIdLineamiento(), request.getIdIpress());

        Lineamiento lineamiento = lineamientoRepository.findById(request.getIdLineamiento())
                .orElseThrow(() -> new RuntimeException("Lineamiento no encontrado"));

        Ipress ipress = ipressRepository.findById(request.getIdIpress())
                .orElseThrow(() -> new RuntimeException("IPRESS no encontrada"));

        InformacionIpress informacion = InformacionIpress.builder()
                .lineamiento(lineamiento)
                .ipress(ipress)
                .contenido(request.getContenido())
                .requisitos(request.getRequisitos())
                .fechaImplementacion(request.getFechaImplementacion())
                .estadoCumplimiento(request.getEstadoCumplimiento())
                .observaciones(request.getObservaciones())
                .responsable(request.getResponsable())
                .build();

        InformacionIpress guardada = informacionIpressRepository.save(informacion);
        log.info("✅ Información IPRESS creada exitosamente con ID: {}", guardada.getIdInformacionIpress());

        return mapToResponse(guardada);
    }

    /**
     * Actualizar información IPRESS
     */
    public InformacionIpressResponse actualizar(Long id, InformacionIpressRequest request) {
        log.info("✏️ Actualizando información IPRESS ID: {}", id);

        InformacionIpress informacion = informacionIpressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Información IPRESS no encontrada con ID: " + id));

        informacion.setContenido(request.getContenido());
        informacion.setRequisitos(request.getRequisitos());
        informacion.setFechaImplementacion(request.getFechaImplementacion());
        informacion.setEstadoCumplimiento(request.getEstadoCumplimiento());
        informacion.setObservaciones(request.getObservaciones());
        informacion.setResponsable(request.getResponsable());

        InformacionIpress actualizada = informacionIpressRepository.save(informacion);
        log.info("✅ Información IPRESS actualizada exitosamente");

        return mapToResponse(actualizada);
    }

    /**
     * Obtener información IPRESS por ID
     */
    @Transactional(readOnly = true)
    public InformacionIpressResponse obtenerPorId(Long id) {
        InformacionIpress informacion = informacionIpressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Información IPRESS no encontrada con ID: " + id));
        return mapToResponse(informacion);
    }

    /**
     * Obtener todas las informaciones de un lineamiento
     */
    @Transactional(readOnly = true)
    public List<InformacionIpressResponse> obtenerPorLineamiento(Long idLineamiento) {
        return informacionIpressRepository.findByLineamiento_IdLineamiento(idLineamiento)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Obtener todas las informaciones de una IPRESS
     */
    @Transactional(readOnly = true)
    public List<InformacionIpressResponse> obtenerPorIpress(Long idIpress) {
        return informacionIpressRepository.findByIpress_IdIpress(idIpress)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Listar paginado por lineamiento
     */
    @Transactional(readOnly = true)
    public Page<InformacionIpressResponse> listarPorLineamiento(Long idLineamiento, Pageable pageable) {
        return informacionIpressRepository.findByLineamiento_IdLineamiento(idLineamiento, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Listar paginado por IPRESS
     */
    @Transactional(readOnly = true)
    public Page<InformacionIpressResponse> listarPorIpress(Long idIpress, Pageable pageable) {
        return informacionIpressRepository.findByIpress_IdIpress(idIpress, pageable)
                .map(this::mapToResponse);
    }

    /**
     * Listar todas con paginación
     */
    @Transactional(readOnly = true)
    public Page<InformacionIpressResponse> listarTodas(Pageable pageable) {
        return informacionIpressRepository.findAllOrdenado(pageable)
                .map(this::mapToResponse);
    }

    /**
     * Cambiar estado de cumplimiento
     */
    public InformacionIpressResponse cambiarEstadoCumplimiento(Long id, String nuevoEstado) {
        log.info("🔄 Cambiando estado de cumplimiento ID: {} a: {}", id, nuevoEstado);

        InformacionIpress informacion = informacionIpressRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Información IPRESS no encontrada con ID: " + id));

        informacion.setEstadoCumplimiento(nuevoEstado);
        InformacionIpress actualizada = informacionIpressRepository.save(informacion);

        return mapToResponse(actualizada);
    }

    /**
     * Eliminar información IPRESS
     */
    public void eliminar(Long id) {
        log.info("🗑️ Eliminando información IPRESS ID: {}", id);

        if (!informacionIpressRepository.existsById(id)) {
            throw new RuntimeException("Información IPRESS no encontrada con ID: " + id);
        }

        informacionIpressRepository.deleteById(id);
        log.info("✅ Información IPRESS eliminada exitosamente");
    }

    /**
     * Contar informaciones que cumplen
     */
    @Transactional(readOnly = true)
    public Long contarCumple() {
        return informacionIpressRepository.countCumple();
    }

    /**
     * Contar informaciones de una IPRESS que cumplen
     */
    @Transactional(readOnly = true)
    public Long contarCumpleByIpress(Long idIpress) {
        return informacionIpressRepository.countCumpleByIpress(idIpress);
    }

    /**
     * Convierte InformacionIpress a InformacionIpressResponse
     */
    private InformacionIpressResponse mapToResponse(InformacionIpress informacion) {
        return InformacionIpressResponse.builder()
                .idInformacionIpress(informacion.getIdInformacionIpress())
                .idLineamiento(informacion.getLineamiento().getIdLineamiento())
                .codigoLineamiento(informacion.getLineamiento().getCodigo())
                .tituloLineamiento(informacion.getLineamiento().getTitulo())
                .idIpress(informacion.getIpress().getIdIpress())
                .descIpress(informacion.getIpress().getDescIpress())
                .nombreRed(informacion.getIpress().getRed() != null ?
                        informacion.getIpress().getRed().getDescripcion() : "")
                .contenido(informacion.getContenido())
                .requisitos(informacion.getRequisitos())
                .fechaImplementacion(informacion.getFechaImplementacion())
                .estadoCumplimiento(informacion.getEstadoCumplimiento())
                .observaciones(informacion.getObservaciones())
                .responsable(informacion.getResponsable())
                .createdAt(informacion.getCreatedAt())
                .updatedAt(informacion.getUpdatedAt())
                .cumple(informacion.cumple())
                .build();
    }
}
