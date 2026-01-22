package com.styp.cenate.service.bolsas;

import com.styp.cenate.dto.bolsas.AprobacionSolicitudDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import com.styp.cenate.dto.bolsas.SolicitudBolsaRequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * 📋 Servicio para gestión de Solicitudes de Bolsas
 * v1.0.0 - Interface de servicio
 */
public interface SolicitudBolsasService {

    // ========================================================================
    // 🔍 CONSULTAS
    // ========================================================================

    /**
     * Obtiene todas las solicitudes
     */
    List<SolicitudBolsaDTO> obtenerTodasLasSolicitudes();

    /**
     * Obtiene una solicitud por ID
     */
    SolicitudBolsaDTO obtenerSolicitudPorId(Long idSolicitud);

    /**
     * Obtiene solicitud por número
     */
    SolicitudBolsaDTO obtenerSolicitudPorNumero(String numeroSolicitud);

    /**
     * Obtiene solicitudes de una bolsa
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesPorBolsa(Long idBolsa);

    /**
     * Obtiene solicitudes de un paciente
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesPorPaciente(String dni);

    /**
     * Obtiene solicitudes por estado
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesPorEstado(String estado);

    /**
     * Obtiene solicitudes pendientes
     */
    List<SolicitudBolsaDTO> obtenerSolicitudesPendientes();

    /**
     * Búsqueda paginada con filtros
     */
    Page<SolicitudBolsaDTO> buscarSolicitudes(String nombrePaciente, String dni, String estado, String numeroSolicitud, Pageable pageable);

    /**
     * Obtiene estadísticas de solicitudes
     */
    EstadisticasSolicitudesDTO obtenerEstadisticas();

    // ========================================================================
    // ✏️ CREACIÓN Y ACTUALIZACIÓN
    // ========================================================================

    /**
     * Crea una nueva solicitud
     */
    SolicitudBolsaDTO crearSolicitud(SolicitudBolsaRequestDTO request);

    /**
     * Actualiza una solicitud
     */
    SolicitudBolsaDTO actualizarSolicitud(Long idSolicitud, SolicitudBolsaRequestDTO request);

    // ========================================================================
    // ✅ APROBACIÓN Y RECHAZO
    // ========================================================================

    /**
     * Aprueba una solicitud
     */
    SolicitudBolsaDTO aprobarSolicitud(Long idSolicitud, Long responsableId, String responsableNombre, String notas);

    /**
     * Rechaza una solicitud
     */
    SolicitudBolsaDTO rechazarSolicitud(Long idSolicitud, Long responsableId, String responsableNombre, String razon);

    // ========================================================================
    // 🗑️ ELIMINACIÓN
    // ========================================================================

    /**
     * Elimina una solicitud (solo si está pendiente)
     */
    void eliminarSolicitud(Long idSolicitud);

    // ========================================================================
    // 📊 DTO INTERNAS
    // ========================================================================

    /**
     * DTO para estadísticas
     */
    record EstadisticasSolicitudesDTO(
        Long totalSolicitudes,
        Long solicitudesPendientes,
        Long solicitudesAprobadas,
        Long solicitudesRechazadas,
        Double porcentajeAprobadas,
        Long solicitudesAntiguas
    ) {}
}
