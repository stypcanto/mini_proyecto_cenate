package styp.com.cenate.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

/**
 * 🎯 DTO que representa la respuesta completa de un usuario del sistema CENATE.
 * Incluye datos personales, profesionales, auditoría, roles y permisos.
 */
@Data
@Builder
public class UsuarioResponse {

    // ============================================================
    // 🧩 Datos de la cuenta (dim_usuarios)
    // ============================================================
    private Long idUser;
    private String username;
    private String estado;
    private boolean activo;
    private boolean locked;

    private Integer failedAttempts;
    private LocalDateTime lockedUntil;

    private LocalDateTime lastLoginAt;
    private LocalDateTime createAt;
    private LocalDateTime updateAt;

    private Set<String> roles;
    private Set<String> permisos;

    // ============================================================
    // 👤 Datos personales (dim_personal_cnt)
    // ============================================================
    private Long idPersonal;
    private String nombreCompleto;
    private String nombres;
    private String apellidoPaterno;
    private String apellidoMaterno;
    private String numeroDocumento;
    private String tipoDocumento;
    private LocalDate fechaNacimiento;
    private String genero;
    private String correoPersonal;
    private String correoCorporativo;
    private String telefono;
    private String direccion;
    private String fotoUrl; // 📸 URL o base64 de la foto

    // ============================================================
    // 🧑‍⚕️ Datos profesionales
    // ============================================================
    private String profesionPrincipal;
    private List<String> profesiones; // Varias profesiones (si existen)
    private String colegiatura;
    private String regimenLaboral;
    private String areaTrabajo;
    private List<String> ordenesCompra; // OC vinculadas al personal
    private List<String> firmasDigitales; // Firmas registradas (ej. jpg o PDF)

    // ============================================================
    // 💬 Campo informativo opcional
    // ============================================================
    private String message;
}