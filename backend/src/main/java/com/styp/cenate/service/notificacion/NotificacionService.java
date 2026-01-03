// ============================================================================
// 🔔 NotificacionService.java – Servicio de Notificaciones (CENATE 2025)
// ----------------------------------------------------------------------------
// Interface para gestión de notificaciones del sistema
// ============================================================================

package com.styp.cenate.service.notificacion;

import com.styp.cenate.dto.NotificacionResponse;

import java.util.List;

public interface NotificacionService {

    /**
     * Obtiene la lista de médicos que cumplen años hoy
     * @return Lista de notificaciones de cumpleaños
     */
    List<NotificacionResponse> obtenerCumpleanosHoy();

    /**
     * Cuenta cuántos médicos cumplen años hoy
     * @return Cantidad de cumpleaños
     */
    int contarCumpleanosHoy();
}
