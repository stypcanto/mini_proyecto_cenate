package com.styp.cenate.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidad para tracking de sesiones activas del sistema
 *
 * Registra información detallada de cada sesión de usuario para:
 * - Auditoría de accesos
 * - Detección de sesiones concurrentes
 * - Análisis de patrones de uso
 * - Detección de anomalías de seguridad
 *
 * @author Styp Canto Rondón
 * @version 1.0.0
 * @since 2025-12-29
 */
@Entity
@Table(name = "active_sessions", indexes = {
    @Index(name = "idx_active_sessions_username", columnList = "username"),
    @Index(name = "idx_active_sessions_user_id", columnList = "user_id"),
    @Index(name = "idx_active_sessions_session_id", columnList = "session_id"),
    @Index(name = "idx_active_sessions_login_time", columnList = "login_time"),
    @Index(name = "idx_active_sessions_last_activity", columnList = "last_activity")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ActiveSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID único de la sesión (UUID)
     */
    @Column(name = "session_id", nullable = false, unique = true, length = 255)
    private String sessionId;

    /**
     * ID del usuario en dim_usuarios
     */
    @Column(name = "user_id", nullable = false)
    private Long userId;

    /**
     * Username del usuario (para queries rápidas sin JOIN)
     */
    @Column(name = "username", nullable = false, length = 100)
    private String username;

    /**
     * Dirección IP desde donde se conectó
     */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /**
     * User-Agent completo del navegador/dispositivo
     */
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    /**
     * Timestamp de inicio de sesión
     */
    @Column(name = "login_time", nullable = false)
    private LocalDateTime loginTime;

    /**
     * Timestamp de última actividad (se actualiza periódicamente)
     */
    @Column(name = "last_activity", nullable = false)
    private LocalDateTime lastActivity;

    /**
     * Timestamp de cierre de sesión (NULL si aún está activa)
     */
    @Column(name = "logout_time")
    private LocalDateTime logoutTime;

    /**
     * Indica si la sesión está activa (TRUE) o cerrada (FALSE)
     */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /**
     * Tipo de dispositivo: DESKTOP, MOBILE, TABLET
     */
    @Column(name = "device_type", length = 50)
    private String deviceType;

    /**
     * Navegador: CHROME, FIREFOX, SAFARI, EDGE, etc.
     */
    @Column(name = "browser", length = 50)
    private String browser;

    /**
     * Sistema operativo: WINDOWS, LINUX, MACOS, ANDROID, IOS, etc.
     */
    @Column(name = "os", length = 50)
    private String os;

    /**
     * Calcula la duración de la sesión en minutos
     */
    @Transient
    public Long getDuracionMinutos() {
        LocalDateTime fin = logoutTime != null ? logoutTime : LocalDateTime.now();
        return java.time.Duration.between(loginTime, fin).toMinutes();
    }

    /**
     * Calcula los minutos de inactividad
     */
    @Transient
    public Long getMinutosInactividad() {
        return java.time.Duration.between(lastActivity, LocalDateTime.now()).toMinutes();
    }

    /**
     * Determina si la sesión está inactiva (>30 minutos sin actividad)
     */
    @Transient
    public Boolean isInactiva() {
        return isActive && getMinutosInactividad() > 30;
    }

    /**
     * Constructor para nueva sesión
     */
    public ActiveSession(String sessionId, Long userId, String username, String ipAddress, String userAgent) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.loginTime = LocalDateTime.now();
        this.lastActivity = LocalDateTime.now();
        this.isActive = true;
    }

    /**
     * Actualiza el timestamp de última actividad
     */
    public void actualizarActividad() {
        this.lastActivity = LocalDateTime.now();
    }

    /**
     * Cierra la sesión
     */
    public void cerrarSesion() {
        this.logoutTime = LocalDateTime.now();
        this.isActive = false;
    }
}
