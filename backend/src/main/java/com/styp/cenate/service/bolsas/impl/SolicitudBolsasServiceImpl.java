package com.styp.cenate.service.bolsas.impl;

import com.styp.cenate.service.bolsas.SolicitudBolsasService;
import com.styp.cenate.dto.bolsas.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementación LEGACY para compatibilidad
 * ADVERTENCIA: Esta clase está deprecada. Usar SolicitudBolsaServiceImpl en su lugar
 *
 * @deprecated Usar SolicitudBolsaServiceImpl
 * @version v1.6.0
 * @since 2026-01-23
 */
@Slf4j
@Deprecated
@Service
public class SolicitudBolsasServiceImpl implements SolicitudBolsasService {

    private static final String DEPRECATED_MESSAGE = 
        "SolicitudBolsasService está deprecado. Usar SolicitudBolsaService (v1.6.0) en su lugar";

    @Override
    public List<SolicitudBolsaDTO> obtenerTodasLasSolicitudes() {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO obtenerSolicitudPorId(Long id) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO obtenerSolicitudPorNumero(String numero) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorBolsa(Long idBolsa) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorPaciente(String dni) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPorEstado(String estado) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public List<SolicitudBolsaDTO> obtenerSolicitudesPendientes() {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public Page<SolicitudBolsaDTO> buscarSolicitudes(String nombrePaciente, String dni, String estado, String numeroSolicitud, Pageable pageable) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public Object obtenerEstadisticas() {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO crearSolicitud(SolicitudBolsaRequestDTO request) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO actualizarSolicitud(Long id, SolicitudBolsaRequestDTO request) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO aprobarSolicitud(Long id, Long responsableId, String responsableNombre, String notas) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO rechazarSolicitud(Long id, Long responsableId, String responsableNombre, String razon) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public void eliminarSolicitud(Long id) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO asignarAGestora(Long id, AsignarGestoraRequest request) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public byte[] exportarCSV(List<Long> ids) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }

    @Override
    public SolicitudBolsaDTO enviarRecordatorio(Long id, EnviarRecordatorioRequest request) {
        log.warn(DEPRECATED_MESSAGE);
        throw new UnsupportedOperationException(DEPRECATED_MESSAGE);
    }
}
