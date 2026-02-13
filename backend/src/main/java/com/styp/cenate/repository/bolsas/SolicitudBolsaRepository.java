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
     * Verifica si un número de solicitud ya existe (para validación PRE-save)
     */
    boolean existsByNumeroSolicitud(String numeroSolicitud);

    /**
     * Verifica si ya existe una solicitud duplicada
     * por la combinación única: bolsa + paciente
     */
    boolean existsByIdBolsaAndPacienteId(
        Long idBolsa,
        String pacienteId
    );

    /**
     * Verifica si ya existe una solicitud duplicada
     * por la combinación única: bolsa + paciente + servicio (constraint solicitud_paciente_unique)
     * ⚠️ DEPRECATED: Usa existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue() en su lugar
     * Esta versión detecta TODAS las solicitudes, incluso las soft-deleted
     */
    boolean existsByIdBolsaAndPacienteIdAndIdServicio(
        Long idBolsa,
        String pacienteId,
        Long idServicio
    );

    /**
     * Verifica si ya existe una solicitud ACTIVA duplicada
     * Filtrado por: bolsa + paciente + servicio + activo=true
     * ✅ CORRECCIÓN v1.18.4: Solo detecta registros activos, permite reusar pacientes de registros soft-deleted
     */
    boolean existsByIdBolsaAndPacienteIdAndIdServicioAndActivoTrue(
        Long idBolsa,
        String pacienteId,
        Long idServicio
    );

    /**
     * Verifica si ya existe una solicitud activa de un tipo de cita para un paciente
     * Usado en AtenderPacienteService para verificar Recitas duplicadas
     */
    boolean existsByPacienteDniAndTipoCitaAndActivoTrue(String pacienteDni, String tipoCita);

    /**
     * Verifica si ya existe una solicitud activa de un tipo de cita + especialidad para un paciente
     * Usado en AtenderPacienteService para verificar Interconsultas duplicadas
     */
    boolean existsByPacienteDniAndTipoCitaAndEspecialidadAndActivoTrue(
        String pacienteDni, String tipoCita, String especialidad);

    /**
     * Busca solicitudes por la combinación: bolsa + paciente + servicio
     * Usado en manejo de duplicados y updates
     */
    List<SolicitudBolsa> findByIdBolsaAndPacienteIdAndIdServicio(
        Long idBolsa,
        String pacienteId,
        Long idServicio
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
     * Consulta SQL nativa para traer solicitudes enriquecidas con el tipo de bolsa + asignación de gestora
     * v2.4.0: Incluye campos de asignación de gestora (responsable_gestora_id, fecha_asignacion)
     *
     * Campo order: (0-27) = originales, (28) responsable_gestora_id, (29) fecha_asignacion
     */
    @Query(value = """
        SELECT sb.id_solicitud, sb.numero_solicitud, sb.paciente_id, sb.paciente_nombre,
               sb.paciente_dni, sb.especialidad, sb.fecha_preferida_no_atendida,
               sb.tipo_documento, sb.fecha_nacimiento, sb.paciente_sexo,
               sb.paciente_telefono, sb.paciente_telefono_alterno,
               sb.paciente_email,
               sb.codigo_ipress, sb.tipo_cita,
               sb.id_bolsa, tb.desc_tipo_bolsa,
               sb.id_servicio, sb.codigo_adscripcion, sb.id_ipress,
               sb.estado, COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') as cod_estado_cita,
               COALESCE(deg.desc_estado_cita, 'Paciente nuevo que ingresó a la bolsa') as desc_estado_cita,
               sb.fecha_solicitud, sb.fecha_actualizacion,
               sb.estado_gestion_citas_id, sb.activo,
               di.desc_ipress, dr.desc_red, dm.desc_macro,
               sb.responsable_gestora_id, sb.fecha_asignacion,
               sb.fecha_atencion, sb.hora_atencion, sb.id_personal,
               sb.condicion_medica, sb.fecha_atencion_medica,
               COALESCE(CONCAT(med.nom_pers, ' ', med.ape_pater_pers, ' ', med.ape_mater_pers), '') as nombre_medico
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
        LEFT JOIN dim_estados_gestion_citas deg ON sb.estado_gestion_citas_id = deg.id_estado_cita
        LEFT JOIN dim_personal_cnt med ON sb.id_personal = med.id_pers
        WHERE sb.activo = true
        ORDER BY CASE WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'PENDIENTE_CITA' THEN 0
                      WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'CITADO' THEN 1
                      ELSE 2 END, sb.fecha_solicitud DESC
        """, nativeQuery = true)
    List<Object[]> findAllWithBolsaDescription();

    /**
     * Obtiene solicitudes con descripción de bolsa via JOIN con PAGINACIÓN (v2.5.1)
     * Similar a findAllWithBolsaDescription() pero con LIMIT y OFFSET para paginación
     * @param pageable información de paginación
     * @return lista paginada de Object[]
     */
    @Query(value = """
        SELECT sb.id_solicitud, sb.numero_solicitud, sb.paciente_id, sb.paciente_nombre,
               sb.paciente_dni, sb.especialidad, sb.fecha_preferida_no_atendida,
               sb.tipo_documento, sb.fecha_nacimiento, sb.paciente_sexo,
               sb.paciente_telefono, sb.paciente_telefono_alterno,
               sb.paciente_email,
               sb.codigo_ipress, sb.tipo_cita,
               sb.id_bolsa, tb.desc_tipo_bolsa,
               sb.id_servicio, sb.codigo_adscripcion, sb.id_ipress,
               sb.estado, COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') as cod_estado_cita,
               COALESCE(deg.desc_estado_cita, 'Paciente nuevo que ingresó a la bolsa') as desc_estado_cita,
               sb.fecha_solicitud, sb.fecha_actualizacion,
               sb.estado_gestion_citas_id, sb.activo,
               di.desc_ipress, dr.desc_red, dm.desc_macro,
               sb.responsable_gestora_id, sb.fecha_asignacion,
               sb.fecha_cambio_estado, sb.usuario_cambio_estado_id,
               COALESCE(CONCAT(pc.nom_pers, ' ', pc.ape_pater_pers, ' ', pc.ape_mater_pers), u.name_user, 'Sin asignar') as nombre_usuario_cambio_estado,
               sb.fecha_atencion, sb.hora_atencion, sb.id_personal,
               sb.condicion_medica, sb.fecha_atencion_medica,
               COALESCE(CONCAT(med.nom_pers, ' ', med.ape_pater_pers, ' ', med.ape_mater_pers), '') as nombre_medico
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
        LEFT JOIN dim_estados_gestion_citas deg ON sb.estado_gestion_citas_id = deg.id_estado_cita
        LEFT JOIN dim_usuarios u ON sb.usuario_cambio_estado_id = u.id_user
        LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
        LEFT JOIN dim_personal_cnt med ON sb.id_personal = med.id_pers
        WHERE sb.activo = true
        ORDER BY CASE WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'PENDIENTE_CITA' THEN 0
                      WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'CITADO' THEN 1
                      ELSE 2 END, sb.fecha_solicitud DESC
        LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}
        """, nativeQuery = true)
    List<Object[]> findAllWithBolsaDescriptionPaginado(org.springframework.data.domain.Pageable pageable);

    /**
     * Obtiene solicitudes paginadas CON FILTROS avanzados (v2.6.0)
     * Soporta filtrado por: bolsa, macrorregión, red, IPRESS, especialidad, estado, tipo de cita, búsqueda
     * Pensado para UX: filtrado server-side + paginación integrada
     *
     * @param idBolsa ID de la bolsa (null = todas)
     * @param macrorregion descripción de macrorregión (null = todas)
     * @param red descripción de red (null = todas)
     * @param ipress descripción de IPRESS (null = todas)
     * @param especialidad especialidad (null = todas)
     * @param estadoId ID estado gestión citas (null = todos)
     * @param tipoCita tipo de cita (null = todos)
     * @param busqueda búsqueda por DNI solamente (null = ignorar)
     * @param pageable paginación
     * @return lista paginada de solicitudes enriquecidas
     */
    @Query(value = """
        SELECT sb.id_solicitud, sb.numero_solicitud, sb.paciente_id, sb.paciente_nombre,
               sb.paciente_dni, sb.especialidad, sb.fecha_preferida_no_atendida,
               sb.tipo_documento, sb.fecha_nacimiento, sb.paciente_sexo,
               sb.paciente_telefono, sb.paciente_telefono_alterno,
               sb.paciente_email,
               sb.codigo_ipress, sb.tipo_cita,
               sb.id_bolsa, tb.desc_tipo_bolsa,
               sb.id_servicio, sb.codigo_adscripcion, sb.id_ipress,
               sb.estado, COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') as cod_estado_cita,
               COALESCE(deg.desc_estado_cita, 'Paciente nuevo que ingresó a la bolsa') as desc_estado_cita,
               sb.fecha_solicitud, sb.fecha_actualizacion,
               sb.estado_gestion_citas_id, sb.activo,
               di.desc_ipress, dr.desc_red, dm.desc_macro,
               sb.responsable_gestora_id, sb.fecha_asignacion,
               sb.fecha_cambio_estado, sb.usuario_cambio_estado_id,
               COALESCE(CONCAT(pc.nom_pers, ' ', pc.ape_pater_pers, ' ', pc.ape_mater_pers), u.name_user, 'Sin asignar') as nombre_usuario_cambio_estado,
               sb.fecha_atencion, sb.hora_atencion, sb.id_personal,
               sb.condicion_medica, sb.fecha_atencion_medica,
               COALESCE(CONCAT(med.nom_pers, ' ', med.ape_pater_pers, ' ', med.ape_mater_pers), '') as nombre_medico
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
        LEFT JOIN dim_estados_gestion_citas deg ON sb.estado_gestion_citas_id = deg.id_estado_cita
        LEFT JOIN dim_usuarios u ON sb.usuario_cambio_estado_id = u.id_user
        LEFT JOIN dim_personal_cnt pc ON u.id_user = pc.id_usuario
        LEFT JOIN dim_personal_cnt med ON sb.id_personal = med.id_pers
        WHERE sb.activo = true
          AND (:bolsaNombre IS NULL OR LOWER(COALESCE(tb.desc_tipo_bolsa, '')) LIKE LOWER(CONCAT('%', :bolsaNombre, '%')))
          AND (:macrorregion IS NULL OR dm.desc_macro = :macrorregion)
          AND (:red IS NULL OR dr.desc_red = :red)
          AND (:ipress IS NULL OR di.desc_ipress = :ipress)
          AND (:especialidad IS NULL OR LOWER(COALESCE(sb.especialidad, '')) LIKE LOWER(CONCAT('%', :especialidad, '%')))
          AND (:estadoCodigo IS NULL OR UPPER(COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA')) = UPPER(:estadoCodigo))
          AND (:tipoCita IS NULL OR UPPER(COALESCE(sb.tipo_cita, 'N/A')) = UPPER(:tipoCita))
          AND (CASE
               WHEN :asignacion IS NULL THEN 1=1
               WHEN :asignacion = 'asignados' THEN sb.responsable_gestora_id IS NOT NULL
               WHEN :asignacion = 'sin_asignar' THEN sb.responsable_gestora_id IS NULL
               ELSE 1=0
               END)
          AND (:busqueda IS NULL OR COALESCE(sb.paciente_dni, '') LIKE CONCAT('%', :busqueda, '%'))
          AND (:fechaInicio IS NULL OR DATE(sb.fecha_solicitud) >= DATE(:fechaInicio))
          AND (:fechaFin IS NULL OR DATE(sb.fecha_solicitud) <= DATE(:fechaFin))
        ORDER BY CASE WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'PENDIENTE_CITA' THEN 0
                      WHEN COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA') = 'CITADO' THEN 1
                      ELSE 2 END, sb.fecha_solicitud DESC
        LIMIT :#{#pageable.pageSize} OFFSET :#{#pageable.offset}
        """, nativeQuery = true)
    List<Object[]> findAllWithFiltersAndPagination(
            @org.springframework.data.repository.query.Param("bolsaNombre") String bolsaNombre,
            @org.springframework.data.repository.query.Param("macrorregion") String macrorregion,
            @org.springframework.data.repository.query.Param("red") String red,
            @org.springframework.data.repository.query.Param("ipress") String ipress,
            @org.springframework.data.repository.query.Param("especialidad") String especialidad,
            @org.springframework.data.repository.query.Param("estadoCodigo") String estadoCodigo,
            @org.springframework.data.repository.query.Param("tipoCita") String tipoCita,
            @org.springframework.data.repository.query.Param("asignacion") String asignacion,
            @org.springframework.data.repository.query.Param("busqueda") String busqueda,
            @org.springframework.data.repository.query.Param("fechaInicio") String fechaInicio,  // ✅ v1.66.0: Filtro rango fechas
            @org.springframework.data.repository.query.Param("fechaFin") String fechaFin,        // ✅ v1.66.0: Filtro rango fechas
            org.springframework.data.domain.Pageable pageable);

    /**
     * Cuenta solicitudes con filtros aplicados (v2.6.0 + v1.42.0: asignación)
     * ✅ v1.54.4: Fixed estado filter to use deg.cod_estado_cita instead of sb.estado
     * Se usa para calcular el total de páginas en filtrado
     */
    @Query(value = """
        SELECT COUNT(*)
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_tipos_bolsas tb ON sb.id_bolsa = tb.id_tipo_bolsa
        LEFT JOIN dim_ipress di ON sb.id_ipress = di.id_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
        LEFT JOIN dim_estados_gestion_citas deg ON sb.estado_gestion_citas_id = deg.id_estado_cita
        WHERE sb.activo = true
          AND (:bolsaNombre IS NULL OR LOWER(COALESCE(tb.desc_tipo_bolsa, '')) LIKE LOWER(CONCAT('%', :bolsaNombre, '%')))
          AND (:macrorregion IS NULL OR dm.desc_macro = :macrorregion)
          AND (:red IS NULL OR dr.desc_red = :red)
          AND (:ipress IS NULL OR di.desc_ipress = :ipress)
          AND (:especialidad IS NULL OR LOWER(COALESCE(sb.especialidad, '')) LIKE LOWER(CONCAT('%', :especialidad, '%')))
          AND (:estadoCodigo IS NULL OR UPPER(COALESCE(deg.cod_estado_cita, 'PENDIENTE_CITA')) = UPPER(:estadoCodigo))
          AND (:tipoCita IS NULL OR UPPER(COALESCE(sb.tipo_cita, 'N/A')) = UPPER(:tipoCita))
          AND (CASE
               WHEN :asignacion IS NULL THEN 1=1
               WHEN :asignacion = 'asignados' THEN sb.responsable_gestora_id IS NOT NULL
               WHEN :asignacion = 'sin_asignar' THEN sb.responsable_gestora_id IS NULL
               ELSE 1=0
               END)
          AND (:busqueda IS NULL OR COALESCE(sb.paciente_dni, '') LIKE CONCAT('%', :busqueda, '%'))
          AND (:fechaInicio IS NULL OR DATE(sb.fecha_solicitud) >= DATE(:fechaInicio))
          AND (:fechaFin IS NULL OR DATE(sb.fecha_solicitud) <= DATE(:fechaFin))
        """, nativeQuery = true)
    long countWithFilters(
            @org.springframework.data.repository.query.Param("bolsaNombre") String bolsaNombre,
            @org.springframework.data.repository.query.Param("macrorregion") String macrorregion,
            @org.springframework.data.repository.query.Param("red") String red,
            @org.springframework.data.repository.query.Param("ipress") String ipress,
            @org.springframework.data.repository.query.Param("especialidad") String especialidad,
            @org.springframework.data.repository.query.Param("estadoCodigo") String estadoCodigo,
            @org.springframework.data.repository.query.Param("tipoCita") String tipoCita,
            @org.springframework.data.repository.query.Param("asignacion") String asignacion,
            @org.springframework.data.repository.query.Param("busqueda") String busqueda,
            @org.springframework.data.repository.query.Param("fechaInicio") String fechaInicio,  // ✅ v1.66.0: Filtro rango fechas
            @org.springframework.data.repository.query.Param("fechaFin") String fechaFin)        // ✅ v1.66.0: Filtro rango fechas
            ;

    /**
     * Cuenta total de solicitudes activas (para calcular páginas totales)
     * Usa índice idx_solicitud_activo para optimización
     */
    long countByActivoTrue();

    /**
     * Cuenta solicitudes activas usando native SQL (optimizado con índice)
     * v2.5.1: Para uso en paginación, usa el índice idx_solicitud_activo
     */
    @Query(value = "SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true", nativeQuery = true)
    long countActivosNative();

    /**
     * Busca solicitud por DNI del paciente (activas)
     */
    List<SolicitudBolsa> findByPacienteDniAndActivoTrue(String pacienteDni);

    /**
     * Obtiene solicitudes asignadas a una gestora específica (Mi Bandeja)
     * Filtra por responsable_gestora_id y activas
     * Usado en endpoint /mi-bandeja para gestoras
     *
     * @param gestoraId ID del usuario gestor_de_citas
     * @return lista de solicitudes asignadas a esa gestora (activas)
     */
    List<SolicitudBolsa> findByResponsableGestoraIdAndActivoTrue(Long gestoraId);

    // ========================================================================
    // 🆕 v2.0.0: ESTADÍSTICAS - Métodos para dashboard y reportes
    // ========================================================================

    /**
     * 1️⃣ Estadísticas por estado de gestión de citas
     * ✅ v1.54.4: Usa cod_estado_cita (códigos como 'CITADO', 'PENDIENTE_CITA')
     * en lugar de desc_estado_cita (descripciones largas)
     * Agrupa solicitudes activas por estado
     */
    @Query(value = """
        SELECT
            COALESCE(dgc.cod_estado_cita, 'PENDIENTE_CITA') as estado,
            COUNT(sb.id_solicitud) as cantidad,
            ROUND(COUNT(sb.id_solicitud) * 100.0 /
                (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true), 2) as porcentaje
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
        GROUP BY dgc.cod_estado_cita, dgc.id_estado_cita
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
     * Tipos válidos: VOLUNTARIA, INTERCONSULTA, RECITA, REFERENCIA
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
                 AND tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA', 'REFERENCIA')), 2
            ) as porcentaje,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE sb.activo = true
          AND sb.tipo_cita IN ('VOLUNTARIA', 'INTERCONSULTA', 'RECITA', 'REFERENCIA')
        GROUP BY sb.tipo_cita
        ORDER BY CASE
                   WHEN sb.tipo_cita = 'VOLUNTARIA' THEN 1
                   WHEN sb.tipo_cita = 'INTERCONSULTA' THEN 2
                   WHEN sb.tipo_cita = 'RECITA' THEN 3
                   WHEN sb.tipo_cita = 'REFERENCIA' THEN 4
                   ELSE 5
                 END
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorTipoCita();

    /**
     * 4️⃣ bis Estadísticas por tipo de bolsa
     * Agrupa solicitudes por tipo de bolsa con métricas
     * Muestra TODAS las bolsas del catálogo (incluso sin solicitudes)
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
                NULLIF((SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE activo = true), 0), 2
            ) as porcentaje,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN dgc.desc_estado_cita = 'CANCELADO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_cancelacion,
            COALESCE(CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER), 0) as horas_promedio
        FROM dim_tipos_bolsas tb
        LEFT JOIN dim_solicitud_bolsa sb ON tb.id_tipo_bolsa = sb.id_bolsa AND sb.activo = true
        LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
        WHERE tb.stat_tipo_bolsa = 'A'
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
     * ✅ v1.54.4: Fixed estado descriptions to match actual database values:
     *    - 'ATENDIDO_IPRESS' (not 'ATENDIDO')
     *    - 'PENDIENTE_CITA' (not 'PENDIENTE')
     *    - 'CITADO' for "citados" metric
     *    Removed non-existent states: 'CANCELADO', 'DERIVADO'
     */
    @Query(value = """
        SELECT
            COUNT(sb.id_solicitud) as total_solicitudes,
            COUNT(CASE WHEN dgc.cod_estado_cita = 'ATENDIDO_IPRESS' THEN 1 END) as total_atendidas,
            COUNT(CASE WHEN dgc.cod_estado_cita = 'PENDIENTE_CITA' THEN 1 END) as total_pendientes,
            COUNT(CASE WHEN dgc.cod_estado_cita = 'CITADO' THEN 1 END) as total_citados,
            0 as total_canceladas,
            0 as total_derivadas,
            ROUND(
                COUNT(CASE WHEN dgc.cod_estado_cita = 'ATENDIDO_IPRESS' THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN dgc.cod_estado_cita IN ('SIN_VIGENCIA', 'NO_DESEA', 'NO_CONTESTA') THEN 1 END) * 100.0 /
                NULLIF(COUNT(sb.id_solicitud), 0), 2
            ) as tasa_abandono,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio_general,
            COUNT(CASE WHEN dgc.cod_estado_cita = 'PENDIENTE_CITA'
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

    // ========================================================================
    // 🦟 v1.0.0 (2026-01-29): MÉTODOS ESPECÍFICOS PARA MÓDULO DENGUE
    // ========================================================================

    /**
     * Lista todos los casos dengue con paginación
     * Filtra por: id_bolsa = 2 (BOLSA_DENGUE) Y dx_main IS NOT NULL
     *
     * @param pageable Información de paginación
     * @return Page<SolicitudBolsa> ordenada por fecha_solicitud DESC
     */
    @Query("""
        SELECT s FROM SolicitudBolsa s
        WHERE s.idBolsa = 2 AND s.dxMain IS NOT NULL AND s.activo = true
        ORDER BY s.fechaSolicitud DESC
        """)
    org.springframework.data.domain.Page<SolicitudBolsa> findAllDengueCasos(
        org.springframework.data.domain.Pageable pageable
    );

    /**
     * Busca casos dengue con filtros opcionales
     * Filtros: dni (búsqueda parcial) Y/O dxMain (búsqueda exacta)
     *
     * @param dni DNI para búsqueda LIKE (opcional)
     * @param dxMain Código CIE-10 para búsqueda exacta (opcional)
     * @param pageable Información de paginación
     * @return Page<SolicitudBolsa> con casos que coinciden
     */
    @Query("""
        SELECT s FROM SolicitudBolsa s
        WHERE s.idBolsa = 2 AND s.dxMain IS NOT NULL AND s.activo = true
        AND (:dni IS NULL OR s.pacienteDni LIKE CONCAT('%', :dni, '%'))
        AND (:dxMain IS NULL OR s.dxMain = :dxMain)
        ORDER BY s.fechaSolicitud DESC
        """)
    org.springframework.data.domain.Page<SolicitudBolsa> buscarDengueCasos(
        @org.springframework.data.repository.query.Param("dni") String dni,
        @org.springframework.data.repository.query.Param("dxMain") String dxMain,
        org.springframework.data.domain.Pageable pageable
    );

    // ========================================================================
    // 📋 v3.0.0 (2026-01-29): MÉTODOS ESPECÍFICOS PARA MÓDULO 107
    // Migración: Todas las solicitudes del Módulo 107 ahora usan dim_solicitud_bolsa
    // con id_bolsa = 107
    // ========================================================================

    /**
     * 1️⃣ Lista todos los casos del Módulo 107 con paginación
     * Filtra por: id_bolsa = 107 Y activo = true
     *
     * @param pageable Información de paginación (page, size, sort)
     * @return Page<SolicitudBolsa> ordenada por fecha_solicitud DESC
     */
    @Query("""
        SELECT s FROM SolicitudBolsa s
        WHERE s.idBolsa = 107 AND s.activo = true
        ORDER BY s.fechaSolicitud DESC
        """)
    org.springframework.data.domain.Page<SolicitudBolsa> findAllModulo107Casos(
        org.springframework.data.domain.Pageable pageable
    );

    /**
     * 2️⃣ Busca casos del Módulo 107 con filtros avanzados
     * Filtros opcionales: dni, nombre, codigoIpress, estadoId, fechaDesde, fechaHasta
     *
     * @param dni DNI para búsqueda parcial (LIKE)
     * @param nombre Nombre para búsqueda parcial (LIKE, case-insensitive)
     * @param codigoIpress Código de IPRESS para búsqueda exacta
     * @param estadoGestionCitasId ID del estado para filtro exacto
     * @param fechaDesde Fecha inicio (para rango de fechas)
     * @param fechaHasta Fecha fin (para rango de fechas)
     * @param pageable Información de paginación
     * @return Page<SolicitudBolsa> con casos que coinciden con los filtros
     */
    @Query("""
        SELECT s FROM SolicitudBolsa s
        WHERE s.idBolsa = 107 AND s.activo = true
        AND COALESCE(:dni, '') = '' OR s.pacienteDni LIKE CONCAT('%', :dni, '%')
        AND COALESCE(:nombre, '') = '' OR LOWER(s.pacienteNombre) LIKE LOWER(CONCAT('%', :nombre, '%'))
        AND COALESCE(:codigoIpress, '') = '' OR s.codigoAdscripcion = :codigoIpress
        AND :estadoId IS NULL OR s.estadoGestionCitasId = :estadoId
        AND :fechaDesde IS NULL OR s.fechaSolicitud >= :fechaDesde
        AND :fechaHasta IS NULL OR s.fechaSolicitud <= :fechaHasta
        ORDER BY s.fechaSolicitud DESC
        """)
    org.springframework.data.domain.Page<SolicitudBolsa> buscarModulo107Casos(
        @org.springframework.data.repository.query.Param("dni") String dni,
        @org.springframework.data.repository.query.Param("nombre") String nombre,
        @org.springframework.data.repository.query.Param("codigoIpress") String codigoIpress,
        @org.springframework.data.repository.query.Param("estadoId") Long estadoGestionCitasId,
        @org.springframework.data.repository.query.Param("fechaDesde") java.time.OffsetDateTime fechaDesde,
        @org.springframework.data.repository.query.Param("fechaHasta") java.time.OffsetDateTime fechaHasta,
        org.springframework.data.domain.Pageable pageable
    );

    /**
     * 3️⃣ Estadísticas por especialidad (derivación interna)
     * Agrupa casos del Módulo 107 por especialidad y calcula métricas
     *
     * @return List<Map> con campos: especialidad, total, atendidos, pendientes, cancelados, tasa_completacion
     */
    @Query(value = """
        SELECT
            s.especialidad,
            COUNT(s.id_solicitud) as total,
            COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN d.cod_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN d.cod_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            ROUND(
                COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(s.id_solicitud), 0), 2
            ) as tasa_completacion
        FROM dim_solicitud_bolsa s
        LEFT JOIN dim_estados_gestion_citas d ON s.estado_gestion_citas_id = d.id_estado_cita
        WHERE s.id_bolsa = 107 AND s.activo = true
        GROUP BY s.especialidad
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasModulo107PorEspecialidad();

    /**
     * 4️⃣ Estadísticas por estado de gestión de citas
     * Agrupa casos del Módulo 107 por estado y calcula métricas
     *
     * @return List<Map> con campos: estado, descripcion, total, porcentaje, horas_promedio
     */
    @Query(value = """
        SELECT
            d.cod_estado_cita as estado,
            d.desc_estado_cita as descripcion,
            COUNT(s.id_solicitud) as total,
            ROUND(
                COUNT(s.id_solicitud) * 100.0 /
                (SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 107 AND activo = true),
                2
            ) as porcentaje,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (s.fecha_actualizacion - s.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio
        FROM dim_solicitud_bolsa s
        LEFT JOIN dim_estados_gestion_citas d ON s.estado_gestion_citas_id = d.id_estado_cita
        WHERE s.id_bolsa = 107 AND s.activo = true
        GROUP BY d.cod_estado_cita, d.desc_estado_cita
        ORDER BY total DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasModulo107PorEstado();

    /**
     * 5️⃣ Estadísticas por IPRESS
     * Agrupa casos del Módulo 107 por código IPRESS (top 10)
     *
     * @return List<Map> con campos: codigo_ipress, total, atendidos, pendientes, tasa_completacion
     */
    @Query(value = """
        SELECT
            s.codigo_adscripcion as codigo_ipress,
            COUNT(s.id_solicitud) as total,
            COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN d.cod_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            ROUND(
                COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(s.id_solicitud), 0), 2
            ) as tasa_completacion
        FROM dim_solicitud_bolsa s
        LEFT JOIN dim_estados_gestion_citas d ON s.estado_gestion_citas_id = d.id_estado_cita
        WHERE s.id_bolsa = 107 AND s.activo = true
        GROUP BY s.codigo_adscripcion
        ORDER BY total DESC
        LIMIT 10
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasModulo107PorIpress();

    /**
     * 6️⃣ KPIs generales del Módulo 107
     * Calcula métricas clave de rendimiento
     *
     * @return Map con campos: total_pacientes, atendidos, pendientes, cancelados,
     *                        tasa_completacion, tasa_abandono, horas_promedio, pendientes_vencidas
     */
    @Query(value = """
        SELECT
            COUNT(s.id_solicitud) as total_pacientes,
            COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) as atendidos,
            COUNT(CASE WHEN d.cod_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN d.cod_estado_cita = 'CANCELADO' THEN 1 END) as cancelados,
            ROUND(
                COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(s.id_solicitud), 0), 2
            ) as tasa_completacion,
            ROUND(
                COUNT(CASE WHEN d.cod_estado_cita = 'CANCELADO' THEN 1 END) * 100.0 /
                NULLIF(COUNT(s.id_solicitud), 0), 2
            ) as tasa_abandono,
            CAST(ROUND(
                AVG(EXTRACT(EPOCH FROM (s.fecha_actualizacion - s.fecha_solicitud)) / 3600),
                2
            ) AS INTEGER) as horas_promedio,
            COUNT(CASE WHEN d.cod_estado_cita = 'PENDIENTE'
                AND s.fecha_solicitud < NOW() AT TIME ZONE 'America/Lima' - INTERVAL '7 days'
                THEN 1 END) as pendientes_vencidas
        FROM dim_solicitud_bolsa s
        LEFT JOIN dim_estados_gestion_citas d ON s.estado_gestion_citas_id = d.id_estado_cita
        WHERE s.id_bolsa = 107 AND s.activo = true
        """, nativeQuery = true)
    Map<String, Object> kpisModulo107();

    /**
     * 7️⃣ Evolución temporal de solicitudes del Módulo 107
     * Agrupa por día los últimos 30 días para gráficos de tendencia
     *
     * @return List<Map> con campos: fecha, total, atendidas, pendientes, canceladas
     */
    @Query(value = """
        SELECT
            DATE(s.fecha_solicitud AT TIME ZONE 'America/Lima') as fecha,
            COUNT(s.id_solicitud) as total,
            COUNT(CASE WHEN d.cod_estado_cita = 'ATENDIDO' THEN 1 END) as atendidas,
            COUNT(CASE WHEN d.cod_estado_cita = 'PENDIENTE' THEN 1 END) as pendientes,
            COUNT(CASE WHEN d.cod_estado_cita = 'CANCELADO' THEN 1 END) as canceladas
        FROM dim_solicitud_bolsa s
        LEFT JOIN dim_estados_gestion_citas d ON s.estado_gestion_citas_id = d.id_estado_cita
        WHERE s.id_bolsa = 107 AND s.activo = true
            AND s.fecha_solicitud >= NOW() AT TIME ZONE 'America/Lima' - INTERVAL '30 days'
        GROUP BY DATE(s.fecha_solicitud AT TIME ZONE 'America/Lima')
        ORDER BY fecha ASC
        """, nativeQuery = true)
    List<Map<String, Object>> evolucionTemporalModulo107();

    // ========================================================================
    // 🆕 v3.0.0: ESTADÍSTICAS POR MACRORREGIÓN y RED (para filtros consolidados)
    // ========================================================================

    /**
     * Estadísticas agrupadas por macrorregión
     * Para el dropdown de Macrorregión en la página de Solicitudes
     * v3.0.0: Corregida para usar JOINs correctos a dim_macroregion
     */
    @Query(value = """
        SELECT
            COALESCE(dm.desc_macro, 'Sin asignar') as macrorregion,
            COUNT(sb.id_solicitud) as cantidad
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
        WHERE sb.activo = true
        GROUP BY dm.desc_macro
        ORDER BY cantidad DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorMacrorregion();

    /**
     * Estadísticas agrupadas por red asistencial
     * Para el dropdown de Redes en la página de Solicitudes
     * v3.0.0: Corregida para usar JOINs correctos a dim_red
     */
    @Query(value = """
        SELECT
            COALESCE(dr.desc_red, 'Sin asignar') as red,
            COUNT(sb.id_solicitud) as cantidad
        FROM dim_solicitud_bolsa sb
        LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
        LEFT JOIN dim_red dr ON di.id_red = dr.id_red
        WHERE sb.activo = true
        GROUP BY dr.desc_red
        ORDER BY cantidad DESC
        """, nativeQuery = true)
    List<Map<String, Object>> estadisticasPorRed();

    /**
     * 📊 Cuenta solicitudes que YA han sido asignadas a una gestora de citas
     * v1.41.0: Nueva métrica para tarjeta "Casos Asignados" en dashboard
     * Filtra por: responsable_gestora_id IS NOT NULL AND activo = true
     */
    @Query(value = """
        SELECT COUNT(sb.id_solicitud) as casos_asignados
        FROM dim_solicitud_bolsa sb
        WHERE sb.activo = true
            AND sb.responsable_gestora_id IS NOT NULL
        """, nativeQuery = true)
    Long contarCasosAsignados();

    /**
     * 🔎 Obtiene todas las especialidades únicas (no vacías) de la tabla
     * v1.42.0: Filtro dinámico de especialidades
     * Retorna SOLO especialidades pobladas para evitar duplicados "S/E"
     */
    @Query(value = """
        SELECT DISTINCT sb.especialidad
        FROM dim_solicitud_bolsa sb
        WHERE sb.activo = true
            AND sb.especialidad IS NOT NULL
            AND sb.especialidad != ''
        ORDER BY sb.especialidad ASC
        """, nativeQuery = true)
    List<String> obtenerEspecialidadesUnicas();

    /**
     * 🆕 v1.45.0: Busca solicitudes asignadas a un médico (idPersonal)
     * Usado en obtenerPacientesDelMedicoActual() para recuperar pacientes asignados
     * Filtra por: id_personal = idPersonal Y activo = true
     *
     * @param idPersonal ID del personal médico (doctor)
     * @return lista de solicitudes activas asignadas al médico
     */
    List<SolicitudBolsa> findByIdPersonalAndActivoTrue(Long idPersonal);

    /**
     * 🔧 v1.78.1: Obtener TODOS los pacientes asignados a un médico (sin filtro activo)
     * Usado por MisPacientes para mostrar tanto pacientes activos como inactivos/completados
     *
     * @param idPersonal ID del personal médico (doctor)
     * @return lista de TODAS las solicitudes asignadas al médico
     */
    @Query("SELECT s FROM SolicitudBolsa s WHERE s.idPersonal = :idPersonal")
    List<SolicitudBolsa> findByIdPersonal(@org.springframework.data.repository.query.Param("idPersonal") Long idPersonal);

    /**
     * ⭐ v1.62.0: Contar pacientes pendientes de un médico específico
     * Optimizado para notificaciones: usa COUNT(*) sin cargar datos
     * Filtra por: id_personal = idPersonal Y condicion_medica = 'Pendiente' Y activo = true
     *
     * @param idPersonal ID del personal médico (doctor)
     * @return cantidad de pacientes con estado "Pendiente"
     */
    @Query("SELECT COUNT(s) FROM SolicitudBolsa s WHERE " +
           "s.idPersonal = :idPersonal AND " +
           "s.condicionMedica = 'Pendiente' AND " +
           "s.activo = true")
    long countByIdPersonalAndCondicionPendiente(@org.springframework.data.repository.query.Param("idPersonal") Long idPersonal);

    /**
     * 🆕 v1.46.0: Buscar solicitudes por DNI de paciente
     * Usado para validar duplicados al importar pacientes adicionales
     * Retorna TODAS las solicitudes (sin filtro de activo)
     *
     * @param pacienteDni DNI del paciente
     * @return lista de solicitudes para ese DNI
     */
    List<SolicitudBolsa> findByPacienteDni(String pacienteDni);

    /**
     * 🆕 v1.46.0: Contar solicitudes entre dos fechas
     * Usado para generar número de solicitud único (IMP-YYYYMMDD-NNNN)
     * Valida que no haya duplicados del mismo día
     *
     * @param inicio fecha inicio del rango
     * @param fin fecha fin del rango
     * @return cantidad de solicitudes en ese rango
     */
    @Query(value = """
        SELECT COUNT(*) FROM dim_solicitud_bolsa
        WHERE fecha_solicitud BETWEEN :inicio AND :fin
        """, nativeQuery = true)
    long countByFechaSolicitudBetween(
        @org.springframework.data.repository.query.Param("inicio") java.time.LocalDateTime inicio,
        @org.springframework.data.repository.query.Param("fin") java.time.LocalDateTime fin
    );

    // ============================================================================
    // 🏥 v1.63.0: Coordinador Médico - Dashboard de Supervisión
    // ============================================================================

    /**
     * Obtener estadísticas de médicos de un área específica
     * Agrupa por médico: total, atendidos, pendientes, deserciones
     * @param areaTrabajo área de trabajo (ej: TELEURGENCIAS_TELETRIAJE)
     * @param fechaDesde fecha inicio (NULL = sin filtro)
     * @param fechaHasta fecha fin (NULL = sin filtro)
     * @return lista de estadísticas por médico
     */
    @Query(value = """
        SELECT
            p.id_pers as idPers,
            CONCAT(p.nom_pers, ' ', p.ape_pater_pers, ' ', p.ape_mater_pers) as nombreMedico,
            p.email_pers as email,
            COUNT(sb.id_solicitud) as totalAsignados,
            COUNT(CASE WHEN sb.condicion_medica = 'Atendido' THEN 1 END) as totalAtendidos,
            COUNT(CASE WHEN sb.condicion_medica = 'Pendiente' THEN 1 END) as totalPendientes,
            COUNT(CASE WHEN sb.condicion_medica = 'Deserción' THEN 1 END) as totalDeserciones,
            COUNT(CASE WHEN sb.es_cronico = true THEN 1 END) as totalCronicos,
            COUNT(CASE WHEN sb.tiene_recita = true THEN 1 END) as totalRecitas,
            COUNT(CASE WHEN sb.tiene_interconsulta = true THEN 1 END) as totalInterconsultas,
            ROUND(AVG(EXTRACT(EPOCH FROM (sb.fecha_atencion_medica - sb.fecha_asignacion)) / 3600), 2) as horasPromedioAtencion,
            ROUND(COUNT(CASE WHEN sb.condicion_medica = 'Atendido' THEN 1 END) * 100.0 /
                  NULLIF(COUNT(sb.id_solicitud), 0), 2) as porcentajeAtencion,
            ROUND(COUNT(CASE WHEN sb.condicion_medica = 'Deserción' THEN 1 END) * 100.0 /
                  NULLIF(COUNT(sb.id_solicitud), 0), 2) as tasaDesercion
        FROM dim_personal_cnt p
        LEFT JOIN dim_solicitud_bolsa sb ON p.id_pers = sb.id_personal AND sb.activo = true
        WHERE p.area_trabajo = :areaTrabajo
          AND p.stat_pers = 'A'
          AND (:fechaDesde IS NULL OR sb.fecha_asignacion >= :fechaDesde)
          AND (:fechaHasta IS NULL OR sb.fecha_asignacion <= :fechaHasta)
        GROUP BY p.id_pers, p.nom_pers, p.ape_pater_pers, p.ape_mater_pers, p.email_pers
        ORDER BY totalAsignados DESC
        """, nativeQuery = true)
    List<Map<String, Object>> obtenerEstadisticasMedicosPorArea(
        @org.springframework.data.repository.query.Param("areaTrabajo") String areaTrabajo,
        @org.springframework.data.repository.query.Param("fechaDesde") java.time.OffsetDateTime fechaDesde,
        @org.springframework.data.repository.query.Param("fechaHasta") java.time.OffsetDateTime fechaHasta
    );

    /**
     * Evolución temporal de atenciones por área
     * Agrupa por día: total, atendidos, pendientes, deserciones
     * @param areaTrabajo área de trabajo
     * @param fechaDesde fecha inicio
     * @param fechaHasta fecha fin
     * @return lista de evolución temporal
     */
    @Query(value = """
        SELECT
            DATE(sb.fecha_atencion_medica AT TIME ZONE 'America/Lima') as fecha,
            COUNT(sb.id_solicitud) as totalAtenciones,
            COUNT(CASE WHEN sb.condicion_medica = 'Atendido' THEN 1 END) as atendidos,
            COUNT(CASE WHEN sb.condicion_medica = 'Pendiente' THEN 1 END) as pendientes,
            COUNT(CASE WHEN sb.condicion_medica = 'Deserción' THEN 1 END) as deserciones
        FROM dim_solicitud_bolsa sb
        JOIN dim_personal_cnt p ON sb.id_personal = p.id_pers
        WHERE p.area_trabajo = :areaTrabajo
          AND sb.activo = true
          AND sb.fecha_asignacion >= :fechaDesde
          AND sb.fecha_asignacion <= :fechaHasta
        GROUP BY DATE(sb.fecha_atencion_medica AT TIME ZONE 'America/Lima')
        ORDER BY fecha ASC
        """, nativeQuery = true)
    List<Map<String, Object>> obtenerEvolucionTemporalPorArea(
        @org.springframework.data.repository.query.Param("areaTrabajo") String areaTrabajo,
        @org.springframework.data.repository.query.Param("fechaDesde") java.time.OffsetDateTime fechaDesde,
        @org.springframework.data.repository.query.Param("fechaHasta") java.time.OffsetDateTime fechaHasta
    );

    /**
     * KPIs consolidados del área
     * Estadísticas generales de todos los médicos del área
     * @param areaTrabajo área de trabajo
     * @param fechaDesde fecha inicio (NULL = sin filtro)
     * @param fechaHasta fecha fin (NULL = sin filtro)
     * @return mapa con KPIs consolidados
     */
    @Query(value = """
        SELECT
            COUNT(sb.id_solicitud) as totalPacientes,
            COUNT(CASE WHEN sb.condicion_medica = 'Atendido' THEN 1 END) as totalAtendidos,
            COUNT(CASE WHEN sb.condicion_medica = 'Pendiente' THEN 1 END) as totalPendientes,
            COUNT(CASE WHEN sb.condicion_medica = 'Deserción' THEN 1 END) as totalDeserciones,
            COUNT(CASE WHEN sb.es_cronico = true THEN 1 END) as totalCronicos,
            COUNT(CASE WHEN sb.tiene_recita = true THEN 1 END) as totalRecitas,
            COUNT(CASE WHEN sb.tiene_interconsulta = true THEN 1 END) as totalInterconsultas,
            COUNT(DISTINCT sb.id_personal) as totalMedicosActivos,
            ROUND(AVG(EXTRACT(EPOCH FROM (sb.fecha_atencion_medica - sb.fecha_asignacion)) / 3600), 2) as horasPromedio,
            ROUND(COUNT(CASE WHEN sb.condicion_medica = 'Atendido' THEN 1 END) * 100.0 /
                  NULLIF(COUNT(sb.id_solicitud), 0), 2) as tasaCompletacion,
            ROUND(COUNT(CASE WHEN sb.condicion_medica = 'Deserción' THEN 1 END) * 100.0 /
                  NULLIF(COUNT(sb.id_solicitud), 0), 2) as tasaDesercion
        FROM dim_solicitud_bolsa sb
        JOIN dim_personal_cnt p ON sb.id_personal = p.id_pers
        WHERE p.area_trabajo = :areaTrabajo
          AND sb.activo = true
          AND (:fechaDesde IS NULL OR sb.fecha_asignacion >= :fechaDesde)
          AND (:fechaHasta IS NULL OR sb.fecha_asignacion <= :fechaHasta)
        """, nativeQuery = true)
    Map<String, Object> obtenerKpisPorArea(
        @org.springframework.data.repository.query.Param("areaTrabajo") String areaTrabajo,
        @org.springframework.data.repository.query.Param("fechaDesde") java.time.OffsetDateTime fechaDesde,
        @org.springframework.data.repository.query.Param("fechaHasta") java.time.OffsetDateTime fechaHasta
    );

}

