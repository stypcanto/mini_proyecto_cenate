package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.Procedimiento;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProcedimientoRepository extends JpaRepository<Procedimiento, Long> {

    /**
     * 🔹 Busca procedimientos por estado (ej: "A" para activos)
     */
    List<Procedimiento> findByStatProcedIgnoreCase(String statProced);

    /**
     * 🔹 Busca por código único (campo: codProced)
     */
    Optional<Procedimiento> findByCodProcedIgnoreCase(String codProced);

    /**
     * 🔹 Verifica existencia por descripción (campo: descProced)
     */
    boolean existsByDescProcedIgnoreCase(String descProced);

    /**
     * 🔍 Búsqueda paginada por código (búsqueda parcial, case-insensitive)
     */
    Page<Procedimiento> findByCodProcedContainingIgnoreCase(String codProced, Pageable pageable);
    
    /**
     * 🔍 Búsqueda paginada por código (búsqueda exacta, case-insensitive)
     */
    Page<Procedimiento> findByCodProcedIgnoreCase(String codProced, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada por descripción (búsqueda parcial, case-insensitive)
     */
    Page<Procedimiento> findByDescProcedContainingIgnoreCase(String descProced, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada combinada: código Y descripción
     * Código: búsqueda exacta (case-insensitive)
     * Descripción: búsqueda parcial (case-insensitive)
     */
    @Query("SELECT p FROM Procedimiento p WHERE " +
           "(:codProced IS NULL OR LOWER(p.codProced) = LOWER(:codProced)) AND " +
           "(:descProced IS NULL OR LOWER(p.descProced) LIKE LOWER(CONCAT('%', :descProced, '%')))")
    Page<Procedimiento> buscarPorCodigoYDescripcion(
            @Param("codProced") String codProced,
            @Param("descProced") String descProced,
            Pageable pageable
    );
}