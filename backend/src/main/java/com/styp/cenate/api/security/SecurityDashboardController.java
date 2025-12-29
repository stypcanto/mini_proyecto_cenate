package com.styp.cenate.api.security;

import com.styp.cenate.service.security.AnomalyDetectionService;
import com.styp.cenate.service.security.SecurityDashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * 📊 Controlador REST para Dashboard de Seguridad
 *
 * Endpoints para visualizar métricas, alertas y estadísticas de seguridad
 *
 * Acceso: Solo SUPERADMIN y ADMIN
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@RestController
@RequestMapping("/api/security/dashboard")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasAnyRole('SUPERADMIN', 'ADMIN')")
public class SecurityDashboardController {

    private final SecurityDashboardService dashboardService;
    private final AnomalyDetectionService anomalyDetectionService;

    // ============================================================
    // RESUMEN EJECUTIVO
    // ============================================================

    /**
     * GET /api/security/dashboard/resumen
     *
     * Obtiene resumen ejecutivo de seguridad con métricas clave
     *
     * @return Map con total alertas, críticas, sesiones activas, etc.
     */
    @GetMapping("/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenEjecutivo() {
        log.info("📊 [DASHBOARD] Solicitud de resumen ejecutivo");

        try {
            Map<String, Object> resumen = dashboardService.obtenerResumenEjecutivo();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", resumen,
                    "message", "Resumen ejecutivo obtenido exitosamente"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener resumen ejecutivo: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener resumen ejecutivo",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    /**
     * GET /api/security/dashboard/estadisticas/alertas
     *
     * Obtiene estadísticas detalladas de alertas
     */
    @GetMapping("/estadisticas/alertas")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasAlertas() {
        log.info("📊 [DASHBOARD] Solicitud de estadísticas de alertas");

        try {
            Map<String, Object> estadisticas = dashboardService.obtenerEstadisticasAlertas();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", estadisticas,
                    "message", "Estadísticas de alertas obtenidas"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas de alertas: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener estadísticas",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/security/dashboard/estadisticas/sesiones
     *
     * Obtiene estadísticas de sesiones activas
     */
    @GetMapping("/estadisticas/sesiones")
    public ResponseEntity<Map<String, Object>> obtenerEstadisticasSesiones() {
        log.info("📊 [DASHBOARD] Solicitud de estadísticas de sesiones");

        try {
            Map<String, Object> estadisticas = dashboardService.obtenerEstadisticasSesiones();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", estadisticas,
                    "message", "Estadísticas de sesiones obtenidas"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener estadísticas de sesiones: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener estadísticas",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/security/dashboard/estadisticas/integridad
     *
     * Obtiene métricas de integridad de logs
     */
    @GetMapping("/estadisticas/integridad")
    public ResponseEntity<Map<String, Object>> obtenerMetricasIntegridad() {
        log.info("📊 [DASHBOARD] Solicitud de métricas de integridad");

        try {
            Map<String, Object> metricas = dashboardService.obtenerMetricasIntegridad();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", metricas,
                    "message", "Métricas de integridad obtenidas"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener métricas de integridad: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener métricas",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // TOP Y RANKINGS
    // ============================================================

    /**
     * GET /api/security/dashboard/top-usuarios?limit=10
     *
     * Obtiene top usuarios con más alertas
     */
    @GetMapping("/top-usuarios")
    public ResponseEntity<Map<String, Object>> obtenerTopUsuarios(
            @RequestParam(defaultValue = "10") int limit) {
        log.info("📊 [DASHBOARD] Solicitud de top {} usuarios con alertas", limit);

        try {
            List<Map<String, Object>> topUsuarios = dashboardService.obtenerTopUsuariosConAlertas(limit);

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", topUsuarios,
                    "message", String.format("Top %d usuarios obtenidos", limit)
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener top usuarios: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener top usuarios",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // TENDENCIAS Y GRÁFICOS
    // ============================================================

    /**
     * GET /api/security/dashboard/tendencias/alertas
     *
     * Obtiene tendencias de alertas (últimos 7 días)
     */
    @GetMapping("/tendencias/alertas")
    public ResponseEntity<Map<String, Object>> obtenerTendenciasAlertas() {
        log.info("📊 [DASHBOARD] Solicitud de tendencias de alertas");

        try {
            List<Map<String, Object>> tendencias = dashboardService.obtenerTendenciasAlertas();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", tendencias,
                    "message", "Tendencias de alertas obtenidas"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener tendencias: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener tendencias",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * GET /api/security/dashboard/distribucion/horas
     *
     * Obtiene distribución de alertas por hora del día
     */
    @GetMapping("/distribucion/horas")
    public ResponseEntity<Map<String, Object>> obtenerDistribucionPorHora() {
        log.info("📊 [DASHBOARD] Solicitud de distribución por hora");

        try {
            List<Map<String, Object>> distribucion = dashboardService.obtenerDistribucionAlertasPorHora();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", distribucion,
                    "message", "Distribución por hora obtenida"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener distribución por hora: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener distribución",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // ALERTAS CRÍTICAS
    // ============================================================

    /**
     * GET /api/security/dashboard/alertas/criticas?page=0&size=20
     *
     * Obtiene alertas críticas activas (paginado)
     */
    @GetMapping("/alertas/criticas")
    public ResponseEntity<Map<String, Object>> obtenerAlertasCriticas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        log.info("📊 [DASHBOARD] Solicitud de alertas críticas (página {})", page);

        try {
            Page<Map<String, Object>> alertas = dashboardService.obtenerAlertasCriticasActivas(page, size);

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", alertas.getContent(),
                    "pagination", Map.of(
                            "current_page", alertas.getNumber(),
                            "total_pages", alertas.getTotalPages(),
                            "total_elements", alertas.getTotalElements(),
                            "page_size", alertas.getSize()
                    ),
                    "message", "Alertas críticas obtenidas"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener alertas críticas: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener alertas críticas",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // ACTIVIDAD RECIENTE
    // ============================================================

    /**
     * GET /api/security/dashboard/actividad/reciente
     *
     * Obtiene resumen de actividad reciente (últimas 24 horas)
     */
    @GetMapping("/actividad/reciente")
    public ResponseEntity<Map<String, Object>> obtenerActividadReciente() {
        log.info("📊 [DASHBOARD] Solicitud de actividad reciente");

        try {
            Map<String, Object> actividad = dashboardService.obtenerActividadReciente();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", actividad,
                    "message", "Actividad reciente obtenida"
            ));
        } catch (Exception e) {
            log.error("❌ Error al obtener actividad reciente: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al obtener actividad",
                    "message", e.getMessage()
            ));
        }
    }

    // ============================================================
    // ANÁLISIS MANUAL DE ANOMALÍAS
    // ============================================================

    /**
     * POST /api/security/dashboard/analizar/usuario/{username}
     *
     * Ejecuta análisis de anomalías para un usuario específico
     */
    @PostMapping("/analizar/usuario/{username}")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> analizarUsuario(@PathVariable String username) {
        log.info("🔍 [DASHBOARD] Análisis manual solicitado para usuario: {}", username);

        try {
            Map<String, Boolean> resultados = anomalyDetectionService.analizarUsuarioCompleto(username);

            long anomaliasDetectadas = resultados.values().stream()
                    .filter(Boolean::booleanValue)
                    .count();

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "data", resultados,
                    "anomalias_detectadas", anomaliasDetectadas,
                    "message", String.format("Análisis completado: %d anomalías detectadas", anomaliasDetectadas)
            ));
        } catch (Exception e) {
            log.error("❌ Error al analizar usuario: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al analizar usuario",
                    "message", e.getMessage()
            ));
        }
    }

    /**
     * POST /api/security/dashboard/verificar-integridad
     *
     * Ejecuta verificación manual de integridad de logs
     */
    @PostMapping("/verificar-integridad")
    @PreAuthorize("hasRole('SUPERADMIN')")
    public ResponseEntity<Map<String, Object>> verificarIntegridad() {
        log.info("🔐 [DASHBOARD] Verificación manual de integridad solicitada");

        try {
            int logsManipulados = anomalyDetectionService.verificarIntegridadLogs();

            String mensaje = logsManipulados > 0
                    ? String.format("⚠️ ALERTA: %d logs manipulados detectados", logsManipulados)
                    : "✅ Integridad de logs verificada correctamente";

            return ResponseEntity.ok(Map.of(
                    "status", 200,
                    "logs_manipulados", logsManipulados,
                    "integridad_comprometida", logsManipulados > 0,
                    "message", mensaje
            ));
        } catch (Exception e) {
            log.error("❌ Error al verificar integridad: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "status", 500,
                    "error", "Error al verificar integridad",
                    "message", e.getMessage()
            ));
        }
    }
}
