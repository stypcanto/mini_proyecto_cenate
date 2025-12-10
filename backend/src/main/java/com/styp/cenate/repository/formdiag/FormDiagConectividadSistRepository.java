package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagConectividadSist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para FormDiagConectividadSist
 */
@Repository
public interface FormDiagConectividadSistRepository extends JpaRepository<FormDiagConectividadSist, Integer> {

    Optional<FormDiagConectividadSist> findByIdFormulario(Integer idFormulario);
}
