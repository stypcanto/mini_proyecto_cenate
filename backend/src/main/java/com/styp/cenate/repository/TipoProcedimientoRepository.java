package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.TipoProcedimiento;

import java.util.List;
import java.util.Optional;

/**
 * Repository para gestión de Tipos de Procedimiento (CPMS).
 * Tabla: dim_tip_proced
 */
@Repository
public interface TipoProcedimientoRepository extends JpaRepository<TipoProcedimiento, Long> {

    /**
     * Filtra por estado ('A' o 'I')
     */
    List<TipoProcedimiento> findByStatTipProcedIgnoreCase(String estado);

    /**
     * Busca por código
     */
    Optional<TipoProcedimiento> findByCodTipProcedIgnoreCase(String codigo);

    /**
     * Verifica existencia por descripción
     */
    boolean existsByDescTipProcedIgnoreCase(String descripcion);
}