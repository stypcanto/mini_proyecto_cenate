package com.styp.cenate.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.styp.cenate.dto.filtros.RedOptionDTO;
import com.styp.cenate.model.Red;

@Repository
public interface RedRepository extends JpaRepository<Red, Long> {

    /**
     * 🔹 Busca todas las redes que pertenecen a una macroregión específica.
     */
    List<Red> findByMacroregion_IdMacro(Long idMacro);

    /**
     * 🔹 Verifica si ya existe una red con la misma descripción (ignora mayúsculas/minúsculas).
     */
    boolean existsByDescripcionIgnoreCase(String descripcion);
    
    @Query("""
            SELECT new com.styp.cenate.dto.filtros.RedOptionDTO(
                r.id,
                r.codigo,
                r.descripcion,
                r.macroregion.idMacro
            )
            FROM Red r
            WHERE r.macroregion.idMacro = :macroId
            ORDER BY r.descripcion
        """)
        List<RedOptionDTO> listarPorMacro(@Param("macroId") Long macroId);
    
}