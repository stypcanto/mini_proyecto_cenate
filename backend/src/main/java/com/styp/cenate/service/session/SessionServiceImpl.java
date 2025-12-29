package com.styp.cenate.service.session;

import com.styp.cenate.model.ActiveSession;
import com.styp.cenate.repository.ActiveSessionRepository;
import com.styp.cenate.service.auditlog.AuditLogService;
import com.styp.cenate.util.RequestContextUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementación del servicio de gestión de sesiones
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SessionServiceImpl implements SessionService {

    private final ActiveSessionRepository activeSessionRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public String registrarNuevaSesion(Long userId, String username, String ipAddress, String userAgent) {
        // Generar ID único de sesión
        String sessionId = UUID.randomUUID().toString();

        // Parsear información del user-agent
        RequestContextUtil.UserAgentInfo uaInfo = RequestContextUtil.parseUserAgent(userAgent);

        // Crear nueva sesión
        ActiveSession session = new ActiveSession();
        session.setSessionId(sessionId);
        session.setUserId(userId);
        session.setUsername(username);
        session.setIpAddress(ipAddress);
        session.setUserAgent(userAgent);
        session.setDeviceType(uaInfo.getDeviceType());
        session.setBrowser(uaInfo.getBrowser());
        session.setOs(uaInfo.getOs());
        session.setLoginTime(LocalDateTime.now());
        session.setLastActivity(LocalDateTime.now());
        session.setIsActive(true);

        activeSessionRepository.save(session);

        log.info("🔓 Nueva sesión registrada: {} - Usuario: {} desde {} ({}, {}, {})",
            sessionId, username, ipAddress, uaInfo.getDeviceType(), uaInfo.getBrowser(), uaInfo.getOs());

        // Detectar sesiones concurrentes
        detectarYAuditarSesionesConcurrentes(username, sessionId, ipAddress);

        return sessionId;
    }

    @Override
    @Transactional
    public void cerrarSesion(String sessionId) {
        activeSessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            Duration duracion = Duration.between(session.getLoginTime(), LocalDateTime.now());

            session.cerrarSesion();
            activeSessionRepository.save(session);

            // 🔒 AUDITORÍA
            auditLogService.registrarEvento(
                session.getUsername(),
                "LOGOUT",
                "AUTH",
                String.format("Sesión cerrada. Duración: %d minutos (Session ID: %s)",
                    duracion.toMinutes(), sessionId),
                "INFO",
                "SUCCESS"
            );

            log.info("🔒 Sesión cerrada: {} - Usuario: {} - Duración: {} minutos",
                sessionId, session.getUsername(), duracion.toMinutes());
        });
    }

    @Override
    @Transactional
    public void actualizarActividad(String sessionId) {
        activeSessionRepository.findBySessionId(sessionId).ifPresent(session -> {
            session.actualizarActividad();
            activeSessionRepository.save(session);
            log.debug("♻️ Actividad actualizada: {} - Usuario: {}", sessionId, session.getUsername());
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActiveSession> obtenerSesionesActivas(String username) {
        return activeSessionRepository.findByUsernameAndIsActiveTrue(username);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean tieneSesionesConcurrentes(String username) {
        Long count = activeSessionRepository.countByUsernameAndIsActiveTrue(username);
        return count != null && count > 1;
    }

    @Override
    @Transactional
    public void cerrarTodasLasSesiones(String username) {
        List<ActiveSession> sesiones = activeSessionRepository.findByUsernameAndIsActiveTrue(username);

        for (ActiveSession session : sesiones) {
            session.cerrarSesion();
            activeSessionRepository.save(session);
        }

        if (!sesiones.isEmpty()) {
            // 🔒 AUDITORÍA
            auditLogService.registrarEvento(
                username,
                "LOGOUT_ALL_SESSIONS",
                "AUTH",
                String.format("Todas las sesiones cerradas (%d sesiones)", sesiones.size()),
                "WARNING",
                "SUCCESS"
            );

            log.warn("🔒 Todas las sesiones cerradas para usuario: {} ({} sesiones)", username, sesiones.size());
        }
    }

    @Override
    @Transactional
    public int limpiarSesionesInactivas() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        List<ActiveSession> inactiveSessions = activeSessionRepository
            .findByIsActiveTrueAndLastActivityBefore(threshold);

        int count = 0;
        for (ActiveSession session : inactiveSessions) {
            Duration duracion = Duration.between(session.getLoginTime(), LocalDateTime.now());

            session.cerrarSesion();
            activeSessionRepository.save(session);

            // 🔒 AUDITORÍA
            auditLogService.registrarEvento(
                session.getUsername(),
                "SESSION_TIMEOUT",
                "AUTH",
                String.format("Sesión cerrada por inactividad (>30 min). Duración total: %d min (Session ID: %s)",
                    duracion.toMinutes(), session.getSessionId()),
                "INFO",
                "SUCCESS"
            );

            count++;
        }

        if (count > 0) {
            log.info("🧹 Limpiadas {} sesiones inactivas", count);
        }

        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();

        // Total de sesiones activas
        Long sesionesActivas = activeSessionRepository.countByIsActiveTrue();
        stats.put("sesionesActivas", sesionesActivas != null ? sesionesActivas : 0L);

        // Usuarios únicos conectados
        Long usuariosConectados = activeSessionRepository.countDistinctActiveUsers();
        stats.put("usuariosConectados", usuariosConectados != null ? usuariosConectados : 0L);

        // Sesiones concurrentes
        List<Object[]> concurrent = activeSessionRepository.findUsersWithConcurrentSessions();
        stats.put("sesionesConcurrentes", concurrent.size());

        // Sesiones por tipo de dispositivo
        List<Object[]> byDevice = activeSessionRepository.countSessionsByDeviceType();
        Map<String, Long> deviceStats = new HashMap<>();
        byDevice.forEach(row -> deviceStats.put((String) row[0], (Long) row[1]));
        stats.put("porDispositivo", deviceStats);

        // Sesiones por navegador
        List<Object[]> byBrowser = activeSessionRepository.countSessionsByBrowser();
        Map<String, Long> browserStats = new HashMap<>();
        byBrowser.forEach(row -> browserStats.put((String) row[0], (Long) row[1]));
        stats.put("porNavegador", browserStats);

        // Duración promedio (últimas 24h)
        Double avgDuration = activeSessionRepository.getAverageSessionDuration(
            LocalDateTime.now().minusHours(24)
        );
        stats.put("duracionPromedioMinutos", avgDuration != null ? avgDuration.intValue() : 0);

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ActiveSession> buscarPorSessionId(String sessionId) {
        return activeSessionRepository.findBySessionId(sessionId);
    }

    @Override
    @Transactional(readOnly = true)
    public Long contarSesionesActivas() {
        return activeSessionRepository.countByIsActiveTrue();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActiveSession> detectarAccesosSospechosos(String username, String currentIp) {
        return activeSessionRepository.findSuspiciousSessions(username, currentIp);
    }

    /**
     * Detecta y audita sesiones concurrentes
     */
    private void detectarYAuditarSesionesConcurrentes(String username, String currentSessionId, String currentIp) {
        List<ActiveSession> activeSessions = activeSessionRepository.findByUsernameAndIsActiveTrue(username);

        // Si tiene más de una sesión activa (incluyendo la recién creada)
        if (activeSessions.size() > 1) {
            // Recolectar IPs de todas las sesiones
            Set<String> ips = new HashSet<>();
            activeSessions.forEach(s -> ips.add(s.getIpAddress()));

            // 🚨 ALERTA DE SESIÓN CONCURRENTE
            auditLogService.registrarEvento(
                username,
                "CONCURRENT_SESSION_DETECTED",
                "SECURITY",
                String.format("Sesión concurrente detectada. Usuario tiene %d sesiones activas desde IPs: %s",
                    activeSessions.size(),
                    String.join(", ", ips)
                ),
                "WARNING",
                "SUCCESS"
            );

            log.warn("🚨 [SEGURIDAD] Sesión concurrente detectada - Usuario: {} - Sesiones: {} - IPs: {}",
                username, activeSessions.size(), String.join(", ", ips));
        }
    }
}
