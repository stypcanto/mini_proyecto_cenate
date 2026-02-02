package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionClinica107;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

/**
 * 🔄 AtencionClinica107Repository
 * Propósito: Acceso a datos de atenciones clínicas del Módulo 107
 * 
 * ⚠️ NOTA: red y macrorregion NO se filtran en BD (dinámico en frontend)
 * Usa only filtros disponibles: idIpress, pacienteDni, estadoGestionCitasId, 
 * tipoDocumento, derivacionInterna, especialidad, tipoCita, fechaSolicitud
 */
@Repository
public interface AtencionClinica107Repository 
    extends JpaRepository<AtencionClinica107, Long>, JpaSpecificationExecutor<AtencionClinica107> {

    /**
     * Listar todas las atenciones con paginación
     */
    Page<AtencionClinica107> findAll(Pageable pageable);

    /**
     * Buscar por estado de gestión de citas (ID del estado, no string)
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.estadoGestionCitasId = :estadoId ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByEstadoGestionCitasId(@Param("estadoId") Long estadoId, Pageable pageable);

    /**
     * Buscar por descripción de estado (PENDIENTE, ATENDIDO)
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE UPPER(a.estadoDescripcion) = UPPER(:estado) OR UPPER(a.estado) = UPPER(:estado) ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByEstado(@Param("estado") String estado, Pageable pageable);

    /**
     * Buscar por número de documento
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.pacienteDni LIKE %:dni% ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByPacienteDni(@Param("dni") String dni, Pageable pageable);

    /**
     * Filtro combinado: tipo documento + documento
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.tipoDocumento = :tipoDoc AND a.pacienteDni = :dni ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByTipoDocumentoAndDni(
        @Param("tipoDoc") String tipoDoc, 
        @Param("dni") String dni, 
        Pageable pageable
    );

    /**
     * Filtro de rango de fechas
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.fechaSolicitud BETWEEN :inicio AND :fin ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByFechaSolicitudBetween(
        @Param("inicio") LocalDateTime inicio, 
        @Param("fin") LocalDateTime fin, 
        Pageable pageable
    );

    /**
     * Búsqueda por IPRESS
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.idIpress = :idIpress ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByIdIpress(@Param("idIpress") Long idIpress, Pageable pageable);

    /**
     * Búsqueda por código IPRESS
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.codigoIpress = :codigoIpress ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByCodigoIpress(@Param("codigoIpress") String codigoIpress, Pageable pageable);

    /**
     * Búsqueda por derivación interna
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.derivacionInterna = :derivacion ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByDerivacionInterna(@Param("derivacion") String derivacion, Pageable pageable);

    /**
     * Búsqueda por especialidad
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.especialidad = :especialidad ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByEspecialidad(@Param("especialidad") String especialidad, Pageable pageable);

    /**
     * Búsqueda por tipo de cita
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE a.tipoCita = :tipoCita ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> findByTipoCita(@Param("tipoCita") String tipoCita, Pageable pageable);

    /**
     * Búsqueda general por nombre o DNI o número de solicitud
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE " +
           "LOWER(a.pacienteNombre) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "a.pacienteDni LIKE %:search% OR " +
           "a.numeroSolicitud LIKE %:search% " +
           "ORDER BY a.fechaSolicitud DESC")
    Page<AtencionClinica107> buscarGeneral(@Param("search") String search, Pageable pageable);

    /**
     * Estadísticas globales - Contar por estado de gestión de citas
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.estadoGestionCitasId = :estadoId")
    Long contarPorEstado(@Param("estadoId") Long estadoId);

    /**
     * Estadísticas globales - Contar total
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a")
    Long contarTotal();

    /**
     * Contar por estado (PENDIENTE o ATENDIDO)
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE UPPER(a.estado) = UPPER(:estado)")
    Long contarPorEstadoDescripcion(@Param("estado") String estado);
}
