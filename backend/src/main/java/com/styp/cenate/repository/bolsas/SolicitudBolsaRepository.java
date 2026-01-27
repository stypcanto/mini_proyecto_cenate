package com.styp.cenate.repository.bolsas;

import com.styp.cenate.model.bolsas.SolicitudBolsa;
import com.styp.cenate.dto.bolsas.SolicitudBolsaDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Repository para acceso a datos de solicitudes de bolsa
 * Proporciona métodos CRUD + consultas personalizadas
 * 
 * @version v1.6.0
 * @since 2026-01-23
 */
@Repository
public interface SolicitudBolsaRepository extends JpaRepository<SolicitudBolsa, Long> {

    /**
     * Busca una solicitud por su número único
     */
    Optional<SolicitudBolsa> findByNumeroSolicitud(String numeroSolicitud);

    /**
     * Verifica si ya existe una solicitud duplicada
     * por la combinación única: bolsa + paciente
     */
    boolean existsByIdBolsaAndPacienteId(
        Long idBolsa,
        Long pacienteId
    );

    /**
     * Busca solicitudes por bolsa (activas)
     */
    List<SolicitudBolsa> findByIdBolsaAndActivoTrue(Long idBolsa);

    /**
     * Busca solicitudes por estado de cita (activas)
     */
    List<SolicitudBolsa> findByEstadoGestionCitasIdAndActivoTrue(Long estadoId);

    /**
     * Obtiene todas las solicitudes activas ordenadas por fecha más reciente
     */
    List<SolicitudBolsa> findByActivoTrueOrderByFechaSolicitudDesc();

