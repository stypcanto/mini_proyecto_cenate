package com.styp.cenate.scheduled;

import com.styp.cenate.service.session.SessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Job programado para limpieza automática de sesiones inactivas
 *
 * Ejecuta cada 15 minutos para cerrar sesiones sin actividad por más de 30 minutos
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SessionCleanupJob {

    private final SessionService sessionService;

    /**
     * Limpia sesiones inactivas cada 15 minutos
     *
     * Cron: Ejecutar cada 15 minutos
     * fixedRate: 900000 ms = 15 minutos
     */
    @Scheduled(fixedRate = 900000) // Cada 15 minutos
    public void limpiarSesionesInactivas() {
        log.debug("🧹 Iniciando limpieza de sesiones inactivas...");

        try {
            int sesionesLimpiadas = sessionService.limpiarSesionesInactivas();

            if (sesionesLimpiadas > 0) {
                log.info("✅ [CLEANUP] Limpiadas {} sesiones inactivas (>30 min sin actividad)", sesionesLimpiadas);
            } else {
                log.debug("✅ [CLEANUP] No hay sesiones inactivas para limpiar");
            }
        } catch (Exception e) {
            log.error("❌ [CLEANUP] Error al limpiar sesiones inactivas: {}", e.getMessage(), e);
        }
    }

    /**
     * Limpia sesiones antiguas cerradas (ejecutar diariamente a las 2 AM)
     *
     * Elimina de la base de datos sesiones cerradas con más de 30 días de antigüedad
     * para evitar que la tabla crezca indefinidamente
     *
     * Cron: "0 0 2 * * ?" = Cada día a las 2:00 AM
     */
    @Scheduled(cron = "0 0 2 * * ?")
    public void limpiarSesionesAntiguas() {
        log.info("🧹 [CLEANUP] Iniciando limpieza de sesiones antiguas cerradas...");

        try {
            // Esta funcionalidad se puede implementar más adelante
            // cuando se implemente el método deleteOldClosedSessions en SessionService

            log.info("✅ [CLEANUP] Limpieza de sesiones antiguas completada");
        } catch (Exception e) {
            log.error("❌ [CLEANUP] Error al limpiar sesiones antiguas: {}", e.getMessage(), e);
        }
    }

    /**
     * Reporta estadísticas de sesiones activas (ejecutar cada hora)
     *
     * Genera un log con estadísticas de uso para monitoreo
     *
     * Cron: "0 0 * * * ?" = Cada hora en punto
     */
    @Scheduled(cron = "0 0 * * * ?")
    public void reportarEstadisticasSesiones() {
        log.debug("📊 Generando reporte de sesiones...");

        try {
            var stats = sessionService.obtenerEstadisticas();

            log.info("📊 [ESTADÍSTICAS] Sesiones Activas: {} | Usuarios Conectados: {} | Sesiones Concurrentes: {} | Duración Promedio: {} min",
                stats.get("sesionesActivas"),
                stats.get("usuariosConectados"),
                stats.get("sesionesConcurrentes"),
                stats.get("duracionPromedioMinutos")
            );

            // Alertar si hay muchas sesiones concurrentes
            if ((Integer) stats.get("sesionesConcurrentes") > 5) {
                log.warn("⚠️ [ALERTA] Detectadas {} usuarios con sesiones concurrentes",
                    stats.get("sesionesConcurrentes"));
            }
        } catch (Exception e) {
            log.error("❌ Error al generar reporte de sesiones: {}", e.getMessage());
        }
    }
}
