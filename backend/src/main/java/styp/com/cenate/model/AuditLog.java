package styp.com.cenate.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_audit_usuario", columnList = "usuario"),
    @Index(name = "idx_audit_action", columnList = "action"),
    @Index(name = "idx_audit_fecha", columnList = "fecha_hora")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "usuario", nullable = false, length = 100)
    private String usuario;

    @Column(name = "action", nullable = false, length = 100)
    private String action; // LOGIN, LOGOUT, CREATE_USER, UPDATE_USER, DELETE, etc.

    @Column(name = "modulo", length = 50)
    private String modulo; // USUARIOS, ROLES, PACIENTES, EXAMENES, etc.

    @Column(name = "detalle", columnDefinition = "TEXT")
    private String detalle;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "nivel", length = 20)
    private String nivel; // INFO, WARNING, ERROR, CRITICAL

    @Column(name = "estado", length = 20)
    private String estado; // SUCCESS, FAILURE

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora;

    @Column(name = "duracion_ms")
    private Long duracionMs; // duración de la operación en milisegundos

    @PrePersist
    protected void onCreate() {
        if (fechaHora == null) {
            fechaHora = LocalDateTime.now();
        }
        if (nivel == null) {
            nivel = "INFO";
        }
        if (estado == null) {
            estado = "SUCCESS";
        }
    }
}
