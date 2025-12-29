package com.styp.cenate.service.dashboard;

import com.styp.cenate.dto.dashboard.EstadisticasPersonalDTO;

/**
 * Servicio para estadísticas de personal en el dashboard
 */
public interface DashboardPersonalService {

    /**
     * Obtiene estadísticas de personal interno vs externo
     * @return Estadísticas completas con desglose por red
     */
    EstadisticasPersonalDTO obtenerEstadisticasPersonal();
}
