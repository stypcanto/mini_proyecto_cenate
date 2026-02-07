package com.styp.cenate.service.bolsas.impl;

import com.styp.cenate.dto.bolsas.estadisticas.*;
import com.styp.cenate.repository.bolsas.SolicitudBolsaRepository;
import com.styp.cenate.service.bolsas.SolicitudBolsaEstadisticasService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🆕 v2.0.0: Implementación del servicio de estadísticas
 * Calcula métricas a partir de datos de dim_solicitud_bolsa
 */
@Service
@Slf4j
@Transactional(readOnly = true)
public class SolicitudBolsaEstadisticasServiceImpl implements SolicitudBolsaEstadisticasService {

    private final SolicitudBolsaRepository solicitudRepository;

    public SolicitudBolsaEstadisticasServiceImpl(SolicitudBolsaRepository solicitudRepository) {
        this.solicitudRepository = solicitudRepository;
    }

    // ========================================================================
    // 📊 ESTADÍSTICAS GENERALES
    // ========================================================================

    @Override
    @Cacheable(value = "estadisticas-generales")
    public EstadisticasGeneralesDTO obtenerEstadisticasGenerales() {
        log.info("📊 Calculando estadísticas generales...");

        Map<String, Object> kpis = solicitudRepository.obtenerKpis();
        Map<String, Object> diarios = solicitudRepository.estadisticasDelDia();

        Long totalSolicitudes = ((Number) kpis.get("total_solicitudes")).longValue();
        Long totalAtendidas = ((Number) kpis.get("total_atendidas")).longValue();
        Long totalPendientes = ((Number) kpis.get("total_pendientes")).longValue();
        Long totalCanceladas = ((Number) kpis.get("total_canceladas")).longValue();
        Long totalDerivadas = ((Number) kpis.getOrDefault("total_derivadas", 0L)).longValue();

        BigDecimal tasaCompletacion = (BigDecimal) kpis.get("tasa_completacion");
        BigDecimal tasaAbandono = (BigDecimal) kpis.get("tasa_abandono");
        Integer horasPromedio = ((Number) kpis.getOrDefault("horas_promedio_general", 0)).intValue();
        Long pendientesVencidas = ((Number) kpis.getOrDefault("pendientes_vencidas", 0L)).longValue();

        return EstadisticasGeneralesDTO.builder()
                .totalSolicitudes(totalSolicitudes)
                .totalAtendidas(totalAtendidas)
                .totalPendientes(totalPendientes)
                .totalCanceladas(totalCanceladas)
                .totalDerivadas(totalDerivadas)
                .tasaCompletacion(tasaCompletacion)
                .tasaAbandono(tasaAbandono)
                .tasaPendiente(totalSolicitudes > 0 ?
                    BigDecimal.valueOf((double) totalPendientes / totalSolicitudes * 100).setScale(2, java.math.RoundingMode.HALF_UP) :
                    BigDecimal.ZERO)
                .horasPromedioGeneral(horasPromedio)
                .pendientesVencidas(pendientesVencidas)
                .ultimaActualizacion(OffsetDateTime.now(ZoneId.of("America/Lima")))
                .periodo("Hoy")
                .build();
    }

    // ========================================================================
    // 📈 ESTADÍSTICAS POR ESTADO
    // ========================================================================

    @Override
    @Cacheable(value = "estadisticas-por-estado")
    public List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstado() {
        log.info("📊 Obteniendo estadísticas por estado...");

        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorEstado();
        List<EstadisticasPorEstadoDTO> dtos = resultados.stream()
                .map(this::mapearAEstadoDTO)
                .collect(Collectors.toList());

        // 👥 v1.41.0: Agregar métrica de "Casos Asignados" (solicitudes con gestoraAsignada != null)
        Long casosAsignados = solicitudRepository.contarCasosAsignados();
        Long totalSolicitudes = dtos.stream().mapToLong(EstadisticasPorEstadoDTO::getCantidad).sum();

        if (totalSolicitudes > 0) {
            BigDecimal porcentajeAsignados = BigDecimal.valueOf(casosAsignados * 100.0 / totalSolicitudes)
                    .setScale(2, java.math.RoundingMode.HALF_UP);

            dtos.add(EstadisticasPorEstadoDTO.builder()
                    .estado("ASIGNADOS")
                    .cantidad(casosAsignados)
                    .porcentaje(porcentajeAsignados)
                    .color("#00AA00")  // Verde
                    .emoji("👥")       // Personas
                    .build());
        }

        return dtos.stream()
                .sorted(Comparator.comparingLong(EstadisticasPorEstadoDTO::getCantidad).reversed())
                .collect(Collectors.toList());
    }

