package com.styp.cenate.service.auditlog;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.model.AuditLog;
import com.styp.cenate.repository.AuditLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Data
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    // ============================================================
    // 🔍 CONSULTAS
    // ============================================================
    @Override
    public Page<AuditLog> obtenerLogs(int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return auditLogRepository.findAll(pageable);
    }

    @Override
    public Page<AuditLog> buscarPorUsuario(String username, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaHora").descending());
        return auditLogRepository.findByUsuarioContainingIgnoreCase(username, pageable);
    }

    @Override
    public Page<AuditLog> buscarPorFechas(LocalDateTime inicio, LocalDateTime fin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaHora").descending());
        return auditLogRepository.findByFechaHoraBetween(inicio, fin, pageable);
    }

    @Override
    public List<AuditLog> obtenerUltimosLogs() {
        return auditLogRepository.findTop10ByOrderByFechaHoraDesc();
    }

    @Override
    public Map<String, Object> obtenerEstadisticas() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalLogs", auditLogRepository.count());
        stats.put("ultimoEvento", auditLogRepository.findTop1ByOrderByFechaHoraDesc());
        return stats;
    }

    @Override
    public Page<AuditLog> busquedaAvanzada(String usuario, String action, String modulo, String nivel, String estado,
                                           LocalDateTime inicio, LocalDateTime fin, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaHora").descending());
        return auditLogRepository.busquedaAvanzada(usuario, action, modulo, nivel, estado, inicio, fin, pageable);
    }

    // ============================================================
    // 🧾 REGISTROS GENÉRICOS
    // ============================================================
    @Override
    @Transactional
    public void registrarEvento(String usuario, String action, String modulo, String detalle, String nivel, String estado) {
        AuditLog logEntity = new AuditLog();
        logEntity.setUsuario(usuario);
        logEntity.setAction(action);
        logEntity.setModulo(modulo);
        logEntity.setDetalle(detalle);
        logEntity.setNivel(nivel);
        logEntity.setEstado(estado);
        logEntity.setFechaHora(LocalDateTime.now());
        auditLogRepository.save(logEntity);
        log.info("📝 [{}] [{}] {}", modulo, action, usuario);
    }

    // ============================================================
    // 🔐 MÉTODOS USADOS EN AuthController
    // ============================================================
    @Override
    @Transactional
    public void registrarLogin(String username, HttpServletRequest request) {
        String ip = obtenerIP(request);
        String agente = request.getHeader("User-Agent");
        registrarEvento(username, "LOGIN", "AUTH",
                "Usuario inició sesión desde IP " + ip + " con agente " + agente,
                "INFO", "SUCCESS");
    }

    @Override
    @Transactional
    public void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request) {
        String ip = obtenerIP(request);
        registrarEvento(obtenerUsuarioRequest(request), action, modulo,
                detalle + " (IP: " + ip + ")", nivel, "SUCCESS");
    }

    @Override
    @Transactional
    public void registrarError(String action, String modulo, String mensaje, HttpServletRequest request) {
        String ip = obtenerIP(request);
        registrarEvento(obtenerUsuarioRequest(request), action, modulo,
                mensaje + " (IP: " + ip + ")", "ERROR", "FAILED");
    }

    // ============================================================
    // 🧠 UTILITARIOS
    // ============================================================
    private String obtenerIP(HttpServletRequest request) {
        if (request == null) return "UNKNOWN";
        String ip = request.getHeader("X-Forwarded-For");
        return ip != null ? ip.split(",")[0] : request.getRemoteAddr();
    }

    private String obtenerUsuarioRequest(HttpServletRequest request) {
        try {
            return (request != null && request.getUserPrincipal() != null)
                    ? request.getUserPrincipal().getName()
                    : "SYSTEM";
        } catch (Exception e) {
            return "SYSTEM";
        }
    }
}
