package com.styp.cenate.repository;

import com.styp.cenate.model.TipoBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * 📋 Repository para Tipos de Bolsas
 */
@Repository
public interface TipoBolsaRepository extends JpaRepository<TipoBolsa, Long> {

    /**
     * Busca tipo de bolsa por código
     */
    Optional<TipoBolsa> findByCodTipoBolsa(String codTipoBolsa);

    /**
     * Obtiene todos los tipos de bolsas activos
     */
    @Query("SELECT t FROM TipoBolsa t WHERE t.statTipoBolsa = :stat ORDER BY t.descTipoBolsa ASC")
    List<TipoBolsa> findByStatTipoBolsaOrderByDescTipoBolsaAsc(@Param("stat") String stat);

    /**
     * Búsqueda paginada con filtros (case-insensitive con ILIKE y type casting)
     */
    @Query("SELECT t FROM TipoBolsa t WHERE " +
           "(:busqueda IS NULL OR CAST(t.codTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%') " +
           "OR CAST(t.descTipoBolsa AS text) ILIKE CONCAT('%', CAST(:busqueda AS text), '%')) AND " +
           "(:estado IS NULL OR t.statTipoBolsa = :estado) " +
           "ORDER BY t.descTipoBolsa ASC")
    Page<TipoBolsa> buscarTiposBolsas(
        @Param("busqueda") String busqueda,
        @Param("estado") String estado,
        Pageable pageable
    );

    /**
     * Verifica si existe tipo de bolsa con código similar (case-insensitive)
     */
    Optional<TipoBolsa> findByCodTipoBolsaIgnoreCase(String codTipoBolsa);

    /**
     * Obtiene cantidad de tipos de bolsas por estado
     */
    Long countByStatTipoBolsa(String stat);
}
