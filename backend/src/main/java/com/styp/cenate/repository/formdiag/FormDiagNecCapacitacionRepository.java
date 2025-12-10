package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagNecCapacitacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para FormDiagNecCapacitacion
 */
@Repository
public interface FormDiagNecCapacitacionRepository extends JpaRepository<FormDiagNecCapacitacion, Integer> {

    List<FormDiagNecCapacitacion> findByIdFormulario(Integer idFormulario);

    void deleteByIdFormulario(Integer idFormulario);
}
