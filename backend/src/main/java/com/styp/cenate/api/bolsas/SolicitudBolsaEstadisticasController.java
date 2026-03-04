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

    public SolicitudBolsaEstadisticasController(SolicitudBolsaEstadisticasService estadisticasService,
                                                SolicitudBolsaRepository solicitudRepository) {
        this.estadisticasService = estadisticasService;
        this.solicitudRepository = solicitudRepository;
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
            @RequestParam(required = false) String categoriaEspecialidad) {

        log.info("GET /api/bolsas/estadisticas/kpi-con-filtros — bolsa={} macro={} red={} ipress={} categoria={}",
                bolsaNombre, macrorregion, red, ipress, categoriaEspecialidad);
        return ResponseEntity.ok(estadisticasService.obtenerKpiConFiltros(
                bolsaNombre, macrorregion, red, ipress, especialidad, estadoCodigo,
                ipressAtencion, tipoCita, asignacion, busqueda,
                fechaInicio, fechaFin, gestoraId, estadoBolsa, categoriaEspecialidad));
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
