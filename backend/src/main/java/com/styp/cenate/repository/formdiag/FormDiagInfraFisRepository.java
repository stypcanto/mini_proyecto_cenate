package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagInfraFis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para FormDiagInfraFis
 */
@Repository
public interface FormDiagInfraFisRepository extends JpaRepository<FormDiagInfraFis, Integer> {

    Optional<FormDiagInfraFis> findByIdFormulario(Integer idFormulario);
}
