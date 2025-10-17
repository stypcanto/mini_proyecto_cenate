package com.styp.cenate.repository.mbac;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.ContextoModulo;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la gestión de contextos de módulos.
 * 
 * @author CENATE Development Team
 * @version 1.0
 */
@Repository
public interface ContextoModuloRepository extends JpaRepository<ContextoModulo, Integer> {

    /**
     * Busca todos los contextos activos de un módulo.
     */
    @Query("SELECT c FROM ContextoModulo c WHERE c.modulo.idModulo = :idModulo AND c.activo = true")
    List<ContextoModulo> findByModuloIdAndActivoTrue(@Param("idModulo") Integer idModulo);

    /**
     * Busca un contexto por módulo y entidad principal.
     */
    @Query("SELECT c FROM ContextoModulo c WHERE c.modulo.idModulo = :idModulo AND c.entidadPrincipal = :entidad")
    Optional<ContextoModulo> findByModuloIdAndEntidadPrincipal(@Param("idModulo") Integer idModulo, 
                                                                @Param("entidad") String entidad);

    /**
     * Busca todos los contextos activos.
     */
    List<ContextoModulo> findByActivoTrue();

    /**
     * Verifica si existe un contexto para una entidad en un módulo.
     */
    boolean existsByModuloIdModuloAndEntidadPrincipal(Integer idModulo, String entidadPrincipal);
}
