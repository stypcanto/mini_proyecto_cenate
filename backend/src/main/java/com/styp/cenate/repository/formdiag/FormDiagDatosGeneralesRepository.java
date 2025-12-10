package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagDatosGenerales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para FormDiagDatosGenerales
 */
@Repository
public interface FormDiagDatosGeneralesRepository extends JpaRepository<FormDiagDatosGenerales, Integer> {

    Optional<FormDiagDatosGenerales> findByIdFormulario(Integer idFormulario);
}
