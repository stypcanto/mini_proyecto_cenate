package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagInfraTec;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para FormDiagInfraTec
 */
@Repository
public interface FormDiagInfraTecRepository extends JpaRepository<FormDiagInfraTec, Integer> {

    Optional<FormDiagInfraTec> findByIdFormulario(Integer idFormulario);
}
