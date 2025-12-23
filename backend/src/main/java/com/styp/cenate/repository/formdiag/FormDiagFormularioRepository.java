package com.styp.cenate.repository.formdiag;

import com.styp.cenate.model.formdiag.FormDiagFormulario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para FormDiagFormulario
 */
@Repository
public interface FormDiagFormularioRepository extends JpaRepository<FormDiagFormulario, Integer> {

    /**
     * Buscar formularios por IPRESS
     */
    @Query("SELECT f FROM FormDiagFormulario f WHERE f.ipress.idIpress = :idIpress ORDER BY f.fechaCreacion DESC")
    List<FormDiagFormulario> findByIdIpress(@Param("idIpress") Long idIpress);

    /**
     * Buscar formulario activo (en proceso) por IPRESS y año
     */
    @Query("SELECT f FROM FormDiagFormulario f WHERE f.ipress.idIpress = :idIpress AND f.anio = :anio AND f.estado = 'EN_PROCESO'")
    Optional<FormDiagFormulario> findEnProcesoPorIpressAndAnio(@Param("idIpress") Long idIpress, @Param("anio") Integer anio);

    /**
     * Buscar el último formulario por IPRESS
     */
    @Query("SELECT f FROM FormDiagFormulario f WHERE f.ipress.idIpress = :idIpress ORDER BY f.fechaCreacion DESC")
    List<FormDiagFormulario> findByIpressOrderByFechaCreacionDesc(@Param("idIpress") Long idIpress);

    /**
     * Buscar formularios por estado
     */
    List<FormDiagFormulario> findByEstadoOrderByFechaCreacionDesc(String estado);

    /**
     * Buscar formularios por año
     */
    List<FormDiagFormulario> findByAnioOrderByFechaCreacionDesc(Integer anio);

    /**
     * Buscar formulario por IPRESS y año específico
     */
    @Query("SELECT f FROM FormDiagFormulario f WHERE f.ipress.idIpress = :idIpress AND f.anio = :anio")
    Optional<FormDiagFormulario> findByIpressAndAnio(@Param("idIpress") Long idIpress, @Param("anio") Integer anio);

    /**
     * Contar formularios por estado
     */
    Long countByEstado(String estado);

    /**
     * Buscar formularios por Red Asistencial
     */
    @Query("SELECT f FROM FormDiagFormulario f WHERE f.ipress.red.id = :idRed ORDER BY f.fechaCreacion DESC")
    List<FormDiagFormulario> findByIdRed(@Param("idRed") Long idRed);

    // ========================================
    // Métodos de conteo para Módulo de Red
    // ========================================

    /**
     * Contar formularios por Red
     */
    @Query("SELECT COUNT(f) FROM FormDiagFormulario f WHERE f.ipress.red.id = :idRed")
    Long countByIpress_Red_Id(@Param("idRed") Long idRed);

    /**
     * Contar formularios por Red y Estado
     */
    @Query("SELECT COUNT(f) FROM FormDiagFormulario f WHERE f.ipress.red.id = :idRed AND f.estado = :estado")
    Long countByIpress_Red_IdAndEstado(@Param("idRed") Long idRed, @Param("estado") String estado);
}
