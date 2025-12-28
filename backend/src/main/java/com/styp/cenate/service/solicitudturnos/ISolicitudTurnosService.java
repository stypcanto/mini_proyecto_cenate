package com.styp.cenate.service.solicitudturnos;

import com.styp.cenate.dto.SolicitudTurnosRequest;
import com.styp.cenate.dto.SolicitudTurnosResponse;

import java.util.List;
import java.util.Optional;

public interface ISolicitudTurnosService {

    /**
     * Crear o actualizar solicitud de turnos para un periodo y una IPRESS
     */
    SolicitudTurnosResponse guardarSolicitud(SolicitudTurnosRequest request);

    /**
     * Obtener solicitud por ID
     */
    Optional<SolicitudTurnosResponse> obtenerPorId(Long idSolicitud);

    /**
     * Obtener solicitud por periodo e IPRESS
     */
    Optional<SolicitudTurnosResponse> obtenerPorPeriodoYIpress(String periodo, Long idIpress);

    /**
     * Listar todas las solicitudes de una IPRESS
     */
    List<SolicitudTurnosResponse> listarPorIpress(Long idIpress);

    /**
     * Listar todas las solicitudes de un periodo
     */
    List<SolicitudTurnosResponse> listarPorPeriodo(String periodo);

    /**
     * Listar todas las solicitudes por estado
     */
    List<SolicitudTurnosResponse> listarPorEstado(String estado);

    /**
     * Enviar solicitud (cambiar de BORRADOR a ENVIADO)
     */
    SolicitudTurnosResponse enviarSolicitud(Long idSolicitud);

    /**
     * Aprobar solicitud (solo coordinador)
     */
    SolicitudTurnosResponse aprobarSolicitud(Long idSolicitud);

    /**
     * Rechazar solicitud (solo coordinador)
     */
    SolicitudTurnosResponse rechazarSolicitud(Long idSolicitud, String motivo);

    /**
     * Eliminar solicitud (solo si está en BORRADOR)
     */
    void eliminarSolicitud(Long idSolicitud);

    /**
     * Verificar si existe solicitud para periodo e IPRESS
     */
    boolean existeSolicitud(String periodo, Long idIpress);
}