    private EstadisticasPorEstadoDTO mapearAEstadoDTO(Map<String, Object> row) {
        String estado = (String) row.get("estado");
        Long cantidad = ((Number) row.get("cantidad")).longValue();
        BigDecimal porcentaje = (BigDecimal) row.get("porcentaje");

        // Asignar color y emoji según estado
        String color = getColorPorEstado(estado);
        String emoji = getEmojiPorEstado(estado);

        return EstadisticasPorEstadoDTO.builder()
                .estado(estado)
                .cantidad(cantidad)
                .porcentaje(porcentaje)
                .color(color)
                .emoji(emoji)
                .build();
    }

    private String getColorPorEstado(String estado) {
        return switch (estado.toUpperCase()) {
            case "PENDIENTE" -> "#FFAA00";      // Naranja
            case "CITADO" -> "#0066CC";         // Azul
            case "ATENDIDO" -> "#00AA00";       // Verde
            case "CANCELADO" -> "#FF0000";      // Rojo
            case "DERIVADO" -> "#9900FF";       // Púrpura
            case "OBSERVADO" -> "#FF9900";      // Naranja oscuro
            case "ASIGNADOS" -> "#00AA00";      // Verde - v1.41.0
            default -> "#666666";               // Gris
        };
    }

    private String getEmojiPorEstado(String estado) {
        return switch (estado.toUpperCase()) {
            case "PENDIENTE" -> "📋";
            case "CITADO" -> "📅";
            case "ATENDIDO" -> "✅";
            case "CANCELADO" -> "❌";
            case "DERIVADO" -> "🚀";
            case "OBSERVADO" -> "👀";
            case "ASIGNADOS" -> "👥";           // Personas - v1.41.0
            default -> "❓";
        };
    }

    // ========================================================================
    // 🏥 ESTADÍSTICAS POR ESPECIALIDAD
    // ========================================================================

    @Override
    public List<EstadisticasPorEspecialidadDTO> obtenerEstadisticasPorEspecialidad() {
        log.info("📊 Obteniendo estadísticas por especialidad...");

        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorEspecialidad();
        List<EstadisticasPorEspecialidadDTO> dtos = new ArrayList<>();

        int ranking = 1;
        for (Map<String, Object> row : resultados) {
            Long total = ((Number) row.get("total")).longValue();
            Long atendidos = ((Number) row.getOrDefault("atendidos", 0L)).longValue();
            BigDecimal tasaCompletacion = (BigDecimal) row.get("tasa_completacion");
            Integer horasPromedio = ((Number) row.getOrDefault("horas_promedio", 0)).intValue();

            dtos.add(EstadisticasPorEspecialidadDTO.builder()
                    .especialidad((String) row.get("especialidad"))
                    .total(total)
                    .atendidos(atendidos)
                    .pendientes(((Number) row.getOrDefault("pendientes", 0L)).longValue())
                    .cancelados(((Number) row.getOrDefault("cancelados", 0L)).longValue())
                    .tasaCompletacion(tasaCompletacion)
                    .tasaCancelacion((BigDecimal) row.get("tasa_cancelacion"))
                    .horasPromedio(horasPromedio)
                    .diasPromedio(horasPromedio / 24)
                    .tendencia(calcularTendencia(tasaCompletacion))
                    .ranking(ranking++)
                    .build());
        }

        return dtos;
    }

    // ========================================================================
    // 🏛️ ESTADÍSTICAS POR IPRESS
    // ========================================================================

    @Override
    @Cacheable(value = "estadisticas-por-ipress")
    public List<EstadisticasPorIpressDTO> obtenerEstadisticasPorIpress() {
        log.info("📊 Obteniendo estadísticas por IPRESS...");

        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorIpress();

        return resultados.stream()
                .map(this::mapearAIpressDTO)
                .collect(Collectors.toList());
    }

