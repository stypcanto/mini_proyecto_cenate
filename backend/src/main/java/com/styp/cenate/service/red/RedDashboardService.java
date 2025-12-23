package com.styp.cenate.service.red;

import com.styp.cenate.dto.PersonalExternoResponse;
import com.styp.cenate.dto.formdiag.FormDiagListResponse;
import com.styp.cenate.dto.red.RedDashboardResponse;

import java.util.List;

/**
 * Servicio para el modulo de Red (Coordinadores de Red)
 */
public interface RedDashboardService {

    /**
     * Obtiene el dashboard con info de la red y estadisticas
     * del usuario autenticado
     */
    RedDashboardResponse obtenerDashboard();

    /**
     * Lista el personal externo de la red del usuario autenticado
     */
    List<PersonalExternoResponse> obtenerPersonalExterno();

    /**
     * Lista los formularios de diagnostico de la red del usuario autenticado
     */
    List<FormDiagListResponse> obtenerFormularios();
}
