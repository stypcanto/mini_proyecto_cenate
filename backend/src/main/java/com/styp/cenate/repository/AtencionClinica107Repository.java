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
    extends JpaRepository<AtencionClinica107, Long>, JpaSpecificationExecutor<AtencionClinica107>, AtencionClinica107RepositoryCustom {

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
     * Buscar por estado (PENDIENTE, ATENDIDO)
     */
    @Query("SELECT a FROM AtencionClinica107 a WHERE UPPER(a.estado) = UPPER(:estado) ORDER BY a.fechaSolicitud DESC")
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
     * Estadísticas globales - Contar por estado de gestión de citas (Bolsa 1)
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.estadoGestionCitasId = :estadoId AND a.idBolsa = 1")
    Long contarPorEstado(@Param("estadoId") Long estadoId);

    /**
     * Estadísticas globales - Contar total (Bolsa 1 - MÓDULO 107)
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.idBolsa = 1")
    Long contarTotal();

    /**
     * Contar por estado (PENDIENTE o ATENDIDO) para Bolsa 1
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE UPPER(a.estado) = UPPER(:estado) AND a.idBolsa = 1")
    Long contarPorEstadoDescripcion(@Param("estado") String estado);

    // 🆕 ==================== ESTADÍSTICAS POR CONDICIÓN MÉDICA ====================
    
    /**
     * Contar pacientes por condición médica específica (Bolsa 1)
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.condicionMedica = :condicion AND a.idBolsa = 1")
    Long contarPorCondicionMedica(@Param("condicion") String condicion);

    /**
     * Contar pacientes pendientes (condicion_medica = 'Pendiente' O NULL) para Bolsa 1
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE (a.condicionMedica = 'Pendiente' OR a.condicionMedica IS NULL) AND a.idBolsa = 1")
    Long contarPendientes();

    /**
     * Contar pacientes atendidos (condicion_medica = 'Atendido') para Bolsa 1
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.condicionMedica = 'Atendido' AND a.idBolsa = 1")
    Long contarAtendidos();

    /**
     * Contar deserciones (condicion_medica = 'Deserción') para Bolsa 1
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.condicionMedica = 'Deserción' AND a.idBolsa = 1")
    Long contarDeserciones();

    // 🆕 ==================== MÉTODOS NUEVOS PARA ESTADÍSTICAS AVANZADAS ====================

    /**
     * Contar atenciones por bolsa
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.idBolsa = :idBolsa")
    Long countByIdBolsa(@Param("idBolsa") Long idBolsa);

    /**
     * Contar por condición médica específica y bolsa
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a WHERE a.condicionMedica = :condicion AND a.idBolsa = :idBolsa")
    Long countByCondicionMedicaAndIdBolsa(@Param("condicion") String condicion, @Param("idBolsa") Long idBolsa);

    /**
     * Contar pendientes (condicion_medica IS NULL O = 'Pendiente')
     */
    @Query("SELECT COUNT(DISTINCT a.idSolicitud) FROM AtencionClinica107 a " +
           "WHERE (a.condicionMedica IS NULL OR a.condicionMedica = :pendienteValue) AND a.idBolsa = :idBolsa")
    Long countByCondicionMedicaNullOrValueAndIdBolsa(@Param("pendienteValue") String pendienteValue, @Param("idBolsa") Long idBolsa);

    /**
     * Estadísticas mensuales - Atenciones por mes
     */
    @Query(value = "SELECT " +
           "EXTRACT(MONTH FROM fecha_atencion) AS mes, " +
           "EXTRACT(YEAR FROM fecha_atencion) AS anio, " +
           "COUNT(id_solicitud) AS total_atenciones, " +
           "TO_CHAR(fecha_atencion, 'Month YYYY') AS periodo " +
           "FROM dim_solicitud_bolsa " +
           "WHERE fecha_atencion IS NOT NULL AND id_bolsa = 1 " +
           "GROUP BY EXTRACT(MONTH FROM fecha_atencion), EXTRACT(YEAR FROM fecha_atencion), TO_CHAR(fecha_atencion, 'Month YYYY') " +
           "ORDER BY anio, mes", nativeQuery = true)
    java.util.List<Object[]> findEstadisticasMensuales();

    /**
     * Estadísticas IPRESS - Top N con información geográfica
     */
    @Query(value = "SELECT " +
           "dsb.id_ipress, " +
           "di.desc_ipress AS nombre_ipress, " +
           "di.cod_ipress AS codigo_ipress, " +
           "dr.desc_red AS red, " +
           "dm.desc_macro AS macroregion, " +
           "COUNT(dsb.id_solicitud) AS total_atenciones " +
           "FROM dim_solicitud_bolsa dsb " +
           "LEFT JOIN dim_ipress di ON dsb.id_ipress = di.id_ipress " +
           "LEFT JOIN dim_red dr ON di.id_red = dr.id_red " +
           "LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro " +
           "WHERE dsb.id_bolsa = 1 " +
           "GROUP BY dsb.id_ipress, di.desc_ipress, di.cod_ipress, dr.desc_red, dm.desc_macro " +
           "ORDER BY total_atenciones DESC " +
           "LIMIT :limit", nativeQuery = true)
    java.util.List<Object[]> findEstadisticasIpressTopN(@Param("limit") int limit);

    /**
     * Estadísticas por especialidad (derivación interna)
     */
    @Query(value = "SELECT " +
           "derivacion_interna, " +
           "COUNT(id_solicitud) AS total_atenciones " +
           "FROM dim_solicitud_bolsa " +
           "WHERE id_bolsa = 1 AND derivacion_interna IS NOT NULL " +
           "GROUP BY derivacion_interna " +
           "ORDER BY total_atenciones DESC", nativeQuery = true)
    java.util.List<Object[]> findEstadisticasEspecialidad();

    /**
     * Estadísticas por tipo de cita
     */
    @Query(value = "SELECT " +
           "tipo_cita, " +
           "COUNT(id_solicitud) AS total_atenciones " +
           "FROM dim_solicitud_bolsa " +
           "WHERE id_bolsa = 1 AND tipo_cita IS NOT NULL " +
           "GROUP BY tipo_cita " +
           "ORDER BY total_atenciones DESC", nativeQuery = true)
    java.util.List<Object[]> findEstadisticasTipoCita();
}
