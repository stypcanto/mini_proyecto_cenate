package com.styp.cenate.service.coordinador;

import com.styp.cenate.dto.coordinador.EstadisticaMedicoDTO;
import com.styp.cenate.dto.coordinador.EvolucionTemporalDTO;
import com.styp.cenate.dto.coordinador.KpisAreaDTO;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Interfaz de servicio para coordinador médico
 * Define operaciones de supervisión y gestión de médicos
 *
 * @version v1.63.0
 * @since 2026-02-08
 */
public interface ICoordinadorMedicoService {

    /**
     * Obtiene el área de trabajo del coordinador actual
     * @return área de trabajo (ej: TELEURGENCIAS_TELETRIAJE)
     * @throws RuntimeException si el usuario no es coordinador o no tiene área asignada
     */
    String obtenerAreaDelCoordinadorActual();

    /**
     * Obtiene estadísticas de todos los médicos del área del coordinador actual
     * @param fechaDesde fecha inicio del rango (null = sin filtro)
     * @param fechaHasta fecha fin del rango (null = sin filtro)
     * @return lista de estadísticas por médico
     */
    List<EstadisticaMedicoDTO> obtenerEstadisticasMedicos(
        OffsetDateTime fechaDesde,
        OffsetDateTime fechaHasta
    );

    /**
     * Obtiene KPIs consolidados del área del coordinador actual
     * @param fechaDesde fecha inicio del rango (null = sin filtro)
     * @param fechaHasta fecha fin del rango (null = sin filtro)
     * @return DTO con KPIs consolidados
     */
    KpisAreaDTO obtenerKpisArea(
        OffsetDateTime fechaDesde,
        OffsetDateTime fechaHasta
    );

    /**
     * Obtiene evolución temporal de atenciones del área
     * @param fechaDesde fecha inicio del rango
     * @param fechaHasta fecha fin del rango
     * @return lista de evolución temporal por día
     */
    List<EvolucionTemporalDTO> obtenerEvolucionTemporal(
        OffsetDateTime fechaDesde,
        OffsetDateTime fechaHasta
    );

    /**
     * Reasigna un paciente a otro médico del mismo área
     * @param idSolicitud ID de la solicitud a reasignar
     * @param nuevoMedicoId ID del nuevo médico (debe ser del mismo área)
     * @throws RuntimeException si la solicitud no existe, el médico no existe o está en otra área
     */
    void reasignarPaciente(Long idSolicitud, Long nuevoMedicoId);
}
