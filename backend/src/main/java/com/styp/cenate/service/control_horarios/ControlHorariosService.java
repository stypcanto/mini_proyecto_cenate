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
     * Incluye la solicitud (id_ctr_horario) del médico autenticado si existe
     */
    List<PeriodoDisponibleDTO> obtenerPeriodosDisponibles(List<String> estados, String token);

    /**
     * Crear nueva solicitud de horario
     */
    CtrHorarioDTO crearSolicitud(CreateCtrHorarioRequest request);

    /**
     * Obtener el ID de solicitud (id_ctr_horario) del médico autenticado para un período
     * Cruza ctr_horario con ctr_periodo filtrando por usuario autenticado
     */
    Long obtenerSolicitudDelMedico(String periodo, Long idArea);

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
