package com.styp.cenate.repository;

import com.styp.cenate.model.AseguradoEnfermedadCronica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

/**
 * ✅ v1.47.0: Repository para enfermedades crónicas del asegurado
 */
@Repository
public interface AseguradoEnfermedadCronicaRepository extends JpaRepository<AseguradoEnfermedadCronica, Long> {

    /**
     * Obtener todas las enfermedades crónicas de un asegurado
     */
    List<AseguradoEnfermedadCronica> findByPkAseguradoAndActivoTrue(String pkAsegurado);

    /**
     * Buscar enfermedad específica
     */
    Optional<AseguradoEnfermedadCronica> findByPkAseguradoAndTipoEnfermedad(String pkAsegurado, String tipo);

    /**
     * Verificar si asegurado tiene alguna enfermedad crónica
     */
    boolean existsByPkAseguradoAndActivoTrue(String pkAsegurado);

    /**
     * Eliminar todas las enfermedades de un asegurado
     */
    void deleteByPkAsegurado(String pkAsegurado);
}
