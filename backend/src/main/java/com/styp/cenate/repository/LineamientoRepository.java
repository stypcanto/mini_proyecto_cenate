package com.styp.cenate.repository;

import com.styp.cenate.model.Lineamiento;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository para entidad Lineamiento
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Repository
public interface LineamientoRepository extends JpaRepository<Lineamiento, Long> {

    /**
     * Buscar lineamiento por código
     */
    Optional<Lineamiento> findByCodigo(String codigo);

    /**
     * Buscar lineamientos por estado
     */
    List<Lineamiento> findByEstado(String estado);

    /**
     * Buscar lineamientos por categoría
     */
    List<Lineamiento> findByCategoria(String categoria);

    /**
     * Buscar lineamientos activos
     */
    @Query("SELECT l FROM Lineamiento l WHERE l.estado = 'ACTIVO'")
    List<Lineamiento> findActivos();

    /**
     * Paginado: Buscar lineamientos por título
     */
    Page<Lineamiento> findByTituloContainingIgnoreCase(String titulo, Pageable pageable);

    /**
     * Paginado: Buscar lineamientos por categoría
     */
    Page<Lineamiento> findByCategoria(String categoria, Pageable pageable);

    /**
     * Paginado: Buscar todos los lineamientos ordenados
     */
    @Query("SELECT l FROM Lineamiento l ORDER BY l.createdAt DESC")
    Page<Lineamiento> findAllOrdenado(Pageable pageable);

    /**
     * Contar lineamientos por estado
     */
    Long countByEstado(String estado);
}
