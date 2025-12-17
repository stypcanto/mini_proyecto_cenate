package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagCatNecesidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para el catálogo de necesidades
 */
@Repository
public interface FormDiagCatNecesidadRepository extends JpaRepository<FormDiagCatNecesidad, Integer> {

    List<FormDiagCatNecesidad> findByCategoria(String categoria);

    List<FormDiagCatNecesidad> findAllByOrderByIdNecesidadAsc();
}
