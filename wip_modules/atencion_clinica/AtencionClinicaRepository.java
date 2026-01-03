package com.styp.cenate.repository;

import com.styp.cenate.model.AtencionClinica;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository para la entidad AtencionClinica
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface AtencionClinicaRepository extends JpaRepository<AtencionClinica, Long> {

    /**
     * Busca atenciones de un asegurado específico (paginado, ordenado por fecha desc)
     *
     * @param pkAsegurado PK del asegurado
     * @param pageable    Configuración de paginación
     * @return Page con las atenciones del asegurado
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.asegurado " +
           "LEFT JOIN FETCH a.ipress " +
           "LEFT JOIN FETCH a.tipoAtencion " +
           "LEFT JOIN FETCH a.personalCreador " +
           "WHERE a.asegurado.pkAsegurado = :pkAsegurado " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> findByPkAseguradoOrderByFechaAtencionDesc(
            @Param("pkAsegurado") String pkAsegurado,
            Pageable pageable);

    /**
     * Busca atenciones creadas por un profesional específico (paginado)
     *
     * @param idPersonalCreador ID del profesional creador
     * @param pageable          Configuración de paginación
     * @return Page con las atenciones creadas por el profesional
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.asegurado " +
           "LEFT JOIN FETCH a.ipress " +
           "LEFT JOIN FETCH a.tipoAtencion " +
           "WHERE a.personalCreador.idPers = :idPersonalCreador " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> findByIdPersonalCreadorOrderByFechaAtencionDesc(
            @Param("idPersonalCreador") Long idPersonalCreador,
            Pageable pageable);

    /**
     * Busca atenciones con filtros múltiples (búsqueda avanzada)
     *
     * @param pkAsegurado       PK del asegurado (opcional)
     * @param idIpress          ID de IPRESS (opcional)
     * @param idEspecialidad    ID de especialidad (opcional)
     * @param idTipoAtencion    ID de tipo de atención (opcional)
     * @param idEstrategia      ID de estrategia (opcional)
     * @param fechaInicio       Fecha inicial del rango (opcional)
     * @param fechaFin          Fecha final del rango (opcional)
     * @param pageable          Configuración de paginación
     * @return Page con las atenciones filtradas
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.asegurado " +
           "LEFT JOIN FETCH a.ipress " +
           "LEFT JOIN FETCH a.tipoAtencion " +
           "LEFT JOIN FETCH a.personalCreador " +
           "WHERE (:pkAsegurado IS NULL OR a.asegurado.pkAsegurado = :pkAsegurado) " +
           "AND (:idIpress IS NULL OR a.ipress.idIpress = :idIpress) " +
           "AND (:idEspecialidad IS NULL OR a.especialidad.idServicio = :idEspecialidad) " +
           "AND (:idTipoAtencion IS NULL OR a.tipoAtencion.idTipoAtencion = :idTipoAtencion) " +
           "AND (:idEstrategia IS NULL OR a.estrategia.idEstrategia = :idEstrategia) " +
           "AND (:fechaInicio IS NULL OR a.fechaAtencion >= :fechaInicio) " +
           "AND (:fechaFin IS NULL OR a.fechaAtencion <= :fechaFin) " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> busquedaAvanzada(
            @Param("pkAsegurado") String pkAsegurado,
            @Param("idIpress") Long idIpress,
            @Param("idEspecialidad") Long idEspecialidad,
            @Param("idTipoAtencion") Long idTipoAtencion,
            @Param("idEstrategia") Long idEstrategia,
            @Param("fechaInicio") OffsetDateTime fechaInicio,
            @Param("fechaFin") OffsetDateTime fechaFin,
            Pageable pageable);

    /**
     * Cuenta atenciones de un asegurado
     *
     * @param pkAsegurado PK del asegurado
     * @return Cantidad de atenciones
     */
    @Query("SELECT COUNT(a) FROM AtencionClinica a WHERE a.asegurado.pkAsegurado = :pkAsegurado")
    Long countByPkAsegurado(@Param("pkAsegurado") String pkAsegurado);

    /**
     * Cuenta atenciones creadas por un profesional
     *
     * @param idPersonalCreador ID del profesional
     * @return Cantidad de atenciones
     */
    @Query("SELECT COUNT(a) FROM AtencionClinica a WHERE a.personalCreador.idPers = :idPersonalCreador")
    Long countByIdPersonalCreador(@Param("idPersonalCreador") Long idPersonalCreador);

    /**
     * Busca atenciones con interconsulta pendiente
     *
     * @param pageable Configuración de paginación
     * @return Page con atenciones con interconsulta
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.asegurado " +
           "LEFT JOIN FETCH a.especialidadInterconsulta " +
           "WHERE a.tieneOrdenInterconsulta = true " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> findAllConInterconsulta(Pageable pageable);

    /**
     * Busca atenciones que requieren telemonitoreo
     *
     * @param pageable Configuración de paginación
     * @return Page con atenciones que requieren telemonitoreo
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.asegurado " +
           "WHERE a.requiereTelemonitoreo = true " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> findAllConTelemonitoreo(Pageable pageable);

    /**
     * Busca las últimas N atenciones de un asegurado
     *
     * @param pkAsegurado PK del asegurado
     * @param limit       Cantidad máxima de resultados
     * @return Lista con las últimas atenciones
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "LEFT JOIN FETCH a.tipoAtencion " +
           "LEFT JOIN FETCH a.personalCreador " +
           "WHERE a.asegurado.pkAsegurado = :pkAsegurado " +
           "ORDER BY a.fechaAtencion DESC")
    List<AtencionClinica> findTopNByPkAsegurado(
            @Param("pkAsegurado") String pkAsegurado,
            Pageable pageable);

    /**
     * Busca atenciones por rango de fechas
     *
     * @param fechaInicio Fecha inicial
     * @param fechaFin    Fecha final
     * @param pageable    Configuración de paginación
     * @return Page con atenciones en el rango
     */
    @Query("SELECT a FROM AtencionClinica a " +
           "WHERE a.fechaAtencion BETWEEN :fechaInicio AND :fechaFin " +
           "ORDER BY a.fechaAtencion DESC")
    Page<AtencionClinica> findByFechaAtencionBetween(
            @Param("fechaInicio") OffsetDateTime fechaInicio,
            @Param("fechaFin") OffsetDateTime fechaFin,
            Pageable pageable);

    /**
     * Cuenta atenciones por tipo de atención en un rango de fechas
     *
     * @param fechaInicio Fecha inicial
     * @param fechaFin    Fecha final
     * @return Lista con conteos por tipo
     */
    @Query("SELECT a.tipoAtencion.descTipoAtencion, COUNT(a) " +
           "FROM AtencionClinica a " +
           "WHERE a.fechaAtencion BETWEEN :fechaInicio AND :fechaFin " +
           "GROUP BY a.tipoAtencion.descTipoAtencion " +
           "ORDER BY COUNT(a) DESC")
    List<Object[]> countByTipoAtencionAndFechaRange(
            @Param("fechaInicio") OffsetDateTime fechaInicio,
            @Param("fechaFin") OffsetDateTime fechaFin);
}
