package com.styp.cenate.model;
import lombok.Data;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * 📜 Entidad que registra acciones, errores y eventos relevantes del sistema.
 * Se usa para auditoría de operaciones (login, logout, cambios, errores, etc.)
 */
@Entity
@Table(name = "audit_logs", indexes = {
        @Index(name = "idx_audit_usuario", columnList = "usuario"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_fecha", columnList = "fecha_hora")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Data
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 👤 Usuario que ejecutó la acción */
    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario;

    /** ⚙️ Tipo de acción realizada (LOGIN, LOGOUT, CREATE_USER, etc.) */
    @Column(name = "action", nullable = false, length = 100)
    private String action;

    /** 🧩 Módulo o componente donde se ejecutó la acción */
    @Column(name = "modulo", length = 50)
    private String modulo;

    /** 📝 Descripción detallada de la acción o error */
    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    /** 🌐 Dirección IP desde la que se ejecutó la acción */
    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    /** 💻 Agente de usuario (navegador o aplicación cliente) */
    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    /** 🚨 Nivel de severidad del evento (INFO, WARNING, ERROR, CRITICAL) */
    @Column(name = "nivel", length = 20)
    @Builder.Default
    private String nivel = "INFO";

    /** ✅ Estado de ejecución (SUCCESS, FAILURE, etc.) */
    @Column(name = "estado", length = 20)
    @Builder.Default
    private String estado = "SUCCESS";

    /** 🕓 Fecha y hora del evento */
    @Column(name = "fecha_hora", nullable = false)
    @Builder.Default
    private LocalDateTime fechaHora = LocalDateTime.now();

    /** ⏱ Duración estimada de la acción (en milisegundos) */
    @Column(name = "duracion_ms")
    private Long duracionMs;

    /**
     * Inicializa valores por defecto antes de persistir
     */
    @PrePersist
    protected void onCreate() {
        if (fechaHora == null) fechaHora = LocalDateTime.now();
        if (nivel == null) nivel = "INFO";
        if (estado == null) estado = "SUCCESS";
    }
}
