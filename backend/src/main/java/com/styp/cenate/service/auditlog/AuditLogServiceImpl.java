package com.styp.cenate.service.auditlog;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.styp.cenate.model.AuditLog;
import com.styp.cenate.repository.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Implementación del servicio de auditoría del sistema.
 * Registra acciones, errores, logins y otras operaciones relevantes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // ======================================================
    // ✅ REGISTRO DE ACCIONES
    // ======================================================

    @Async
    @Transactional
    @Override
    public void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request) {
        try {
            String usuario = obtenerUsuarioActual();
            String ipAddress = obtenerIpCliente(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "System";

            AuditLog logEntity = AuditLog.builder()
                    .usuario(usuario)
                    .action(action)
                    .modulo(modulo)
                    .detalle(detalle)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .nivel(nivel)
                    .estado("SUCCESS")
                    .fechaHora(LocalDateTime.now())
                    .build();

            auditLogRepository.save(logEntity);
            log.debug("📝 Log registrado: [{} - {}]", usuario, action);
        } catch (Exception e) {
            log.error("Error al registrar log de auditoría: {}", e.getMessage(), e);
        }
    }

    @Async
    @Transactional
    @Override
    public void registrarLogin(String usuario, HttpServletRequest request) {
        registrarAccion("LOGIN", "AUTH", "Usuario inició sesión", "INFO", request);
    }

    @Async
    @Transactional
    @Override
    public void registrarLogout(String usuario, HttpServletRequest request) {
        registrarAccion("LOGOUT", "AUTH", "Usuario cerró sesión", "INFO", request);
    }

    @Async
    @Transactional
    @Override
    public void registrarError(String action, String modulo, String detalle, HttpServletRequest request) {
        try {
            String usuario = obtenerUsuarioActual();
            String ipAddress = obtenerIpCliente(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "System";

            AuditLog logEntity = AuditLog.builder()
                    .usuario(usuario)
                    .action(action)
                    .modulo(modulo)
                    .detalle(detalle)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .nivel("ERROR")
                    .estado("FAILURE")
                    .fechaHora(LocalDateTime.now())
                    .build();

            auditLogRepository.save(logEntity);
            log.warn("⚠️ Error registrado en auditoría: {}", detalle);
        } catch (Exception e) {
            log.error("Error al registrar error en auditoría: {}", e.getMessage(), e);
        }
    }

    // ======================================================
    // 📊 CONSULTAS
    // ======================================================

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> obtenerLogs(int page, int size, String sortBy, String direction) {
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return auditLogRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> buscarPorUsuario(String usuario, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        return auditLogRepository.findByUsuario(usuario, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        return auditLogRepository.findByFechaHoraBetween(inicio, fin, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> obtenerUltimosLogs() {
        return auditLogRepository.findTop10ByOrderByFechaHoraDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalLogs", auditLogRepository.count());
        stats.put("logsPorModulo", auditLogRepository.countByModulo());

        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);
        stats.put("actividadUsuarios", auditLogRepository.getActividadUsuarios(hace30Dias));

        Pageable pageable = PageRequest.of(0, 5);
        stats.put("erroresRecientes", auditLogRepository.findRecentErrors(pageable));

        return stats;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> busquedaAvanzada(
            String usuario, String action, String modulo, String nivel, String estado,
            LocalDateTime fechaInicio, LocalDateTime fechaFin, int page, int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        return auditLogRepository.busquedaAvanzada(usuario, action, modulo, nivel, estado, fechaInicio, fechaFin, pageable);
    }

    // ======================================================
    // ⚙️ MÉTODOS AUXILIARES
    // ======================================================

    private String obtenerUsuarioActual() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("No se pudo obtener usuario actual: {}", e.getMessage());
        }
        return "SYSTEM";
    }

    private String obtenerIpCliente(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = Optional.ofNullable(request.getHeader("X-Forwarded-For"))
                .orElseGet(() -> request.getRemoteAddr());
        if (ip.contains(",")) ip = ip.split(",")[0].trim();
        return ip;
    }
}