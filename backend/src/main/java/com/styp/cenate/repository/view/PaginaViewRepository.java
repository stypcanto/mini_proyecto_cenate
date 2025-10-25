package com.styp.cenate.repository.view;

import com.styp.cenate.model.view.PaginaView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * 🧩 Repositorio para la vista dim_pagina.
 * Permite obtener páginas por módulo real.
 */
@Repository
public interface PaginaViewRepository extends JpaRepository<PaginaView, Long> {

    /**
     * Obtiene todas las páginas que pertenecen a un módulo.
     */
    List<PaginaView> findByIdModulo(Long idModulo);
}