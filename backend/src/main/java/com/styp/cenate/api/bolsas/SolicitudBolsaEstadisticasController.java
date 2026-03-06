package com.styp.cenate.api.bolsas;

import com.styp.cenate.dto.bolsas.estadisticas.*;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.bolsas.SolicitudBolsaEstadisticasService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 🆕 v2.0.0: Controller REST para estadísticas del módulo Bolsas
 * Proporciona múltiples endpoints para visualización en dashboard
 *
 * Base URL: /api/bolsas/estadisticas
 */
@RestController
@RequestMapping("/api/bolsas/estadisticas")
@Tag(name = "📊 Estadísticas Bolsas", description = "Endpoints de estadísticas, métricas y KPIs del módulo Bolsas")
@Slf4j
public class SolicitudBolsaEstadisticasController {

    private final SolicitudBolsaEstadisticasService estadisticasService;
    private final SolicitudBolsaRepository solicitudRepository;
    private final JdbcTemplate jdbcTemplate;

    public SolicitudBolsaEstadisticasController(SolicitudBolsaEstadisticasService estadisticasService,
                                                SolicitudBolsaRepository solicitudRepository,
                                                JdbcTemplate jdbcTemplate) {
        this.estadisticasService = estadisticasService;
        this.solicitudRepository = solicitudRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    // ========================================================================
    // 📊 GENERAL
    // ========================================================================

    /**
     * Estadísticas generales resumidas
     * GET /api/bolsas/estadisticas/resumen
     */
    @GetMapping("/resumen")
    @Operation(
        summary = "Estadísticas generales resumidas",
        description = "Retorna métricas principales: total, atendidas, pendientes, canceladas, tasas",
        tags = {"Resumen"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK",
        content = @Content(schema = @Schema(implementation = EstadisticasGeneralesDTO.class))
    )
    public ResponseEntity<EstadisticasGeneralesDTO> obtenerEstadisticasGenerales() {
        log.info("GET /api/bolsas/estadisticas/resumen");
        EstadisticasGeneralesDTO datos = estadisticasService.obtenerEstadisticasGenerales();
        return ResponseEntity.ok(datos);
    }

    /**
     * Estadísticas del día actual
     * GET /api/bolsas/estadisticas/del-dia
     */
    @GetMapping("/del-dia")
    @Operation(
        summary = "Estadísticas de hoy",
        description = "Retorna métricas de las últimas 24 horas",
        tags = {"Resumen"}
    )
    public ResponseEntity<EstadisticasGeneralesDTO> obtenerEstadisticasDelDia() {
        log.info("GET /api/bolsas/estadisticas/del-dia");
        EstadisticasGeneralesDTO datos = estadisticasService.obtenerEstadisticasDelDia();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 📈 POR ESTADO
    // ========================================================================

    /**
     * Estadísticas por estado de gestión
     * GET /api/bolsas/estadisticas/por-estado
     */
    @GetMapping("/por-estado")
    @Operation(
        summary = "Estadísticas por estado de cita",
        description = "Estados: PENDIENTE, CITADO, ATENDIDO, CANCELADO, DERIVADO, OBSERVADO. Acepta filtro opcional ipressAtencion.",
        tags = {"Por Estado"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Lista de estados con cantidad y porcentaje",
        content = @Content(schema = @Schema(implementation = EstadisticasPorEstadoDTO.class))
    )
    public ResponseEntity<List<EstadisticasPorEstadoDTO>> obtenerEstadisticasPorEstado(
            @RequestParam(required = false) String ipressAtencion) {
        if (ipressAtencion != null && !ipressAtencion.isBlank()) {
            log.info("GET /api/bolsas/estadisticas/por-estado?ipressAtencion={}", ipressAtencion);
            return ResponseEntity.ok(estadisticasService.obtenerEstadisticasPorEstadoFiltrado(ipressAtencion));
        }
        log.info("GET /api/bolsas/estadisticas/por-estado");
        List<EstadisticasPorEstadoDTO> datos = estadisticasService.obtenerEstadisticasPorEstado();
        return ResponseEntity.ok(datos);
    }

    /**
     * v1.78.3: KPI cards filtrados — mismos parámetros que el listado de solicitudes.
     * GET /api/bolsas/estadisticas/kpi-con-filtros
     * Permite actualizar los 4 cards (Sin Gestora, Pendiente Citar, Con Gestora, Total)
     * dinámicamente cuando el usuario aplica filtros en la página de solicitudes.
     */
    @GetMapping("/kpi-con-filtros")
    public ResponseEntity<List<EstadisticasPorEstadoDTO>> obtenerKpiConFiltros(
            @RequestParam(required = false) String bolsaNombre,
            @RequestParam(required = false) String macrorregion,
            @RequestParam(required = false) String red,
            @RequestParam(required = false) String ipress,
            @RequestParam(required = false) String especialidad,
            @RequestParam(required = false) String estadoCodigo,
            @RequestParam(required = false) String ipressAtencion,
            @RequestParam(required = false) String tipoCita,
            @RequestParam(required = false) String asignacion,
            @RequestParam(required = false) String busqueda,
            @RequestParam(required = false) String fechaInicio,
            @RequestParam(required = false) String fechaFin,
            @RequestParam(required = false) Long   gestoraId,
            @RequestParam(required = false) String estadoBolsa,
            @RequestParam(required = false) String categoriaEspecialidad,
            @RequestParam(required = false) String estrategia) {

        log.info("GET /api/bolsas/estadisticas/kpi-con-filtros — bolsa={} macro={} red={} ipress={} categoria={} estrategia={}",
                bolsaNombre, macrorregion, red, ipress, categoriaEspecialidad, estrategia);
        return ResponseEntity.ok(estadisticasService.obtenerKpiConFiltros(
                bolsaNombre, macrorregion, red, ipress, especialidad, estadoCodigo,
                ipressAtencion, tipoCita, asignacion, busqueda,
                fechaInicio, fechaFin, gestoraId, estadoBolsa, categoriaEspecialidad, estrategia));
    }

    /**
     * Estadísticas por condicion_medica para bolsa PADOMI (v1.73.1)
     * GET /api/bolsas/estadisticas/por-condicion-medica-padomi
     */
    @GetMapping("/por-condicion-medica-padomi")
    public ResponseEntity<List<EstadisticasPorEstadoDTO>> obtenerEstadisticasPorCondicionMedicaPadomi() {
        log.info("GET /api/bolsas/estadisticas/por-condicion-medica-padomi");
        List<Map<String, Object>> rows = solicitudRepository.estadisticasPorCondicionMedicaPadomi();
        List<EstadisticasPorEstadoDTO> result = rows.stream()
            .map(row -> {
                String estado = (String) row.get("estado");
                Long cantidad = ((Number) row.get("cantidad")).longValue();
                return EstadisticasPorEstadoDTO.builder()
                    .estado(estado)
                    .cantidad(cantidad)
                    .porcentaje(java.math.BigDecimal.ZERO)
                    .build();
            }).collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }

    // ========================================================================
    // 🏥 POR ESPECIALIDAD
    // ========================================================================

    /**
     * Estadísticas por especialidad médica
     * GET /api/bolsas/estadisticas/por-especialidad
     */
    @GetMapping("/por-especialidad")
    @Operation(
        summary = "Estadísticas por especialidad",
        description = "Incluye: total, atendidos, pendientes, tasa completación, promedio horas",
        tags = {"Por Especialidad"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Lista de especialidades con métricas",
        content = @Content(schema = @Schema(implementation = EstadisticasPorEspecialidadDTO.class))
    )
    public ResponseEntity<List<EstadisticasPorEspecialidadDTO>> obtenerEstadisticasPorEspecialidad(
            @RequestParam(required = false) String ipressAtencion) {
        if (ipressAtencion != null && !ipressAtencion.isBlank()) {
            log.info("GET /api/bolsas/estadisticas/por-especialidad?ipressAtencion={}", ipressAtencion);
            return ResponseEntity.ok(estadisticasService.obtenerEstadisticasPorEspecialidadFiltrado(ipressAtencion));
        }
        log.info("GET /api/bolsas/estadisticas/por-especialidad");
        List<EstadisticasPorEspecialidadDTO> datos = estadisticasService.obtenerEstadisticasPorEspecialidad();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 🏛️ POR IPRESS
    // ========================================================================

    /**
     * Estadísticas por IPRESS (institución)
     * GET /api/bolsas/estadisticas/por-ipress
     */
    @GetMapping("/por-ipress")
    @Operation(
        summary = "Estadísticas por IPRESS",
        description = "Con ranking, carga de trabajo y tasa de completación por institución",
        tags = {"Por IPRESS"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Lista de IPRESS con métricas y ranking",
        content = @Content(schema = @Schema(implementation = EstadisticasPorIpressDTO.class))
    )
    public ResponseEntity<List<EstadisticasPorIpressDTO>> obtenerEstadisticasPorIpress() {
        log.info("GET /api/bolsas/estadisticas/por-ipress");
        List<EstadisticasPorIpressDTO> datos = estadisticasService.obtenerEstadisticasPorIpress();
        return ResponseEntity.ok(datos);
    }

    /**
     * Estadísticas por IPRESS de Atención
     * GET /api/bolsas/estadisticas/por-ipress-atencion
     */
    @GetMapping("/por-ipress-atencion")
    public ResponseEntity<List<EstadisticasPorIpressDTO>> obtenerEstadisticasPorIpressAtencion() {
        log.info("GET /api/bolsas/estadisticas/por-ipress-atencion");
        List<EstadisticasPorIpressDTO> datos = estadisticasService.obtenerEstadisticasPorIpressAtencion();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 📞 POR TIPO DE CITA
    // ========================================================================

    /**
     * Estadísticas por tipo de cita
     * GET /api/bolsas/estadisticas/por-tipo-cita
     */
    @GetMapping("/por-tipo-cita")
    @Operation(
        summary = "Estadísticas por tipo de cita",
        description = "Tipos: PRESENCIAL, TELECONSULTA, VIDEOCONFERENCIA",
        tags = {"Por Tipo Cita"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Lista de tipos de cita con métricas",
        content = @Content(schema = @Schema(implementation = EstadisticasPorTipoCitaDTO.class))
    )
    public ResponseEntity<List<EstadisticasPorTipoCitaDTO>> obtenerEstadisticasPorTipoCita() {
        log.info("GET /api/bolsas/estadisticas/por-tipo-cita");
        List<EstadisticasPorTipoCitaDTO> datos = estadisticasService.obtenerEstadisticasPorTipoCita();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 📦 POR TIPO DE BOLSA
    // ========================================================================

    /**
     * Estadísticas por tipo de bolsa
     * GET /api/bolsas/estadisticas/por-tipo-bolsa
     */
    @GetMapping("/por-tipo-bolsa")
    @Operation(
        summary = "Estadísticas por tipo de bolsa",
        description = "Tipos: ORDINARIA, EXTRAORDINARIA, ESPECIAL, URGENTE, EMERGENCIA, RESERVA",
        tags = {"Por Tipo Bolsa"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Lista de tipos de bolsa con métricas",
        content = @Content(schema = @Schema(implementation = EstadisticasPorTipoBolsaDTO.class))
    )
    public ResponseEntity<List<EstadisticasPorTipoBolsaDTO>> obtenerEstadisticasPorTipoBolsa() {
        log.info("GET /api/bolsas/estadisticas/por-tipo-bolsa");
        List<EstadisticasPorTipoBolsaDTO> datos = estadisticasService.obtenerEstadisticasPorTipoBolsa();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 📅 EVOLUCIÓN TEMPORAL
    // ========================================================================

    /**
     * Evolución temporal últimos 30 días
     * GET /api/bolsas/estadisticas/evolucion-temporal
     */
    @GetMapping("/evolucion-temporal")
    @Operation(
        summary = "Evolución temporal de solicitudes",
        description = "Últimos 30 días: nuevas solicitudes, completadas, pendientes, acumulativo",
        tags = {"Evolución Temporal"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Datos diarios de solicitudes para gráfico de línea",
        content = @Content(schema = @Schema(implementation = EvolutionTemporalDTO.class))
    )
    public ResponseEntity<List<EvolutionTemporalDTO>> obtenerEvolutionTemporal() {
        log.info("GET /api/bolsas/estadisticas/evolucion-temporal");
        List<EvolutionTemporalDTO> datos = estadisticasService.obtenerEvolutionTemporal();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 🎯 KPIs
    // ========================================================================

    /**
     * KPIs detallados y alertas
     * GET /api/bolsas/estadisticas/kpis
     */
    @GetMapping("/kpis")
    @Operation(
        summary = "KPIs detallados",
        description = "Indicadores clave de rendimiento, alertas y métricas críticas",
        tags = {"KPIs"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - KPIs con tasas, promedios e indicadores",
        content = @Content(schema = @Schema(implementation = KpisDTO.class))
    )
    public ResponseEntity<KpisDTO> obtenerKpis() {
        log.info("GET /api/bolsas/estadisticas/kpis");
        KpisDTO datos = estadisticasService.obtenerKpis();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 🎯 FILTROS CONSOLIDADOS (v3.0.0)
    // ========================================================================

    /**
     * Estadísticas consolidadas para los filtros de la página de Solicitudes
     * GET /api/bolsas/estadisticas/filtros
     *
     * ⚡ OPTIMIZACIÓN: Una sola llamada en lugar de 7 separadas
     * Antes: 9 llamadas al iniciar la página
     * Ahora: 1 llamada con todos los datos de filtros
     *
     * Retorna un Map con claves:
     * - por_tipo_bolsa: List<EstadisticasPorTipoBolsaDTO> (para dropdown Bolsas)
     * - por_macrorregion: List (para dropdown Macrorregión)
     * - por_red: List (para dropdown Redes)
     * - por_ipress: List<EstadisticasPorIpressDTO> (para dropdown IPRESS)
     * - por_especialidad: List<EstadisticasPorEspecialidadDTO> (para dropdown Especialidades)
     * - por_tipo_cita: List<EstadisticasPorTipoCitaDTO> (para dropdown Tipo Cita)
     * - por_estado: List<EstadisticasPorEstadoDTO> (para dropdown Estado)
     */
    @GetMapping("/filtros")
    @Operation(
        summary = "Estadísticas consolidadas para filtros",
        description = "Una sola llamada con todos los datos necesarios para los dropdowns de filtros. Reduce carga de red de 7 a 1 request.",
        tags = {"Filtros"}
    )
    @ApiResponse(
        responseCode = "200",
        description = "OK - Estadísticas consolidadas para filtros"
    )
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasFiltros() {
        log.info("GET /api/bolsas/estadisticas/filtros - Optimización: consolidar 7 llamadas en 1");
        Map<String, Object> datos = estadisticasService.obtenerEstadisticasFiltros();
        return ResponseEntity.ok(datos);
    }

    // ========================================================================
    // 🏃 MARATÓN — Segmentos CENACRON vs ESPECIALIDADES
    // ========================================================================

    /**
     * v1.85.8: Citados por segmento MARATÓN.
     * GET /api/bolsas/estadisticas/maraton-segmentos
     * Retorna: { cenacronCitados: N, especialidadesCitados: N }
     */
    @GetMapping("/maraton-segmentos")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasMaratonSegmentos() {
        log.info("GET /api/bolsas/estadisticas/maraton-segmentos — citados por segmento CENACRON vs ESPECIALIDADES");
        String sql = """
            SELECT
                SUM(CASE WHEN a.paciente_cronico = true  AND eg.cod_estado_cita = 'CITADO' THEN 1 ELSE 0 END) AS cenacron_citados,
                SUM(CASE WHEN (a.paciente_cronico = false OR a.paciente_cronico IS NULL) AND eg.cod_estado_cita = 'CITADO' THEN 1 ELSE 0 END) AS especialidades_citados
            FROM dim_solicitud_bolsa sb
            LEFT JOIN asegurados a ON a.doc_paciente = sb.paciente_dni
            LEFT JOIN dim_estados_gestion_citas eg ON eg.id_estado_cita = sb.estado_gestion_citas_id
            WHERE sb.id_bolsa = 17 AND sb.activo = true
            """;
        Map<String, Object> row = jdbcTemplate.queryForMap(sql);
        return ResponseEntity.ok(Map.of(
            "cenacronCitados",      ((Number) row.getOrDefault("cenacron_citados", 0L)).longValue(),
            "especialidadesCitados", ((Number) row.getOrDefault("especialidades_citados", 0L)).longValue()
        ));
    }

    /**
     * v1.85.9: KPI MARATÓN con pacientes únicos (DISTINCT ON paciente_dni).
     * Garantiza que los conteos sumen exactamente el universo total (13,400).
     * Usa prioridad de estado: CITADO > ATENDIDO > observados > PENDIENTE_CITA.
     * GET /api/bolsas/estadisticas/maraton-kpi
     */
    @GetMapping("/maraton-kpi")
    public ResponseEntity<List<Map<String, Object>>> obtenerKpiMaraton() {
        log.info("GET /api/bolsas/estadisticas/maraton-kpi — KPI por paciente único con DISTINCT ON");
        String sql = """
            WITH paciente_estado AS (
                SELECT DISTINCT ON (sb.paciente_dni)
                    sb.paciente_dni,
                    COALESCE(eg.cod_estado_cita, 'PENDIENTE_CITA') AS estado,
                    sb.responsable_gestora_id
                FROM dim_solicitud_bolsa sb
                LEFT JOIN dim_estados_gestion_citas eg ON eg.id_estado_cita = sb.estado_gestion_citas_id
                WHERE sb.id_bolsa = 17 AND sb.activo = true
                ORDER BY sb.paciente_dni,
                    CASE COALESCE(eg.cod_estado_cita, 'PENDIENTE_CITA')
                        WHEN 'CITADO'           THEN 1
                        WHEN 'ATENDIDO'         THEN 2
                        WHEN 'ATENDIDO_IPRESS'  THEN 3
                        WHEN 'NO_CONTESTA'      THEN 4
                        WHEN 'NO_CONTESTO'      THEN 5
                        WHEN 'APAGADO'          THEN 6
                        WHEN 'TEL_SIN_SERVICIO' THEN 7
                        WHEN 'NO_DESEA'         THEN 8
                        WHEN 'RECHAZADO'        THEN 9
                        WHEN 'REPROG_FALLIDA'   THEN 10
                        WHEN 'NO_IPRESS_CENATE' THEN 11
                        WHEN 'NUM_NO_EXISTE'    THEN 12
                        WHEN 'SIN_VIGENCIA'     THEN 13
                        WHEN 'PARTICULAR'       THEN 14
                        WHEN 'FALLECIDO'        THEN 15
                        WHEN 'YA_NO_REQUIERE'   THEN 16
                        WHEN 'NO_GRUPO_ETARIO'  THEN 17
                        ELSE 18
                    END
            )
            SELECT estado, COUNT(*) AS cantidad FROM paciente_estado GROUP BY estado
            UNION ALL
            SELECT 'ASIGNADOS', COUNT(*) FROM paciente_estado WHERE responsable_gestora_id IS NOT NULL
            ORDER BY cantidad DESC
            """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(rows);
    }

    /** v1.85.9: Opciones únicas de filtros para el modal de pacientes MARATÓN */
    @GetMapping("/maraton-filtros-opciones")
    public ResponseEntity<Map<String, Object>> obtenerFiltrosOpciones(@RequestParam String categoria) {
        log.info("GET /api/bolsas/estadisticas/maraton-filtros-opciones — categoria={}", categoria);
        final String OBS_IN = "'ATENDIDO_IPRESS','NO_CONTESTA','NO_CONTESTO','APAGADO','TEL_SIN_SERVICIO'," +
                "'NO_DESEA','RECHAZADO','NUM_NO_EXISTE','NO_IPRESS_CENATE','SIN_VIGENCIA'," +
                "'YA_NO_REQUIERE','PARTICULAR','REPROG_FALLIDA','FALLECIDO','NO_GRUPO_ETARIO'";
        String catFilter = switch (categoria.toUpperCase()) {
            case "UNIVERSO"                   -> "1=1";
            case "CRONICOS"                   -> "a.paciente_cronico = true";
            case "ESPECIALIDADES"             -> "(a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "POR_ASIGNAR"                -> "pe.responsable_gestora_id IS NULL";
            case "CITAS_LOGRADAS"             -> "pe.estado IN ('CITADO','ATENDIDO')";
            case "OBSERVADOS"                 -> "pe.estado IN (" + OBS_IN + ")";
            case "PENDIENTES"                 -> "pe.estado = 'PENDIENTE_CITA'";
            case "EN_CONTACTO"                -> "pe.responsable_gestora_id IS NOT NULL AND pe.estado NOT IN ('CITADO','ATENDIDO'," + OBS_IN + ")";
            case "CITADOS_CENACRON"           -> "pe.estado IN ('CITADO','ATENDIDO') AND a.paciente_cronico = true";
            case "CITADOS_ESPECIALIDADES"     -> "pe.estado IN ('CITADO','ATENDIDO') AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "OBSERVADOS_CENACRON"        -> "pe.estado IN (" + OBS_IN + ") AND a.paciente_cronico = true";
            case "OBSERVADOS_ESPECIALIDADES"  -> "pe.estado IN (" + OBS_IN + ") AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "PENDIENTES_CENACRON"        -> "pe.estado = 'PENDIENTE_CITA' AND a.paciente_cronico = true";
            case "PENDIENTES_ESPECIALIDADES"  -> "pe.estado = 'PENDIENTE_CITA' AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            default -> "1=0";
        };
        String cte = """
            WITH paciente_estado AS (
                SELECT DISTINCT ON (sb.paciente_dni) sb.paciente_dni, COALESCE(eg.cod_estado_cita,'PENDIENTE_CITA') AS estado, sb.responsable_gestora_id, sb.id_ipress
                FROM dim_solicitud_bolsa sb
                LEFT JOIN dim_estados_gestion_citas eg ON eg.id_estado_cita = sb.estado_gestion_citas_id
                WHERE sb.id_bolsa = 17 AND sb.activo = true
                ORDER BY sb.paciente_dni, CASE COALESCE(eg.cod_estado_cita,'PENDIENTE_CITA')
                    WHEN 'CITADO' THEN 1 WHEN 'ATENDIDO' THEN 2 WHEN 'ATENDIDO_IPRESS' THEN 3
                    WHEN 'NO_CONTESTA' THEN 4 WHEN 'NO_CONTESTO' THEN 5 WHEN 'APAGADO' THEN 6
                    WHEN 'TEL_SIN_SERVICIO' THEN 7 WHEN 'NO_DESEA' THEN 8 WHEN 'RECHAZADO' THEN 9
                    WHEN 'REPROG_FALLIDA' THEN 10 WHEN 'NO_IPRESS_CENATE' THEN 11
                    WHEN 'NUM_NO_EXISTE' THEN 12 WHEN 'SIN_VIGENCIA' THEN 13
                    WHEN 'PARTICULAR' THEN 14 WHEN 'FALLECIDO' THEN 15
                    WHEN 'YA_NO_REQUIERE' THEN 16 WHEN 'NO_GRUPO_ETARIO' THEN 17 ELSE 18 END
            ) """;
        String joins = "LEFT JOIN asegurados a ON a.doc_paciente = pe.paciente_dni " +
                "LEFT JOIN dim_ipress di ON di.id_ipress = pe.id_ipress " +
                "LEFT JOIN dim_red dr ON di.id_red = dr.id_red " +
                "LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro ";
        String where = "WHERE " + catFilter;
        List<String> macrorredes = jdbcTemplate.queryForList(
                cte + "SELECT DISTINCT COALESCE(dm.desc_macro,'N/A') v FROM paciente_estado pe " + joins + where + " AND dm.desc_macro IS NOT NULL ORDER BY 1", String.class);
        List<String> redes = jdbcTemplate.queryForList(
                cte + "SELECT DISTINCT COALESCE(dr.desc_red,'N/A') v FROM paciente_estado pe " + joins + where + " AND dr.desc_red IS NOT NULL ORDER BY 1", String.class);
        List<String> ipressList = jdbcTemplate.queryForList(
                cte + "SELECT COALESCE(di.desc_ipress,'N/A') v FROM paciente_estado pe " + joins + where + " AND di.desc_ipress IS NOT NULL GROUP BY 1 ORDER BY COUNT(*) DESC LIMIT 150", String.class);
        return ResponseEntity.ok(Map.of("macrorredes", macrorredes, "redes", redes, "ipress", ipressList));
    }

    /**
     * v1.85.9: Lista paginada de pacientes MARATÓN por categoría del embudo.
     * GET /api/bolsas/estadisticas/maraton-pacientes?categoria=POR_ASIGNAR&busqueda=&page=0&size=50
     * Categorías: POR_ASIGNAR | EN_CONTACTO | CITAS_LOGRADAS | OBSERVADOS | CITADOS_CENACRON | CITADOS_ESPECIALIDADES
     */
    @GetMapping("/maraton-pacientes")
    public ResponseEntity<Map<String, Object>> obtenerPacientesMaratonPorCategoria(
            @RequestParam String categoria,
            @RequestParam(required = false, defaultValue = "") String busqueda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false, defaultValue = "") String sexo,
            @RequestParam(required = false, defaultValue = "") String estadoGestion,
            @RequestParam(required = false) Integer edadMin,
            @RequestParam(required = false) Integer edadMax,
            @RequestParam(required = false, defaultValue = "") String ipressFiltro,
            @RequestParam(required = false, defaultValue = "") String redFiltro,
            @RequestParam(required = false, defaultValue = "") String macrorredFiltro) {

        log.info("GET /api/bolsas/estadisticas/maraton-pacientes — categoria={} busqueda={} page={}", categoria, busqueda, page);

        final String OBSERVADOS_IN = "'ATENDIDO_IPRESS','NO_CONTESTA','NO_CONTESTO','APAGADO','TEL_SIN_SERVICIO'," +
                "'NO_DESEA','RECHAZADO','NUM_NO_EXISTE','NO_IPRESS_CENATE','SIN_VIGENCIA'," +
                "'YA_NO_REQUIERE','PARTICULAR','REPROG_FALLIDA','FALLECIDO','NO_GRUPO_ETARIO'";

        String categoriaFilter = switch (categoria.toUpperCase()) {
            case "UNIVERSO"                  -> "1=1";
            case "CRONICOS"                  -> "a.paciente_cronico = true";
            case "ESPECIALIDADES"            -> "(a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "POR_ASIGNAR"               -> "pe.responsable_gestora_id IS NULL";
            case "CITAS_LOGRADAS"            -> "pe.estado IN ('CITADO','ATENDIDO')";
            case "OBSERVADOS"                -> "pe.estado IN (" + OBSERVADOS_IN + ")";
            case "PENDIENTES"                -> "pe.estado = 'PENDIENTE_CITA'";
            case "EN_CONTACTO"               -> "pe.responsable_gestora_id IS NOT NULL AND pe.estado NOT IN ('CITADO','ATENDIDO'," + OBSERVADOS_IN + ")";
            case "CITADOS_CENACRON"          -> "pe.estado IN ('CITADO','ATENDIDO') AND a.paciente_cronico = true";
            case "CITADOS_ESPECIALIDADES"    -> "pe.estado IN ('CITADO','ATENDIDO') AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "OBSERVADOS_CENACRON"       -> "pe.estado IN (" + OBSERVADOS_IN + ") AND a.paciente_cronico = true";
            case "OBSERVADOS_ESPECIALIDADES" -> "pe.estado IN (" + OBSERVADOS_IN + ") AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            case "PENDIENTES_CENACRON"       -> "pe.estado = 'PENDIENTE_CITA' AND a.paciente_cronico = true";
            case "PENDIENTES_ESPECIALIDADES" -> "pe.estado = 'PENDIENTE_CITA' AND (a.paciente_cronico = false OR a.paciente_cronico IS NULL)";
            default -> "1=0";
        };

        String cte = """
            WITH paciente_estado AS (
                SELECT DISTINCT ON (sb.paciente_dni)
                    sb.paciente_dni,
                    COALESCE(eg.cod_estado_cita, 'PENDIENTE_CITA') AS estado,
                    sb.responsable_gestora_id,
                    sb.especialidad,
                    sb.paciente_edad,
                    sb.id_ipress
                FROM dim_solicitud_bolsa sb
                LEFT JOIN dim_estados_gestion_citas eg ON eg.id_estado_cita = sb.estado_gestion_citas_id
                WHERE sb.id_bolsa = 17 AND sb.activo = true
                ORDER BY sb.paciente_dni,
                    CASE COALESCE(eg.cod_estado_cita, 'PENDIENTE_CITA')
                        WHEN 'CITADO' THEN 1 WHEN 'ATENDIDO' THEN 2 WHEN 'ATENDIDO_IPRESS' THEN 3
                        WHEN 'NO_CONTESTA' THEN 4 WHEN 'NO_CONTESTO' THEN 5 WHEN 'APAGADO' THEN 6
                        WHEN 'TEL_SIN_SERVICIO' THEN 7 WHEN 'NO_DESEA' THEN 8 WHEN 'RECHAZADO' THEN 9
                        WHEN 'REPROG_FALLIDA' THEN 10 WHEN 'NO_IPRESS_CENATE' THEN 11
                        WHEN 'NUM_NO_EXISTE' THEN 12 WHEN 'SIN_VIGENCIA' THEN 13
                        WHEN 'PARTICULAR' THEN 14 WHEN 'FALLECIDO' THEN 15
                        WHEN 'YA_NO_REQUIERE' THEN 16 WHEN 'NO_GRUPO_ETARIO' THEN 17 ELSE 18
                    END
            )
            """;

        // Build dynamic extra filters + params list
        StringBuilder extraFilters = new StringBuilder();
        java.util.List<Object> extraParams = new java.util.ArrayList<>();

        if (!busqueda.isBlank()) {
            String like = "%" + busqueda + "%";
            extraFilters.append(" AND (a.doc_paciente LIKE ? OR LOWER(a.paciente) LIKE LOWER(?))");
            extraParams.add(like); extraParams.add(like);
        }
        if (sexo.equals("M") || sexo.equals("F")) {
            extraFilters.append(" AND a.sexo = '").append(sexo).append("'");
        }
        if (!estadoGestion.isBlank()) {
            extraFilters.append(" AND pe.estado = ?");
            extraParams.add(estadoGestion);
        }
        if (edadMin != null) {
            extraFilters.append(" AND DATE_PART('year', AGE(CAST(a.fecnacimpaciente AS DATE))) >= ?");
            extraParams.add(edadMin.doubleValue());
        }
        if (edadMax != null) {
            extraFilters.append(" AND DATE_PART('year', AGE(CAST(a.fecnacimpaciente AS DATE))) <= ?");
            extraParams.add(edadMax.doubleValue());
        }
        if (!ipressFiltro.isBlank()) {
            extraFilters.append(" AND LOWER(COALESCE(di.desc_ipress,'')) LIKE LOWER(?)");
            extraParams.add("%" + ipressFiltro + "%");
        }
        if (!redFiltro.isBlank()) {
            extraFilters.append(" AND LOWER(COALESCE(dr.desc_red,'')) LIKE LOWER(?)");
            extraParams.add("%" + redFiltro + "%");
        }
        if (!macrorredFiltro.isBlank()) {
            extraFilters.append(" AND LOWER(COALESCE(dm.desc_macro,'')) LIKE LOWER(?)");
            extraParams.add("%" + macrorredFiltro + "%");
        }

        String sqlCount = cte + "SELECT COUNT(*) FROM paciente_estado pe " +
                "LEFT JOIN asegurados a ON a.doc_paciente = pe.paciente_dni " +
                "LEFT JOIN dim_ipress di ON di.id_ipress = pe.id_ipress " +
                "LEFT JOIN dim_red dr ON di.id_red = dr.id_red " +
                "LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro " +
                "WHERE " + categoriaFilter + extraFilters;

        String sqlDataBase = """
                SELECT
                    CASE a.id_tip_doc WHEN 1 THEN 'DNI' WHEN 2 THEN 'C.E./PAS' ELSE 'DNI' END AS tipo_doc,
                    a.doc_paciente AS num_doc,
                    a.paciente AS nombre_completo,
                    a.sexo AS sexo,
                    COALESCE(
                        CAST(DATE_PART('year', AGE(CAST(a.fecnacimpaciente AS DATE))) AS INTEGER),
                        pe.paciente_edad
                    ) AS edad,
                    COALESCE(di.desc_ipress, 'N/A') AS ipress,
                    COALESCE(dr.desc_red, 'N/A') AS red,
                    COALESCE(dm.desc_macro, 'N/A') AS macrorred,
                    pe.estado AS estado_gestion,
                    COALESCE(pe.especialidad, '') AS especialidad
                FROM paciente_estado pe
                LEFT JOIN asegurados a ON a.doc_paciente = pe.paciente_dni
                LEFT JOIN dim_ipress di ON di.id_ipress = pe.id_ipress
                LEFT JOIN dim_red dr ON di.id_red = dr.id_red
                LEFT JOIN dim_macroregion dm ON dr.id_macro = dm.id_macro
                """;
        String sqlData = cte + sqlDataBase + "WHERE " + categoriaFilter + extraFilters +
                " ORDER BY a.paciente LIMIT ? OFFSET ?";

        Object[] countParams = extraParams.toArray();
        java.util.List<Object> dataParamsList = new java.util.ArrayList<>(extraParams);
        dataParamsList.add(size);
        dataParamsList.add(page * size);
        Object[] dataParams = dataParamsList.toArray();

        long total = jdbcTemplate.queryForObject(sqlCount, Long.class, countParams);
        List<Map<String, Object>> content = jdbcTemplate.queryForList(sqlData, dataParams);

        return ResponseEntity.ok(Map.of(
            "content", content,
            "totalElements", total,
            "page", page,
            "size", size,
            "totalPages", (int) Math.ceil((double) total / size)
        ));
    }

    /**
     * v1.85.26: Totales brutos de la bolsa MARATÓN — para la nota de doble conteo.
     * GET /api/bolsas/estadisticas/maraton-totales-brutos
     * Retorna: { totalRegistros, pacientesUnicos, registrosExtra, pacientesMultiplesCitas }
     */
    @GetMapping("/maraton-totales-brutos")
    public ResponseEntity<Map<String, Object>> obtenerTotalesBrutosMaraton() {
        log.info("GET /api/bolsas/estadisticas/maraton-totales-brutos");
        String sql = """
            WITH conteo AS (
                SELECT paciente_dni, COUNT(*) AS cnt
                FROM dim_solicitud_bolsa
                WHERE id_bolsa = 17 AND activo = true
                GROUP BY paciente_dni
            )
            SELECT
                SUM(cnt)                                    AS total_registros,
                COUNT(*)                                    AS pacientes_unicos,
                SUM(cnt) - COUNT(*)                         AS registros_extra,
                COUNT(CASE WHEN cnt > 1 THEN 1 END)         AS pacientes_multiples_citas
            FROM conteo
            """;
        Map<String, Object> row = jdbcTemplate.queryForMap(sql);
        return ResponseEntity.ok(Map.of(
            "totalRegistros",         ((Number) row.getOrDefault("total_registros",          0L)).longValue(),
            "pacientesUnicos",        ((Number) row.getOrDefault("pacientes_unicos",          0L)).longValue(),
            "registrosExtra",         ((Number) row.getOrDefault("registros_extra",           0L)).longValue(),
            "pacientesMultiplesCitas",((Number) row.getOrDefault("pacientes_multiples_citas", 0L)).longValue()
        ));
    }

    /** Desglose completo de estados por segmento MARATÓN (pacientes únicos por DNI) */
    @GetMapping("/maraton-desglose")
    public ResponseEntity<List<Map<String, Object>>> obtenerDesgloseMaraton() {
        log.info("GET /api/bolsas/estadisticas/maraton-desglose");
        String sql = """
            WITH paciente_unico AS (
                SELECT DISTINCT ON (sb.paciente_dni)
                    sb.paciente_dni,
                    CASE WHEN a.paciente_cronico = true THEN 'CENACRON' ELSE 'ESPECIALIDADES' END AS segmento,
                    COALESCE(eg.cod_estado_cita, 'SIN_ESTADO') AS estado
                FROM dim_solicitud_bolsa sb
                LEFT JOIN asegurados a ON a.doc_paciente = sb.paciente_dni
                LEFT JOIN dim_estados_gestion_citas eg ON eg.id_estado_cita = sb.estado_gestion_citas_id
                WHERE sb.id_bolsa = 17 AND sb.activo = true
                ORDER BY sb.paciente_dni,
                    CASE COALESCE(eg.cod_estado_cita, 'SIN_ESTADO')
                        WHEN 'CITADO'           THEN 1
                        WHEN 'ATENDIDO'         THEN 2
                        WHEN 'ATENDIDO_IPRESS'  THEN 3
                        WHEN 'NO_CONTESTA'      THEN 4
                        WHEN 'NO_CONTESTO'      THEN 5
                        WHEN 'APAGADO'          THEN 6
                        WHEN 'TEL_SIN_SERVICIO' THEN 7
                        WHEN 'NO_DESEA'         THEN 8
                        WHEN 'RECHAZADO'        THEN 9
                        WHEN 'REPROG_FALLIDA'   THEN 10
                        WHEN 'NO_IPRESS_CENATE' THEN 11
                        WHEN 'NUM_NO_EXISTE'    THEN 12
                        WHEN 'SIN_VIGENCIA'     THEN 13
                        WHEN 'PARTICULAR'       THEN 14
                        WHEN 'FALLECIDO'        THEN 15
                        WHEN 'YA_NO_REQUIERE'   THEN 16
                        WHEN 'NO_GRUPO_ETARIO'  THEN 17
                        ELSE 18
                    END
            )
            SELECT segmento, estado, COUNT(*) AS cantidad
            FROM paciente_unico
            GROUP BY 1, 2
            ORDER BY 1, 3 DESC
            """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        return ResponseEntity.ok(rows);
    }

    // ========================================================================
    // 🖥️ DASHBOARD COMPLETO
    // ========================================================================

    /**
     * Dashboard completo con todas las estadísticas
     * GET /api/bolsas/estadisticas/dashboard-completo
     *
     * Retorna un Map con claves:
     * - general: EstadisticasGeneralesDTO
     * - por_estado: List<EstadisticasPorEstadoDTO>
     * - por_especialidad: List<EstadisticasPorEspecialidadDTO>
     * - por_ipress: List<EstadisticasPorIpressDTO>
     * - por_tipo_cita: List<EstadisticasPorTipoCitaDTO>
     * - evolucion_temporal: List<EvolutionTemporalDTO>
     * - kpis: KpisDTO
     * - del_dia: EstadisticasGeneralesDTO
     * - timestamp: OffsetDateTime
     */
    @GetMapping("/dashboard-completo")
    @Operation(
        summary = "Dashboard completo",
        description = "Todos los datos necesarios para visualizar el dashboard completo",
        tags = {"Dashboard"}
    )
    public ResponseEntity<Map<String, Object>> obtenerDashboardCompleto() {
        log.info("GET /api/bolsas/estadisticas/dashboard-completo");
        Map<String, Object> datos = estadisticasService.obtenerDashboardCompleto();
        return ResponseEntity.ok(datos);
    }
}
