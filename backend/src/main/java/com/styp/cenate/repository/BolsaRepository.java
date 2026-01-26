package com.styp.cenate.repository;

import com.styp.cenate.model.DimBolsa;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * 📊 Repository para gestión de Bolsas
 * v1.8.0 - Acceso a datos de dim_solicitud_bolsa
 */
@Repository
public interface BolsaRepository extends JpaRepository<DimBolsa, Long> {

    /**
     * Obtiene bolsas por DNI del paciente
     */
    List<DimBolsa> findByPacienteDni(String pacienteDni);

    /**
     * Obtiene bolsa por número de solicitud
     */
    Optional<DimBolsa> findByNumeroSolicitud(String numeroSolicitud);

    /**
     * Búsqueda paginada de bolsas por nombre del paciente o DNI
     */
    @Query("SELECT b FROM DimBolsa b WHERE " +
           "(:busqueda IS NULL OR LOWER(b.pacienteNombre) LIKE LOWER(CONCAT('%', :busqueda, '%')) OR " +
           "b.pacienteDni LIKE CONCAT('%', :busqueda, '%')) AND " +
           "(:estado IS NULL OR b.estado = :estado) AND " +
           "(:activo IS NULL OR b.activo = :activo)")
    Page<DimBolsa> buscarBolsas(@Param("busqueda") String busqueda, @Param("estado") String estado, @Param("activo") Boolean activo, Pageable pageable);

    /**
     * Obtiene bolsas por tipo de cita
     */
    List<DimBolsa> findByTipoCita(String tipoCita);

    /**
     * Obtiene bolsas por código IPRESS
     */
    List<DimBolsa> findByCodigoIpress(String codigoIpress);

    /**
     * Cuenta bolsas creadas en una fecha
     */
    Long countByFechaNacimiento(LocalDate fecha);

    /**
     * Obtiene todas las bolsas ordenadas por solicitud más reciente
     */
    @Query("SELECT b FROM DimBolsa b ORDER BY b.idSolicitud DESC")
    List<DimBolsa> findAllOrderByRecent(Pageable pageable);

    /**
     * Obtiene bolsas por estado y activo
     */
    List<DimBolsa> findByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Obtiene bolsas por especialidad e activo
     */
    List<DimBolsa> findByEspecialidadIdAndActivo(Long especialidadId, Boolean activo);

    /**
     * Obtiene bolsas por responsable e activo
     */
    List<DimBolsa> findByResponsableIdAndActivo(Long responsableId, Boolean activo);

    /**
     * Cuenta bolsas activas
     */
    Long countByActivo(Boolean activo);

    /**
     * Cuenta bolsas por estado y activo
     */
    Long countByEstadoAndActivo(String estado, Boolean activo);

    /**
     * Obtiene todas las bolsas activas ordenadas por fecha creación descendente
     */
    List<DimBolsa> findByActivoOrderByFechaCreacionDesc(Boolean activo);

    /**
     * Busca bolsa por nombre ignorando mayúsculas
     */
    Optional<DimBolsa> findByPacienteNombreIgnoreCase(String pacienteNombre);
}
