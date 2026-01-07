package com.styp.cenate.repository;

import com.styp.cenate.model.InformacionIpress;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository para entidad InformacionIpress
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Repository
public interface InformacionIpressRepository extends JpaRepository<InformacionIpress, Long> {

    /**
     * Buscar informaciones por lineamiento
     */
    List<InformacionIpress> findByLineamiento_IdLineamiento(Long idLineamiento);

    /**
     * Buscar informaciones por IPRESS
     */
    List<InformacionIpress> findByIpress_IdIpress(Long idIpress);

    /**
     * Paginado: Buscar por lineamiento
     */
    Page<InformacionIpress> findByLineamiento_IdLineamiento(Long idLineamiento, Pageable pageable);

    /**
     * Paginado: Buscar por IPRESS
     */
    Page<InformacionIpress> findByIpress_IdIpress(Long idIpress, Pageable pageable);

    /**
     * Buscar por lineamiento e IPRESS
     */
    List<InformacionIpress> findByLineamiento_IdLineamientoAndIpress_IdIpress(Long idLineamiento, Long idIpress);

    /**
     * Buscar por estado de cumplimiento
     */
    List<InformacionIpress> findByEstadoCumplimiento(String estadoCumplimiento);

    /**
     * Paginado: Buscar todas ordenadas por fecha
     */
    @Query("SELECT ii FROM InformacionIpress ii ORDER BY ii.createdAt DESC")
    Page<InformacionIpress> findAllOrdenado(Pageable pageable);

    /**
     * Contar informaciones que cumplen
     */
    @Query("SELECT COUNT(ii) FROM InformacionIpress ii WHERE ii.estadoCumplimiento = 'CUMPLE'")
    Long countCumple();

    /**
     * Contar informaciones por IPRESS que cumplen
     */
    @Query("SELECT COUNT(ii) FROM InformacionIpress ii WHERE ii.ipress.idIpress = :idIpress AND ii.estadoCumplimiento = 'CUMPLE'")
    Long countCumpleByIpress(@Param("idIpress") Long idIpress);
}
