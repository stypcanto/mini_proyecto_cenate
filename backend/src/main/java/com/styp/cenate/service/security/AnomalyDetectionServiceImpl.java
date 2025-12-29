package com.styp.cenate.service.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.styp.cenate.model.ActiveSession;
import com.styp.cenate.model.AuditLog;
import com.styp.cenate.model.SecurityAlert;
import com.styp.cenate.repository.ActiveSessionRepository;
import com.styp.cenate.repository.AuditLogRepository;
import com.styp.cenate.repository.SecurityAlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 🔍 Implementación del Servicio de Detección de Anomalías de Seguridad
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AnomalyDetectionServiceImpl implements AnomalyDetectionService {

    private final AuditLogRepository auditLogRepository;
    private final SecurityAlertRepository securityAlertRepository;
    private final ActiveSessionRepository activeSessionRepository;
    private final ObjectMapper objectMapper;

    // ============================================================
    // CONFIGURACIÓN DE UMBRALES
    // ============================================================
    private static final int BRUTE_FORCE_THRESHOLD = 5;           // Intentos fallidos en 15 min
    private static final int BRUTE_FORCE_MINUTES = 15;
    private static final int UNUSUAL_ACTIVITY_THRESHOLD = 50;      // Acciones en 10 min
    private static final int UNUSUAL_ACTIVITY_MINUTES = 10;
    private static final int MASS_EXPORT_THRESHOLD = 10;           // Exportaciones en 1 hora
    private static final int MASS_EXPORT_HOURS = 1;
    private static final int PERMISSION_CHANGE_THRESHOLD = 5;      // Cambios de permisos en 30 min
    private static final int PERMISSION_CHANGE_MINUTES = 30;

    private static final LocalTime HORARIO_INICIO = LocalTime.of(7, 0);   // 7:00 AM
    private static final LocalTime HORARIO_FIN = LocalTime.of(19, 0);     // 7:00 PM

    // ============================================================
    // DETECCIÓN DE FUERZA BRUTA
    // ============================================================
    @Override
    @Transactional
    public boolean detectarBruteForce(String username) {
        LocalDateTime desde = LocalDateTime.now().minusMinutes(BRUTE_FORCE_MINUTES);

        long intentosFallidos = auditLogRepository.countByUsuarioAndActionAndFechaHoraAfter(
                username, "LOGIN_FAILED", desde);

        if (intentosFallidos >= BRUTE_FORCE_THRESHOLD) {
            log.warn("🚨 BRUTE FORCE detectado para usuario: {} ({} intentos en {} min)",
                    username, intentosFallidos, BRUTE_FORCE_MINUTES);

            crearAlerta(
                    SecurityAlert.AlertType.BRUTE_FORCE,
                    SecurityAlert.Severity.HIGH,
                    username,
                    null,
                    String.format("Detectados %d intentos fallidos de login en %d minutos",
                            intentosFallidos, BRUTE_FORCE_MINUTES),
                    Map.of(
                            "intentos", intentosFallidos,
                            "periodo_minutos", BRUTE_FORCE_MINUTES,
                            "timestamp", LocalDateTime.now().toString()
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE SESIONES CONCURRENTES SOSPECHOSAS
    // ============================================================
    @Override
    @Transactional
    public boolean detectarSesionesConcurrentesSospechosas(String username, String currentIp) {
        List<ActiveSession> sesionesActivas = activeSessionRepository
                .findByUsernameAndIsActiveTrue(username);

        // Filtrar sesiones desde IPs diferentes
        List<ActiveSession> sesionesDiferentesIPs = sesionesActivas.stream()
                .filter(s -> !s.getIpAddress().equals(currentIp))
                .collect(Collectors.toList());

        if (!sesionesDiferentesIPs.isEmpty()) {
            log.warn("🚨 SESIONES CONCURRENTES sospechosas para usuario: {} (IPs: {})",
                    username,
                    sesionesDiferentesIPs.stream()
                            .map(ActiveSession::getIpAddress)
                            .collect(Collectors.joining(", ")));

            List<String> ips = sesionesActivas.stream()
                    .map(ActiveSession::getIpAddress)
                    .distinct()
                    .collect(Collectors.toList());

            crearAlerta(
                    SecurityAlert.AlertType.CONCURRENT_SESSION,
                    SecurityAlert.Severity.HIGH,
                    username,
                    currentIp,
                    String.format("Detectadas %d sesiones activas desde %d IPs diferentes",
                            sesionesActivas.size(), ips.size()),
                    Map.of(
                            "total_sesiones", sesionesActivas.size(),
                            "ips", ips,
                            "ip_actual", currentIp
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE UBICACIÓN INUSUAL
    // ============================================================
    @Override
    @Transactional
    public boolean detectarUbicacionInusual(String username, String ipAddress) {
        // Buscar logins históricos del usuario
        LocalDateTime hace30Dias = LocalDateTime.now().minusDays(30);
        List<AuditLog> loginsHistoricos = auditLogRepository.findByUsuarioAndActionAndFechaHoraAfter(
                username, "LOGIN", hace30Dias);

        // Obtener IPs conocidas
        Set<String> ipsConocidas = loginsHistoricos.stream()
                .map(AuditLog::getIpAddress)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Si la IP es nueva y hay historial previo, es sospechoso
        if (!ipsConocidas.isEmpty() && !ipsConocidas.contains(ipAddress)) {
            log.warn("🚨 UBICACIÓN INUSUAL detectada para usuario: {} (IP nueva: {}, IPs conocidas: {})",
                    username, ipAddress, ipsConocidas.size());

            crearAlerta(
                    SecurityAlert.AlertType.UNUSUAL_LOCATION,
                    SecurityAlert.Severity.MEDIUM,
                    username,
                    ipAddress,
                    String.format("Acceso desde IP nunca vista: %s (IPs conocidas: %d)",
                            ipAddress, ipsConocidas.size()),
                    Map.of(
                            "ip_nueva", ipAddress,
                            "ips_conocidas_total", ipsConocidas.size(),
                            "ips_conocidas", new ArrayList<>(ipsConocidas)
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE ACCESO FUERA DE HORARIO
    // ============================================================
    @Override
    @Transactional
    public boolean detectarAccesoFueraHorario(String username) {
        LocalDateTime ahora = LocalDateTime.now();
        LocalTime hora = ahora.toLocalTime();
        DayOfWeek dia = ahora.getDayOfWeek();

        boolean esFueraHorario = hora.isBefore(HORARIO_INICIO) ||
                                 hora.isAfter(HORARIO_FIN) ||
                                 dia == DayOfWeek.SATURDAY ||
                                 dia == DayOfWeek.SUNDAY;

        if (esFueraHorario) {
            log.warn("🚨 ACCESO FUERA DE HORARIO detectado para usuario: {} ({})",
                    username, ahora);

            String razon = dia == DayOfWeek.SATURDAY || dia == DayOfWeek.SUNDAY
                    ? "Fin de semana"
                    : String.format("Fuera de horario laboral (%s)", hora);

            crearAlerta(
                    SecurityAlert.AlertType.OFF_HOURS_ACCESS,
                    SecurityAlert.Severity.MEDIUM,
                    username,
                    null,
                    String.format("Acceso fuera de horario laboral: %s", razon),
                    Map.of(
                            "timestamp", ahora.toString(),
                            "hora", hora.toString(),
                            "dia_semana", dia.name(),
                            "razon", razon
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE EXPORTACIÓN MASIVA
    // ============================================================
    @Override
    @Transactional
    public boolean detectarExportacionMasiva(String username) {
        LocalDateTime desde = LocalDateTime.now().minusHours(MASS_EXPORT_HOURS);

        long exportaciones = auditLogRepository.countByUsuarioAndActionContainingAndFechaHoraAfter(
                username, "EXPORT", desde);

        if (exportaciones >= MASS_EXPORT_THRESHOLD) {
            log.warn("🚨 EXPORTACIÓN MASIVA detectada para usuario: {} ({} exportaciones en {} hora)",
                    username, exportaciones, MASS_EXPORT_HOURS);

            crearAlerta(
                    SecurityAlert.AlertType.MASS_EXPORT,
                    SecurityAlert.Severity.HIGH,
                    username,
                    null,
                    String.format("Detectadas %d exportaciones en %d hora",
                            exportaciones, MASS_EXPORT_HOURS),
                    Map.of(
                            "total_exportaciones", exportaciones,
                            "periodo_horas", MASS_EXPORT_HOURS
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE CAMBIOS DE PERMISOS SOSPECHOSOS
    // ============================================================
    @Override
    @Transactional
    public boolean detectarCambiosPermisosSospechosos(String username) {
        LocalDateTime desde = LocalDateTime.now().minusMinutes(PERMISSION_CHANGE_MINUTES);

        long cambios = auditLogRepository.countByUsuarioAndActionInAndFechaHoraAfter(
                username,
                List.of("ASSIGN_ROLE", "REMOVE_ROLE", "ASSIGN_PERMISSION", "REMOVE_PERMISSION"),
                desde);

        if (cambios >= PERMISSION_CHANGE_THRESHOLD) {
            log.warn("🚨 CAMBIOS DE PERMISOS SOSPECHOSOS detectados para usuario: {} ({} cambios en {} min)",
                    username, cambios, PERMISSION_CHANGE_MINUTES);

            crearAlerta(
                    SecurityAlert.AlertType.PERMISSION_CHANGE,
                    SecurityAlert.Severity.HIGH,
                    username,
                    null,
                    String.format("Detectados %d cambios de permisos en %d minutos",
                            cambios, PERMISSION_CHANGE_MINUTES),
                    Map.of(
                            "total_cambios", cambios,
                            "periodo_minutos", PERMISSION_CHANGE_MINUTES
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // DETECCIÓN DE ACTIVIDAD INUSUAL GENERAL
    // ============================================================
    @Override
    @Transactional
    public boolean detectarActividadInusual(String username) {
        LocalDateTime desde = LocalDateTime.now().minusMinutes(UNUSUAL_ACTIVITY_MINUTES);

        long acciones = auditLogRepository.countByUsuarioAndFechaHoraAfter(username, desde);

        if (acciones >= UNUSUAL_ACTIVITY_THRESHOLD) {
            log.warn("🚨 ACTIVIDAD INUSUAL detectada para usuario: {} ({} acciones en {} min)",
                    username, acciones, UNUSUAL_ACTIVITY_MINUTES);

            crearAlerta(
                    SecurityAlert.AlertType.UNUSUAL_ACTIVITY,
                    SecurityAlert.Severity.MEDIUM,
                    username,
                    null,
                    String.format("Detectadas %d acciones en %d minutos (patrón inusual)",
                            acciones, UNUSUAL_ACTIVITY_MINUTES),
                    Map.of(
                            "total_acciones", acciones,
                            "periodo_minutos", UNUSUAL_ACTIVITY_MINUTES,
                            "umbral", UNUSUAL_ACTIVITY_THRESHOLD
                    )
            );

            return true;
        }

        return false;
    }

    // ============================================================
    // ANÁLISIS COMPLETO DE USUARIO
    // ============================================================
    @Override
    @Transactional
    public Map<String, Boolean> analizarUsuarioCompleto(String username) {
        log.info("🔍 Analizando usuario completo: {}", username);

        Map<String, Boolean> resultados = new HashMap<>();

        resultados.put("brute_force", detectarBruteForce(username));
        resultados.put("sesiones_concurrentes", detectarSesionesConcurrentesSospechosas(username, "ANALYSIS"));
        resultados.put("exportacion_masiva", detectarExportacionMasiva(username));
        resultados.put("cambios_permisos", detectarCambiosPermisosSospechosos(username));
        resultados.put("actividad_inusual", detectarActividadInusual(username));

        long alertasDetectadas = resultados.values().stream().filter(Boolean::booleanValue).count();

        log.info("✅ Análisis completo finalizado para {}: {} anomalías detectadas",
                username, alertasDetectadas);

        return resultados;
    }

    // ============================================================
    // ANÁLISIS AUTOMÁTICO DEL SISTEMA
    // ============================================================
    @Override
    @Transactional
    public int ejecutarAnalisisAutomatico() {
        log.info("🔍 Iniciando análisis automático de anomalías...");

        int alertasGeneradas = 0;

        // Obtener usuarios con actividad reciente (últimas 24 horas)
        LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
        List<String> usuariosActivos = auditLogRepository.findDistinctUsuariosByFechaHoraAfter(hace24h);

        log.info("📊 Analizando {} usuarios con actividad reciente", usuariosActivos.size());

        for (String usuario : usuariosActivos) {
            try {
                Map<String, Boolean> resultados = analizarUsuarioCompleto(usuario);
                long alertas = resultados.values().stream().filter(Boolean::booleanValue).count();
                alertasGeneradas += alertas;
            } catch (Exception e) {
                log.error("❌ Error al analizar usuario {}: {}", usuario, e.getMessage());
            }
        }

        // Verificar integridad de logs
        int logsManipulados = verificarIntegridadLogs();
        alertasGeneradas += logsManipulados;

        log.info("✅ Análisis automático completado: {} alertas generadas", alertasGeneradas);

        return alertasGeneradas;
    }

    // ============================================================
    // VERIFICACIÓN DE INTEGRIDAD DE LOGS
    // ============================================================
    @Override
    @Transactional
    public int verificarIntegridadLogs() {
        log.info("🔐 Verificando integridad de logs de auditoría...");

        // Obtener logs recientes con hash (últimas 24 horas)
        LocalDateTime hace24h = LocalDateTime.now().minusHours(24);
        List<AuditLog> logsRecientes = auditLogRepository.findByFechaHoraBetween(
                hace24h, LocalDateTime.now());

        int logsManipulados = 0;

        for (AuditLog auditLog : logsRecientes) {
            if (auditLog.getHashIntegridad() != null) {
                String hashCalculado = calcularHash(auditLog);

                if (!auditLog.getHashIntegridad().equals(hashCalculado)) {
                    log.warn("🚨 LOG MANIPULADO detectado: ID {}", auditLog.getId());

                    crearAlerta(
                            SecurityAlert.AlertType.TAMPERED_LOG,
                            SecurityAlert.Severity.CRITICAL,
                            auditLog.getUsuario(),
                            auditLog.getIpAddress(),
                            String.format("Detectado log manipulado (ID: %d, Acción: %s)",
                                    auditLog.getId(), auditLog.getAction()),
                            Map.of(
                                    "log_id", auditLog.getId(),
                                    "hash_almacenado", auditLog.getHashIntegridad(),
                                    "hash_calculado", hashCalculado,
                                    "accion", auditLog.getAction(),
                                    "modulo", auditLog.getModulo()
                            )
                    );

                    logsManipulados++;
                }
            }
        }

        if (logsManipulados > 0) {
            log.warn("⚠️ Se detectaron {} logs manipulados", logsManipulados);
        } else {
            log.info("✅ Integridad de logs verificada: sin manipulaciones");
        }

        return logsManipulados;
    }

    // ============================================================
    // MÉTODOS AUXILIARES
    // ============================================================

    /**
     * Crea una alerta de seguridad
     */
    private void crearAlerta(String alertType, String severity, String usuario,
                             String ipAddress, String descripcion, Map<String, Object> detalles) {
        try {
            // Evitar duplicados recientes (últimos 15 minutos)
            LocalDateTime hace15min = LocalDateTime.now().minusMinutes(15);
            long alertasRecientes = securityAlertRepository.countByAlertTypeAndUsuarioAndFechaDeteccionAfter(
                    alertType, usuario, hace15min);

            if (alertasRecientes > 0) {
                log.debug("⏭️ Alerta duplicada ignorada: {} para usuario {}", alertType, usuario);
                return;
            }

            String detallesJson = objectMapper.writeValueAsString(detalles);

            SecurityAlert alerta = SecurityAlert.builder()
                    .alertType(alertType)
                    .severity(severity)
                    .usuario(usuario)
                    .ipAddress(ipAddress)
                    .descripcion(descripcion)
                    .detalles(detallesJson)
                    .estado(SecurityAlert.Estado.NUEVA)
                    .build();

            securityAlertRepository.save(alerta);

            log.info("✅ Alerta creada: [{}] {} - {}", severity, alertType, descripcion);
        } catch (Exception e) {
            log.error("❌ Error al crear alerta: {}", e.getMessage(), e);
        }
    }

    /**
     * Calcula hash SHA-256 de un log (simplificado)
     * En producción, usar la función SQL calcular_hash_auditoria()
     */
    private String calcularHash(AuditLog auditLog) {
        try {
            String concatenated = String.join("|",
                    String.valueOf(auditLog.getId()),
                    auditLog.getUsuario() != null ? auditLog.getUsuario() : "",
                    auditLog.getAction() != null ? auditLog.getAction() : "",
                    auditLog.getModulo() != null ? auditLog.getModulo() : "",
                    auditLog.getDetalle() != null ? auditLog.getDetalle() : "",
                    auditLog.getIpAddress() != null ? auditLog.getIpAddress() : "",
                    auditLog.getFechaHora() != null ? auditLog.getFechaHora().toString() : "",
                    auditLog.getNivel() != null ? auditLog.getNivel() : "",
                    auditLog.getEstado() != null ? auditLog.getEstado() : ""
            );

            java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(concatenated.getBytes(java.nio.charset.StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            return hexString.toString();
        } catch (Exception e) {
            log.error("❌ Error al calcular hash: {}", e.getMessage());
            return "";
        }
    }
}
