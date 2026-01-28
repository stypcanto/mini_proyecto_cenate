package com.styp.cenate.service.disponibilidad;

import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadRequest;
import com.styp.cenate.dto.disponibilidad.SolicitudDisponibilidadResponse;

import java.util.List;

/**
 * Interfaz de servicio para la gestión de solicitudes de disponibilidad médica
 */
public interface ISolicitudDisponibilidadService {

    /**
     * Obtiene todas las solicitudes de disponibilidad del médico autenticado
     */
    List<SolicitudDisponibilidadResponse> obtenerSolicitudesMedico(String nombreUsuario);

    /**
     * Obtiene una solicitud de disponibilidad por su ID
     */
    SolicitudDisponibilidadResponse obtenerSolicitudPorId(Long idSolicitud);

    /**
     * Crea una nueva solicitud de disponibilidad
     */
    SolicitudDisponibilidadResponse crearSolicitud(
            SolicitudDisponibilidadRequest request,
            String nombreUsuario);

    /**
     * Actualiza una solicitud de disponibilidad existente
     */
    SolicitudDisponibilidadResponse actualizarSolicitud(
            Long idSolicitud,
            SolicitudDisponibilidadRequest request);

    /**
     * Envía una solicitud de disponibilidad a revisión
     */
    SolicitudDisponibilidadResponse enviarSolicitud(Long idSolicitud);

    /**
     * Obtiene las solicitudes de disponibilidad por período
     */
    List<SolicitudDisponibilidadResponse> obtenerSolicitudesPorPeriodo(Long idPeriodo);

    /**
     * Obtiene la solicitud activa del período actual para un médico
     */
    SolicitudDisponibilidadResponse obtenerSolicitudPeriodoActual(String nombreUsuario);

    /**
     * Elimina lógicamente una solicitud de disponibilidad
     */
    void eliminarSolicitud(Long idSolicitud);

    /**
     * Obtiene las solicitudes de un médico en un período
     */
    List<SolicitudDisponibilidadResponse> obtenerSolicitudesMedicoPorPeriodo(
            String nombreUsuario,
            Long idPeriodo);
}
