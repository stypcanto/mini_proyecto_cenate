package com.styp.cenate.service.email;

import com.styp.cenate.model.EmailAuditLog;
import com.styp.cenate.repository.EmailAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * 📧 Servicio de auditoría para registro de correos
 *
 * Gestiona el registro de todos los intentos de envío de correos
 * en la tabla segu_email_audit_log
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailAuditLogService {

    private final EmailAuditLogRepository emailAuditLogRepository;

    /**
     * Registrar un intento de envío de correo (síncrono para garantizar persistencia)
     */
    @Transactional
    public void registrarIntento(String destinatario, String tipoCorreo, String asunto,
                                 String username, Long idUsuario, String servidorSmtp,
                                 Integer puertoSmtp, String tokenAsociado) {
        try {
            EmailAuditLog auditLog = EmailAuditLog.builder()
                .destinatario(destinatario)
                .tipoCorreo(tipoCorreo)
                .asunto(asunto)
                .username(username)
                .idUsuario(idUsuario)
                .servidorSmtp(servidorSmtp)
                .puertoSmtp(puertoSmtp)
                .tokenAsociado(tokenAsociado)
                .estado("EN_COLA")
                .build();

            emailAuditLogRepository.save(auditLog);
            log.info("📋 Registro de auditoría creado para: {} [TIPO: {}]", destinatario, tipoCorreo);
        } catch (Exception e) {
            log.error("❌ Error registrando intento de correo: {}", e.getMessage(), e);
        }
    }

    /**
     * Marcar un correo como enviado exitosamente (síncrono)
     */
    @Transactional
    public void marcarEnviado(String destinatario, long tiempoMs) {
        try {
            List<EmailAuditLog> registros = emailAuditLogRepository
                .findByDestinatario(destinatario);

            if (!registros.isEmpty()) {
                // Marcar el más reciente como enviado
                EmailAuditLog ultimoRegistro = registros.get(0);
                if (!ultimoRegistro.esExitoso()) {
                    ultimoRegistro.marcarEnviado(tiempoMs);
                    emailAuditLogRepository.save(ultimoRegistro);
                    log.info("✅ Auditoría actualizada: {} marcado como ENVIADO", destinatario);
                }
            } else {
                log.warn("⚠️ No se encontró registro de auditoría para actualizar: {}", destinatario);
            }
        } catch (Exception e) {
            log.error("❌ Error marcando correo como enviado: {}", e.getMessage(), e);
        }
    }

    /**
     * Marcar un correo como fallido (síncrono)
     */
    @Transactional
    public void marcarFallido(String destinatario, String mensajeError, String codigoError) {
        try {
            List<EmailAuditLog> registros = emailAuditLogRepository
                .findByDestinatario(destinatario);

            if (!registros.isEmpty()) {
                // Marcar el más reciente como fallido
                EmailAuditLog ultimoRegistro = registros.get(0);
                if (!"ENVIADO".equalsIgnoreCase(ultimoRegistro.getEstado())) {
                    ultimoRegistro.marcarFallido(mensajeError, codigoError);
                    emailAuditLogRepository.save(ultimoRegistro);
                    log.warn("❌ Auditoría actualizada: {} marcado como FALLIDO", destinatario);
                }
            } else {
                log.warn("⚠️ No se encontró registro de auditoría para actualizar: {}", destinatario);
            }
        } catch (Exception e) {
            log.error("❌ Error marcando correo como fallido: {}", e.getMessage(), e);
        }
    }

    /**
     * Obtener correos por destinatario
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerCorreosPorDestinatario(String destinatario) {
        return emailAuditLogRepository.findByDestinatario(destinatario);
    }

    /**
     * Obtener histórico de correos de un usuario
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerHistoricoUsuario(Long idUsuario, int pagina, int tamanio) {
        Pageable pageable = PageRequest.of(pagina, tamanio);
        return emailAuditLogRepository
            .findByIdUsuario(idUsuario, pageable)
            .getContent();
    }

    /**
     * Obtener correos fallidos
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerCorreosFallidos(int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return emailAuditLogRepository.findFallidos(pageable);
    }

    /**
     * Obtener todos los correos (ordenados por fecha descendente)
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerTodos(int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return emailAuditLogRepository.findAllByOrderByFechaEnvioDesc(pageable);
    }

    /**
     * Obtener correos enviados exitosamente
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerEnviados(int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return emailAuditLogRepository.findEnviados(pageable);
    }

    /**
     * Obtener estadísticas de correos en un período
     */
    @Transactional(readOnly = true)
    public EmailAuditStats obtenerEstadisticas(LocalDateTime inicio, LocalDateTime fin) {
        long enviados = emailAuditLogRepository
            .countEnviadosEnPeriodo(inicio, fin);

        List<EmailAuditLog> noEntregados = emailAuditLogRepository
            .findNoEntregados(inicio, fin);

        long totalNoEntregados = noEntregados.size();
        long total = enviados + totalNoEntregados;
        return EmailAuditStats.builder()
            .enviados(enviados)
            .noEntregados(totalNoEntregados)
            .totalIntentosCorreo(total)
            .porcentajeExito(
                total > 0
                    ? (enviados * 100.0) / total
                    : 0.0
            )
            .build();
    }

    /**
     * Buscar correo por token
     */
    @Transactional(readOnly = true)
    public Optional<EmailAuditLog> obtenerPorToken(String token) {
        return emailAuditLogRepository.findByTokenAsociado(token);
    }

    /**
     * Obtener correos con errores de conexión
     */
    @Transactional(readOnly = true)
    public List<EmailAuditLog> obtenerErroresConexion(int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return emailAuditLogRepository.findConErroresConexion(pageable);
    }

    /**
     * Limpiar registros antiguos (mayores a N días)
     */
    @Async
    public void limpiarRegistrosAntiguos(int diasAtras) {
        try {
            LocalDateTime fechaLimite = LocalDateTime.now().minusDays(diasAtras);
            // Implementar si se necesita borrado automático de registros antiguos
            log.info("🧹 Limpieza de registros de correo anteriores a: {}", fechaLimite);
        } catch (Exception e) {
            log.error("❌ Error limpiando registros antiguos: {}", e.getMessage());
        }
    }

    /**
     * DTO para estadísticas de correos
     */
    @lombok.Data
    @lombok.Builder
    public static class EmailAuditStats {
        private long enviados;
        private long noEntregados;
        private long totalIntentosCorreo;
        private double porcentajeExito;
    }
}
