package com.styp.cenate.repository;

import com.styp.cenate.model.Macroregion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * 🌍 Repositorio para la entidad Macroregion
 */
@Repository
public interface MacroregionRepository extends JpaRepository<Macroregion, Long> {
    // Los métodos básicos findAll(), findById(), etc. son heredados de
    // JpaRepository
}
