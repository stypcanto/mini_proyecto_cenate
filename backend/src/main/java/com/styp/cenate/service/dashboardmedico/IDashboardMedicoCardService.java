// ============================================================================
// 🧩 IDashboardMedicoCardService.java – Interfaz de Servicio (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// Interfaz para la gestión de cards del Dashboard Médico.
// ============================================================================

package com.styp.cenate.service.dashboardmedico;

import com.styp.cenate.dto.DashboardMedicoCardRequest;
import com.styp.cenate.dto.DashboardMedicoCardResponse;

import java.util.List;

/**
 * Interfaz de servicio para la gestión de cards del Dashboard Médico
 */
public interface IDashboardMedicoCardService {

    /**
     * Obtiene todas las cards
     * @return Lista de todas las cards
     */
    List<DashboardMedicoCardResponse> findAll();

    /**
     * Obtiene solo las cards activas (para el dashboard público)
     * @return Lista de cards activas ordenadas
     */
    List<DashboardMedicoCardResponse> findAllActivas();

    /**
     * Obtiene una card por ID
     * @param id Identificador de la card
     * @return Card encontrada
     * @throws IllegalArgumentException si no se encuentra la card
     */
    DashboardMedicoCardResponse findById(Integer id);

    /**
     * Crea una nueva card
     * @param request Datos de la card a crear
     * @return Card creada
     */
    DashboardMedicoCardResponse create(DashboardMedicoCardRequest request);

    /**
     * Actualiza una card existente
     * @param id Identificador de la card
     * @param request Datos actualizados de la card
     * @return Card actualizada
     * @throws IllegalArgumentException si no se encuentra la card
     */
    DashboardMedicoCardResponse update(Integer id, DashboardMedicoCardRequest request);

    /**
     * Elimina una card
     * @param id Identificador de la card
     * @throws IllegalArgumentException si no se encuentra la card
     */
    void delete(Integer id);

    /**
     * Actualiza el orden de las cards
     * @param ids Lista de IDs en el nuevo orden
     */
    void updateOrden(List<Integer> ids);

    /**
     * Activa o desactiva una card
     * @param id Identificador de la card
     * @return Card actualizada
     * @throws IllegalArgumentException si no se encuentra la card
     */
    DashboardMedicoCardResponse toggleActivo(Integer id);
}

