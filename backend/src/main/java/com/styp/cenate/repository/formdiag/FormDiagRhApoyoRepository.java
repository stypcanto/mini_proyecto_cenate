package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagRhApoyo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para FormDiagRhApoyo
 */
@Repository
public interface FormDiagRhApoyoRepository extends JpaRepository<FormDiagRhApoyo, Integer> {

    List<FormDiagRhApoyo> findByIdFormulario(Integer idFormulario);

    void deleteByIdFormulario(Integer idFormulario);
}
