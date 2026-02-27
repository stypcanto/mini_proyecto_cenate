package com.styp.cenate.repository;

import com.styp.cenate.model.PacienteEstrategia;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository para la entidad PacienteEstrategia
 * Maneja la persistencia de asignaciones de estrategias a pacientes
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-01-06
 */
@Repository
public interface PacienteEstrategiaRepository extends JpaRepository<PacienteEstrategia, Long> {

    /**
     * Obtiene todas las estrategias activas de un paciente
     *
     * @param pkAsegurado ID del paciente (asegurado)
     * @return Lista de asignaciones activas
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado AND pe.estado = 'ACTIVO' " +
           "ORDER BY pe.fechaAsignacion DESC")
    List<PacienteEstrategia> findEstrategiasActivasByPaciente(@Param("pkAsegurado") String pkAsegurado);

    /**
     * Obtiene todas las estrategias (activas, inactivas y completadas) de un paciente
     *
     * @param pkAsegurado ID del paciente (asegurado)
     * @return Lista completa de asignaciones de estrategias
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "ORDER BY pe.fechaAsignacion DESC")
    List<PacienteEstrategia> findHistorialEstrategiasByPaciente(@Param("pkAsegurado") String pkAsegurado);

    /**
     * Obtiene el historial con paginación
     *
     * @param pkAsegurado ID del paciente
     * @param pageable Configuración de paginación
     * @return Página de asignaciones de estrategias
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "ORDER BY pe.fechaAsignacion DESC")
    Page<PacienteEstrategia> findHistorialEstrategiasByPacientePaginado(
            @Param("pkAsegurado") String pkAsegurado,
            Pageable pageable
    );

    /**
     * Verifica si existe una asignación ACTIVA de un paciente a una estrategia específica
     *
     * @param pkAsegurado ID del paciente
     * @param idEstrategia ID de la estrategia
     * @return true si existe una asignación activa
     */
    @Query("SELECT CASE WHEN COUNT(pe) > 0 THEN true ELSE false END " +
           "FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "AND pe.estrategia.idEstrategia = :idEstrategia " +
           "AND pe.estado = 'ACTIVO'")
    boolean existsAsignacionActiva(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("idEstrategia") Long idEstrategia
    );

    /**
     * Obtiene la asignación ACTIVA de un paciente a una estrategia específica
     *
     * @param pkAsegurado ID del paciente
     * @param idEstrategia ID de la estrategia
     * @return Optional con la asignación activa si existe
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "AND pe.estrategia.idEstrategia = :idEstrategia " +
           "AND pe.estado = 'ACTIVO'")
    Optional<PacienteEstrategia> findAsignacionActiva(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("idEstrategia") Long idEstrategia
    );

    /**
     * Obtiene todos los pacientes asignados a una estrategia (estado activo)
     *
     * @param idEstrategia ID de la estrategia
     * @return Lista de asignaciones activas para esa estrategia
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.estrategia.idEstrategia = :idEstrategia " +
           "AND pe.estado = 'ACTIVO' " +
           "ORDER BY pe.fechaAsignacion DESC")
    List<PacienteEstrategia> findPacientesActivosPorEstrategia(@Param("idEstrategia") Long idEstrategia);

    /**
     * Obtiene todos los pacientes asignados a una estrategia (con paginación)
     *
     * @param idEstrategia ID de la estrategia
     * @param pageable Configuración de paginación
     * @return Página de asignaciones
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.estrategia.idEstrategia = :idEstrategia " +
           "AND pe.estado = 'ACTIVO' " +
           "ORDER BY pe.fechaAsignacion DESC")
    Page<PacienteEstrategia> findPacientesActivosPorEstrategiaPaginado(
            @Param("idEstrategia") Long idEstrategia,
            Pageable pageable
    );

    /**
     * Obtiene asignaciones dentro de un rango de fechas
     *
     * @param fechaInicio Fecha de inicio (inclusive)
     * @param fechaFin Fecha de fin (inclusive)
     * @return Lista de asignaciones dentro del rango
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.fechaAsignacion >= :fechaInicio " +
           "AND pe.fechaAsignacion <= :fechaFin " +
           "ORDER BY pe.fechaAsignacion DESC")
    List<PacienteEstrategia> findAsignacionesPorRangoFechas(
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin
    );

    /**
     * Cuenta el número de pacientes únicos por estrategia
     *
     * @param idEstrategia ID de la estrategia
     * @param estado Estado de la asignación
     * @return Cantidad de pacientes únicos
     */
    @Query("SELECT COUNT(DISTINCT pe.pkAsegurado) " +
           "FROM PacienteEstrategia pe " +
           "WHERE pe.estrategia.idEstrategia = :idEstrategia " +
           "AND pe.estado = :estado")
    long contarPacientesPorEstrategiaYEstado(
            @Param("idEstrategia") Long idEstrategia,
            @Param("estado") String estado
    );

