package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 🚨 Entidad que registra alertas de seguridad automatizadas
 * Utilizada para tracking de anomalías, intentos de intrusión y actividad sospechosa
 *
 * @author Ing. Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Entity
@Table(name = "security_alerts", indexes = {
        @Index(name = "idx_security_alerts_type", columnList = "alert_type"),
        @Index(name = "idx_security_alerts_severity", columnList = "severity"),
        @Index(name = "idx_security_alerts_usuario", columnList = "usuario"),
        @Index(name = "idx_security_alerts_fecha", columnList = "fecha_deteccion"),
        @Index(name = "idx_security_alerts_estado", columnList = "estado")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecurityAlert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 🔍 Tipo de alerta
     * BRUTE_FORCE: Intentos de fuerza bruta (múltiples logins fallidos)
     * CONCURRENT_SESSION: Sesiones concurrentes desde diferentes IPs
     * UNUSUAL_LOCATION: Acceso desde ubicación inusual
     * OFF_HOURS_ACCESS: Acceso fuera de horario laboral
     * MASS_EXPORT: Exportación masiva de datos
     * PERMISSION_CHANGE: Cambios sospechosos de permisos
     * TAMPERED_LOG: Logs manipulados (hash no coincide)
     * UNUSUAL_ACTIVITY: Actividad inusual detectada
     */
    @Column(name = "alert_type", nullable = false, length = 50)
    private String alertType;

    /**
     * ⚠️ Severidad de la alerta
     * CRITICAL: Requiere acción inmediata
     * HIGH: Alta prioridad
     * MEDIUM: Prioridad media
     * LOW: Baja prioridad (informativa)
     */
    @Column(name = "severity", nullable = false, length = 20)
    private String severity;

    /** 👤 Usuario afectado por la alerta */
    @Column(name = "usuario", length = 100)
    private String usuario;

    /** 🌐 Dirección IP origen */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /** 📝 Descripción de la alerta */
    @Column(name = "descripcion", nullable = false, columnDefinition = "TEXT")
    private String descripcion;

    /** 📦 Detalles adicionales en formato JSON */
    @Column(name = "detalles", columnDefinition = "jsonb")
    private String detalles;

    /** 🕐 Fecha y hora de detección */
    @Column(name = "fecha_deteccion", nullable = false)
    @Builder.Default
    private LocalDateTime fechaDeteccion = LocalDateTime.now();

    /**
     * 📊 Estado de la alerta
     * NUEVA: Recién detectada, sin revisar
     * EN_REVISION: Bajo análisis
     * RESUELTA: Mitigada y cerrada
     * FALSO_POSITIVO: Descartada como falsa alarma
     */
    @Column(name = "estado", length = 20)
    @Builder.Default
    private String estado = "NUEVA";

    /** 👤 Usuario que resolvió la alerta */
    @Column(name = "resuelto_por", length = 100)
    private String resueltoPor;

    /** 🕐 Fecha de resolución */
    @Column(name = "fecha_resolucion")
    private LocalDateTime fechaResolucion;

    /** 📝 Notas al resolver */
    @Column(name = "notas_resolucion", columnDefinition = "TEXT")
    private String notasResolucion;

    /** ✅ Acción correctiva tomada */
    @Column(name = "accion_tomada", columnDefinition = "TEXT")
    private String accionTomada;

    /**
     * Inicializa valores por defecto
     */
    @PrePersist
    protected void onCreate() {
        if (fechaDeteccion == null) {
            fechaDeteccion = LocalDateTime.now();
        }
        if (estado == null) {
            estado = "NUEVA";
        }
    }

    // ============================================================
    // MÉTODOS DE UTILIDAD
    // ============================================================

    /**
     * Verifica si la alerta es crítica
     */
    public boolean esCritica() {
        return "CRITICAL".equalsIgnoreCase(severity);
    }

    /**
     * Verifica si la alerta está activa (no resuelta)
     */
    public boolean estaActiva() {
        return "NUEVA".equals(estado) || "EN_REVISION".equals(estado);
    }

    /**
     * Marca la alerta como resuelta
     */
    public void marcarResuelta(String resueltoPor, String notas, String accion) {
        this.estado = "RESUELTA";
        this.resueltoPor = resueltoPor;
        this.fechaResolucion = LocalDateTime.now();
        this.notasResolucion = notas;
        this.accionTomada = accion;
    }

    /**
     * Marca la alerta como falso positivo
     */
    public void marcarFalsoPositivo(String resueltoPor, String notas) {
        this.estado = "FALSO_POSITIVO";
        this.resueltoPor = resueltoPor;
        this.fechaResolucion = LocalDateTime.now();
        this.notasResolucion = notas;
    }

    /**
     * Obtiene minutos desde la detección
     */
    public long getMinutosDesdeDeteccion() {
        return java.time.Duration.between(fechaDeteccion, LocalDateTime.now()).toMinutes();
    }

    // ============================================================
    // CONSTANTES DE TIPOS DE ALERTA
    // ============================================================
    public static class AlertType {
        public static final String BRUTE_FORCE = "BRUTE_FORCE";
        public static final String CONCURRENT_SESSION = "CONCURRENT_SESSION";
        public static final String UNUSUAL_LOCATION = "UNUSUAL_LOCATION";
        public static final String OFF_HOURS_ACCESS = "OFF_HOURS_ACCESS";
        public static final String MASS_EXPORT = "MASS_EXPORT";
        public static final String PERMISSION_CHANGE = "PERMISSION_CHANGE";
        public static final String TAMPERED_LOG = "TAMPERED_LOG";
        public static final String UNUSUAL_ACTIVITY = "UNUSUAL_ACTIVITY";
    }

    // ============================================================
    // CONSTANTES DE SEVERIDAD
    // ============================================================
    public static class Severity {
        public static final String CRITICAL = "CRITICAL";
        public static final String HIGH = "HIGH";
        public static final String MEDIUM = "MEDIUM";
        public static final String LOW = "LOW";
    }

    // ============================================================
    // CONSTANTES DE ESTADO
    // ============================================================
    public static class Estado {
        public static final String NUEVA = "NUEVA";
        public static final String EN_REVISION = "EN_REVISION";
        public static final String RESUELTA = "RESUELTA";
        public static final String FALSO_POSITIVO = "FALSO_POSITIVO";
    }
}
