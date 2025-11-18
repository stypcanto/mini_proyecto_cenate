package com.styp.cenate.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.DimTipoPersonal;

@Repository
public interface DimTipoPersonalRepository extends JpaRepository<DimTipoPersonal, Long> {

    // ✅ Método original - Listar por estado
    List<DimTipoPersonal> findByStatTipPers(String estado);

    // 🆕 MÉTODOS NUEVOS AGREGADOS:

    /**
     * Busca por descripción parcial (case-insensitive)
     */
    List<DimTipoPersonal> findByDescTipPersContainingIgnoreCase(String keyword);

    /**
     * Verifica si existe un tipo con una descripción específica
     */
    boolean existsByDescTipPers(String descTipPers);

    /**
     * Verifica si existe un tipo con una descripción, excluyendo un ID específico
     */
    @Query("SELECT CASE WHEN COUNT(t) > 0 THEN true ELSE false END " +
           "FROM DimTipoPersonal t " +
           "WHERE t.descTipPers = :desc AND t.idTipPers <> :id")
    boolean existsByDescTipPersAndIdNot(@Param("desc") String descTipPers, @Param("id") Long idTipPers);

    /**
     * Busca tipos activos ordenados por descripción
     */
    @Query("SELECT t FROM DimTipoPersonal t WHERE t.statTipPers = 'A' ORDER BY t.descTipPers")
    List<DimTipoPersonal> findAllActivos();

    /**
     * Busca tipos inactivos ordenados por descripción
     */
    @Query("SELECT t FROM DimTipoPersonal t WHERE t.statTipPers = 'I' ORDER BY t.descTipPers")
    List<DimTipoPersonal> findAllInactivos();

    /**
     * Busca tipos activos por descripción parcial
     */
    @Query("SELECT t FROM DimTipoPersonal t " +
           "WHERE t.statTipPers = 'A' AND LOWER(t.descTipPers) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "ORDER BY t.descTipPers")
    List<DimTipoPersonal> searchActivosByDescripcion(@Param("keyword") String keyword);

    /**
     * Cuenta tipos por estado
     */
    long countByStatTipPers(String statTipPers);
}
