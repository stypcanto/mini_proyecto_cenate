package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.filtros.MacroregionOptionDTO;
import com.styp.cenate.model.Macroregion;

/**
 * 🌍 Repositorio para la entidad Macroregion
 */
@Repository
public interface MacroregionRepository extends JpaRepository<Macroregion, Long> {
	// Los métodos básicos findAll(), findById(), etc. son heredados de
	// JpaRepository

	@Query("""
			    SELECT new com.styp.cenate.dto.filtros.MacroregionOptionDTO(
			        m.idMacro,
			        m.descMacro
			    )
			    FROM Macroregion m
			    WHERE (m.statMacro IS NULL OR UPPER(m.statMacro) = 'A')
			    ORDER BY m.descMacro
			""")
	List<MacroregionOptionDTO> listarOpciones();

}
