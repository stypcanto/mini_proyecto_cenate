package com.styp.cenate.repository;

import com.styp.cenate.model.EstrategiaInstitucional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad EstrategiaInstitucional
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface EstrategiaInstitucionalRepository extends JpaRepository<EstrategiaInstitucional, Long> {

    /**
     * Busca todas las estrategias por estado
     *
     * @param estado Estado de las estrategias ('A' o 'I')
     * @return Lista de estrategias con el estado especificado
     */
    @Query("SELECT e FROM EstrategiaInstitucional e WHERE e.estado = :estado ORDER BY e.descEstrategia ASC")
    List<EstrategiaInstitucional> findByEstadoOrderByDescEstrategiaAsc(@Param("estado") String estado);

    /**
     * Busca todas las estrategias activas
     *
     * @return Lista de estrategias activas ordenadas alfabéticamente
     */
    @Query("SELECT e FROM EstrategiaInstitucional e WHERE e.estado = 'A' ORDER BY e.descEstrategia ASC")
    List<EstrategiaInstitucional> findAllActivas();

    /**
     * Busca estrategia por código
     *
     * @param codEstrategia Código de la estrategia
     * @return Optional con la estrategia encontrada
     */
    Optional<EstrategiaInstitucional> findByCodEstrategia(String codEstrategia);

    /**
     * Busca estrategia por sigla
     *
     * @param sigla Sigla de la estrategia
     * @return Optional con la estrategia encontrada
     */
    Optional<EstrategiaInstitucional> findBySigla(String sigla);

    /**
     * Verifica si existe una estrategia con el código especificado
     *
     * @param codEstrategia Código a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByCodEstrategia(String codEstrategia);

    /**
     * Verifica si existe una estrategia con la sigla especificada
     *
     * @param sigla Sigla a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsBySigla(String sigla);

    /**
     * Verifica si existe otra estrategia con el mismo código (excluyendo un ID específico)
     * Útil para validar al actualizar
     *
     * @param codEstrategia Código a verificar
     * @param idEstrategia ID de la estrategia a excluir
     * @return true si existe otra estrategia con ese código
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EstrategiaInstitucional e " +
           "WHERE e.codEstrategia = :codEstrategia AND e.idEstrategia <> :idEstrategia")
    boolean existsByCodEstrategiaAndIdNot(@Param("codEstrategia") String codEstrategia,
                                           @Param("idEstrategia") Long idEstrategia);

    /**
     * Verifica si existe otra estrategia con la misma sigla (excluyendo un ID específico)
     * Útil para validar al actualizar
     *
     * @param sigla Sigla a verificar
     * @param idEstrategia ID de la estrategia a excluir
     * @return true si existe otra estrategia con esa sigla
     */
    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END FROM EstrategiaInstitucional e " +
           "WHERE e.sigla = :sigla AND e.idEstrategia <> :idEstrategia")
    boolean existsBySiglaAndIdNot(@Param("sigla") String sigla,
                                   @Param("idEstrategia") Long idEstrategia);
}
