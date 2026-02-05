package com.styp.cenate.service.bolsas;

import com.styp.cenate.model.chatbot.SolicitudCita;

/**
 * Servicio de sincronización de estados entre solicitud_cita y dim_solicitud_bolsa
 *
 * Cuando el médico marca una cita como ATENDIDO en solicitud_cita (módulo chatbot),
 * automáticamente sincroniza el estado a dim_solicitud_bolsa (módulo bolsas) como ATENDIDO_IPRESS.
 *
 * @version v1.43.0
 * @since 2026-02-05
 */
public interface SincronizacionBolsaService {

    /**
     * Sincroniza el estado ATENDIDO de solicitud_cita a dim_solicitud_bolsa
     *
     * Busca el registro del paciente en dim_solicitud_bolsa por DNI y lo actualiza a estado ATENDIDO_IPRESS (ID=2).
     * Si el paciente tiene múltiples bolsas, actualiza TODOS los registros activos.
     *
     * @param solicitudCita Entidad SolicitudCita con estado ATENDIDO (id_estado_cita = 4)
     * @return true si se sincronizó al menos un registro, false si no existe en bolsas
     * @throws SincronizacionException si hay error técnico durante la sincronización
     */
    boolean sincronizarEstadoAtendido(SolicitudCita solicitudCita);
}
