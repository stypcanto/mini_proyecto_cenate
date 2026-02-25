package com.styp.cenate.service.control_horarios;

import com.styp.cenate.dto.control_horarios.CtrHorarioDTO;
import com.styp.cenate.dto.control_horarios.CreateCtrHorarioRequest;
import com.styp.cenate.dto.control_horarios.PeriodoDisponibleDTO;
import java.util.List;

/**
 * Interfaz de servicio para control de horarios
 * v1.79.0
 */
public interface ControlHorariosService {

    /**
     * Obtener períodos disponibles (ABIERTO, REABIERTO, CERRADO)
     */
    List<PeriodoDisponibleDTO> obtenerPeriodosDisponibles(List<String> estados);

    /**
     * Obtener horarios registrados para un período
     */
    List<CtrHorarioDTO> obtenerHorariosPorPeriodo(String periodo);

    /**
     * Crear nueva solicitud de horario
     */
    CtrHorarioDTO crearSolicitud(CreateCtrHorarioRequest request);

    /**
     * Actualizar solicitud de horario
     */
    CtrHorarioDTO actualizarSolicitud(Long idCtrHorario, CreateCtrHorarioRequest request);

    /**
     * Obtener detalle de hopario
     */
    CtrHorarioDTO obtenerDetalle(Long idCtrHorario);

    /**
     * Eliminar solicitud
     */
    void eliminarSolicitud(Long idCtrHorario);
}
