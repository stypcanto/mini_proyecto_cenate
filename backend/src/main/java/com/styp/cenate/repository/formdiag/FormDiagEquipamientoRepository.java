package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagEquipamiento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositorio para FormDiagEquipamiento
 */
@Repository
public interface FormDiagEquipamientoRepository extends JpaRepository<FormDiagEquipamiento, Integer> {

    List<FormDiagEquipamiento> findByIdFormulario(Integer idFormulario);

    void deleteByIdFormulario(Integer idFormulario);
}
