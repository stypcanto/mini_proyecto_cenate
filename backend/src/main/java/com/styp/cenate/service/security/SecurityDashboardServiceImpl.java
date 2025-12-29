package com.styp.cenate.service.security;

import com.styp.cenate.model.SecurityAlert;
import com.styp.cenate.repository.ActiveSessionRepository;
import com.styp.cenate.repository.AuditLogRepository;
import com.styp.cenate.repository.SecurityAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 📊 Implementación del Servicio de Dashboard de Seguridad
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SecurityDashboardServiceImpl implements SecurityDashboardService {

    private final SecurityAlertRepository securityAlertRepository;
    private final ActiveSessionRepository activeSessionRepository;
    private final AuditLogRepository auditLogRepository;

    // ============================================================
    // RESUMEN EJECUTIVO
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenEjecutivo() {
        log.debug("📊 Obteniendo resumen ejecutivo de seguridad");

        Map<String, Object> resumen = new HashMap<>();

        // Alertas totales y por estado
        long totalAlertas = securityAlertRepository.count();
        long alertasNuevas = securityAlertRepository.countByEstado("NUEVA");
        long alertasCriticas = securityAlertRepository.findAlertasCriticasActivas().size();
        long alertasEnRevision = securityAlertRepository.countByEstado("EN_REVISION");
        long alertasResueltas = securityAlertRepository.countByEstado("RESUELTA");

        resumen.put("total_alertas", totalAlertas);
        resumen.put("alertas_nuevas", alertasNuevas);
        resumen.put("alertas_criticas", alertasCriticas);
        resumen.put("alertas_en_revision", alertasEnRevision);
        resumen.put("alertas_resueltas", alertasResueltas);

        // Alertas recientes
        LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
        LocalDateTime hace7d = LocalDateTime.now().minusDays(7);

        long alertasHoy = securityAlertRepository.countAlertasRecientes(LocalDateTime.now().toLocalDate().atStartOfDay());
        long alertasUltimas24h = securityAlertRepository.countAlertasRecientes(hace24h);
        long alertasUltimos7d = securityAlertRepository.countAlertasRecientes(hace7d);

        resumen.put("alertas_hoy", alertasHoy);
        resumen.put("alertas_ultimas_24h", alertasUltimas24h);
        resumen.put("alertas_ultimos_7d", alertasUltimos7d);

        // Sesiones activas
        long sesionesActivas = activeSessionRepository.countByIsActiveTrue();
        List<Object[]> usuariosConSesionesConcurrentes = activeSessionRepository.findUsersWithConcurrentSessions();

        resumen.put("sesiones_activas", sesionesActivas);
        resumen.put("usuarios_con_sesiones_concurrentes", usuariosConSesionesConcurrentes.size());

        // Logs de auditoría (últimas 24 horas)
        long logsUltimas24h = auditLogRepository.countByFechaHoraBetween(hace24h, LocalDateTime.now());
        long erroresUltimas24h = auditLogRepository.countByActionAndFechaHoraBetween(
                "LOGIN_FAILED", hace24h, LocalDateTime.now());

        resumen.put("logs_ultimas_24h", logsUltimas24h);
        resumen.put("errores_login_ultimas_24h", erroresUltimas24h);

        // Tasa de resolución
        LocalDateTime hace30d = LocalDateTime.now().minusDays(30);
        Double tasaResolucion = securityAlertRepository.calcularTasaResolucion(hace30d);

        resumen.put("tasa_resolucion_30d", tasaResolucion != null ? Math.round(tasaResolucion) : 0);

        // Estado general
        String estadoGeneral = calcularEstadoGeneral(alertasCriticas, alertasNuevas);
        resumen.put("estado_general", estadoGeneral);

        log.debug("✅ Resumen ejecutivo obtenido: {} métricas", resumen.size());

        return resumen;
    }

    // ============================================================
    // ESTADÍSTICAS DE ALERTAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasAlertas() {
        log.debug("📊 Obteniendo estadísticas de alertas");

        Map<String, Object> estadisticas = new HashMap<>();

        // Distribución por tipo
        List<Object[]> porTipo = securityAlertRepository.contarPorTipo();
        Map<String, Long> distribucionTipo = porTipo.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        estadisticas.put("por_tipo", distribucionTipo);

        // Distribución por severidad
        List<Object[]> porSeveridad = securityAlertRepository.contarPorSeveridad();
        Map<String, Long> distribucionSeveridad = porSeveridad.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));

        estadisticas.put("por_severidad", distribucionSeveridad);

        // Top tipos de alerta
        List<Map<String, Object>> topTipos = porTipo.stream()
                .limit(5)
                .<Map<String, Object>>map(row -> Map.of(
                        "tipo", (String) row[0],
                        "cantidad", (Long) row[1]
                ))
                .collect(Collectors.toList());

        estadisticas.put("top_tipos", topTipos);

        return estadisticas;
    }

    // ============================================================
    // ESTADÍSTICAS DE SESIONES
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticasSesiones() {
        log.debug("📊 Obteniendo estadísticas de sesiones");

        Map<String, Object> estadisticas = new HashMap<>();

        // Totales
        long totalSesiones = activeSessionRepository.count();
        long sesionesActivas = activeSessionRepository.countByIsActiveTrue();
        long sesionesCerradas = totalSesiones - sesionesActivas;

        estadisticas.put("total_sesiones", totalSesiones);
        estadisticas.put("sesiones_activas", sesionesActivas);
        estadisticas.put("sesiones_cerradas", sesionesCerradas);

        // Sesiones concurrentes
        List<Object[]> usuariosConConcurrentes = activeSessionRepository.findUsersWithConcurrentSessions();
        estadisticas.put("usuarios_con_concurrentes", usuariosConConcurrentes.size());

        // Distribución por dispositivo
        List<Object[]> porDispositivo = activeSessionRepository.countByDeviceType();
        Map<String, Long> distribucionDispositivo = porDispositivo.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0] != null ? (String) row[0] : "UNKNOWN",
                        row -> (Long) row[1]
                ));

        estadisticas.put("por_dispositivo", distribucionDispositivo);

        // Distribución por navegador
        List<Object[]> porNavegador = activeSessionRepository.countByBrowser();
        Map<String, Long> distribucionNavegador = porNavegador.stream()
                .limit(5)
                .collect(Collectors.toMap(
                        row -> (String) row[0] != null ? (String) row[0] : "UNKNOWN",
                        row -> (Long) row[1]
                ));

        estadisticas.put("por_navegador", distribucionNavegador);

        return estadisticas;
    }

    // ============================================================
    // TOP USUARIOS CON MÁS ALERTAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerTopUsuariosConAlertas(int limit) {
        log.debug("📊 Obteniendo top {} usuarios con más alertas", limit);

        Pageable pageable = PageRequest.of(0, limit);
        List<Object[]> topUsuarios = securityAlertRepository.findTopUsuariosConAlertas(pageable);

        return topUsuarios.stream()
                .map(row -> {
                    Map<String, Object> usuario = new HashMap<>();
                    usuario.put("usuario", (String) row[0]);
                    usuario.put("total_alertas", (Long) row[1]);
                    return usuario;
                })
                .collect(Collectors.toList());
    }

    // ============================================================
    // DISTRIBUCIÓN POR HORA DEL DÍA
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerDistribucionAlertasPorHora() {
        log.debug("📊 Obteniendo distribución de alertas por hora");

        List<Object[]> porHora = securityAlertRepository.contarPorHoraDelDia();

        return porHora.stream()
                .map(row -> {
                    Map<String, Object> dato = new HashMap<>();
                    dato.put("hora", ((Number) row[0]).intValue());
                    dato.put("cantidad", (Long) row[1]);
                    return dato;
                })
                .collect(Collectors.toList());
    }

    // ============================================================
    // ALERTAS CRÍTICAS ACTIVAS
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Page<Map<String, Object>> obtenerAlertasCriticasActivas(int page, int size) {
        log.debug("📊 Obteniendo alertas críticas activas (página {} de {})", page, size);

        Pageable pageable = PageRequest.of(page, size);
        Page<SecurityAlert> alertas = securityAlertRepository.findAlertasActivas(pageable)
                .map(alerta -> alerta);

        return alertas.map(alerta -> {
            Map<String, Object> mapa = new HashMap<>();
            mapa.put("id", alerta.getId());
            mapa.put("tipo", alerta.getAlertType());
            mapa.put("severidad", alerta.getSeverity());
            mapa.put("usuario", alerta.getUsuario());
            mapa.put("ip", alerta.getIpAddress());
            mapa.put("descripcion", alerta.getDescripcion());
            mapa.put("fecha_deteccion", alerta.getFechaDeteccion());
            mapa.put("estado", alerta.getEstado());
            mapa.put("minutos_desde_deteccion", alerta.getMinutosDesdeDeteccion());
            return mapa;
        });
    }

    // ============================================================
    // TENDENCIAS DE ALERTAS (ÚLTIMOS 7 DÍAS)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public List<Map<String, Object>> obtenerTendenciasAlertas() {
        log.debug("📊 Obteniendo tendencias de alertas (últimos 7 días)");

        List<Map<String, Object>> tendencias = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = 6; i >= 0; i--) {
            LocalDate fecha = LocalDate.now().minusDays(i);
            LocalDateTime inicio = fecha.atStartOfDay();
            LocalDateTime fin = fecha.plusDays(1).atStartOfDay();

            long cantidad = securityAlertRepository.findByFechaDeteccionBetweenOrderByFechaDeteccionDesc(
                    inicio, fin).size();

            Map<String, Object> dato = new HashMap<>();
            dato.put("fecha", fecha.format(formatter));
            dato.put("cantidad", cantidad);

            tendencias.add(dato);
        }

        return tendencias;
    }

    // ============================================================
    // MÉTRICAS DE INTEGRIDAD
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerMetricasIntegridad() {
        log.debug("🔐 Obteniendo métricas de integridad de logs");

        Map<String, Object> metricas = new HashMap<>();

        // Total de logs
        long totalLogs = auditLogRepository.count();

        // Logs con hash (calculado desde que se implementó el sistema)
        LocalDateTime fechaImplementacion = LocalDateTime.now().minusDays(30); // Ajustar según fecha real
        long logsConHash = auditLogRepository.findByFechaHoraBetween(
                fechaImplementacion, LocalDateTime.now()).stream()
                .filter(log -> log.getHashIntegridad() != null)
                .count();

        metricas.put("total_logs", totalLogs);
        metricas.put("logs_con_hash", logsConHash);
        metricas.put("logs_sin_hash", totalLogs - logsConHash);

        // Logs manipulados detectados (alertas tipo TAMPERED_LOG)
        long logsManipulados = securityAlertRepository.countByAlertType("TAMPERED_LOG");

        metricas.put("logs_manipulados_detectados", logsManipulados);

        // Porcentaje de integridad
        double porcentajeIntegridad = logsConHash > 0
                ? ((logsConHash - logsManipulados) * 100.0 / logsConHash)
                : 100.0;

        metricas.put("porcentaje_integridad", Math.round(porcentajeIntegridad * 100.0) / 100.0);

        return metricas;
    }

    // ============================================================
    // ACTIVIDAD RECIENTE (ÚLTIMAS 24 HORAS)
    // ============================================================
    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerActividadReciente() {
        log.debug("📊 Obteniendo actividad reciente (últimas 24 horas)");

        Map<String, Object> actividad = new HashMap<>();
        LocalDateTime hace24h = LocalDateTime.now().minusHours(24);

        // Logs de auditoría
        long totalLogs = auditLogRepository.countByFechaHoraBetween(hace24h, LocalDateTime.now());
        long loginsFallidos = auditLogRepository.countByActionAndFechaHoraBetween(
                "LOGIN_FAILED", hace24h, LocalDateTime.now());
        long loginsExitosos = auditLogRepository.countByActionAndFechaHoraBetween(
                "LOGIN", hace24h, LocalDateTime.now());

        actividad.put("total_logs", totalLogs);
        actividad.put("logins_fallidos", loginsFallidos);
        actividad.put("logins_exitosos", loginsExitosos);

        // Alertas generadas
        long alertasGeneradas = securityAlertRepository.countAlertasRecientes(hace24h);
        long alertasCriticasGeneradas = securityAlertRepository.findByFechaDeteccionBetweenOrderByFechaDeteccionDesc(
                hace24h, LocalDateTime.now()).stream()
                .filter(a -> "CRITICAL".equals(a.getSeverity()))
                .count();

        actividad.put("alertas_generadas", alertasGeneradas);
        actividad.put("alertas_criticas_generadas", alertasCriticasGeneradas);

        // Sesiones iniciadas
        long sesionesIniciadas = activeSessionRepository.countByLoginTimeBetween(
                hace24h, LocalDateTime.now());

        actividad.put("sesiones_iniciadas", sesionesIniciadas);

        // Usuarios activos únicos
        List<String> usuariosActivos = auditLogRepository.findDistinctUsuariosByFechaHoraAfter(hace24h);
        actividad.put("usuarios_activos", usuariosActivos.size());

        return actividad;
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    /**
     * Calcula el estado general del sistema basado en alertas
     */
    private String calcularEstadoGeneral(long alertasCriticas, long alertasNuevas) {
        if (alertasCriticas > 0) {
            return "CRÍTICO";
        } else if (alertasNuevas > 10) {
            return "ALERTA";
        } else if (alertasNuevas > 5) {
            return "PRECAUCIÓN";
        } else {
            return "NORMAL";
        }
    }
}
