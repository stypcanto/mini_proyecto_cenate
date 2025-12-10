package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagServicio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para FormDiagServicio
 */
@Repository
public interface FormDiagServicioRepository extends JpaRepository<FormDiagServicio, Integer> {

    List<FormDiagServicio> findByIdFormulario(Integer idFormulario);

    void deleteByIdFormulario(Integer idFormulario);
}
