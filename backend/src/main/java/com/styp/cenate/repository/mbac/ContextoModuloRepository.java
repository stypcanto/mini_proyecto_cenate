// ============================================================================
// 🧩 ContextoModuloRepository.java – Repositorio MBAC (CENATE 2025)
// ----------------------------------------------------------------------------
// Gestiona los contextos funcionales asociados a cada módulo del sistema.
// Compatible con la entidad ContextoModulo y la relación ModuloSistema.
// ============================================================================

package com.styp.cenate.repository.mbac;

import com.styp.cenate.model.ContextoModulo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContextoModuloRepository extends JpaRepository<ContextoModulo, Integer> {

    // =========================================================================
    // 🔹 CONSULTAS BÁSICAS
    // =========================================================================

    /**
     * Lista los contextos activos asociados a un módulo específico.
     */
    @Query("SELECT c FROM ContextoModulo c WHERE c.modulo.idModulo = :idModulo AND c.activo = true")
    List<ContextoModulo> findByModuloIdAndActivoTrue(@Param("idModulo") Integer idModulo);

    /**
     * Busca un contexto específico por módulo y entidad principal.
     */
    @Query("SELECT c FROM ContextoModulo c WHERE c.modulo.idModulo = :idModulo AND c.entidadPrincipal = :entidad")
    Optional<ContextoModulo> findByModuloIdAndEntidadPrincipal(@Param("idModulo") Integer idModulo,
                                                               @Param("entidad") String entidad);

    /**
     * Lista todos los contextos activos del sistema.
     */
    List<ContextoModulo> findByActivoTrue();

    /**
     * Verifica si existe un contexto asociado a una entidad dentro de un módulo.
     * Usa la relación 'modulo' (no el campo idModulo directo).
     */
    boolean existsByModulo_IdModuloAndEntidadPrincipal(Integer idModulo, String entidadPrincipal);
}