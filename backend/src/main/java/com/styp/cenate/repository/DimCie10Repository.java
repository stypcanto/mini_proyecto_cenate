package com.styp.cenate.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.DimCie10;

/**
 * Repositorio para acceso a códigos CIE-10
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-03
 */
@Repository
public interface DimCie10Repository extends JpaRepository<DimCie10, Long> {

    /**
     * Buscar código CIE-10 por su código
     */
    Optional<DimCie10> findByCodigo(String codigo);

    /**
     * Buscar descripción de un código CIE-10
     */
    @Query("SELECT d.descripcion FROM DimCie10 d WHERE d.codigo = :codigo AND d.activo = true")
    Optional<String> findDescripcionByCodigo(@Param("codigo") String codigo);

    /**
     * 🔍 Búsqueda paginada por código (búsqueda exacta, case-insensitive)
     */
    Page<DimCie10> findByCodigoIgnoreCase(String codigo, Pageable pageable);
    
    /**
     * 🔍 Búsqueda paginada por código (búsqueda parcial, case-insensitive)
     */
    Page<DimCie10> findByCodigoContainingIgnoreCase(String codigo, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada por descripción (búsqueda parcial, case-insensitive)
     */
    Page<DimCie10> findByDescripcionContainingIgnoreCase(String descripcion, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada combinada: código Y descripción
     * Código: búsqueda exacta (case-insensitive)
     * Descripción: búsqueda parcial (case-insensitive)
     */
    @Query("SELECT d FROM DimCie10 d WHERE " +
           "(:codigo IS NULL OR LOWER(d.codigo) = LOWER(:codigo)) AND " +
           "(:descripcion IS NULL OR LOWER(d.descripcion) LIKE LOWER(CONCAT('%', :descripcion, '%')))")
    Page<DimCie10> buscarPorCodigoYDescripcion(
            @Param("codigo") String codigo,
            @Param("descripcion") String descripcion,
            Pageable pageable
    );
}
