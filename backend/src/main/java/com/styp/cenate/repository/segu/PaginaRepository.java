package com.styp.cenate.repository.segu;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.styp.cenate.model.PaginaModulo;

@Repository
public interface PaginaRepository extends JpaRepository<PaginaModulo, Integer> {
    List<PaginaModulo> findByActivoTrueOrderByOrdenAsc();
    List<PaginaModulo> findByModulo_IdModuloOrderByOrdenAsc(Integer idModulo);

    /**
     * Carga todas las páginas PADRE con sus subpáginas (EAGER loading)
     * Solo trae páginas que NO tienen padre (id_pagina_padre IS NULL)
     */
    @Query("SELECT p FROM PaginaModulo p LEFT JOIN FETCH p.subpaginas WHERE p.activo = true AND p.paginaPadre IS NULL ORDER BY p.orden ASC")
    List<PaginaModulo> findAllWithSubpaginas();
}