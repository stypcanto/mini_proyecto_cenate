// ============================================================================
// 🔍 DashboardMedicoCardRepository.java – Repositorio JPA (CMS Dashboard Médico – CENATE 2025)
// ----------------------------------------------------------------------------
// Repositorio para gestionar las cards del Dashboard Médico.
// ============================================================================

package com.styp.cenate.repository;

import com.styp.cenate.model.DashboardMedicoCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DashboardMedicoCardRepository extends JpaRepository<DashboardMedicoCard, Integer> {
    
    /**
     * Obtiene todas las cards activas ordenadas por orden ascendente
     * @return Lista de cards activas
     */
    List<DashboardMedicoCard> findByActivoTrueOrderByOrdenAsc();
    
    /**
     * Obtiene todas las cards ordenadas por orden ascendente
     * @return Lista de todas las cards
     */
    List<DashboardMedicoCard> findAllByOrderByOrdenAsc();
}

