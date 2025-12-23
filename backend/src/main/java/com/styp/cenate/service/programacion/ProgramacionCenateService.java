package com.styp.cenate.service.programacion;

import com.styp.cenate.dto.ProgramacionCenateResumenDTO;

import java.util.List;

/**
 * Servicio para el modulo de Programacion CENATE.
 * Proporciona datos consolidados de las solicitudes de turnos.
 */
public interface ProgramacionCenateService {

    /**
     * Obtiene un resumen general de todos los periodos
     */
    List<ProgramacionCenateResumenDTO> obtenerResumenGeneral();

    /**
     * Obtiene el resumen consolidado de un periodo especifico
     */
    ProgramacionCenateResumenDTO obtenerResumenPorPeriodo(Long idPeriodo);

    /**
     * Exporta los datos de un periodo a formato CSV
     */
    String exportarCsv(Long idPeriodo);
}
