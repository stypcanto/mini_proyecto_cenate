package styp.com.cenate.service;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import styp.com.cenate.model.AuditLog;
import styp.com.cenate.repository.AuditLogRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    /**
     * Registrar una acción en el sistema de auditoría
     */
    @Async
    @Transactional
    public void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request) {
        try {
            String usuario = obtenerUsuarioActual();
            String ipAddress = obtenerIpCliente(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "System";

            AuditLog log = AuditLog.builder()
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

            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Error al registrar log de auditoría: {}", e.getMessage());
        }
    }

    /**
     * Registrar login exitoso
     */
    @Async
    @Transactional
    public void registrarLogin(String usuario, HttpServletRequest request) {
        registrarAccion("LOGIN", "AUTH", "Usuario inició sesión", "INFO", request);
    }

    /**
     * Registrar logout
     */
    @Async
    @Transactional
    public void registrarLogout(String usuario, HttpServletRequest request) {
        registrarAccion("LOGOUT", "AUTH", "Usuario cerró sesión", "INFO", request);
    }

    /**
     * Registrar error
     */
    @Async
    @Transactional
    public void registrarError(String action, String modulo, String detalle, HttpServletRequest request) {
        try {
            String usuario = obtenerUsuarioActual();
            String ipAddress = obtenerIpCliente(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "System";

            AuditLog log = AuditLog.builder()
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

            auditLogRepository.save(log);
        } catch (Exception e) {
            log.error("Error al registrar error en auditoría: {}", e.getMessage());
        }
    }

    /**
     * Obtener logs paginados
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> obtenerLogs(int page, int size, String sortBy, String direction) {
        Sort.Direction dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));
        return auditLogRepository.findAll(pageable);
    }

    /**
     * Buscar logs por usuario
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> buscarPorUsuario(String usuario, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        return auditLogRepository.findByUsuario(usuario, pageable);
    }

    /**
     * Buscar logs por rango de fechas
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        return auditLogRepository.findByFechaHoraBetween(inicio, fin, pageable);
    }

    /**
     * Obtener últimos 10 logs
     */
    @Transactional(readOnly = true)
    public List<AuditLog> obtenerUltimosLogs() {
        return auditLogRepository.findTop10ByOrderByFechaHoraDesc();
    }

    /**
     * Obtener estadísticas del sistema
     */
    @Transactional(readOnly = true)
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        
        // Total de logs
        stats.put("totalLogs", auditLogRepository.count());
        
        // Logs por módulo
        List<Object[]> logsPorModulo = auditLogRepository.countByModulo();
        stats.put("logsPorModulo", logsPorModulo);
        
        // Actividad de usuarios (últimos 30 días)
        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);
        List<Object[]> actividadUsuarios = auditLogRepository.getActividadUsuarios(hace30Dias);
        stats.put("actividadUsuarios", actividadUsuarios);
        
        // Últimos errores
        Pageable pageable = PageRequest.of(0, 5);
        List<AuditLog> erroresRecientes = auditLogRepository.findRecentErrors(pageable);
        stats.put("erroresRecientes", erroresRecientes);
        
        return stats;
    }

    /**
     * Búsqueda avanzada de logs
     */
    @Transactional(readOnly = true)
    public Page<AuditLog> busquedaAvanzada(
            String usuario, String action, String modulo, String nivel, String estado,
            LocalDateTime fechaInicio, LocalDateTime fechaFin, int page, int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fechaHora"));
        
        return auditLogRepository.busquedaAvanzada(
                usuario, action, modulo, nivel, estado, fechaInicio, fechaFin, pageable
        );
    }

    // ==================== MÉTODOS AUXILIARES ====================

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

        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        
        // Si hay múltiples IPs, tomar la primera
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        
        return ip != null ? ip : "127.0.0.1";
    }
}
