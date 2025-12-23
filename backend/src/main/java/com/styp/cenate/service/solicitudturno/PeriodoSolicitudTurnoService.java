package com.styp.cenate.service.solicitudturno;

import com.styp.cenate.dto.PeriodoSolicitudTurnoRequest;
import com.styp.cenate.dto.PeriodoSolicitudTurnoResponse;

import java.util.List;

/**
 * Servicio para gestionar periodos de solicitud de turnos.
 */
public interface PeriodoSolicitudTurnoService {

    /**
     * Lista todos los periodos
     */
    List<PeriodoSolicitudTurnoResponse> listarTodos();

    /**
     * Lista periodos activos
     */
    List<PeriodoSolicitudTurnoResponse> listarActivos();

    /**
     * Lista periodos vigentes (activos y dentro del rango de fechas)
     */
    List<PeriodoSolicitudTurnoResponse> listarVigentes();

    /**
     * Obtiene un periodo por ID
     */
    PeriodoSolicitudTurnoResponse obtenerPorId(Long id);

    /**
     * Crea un nuevo periodo
     */
    PeriodoSolicitudTurnoResponse crear(PeriodoSolicitudTurnoRequest request, String createdBy);

    /**
     * Actualiza un periodo existente
     */
    PeriodoSolicitudTurnoResponse actualizar(Long id, PeriodoSolicitudTurnoRequest request);

    /**
     * Cambia el estado de un periodo (BORRADOR, ACTIVO, CERRADO)
     */
    PeriodoSolicitudTurnoResponse cambiarEstado(Long id, String nuevoEstado);

    /**
     * Elimina un periodo (solo si esta en BORRADOR)
     */
    void eliminar(Long id);

    /**
     * Obtiene estadisticas de un periodo
     */
    PeriodoSolicitudTurnoResponse obtenerConEstadisticas(Long id);
}
