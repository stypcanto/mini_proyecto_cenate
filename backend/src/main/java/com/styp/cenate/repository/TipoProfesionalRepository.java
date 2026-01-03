package com.styp.cenate.repository;

import com.styp.cenate.model.TipoProfesional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TipoProfesionalRepository extends JpaRepository<TipoProfesional, Long> {

    /**
     * Buscar tipo profesional por descripción (nombre)
     */
    Optional<TipoProfesional> findByDescTipPersIgnoreCase(String descTipPers);

    /**
     * Listar todos los tipos profesionales activos
     * Usando @Query para evitar conflicto con palabra reservada "Desc"
     */
    @Query("SELECT t FROM TipoProfesional t WHERE t.statTipPers = :stat ORDER BY t.descTipPers ASC")
    List<TipoProfesional> findByStatTipPersOrderByDescTipPersAsc(@Param("stat") String stat);

    /**
     * Verificar si existe un tipo profesional con el mismo nombre (para evitar duplicados)
     */
    boolean existsByDescTipPersIgnoreCase(String descTipPers);
}
