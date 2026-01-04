package com.styp.cenate.repository;

import com.styp.cenate.model.DimCie10;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

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
}
