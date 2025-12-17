package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagCatPrioridad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para el catálogo de prioridades
 */
@Repository
public interface FormDiagCatPrioridadRepository extends JpaRepository<FormDiagCatPrioridad, Integer> {

    Optional<FormDiagCatPrioridad> findByCodigo(String codigo);

    List<FormDiagCatPrioridad> findAllByOrderByIdPrioridadAsc();
}
