package com.styp.cenate.model;

import lombok.*;
import jakarta.persistence.*;
import java.time.OffsetDateTime;

/**
 * 📝 Registro centralizado de errores de aplicación
 * Tabla: application_error_log
 * 
 * Entidad de solo inserción para auditoría de errores del sistema.
 * Registra todos los errores clasificados por categoría, con información
 * detallada de la excepción, contexto HTTP, usuario y trazabilidad.
 * 
 * Categorías soportadas:
 * - DATABASE: Errores de base de datos (FK violations, constraint violations)
 * - BUSINESS: Errores de lógica de negocio
 * - SECURITY: Errores de seguridad y autenticación
 * - VALIDATION: Errores de validación de datos
 * - EXTERNAL: Errores de servicios externos
 * - SYSTEM: Errores internos del sistema
 * 
 * @version 1.0.0
 * @since 2026-02-21
 */
@Entity
@Table(
    name = "application_error_log",
    schema = "public",
    indexes = {
        @Index(name = "idx_error_log_created", columnList = "created_at DESC"),
        @Index(name = "idx_error_log_category", columnList = "error_category"),
        @Index(name = "idx_error_log_resolved", columnList = "resolved"),
        @Index(name = "idx_error_log_user", columnList = "user_id"),
        @Index(name = "idx_error_log_endpoint", columnList = "endpoint")
    }
)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationErrorLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "created_at", nullable = false, columnDefinition = "TIMESTAMP DEFAULT CURRENT_TIMESTAMP")
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    // ============================================================================
    // 🏷️ CLASIFICACIÓN
    // ============================================================================

    @Column(name = "error_category", nullable = false, length = 50)
    private String errorCategory;

    @Column(name = "error_code", length = 100)
    private String errorCode;

    // ============================================================================
    // 💥 EXCEPCIÓN
    // ============================================================================

    @Column(name = "exception_class", length = 255)
    private String exceptionClass;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "root_cause_message", columnDefinition = "TEXT")
    private String rootCauseMessage;

    @Column(name = "stack_trace", columnDefinition = "TEXT")
    private String stackTrace;

    // ============================================================================
    // 🗄️ DATOS ESPECÍFICOS DE BASE DE DATOS
    // ============================================================================

    @Column(name = "sql_state", length = 10)
    private String sqlState;

    @Column(name = "constraint_name", length = 255)
    private String constraintName;

    @Column(name = "table_name", length = 255)
    private String tableName;

    // ============================================================================
    // 🌐 HTTP
    // ============================================================================

    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "endpoint", length = 500)
    private String endpoint;

    @Column(name = "http_status")
    private Integer httpStatus;

    // ============================================================================
    // 👤 USUARIO
    // ============================================================================

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "user_name", length = 255)
    private String userName;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    // ============================================================================
    // 🔍 TRAZABILIDAD
    // ============================================================================

    @Column(name = "request_id", length = 100)
    private String requestId;

    // ============================================================================
    // 📦 DATOS FLEXIBLES (JSON)
    // ============================================================================

    @Column(name = "additional_data", columnDefinition = "TEXT")
    private String additionalData;

    // ============================================================================
    // ✅ CONTROL DE RESOLUCIÓN
    // ============================================================================

    @Column(name = "resolved")
    @Builder.Default
    private Boolean resolved = false;

    @Column(name = "resolved_at")
    private OffsetDateTime resolvedAt;

    // ============================================================================
    // 🔧 MÉTODOS AUXILIARES
    // ============================================================================

    /**
     * Marca el error como resuelto
     */
    public void markAsResolved() {
        this.resolved = true;
        this.resolvedAt = OffsetDateTime.now();
    }

    /**
     * Verifica si el error está pendiente de resolución
     */
    public boolean isPending() {
        return !this.resolved;
    }
}