    /**
     * Obtiene asignaciones sin agrupar por fecha de desvinculación
     *
     * @param estado Estado a filtrar
     * @return Lista de asignaciones
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.estado = :estado " +
           "ORDER BY pe.fechaAsignacion DESC")
    List<PacienteEstrategia> findByEstado(@Param("estado") String estado);

    /**
     * Obtiene asignaciones con paginación por estado
     *
     * @param estado Estado a filtrar
     * @param pageable Configuración de paginación
     * @return Página de asignaciones
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.estado = :estado " +
           "ORDER BY pe.fechaAsignacion DESC")
    Page<PacienteEstrategia> findByEstadoPaginado(
            @Param("estado") String estado,
            Pageable pageable
    );

    /**
     * Obtiene los DNIs de pacientes que pertenecen ACTIVAMENTE a una estrategia específica,
     * dado un conjunto de DNIs a verificar (consulta masiva para evitar N+1 queries).
     * Busca por SIGLA (ej: "CENACRON") ya que cod_estrategia es "EST-001", "EST-002", etc.
     *
     * @param pkAseguradoList Lista de DNIs/pk_asegurado de pacientes a verificar
     * @param sigla           Sigla de la estrategia (ej: "CENACRON", "TELECAM")
     * @return Lista de pk_asegurado que pertenecen activamente a la estrategia
     */
    @Query("SELECT pe.pkAsegurado FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado IN :pkAseguradoList " +
           "AND pe.estrategia.sigla = :sigla " +
           "AND pe.estado = 'ACTIVO'")
    List<String> findDnisPertenecentesAEstrategia(
            @Param("pkAseguradoList") List<String> pkAseguradoList,
            @Param("sigla") String sigla
    );

    /**
     * Obtiene la asignación ACTIVA de un paciente buscando por SIGLA de la estrategia.
     * Usado en el flujo de Baja CENACRON donde no se conoce el id_estrategia numérico.
     *
     * @param pkAsegurado DNI/pk_asegurado del paciente
     * @param sigla       Sigla de la estrategia (ej: "CENACRON")
     * @return Optional con la asignación activa si existe
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "AND pe.estrategia.sigla = :sigla " +
           "AND pe.estado = 'ACTIVO'")
    Optional<PacienteEstrategia> findAsignacionActivaPorSigla(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("sigla") String sigla
    );

    /**
     * Obtiene el historial completo de asignaciones a una estrategia para un paciente,
     * incluyendo todos los estados (ACTIVO, INACTIVO, COMPLETADO).
     * Hace JOIN FETCH de los usuarios para evitar LazyInitializationException.
     * Usado en el timeline de trazabilidad para mostrar eventos CENACRON.
     *
     * @param pkAsegurado DNI/pk_asegurado del paciente
     * @param sigla       Sigla de la estrategia (ej: "CENACRON")
     * @return Lista ordenada por fecha de asignación ascendente
     */
    @Query("SELECT pe FROM PacienteEstrategia pe " +
           "LEFT JOIN FETCH pe.usuarioAsigno " +
           "LEFT JOIN FETCH pe.usuarioDesvinculo " +
           "WHERE pe.pkAsegurado = :pkAsegurado " +
           "AND pe.estrategia.sigla = :sigla " +
           "ORDER BY pe.fechaAsignacion ASC")
    List<PacienteEstrategia> findHistorialPorPkAseguradoYSigla(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("sigla") String sigla
    );

