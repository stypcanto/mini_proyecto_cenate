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
 * Repository para gestionar atenciones clínicas
 *
 * @author Claude Code + Styp Canto Rondón
 * @version 2.0.0
 * @since 2026-01-03
 */
@Repository
public interface AtencionClinicaRepository extends JpaRepository<AtencionClinica, Long> {

        /**
         * Buscar todas las atenciones de un asegurado específico (paginado)
         *
         * @param pkAsegurado ID del asegurado
         * @param pageable    Objeto de paginación
         * @return Page de atenciones del asegurado
         */
        Page<AtencionClinica> findByPkAseguradoOrderByFechaAtencionDesc(
                        String pkAsegurado,
                        Pageable pageable);

        /**
         * Buscar todas las atenciones de un asegurado específico (sin paginar)
         *
         * @param pkAsegurado ID del asegurado
         * @return Lista de atenciones del asegurado ordenadas por fecha descendente
         */
        List<AtencionClinica> findByPkAseguradoOrderByFechaAtencionDesc(String pkAsegurado);

        /**
         * Buscar atenciones creadas por un profesional específico (paginado)
         *
         * @param idPersonalCreador ID del profesional creador
         * @param pageable          Objeto de paginación
         * @return Page de atenciones creadas por el profesional
         */
        Page<AtencionClinica> findByIdPersonalCreadorOrderByFechaAtencionDesc(
                        Long idPersonalCreador,
                        Pageable pageable);

        /**
         * Buscar atenciones creadas por un profesional específico (sin paginar)
         *
         * @param idPersonalCreador ID del profesional creador
         * @return Lista de atenciones creadas por el profesional
         */
        List<AtencionClinica> findByIdPersonalCreador(Long idPersonalCreador);

        /**
         * Buscar atenciones por rango de fechas (paginado)
         *
         * @param fechaInicio Fecha de inicio (inclusive)
         * @param fechaFin    Fecha de fin (inclusive)
         * @param pageable    Objeto de paginación
         * @return Page de atenciones en el rango de fechas
         */
        @Query("SELECT a FROM AtencionClinica a " +
                        "WHERE a.fechaAtencion BETWEEN :fechaInicio AND :fechaFin " +
                        "ORDER BY a.fechaAtencion DESC")
        Page<AtencionClinica> findByFechaAtencionBetween(
                        @Param("fechaInicio") OffsetDateTime fechaInicio,
                        @Param("fechaFin") OffsetDateTime fechaFin,
                        Pageable pageable);

        /**
         * Buscar atenciones por IPRESS (paginado)
         *
         * @param idIpress ID de la IPRESS
         * @param pageable Objeto de paginación
         * @return Page de atenciones de la IPRESS
         */
        Page<AtencionClinica> findByIdIpressOrderByFechaAtencionDesc(
                        Long idIpress,
                        Pageable pageable);

        /**
         * Buscar atenciones por tipo de atención (paginado)
         *
         * @param idTipoAtencion ID del tipo de atención
         * @param pageable       Objeto de paginación
         * @return Page de atenciones del tipo especificado
         */
        Page<AtencionClinica> findByIdTipoAtencionOrderByFechaAtencionDesc(
                        Long idTipoAtencion,
                        Pageable pageable);

        /**
         * Buscar atenciones por estrategia institucional (paginado)
         *
         * @param idEstrategia ID de la estrategia
         * @param pageable     Objeto de paginación
         * @return Page de atenciones de la estrategia
         */
        Page<AtencionClinica> findByIdEstrategiaOrderByFechaAtencionDesc(
                        Long idEstrategia,
                        Pageable pageable);

        /**
         * Buscar atenciones con orden de interconsulta (paginado)
         *
         * @param pageable Objeto de paginación
         * @return Page de atenciones con interconsulta
         */
        Page<AtencionClinica> findByTieneOrdenInterconsultaTrueOrderByFechaAtencionDesc(
                        Pageable pageable);

        /**
         * Buscar atenciones que requieren telemonitoreo (paginado)
         *
         * @param pageable Objeto de paginación
         * @return Page de atenciones que requieren telemonitoreo
         */
        Page<AtencionClinica> findByRequiereTelemonitoreoTrueOrderByFechaAtencionDesc(
                        Pageable pageable);

        /**
         * Contar atenciones de un asegurado
         *
         * @param pkAsegurado ID del asegurado
         * @return Número de atenciones del asegurado
         */
        long countByPkAsegurado(String pkAsegurado);

        /**
         * Contar atenciones creadas por un profesional
         *
         * @param idPersonalCreador ID del profesional
         * @return Número de atenciones creadas por el profesional
         */
        long countByIdPersonalCreador(Long idPersonalCreador);

        /**
         * Verificar si un asegurado tiene atenciones registradas
         *
         * @param pkAsegurado ID del asegurado
         * @return true si tiene al menos una atención, false en caso contrario
         */
        boolean existsByPkAsegurado(String pkAsegurado);

        /**
         * Obtener la atención anterior más reciente de un paciente antes de una fecha
         * específica
         * Útil para comparaciones y análisis de tendencias
         *
         * @param pkAsegurado ID del asegurado
         * @param fechaActual Fecha de referencia (se busca la atención anterior a esta
         *                    fecha)
         * @return La atención más reciente antes de la fecha dada, o null si no existe
         */
        @Query("SELECT a FROM AtencionClinica a " +
                        "WHERE a.pkAsegurado = :pkAsegurado " +
                        "AND a.fechaAtencion < :fechaActual " +
                        "ORDER BY a.fechaAtencion DESC " +
                        "LIMIT 1")
        AtencionClinica findPreviousAtencion(
                        @Param("pkAsegurado") String pkAsegurado,
                        @Param("fechaActual") OffsetDateTime fechaActual);
}
