package com.styp.cenate.repository;

import com.styp.cenate.model.TipoAtencionTelemedicina;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad TipoAtencionTelemedicina
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface TipoAtencionTelemedicinaRepository extends JpaRepository<TipoAtencionTelemedicina, Long> {

    /**
     * Busca todos los tipos de atención por estado
     *
     * @param estado Estado de los tipos de atención ('A' o 'I')
     * @return Lista de tipos de atención con el estado especificado
     */
    @Query("SELECT t FROM TipoAtencionTelemedicina t WHERE t.estado = :estado ORDER BY t.descTipoAtencion ASC")
    List<TipoAtencionTelemedicina> findAllByEstadoOrdered(@Param("estado") String estado);

    /**
     * Busca todos los tipos de atención activos
     *
     * @return Lista de tipos de atención activos ordenados alfabéticamente
     */
    @Query("SELECT t FROM TipoAtencionTelemedicina t WHERE t.estado = 'A' ORDER BY t.descTipoAtencion ASC")
    List<TipoAtencionTelemedicina> findAllActivos();

    /**
     * Busca tipos de atención activos que requieran profesional
     *
     * @return Lista de tipos de atención que requieren profesional
     */
    @Query("SELECT t FROM TipoAtencionTelemedicina t WHERE t.estado = 'A' AND t.requiereProfesional = true ORDER BY t.descTipoAtencion ASC")
    List<TipoAtencionTelemedicina> findAllActivosConProfesional();

    /**
     * Busca tipo de atención por código
     *
     * @param codTipoAtencion Código del tipo de atención
     * @return Optional con el tipo de atención encontrado
     */
    Optional<TipoAtencionTelemedicina> findByCodTipoAtencion(String codTipoAtencion);

    /**
     * Busca tipo de atención por sigla
     *
     * @param sigla Sigla del tipo de atención
     * @return Optional con el tipo de atención encontrado
     */
    Optional<TipoAtencionTelemedicina> findBySigla(String sigla);

    /**
     * Verifica si existe un tipo de atención con el código especificado
     *
     * @param codTipoAtencion Código a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByCodTipoAtencion(String codTipoAtencion);

    /**
     * Verifica si existe un tipo de atención con la sigla especificada
     *
     * @param sigla Sigla a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsBySigla(String sigla);

    /**
     * Verifica si existe otro tipo de atención con el mismo código (excluyendo un ID específico)
     * Útil para validar al actualizar
     *
     * @param codTipoAtencion Código a verificar
     * @param idTipoAtencion ID del tipo de atención a excluir
     * @return true si existe otro tipo de atención con ese código
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TipoAtencionTelemedicina t " +
           "WHERE t.codTipoAtencion = :codTipoAtencion AND t.idTipoAtencion <> :idTipoAtencion")
    boolean existsByCodTipoAtencionAndIdNot(@Param("codTipoAtencion") String codTipoAtencion,
                                             @Param("idTipoAtencion") Long idTipoAtencion);

    /**
     * Verifica si existe otro tipo de atención con la misma sigla (excluyendo un ID específico)
     * Útil para validar al actualizar
     *
     * @param sigla Sigla a verificar
     * @param idTipoAtencion ID del tipo de atención a excluir
     * @return true si existe otro tipo de atención con esa sigla
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END FROM TipoAtencionTelemedicina t " +
           "WHERE t.sigla = :sigla AND t.idTipoAtencion <> :idTipoAtencion")
    boolean existsBySiglaAndIdNot(@Param("sigla") String sigla,
                                   @Param("idTipoAtencion") Long idTipoAtencion);
}