    /**
     * Lista paginada de bajas CENACRON (estado INACTIVO o COMPLETADO) con datos de auditoría.
     * Incluye nombre del paciente y datos completos del usuario que generó la baja.
     */
    @Query(value = """
        SELECT pe.id_asignacion,
               pe.pk_asegurado,
               a.paciente          AS nombre_paciente,
               pe.estado,
               pe.observacion_desvinculacion AS motivo,
               pe.fecha_asignacion,
               pe.fecha_desvinculacion,
               udesv.name_user     AS usuario_baja_login,
               TRIM(COALESCE(pdesv.ape_pater_pers,'') || ' ' || COALESCE(pdesv.ape_mater_pers,'') || ' ' || COALESCE(pdesv.nom_pers,'')) AS nombre_quien_dio_baja,
               EXTRACT(EPOCH FROM (pe.fecha_desvinculacion - pe.fecha_asignacion))/86400 AS dias_en_programa
        FROM paciente_estrategia pe
        JOIN dim_estrategia_institucional e ON e.id_estrategia = pe.id_estrategia
        LEFT JOIN asegurados a ON a.doc_paciente = pe.pk_asegurado
        LEFT JOIN dim_usuarios udesv ON udesv.id_user = pe.id_usuario_desvinculo
        LEFT JOIN dim_personal_cnt pdesv ON pdesv.id_usuario = udesv.id_user
        WHERE e.sigla = 'CENACRON'
          AND pe.estado IN ('INACTIVO','COMPLETADO')
          AND (:busqueda IS NULL OR pe.pk_asegurado ILIKE '%'||:busqueda||'%'
                                 OR a.paciente ILIKE '%'||:busqueda||'%')
          AND (:estado IS NULL OR pe.estado = :estado)
          AND (:fechaInicio IS NULL OR DATE(pe.fecha_desvinculacion) >= CAST(:fechaInicio AS DATE))
          AND (:fechaFin    IS NULL OR DATE(pe.fecha_desvinculacion) <= CAST(:fechaFin    AS DATE))
        ORDER BY pe.fecha_desvinculacion DESC NULLS LAST
        """,
        countQuery = """
        SELECT COUNT(*) FROM paciente_estrategia pe
        JOIN dim_estrategia_institucional e ON e.id_estrategia = pe.id_estrategia
        LEFT JOIN asegurados a ON a.doc_paciente = pe.pk_asegurado
        WHERE e.sigla='CENACRON' AND pe.estado IN ('INACTIVO','COMPLETADO')
          AND (:busqueda IS NULL OR pe.pk_asegurado ILIKE '%'||:busqueda||'%' OR a.paciente ILIKE '%'||:busqueda||'%')
          AND (:estado IS NULL OR pe.estado = :estado)
          AND (:fechaInicio IS NULL OR DATE(pe.fecha_desvinculacion) >= CAST(:fechaInicio AS DATE))
          AND (:fechaFin    IS NULL OR DATE(pe.fecha_desvinculacion) <= CAST(:fechaFin    AS DATE))
        """, nativeQuery = true)
    Page<Object[]> findBajasCenacronPaginado(
            @Param("busqueda") String busqueda,
            @Param("estado")   String estado,
            @Param("fechaInicio") String fechaInicio,
            @Param("fechaFin")    String fechaFin,
            Pageable pageable
    );
}