    private EstadisticasPorIpressDTO mapearAIpressDTO(Map<String, Object> row) {
        Long ranking = ((Number) row.getOrDefault("ranking", 0L)).longValue();
        BigDecimal tasaCompletacion = (BigDecimal) row.get("tasa_completacion");

        return EstadisticasPorIpressDTO.builder()
                .codigoIpress((String) row.get("codigo_ipress"))
                .nombreIpress((String) row.getOrDefault("nombre_ipress", "N/A"))
                .redAsistencial((String) row.getOrDefault("red_asistencial", "N/A"))
                .total(((Number) row.get("total")).longValue())
                .atendidos(((Number) row.getOrDefault("atendidos", 0L)).longValue())
                .pendientes(((Number) row.getOrDefault("pendientes", 0L)).longValue())
                .cancelados(((Number) row.getOrDefault("cancelados", 0L)).longValue())
                .derivados(0L)  // No tenemos este dato en la consulta
                .tasaCompletacion(tasaCompletacion)
                .tasaCancelacion((BigDecimal) row.get("tasa_cancelacion"))
                .horasPromedio(((Number) row.getOrDefault("horas_promedio", 0)).intValue())
                .ranking(ranking.intValue())
                .indicador(getIndicadorSalud(tasaCompletacion))
                .build();
    }

    // ========================================================================
    // 📞 ESTADÍSTICAS POR TIPO DE CITA
    // ========================================================================

    @Override
    @Cacheable(value = "estadisticas-por-tipo-cita")
    public List<EstadisticasPorTipoCitaDTO> obtenerEstadisticasPorTipoCita() {
        log.info("📊 Obteniendo estadísticas por tipo de cita...");

        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorTipoCita();

        return resultados.stream()
                .map(this::mapearATipoCitaDTO)
                .sorted(Comparator.comparingLong(EstadisticasPorTipoCitaDTO::getTotal).reversed())
                .collect(Collectors.toList());
    }

    private EstadisticasPorTipoCitaDTO mapearATipoCitaDTO(Map<String, Object> row) {
        String tipoCita = (String) row.get("tipo_cita");
        return EstadisticasPorTipoCitaDTO.builder()
                .tipoCita(tipoCita)
                .total(((Number) row.get("total")).longValue())
                .atendidos(((Number) row.getOrDefault("atendidos", 0L)).longValue())
                .pendientes(((Number) row.getOrDefault("pendientes", 0L)).longValue())
                .cancelados(((Number) row.getOrDefault("cancelados", 0L)).longValue())
                .porcentaje((BigDecimal) row.get("porcentaje"))
                .tasaCompletacion((BigDecimal) row.get("tasa_completacion"))
                .tasaCancelacion(BigDecimal.ZERO)  // Calcular si es necesario
                .horasPromedio(((Number) row.getOrDefault("horas_promedio", 0)).intValue())
                .icono(getIconoPorTipoCita(tipoCita))
                .color(getColorPorTipoCita(tipoCita))
                .build();
    }

    private String getIconoPorTipoCita(String tipoCita) {
        if (tipoCita == null) return "❓";
        return switch (tipoCita.toUpperCase()) {
            case "VOLUNTARIA" -> "🆓";
            case "INTERCONSULTA" -> "🔄";
            case "RECITA" -> "🔁";
            case "REFERENCIA" -> "➡️";
            default -> "❓";
        };
    }

    private String getColorPorTipoCita(String tipoCita) {
        if (tipoCita == null) return "#999999";
        return switch (tipoCita.toUpperCase()) {
            case "VOLUNTARIA" -> "#4ECDC4";       // Turquesa - libre/voluntaria
            case "INTERCONSULTA" -> "#FFE66D";    // Amarillo - interconsulta
            case "RECITA" -> "#FF6B6B";           // Rojo - recita/repetida
            case "REFERENCIA" -> "#9B59B6";       // Púrpura - referencia/derivación
            default -> "#999999";                  // Gris - desconocido
        };
    }

    // ========================================================================
    // 📦 ESTADÍSTICAS POR TIPO DE BOLSA
    // ========================================================================

    @Override
    public List<EstadisticasPorTipoBolsaDTO> obtenerEstadisticasPorTipoBolsa() {
        log.info("📊 Obteniendo estadísticas por tipo de bolsa...");

        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorTipoBolsa();

        return resultados.stream()
                .map(this::mapearATipoBolsaDTO)
                .sorted(Comparator.comparingLong(EstadisticasPorTipoBolsaDTO::getTotal).reversed())
                .collect(Collectors.toList());
    }

