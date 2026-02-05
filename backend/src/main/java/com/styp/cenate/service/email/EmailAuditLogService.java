package com.styp.cenate.service.email;

import com.styp.cenate.model.EmailAuditLog;
import com.styp.cenate.repository.EmailAuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

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
     * Registrar un intento de envío de correo (asíncrono)
     */
    @Async
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
            log.info("📋 Registro de auditoría creado para: {}", destinatario);
        } catch (Exception e) {
            log.error("❌ Error registrando intento de correo: {}", e.getMessage());
        }
    }

    /**
     * Marcar un correo como enviado exitosamente
     */
    @Async
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
                }
            }
        } catch (Exception e) {
            log.error("❌ Error marcando correo como enviado: {}", e.getMessage());
        }
    }

    /**
     * Marcar un correo como fallido
     */
    @Async
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
                }
            }
        } catch (Exception e) {
            log.error("❌ Error marcando correo como fallido: {}", e.getMessage());
        }
    }

    /**
     * Obtener histórico de correos de un usuario
     */
    public List<EmailAuditLog> obtenerHistoricoUsuario(Long idUsuario, int pagina, int tamanio) {
        Pageable pageable = PageRequest.of(pagina, tamanio);
        return emailAuditLogRepository
            .findByIdUsuario(idUsuario, pageable)
            .getContent();
    }

    /**
     * Obtener correos fallidos
     */
    public List<EmailAuditLog> obtenerCorreosFallidos(int limite) {
        Pageable pageable = PageRequest.of(0, limite);
        return emailAuditLogRepository.findFallidos(pageable);
    }

    /**
     * Obtener estadísticas de correos en un período
     */
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
    public Optional<EmailAuditLog> obtenerPorToken(String token) {
        return emailAuditLogRepository.findByTokenAsociado(token);
    }

    /**
     * Obtener correos con errores de conexión
     */
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
