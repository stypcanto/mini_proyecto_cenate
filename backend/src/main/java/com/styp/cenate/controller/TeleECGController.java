package com.styp.cenate.controller;

import com.styp.cenate.dto.TeleECGAnalyticsDTO;
import com.styp.cenate.service.teleecg.TeleECGAnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * Controlador REST para gestión de TeleECG (v1.72.0)
 *
 * Endpoints:
 * - GET /api/teleecg/analytics - Dashboard analítico con métricas médicas
 *
 * Seguridad:
 * - @PreAuthorize requiere permisos específicos
 * - Logs de auditoría para accesos
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2026-02-11
 */
@RestController
@RequestMapping("/api/teleecg")
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class TeleECGController {

    @Autowired
    private TeleECGAnalyticsService analyticsService;

    /**
     * Obtiene métricas analíticas para el dashboard médico
     *
     * Responsabilidades:
     * - Validar parámetros
     * - Llamar servicio de analytics
     * - Retornar DTO con todas las métricas
     *
     * Métricas incluidas:
     * - Distribución por hallazgos (NORMAL/ANORMAL/SIN_EVALUAR)
     * - TAT promedio (general, urgentes, no urgentes)
     * - SLA cumplimiento (meta 15 min)
     * - Tasa de rechazo por IPRESS
     * - Tendencias comparativas (↑↓%)
     *
     * @param fechaDesde Fecha inicial del período (YYYY-MM-DD)
     * @param fechaHasta Fecha final del período (YYYY-MM-DD)
     * @param idIpress ID de IPRESS a filtrar (opcional)
     * @param evaluacion Tipo de evaluación a filtrar (optional: NORMAL, ANORMAL, SIN_EVALUAR)
     * @param esUrgente Filtrar solo urgentes (optional: true, false)
     * @return DTO con todas las métricas calculadas
     *
     * @example
     * GET /api/teleecg/analytics?fechaDesde=2026-01-11&fechaHasta=2026-02-11
     * GET /api/teleecg/analytics?fechaDesde=2026-02-01&fechaHasta=2026-02-11&idIpress=5&evaluacion=ANORMAL
     * GET /api/teleecg/analytics?fechaDesde=2026-02-01&fechaHasta=2026-02-11&esUrgente=true
     */
    @GetMapping("/analytics")
    @PreAuthorize("hasAnyAuthority('VER_DASHBOARD_TELEECG', 'ADMIN', 'MEDICO', 'COORDINADOR')")
    public ResponseEntity<TeleECGAnalyticsDTO> getAnalytics(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaDesde,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fechaHasta,

            @RequestParam(required = false)
            Long idIpress,

            @RequestParam(required = false)
            String evaluacion,

            @RequestParam(required = false)
            Boolean esUrgente) {

        log.info("📊 [TeleECG Analytics] Solicitud: desde {} hasta {} (IPRESS: {}, Evaluacion: {}, Urgente: {})",
                fechaDesde, fechaHasta, idIpress, evaluacion, esUrgente);

        try {
            // Validaciones básicas
            if (fechaDesde.isAfter(fechaHasta)) {
                log.warn("❌ Fecha desde es posterior a fecha hasta");
                return ResponseEntity.badRequest().build();
            }

            // Llamar servicio
            TeleECGAnalyticsDTO analytics = analyticsService.calcularAnalytics(
                    fechaDesde,
                    fechaHasta,
                    idIpress,
                    evaluacion,
                    esUrgente
            );

            log.info("✅ [TeleECG Analytics] Retornando {} ECGs analizados", analytics.getTotalEcgs());

            return ResponseEntity.ok(analytics);

        } catch (IllegalArgumentException e) {
            log.error("❌ [TeleECG Analytics] Parámetro inválido: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            log.error("❌ [TeleECG Analytics] Error interno", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Health check para el servicio TeleECG
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("TeleECG Service is running (v1.72.0)");
    }
}
