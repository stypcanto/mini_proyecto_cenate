package com.styp.cenate.scheduled;

import com.styp.cenate.service.security.AnomalyDetectionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * 🔍 Job programado para detección automática de anomalías de seguridad
 *
 * Ejecuta análisis periódicos del sistema para detectar:
 * - Intentos de fuerza bruta
 * - Sesiones concurrentes sospechosas
 * - Accesos fuera de horario
 * - Exportaciones masivas
 * - Cambios de permisos sospechosos
 * - Logs manipulados (integridad)
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionJob {

    private final AnomalyDetectionService anomalyDetectionService;

    /**
     * Ejecuta análisis de anomalías cada 30 minutos
     *
     * Analiza actividad reciente para detectar patrones sospechosos
     * y generar alertas automáticas
     */
    @Scheduled(fixedRate = 1800000) // Cada 30 minutos (1800000 ms)
    public void ejecutarAnalisisDeAnomalias() {
        log.info("🔍 [ANOMALY-DETECTION] Iniciando análisis automático de anomalías...");

        try {
            int alertasGeneradas = anomalyDetectionService.ejecutarAnalisisAutomatico();

            if (alertasGeneradas > 0) {
                log.warn("⚠️ [ANOMALY-DETECTION] Se generaron {} alertas de seguridad", alertasGeneradas);
            } else {
                log.info("✅ [ANOMALY-DETECTION] Análisis completado sin anomalías detectadas");
            }
        } catch (Exception e) {
            log.error("❌ [ANOMALY-DETECTION] Error al ejecutar análisis de anomalías: {}",
                    e.getMessage(), e);
        }
    }

    /**
     * Verifica integridad de logs cada 4 horas
     *
     * Detecta logs manipulados comparando hashes almacenados vs calculados
     * Genera alertas CRITICAL si encuentra discrepancias
     */
    @Scheduled(cron = "0 0 */4 * * ?") // Cada 4 horas
    public void verificarIntegridadLogs() {
        log.info("🔐 [INTEGRITY-CHECK] Iniciando verificación de integridad de logs...");

        try {
            int logsManipulados = anomalyDetectionService.verificarIntegridadLogs();

            if (logsManipulados > 0) {
                log.error("🚨 [INTEGRITY-CHECK] ALERTA CRÍTICA: {} logs manipulados detectados",
                        logsManipulados);
            } else {
                log.info("✅ [INTEGRITY-CHECK] Integridad de logs verificada correctamente");
            }
        } catch (Exception e) {
            log.error("❌ [INTEGRITY-CHECK] Error al verificar integridad de logs: {}",
                    e.getMessage(), e);
        }
    }

    /**
     * Reporte diario de alertas de seguridad (ejecutar a las 8 AM)
     *
     * Genera un resumen ejecutivo de alertas detectadas en las últimas 24 horas
     */
    @Scheduled(cron = "0 0 8 * * ?") // Diariamente a las 8:00 AM
    public void generarReporteDiarioAlertas() {
        log.info("📊 [DAILY-REPORT] Generando reporte diario de alertas de seguridad...");

        try {
            // Este método se puede implementar en SecurityDashboardService
            // Por ahora solo registramos que el job se ejecutó
            log.info("📊 [DAILY-REPORT] Reporte diario programado (pendiente de implementar en SecurityDashboardService)");
        } catch (Exception e) {
            log.error("❌ [DAILY-REPORT] Error al generar reporte diario: {}", e.getMessage());
        }
    }
}