    private EstadisticasPorTipoBolsaDTO mapearATipoBolsaDTO(Map<String, Object> row) {
        String tipoBolsa = (String) row.get("tipo_bolsa");
        return EstadisticasPorTipoBolsaDTO.builder()
                .tipoBolsa(tipoBolsa)
                .total(((Number) row.get("total")).longValue())
                .atendidos(((Number) row.getOrDefault("atendidos", 0L)).longValue())
                .pendientes(((Number) row.getOrDefault("pendientes", 0L)).longValue())
                .cancelados(((Number) row.getOrDefault("cancelados", 0L)).longValue())
                .porcentaje((BigDecimal) row.get("porcentaje"))
                .tasaCompletacion((BigDecimal) row.get("tasa_completacion"))
                .tasaCancelacion((BigDecimal) row.get("tasa_cancelacion"))
                .horasPromedio(((Number) row.getOrDefault("horas_promedio", 0)).intValue())
                .icono(getIconoPorTipoBolsa(tipoBolsa))
                .color(getColorPorTipoBolsa(tipoBolsa))
                .build();
    }

    private String getIconoPorTipoBolsa(String tipoBolsa) {
        if (tipoBolsa == null) return "📋";
        return switch (tipoBolsa.toUpperCase()) {
            case "ORDINARIA" -> "📋";              // Ordinaria - documento
            case "EXTRAORDINARIA" -> "⚠️";         // Extraordinaria - alerta
            case "ESPECIAL" -> "⭐";               // Especial - estrella
            case "URGENTE" -> "🚨";                // Urgente - siren
            case "EMERGENCIA" -> "🆘";             // Emergencia - SOS
            case "RESERVA" -> "💾";                // Reserva - guardar
            default -> "📋";                       // Default - documento
        };
    }

    private String getColorPorTipoBolsa(String tipoBolsa) {
        if (tipoBolsa == null) return "#999999";
        return switch (tipoBolsa.toUpperCase()) {
            case "ORDINARIA" -> "#3498DB";        // Azul - ordinaria
            case "EXTRAORDINARIA" -> "#E74C3C";   // Rojo - extraordinaria
            case "ESPECIAL" -> "#F39C12";         // Naranja - especial
            case "URGENTE" -> "#FF6B6B";          // Rojo fuerte - urgente
            case "EMERGENCIA" -> "#C0392B";       // Rojo oscuro - emergencia
            case "RESERVA" -> "#27AE60";          // Verde - reserva
            default -> "#95A5A6";                  // Gris - desconocido
        };
    }

    // ========================================================================
    // 📅 EVOLUCIÓN TEMPORAL
    // ========================================================================

    @Override
    public List<EvolutionTemporalDTO> obtenerEvolutionTemporal() {
        log.info("📊 Obteniendo evolución temporal...");

        List<Map<String, Object>> resultados = solicitudRepository.evolucionTemporal();

        return resultados.stream()
                .map(row -> {
                    // Convertir java.sql.Date a java.time.LocalDate correctamente
                    Object fechaObj = row.get("fecha");
                    java.time.LocalDate fecha = null;
                    if (fechaObj instanceof java.sql.Date) {
                        fecha = ((java.sql.Date) fechaObj).toLocalDate();
                    } else if (fechaObj instanceof java.time.LocalDate) {
                        fecha = (java.time.LocalDate) fechaObj;
                    }

                    return EvolutionTemporalDTO.builder()
                            .fecha(fecha)
                            .nuevasSolicitudes(((Number) row.getOrDefault("nuevas_solicitudes", 0L)).longValue())
                            .completadas(((Number) row.getOrDefault("completadas", 0L)).longValue())
                            .pendientes(((Number) row.getOrDefault("pendientes", 0L)).longValue())
                            .cumulativoTotal(((Number) row.getOrDefault("cumulativo_total", 0L)).longValue())
                            .cumulativoCompletado(0L)  // Opcional si queremos agregarlo
                            .tasaDiaCompletacion(
                                BigDecimal.ZERO  // Calcular si es necesario
                            )
                            .tendencia("=")  // Calcular si es necesario
                            .build();
                })
                .collect(Collectors.toList());
    }

    // ========================================================================
    // 🎯 KPIs
    // ========================================================================