    /**
     * Obtiene solicitudes con descripción de bolsa via JOIN
     * Consulta SQL nativa para traer solicitudes enriquecidas con el tipo de bolsa
     */
    @Query(value = """
        SELECT sb.id_solicitud, sb.numero_solicitud, sb.paciente_id, sb.paciente_nombre,
               sb.paciente_dni, sb.especialidad, sb.fecha_preferida_no_atendida,
               sb.tipo_documento, sb.fecha_nacimiento, sb.paciente_sexo,
               sb.paciente_telefono, sb.paciente_email,
               sb.codigo_ipress, sb.tipo_cita,
               sb.id_bolsa, tb.desc_tipo_bolsa,
               sb.id_servicio, sb.codigo_adscripcion, sb.id_ipress,
               sb.estado, sb.fecha_solicitud, sb.fecha_actualizacion,
               sb.estado_gestion_citas_id, sb.activo,
               di.desc_ipress, dr.desc_red
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        WHERE sb.activo = true
        ORDER BY sb.fecha_solicitud DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithBolsaDescription();

    /**
     * Busca solicitud por DNI del paciente (activas)
     */
    List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);

    // ========================================================================
    // 🆕 v2.0.0: ESTADÍSTICAS - Métodos para dashboard y reportes
    // ========================================================================

    /**
     * 1️⃣ Estadísticas por estado de gestión de citas
     * Agrupa solicitudes activas por estado
     */
    @Query(value = """
        SELECT
            COALESCE(dgc.desc_estado_cita, 'SIN ESTADO') as estado,
            COUNT(sb.id_solicitud) as cantidad,
            ROUND(COUNT(sb.id_solicitud) * 100.0 /
                (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true), 2) as porcentaje
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
        GROUP BY dgc.desc_estado_cita, dgc.id_estado_cita
        ORDER BY cantidad DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorEstado();

    /**
     * 2️⃣ Estadísticas por especialidad
     * Incluye tasas de completación y tiempo promedio
     */
    @Query(value = """
        SELECT
            sb.especialidad,
            COUNT(sb.id_solicitud) as total,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_cancelacion,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true AND sb.especialidad IS NOT NULL
        GROUP BY sb.especialidad
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorEspecialidad();

    /**
     * 3️⃣ Estadísticas por IPRESS
     * Incluye ranking por volumen
     */
    @Query(value = """
        SELECT
            sb.codigo_ipress,
            di.desc_ipress as nombre_ipress,
            dr.desc_red as red_asistencial,
            COUNT(sb.id_solicitud) as total,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROW_NUMBER() OVER (ORDER BY COUNT(sb.id_solicitud) DESC) as ranking
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true AND sb.codigo_ipress IS NOT NULL
        GROUP BY sb.codigo_ipress, di.desc_ipress, dr.desc_red
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorIpress();

    /**
     * 4️⃣ Estadísticas por tipo de cita
     * Solo 3 tipos válidos: VOLUNTARIA, INTERCONSULTA, RECITA
     */
    @Query(value = """
        SELECT
            sb.tipo_cita,
            COUNT(sb.id_solicitud) as total,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            ROUND(
                COUNT(sb.id_solicitud) * 100.0 /
                (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true
                 AND tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA')), 2
            ) as porcentaje,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
          AND sb.tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA')
        GROUP BY sb.tipo_cita
        ORDER BY CASE
                   WHEN sb.tipo_cita = 'VOLUNTARIA' THEN 1
                   WHEN sb.tipo_cita = 'INTERCONSULTA' THEN 2
                   WHEN sb.tipo_cita = 'RECITA' THEN 3
                   ELSE 4
                 END
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorTipoCita();

    /**
     * 4️⃣ bis Estadísticas por tipo de bolsa
     * Agrupa solicitudes por tipo de bolsa con métricas
     */
    @Query(value = """
        SELECT
            tb.desc_tipo_bolsa as tipo_bolsa,
            COUNT(sb.id_solicitud) as total,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            ROUND(
                COUNT(sb.id_solicitud) * 100.0 /
                (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true), 2
            ) as porcentaje,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_cancelacion,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true AND sb.id_bolsa IS NOT NULL
        GROUP BY tb.desc_tipo_bolsa, tb.id_tipo_bolsa
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorTipoBolsa();

    /**
     * 5️⃣ Evolución temporal (últimos 30 días)
     * Para gráficos de línea
     */
    @Query(value = """
        SELECT
            DATE(sb.fecha_solicitud AT TIME ZONE 'America/Lima') as fecha,
            COUNT(sb.id_solicitud) as nuevas_solicitudes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as completadas,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            SUM(COUNT(sb.id_solicitud)) OVER (
                ORDER BY DATE(sb.fecha_solicitud AT TIME ZONE 'America/Lima')
            ) as cumulativo_total
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
            AND sb.fecha_solicitud >= NOW() AT TIME ZONE 'America/Lima' - INTERVAL '30 days'
        GROUP BY DATE(sb.fecha_solicitud AT TIME ZONE 'America/Lima')
        ORDER BY fecha DESC
        """, nativeQuery = true)
    List<Map<String, Object>> evolucionTemporal();

    /**
     * 6️⃣ KPIs generales - métricas clave de rendimiento
     */
    @Query(value = """
        SELECT
            COUNT(sb.id_solicitud) as total_solicitudes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as total_atendidas,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as total_pendientes,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) as total_canceladas,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'DERIVADO' THEN 1 END) as total_derivadas,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_abandono,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio_general,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE'
                AND sb.fecha_solicitud < NOW() AT TIME ZONE 'America/Lima' - INTERVAL '7 days'
                THEN 1 END) as pendientes_vencidas
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
        """, nativeQuery = true)
    Map<String, Object> obtenerKpis();

    /**
     * 7️⃣ Estadísticas del día actual (últimas 24 horas)
     */
    @Query(value = """
        SELECT
            COUNT(sb.id_solicitud) as solicitudes_hoy,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) as atendidas_hoy,
            COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes_hoy
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
            AND sb.fecha_solicitud >= NOW() AT TIME ZONE 'America/Lima' - INTERVAL '24 hours'
        """, nativeQuery = true)
    Map<String, Object> estadisticasDelDia();

}
