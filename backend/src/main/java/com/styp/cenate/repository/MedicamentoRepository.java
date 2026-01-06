package com.styp.cenate.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.styp.cenate.model.Medicamento;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicamentoRepository extends JpaRepository<Medicamento, Long> {

    /**
     * 🔹 Busca medicamentos por estado (ej: "A" para activos)
     */
    List<Medicamento> findByStatMedicamentoIgnoreCase(String statMedicamento);

    /**
     * 🔹 Busca por código único (campo: codMedicamento)
     */
    Optional<Medicamento> findByCodMedicamentoIgnoreCase(String codMedicamento);

    /**
     * 🔹 Verifica existencia por descripción (campo: descMedicamento)
     */
    boolean existsByDescMedicamentoIgnoreCase(String descMedicamento);

    /**
     * 🔍 Búsqueda paginada por código (búsqueda parcial, case-insensitive)
     */
    Page<Medicamento> findByCodMedicamentoContainingIgnoreCase(String codMedicamento, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada por código (búsqueda exacta, case-insensitive)
     */
    Page<Medicamento> findByCodMedicamentoIgnoreCase(String codMedicamento, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada por descripción (búsqueda parcial, case-insensitive)
     */
    Page<Medicamento> findByDescMedicamentoContainingIgnoreCase(String descMedicamento, Pageable pageable);

    /**
     * 🔍 Búsqueda paginada combinada: código Y descripción
     * Código: búsqueda exacta (case-insensitive)
     * Descripción: búsqueda parcial (case-insensitive)
     */
    @Query("SELECT m FROM Medicamento m WHERE " +
           "(:codMedicamento IS NULL OR LOWER(m.codMedicamento) = LOWER(:codMedicamento)) AND " +
           "(:descMedicamento IS NULL OR LOWER(m.descMedicamento) LIKE LOWER(CONCAT('%', :descMedicamento, '%')))")
    Page<Medicamento> buscarPorCodigoYDescripcion(
            @Param("codMedicamento") String codMedicamento,
            @Param("descMedicamento") String descMedicamento,
            Pageable pageable
    );
}
