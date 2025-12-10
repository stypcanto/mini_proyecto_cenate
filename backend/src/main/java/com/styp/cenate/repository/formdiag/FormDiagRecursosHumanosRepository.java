package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagRecursosHumanos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositorio para FormDiagRecursosHumanos
 */
@Repository
public interface FormDiagRecursosHumanosRepository extends JpaRepository<FormDiagRecursosHumanos, Integer> {

    Optional<FormDiagRecursosHumanos> findByIdFormulario(Integer idFormulario);
}