    @Override
    public KpisDTO obtenerKpis() {
        log.info("🎯 Calculando KPIs...");

        Map<String, Object> kpis = solicitudRepository.obtenerKpis();

        Long totalSolicitudes = ((Number) kpis.get("total_solicitudes")).longValue();
        Long totalAtendidas = ((Number) kpis.get("total_atendidas")).longValue();
        Long pendientesVencidas = ((Number) kpis.getOrDefault("pendientes_vencidas", 0L)).longValue();

        BigDecimal tasaCompletacion = (BigDecimal) kpis.get("tasa_completacion");
        String salud = getSaludGeneral(tasaCompletacion, pendientesVencidas);
        String capacidad = getIndicadorCapacidad(totalSolicitudes, totalAtendidas);

        return KpisDTO.builder()
                .totalSolicitudes(totalSolicitudes)
                .totalAtendidas(totalAtendidas)
                .totalPendientes(((Number) kpis.get("total_pendientes")).longValue())
                .totalCanceladas(((Number) kpis.get("total_canceladas")).longValue())
                .totalDerivadas(((Number) kpis.getOrDefault("total_derivadas", 0L)).longValue())
                .tasaCompletacion(tasaCompletacion)
                .tasaAbandono((BigDecimal) kpis.get("tasa_abandono"))
                .tasaPendiente(totalSolicitudes > 0 ?
                    BigDecimal.valueOf((double) ((Number) kpis.get("total_pendientes")).longValue() / totalSolicitudes * 100).setScale(2, java.math.RoundingMode.HALF_UP) :
                    BigDecimal.ZERO)
                .tasaDerivacion(totalSolicitudes > 0 ?
                    BigDecimal.valueOf((double) ((Number) kpis.getOrDefault("total_derivadas", 0L)).longValue() / totalSolicitudes * 100).setScale(2, java.math.RoundingMode.HALF_UP) :
                    BigDecimal.ZERO)
                .horasPromedioGeneral(((Number) kpis.getOrDefault("horas_promedio_general", 0)).intValue())
                .horasPromedioPendientes(0)  // Calcular si es necesario
                .diasPromedioResolucion(((Number) kpis.getOrDefault("horas_promedio_general", 0)).intValue() / 24)
                .pendientesVencidas(pendientesVencidas)
                .pendientesVencidasCriticas(pendientesVencidas / 2)  // Estimación
                .solicitadasHoy(((Number) solicitudRepository.estadisticasDelDia().getOrDefault("solicitudes_hoy", 0L)).longValue())
                .atendidosHoy(((Number) solicitudRepository.estadisticasDelDia().getOrDefault("atendidas_hoy", 0L)).longValue())
                .saludGeneral(salud)
                .indicadorCapacidad(capacidad)
                .ultimaActualizacion(OffsetDateTime.now(ZoneId.of("America/Lima")))
                .periodoAnalisis("Últimos 30 días")
                .build();
    }

    // ========================================================================
    // 📅 ESTADÍSTICAS DEL DÍA
    // ========================================================================

    @Override
    public EstadisticasGeneralesDTO obtenerEstadisticasDelDia() {
        log.info("📊 Obteniendo estadísticas del día...");

        Map<String, Object> datos = solicitudRepository.estadisticasDelDia();

        return EstadisticasGeneralesDTO.builder()
                .totalSolicitudes(((Number) datos.getOrDefault("solicitudes_hoy", 0L)).longValue())
                .totalAtendidas(((Number) datos.getOrDefault("atendidas_hoy", 0L)).longValue())
                .totalPendientes(((Number) datos.getOrDefault("pendientes_hoy", 0L)).longValue())
                .totalCanceladas(0L)
                .totalDerivadas(0L)
                .tasaCompletacion(BigDecimal.ZERO)
                .tasaAbandono(BigDecimal.ZERO)
                .tasaPendiente(BigDecimal.ZERO)
                .horasPromedioGeneral(0)
                .pendientesVencidas(0L)
                .ultimaActualizacion(OffsetDateTime.now(ZoneId.of("America/Lima")))
                .periodo("Hoy (últimas 24h)")
                .build();
    }

    // ========================================================================
    // 🖥️ DASHBOARD COMPLETO
    // ========================================================================

    @Override
    public Map<String, Object> obtenerDashboardCompleto() {
        log.info("📊 Generando dashboard completo...");

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("general", obtenerEstadisticasGenerales());
        dashboard.put("por_estado", obtenerEstadisticasPorEstado());
        dashboard.put("por_especialidad", obtenerEstadisticasPorEspecialidad());
        dashboard.put("por_ipress", obtenerEstadisticasPorIpress());
        dashboard.put("por_tipo_cita", obtenerEstadisticasPorTipoCita());
        dashboard.put("por_tipo_bolsa", obtenerEstadisticasPorTipoBolsa());
        dashboard.put("evolucion_temporal", obtenerEvolutionTemporal());
        dashboard.put("kpis", obtenerKpis());
        dashboard.put("del_dia", obtenerEstadisticasDelDia());
        dashboard.put("timestamp", OffsetDateTime.now(ZoneId.of("America/Lima")));

        return dashboard;
    }

