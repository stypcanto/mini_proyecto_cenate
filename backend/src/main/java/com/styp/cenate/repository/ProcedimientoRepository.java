package com.styp.cenate.repository;

import org.springframework.data.jpa.repository.JpaRepository;
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
}