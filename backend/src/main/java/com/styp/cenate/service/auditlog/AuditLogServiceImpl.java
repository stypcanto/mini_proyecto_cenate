package com.styp.cenate.service.auditlog;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;

import com.styp.cenate.model.AuditLog;
import com.styp.cenate.repository.AuditLogRepository;
import com.styp.cenate.util.RequestContextUtil;
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

        // 🆕 CAPTURAR CONTEXTO HTTP (IP + User-Agent)
        try {
            RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
            logEntity.setIpAddress(context.getIp());
            logEntity.setUserAgent(context.getUserAgent());
        } catch (Exception e) {
            log.debug("No se pudo capturar contexto HTTP: {}", e.getMessage());
            logEntity.setIpAddress("INTERNAL");
            logEntity.setUserAgent("SYSTEM");
        }

        auditLogRepository.save(logEntity);
        log.info("📝 [{}] [{}] {} desde {}", modulo, action, usuario, logEntity.getIpAddress());
    }

    // ============================================================
    // 🔐 MÉTODOS USADOS EN AuthController
    // ============================================================
    @Override
    @Transactional
    public void registrarLogin(String username, HttpServletRequest request) {
        RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
        RequestContextUtil.UserAgentInfo uaInfo = RequestContextUtil.parseUserAgent(context.getUserAgent());

        registrarEvento(username, "LOGIN", "AUTH",
                String.format("Usuario inició sesión desde %s (%s, %s, %s)",
                    context.getIp(), uaInfo.getBrowser(), uaInfo.getOs(), uaInfo.getDeviceType()),
                "INFO", "SUCCESS");
    }

    @Override
    @Transactional
    public void registrarAccion(String action, String modulo, String detalle, String nivel, HttpServletRequest request) {
        RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
        registrarEvento(obtenerUsuarioRequest(request), action, modulo,
                detalle + " (IP: " + context.getIp() + ")", nivel, "SUCCESS");
    }

    @Override
    @Transactional
    public void registrarError(String action, String modulo, String mensaje, HttpServletRequest request) {
        RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
        registrarEvento(obtenerUsuarioRequest(request), action, modulo,
                mensaje + " (IP: " + context.getIp() + ")", "ERROR", "FAILED");
    }

    // ============================================================
    // 🧠 UTILITARIOS
    // ============================================================
    private String obtenerUsuarioRequest(HttpServletRequest request) {
        try {
            return (request != null && request.getUserPrincipal() != null)
                    ? request.getUserPrincipal().getName()
                    : "SYSTEM";
        } catch (Exception e) {
            return "SYSTEM";
        }
    }

    // ============================================================
    // 🔍 TRACKING DE CAMBIOS (BEFORE/AFTER)
    // ============================================================
    /**
     * Registra un evento de auditoría con tracking de cambios (before/after)
     *
     * @param usuario Usuario que realizó la acción
     * @param action Código de acción
     * @param modulo Módulo del sistema
     * @param detalle Descripción de la acción
     * @param nivel Nivel de severidad
     * @param estado Estado de la operación
     * @param idAfectado ID del registro afectado
     * @param datosPrevios Datos previos (Map que se convertirá a JSON)
     * @param datosNuevos Datos nuevos (Map que se convertirá a JSON)
     */
    @Transactional
    public void registrarEventoConDiff(
        String usuario,
        String action,
        String modulo,
        String detalle,
        String nivel,
        String estado,
        Long idAfectado,
        Map<String, Object> datosPrevios,
        Map<String, Object> datosNuevos
    ) {
        AuditLog logEntity = new AuditLog();
        logEntity.setUsuario(usuario);
        logEntity.setAction(action);
        logEntity.setModulo(modulo);
        logEntity.setNivel(nivel);
        logEntity.setEstado(estado);
        logEntity.setFechaHora(LocalDateTime.now());
        logEntity.setIdAfectado(idAfectado);

        // Construir detalle con lista de cambios
        StringBuilder detalleBuilder = new StringBuilder(detalle);
        if (datosPrevios != null && datosNuevos != null) {
            detalleBuilder.append(" - Cambios: ");
            datosPrevios.forEach((key, oldValue) -> {
                Object newValue = datosNuevos.get(key);
                if (!java.util.Objects.equals(oldValue, newValue)) {
                    detalleBuilder.append(String.format("[%s: '%s' → '%s'] ", key, oldValue, newValue));
                }
            });
        }
        logEntity.setDetalle(detalleBuilder.toString());

        // Convertir Maps a JSON
        try {
            if (datosPrevios != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                logEntity.setDatosPrevios(mapper.writeValueAsString(datosPrevios));
            }
            if (datosNuevos != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                logEntity.setDatosNuevos(mapper.writeValueAsString(datosNuevos));
            }
        } catch (Exception e) {
            log.warn("⚠️ Error al convertir datos a JSON: {}", e.getMessage());
        }

        // Capturar contexto HTTP
        try {
            RequestContextUtil.AuditContext context = RequestContextUtil.getAuditContext();
            logEntity.setIpAddress(context.getIp());
            logEntity.setUserAgent(context.getUserAgent());
        } catch (Exception e) {
            log.debug("No se pudo capturar contexto HTTP: {}", e.getMessage());
            logEntity.setIpAddress("INTERNAL");
            logEntity.setUserAgent("SYSTEM");
        }

        auditLogRepository.save(logEntity);
        log.info("📝 [DIFF] [{}] [{}] {} - ID afectado: {}", modulo, action, usuario, idAfectado);
    }
}