    // ========================================================================
    // 🔧 HELPER METHODS
    // ========================================================================

    private String calcularTendencia(BigDecimal tasa) {
        if (tasa == null) return "=";
        if (tasa.compareTo(BigDecimal.valueOf(75)) > 0) return "↑";  // >75% = bueno
        if (tasa.compareTo(BigDecimal.valueOf(50)) < 0) return "↓";  // <50% = malo
        return "=";  // 50-75% = estable
    }

    private String getIndicadorSalud(BigDecimal tasaCompletacion) {
        if (tasaCompletacion == null) return "🟡";
        if (tasaCompletacion.compareTo(BigDecimal.valueOf(80)) > 0) return "🟢";  // >80% = verde
        if (tasaCompletacion.compareTo(BigDecimal.valueOf(60)) > 0) return "🟡";  // >60% = amarillo
        return "🔴";  // <=60% = rojo
    }

    private String getSaludGeneral(BigDecimal tasaCompletacion, Long pendientesVencidas) {
        String base = getIndicadorSalud(tasaCompletacion);
        String alerta = "";

        if (pendientesVencidas > 100) {
            alerta = " 🔴 Crítico";
        } else if (pendientesVencidas > 50) {
            alerta = " 🟡 Alerta";
        }

        return base + alerta;
    }

    private String getIndicadorCapacidad(Long totalSolicitudes, Long atendidas) {
        if (totalSolicitudes == 0) return "🟢 Sin carga";

        double tasaAtencion = (double) atendidas / totalSolicitudes;

        if (tasaAtencion > 0.8) return "🟢 Baja carga";
        if (tasaAtencion > 0.5) return "🟡 Carga normal";
        return "🔴 Sobrecarga";
    }

    // ========================================================================
    // 🎯 FILTROS CONSOLIDADOS (v3.0.0 - Optimización)
    // ========================================================================

    @Override
    public Map<String, Object> obtenerEstadisticasFiltros() {
        log.info("🎯 Obteniendo estadísticas CONSOLIDADAS para filtros (v3.0.0)");

        Map<String, Object> resultado = new LinkedHashMap<>();

        // Todas las estadísticas necesarias para los dropdowns en UNA sola llamada
        resultado.put("por_tipo_bolsa", obtenerEstadisticasPorTipoBolsa());
        resultado.put("por_macrorregion", obtenerEstadisticasPorMacrorregion());
        resultado.put("por_red", obtenerEstadisticasPorRed());
        resultado.put("por_ipress", obtenerEstadisticasPorIpress());
        resultado.put("por_especialidad", obtenerEstadisticasPorEspecialidad());
        resultado.put("por_tipo_cita", obtenerEstadisticasPorTipoCita());
        resultado.put("por_estado", obtenerEstadisticasPorEstado());
        resultado.put("timestamp", OffsetDateTime.now(ZoneId.of("America/Lima")));

        log.info("✅ Estadísticas consolidadas obtenidas (1 llamada = 7 antiguas)");
        return resultado;
    }

    /**
     * Obtiene estadísticas agrupadas por macrorregión
     * Calcula automáticamente desde los datos de solicitudes
     */
    private List<Map<String, Object>> obtenerEstadisticasPorMacrorregion() {
        log.info("📊 Calculando estadísticas por macrorregión...");
        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorMacrorregion();
        return resultados.stream()
                .sorted((a, b) -> {
                    Long cantA = ((Number) a.get("cantidad")).longValue();
                    Long cantB = ((Number) b.get("cantidad")).longValue();
                    return cantB.compareTo(cantA);
                })
                .collect(Collectors.toList());
    }

    /**
     * Obtiene estadísticas agrupadas por red asistencial
     * Calcula automáticamente desde los datos de solicitudes
     */
    private List<Map<String, Object>> obtenerEstadisticasPorRed() {
        log.info("📊 Calculando estadísticas por red...");
        List<Map<String, Object>> resultados = solicitudRepository.estadisticasPorRed();
        return resultados.stream()
                .sorted((a, b) -> {
                    Long cantA = ((Number) a.get("cantidad")).longValue();
                    Long cantB = ((Number) b.get("cantidad")).longValue();
                    return cantB.compareTo(cantA);
                })
                .collect(Collectors.toList());
    }
}
