package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagNecesidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para FormDiagNecesidad
 */
@Repository
public interface FormDiagNecesidadRepository extends JpaRepository<FormDiagNecesidad, Integer> {

    List<FormDiagNecesidad> findByIdFormulario(Integer idFormulario);

    void deleteByIdFormulario(Integer idFormulario);
}
