package com.styp.cenate.service.formdiag;

import com.styp.cenate.dto.formdiag.FormDiagEstadisticasDTO;

/**
 * Servicio para generar reportes Excel de formularios de diagnóstico
 */
public interface FormDiagExcelService {

    /**
     * Generar Excel con estadísticas detalladas del formulario
     */
    byte[] generarReporteExcel(Integer idFormulario);

    /**
     * Generar Excel a partir de estadísticas precargadas
     */
    byte[] generarReporteExcelDesdeEstadisticas(FormDiagEstadisticasDTO estadisticas);
}
