package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interfaz LEGACY para compatibilidad con BolsasController
 * Esta clase actúa como alias/wrapper de SolicitudBolsaService
 * Para código nuevo, usar SolicitudBolsaService
 *
 * @deprecated Usar SolicitudBolsaService en su lugar
 * @version v1.6.0
 * @since 2026-01-23
 */
@Deprecated
public interface SolicitudBolsasService {

    // Métodos stub para compatibilidad con controlador antiguo
    List<SolicitudBolsaDTO> obtenerTodasLasSolicitudes();

    SolicitudBolsaDTO obtenerSolicitudPorId(Long id);

    SolicitudBolsaDTO obtenerSolicitudPorNumero(String numero);

    List<SolicitudBolsaDTO> obtenerSolicitudesPorBolsa(Long idBolsa);

    List<SolicitudBolsaDTO> obtenerSolicitudesPorPaciente(String dni);

    List<SolicitudBolsaDTO> obtenerSolicitudesPorEstado(String estado);

    List<SolicitudBolsaDTO> obtenerSolicitudesPendientes();

    Page<SolicitudBolsaDTO> buscarSolicitudes(String nombrePaciente, String dni, String estado, String numeroSolicitud, Pageable pageable);

    Object obtenerEstadisticas();

    SolicitudBolsaDTO crearSolicitud(SolicitudBolsaRequestDTO request);

    SolicitudBolsaDTO actualizarSolicitud(Long id, SolicitudBolsaRequestDTO request);

    SolicitudBolsaDTO aprobarSolicitud(Long id, Long responsableId, String responsableNombre, String notas);

    SolicitudBolsaDTO rechazarSolicitud(Long id, Long responsableId, String responsableNombre, String razon);

    void eliminarSolicitud(Long id);

    SolicitudBolsaDTO asignarAGestora(Long id, AsignarGestoraRequest request);

    byte[] exportarCSV(List<Long> ids);

    SolicitudBolsaDTO enviarRecordatorio(Long id, EnviarRecordatorioRequest request);
}
