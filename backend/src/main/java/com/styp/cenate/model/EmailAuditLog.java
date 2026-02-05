package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * 📧 Entidad de auditoría para registro de envíos de correos
 * Tabla: segu_email_audit_log
 *
 * Registra cada intento de envío de correo (exitoso o fallido)
 * para control y debugging del sistema de notificaciones.
 */
@Entity
@Table(name = "segu_email_audit_log", schema = "public",
    indexes = {
        @Index(name = "idx_email_audit_destinatario", columnList = "destinatario"),
        @Index(name = "idx_email_audit_estado", columnList = "estado"),
        @Index(name = "idx_email_audit_fecha", columnList = "fecha_envio DESC"),
        @Index(name = "idx_email_audit_tipo", columnList = "tipo_correo"),
        @Index(name = "idx_email_audit_username", columnList = "username"),
        @Index(name = "idx_email_audit_usuario", columnList = "id_usuario")
    })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Slf4j
@ToString(exclude = {"metadata"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class EmailAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "destinatario", nullable = false, length = 255)
    private String destinatario;

    @Column(name = "id_usuario")
    private Long idUsuario;

    @Column(name = "username", length = 100)
    private String username;

    @Column(name = "tipo_correo", nullable = false, length = 50)
    private String tipoCorreo; // BIENVENIDO, RECUPERACION, RESET, APROBACION, RECHAZO, PRUEBA, GENERAL

    @Column(name = "asunto", length = 500)
    private String asunto;

    @Column(name = "estado", nullable = false, length = 30)
    @Builder.Default
    private String estado = "PENDIENTE"; // PENDIENTE, ENVIADO, FALLIDO, EN_COLA

    @CreationTimestamp
    @Column(name = "fecha_envio", nullable = false, updatable = false)
    private LocalDateTime fechaEnvio;

    @Column(name = "fecha_confirmacion")
    private LocalDateTime fechaConfirmacion;

    @Column(name = "tiempo_respuesta_ms")
    private Long tiempoRespuestaMs;

    @Column(name = "servidor_smtp", length = 100)
    private String servidorSmtp;

    @Column(name = "puerto_smtp")
    private Integer puertoSmtp;

    @Column(name = "error_mensaje", columnDefinition = "TEXT")
    private String errorMensaje;

    @Column(name = "error_codigo", length = 50)
    private String errorCodigo;

    @Column(name = "reintentos")
    @Builder.Default
    private Integer reintentos = 0;

    @Column(name = "token_asociado", length = 100)
    private String tokenAsociado;

    @Column(name = "ip_servidor", length = 50)
    private String ipServidor;

    @Column(name = "metadata", columnDefinition = "JSONB")
    private String metadata;

    @Column(name = "tamano_bytes")
    private Long tamanioBytes;

    // ==========================================================
    // 🧩 Métodos utilitarios
    // ==========================================================

    /**
     * Marcar como enviado exitosamente
     */
    public void marcarEnviado(long tiempoMs) {
        this.estado = "ENVIADO";
        this.fechaConfirmacion = LocalDateTime.now();
        this.tiempoRespuestaMs = tiempoMs;
        log.info("✅ Correo marcado como enviado a {}: {} ms", this.destinatario, tiempoMs);
    }

    /**
     * Marcar como fallido
     */
    public void marcarFallido(String mensajeError, String codigoError) {
        this.estado = "FALLIDO";
        this.errorMensaje = mensajeError;
        this.errorCodigo = codigoError;
        this.reintentos = (this.reintentos != null ? this.reintentos : 0) + 1;
        log.warn("❌ Correo a {} marcado como fallido. Error: {} ({})",
            this.destinatario, mensajeError, codigoError);
    }

    /**
     * Obtener resumen para logs
     */
    public String getResumen() {
        return String.format("[%s] %s -> %s (%s)",
            this.tipoCorreo, this.destinatario, this.estado, this.asunto);
    }

    public boolean esExitoso() {
        return "ENVIADO".equalsIgnoreCase(this.estado);
    }

    public boolean esFallido() {
        return "FALLIDO".equalsIgnoreCase(this.estado);
    }

    public boolean estaPendiente() {
        return "PENDIENTE".equalsIgnoreCase(this.estado);
    }
}
